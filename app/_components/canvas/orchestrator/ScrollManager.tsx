"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { FOLD_STORY_STEPS, getOffsetForId } from "../3d-scene/FoldStory";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../../../stores/useElevatedStore";
import type { IntroMediaId } from "../../../data/introMedia";
import { usePopUpStore } from "../../../stores/usePopUpStore";
import { useLenis } from "../../dom/LenisProvider";

const STEP_SCROLL_DURATION_MS = 820;
const STEP_PAUSE_MS = 450;
const SCROLL_SNAP_EPSILON_PX = 0.5;

const easeInOutCubic = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

// Master Scroll Timeline Configuration
// Configured in percentages (0 to 100) for easier understanding and maintenance.
// Adjust these values if you add new pages or change the intro duration.
export const SCROLL_TIMELINE = {
  intro: { start: 0, end: 15 }, // Ends at 15%
  ambient: { start: 15, end: 50 }, // 35% dedicated to scrolling through ambient media
  handoff: { start: 50, end: 60 }, // Starts at 50%
  story: { start: 60, end: 100 },
};

interface FoldStoreState {
  targetStageId: string | null;
  transitionToken: number;
  isTransitioning: boolean;
  currentOffset: number;
  rawOffset: number;
  /** True while the user is in the intro + handoff scroll band. */
  isIntroActive: boolean;
  /** 0..1 progress within the intro scroll band. */
  introProgress: number;
  /** 0..1 progress through the intro-to-base handoff band. */
  introHandoffProgress: number;
  /** 0..1 progress through the ambient media scroll band. */
  ambientProgress: number;
  /** The ID of the currently hovered intro section guide. */
  activeAmbientMediaId: IntroMediaId | null;
  /** The ID of the ambient media currently active due to scroll. */
  scrollAmbientMediaId: IntroMediaId | null;
  setActiveAmbientMediaId: (id: IntroMediaId | null) => void;
  setScrollAmbientMediaId: (id: IntroMediaId | null) => void;
  triggerTransition: (id: string) => void;
  setCurrentOffset: (offset: number) => void;
  setRawOffset: (offset: number) => void;
  resetTransition: () => void;
}

export const useFoldStore = create<FoldStoreState>((set) => ({
  targetStageId: null,
  transitionToken: 0,
  isTransitioning: false,
  currentOffset: 0,
  rawOffset: 0,
  isIntroActive: true,
  introProgress: 0,
  introHandoffProgress: 0,
  ambientProgress: 0,

  activeAmbientMediaId: null,
  scrollAmbientMediaId: null,
  setActiveAmbientMediaId: (id) => set({ activeAmbientMediaId: id }),
  setScrollAmbientMediaId: (id) => set({ scrollAmbientMediaId: id }),

  triggerTransition: (id) =>
    set((state) => ({
      targetStageId: id,
      transitionToken: state.transitionToken + 1,
      isTransitioning: true,
    })),
  setCurrentOffset: (offset) => set({ currentOffset: clamp01(offset) }),
  setRawOffset: (offset) => set({ rawOffset: clamp01(offset) }),
  resetTransition: () => set({ targetStageId: null, isTransitioning: false }),
}));

const getBandProgress = (
  rawOffset: number,
  startPct: number,
  endPct: number,
): number => {
  const start = startPct / 100;
  const end = endPct / 100;
  if (start >= end) return rawOffset >= end ? 1 : 0;
  return clamp01((rawOffset - start) / (end - start));
};

const getStoryOffsetForRaw = (rawOffset: number): number => {
  return getBandProgress(
    rawOffset,
    SCROLL_TIMELINE.story.start,
    SCROLL_TIMELINE.story.end,
  );
};

const getRawOffsetForStory = (storyOffset: number): number => {
  const start = SCROLL_TIMELINE.story.start / 100;
  const end = SCROLL_TIMELINE.story.end / 100;
  return start + clamp01(storyOffset) * (end - start);
};

