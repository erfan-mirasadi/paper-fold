import { useSpring } from "@react-spring/three";
import { useState } from "react";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";

export const ELEVATE_TIMING = {
  /** How high the verse lifts off the paper surface. */
  liftHeight: 0.25,
  /** Subtle tilt on X axis when elevated (radians). Simulates paper peel. */
  tiltX: 0.08,
  /** Spring mass — higher = heavier, more momentum. */
  springMass: 2.7,
  /** Spring tension — higher = snappier. */
  springTension: 80,
  /** Spring friction — higher = more damping. */
  springFriction: 22,
  /** Scale factor when elevated (subtle zoom). */
  liftScale: 1.015,
  appearDelayZAndOpacity: 0,
  hideDelayZAndOpacity: 0,
};

export const SECTION_ELEVATION_HEIGHT = 0.205;
export const LABEL_ELEVATION_HEIGHT = 0.25;

export const ELEVATE_SHADOW = {
  /** Shadow opacity when verse is flat on paper. */
  opacityRest: 0,
  /** Shadow opacity when verse is fully elevated. */
  opacityLifted: 0.26,
  /** Shadow scale when elevated (slightly larger than card). */
  scale: 1.02,
  /** Shadow Y offset when elevated. */
  offsetY: -0.002,
  /** Shadow X offset when elevated. */
  offsetX: 0.0,
};

export const ELEVATE_TEXTURE_TIMING = {
  hideDelay: 0,
  showDelay: 640,
};

// CAMERA FOCUS SETTINGS
export const ELEVATE_CAMERA = {
  /** How close the camera moves to the elevated verse. */
  zoomDistance: 0.15,
  /** Camera lerp speed per frame (0-1). */
  lerpSpeed: 0.004,
  /** Y offset above the verse center for the camera look-at. */
  lookAtYOffset: 0.5,
  /** DOF blur intensity when focused (0 = no blur). */
  bokehScale: 10.0,
  /** DOF focus distance — auto-calculated from camera-to-verse distance. */
  focusOffset: 4.0,
};

import { ElevatedSectionId } from "../stores/useElevatedStore";

export function useElevateAnimation(
  isElevated: boolean,
  sectionId: ElevatedSectionId | null,
) {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isFoldedMainPaper = useFoldStore(
    (s) => !s.isIntroActive && s.currentOffset < 0.98,
  );
  const [prevIntroActive, setPrevIntroActive] = useState(isIntroActive);
  const justLeftIntro = !isIntroActive && prevIntroActive;

  const actuallyElevated = isElevated && !isFoldedMainPaper;

  if (isIntroActive !== prevIntroActive) {
    setPrevIntroActive(isIntroActive);
  }

  const springConfig = {
    mass: ELEVATE_TIMING.springMass,
    tension: ELEVATE_TIMING.springTension,
    friction: ELEVATE_TIMING.springFriction,
  };

  const { liftZ, tiltX, scale } = useSpring({
    liftZ: actuallyElevated ? ELEVATE_TIMING.liftHeight : 0,
    tiltX: actuallyElevated ? ELEVATE_TIMING.tiltX : 0,
    scale: actuallyElevated ? ELEVATE_TIMING.liftScale : 1,
    from: {
      liftZ: 0,
      tiltX: 0,
      scale: 1,
    },
    config: springConfig,
    delay: 0,
  });

  const { opacity } = useSpring({
    opacity: actuallyElevated ? 1 : 0,
    from: {
      opacity: 0,
    },
    config: actuallyElevated ? springConfig : { duration: 150 },
    delay: actuallyElevated ? 0 : 800,
    immediate: actuallyElevated || (justLeftIntro && sectionId !== "s1"),
  });

  const { shadowOpacity } = useSpring({
    shadowOpacity: actuallyElevated
      ? ELEVATE_SHADOW.opacityLifted
      : ELEVATE_SHADOW.opacityRest,
    from: { shadowOpacity: ELEVATE_SHADOW.opacityRest },
    config: springConfig,
  });

  return {
    liftZ,
    tiltX,
    scale,
    shadowOpacity,
    opacity,
  };
}
