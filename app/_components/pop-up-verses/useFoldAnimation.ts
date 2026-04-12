import { useState } from "react";
import { useSpring } from "@react-spring/three";

// TIMING & ANIMATION CONSTANTS
export const POPUP_TIMING = {
  dipDepth: 0.001,
  restDepth: 0.002,

  springMass: 1.9,
  springTension: 110,
  springFriction: 22,

  appearDelayZAndOpacity: 0,
  appearDelayFold: 150,
  appearDelayShadow: 150,

  hideDelayFold: 0,
  hideDelayZAndOpacity: 350,
  hideDelayShadow: 0,
};

export const ORIGINAL_TEXTURE_TIMING = {
  hideDelay: 150,
  showDelay: 350,
};

// SHADOW CONFIGURATION
export const SHADOW_CONFIG = {
  baseOffsetX: 0.0,
  baseOffsetY: -0.004,
  foldOffsetX: 0,
  foldOffsetY: -0.03,

  shrinkX: 0.65,
  shrinkY: 0.2,

  opacityFlat: 0.6,
  opacityFolded: 0.05,
};

export function useFoldAnimation(isFolded: boolean) {
  const [isVisible, setIsVisible] = useState(isFolded);
  const [animationComplete, setAnimationComplete] = useState(!isFolded);
  const [prevIsFolded, setPrevIsFolded] = useState(isFolded);

  if (isFolded !== prevIsFolded) {
    setPrevIsFolded(isFolded);
    if (isFolded) {
      setIsVisible(true);
      setAnimationComplete(false);
    }
  }

  const springConfig = {
    mass: POPUP_TIMING.springMass,
    tension: POPUP_TIMING.springTension,
    friction: POPUP_TIMING.springFriction,
  };

  const { rotLeft, rotRight, foldProgress } = useSpring({
    rotLeft: isFolded ? Math.PI / 2.05 : 0,
    rotRight: isFolded ? -Math.PI / 2.05 : 0,
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
    onRest: (result) => {
      if (result.finished && !isFolded) {
        setAnimationComplete(true);
        setIsVisible(false);
      }
    },
  });

  return {
    isVisible,
    animationComplete,
    rotLeft,
    rotRight,
    foldProgress,
    shadowGlobalOpacity,
    zOffset,
    opacity,
  };
}
