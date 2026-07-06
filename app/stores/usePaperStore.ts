"use client";

/**
 * usePaperStore — multi-paper navigation inside a single Surah page.
 *
 * Rendering policy (critical for low-end devices):
 *   1. Exactly ONE paper is ever live on the GPU. Switching remounts the
 *      canvas scene via `paperInstanceKey`, so the outgoing paper's
 *      geometries and RenderTextures are fully disposed before the new
 *      paper allocates its own. GPU memory stays flat no matter how many
 *      papers a Surah has.
 *   2. The loading overlay is guaranteed to PAINT before the heavy scene
 *      teardown/mount commit happens (double-rAF barrier), so the swap
 *      hitch is never visible.
 *   3. The overlay is dismissed by the new paper's ready signal
 *      (texture settled → onReady), never by a blind timer.
 *   4. Neighbor paper configs (JS data only — never textures) are
 *      idle-prefetched so the next arrow click starts instantly.
 *
 * The switch pipeline is intentionally phase-based so a real paper-turn
 * transition can later replace the loading overlay: play "exit" animation
 * where the overlay currently fades in, and play "enter" where
 * `completeSwitch` currently fires.
 */

import { create } from "zustand";
import { getSurahPaperCount, loadSurahPaper } from "../data/surahDatabase";
import { getLenisInstance } from "../_components/dom/LenisProvider";
import { seedStoresForPaper } from "./storySeeder";

/** If the new paper never reports ready (e.g. WebGL context loss), release the overlay. */
const SWITCH_FAILSAFE_MS = 15000;

interface PaperState {
  /** Canonical Surah id of the currently mounted page (null before init). */
  surahId: string | null;
  /** Total papers available on this page. */
  paperCount: number;
  /** Index of the live paper. */
  activePaperIndex: number;
  /**
   * Monotonic remount key for the live canvas scene. Bumping it unmounts the
   * old paper (disposing its GPU resources) and mounts the new one.
   */
  paperInstanceKey: number;
  /** True from switch request until the new paper reports ready. */
  isSwitching: boolean;

  /** Called once per route by StoreInitializer after the first paper is seeded. */
  initForSurah: (surahId: string) => void;
  goToPaper: (index: number) => void;
  goToNextPaper: () => void;
  goToPreviousPaper: () => void;
  /** Called by the viewer when the freshly mounted paper reports ready. */
  completeSwitch: () => void;
}

// Module-level guards (not reactive state) ---------------------------------

/** Invalidates in-flight switches when a newer switch/route init happens. */
let switchToken = 0;
let failsafeTimeoutId: number | null = null;

function clearFailsafe(): void {
  if (failsafeTimeoutId !== null) {
    window.clearTimeout(failsafeTimeoutId);
    failsafeTimeoutId = null;
  }
}

/**
 * Resolves after the browser has painted the current commit — used to make
 * sure the loading overlay is on screen before the expensive scene swap.
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
 * commit that swaps the paper. Doing this synchronously right after seeding
 * (while lenis.scroll AND foldStore.rawOffset are both being zeroed) removes
 * a race with ScrollManager's resize-restore logic, which would otherwise
 * re-apply the previous paper's scroll offset after the spacer height changes.
 * `force: true` bypasses a stopped/locked Lenis.
 */
function resetScrollToStoryStart(): void {
  const lenis = getLenisInstance();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
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
  paperInstanceKey: 0,
  isSwitching: false,

  initForSurah: (surahId) => {
    // Invalidate any in-flight switch from a previous route.
    switchToken += 1;
    clearFailsafe();
    set({
      surahId,
      paperCount: Math.max(getSurahPaperCount(surahId), 1),
      activePaperIndex: 0,
      isSwitching: false,
    });
    prefetchNeighborPapers(surahId, 0);
  },

  goToPaper: (index) => {
    const { surahId, paperCount, activePaperIndex, isSwitching } = get();
    if (!surahId || isSwitching) return;
    if (index === activePaperIndex || index < 0 || index >= paperCount) return;

    const token = ++switchToken;
    clearFailsafe();
    // Mounts the loading overlay (it also blocks all scroll input).
    set({ isSwitching: true });

    void (async () => {
      try {
        // Load the config chunk while the overlay paints. Both must finish
        // before we tear anything down.
        const [paper] = await Promise.all([
          loadSurahPaper(surahId, index),
          waitForPaint(),
        ]);

        // A newer switch or a route change won this race — do nothing.
        if (token !== switchToken || get().surahId !== surahId) return;
        if (!paper) {
          set({ isSwitching: false });
          return;
        }

        // Seed every store and bump the remount key in the same task so React
        // batches teardown + mount into ONE commit behind the overlay. The
        // fold story always restarts from the beginning: seedStoresForPaper
        // zeroes the fold store and resetScrollToStoryStart zeroes Lenis
        // before the commit, so no stale offset can survive the swap.
        seedStoresForPaper(paper);
        resetScrollToStoryStart();
        set((state) => ({
          activePaperIndex: index,
          paperInstanceKey: state.paperInstanceKey + 1,
        }));

        failsafeTimeoutId = window.setTimeout(() => {
          failsafeTimeoutId = null;
          if (token === switchToken && get().isSwitching) {
            set({ isSwitching: false });
          }
        }, SWITCH_FAILSAFE_MS);

        prefetchNeighborPapers(surahId, index);
      } catch {
        if (token === switchToken) set({ isSwitching: false });
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

  completeSwitch: () => {
    if (!get().isSwitching) return;
    clearFailsafe();
    set({ isSwitching: false });
  },
}));
