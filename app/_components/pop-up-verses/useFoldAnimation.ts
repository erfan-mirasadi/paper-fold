import { useState } from "react";
import { useSpring } from "@react-spring/three";

// ============================================================================
// TIMING & ANIMATION CONSTANTS (Adjust these values to tweak the effect!)
// ============================================================================
export const POPUP_TIMING = {
  // 1) Position & Appearance Values
  dipDepth: -0.03, // How deep into the paper it goes when hidden (Z-axis offset)
  restDepth: 0.001, // The normal position when flat on the paper surface

  // 2) Spring Physics Configs
  springMass: 2,
  springTension: 140,
  springFriction: 30,

  // 3) APPEARING (Going from hidden inside paper -> Popping up)
  appearDelayZAndOpacity: 0, // It starts rising & fading in immediately
  appearDelayFold: 450, // It waits a bit before it starts folding upward

  // 4) DISAPPEARING (Folding flat -> Hiding inside paper)
  hideDelayFold: 0, // Starts folding down flat immediately
  hideDelayZAndOpacity: 500, // Waits for the fold to finish, then sinks & fades out
};

export const ORIGINAL_TEXTURE_TIMING = {
  hideDelay: 250, // Delay before original static text disappears when pop-up opens
  showDelay: 500, // Delay before original static text reappears when pop-up closes
};

// ============================================================================
// ANIMATION HOOK
// Handles the spring physics, rotation values, and visibility unmounting.
// ============================================================================

export function useFoldAnimation(isFolded: boolean) {
  const [isVisible, setIsVisible] = useState(isFolded);
  const [animationComplete, setAnimationComplete] = useState(!isFolded);
  const [prevIsFolded, setPrevIsFolded] = useState(isFolded);

  // Sync state explicitly to avoid React cascading render warnings
  if (isFolded !== prevIsFolded) {
    setPrevIsFolded(isFolded);
    if (isFolded) {
      setIsVisible(true);
      setAnimationComplete(false);
    }
  }

  // Spring for Rotation & Shadow (Folding Action)
  const { rotLeft, rotRight, shadowVal } = useSpring({
    rotLeft: isFolded ? Math.PI / 2.05 : 0,
    rotRight: isFolded ? -Math.PI / 2.05 : 0,
    shadowVal: isFolded ? 1 : 0,
    config: {
      mass: POPUP_TIMING.springMass,
      tension: POPUP_TIMING.springTension,
      friction: POPUP_TIMING.springFriction,
    },
    delay: isFolded ? POPUP_TIMING.appearDelayFold : POPUP_TIMING.hideDelayFold,
  });

  // Spring for Position & Opacity (Sinking into paper & Fading)
  const { zOffset, opacity } = useSpring({
    zOffset: isFolded ? POPUP_TIMING.restDepth : POPUP_TIMING.dipDepth,
    opacity: isFolded ? 1 : 0,
    config: {
      mass: POPUP_TIMING.springMass,
      tension: POPUP_TIMING.springTension,
      friction: POPUP_TIMING.springFriction,
    },
    delay: isFolded
      ? POPUP_TIMING.appearDelayZAndOpacity
      : POPUP_TIMING.hideDelayZAndOpacity,
    onRest: (result) => {
      // Unmount safely ONLY after all closing animations finish
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
    shadowVal,
    zOffset,
    opacity,
  };
}
