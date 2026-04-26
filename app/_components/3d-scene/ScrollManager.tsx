"use client";

import { useScroll } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { FOLD_STORY_STEPS, getOffsetForId } from "./FoldStory";
import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { usePopUpStore } from "../features/pop-up-verses/ui/usePopUpStore";

const STEP_SCROLL_DURATION_MS = 820;
const STEP_PAUSE_MS = 450;
const SCROLL_SNAP_EPSILON_PX = 0.5;

const easeInOutCubic = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

interface FoldStoreState {
  targetStageId: string | null;
  transitionToken: number;
  isTransitioning: boolean;
  currentOffset: number;
  triggerTransition: (id: string) => void;
  setCurrentOffset: (offset: number) => void;
  resetTransition: () => void;
}

export const useFoldStore = create<FoldStoreState>((set) => ({
  targetStageId: null,
  transitionToken: 0,
  isTransitioning: false,
  currentOffset: 0,

  triggerTransition: (id) =>
    set((state) => ({
      targetStageId: id,
      transitionToken: state.transitionToken + 1,
      isTransitioning: true,
    })),
  setCurrentOffset: (offset) => set({ currentOffset: clamp01(offset) }),
  resetTransition: () => set({ targetStageId: null, isTransitioning: false }),
}));

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

    // Mobile-only: ensure touch scrolling works reliably (esp. iOS Safari).
    // We keep desktop behavior unchanged.
    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(pointer: coarse)")?.matches ||
        navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
      el.classList.add(touchScrollClass);
    }

    const syncCurrentOffset = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const offset = maxScroll <= 0 ? 0 : clamp01(el.scrollTop / maxScroll);

      setCurrentOffset(offset);

      useElevatedStore.getState().syncScrollOffset(offset);
      usePopUpStore.getState().syncScrollOffset(offset);
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

      const currentOffset = clamp01(el.scrollTop / maxScroll);
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
      const baseStageSize = 1 / maxStageIndex;

      for (let i = 0; i < stageOffsets.length; i++) {
        if (activeRunIdRef.current !== thisRunId) return;

        const toTop = stageOffsets[i] * maxScroll;
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

      el.scrollTo({ top: targetOffset * maxScroll, behavior: "auto" });
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
