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

// ============================================================================
// 🔒 LOCK CONFIGURATION
// You can adjust exactly where the lock happens, and how hard it is to break!
// ============================================================================
export const LOCK_CONFIG = {
  // At what percentage of the total scroll should the lock engage? (0 to 1)
  // 0.60 = Paper has just landed but is still folded up.
  // 0.70 = Paper has fully unfolded and is perfectly flat (single paper).
  lockPositionPercentage: 0.6,

  // How much trackpad effort is required to break the lock and scroll up?
  effortRequired: 3000,

  // How many pixels near the lock point will the lock "grab" the user?
  // We use a larger grab range to catch very fast trackpad swipes that might slip past.
  grabRangePixels: 50,
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
  /** 0..1 progress of breaking through the barrier. */
  barrierProgress: number;
  /** The ID of the currently hovered intro section guide. */
  activeAmbientMediaId: IntroMediaId | null;
  /** The ID of the ambient media currently active due to scroll. */
  scrollAmbientMediaId: IntroMediaId | null;
  setActiveAmbientMediaId: (id: IntroMediaId | null) => void;
  setScrollAmbientMediaId: (id: IntroMediaId | null) => void;
  setBarrierProgress: (p: number) => void;
  triggerTransition: (id: string) => void;
  setCurrentOffset: (offset: number) => void;
  setRawOffset: (offset: number) => void;
  resetTransition: () => void;
  isInstantSkip: boolean;
  setInstantSkip: (v: boolean) => void;
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
  barrierProgress: 0,

  activeAmbientMediaId: null,
  scrollAmbientMediaId: null,
  setActiveAmbientMediaId: (id) => set({ activeAmbientMediaId: id }),
  setScrollAmbientMediaId: (id) => set({ scrollAmbientMediaId: id }),
  setBarrierProgress: (p: number) => set({ barrierProgress: p }),

  triggerTransition: (id) =>
    set((state) => ({
      targetStageId: id,
      transitionToken: state.transitionToken + 1,
      isTransitioning: true,
    })),
  setCurrentOffset: (offset) => set({ currentOffset: clamp01(offset) }),
  setRawOffset: (offset) => set({ rawOffset: clamp01(offset) }),
  resetTransition: () => set({ targetStageId: null, isTransitioning: false }),
  isInstantSkip: false,
  setInstantSkip: (v) => set({ isInstantSkip: v }),
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

  // --- BARRIER STATE REFS ---
  // Start unlocked — the lock only arms after the user scrolls past the lock
  // point for the first time (going down).  Starting as `true` caused an
  // instant dead-lock on small-screen devices where the lock point is close
  // to the top of the page.
  const isScrollUpLockedRef = useRef(false);
  const wheelEffortRef = useRef(0);
  const isAnimatingUpRef = useRef(false);

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
      const keys: IntroMediaId[] = [
        "s1",
        "s1_step1",
        "s1_step2",
        "s1_step3",
        "s2_top",
        "s2_center",
        "s2_bottom",
      ];
      // Distribute the items across the ambient progress (0 to 1)
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
    let lastWindowWidth = window.innerWidth;

    const handleSync = () => {
      if (performance.now() < ignoreUntilTime) {
        return;
      }

      const currentLimit = Math.max(lenis.limit, 0);

      // Mobile address bar hide/show causes `limit` (height) to change.
      // If we blindly enforce `rawOffset` on every height change, we actively fight
      // the user's scroll and lock them in place on mobile devices!
      // We only want to preserve `rawOffset` on significant window resizes (like device rotation or width changes).
      if (
        currentLimit > 0 &&
        lastLimit > 0 &&
        Math.abs(currentLimit - lastLimit) > 5
      ) {
        const widthChanged = window.innerWidth !== lastWindowWidth;
        // If height changed MASSIVELY (e.g. > 20% limit change, unlikely from address bar)
        const heightChangedMassively =
          Math.abs(currentLimit - lastLimit) > currentLimit * 0.2;

        if (widthChanged || heightChangedMassively) {
          const lastRawOffset = useFoldStore.getState().rawOffset;
          
          // IMPORTANT: Update state guards BEFORE calling scrollTo to prevent infinite recursion!
          lastLimit = currentLimit;
          lastWindowWidth = window.innerWidth;
          ignoreUntilTime = performance.now() + 150;
          
          lenis.scrollTo(lastRawOffset * currentLimit, { immediate: true });
          return;
        }
        
        lastLimit = currentLimit;
      }

      // Trackpad Inertia Clamp: If Lenis is trying to glide past the lock, stop it!
      if (typeof (lenis as any).targetScroll === "number") {
        const targetScroll = (lenis as any).targetScroll;
        const lockScroll = Math.floor(
          LOCK_CONFIG.lockPositionPercentage * currentLimit,
        );

        if (isScrollUpLockedRef.current && !isAnimatingUpRef.current) {
          if (targetScroll < lockScroll) {
            // HARD CLAMP: Don't let momentum carry them past the lock.
            // We use immediate: true so they feel a solid wall instead of a bouncy glide.
            lenis.scrollTo(lockScroll, { immediate: true });
          }
        }
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

    // --- NEW BARRIER LOGIC ---
    const handleBarrierInteraction = (deltaY: number, e: Event) => {
      if (shouldLockScroll) return; // Elevated mode has full lock

      // If the user actively scrolls DOWN while the release animation is playing,
      // they are taking back manual control and interrupting the animation.
      // We must reset the animation flag so the lock doesn't get stuck in an unarmed state.
      // NOTE: We only do this for deltaY > 0 (scrolling down). If we use Math.abs(deltaY),
      // the trackpad momentum from breaking the lock instantly cancels the animation!
      if (deltaY > 0 && isAnimatingUpRef.current) {
        isAnimatingUpRef.current = false;
      }

      const currentLimit = Math.max(lenis.limit, 0);
      const lockScroll = Math.floor(
        LOCK_CONFIG.lockPositionPercentage * currentLimit,
      );
      
      // Disarm point is exactly halfway between the lock (0.6) and the
      // target intro scroll position (0.5). Using a fixed pixel offset
      // caused the disarm to fail on smaller screens.
      const disarmScroll = Math.floor(
        ((LOCK_CONFIG.lockPositionPercentage + (SCROLL_TIMELINE.handoff.start / 100)) / 2) * currentLimit,
      );

      // Arm the lock if we are at or below the lock point.
      // IMPORTANT: Never re-arm while the break-through animation is still
      // playing — otherwise the user gets trapped again mid-flight.
      if (lenis.scroll >= lockScroll - SCROLL_SNAP_EPSILON_PX) {
        if (!isScrollUpLockedRef.current && !isAnimatingUpRef.current) {
          isScrollUpLockedRef.current = true;
          if (wheelEffortRef.current > 0) {
            wheelEffortRef.current = 0;
            useFoldStore.getState().setBarrierProgress(0);
          }
        }
      } else if (lenis.scroll < disarmScroll) {
        // Disarm if we are truly above it
        isScrollUpLockedRef.current = false;
        isAnimatingUpRef.current = false; // Reset the animation flag safely
      }

      // We only want to block wheel events if they are AT the boundary.
      // We require them to visually hit the wall (within 2px) to start pushing against it.
      // We also check a larger area above the wall (grabRangePixels) just in case they slipped past.
      const isAtBoundary =
        lenis.scroll <= lockScroll + 2 &&
        lenis.scroll >= lockScroll - LOCK_CONFIG.grabRangePixels;

      if (isScrollUpLockedRef.current && isAtBoundary) {
        if (deltaY < 0) {
          // Prevent Lenis from scrolling past the barrier
          e.preventDefault();
          e.stopPropagation(); // <-- Stop Lenis from receiving this event

          wheelEffortRef.current += Math.abs(deltaY);
          const progress = Math.min(
            wheelEffortRef.current / LOCK_CONFIG.effortRequired,
            1,
          );
          useFoldStore.getState().setBarrierProgress(progress);

          if (wheelEffortRef.current > LOCK_CONFIG.effortRequired) {
            // Break the barrier!
            isScrollUpLockedRef.current = false;
            isAnimatingUpRef.current = true;
            wheelEffortRef.current = 0;
            useFoldStore.getState().setBarrierProgress(0);

            // Give a feeling of release by smoothly gliding back into the intro
            const handoffStartScroll =
              (SCROLL_TIMELINE.handoff.start / 100) * currentLimit;
            lenis.scrollTo(handoffStartScroll, {
              duration: 3.5, // Much slower and longer
              easing: easeInOutCubic, // Starts very slow, preventing any "sudden" jump feeling
              onComplete: () => {
                // Reset the animation flag once Lenis has finished gliding.
                // This is far more reliable than checking scroll position,
                // which can be affected by layout shifts or device quirks.
                isAnimatingUpRef.current = false;
              },
            });
          }
        } else {
          // Scrolling down into the story, ease off effort
          if (wheelEffortRef.current > 0) {
            wheelEffortRef.current = Math.max(
              0,
              wheelEffortRef.current - deltaY,
            );
            const progress = Math.min(
              wheelEffortRef.current / LOCK_CONFIG.effortRequired,
              1,
            );
            useFoldStore.getState().setBarrierProgress(progress);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (shouldLockScroll) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      handleBarrierInteraction(e.deltaY, e);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (shouldLockScroll) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;
      handleBarrierInteraction(deltaY * 2, e); // touch delta needs multiplier
    };

    // We use capture: true to ensure we intercept the event BEFORE Lenis does
    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", handleKey, { capture: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
      window.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      });
      window.removeEventListener("keydown", handleKey, { capture: true });
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
