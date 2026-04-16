import { useEffect, useState } from "react";

/**
 * Keeps a block hidden immediately, but delays its reappearance to sync with
 * sibling spring return animations.
 */
export function useDelayedHidden(
  isHiddenNow: boolean,
  revealDelayMs: number,
): boolean {
  const [isRevealReady, setIsRevealReady] = useState(!isHiddenNow);

  useEffect(() => {
    if (isHiddenNow) {
      const resetTimer = window.setTimeout(() => {
        setIsRevealReady(false);
      }, 0);

      return () => {
        window.clearTimeout(resetTimer);
      };
    }

    const revealTimer = window.setTimeout(() => {
      setIsRevealReady(true);
    }, revealDelayMs);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [isHiddenNow, revealDelayMs]);

  return isHiddenNow || !isRevealReady;
}
