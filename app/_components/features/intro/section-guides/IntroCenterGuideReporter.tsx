"use client";

import { useEffect } from "react";

import { Shared3DTracker } from "../../../shared/3DTracker";
import { useSurahLayoutRuntime } from "../../../data/useSurahLayoutRuntime";
import { useFoldStore } from "../../../3d-scene/ScrollManager";
import { useIntroSectionOffset } from "../../../3d-scene/intro/useIntroSectionAnimation";
import {
  introGuideCenterAnchorSceneLocal,
  introGuideMarkerDomId,
} from "./introGuideAnchorLayout";

/** Projects the `s2_center` intro HUD marker from the middle S2 verse group (no top label). */
export function IntroCenterGuideReporter() {
  const runtime = useSurahLayoutRuntime();
  const anchor = introGuideCenterAnchorSceneLocal(runtime);
  const introRef = useIntroSectionOffset("s2_center");

  useEffect(() => {
    const id = introGuideMarkerDomId("s2_center");
    return () => {
      const el = document.getElementById(id);
      if (el) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
    };
  }, []);

  return (
    <group ref={introRef}>
      <Shared3DTracker
        position={anchor}
        addCanvasBoundingRectToClientCoords
        onFrameUpdate={(sx, sy, isOnScreen) => {
          const el = document.getElementById(introGuideMarkerDomId("s2_center"));
          if (!el) return;

          const intro = useFoldStore.getState().isIntroActive;

          const isHidden = !intro || !isOnScreen || !Number.isFinite(sx) || !Number.isFinite(sy);

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
    </group>
  );
}
