import { useRef, useEffect, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import type { ElevatedSectionId } from "../stores/useElevatedStore";

export const INTRO_SECTION_SCATTER: Record<
  ElevatedSectionId,
  [number, number, number, number?, number?, number?]
> = {
  s1: [0.92, -0.65, 2.04, 0.7, -0.81, -0.07], // x, y, z, rx, ry, rz
  s2_top: [0, -0.6, -0.4],
  s2_center: [0.06, -0.55, -1.2],
  s2_bottom: [0, -0.63, 0.5],
};

const easeInOut = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/** Set to true once all transforms have settled to identity.
 *  While true the single controller useFrame skips all work. */
let _isSettled = false;

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

// ─── Types ───────────────────────────────────────────────────────────────
interface Transform7 {
  x: number;
  y: number;
  z: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
}

const IDENTITY: Transform7 = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  rx: 0,
  ry: 0,
  rz: 0,
};

// ─── Module-level pre-computed results (written once per frame by controller) ─
const ALL_SECTION_IDS: ElevatedSectionId[] = [
  "s1",
  "s2_top",
  "s2_center",
  "s2_bottom",
];

/** Current lerped transform for each section. Read by all useIntroSectionOffset consumers. */
const _liveTransforms: Record<ElevatedSectionId, Transform7> = {
  s1: { ...IDENTITY },
  s2_top: { ...IDENTITY },
  s2_center: { ...IDENTITY },
  s2_bottom: { ...IDENTITY },
};

/** Group refs registered by consumers — the controller applies transforms to all of them. */
const _registeredGroups: Record<
  ElevatedSectionId,
  Set<RefObject<Group | null>>
> = {
  s1: new Set(),
  s2_top: new Set(),
  s2_center: new Set(),
  s2_bottom: new Set(),
};

let _identityReadyAt = 0;

// ─── Target computation (called 4× per frame by the single controller) ─────
function getTransformTarget(
  sectionId: ElevatedSectionId,
  time: number,
): Transform7 {
  const scatter = INTRO_SECTION_SCATTER[sectionId];
  const scatterX = scatter[0];
  const scatterY = scatter[1];
  const scatterZ = scatter[2];
  const scatterRx = scatter[3] || 0;
  const scatterRy = scatter[4] || 0;
  const scatterRz = scatter[5] || 0;

  const { introProgress, isIntroActive, introHandoffProgress } =
    useFoldStore.getState();

  // Once fully in the main scene, delay identity return by 1500ms so sections
  // don't flash on-screen mid-transition while the VerseController springs are fading them out.
  // This keeps S2 sections safely hidden behind S1 until they are fully invisible.
  if (!isIntroActive && introHandoffProgress >= 1) {
    if (!_identityReadyAt) _identityReadyAt = Date.now();
    if (Date.now() - _identityReadyAt > 1500) {
      return IDENTITY;
    }
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
  const rz = scatterRz * invT;

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
      y += -0.05 + Math.sin(time * 1.5) * 0.006;
      scale *= 1.06;
      rx -= -0.07 + Math.sin(time * 1.2) * 0.004;
      ry -= 0;
    }
  }

  return { x, y, z, scale, rx, ry, rz };
}

// ─── Single controller component (mount ONCE in the Canvas tree) ──────────
/**
 * Place `<IntroSectionAnimationController />` once inside the R3F Canvas.
 * It replaces the ~28 individual useFrame callbacks with a single one that
 * computes 4 section transforms, lerps them, and writes to all registered groups.
 */
export function IntroSectionAnimationController() {
  useFrame((state, delta) => {
    // Early exit: once settled, skip all work permanently until intro restarts.
    if (_isSettled) {
      // Check if intro reactivated (user scrolled back up)
      const { isIntroActive } = useFoldStore.getState();
      if (isIntroActive) {
        _isSettled = false;
      } else {
        return;
      }
    }

    const time = state.clock.elapsedTime;
    // Softer (narm-tar) lerp for a premium transition feel
    const factor = Math.min(delta * 4.5, 1);
    let allIdentity = true;
    const { isIntroActive, introHandoffProgress } = useFoldStore.getState();
    // When target is identity (handoff complete), snap live values instead of
    // slow lerp so the crossfade starts with positions exactly matching paper.
    const shouldSnap = !isIntroActive && introHandoffProgress >= 1;

    for (let i = 0; i < ALL_SECTION_IDS.length; i++) {
      const sid = ALL_SECTION_IDS[i];
      const target = getTransformTarget(sid, time);
      const live = _liveTransforms[sid];

      if (shouldSnap) {
        // Snap to identity immediately — no lingering lerp
        live.x = target.x;
        live.y = target.y;
        live.z = target.z;
        live.scale = target.scale;
        live.rx = target.rx;
        live.ry = target.ry;
        live.rz = target.rz;
      } else {
        // Smooth lerp during the intro/handoff scroll
        live.x += (target.x - live.x) * factor;
        live.y += (target.y - live.y) * factor;
        live.z += (target.z - live.z) * factor;
        live.scale += (target.scale - live.scale) * factor;
        live.rx += (target.rx - live.rx) * factor;
        live.ry += (target.ry - live.ry) * factor;
        live.rz += (target.rz - live.rz) * factor;
      }

      // Check if this section is at identity (within relaxed epsilon)
      if (
        Math.abs(live.x) > 0.001 ||
        Math.abs(live.y) > 0.001 ||
        Math.abs(live.z) > 0.001 ||
        Math.abs(live.scale - 1) > 0.001 ||
        Math.abs(live.rx) > 0.001 ||
        Math.abs(live.ry) > 0.001 ||
        Math.abs(live.rz) > 0.001
      ) {
        allIdentity = false;
      }

      // Apply to all registered groups for this section
      const groups = _registeredGroups[sid];
      groups.forEach((ref) => {
        const g = ref.current;
        if (g) {
          g.position.x = live.x;
          g.position.y = live.y;
          g.position.z = live.z;
          g.scale.setScalar(live.scale);
          g.rotation.set(live.rx, live.ry, live.rz);
        }
      });
    }

    // Mark settled once all sections are at identity and handoff is complete.
    if (allIdentity && shouldSnap) {
      _isSettled = true;
    }
  });

  return null;
}

// ─── Lightweight consumer hook (NO useFrame) ──────────────────────────────
/**
 * Returns a ref to attach to a `<group>`. The centralized controller will
 * automatically apply the correct intro transform to this group each frame.
 *
 * This replaces the old per-instance useFrame pattern. Zero per-frame cost
 * per consumer — all work is done in the single IntroSectionAnimationController.
 */
export function useIntroSectionOffset(sectionId: ElevatedSectionId | null) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!sectionId) return;

    // Register this group ref so the controller can write transforms to it
    _registeredGroups[sectionId].add(groupRef);

    // Apply initial transform immediately (don't wait for first frame)
    const live = _liveTransforms[sectionId];
    const g = groupRef.current;
    if (g) {
      g.position.set(live.x, live.y, live.z);
      g.scale.setScalar(live.scale);
      g.rotation.set(live.rx, live.ry, live.rz);
    }

    return () => {
      _registeredGroups[sectionId].delete(groupRef);
    };
  }, [sectionId]);

  return groupRef;
}
