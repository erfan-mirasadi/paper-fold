"use client";

/**
 * usePaperStore — multi-paper navigation inside a single Surah page.
 *
 * ONE persistent scene. Paper switches never remount the canvas tree —
 * only the content buffers (RenderTextures keyed by storyRevision) and the
 * config-bound subtrees rebuild in place, which keeps the swap commit small
 * and the WebGL state (camera, lights, meshes, compiled shaders) untouched.
 *
 * The switch is a five-phase choreography with no frozen frames, no white
 * unsettled textures and no color shifts:
 *
 *   "flatten" — the REAL paper smoothly unfolds to flat (its fold targets
 *               are zeroed; the existing per-bone damping does the motion).
 *               Skipped when the paper is already flat.
 *   "exit"    — the transition sheet (sharing the outgoing paper's LIVE
 *               material — pixel-perfect, zero copy) replaces the flat paper
 *               and slides out of the viewport with an edge-concentrated
 *               vertical-axis curl. LEFT for next, RIGHT for previous.
 *   "waiting" — the sheet has left the screen. NOW the in-place content swap
 *               runs on a static background. The new content renders
 *               OFF-SCREEN, where its shaders compile and its texture draws.
 *   "enter"   — after a short adaptive gate (frames AND time, so slow
 *               devices automatically wait longer), the new paper glides in
 *               from the opposite side while its texture finishes settling.
 *   "idle"    — done; scroll unlocks.
 */

import { create } from "zustand";
import { getSurahPaperCount, loadSurahPaper } from "../data/surahDatabase";
import type { SurahPaper } from "../data/surahDatabase";
import { getLenisInstance } from "../_components/dom/LenisProvider";
import { useCameraViewStore } from "./useCameraViewStore";
import { useCameraStore } from "./useCameraStore";
import { useElevatedStore } from "./useElevatedStore";
import { seedStoresForPaper } from "./storySeeder";
import {
  capturePaperTransition,
  type PaperTransitionCapture,
} from "../_components/canvas/3d-scene/paperSnapshot";

/** If any phase hangs (e.g. WebGL context loss), force the switch to finish. */
const SWITCH_FAILSAFE_MS = 15000;
/** How long the real paper gets to unfold before the sheet takes over. */
const FLATTEN_MS = 520;
/** Fold rotations below this are considered "already flat" → skip flatten. */
const FLAT_ANGLE_EPSILON = 0.06;

export type PaperTransitionPhase =
  | "idle"
  | "flatten"
  | "exit"
  | "waiting"
  | "enter";

interface PaperState {
  /** Canonical Surah id of the currently mounted page (null before init). */
  surahId: string | null;
  /** Total papers available on this page. */
  paperCount: number;
  /** Index of the live paper. */
  activePaperIndex: number;
  /** True from switch request until the enter animation lands. */
  isSwitching: boolean;
  /** Current phase of the animated switch choreography. */
  transitionPhase: PaperTransitionPhase;
  /** +1 → next (exit left, enter from right); -1 → previous (mirrored). */
  transitionDirection: 1 | -1;
  /**
   * True only when a switch could NOT capture the live paper (e.g. it never
   * settled) — the viewer then shows the loading overlay as a fallback.
   * Never true during a normal animated switch.
   */
  switchFallback: boolean;

  /** Called once per route by StoreInitializer after the first paper is seeded. */
  initForSurah: (surahId: string) => void;
  goToPaper: (index: number) => void;
  goToNextPaper: () => void;
  goToPreviousPaper: () => void;
  /** Called by the transition sheet once it has fully left the viewport. */
  exitFinished: () => void;
  /** Called by the slide group when the adaptive warm-up gate opens. */
  beginEnter: () => void;
  /** Called when the freshly swapped paper's texture fully settles. */
  completeSwitch: () => void;
  /** Called by the slide group when the enter glide has landed. */
  enterFinished: () => void;
}

// Module-level guards (not reactive state) ---------------------------------

/** Invalidates in-flight switches when a newer switch/route init happens. */
let switchToken = 0;
let failsafeTimeoutId: number | null = null;
let flattenTimeoutId: number | null = null;

/**
 * Live handoff data for the transition sheet. Held at module level — it
 * references the outgoing content's material and is only read while that
 * content is still mounted.
 */
let activeCapture: PaperTransitionCapture | null = null;

/** The loaded paper waiting to be swapped in once the exit completes. */
let pendingPaper: SurahPaper | null = null;
let pendingIndex = 0;

export function getActiveTransitionCapture(): PaperTransitionCapture | null {
  return activeCapture;
}

