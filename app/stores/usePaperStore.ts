"use client";

/**
 * usePaperStore — multi-paper navigation inside a single Surah page.
 *
 * ONE persistent scene. Paper switches never remount the canvas tree — only
 * the content buffers (RenderTextures keyed by storyRevision) rebuild in
 * place, so the WebGL state (camera, lights, meshes, compiled shaders) is
 * never torn down.
 *
 * The switch has exactly two visible phases, gated on TRUTH:
 *
 *   "loading"   — starts the INSTANT the content swap happens (seed +
 *                 storyRevision bump), so the new paper's RenderTexture
 *                 begins compiling/settling off-screen right away. On
 *                 screen, a FROZEN sheet (an independent GPU-texture copy of
 *                 the outgoing page, in its exact former position and fold
 *                 pose) sits completely still — no motion of any kind. This
 *                 is intentional: loading and animating never run at the
 *                 same time, so neither ever steals frame budget from the
 *                 other and the animation itself is never janky. The ONLY
 *                 feedback during this wait is a loading cursor.
 *   "animating" — fires the instant the new paper's true "settled" signal
 *                 arrives (the same settle pipeline the very first page
 *                 load uses). From here the ENTIRE choreography plays once,
 *                 uninterrupted, with nothing left to wait for: the frozen
 *                 sheet unfolds (if it had folds), hands off invisibly to a
 *                 curl sheet that curls + slides fully out, while the real
 *                 paper (already fully settled) glides in from the opposite
 *                 side, synchronized with the curl so the crossing reads as
 *                 one continuous motion. Once both finish, the switch ends.
 *
 * A capture failure (outgoing paper never settled) skips the sheet meshes
 * entirely but reuses the exact same phase machine — the real content still
 * parks off-screen and glides in once ready.
 */

import { create } from "zustand";
import { getSurahPaperCount, loadSurahPaper } from "../data/surahDatabase";
import { getLenisInstance } from "../_components/dom/LenisProvider";
import { useCameraViewStore } from "./useCameraViewStore";
import { useCameraStore } from "./useCameraStore";
import { useElevatedStore } from "./useElevatedStore";
import { seedStoresForPaper } from "./storySeeder";
import {
  requestPaperTransitionCapture,
  type PaperTransitionCapture,
} from "../_components/canvas/3d-scene/paperSnapshot";

/** If any phase hangs (e.g. WebGL context loss), force the switch to finish. */
const SWITCH_FAILSAFE_MS = 20000;
/** Fold rotations below this are considered "already flat" → no unfold step. */
const FLAT_ANGLE_EPSILON = 0.06;

/**
 * Surahs with this many papers or fewer keep the plain curl/slide exit and
 * glide enter. Everything past it gets the enhanced switch: the book-flip
 * exit (PaperTransitionMesh's FlipSheet) and the falling-paper enter. Lives here — not
 * in a component module — because component modules need it and already import this
 * store (defining it in either one would create an import cycle).
 */
export const BURN_EFFECT_MIN_PAPER_COUNT = 2;

export type PaperTransitionPhase = "idle" | "loading" | "animating";
/** Which sheet mesh is currently standing in for the outgoing page. */
export type SheetStage = "flatten" | "curl";

interface PaperState {
  /** Canonical Surah id of the currently mounted page (null before init). */
  surahId: string | null;
  /** Total papers available on this page. */
  paperCount: number;
  /** Index of the live paper. */
  activePaperIndex: number;
  /** True from switch request until the switch fully lands. */
  isSwitching: boolean;
  /** Current phase of the animated switch choreography. */
  transitionPhase: PaperTransitionPhase;
  /** +1 → next (exit left, enter from right); -1 → previous (mirrored). */
  transitionDirection: 1 | -1;
  /** True while "loading"/"animating" should render a flatten/curl sheet. */
  hasTransitionSheet: boolean;
  /** Which sheet mesh is mounted right now. */
  sheetStage: SheetStage;

  /** Called once per route by StoreInitializer after the first paper is seeded. */
  initForSurah: (surahId: string) => void;
  goToPaper: (index: number) => void;
  goToNextPaper: () => void;
  goToPreviousPaper: () => void;
  /** Called by the flatten sheet once its own unfold timeline completes. */
  markFlattenVisualDone: () => void;
  /** Called when the freshly swapped paper's texture fully settles. */
  completeSwitch: () => void;
  /** Called by the curl sheet once its exit timeline completes. */
  curlSheetFinished: () => void;
  /** Called by the slide group once the enter glide lands. */
  enterFinished: () => void;
}

