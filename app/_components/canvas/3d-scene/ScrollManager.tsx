"use client";

import { useScroll } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { FOLD_STORY_STEPS, getOffsetForId } from "./FoldStory";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { usePopUpStore } from "../../../stores/usePopUpStore";

const STEP_SCROLL_DURATION_MS = 820;
const STEP_PAUSE_MS = 450;
const SCROLL_SNAP_EPSILON_PX = 0.5;

const easeInOutCubic = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/** The first INTRO_SCROLL_FRACTION of the total scroll height is reserved for
 *  the intro sequence. The fold story only plays over the remaining portion. */
export const INTRO_SCROLL_FRACTION = 0.4;
// Extra scroll space reserved for a smooth camera handoff before the base scene.
export const INTRO_HANDOFF_FRACTION = 0.1;
const INTRO_MAX_FRACTION = 0.95;

interface FoldStoreState {
  targetStageId: string | null;
  transitionToken: number;
  isTransitioning: boolean;
  currentOffset: number;
  /** True while the user is in the intro + handoff scroll band. */
  isIntroActive: boolean;
  /** 0..1 progress within the intro scroll band. */
  introProgress: number;
  /** 0..1 progress through the intro-to-base handoff band. */
  introHandoffProgress: number;
  triggerTransition: (id: string) => void;
  setCurrentOffset: (offset: number) => void;
  resetTransition: () => void;
}

export const useFoldStore = create<FoldStoreState>((set) => ({
  targetStageId: null,
  transitionToken: 0,
  isTransitioning: false,
  currentOffset: 0,
  isIntroActive: true,
  introProgress: 0,
  introHandoffProgress: 0,

  triggerTransition: (id) =>
    set((state) => ({
      targetStageId: id,
      transitionToken: state.transitionToken + 1,
      isTransitioning: true,
    })),
  setCurrentOffset: (offset) => set({ currentOffset: clamp01(offset) }),
  resetTransition: () => set({ targetStageId: null, isTransitioning: false }),
}));

const getIntroBands = () => {
  const introEnd = clamp01(INTRO_SCROLL_FRACTION);
  const handoffEnd = Math.min(
    INTRO_MAX_FRACTION,
    introEnd + Math.max(0, INTRO_HANDOFF_FRACTION),
  );
  return { introEnd, handoffEnd };
};

const getStoryOffsetForRaw = (rawOffset: number): number => {
  const { handoffEnd } = getIntroBands();
  if (rawOffset < handoffEnd) return 0;
  const usableRange = Math.max(1 - handoffEnd, 0.00001);
  return clamp01((rawOffset - handoffEnd) / usableRange);
};

const getRawOffsetForStory = (storyOffset: number): number => {
  const { handoffEnd } = getIntroBands();
  const usableRange = Math.max(1 - handoffEnd, 0);
  if (usableRange <= 0) return 1;
  return clamp01(handoffEnd + clamp01(storyOffset) * usableRange);
};