function clearTimers(): void {
  if (failsafeTimeoutId !== null) {
    window.clearTimeout(failsafeTimeoutId);
    failsafeTimeoutId = null;
  }
  if (flattenTimeoutId !== null) {
    window.clearTimeout(flattenTimeoutId);
    flattenTimeoutId = null;
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

/**
 * The heavy part: seed every store (storyRevision bump rebuilds the content
 * buffers in place — the scene itself never remounts). Called ONLY when the
 * screen is static (sheet gone, incoming content off-screen), so the commit
 * stall is imperceptible.
 */
function performPendingSwap(): void {
  const paper = pendingPaper;
  if (!paper) return;
  pendingPaper = null;

  seedStoresForPaper(paper, { preserveCameraView: true });
  resetScrollToStoryStart();
  usePaperStore.setState({
    activePaperIndex: pendingIndex,
    transitionPhase: "waiting",
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
  switchFallback: false,

  initForSurah: (surahId) => {
    // Invalidate any in-flight switch from a previous route.
    switchToken += 1;
    clearTimers();
    activeCapture = null;
    pendingPaper = null;
    set({
      surahId,
      paperCount: Math.max(getSurahPaperCount(surahId), 1),
      activePaperIndex: 0,
      isSwitching: false,
      transitionPhase: "idle",
      switchFallback: false,
    });
    prefetchNeighborPapers(surahId, 0);
  },

  goToPaper: (index) => {
    const { surahId, paperCount, activePaperIndex, isSwitching } = get();
    if (!surahId || isSwitching) return;
    if (index === activePaperIndex || index < 0 || index >= paperCount) return;

    const token = ++switchToken;
    clearTimers();
    const direction: 1 | -1 = index > activePaperIndex ? 1 : -1;
    // Locks scroll (ScrollManager) and disables the arrows immediately.
    set({ isSwitching: true, transitionDirection: direction });

    // Whole-switch failsafe: whatever phase hangs, land on the new paper.
    failsafeTimeoutId = window.setTimeout(() => {
      failsafeTimeoutId = null;
      if (token !== switchToken) return;
      performPendingSwap();
      activeCapture = null;
      set({
        isSwitching: false,
        transitionPhase: "idle",
        switchFallback: false,
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
        // instantly. waitForPaint lets the arrows' state paint first.
        const [paper] = await Promise.all([
          loadSurahPaper(surahId, index),
          waitForPaint(),
        ]);

        // A newer switch or a route change won this race — do nothing.
        if (token !== switchToken || get().surahId !== surahId) return;
        if (!paper) {
          clearTimers();
          set({ isSwitching: false });
          return;
        }

        pendingPaper = paper;
        pendingIndex = index;

        // Grab the LIVE material of the outgoing paper. The old content
        // stays mounted for the whole flatten + exit flight, so no copy is
        // made and the sheet is indistinguishable from the real paper.
        activeCapture = capturePaperTransition();

        if (!activeCapture) {
          // Fallback path (paper never settled / context lost): swap now
          // behind the loading overlay.
          set({ switchFallback: true });
          performPendingSwap();
          prefetchNeighborPapers(surahId, index);
          return;
        }

        // Animated path. Phase 1: let the real paper unfold to flat — the
        // sheet must never interact with fold crease lines. Skipped when
        // the paper is already flat.
        const needsFlatten = activeCapture.maxFoldAngle > FLAT_ANGLE_EPSILON;
        set({ transitionPhase: "flatten" });
        flattenTimeoutId = window.setTimeout(
          () => {
            flattenTimeoutId = null;
            if (token !== switchToken) return;
            if (get().transitionPhase === "flatten") {
              // Mounting the sheet is the ONLY work in this commit — the
              // exit motion starts on the very next frame.
              set({ transitionPhase: "exit" });
            }
          },
          needsFlatten ? FLATTEN_MS : 50,
        );

        prefetchNeighborPapers(surahId, index);
      } catch {
        if (token === switchToken) {
          clearTimers();
          pendingPaper = null;
          activeCapture = null;
          set({
            isSwitching: false,
            transitionPhase: "idle",
            switchFallback: false,
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

  exitFinished: () => {
    if (get().transitionPhase !== "exit") return;
    // The sheet is out of the viewport — the screen is static. Run the
    // in-place swap now; the same commit unmounts the sheet, so the shared
    // material is never shown with the new content.
    performPendingSwap();
  },

  beginEnter: () => {
    if (get().transitionPhase !== "waiting") return;
    set({ transitionPhase: "enter" });
  },

  completeSwitch: () => {
    const state = get();
    reapplyCameraViewAfterSwitch();
    if (!state.isSwitching) return;

    if (state.switchFallback) {
      // Overlay path — the settle signal ends the switch.
      clearTimers();
      activeCapture = null;
      set({ isSwitching: false, switchFallback: false });
    }
    // Animated path: the adaptive gate (beginEnter) and enterFinished own
    // the lifecycle; the settle signal needs no action here.
  },

  enterFinished: () => {
    if (get().transitionPhase !== "enter") return;
    clearTimers();
    activeCapture = null;
    set({
      transitionPhase: "idle",
      isSwitching: false,
      switchFallback: false,
    });
  },
}));