// Module-level guards (not reactive state) ---------------------------------

/** Invalidates in-flight switches when a newer switch/route init happens. */
let switchToken = 0;
let failsafeTimeoutId: number | null = null;

/** GPU copies of the outgoing page for the flatten/curl sheets (nullable). */
let activeCapture: PaperTransitionCapture | null = null;

/** Dual-condition gate for leaving "animating". */
let curlDone = false;
let enterDone = false;

export function getActiveTransitionCapture(): PaperTransitionCapture | null {
  return activeCapture;
}

function disposeActiveCapture(): void {
  activeCapture?.dispose();
  activeCapture = null;
}

function clearFailsafe(): void {
  if (failsafeTimeoutId !== null) {
    window.clearTimeout(failsafeTimeoutId);
    failsafeTimeoutId = null;
  }
}

const delay = (ms: number) =>
  new Promise<void>((r) => window.setTimeout(r, ms));

/**
 * Resolves after the browser has painted the current commit — lets the
 * arrows' disabled state paint before the choreography starts.
 */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Force scroll back to the very start of the fold story, ahead of the React
 * commit that swaps the content. `force: true` bypasses a stopped/locked
 * Lenis (scroll IS locked during the whole switch).
 */
function resetScrollToStoryStart(): void {
  const lenis = getLenisInstance();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

/**
 * Re-aim the camera at the persisted view preset after a switch. The camera
 * lives outside the swapped content so this is a safety net, not a visible
 * correction; a continuous offset is re-applied every frame anyway.
 */
function reapplyCameraViewAfterSwitch(): void {
  const { selectedView, continuousOffset } = useCameraViewStore.getState();
  if (continuousOffset !== null || selectedView === "default") return;
  useCameraViewStore.setState({ requestedView: selectedView });
}

/** Ends the switch the instant BOTH the sheet and the glide have landed. */
function tryFinishSwitch(): void {
  if (!curlDone || !enterDone) return;
  clearFailsafe();
  disposeActiveCapture();
  usePaperStore.setState({
    transitionPhase: "idle",
    isSwitching: false,
    hasTransitionSheet: false,
  });
}

/**
 * Warm the config cache for the papers next to `index` during idle time.
 * Only JS chunks are fetched — no textures, no GPU work — so this is safe
 * even on low-memory devices.
 */
function prefetchNeighborPapers(surahId: string, index: number): void {
  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? window.requestIdleCallback.bind(window)
      : (cb: () => void) => window.setTimeout(cb, 300);

  schedule(() => {
    void loadSurahPaper(surahId, index + 1);
    if (index > 0) void loadSurahPaper(surahId, index - 1);
  });
}

export const usePaperStore = create<PaperState>((set, get) => ({
  surahId: null,
  paperCount: 1,
  activePaperIndex: 0,
  isSwitching: false,
  transitionPhase: "idle",
  transitionDirection: 1,
  hasTransitionSheet: false,
  sheetStage: "curl",

  initForSurah: (surahId) => {
    // Invalidate any in-flight switch from a previous route.
    switchToken += 1;
    clearFailsafe();
    disposeActiveCapture();
    set({
      surahId,
      paperCount: Math.max(getSurahPaperCount(surahId), 1),
      activePaperIndex: 0,
      isSwitching: false,
      transitionPhase: "idle",
      hasTransitionSheet: false,
      sheetStage: "curl",
    });
    prefetchNeighborPapers(surahId, 0);
  },

  goToPaper: (index) => {
    const { surahId, paperCount, activePaperIndex, isSwitching } = get();
    if (!surahId || isSwitching) return;
    if (index === activePaperIndex || index < 0 || index >= paperCount) return;

    const token = ++switchToken;
    clearFailsafe();
    const direction: 1 | -1 = index > activePaperIndex ? 1 : -1;
    // Locks scroll (ScrollManager) and shows the loading cursor immediately.
    set({ isSwitching: true, transitionDirection: direction });

    // Whole-switch failsafe: whatever gate never opens, land on the new
    // paper so the UI can never get permanently stuck.
    failsafeTimeoutId = window.setTimeout(() => {
      failsafeTimeoutId = null;
      if (token !== switchToken) return;
      disposeActiveCapture();
      set({
        isSwitching: false,
        transitionPhase: "idle",
        hasTransitionSheet: false,
      });
    }, SWITCH_FAILSAFE_MS);

    void (async () => {
      try {
        // If the user is zoomed into a section, dismiss first and give the
        // camera time to glide back — the choreography assumes the default
        // reading viewpoint.
        if (
          useCameraStore.getState().phase !== "idle" ||
          useElevatedStore.getState().phase === "elevated"
        ) {
          useElevatedStore.getState().dismiss();
          await delay(700);
        }

        // Config chunk is usually idle-prefetched already → resolves
        // instantly. waitForPaint lets the arrows' disabled state paint.
        const [paper] = await Promise.all([
          loadSurahPaper(surahId, index),
          waitForPaint(),
        ]);

        // A newer switch or a route change won this race — do nothing.
        if (token !== switchToken || get().surahId !== surahId) return;
        if (!paper) {
          clearFailsafe();
          set({ isSwitching: false });
          return;
        }

        // GPU-copy the outgoing page (map + normal, two blits) so a flatten/
        // curl sheet can stand in for it independently of the live material,
        // which is about to rebuild with the NEW paper's content. Awaiting
        // this request means the actual GPU blit runs inside SinglePaper's
        // own useFrame on the next frame — never on this click handler's own
        // stack — so it can never race or interleave with R3F's own render.
        disposeActiveCapture();
        activeCapture = await requestPaperTransitionCapture();

        // A newer switch or a route change won the race while we waited for
        // that frame — abandon this one; the newer switch owns the capture.
        if (token !== switchToken || get().surahId !== surahId) {
          disposeActiveCapture();
          return;
        }

        const needsFlatten = activeCapture
          ? activeCapture.maxFoldAngle > FLAT_ANGLE_EPSILON
          : false;

        // Reset the exit-side dual gate for this switch.
        curlDone = !activeCapture; // no sheet → nothing to wait for on exit
        enterDone = false;

        // THE SWAP — happens NOW, immediately, so the new paper's
        // RenderTexture starts compiling/settling off-screen at once, using
        // every millisecond of the (frozen, motionless) wait productively.
        seedStoresForPaper(paper, { preserveCameraView: true });
        resetScrollToStoryStart();

        set({
          activePaperIndex: index,
          transitionPhase: "loading",
          hasTransitionSheet: activeCapture !== null,
          sheetStage: needsFlatten ? "flatten" : "curl",
        });

        prefetchNeighborPapers(surahId, index);
      } catch {
        if (token === switchToken) {
          clearFailsafe();
          disposeActiveCapture();
          set({
            isSwitching: false,
            transitionPhase: "idle",
            hasTransitionSheet: false,
          });
        }
      }
    })();
  },

  goToNextPaper: () => {
    const { activePaperIndex } = get();
    get().goToPaper(activePaperIndex + 1);
  },

  goToPreviousPaper: () => {
    const { activePaperIndex } = get();
    get().goToPaper(activePaperIndex - 1);
  },

  markFlattenVisualDone: () => {
    if (get().transitionPhase !== "animating") return;
    set({ sheetStage: "curl" });
  },

  completeSwitch: () => {
    reapplyCameraViewAfterSwitch();
    if (!get().isSwitching || get().transitionPhase !== "loading") return;

    if (!get().hasTransitionSheet) {
      // Fallback path: no sheet ever stood in for the outgoing page, so the
      // real content stayed visible in place the whole time (PaperSlideGroup
      // never parks it off-screen when hasTransitionSheet is false). There is
      // no curl and no glide to wait for — the switch is simply done now.
      clearFailsafe();
      set({ transitionPhase: "idle", isSwitching: false });
      return;
    }

    // "loading" → "animating": the ENTIRE choreography (unfold → curl-exit →
    // enter-glide) now plays once, back to back, with nothing left to wait
    // for — this is the only place that transition fires from.
    set({ transitionPhase: "animating" });
  },

  curlSheetFinished: () => {
    curlDone = true;
    tryFinishSwitch();
  },

  enterFinished: () => {
    enterDone = true;
    tryFinishSwitch();
  },
}));