export function ScrollManager() {
  const lenis = useLenis();
  const targetStageId = useFoldStore((s) => s.targetStageId);
  const transitionToken = useFoldStore((s) => s.transitionToken);
  const setCurrentOffset = useFoldStore((s) => s.setCurrentOffset);
  const activeRunIdRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  const clearPendingWork = () => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  const syncCurrentOffset = useCallback((lenisInstance: Lenis) => {
    const maxScroll = Math.max(lenisInstance.limit, 0);
    if (maxScroll <= 0) return; // Prevent temporary DOM/layout shifts from resetting scroll to 0

    const rawOffset = clamp01(lenisInstance.scroll / maxScroll);

    // ── Intro intercept ────────────────────────────────────────────
    // Intro band -> camera-only scroll.
    // Handoff band -> smooth camera blend to base before story begins.
    const introActive = rawOffset < SCROLL_TIMELINE.story.start / 100;
    const introProgress = getBandProgress(
      rawOffset,
      SCROLL_TIMELINE.intro.start,
      SCROLL_TIMELINE.intro.end,
    );
    const ambientProgress = getBandProgress(
      rawOffset,
      SCROLL_TIMELINE.ambient.start,
      SCROLL_TIMELINE.ambient.end,
    );
    const handoffProgress = getBandProgress(
      rawOffset,
      SCROLL_TIMELINE.handoff.start,
      SCROLL_TIMELINE.handoff.end,
    );
    const storyOffset = getStoryOffsetForRaw(rawOffset);

    let scrollAmbientMediaId: IntroMediaId | null = null;
    if (ambientProgress >= 0 && handoffProgress === 0) {
      const keys: IntroMediaId[] = ["s1", "s1_step2", "s2_top", "s2_center", "s2_bottom"];
      // Distribute the 4 items across the ambient progress (0 to 1)
      let index = Math.floor(ambientProgress * keys.length);
      if (index >= keys.length) index = keys.length - 1;
      if (ambientProgress > 0 || introProgress >= 1) {
        scrollAmbientMediaId = keys[index];
      }
    }

    useFoldStore.setState({
      currentOffset: storyOffset,
      rawOffset,
      isIntroActive: introActive,
      introProgress,
      introHandoffProgress: handoffProgress,
      ambientProgress,
      scrollAmbientMediaId,
    });

    useElevatedStore.getState().syncScrollOffset(storyOffset);
    usePopUpStore.getState().syncScrollOffset(storyOffset);
  }, []);

  useEffect(() => {
    if (!lenis) return;

    let lastLimit = Math.max(lenis.limit, 0);
    let ignoreUntilTime = 0;

    const handleSync = () => {
      const currentLimit = Math.max(lenis.limit, 0);
      
      // If the scrollable area height changes (e.g., window resize, inspect panel),
      // we must preserve the user's scroll percentage (rawOffset) so they don't
      // jump into the intro sequence or trigger unintended elevated modes.
      if (currentLimit > 0 && lastLimit > 0 && Math.abs(currentLimit - lastLimit) > 5) {
        const lastRawOffset = useFoldStore.getState().rawOffset;
        lenis.scrollTo(lastRawOffset * currentLimit, { immediate: true });
        lastLimit = currentLimit;
        // Ignore scroll events for a short window to let Lenis settle its internal state
        ignoreUntilTime = performance.now() + 150;
        return; 
      }
      
      if (performance.now() < ignoreUntilTime) {
        return;
      }
      
      lastLimit = currentLimit;
      syncCurrentOffset(lenis);
    };

    const handleResize = () => {
      // Lenis's internal ResizeObserver might take a moment to update lenis.limit.
      // We trigger a sync shortly after to ensure the new limit is caught and corrected.
      setTimeout(handleSync, 20);
      setTimeout(handleSync, 100);
    };

    syncCurrentOffset(lenis);
    lenis.on("scroll", handleSync);
    window.addEventListener("resize", handleResize);

    return () => {
      lenis.off("scroll", handleSync);
      window.removeEventListener("resize", handleResize);
    };
  }, [lenis, syncCurrentOffset]);

  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  useEffect(() => {
    if (!lenis) return;

    const shouldLockScroll = isAllSectionsMode && !isIntroActive;

    if (shouldLockScroll) {
      lenis.stop();
    } else {
      lenis.start();
    }

    const preventDefault = (e: Event) => {
      if (shouldLockScroll) {
        e.preventDefault();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (shouldLockScroll) {
        const keys = [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          " ",
          "Home",
          "End",
        ];
        if (keys.includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    // We block wheel and touchmove to stop scrolling, but keep pointer events for dragging
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", handleKey);
    };
  }, [lenis, isAllSectionsMode, isIntroActive]);

  useEffect(() => {
    if (!targetStageId || !lenis) return;

    const targetIndex = FOLD_STORY_STEPS.findIndex(
      (step) => step.id === targetStageId,
    );

    if (targetIndex === -1) {
      useFoldStore.setState({ isTransitioning: false, targetStageId: null });
      return;
    }

    const maxStageIndex = FOLD_STORY_STEPS.length - 1;
    const targetOffset = getOffsetForId(targetStageId);
    const thisRunId = activeRunIdRef.current + 1;
    activeRunIdRef.current = thisRunId;

    clearPendingWork();

    const animateSegment = (
      fromTop: number,
      toTop: number,
      durationMs: number,
    ): Promise<boolean> =>
      new Promise((resolve) => {
        if (Math.abs(toTop - fromTop) <= SCROLL_SNAP_EPSILON_PX) {
          lenis.scrollTo(toTop, { immediate: true });
          resolve(true);
          return;
        }

        const startAt = performance.now();

        const tick = (now: number) => {
          if (activeRunIdRef.current !== thisRunId) {
            resolve(false);
            return;
          }

          const t = Math.min((now - startAt) / durationMs, 1);
          const easedT = easeInOutCubic(t);
          lenis.scrollTo(fromTop + (toTop - fromTop) * easedT, {
            immediate: true,
          });

          if (t < 1) {
            frameIdRef.current = requestAnimationFrame(tick);
            return;
          }

          frameIdRef.current = null;
          resolve(true);
        };

        frameIdRef.current = requestAnimationFrame(tick);
      });

    const waitPause = (durationMs: number): Promise<boolean> =>
      new Promise((resolve) => {
        timeoutIdRef.current = window.setTimeout(() => {
          timeoutIdRef.current = null;
          resolve(activeRunIdRef.current === thisRunId);
        }, durationMs);
      });

    const runStepByStepScroll = async () => {
      const maxScroll = lenis.limit;
      if (maxScroll <= 0 || maxStageIndex <= 0) {
        useFoldStore.setState({ isTransitioning: false, targetStageId: null });
        return;
      }

      const currentOffset = getStoryOffsetForRaw(
        clamp01(lenis.scroll / maxScroll),
      );
      const currentStage = currentOffset * maxStageIndex;
      const direction = targetIndex >= currentStage ? 1 : -1;
      const stageOffsets: number[] = [];

      if (direction > 0) {
        for (let i = Math.ceil(currentStage); i <= targetIndex; i++) {
          stageOffsets.push(i / maxStageIndex);
        }
      } else {
        for (let i = Math.floor(currentStage); i >= targetIndex; i--) {
          stageOffsets.push(i / maxStageIndex);
        }
      }

      if (
        stageOffsets.length === 0 ||
        Math.abs(stageOffsets[stageOffsets.length - 1] - targetOffset) > 0.00001
      ) {
        stageOffsets.push(targetOffset);
      }

      let fromTop = lenis.scroll;
      const storyStart = SCROLL_TIMELINE.story.start / 100;
      const baseStageSize = Math.max(1 - storyStart, 0.00001) / maxStageIndex;

      for (let i = 0; i < stageOffsets.length; i++) {
        if (activeRunIdRef.current !== thisRunId) return;

        const toTop = getRawOffsetForStory(stageOffsets[i]) * maxScroll;
        const segmentOffsetSize = Math.abs((toTop - fromTop) / maxScroll);
        const durationScale = Math.max(segmentOffsetSize / baseStageSize, 0.45);
        const segmentDuration = STEP_SCROLL_DURATION_MS * durationScale;

        const finished = await animateSegment(fromTop, toTop, segmentDuration);
        if (!finished) return;

        fromTop = toTop;

        if (i < stageOffsets.length - 1) {
          const keepGoing = await waitPause(STEP_PAUSE_MS);
          if (!keepGoing) return;
        }
      }

      lenis.scrollTo(getRawOffsetForStory(targetOffset) * maxScroll, {
        immediate: true,
      });
      setCurrentOffset(targetOffset);

      if (activeRunIdRef.current === thisRunId) {
        useFoldStore.setState({ isTransitioning: false, targetStageId: null });
      }
    };

    void runStepByStepScroll();

    return () => {
      if (activeRunIdRef.current === thisRunId) {
        activeRunIdRef.current += 1;
      }
      clearPendingWork();
    };
  }, [targetStageId, transitionToken, lenis, setCurrentOffset]);

  useEffect(
    () => () => {
      clearPendingWork();
      useFoldStore.setState({ isTransitioning: false, targetStageId: null });
    },
    [],
  );

  return null;
}
