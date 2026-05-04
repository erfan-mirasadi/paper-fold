import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useFoldStore } from "../_components/canvas/3d-scene/ScrollManager";
import type { ElevatedSectionId } from "../stores/useElevatedStore";

/**
 * Scatter positions (x, y) for each section during the intro sequence.
 * At introProgress=0, sections start at these offsets.
 * At introProgress=1, sections arrive at their normal positions (offset=0).
 */
export const INTRO_SECTION_SCATTER: Record<
  ElevatedSectionId,
  [number, number]
> = {
  /** Softer horizontal so S1 does not sweep too far toward the right. */
  s1: [-0.28, -0.55],
  /** Section 2: enter mostly from above; modest Y so motion is not too “sky-high”. */
  s2_top: [-0.04, -0.55],
  s2_center: [0.36, -0.55],
  /** Slightly lower entry than the other S2 bands (closer to final Y). */
  s2_bottom: [0.26, -0.63],
};

const easeInOut = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

function scatterTargetXY(
  scatterX: number,
  scatterY: number,
): { x: number; y: number } {
  const { introProgress, isIntroActive } = useFoldStore.getState();
  const t = easeInOut(clamp01(introProgress));
  const invT = isIntroActive ? Math.max(0, 1 - t) : 0;
  return { x: scatterX * invT, y: scatterY * invT };
}

/**
 * Returns a ref to attach to a THREE.Group.
 * While the intro is active, imperatively offsets the group from its
 * scatter position toward [0, 0] as introProgress goes 0 → 1.
 * Uses per-frame lerp for extra smoothness on top of scroll position.
 *
 * Pass `null` for no offset (shared cards without a section mapping).
 */
export function useIntroSectionOffset(sectionId: ElevatedSectionId | null) {
  const scatterX = sectionId ? INTRO_SECTION_SCATTER[sectionId][0] : 0;
  const scatterY = sectionId ? INTRO_SECTION_SCATTER[sectionId][1] : 0;
  const groupRef = useRef<Group>(null);

  const initial = scatterTargetXY(scatterX, scatterY);
  const liveX = useRef(initial.x);
  const liveY = useRef(initial.y);

  useFrame((_, delta) => {
    const { x: targetX, y: targetY } = scatterTargetXY(scatterX, scatterY);

    const factor = Math.min(delta * 9, 1);
    liveX.current += (targetX - liveX.current) * factor;
    liveY.current += (targetY - liveY.current) * factor;

    const g = groupRef.current;
    if (g) {
      g.position.x = liveX.current;
      g.position.y = liveY.current;
    }
  });

  return groupRef;
}
