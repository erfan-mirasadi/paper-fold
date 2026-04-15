"use client";

import { useScroll } from "@react-three/drei";
import { useEffect } from "react";
import { create } from "zustand";
import { getOffsetForId } from "./FoldStory";

interface FoldStoreState {
  targetStageId: string | null;
  /** Set a stage ID to animate to. Will be reset to null after transition starts. */
  triggerTransition: (id: string) => void;
  resetTransition: () => void;
}

export const useFoldStore = create<FoldStoreState>((set) => ({
  targetStageId: null,

  triggerTransition: (id) => set({ targetStageId: id }),
  resetTransition: () => set({ targetStageId: null }),
}));

/**
 * ScrollManager sits inside ScrollControls.
 * It listens to the useFoldStore and programmatically scrolls the container
 * when a targetStageId is set.
 */
export function ScrollManager() {
  const scroll = useScroll();
  const targetStageId = useFoldStore((s) => s.targetStageId);
  const resetTransition = useFoldStore((s) => s.resetTransition);

  useEffect(() => {
    if (targetStageId) {
      const targetOffset = getOffsetForId(targetStageId);

      if (scroll.el) {
        const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
        const targetScrollTop = targetOffset * maxScroll;

        scroll.el.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }

      // Reset the trigger so it doesn't keep scrolling if user tries to scroll away
      resetTransition();
    }
  }, [targetStageId, scroll.el, resetTransition]);

  return null;
}
