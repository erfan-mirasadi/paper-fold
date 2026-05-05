import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import type { ElevatedSectionId } from "../stores/useElevatedStore";

export const INTRO_SECTION_SCATTER: Record<
  ElevatedSectionId,
  [number, number, number]
> = {
  s1: [0.3, 0, 1],
  s2_top: [0, -0.6, -0.4],
  s2_center: [0.06, -0.55, -1.2],
  s2_bottom: [0, -0.63, 0.5],
};

const easeInOut = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

// Module-level timestamp: tracks when we first became eligible to return identity.
let _identityReadyAt = 0;

export const HANDOFF_SECTION_TARGET: Record<
  ElevatedSectionId,
  { x: number; y: number; z: number; scale: number }
> = {
  s1: { x: 0, y: 0, z: 0, scale: 1 },
  // Give all S2 sections the exact same displacement so they move as a unified block
  // and maintain their relative positions.
  s2_top: { x: 0, y: 0.5, z: -0.3, scale: 0.85 },
  s2_center: { x: 0, y: 0.8, z: -0.6, scale: 0.85 },
  s2_bottom: { x: 0, y: 1.3, z: -0.8, scale: 0.85 },
};

function getTransformTarget(
  sectionId: ElevatedSectionId | null,
  scatterX: number,
  scatterY: number,
  scatterZ: number,
): { x: number; y: number; z: number; scale: number } {
  const { introProgress, isIntroActive, introHandoffProgress } =
    useFoldStore.getState();

  // Once fully in the main scene, delay identity return by 1500ms so sections
  // don't flash on-screen mid-transition while the spring is still settling.
  if (!isIntroActive && introHandoffProgress >= 1) {
    if (!_identityReadyAt) _identityReadyAt = Date.now();
    if (Date.now() - _identityReadyAt > 1500)
      return { x: 0, y: 0, z: 0, scale: 1 };
  } else {
    _identityReadyAt = 0;
  }

  const introT = easeInOut(clamp01(introProgress));
  const invT = isIntroActive ? Math.max(0, 1 - introT) : 0;

  let x = scatterX * invT;
  let y = scatterY * invT;
  let z = scatterZ * invT;
  let scale = 1;

  if (sectionId) {
    const handoffT = easeInOut(clamp01(introHandoffProgress));
    if (handoffT > 0) {
      const target = HANDOFF_SECTION_TARGET[sectionId];
      x += target.x * handoffT;
      y += target.y * handoffT;
      z += target.z * handoffT;
      scale -= (1 - target.scale) * handoffT;
    }
  }

  return { x, y, z, scale };
}

export function useIntroSectionOffset(sectionId: ElevatedSectionId | null) {
  const scatterX = sectionId ? INTRO_SECTION_SCATTER[sectionId][0] : 0;
  const scatterY = sectionId ? INTRO_SECTION_SCATTER[sectionId][1] : 0;
  const scatterZ = sectionId ? INTRO_SECTION_SCATTER[sectionId][2] : 0;
  const groupRef = useRef<Group>(null);

  const initial = getTransformTarget(sectionId, scatterX, scatterY, scatterZ);
  const liveX = useRef(initial.x);
  const liveY = useRef(initial.y);
  const liveZ = useRef(initial.z);
  const liveScale = useRef(initial.scale);

  useFrame((_, delta) => {
    const target = getTransformTarget(sectionId, scatterX, scatterY, scatterZ);

    const factor = Math.min(delta * 9, 1);
    liveX.current += (target.x - liveX.current) * factor;
    liveY.current += (target.y - liveY.current) * factor;
    liveZ.current += (target.z - liveZ.current) * factor;
    liveScale.current += (target.scale - liveScale.current) * factor;

    const g = groupRef.current;
    if (g) {
      g.position.x = liveX.current;
      g.position.y = liveY.current;
      g.position.z = liveZ.current;
      g.scale.setScalar(liveScale.current);
    }
  });

  return groupRef;
}
