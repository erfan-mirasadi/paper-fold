"use client";

import { useEffect, useRef } from "react";
import { usePopUpStore } from "../../../stores/usePopUpStore";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useLenis } from "../../dom/LenisProvider";

const FOLD_SCROLL_THRESHOLD_PX = 4;
const FOLD_TRIGGER_COOLDOWN_MS = 80;

export function PopUpHoverScrollController() {
  const lenis = useLenis();
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const hoveredGroupId = usePopUpStore((s) => s.hoveredGroupId);
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
  }, [isIntroActive]);

  useEffect(() => {
    if (!lenis) return;
    if (isIntroActive || isAllSectionsMode) return;

    if (hoveredGroupId) {
      lenis.stop();
      return;
    }

    lenis.start();
  }, [lenis, hoveredGroupId, isIntroActive, isAllSectionsMode]);

  return null;
}
