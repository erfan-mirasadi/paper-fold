import { useSpring } from "@react-spring/three";

// ============================================================================
// ELEVATE ANIMATION — CONFIGURABLE CONSTANTS
// ============================================================================
// Tweak these to control how the verse "peels" off the paper.
// ============================================================================

export const ELEVATE_TIMING = {
  /** How high the verse lifts off the paper surface. */
  liftHeight: 0.14,

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
  hideDelayZAndOpacity: 690,
};

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

// ============================================================================
// CAMERA FOCUS SETTINGS  (used by ElevateCameraController)
// ============================================================================
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

// ============================================================================
// HOOK
// ============================================================================

export function useElevateAnimation(isElevated: boolean) {
  const springConfig = {
    mass: ELEVATE_TIMING.springMass,
    tension: ELEVATE_TIMING.springTension,
    friction: ELEVATE_TIMING.springFriction,
  };

  const { liftZ, tiltX, scale } = useSpring({
    liftZ: isElevated ? ELEVATE_TIMING.liftHeight : 0,
    tiltX: isElevated ? ELEVATE_TIMING.tiltX : 0,
    scale: isElevated ? ELEVATE_TIMING.liftScale : 1,
    from: {
      liftZ: 0,
      tiltX: 0,
      scale: 1,
    },
    config: springConfig,
    delay: 0,
  });

  const { opacity } = useSpring({
    opacity: isElevated ? 1 : 0,
    from: {
      opacity: 0,
    },
    config: springConfig,
    delay: isElevated
      ? ELEVATE_TIMING.appearDelayZAndOpacity
      : ELEVATE_TIMING.hideDelayZAndOpacity,
  });

  const { shadowOpacity } = useSpring({
    shadowOpacity: isElevated
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
