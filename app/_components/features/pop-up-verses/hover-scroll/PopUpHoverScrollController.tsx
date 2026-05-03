"use client";

import { useEffect, useRef } from "react";
import { usePopUpStore } from "../ui/usePopUpStore";
import { useFoldStore } from "../../../3d-scene/ScrollManager";

const FOLD_SCROLL_THRESHOLD_PX = 4;
const FOLD_TRIGGER_COOLDOWN_MS = 80;

export function PopUpHoverScrollController() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const wheelAccumulatorRef = useRef(0);
  const lastFoldTriggerAtRef = useRef(0);

  useEffect(() => {
    if (isIntroActive) return;
    const handleWheel = (event: WheelEvent) => {
      const hoveredGroupId = usePopUpStore.getState().hoveredGroupId;
      if (!hoveredGroupId) return;

      // While hovering popup verses, lock page scroll and consume wheel here.
      event.preventDefault();
      event.stopPropagation();

      wheelAccumulatorRef.current += event.deltaY;
      const now = performance.now();
      const canTrigger =
        now - lastFoldTriggerAtRef.current >= FOLD_TRIGGER_COOLDOWN_MS;

      if (
        canTrigger &&
        Math.abs(wheelAccumulatorRef.current) >= FOLD_SCROLL_THRESHOLD_PX
      ) {
        const direction: "down" | "up" =
          wheelAccumulatorRef.current > 0 ? "down" : "up";
        usePopUpStore.getState().handleHoverScroll(direction);
        wheelAccumulatorRef.current = 0;
        lastFoldTriggerAtRef.current = now;
      }
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      wheelAccumulatorRef.current = 0;
      lastFoldTriggerAtRef.current = 0;
    };
  }, []);

  return null;
}
