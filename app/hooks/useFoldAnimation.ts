import { useSpring } from "@react-spring/three";

// TIMING & ANIMATION CONSTANTS
export const POPUP_TIMING = {
  dipDepth: 0.001,
  restDepth: 0.002,

  springMass: 2.7,
  springTension: 80,
  springFriction: 22,

  appearDelayZAndOpacity: 0,
  appearDelayFold: 295,
  appearDelayShadow: 295,

  hideDelayFold: 0,
  hideDelayZAndOpacity: 690,
  hideDelayShadow: 0,
};

export const ORIGINAL_TEXTURE_TIMING = {
  hideDelay: 295,
  showDelay: 640,
};

// SHADOW CONFIGURATION
export const SHADOW_CONFIG = {
  baseOffsetX: 0.0,
  baseOffsetY: -0.004,
  baseInsetZ: -0.001,
  surfaceLiftZBias: 0.0006,
  directionBiasX: 0.004,
  leftAnchorCompensation: 0.3,
  foldOffsetX: 0,
  foldOffsetY: -0.03,
  surfaceScaleDampen: 0.6,

  shrinkX: 0.65,
  shrinkY: 0.2,
  elevateScaleX: 1.14,
  elevateScaleY: 1.1,
  elevateOpacityFalloff: 3.5,

  opacityFlat: 0.6,
  opacityFolded: 0.05,
};

export function useFoldAnimation(isFolded: boolean) {
  const springConfig = {
    mass: POPUP_TIMING.springMass,
    tension: POPUP_TIMING.springTension,
    friction: POPUP_TIMING.springFriction,
  };

  const { rotLeft, rotRight, foldProgress } = useSpring({
    rotLeft: isFolded ? Math.PI / 3 : 0,
    rotRight: isFolded ? -Math.PI / 3 : 0,
    foldProgress: isFolded ? 1 : 0,
    from: {
      rotLeft: 0,
      rotRight: 0,
      foldProgress: 0,
    },
    config: springConfig,
    delay: isFolded ? POPUP_TIMING.appearDelayFold : POPUP_TIMING.hideDelayFold,
  });

  const { shadowGlobalOpacity } = useSpring({
    shadowGlobalOpacity: isFolded ? 1 : 0,
    from: {
      shadowGlobalOpacity: 0,
    },
    config: springConfig,
    delay: isFolded
      ? POPUP_TIMING.appearDelayShadow
      : POPUP_TIMING.hideDelayShadow,
  });

  const { zOffset, opacity } = useSpring({
    zOffset: isFolded ? POPUP_TIMING.restDepth : POPUP_TIMING.dipDepth,
    opacity: isFolded ? 1 : 0,
    from: {
      zOffset: POPUP_TIMING.dipDepth,
      opacity: 0,
    },
    config: springConfig,
    delay: isFolded
      ? POPUP_TIMING.appearDelayZAndOpacity
      : POPUP_TIMING.hideDelayZAndOpacity,
  });

  return {
    rotLeft,
    rotRight,
    foldProgress,
    shadowGlobalOpacity,
    zOffset,
    opacity,
  };
}

export function useMiddleHorizontalFoldAnimation(
  isFolded: boolean,
  direction: 1 | -1,
  isEnabled: boolean,
) {
  const springConfig = {
    mass: POPUP_TIMING.springMass,
    tension: POPUP_TIMING.springTension,
    friction: POPUP_TIMING.springFriction,
  };

  const { horizontalTiltX } = useSpring({
    horizontalTiltX: isEnabled && isFolded ? direction * (Math.PI / 3) : 0,
    from: { horizontalTiltX: 0 },
    config: springConfig,
    delay:
      isEnabled && isFolded
        ? POPUP_TIMING.appearDelayFold
        : POPUP_TIMING.hideDelayFold,
  });

  const { horizontalLiftZ } = useSpring({
    horizontalLiftZ: isEnabled
      ? isFolded
        ? POPUP_TIMING.restDepth
        : POPUP_TIMING.dipDepth
      : 0,
    from: { horizontalLiftZ: isEnabled ? POPUP_TIMING.dipDepth : 0 },
    config: springConfig,
    delay:
      isEnabled && isFolded
        ? POPUP_TIMING.appearDelayZAndOpacity
        : POPUP_TIMING.hideDelayZAndOpacity,
  });

  return {
    horizontalTiltX,
    horizontalLiftZ,
  };
}