export function ScrollManager() {
  const scroll = useScroll();
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

  useEffect(() => {
    if (!scroll.el) return;

    const el = scroll.el;
    const hiddenScrollbarClass = "scroll-controls-hide-scrollbar";
    const touchScrollClass = "scroll-controls-touch-scroll";

    el.classList.add(hiddenScrollbarClass);
    el.classList.add(touchScrollClass);

    const syncCurrentOffset = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const rawOffset = maxScroll <= 0 ? 0 : clamp01(el.scrollTop / maxScroll);

      // ── Intro intercept ────────────────────────────────────────────
      // Intro band -> camera-only scroll.
      // Handoff band -> smooth camera blend to base before story begins.
      const { introEnd, handoffEnd } = getIntroBands();
      const introActive = rawOffset < handoffEnd;
      const introProgress = introEnd <= 0 ? 1 : clamp01(rawOffset / introEnd);
      const handoffProgress =
        rawOffset <= introEnd
          ? 0
          : clamp01(
              (rawOffset - introEnd) / Math.max(handoffEnd - introEnd, 0.00001),
            );
      const storyOffset = getStoryOffsetForRaw(rawOffset);

      useFoldStore.setState({
        isIntroActive: introActive,
        introProgress,
        introHandoffProgress: handoffProgress,
      });
      setCurrentOffset(storyOffset);

      useElevatedStore.getState().syncScrollOffset(storyOffset);
      usePopUpStore.getState().syncScrollOffset(storyOffset);
    };

    syncCurrentOffset();
    el.addEventListener("scroll", syncCurrentOffset, { passive: true });
    window.addEventListener("resize", syncCurrentOffset);

    return () => {
      el.removeEventListener("scroll", syncCurrentOffset);
      window.removeEventListener("resize", syncCurrentOffset);
      el.classList.remove(hiddenScrollbarClass);
      el.classList.remove(touchScrollClass);
    };
  }, [scroll.el, setCurrentOffset]);

  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  useEffect(() => {
    if (!scroll.el) return;
    const el = scroll.el;

    const shouldLockScroll = isAllSectionsMode && !isIntroActive;

    if (shouldLockScroll) {
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "auto";
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
    el.addEventListener("wheel", preventDefault, { passive: false });
    el.addEventListener("touchmove", preventDefault, { passive: false });
    el.addEventListener("keydown", handleKey as any);

    return () => {
      el.removeEventListener("wheel", preventDefault);
      el.removeEventListener("touchmove", preventDefault);
      el.removeEventListener("keydown", handleKey as any);
    };
  }, [scroll.el, isAllSectionsMode, isIntroActive]);

  useEffect(() => {
    if (!targetStageId || !scroll.el) return;

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
      el: HTMLElement,
      fromTop: number,
      toTop: number,
      durationMs: number,
    ): Promise<boolean> =>
      new Promise((resolve) => {
        if (Math.abs(toTop - fromTop) <= SCROLL_SNAP_EPSILON_PX) {
          el.scrollTo({ top: toTop, behavior: "auto" });
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
          el.scrollTo({
            top: fromTop + (toTop - fromTop) * easedT,
            behavior: "auto",
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
      const el = scroll.el;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0 || maxStageIndex <= 0) {
        useFoldStore.setState({ isTransitioning: false, targetStageId: null });
        return;
      }

      const currentOffset = getStoryOffsetForRaw(
        clamp01(el.scrollTop / maxScroll),
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

      let fromTop = el.scrollTop;
      const { handoffEnd } = getIntroBands();
      const baseStageSize = Math.max(1 - handoffEnd, 0.00001) / maxStageIndex;

      for (let i = 0; i < stageOffsets.length; i++) {
        if (activeRunIdRef.current !== thisRunId) return;

        const toTop = getRawOffsetForStory(stageOffsets[i]) * maxScroll;
        const segmentOffsetSize = Math.abs((toTop - fromTop) / maxScroll);
        const durationScale = Math.max(segmentOffsetSize / baseStageSize, 0.45);
        const segmentDuration = STEP_SCROLL_DURATION_MS * durationScale;

        const finished = await animateSegment(
          el,
          fromTop,
          toTop,
          segmentDuration,
        );
        if (!finished) return;

        fromTop = toTop;

        if (i < stageOffsets.length - 1) {
          const keepGoing = await waitPause(STEP_PAUSE_MS);
          if (!keepGoing) return;
        }
      }

      el.scrollTo({
        top: getRawOffsetForStory(targetOffset) * maxScroll,
        behavior: "auto",
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
  }, [targetStageId, transitionToken, scroll.el, setCurrentOffset]);

  useEffect(
    () => () => {
      clearPendingWork();
      useFoldStore.setState({ isTransitioning: false, targetStageId: null });
    },
    [],
  );

  return null;
}
