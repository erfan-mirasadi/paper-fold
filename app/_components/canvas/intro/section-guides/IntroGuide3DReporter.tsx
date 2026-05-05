"use client";

import { useEffect } from "react";

import { Shared3DTracker } from "../../shared/3DTracker";
import type { ElevatedSectionId } from "../../../../stores/useElevatedStore";
import {
  introGuideAnchorInLabelLiftGroup,
  introGuideMarkerDomId,
} from "./introGuideAnchorLayout";
import { useFoldStore } from "../../orchestrator/ScrollManager";

type ReporterProps = {
  guideId: ElevatedSectionId;
  pinY: number;
  labelZ?: number;
  pageWidth: number;
};

export function IntroGuide3DReporter({
  guideId,
  pinY,
  labelZ = 0.00035,
  pageWidth,
}: ReporterProps) {
  const anchor = introGuideAnchorInLabelLiftGroup(pageWidth, pinY, labelZ);

  useEffect(() => {
    const id = introGuideMarkerDomId(guideId);
    return () => {
      const el = document.getElementById(id);
      if (el) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
    };
  }, [guideId]);

  return (
    <Shared3DTracker
      position={anchor}
      addCanvasBoundingRectToClientCoords
      onFrameUpdate={(sx, sy, isOnScreen) => {
        const el = document.getElementById(introGuideMarkerDomId(guideId));
        if (!el) return;

        const intro = useFoldStore.getState().isIntroActive;

        const isHidden =
          !intro || !isOnScreen || !Number.isFinite(sx) || !Number.isFinite(sy);

        if (isHidden) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        } else {
          // Restore to allow Overlay's React style (scroll progress) to take over
          el.style.opacity = "";
          el.style.visibility = "";
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
        }
      }}
    />
  );
}
