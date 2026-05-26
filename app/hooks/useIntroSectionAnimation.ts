import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import type { ElevatedSectionId } from "../stores/useElevatedStore";

export const INTRO_SECTION_SCATTER: Record<
  ElevatedSectionId,
  [number, number, number, number?, number?, number?]
> = {
  s1: [0.92, -0.6, 2.04, 0.7, -0.81, -0.07], // x, y, z, rx, ry, rz
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
  scatterRx: number = 0,
  scatterRy: number = 0,
  scatterRz: number = 0,
  time: number = 0,
): {
  x: number;
  y: number;
  z: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
} {
  const { introProgress, isIntroActive, introHandoffProgress } =
    useFoldStore.getState();

  // Once fully in the main scene, delay identity return by 1500ms so sections
  // don't flash on-screen mid-transition while the spring is still settling.
  if (!isIntroActive && introHandoffProgress >= 1) {
    if (!_identityReadyAt) _identityReadyAt = Date.now();
    if (Date.now() - _identityReadyAt > 1500)
      return { x: 0, y: 0, z: 0, scale: 1, rx: 0, ry: 0, rz: 0 };
  } else {
    _identityReadyAt = 0;
  }

  const introT = easeInOut(clamp01(introProgress));
  const invT = isIntroActive ? Math.max(0, 1 - introT) : 0;

  let x = scatterX * invT;
  let y = scatterY * invT;
  let z = scatterZ * invT;
  let scale = 1;
  let rx = scatterRx * invT;
  let ry = scatterRy * invT;
  let rz = scatterRz * invT;

  if (sectionId) {
    const handoffT = easeInOut(clamp01(introHandoffProgress));
    if (handoffT > 0) {
      const target = HANDOFF_SECTION_TARGET[sectionId];
      x += target.x * handoffT;
      y += target.y * handoffT;
      z += target.z * handoffT;
      scale -= (1 - target.scale) * handoffT;
    }

    // Creative Highlight Effect at the "joined step"
    if (handoffT === 0 && introProgress >= 0.99) {
      const { activeAmbientMediaId, loopedAmbientMediaId } =
        useFoldStore.getState();
      const highlightedId = activeAmbientMediaId || loopedAmbientMediaId;

      if (highlightedId === sectionId) {
        z += 0.25; // Elevate towards camera
        // Add a very subtle breathing float (khalaqiat) - increased height
        y += -0.05 + Math.sin(time * 1.5) * 0.006;
        scale *= 1.06; // Scale up to emphasize
        // Add a tiny dynamic tilt
        rx -= -0.07 + Math.sin(time * 1.2) * 0.004;
        ry -= 0; // Slight pan for 3D feel
      }
    }
  }

  return { x, y, z, scale, rx, ry, rz };
}

export function useIntroSectionOffset(sectionId: ElevatedSectionId | null) {
  const scatterX = sectionId ? INTRO_SECTION_SCATTER[sectionId][0] : 0;
  const scatterY = sectionId ? INTRO_SECTION_SCATTER[sectionId][1] : 0;
  const scatterZ = sectionId ? INTRO_SECTION_SCATTER[sectionId][2] : 0;
  const scatterRx = sectionId ? INTRO_SECTION_SCATTER[sectionId][3] || 0 : 0;
  const scatterRy = sectionId ? INTRO_SECTION_SCATTER[sectionId][4] || 0 : 0;
  const scatterRz = sectionId ? INTRO_SECTION_SCATTER[sectionId][5] || 0 : 0;
  const groupRef = useRef<Group>(null);

  const initial = getTransformTarget(
    sectionId,
    scatterX,
    scatterY,
    scatterZ,
    scatterRx,
    scatterRy,
    scatterRz,
  );
  const liveX = useRef(initial.x);
  const liveY = useRef(initial.y);
  const liveZ = useRef(initial.z);
  const liveScale = useRef(initial.scale);
  const liveRx = useRef(initial.rx);
  const liveRy = useRef(initial.ry);
  const liveRz = useRef(initial.rz);

  useFrame((state, delta) => {
    const target = getTransformTarget(
      sectionId,
      scatterX,
      scatterY,
      scatterZ,
      scatterRx,
      scatterRy,
      scatterRz,
      state.clock.elapsedTime,
    );

    // Changed from 9 to 4.5 for a much softer (narm-tar) and premium transition
    const factor = Math.min(delta * 4.5, 1);
    liveX.current += (target.x - liveX.current) * factor;
    liveY.current += (target.y - liveY.current) * factor;
    liveZ.current += (target.z - liveZ.current) * factor;
    liveScale.current += (target.scale - liveScale.current) * factor;
    liveRx.current += (target.rx - liveRx.current) * factor;
    liveRy.current += (target.ry - liveRy.current) * factor;
    liveRz.current += (target.rz - liveRz.current) * factor;

    const g = groupRef.current;
    if (g) {
      g.position.x = liveX.current;
      g.position.y = liveY.current;
      g.position.z = liveZ.current;
      g.scale.setScalar(liveScale.current);
      g.rotation.set(liveRx.current, liveRy.current, liveRz.current);
    }
  });

  return groupRef;
}
