import { useRef, useEffect, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import type { ElevatedSectionId } from "../stores/useElevatedStore";
import { getActiveStoryConfig } from "../stores/useStoryStore";

// ─── Animation Config ───────────────────────────────────────────────────
// 1. When does the scale-up start? (Overall scroll percentage from 0 to 100)
//    - 15 is exactly when Page 2 (ambient media) formally begins.
//    - Decrease to 12 or 13 to make it start slightly earlier.
export const SCALE_START_PERCENT = 7;

// 2. How much bigger should they get? (0.35 means 35% bigger)
export const SCALE_EXTRA_AMOUNT = 0.15;

// 3. How fast does it scale up once it starts? (Higher = faster)
export const SCALE_UP_SPEED = 2.0;

// 4. How much higher on the screen should they move during Page 2? (Positive = up)
export const PAGE2_EXTRA_HEIGHT = 0.35;

// 5. How much should they tilt towards the camera during Page 2? (Tweak positive/negative to fix them looking "laid back")
export const PAGE2_EXTRA_RX = 0.15;

/** Convert degrees to radians — keeps scatter config human-readable. */
const deg = (d: number): number => (d * Math.PI) / 180;

// ─── Lazy ID accessors ────────────────────────────────────────────────────
// Section IDs are read lazily (at call-time) so module evaluation never
// crashes when the active config has fewer than 2 sections (e.g. Ayat al-Kursi).
// Intro is Alak-only, whose grid block is always "section1" and whose first
// group block is always "section2_g0" — same ids these always fell back to.
const getS1Id = (): string =>
  getActiveStoryConfig().blocks?.find((b: any) => b.type === "grid")?.id ??
  "section1";
const getS2Id = (): string => "section2";
const getS2TopId = (): string => `${getS2Id()}_g0`;
const getS2CenterId = (): string => `${getS2Id()}_g1`;
const getS2BotId = (): string => `${getS2Id()}_g2`;

/** Returns the four canonical ElevatedSectionIds for the current config. */
function getSessionIds(): ElevatedSectionId[] {
  return [
    getS1Id(),
    getS2TopId(),
    getS2CenterId(),
    getS2BotId(),
  ] as ElevatedSectionId[];
}

// ─── Scatter: [x, y, z, rx°, ry°, rz°] ─────────────────────────────────
// Built lazily per-call so keys always match the current config's section ids.
// Positive rx = tilt top away from camera ("lean back")
// Positive ry = rotate right edge towards camera
// Positive rz = counter-clockwise twist
function getIntroSectionScatter(): Record<
  ElevatedSectionId,
  [number, number, number, number?, number?, number?]
> {
  const s1 = getS1Id();
  const s2t = getS2TopId();
  const s2c = getS2CenterId();
  const s2b = getS2BotId();
  return {
    //     x      y      z      rx(°)    ry(°)    rz(°)
    [s1]: [0.82, -0.75, 2.04, deg(5), deg(-40), deg(-28)],
    [s2t]: [0, -0.6, -0.4],
    [s2c]: [0.06, -0.55, -1.2],
    [s2b]: [0, -0.63, 0.5],
  } as Record<
    ElevatedSectionId,
    [number, number, number, number?, number?, number?]
  >;
}

/** Public export kept for backwards compat — reads lazily. */
export const INTRO_SECTION_SCATTER = new Proxy(
  {} as Record<
    ElevatedSectionId,
    [number, number, number, number?, number?, number?]
  >,
  { get: (_t, key) => getIntroSectionScatter()[key as ElevatedSectionId] },
);

// ─── Idle breathing for s1 while scattered ──────────────────────────────
// Gives the floating section a living, gentle sway.
const S1_IDLE = {
  yAmp: 0.012, // 0.012, // how much it bobs up/down
  yFreq: 0.8, // bob speed (Hz-ish)
  rxAmp: 0.012, // deg(1.5), // subtle forward/back tilt oscillation
  rxFreq: 0.6,
  ryAmp: 0.012, // deg(2), // gentle left/right rotation
  ryFreq: 0.45,
  zAmp: 0.012, // forward/back bob
  zFreq: 0.35,
};

const easeInOut = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/** Set to true once all transforms have settled to identity.
 *  While true the single controller useFrame skips all work. */
let _isSettled = false;

function getHandoffSectionTarget(): Record<
  ElevatedSectionId,
  { x: number; y: number; z: number; scale: number }
> {
  const s1 = getS1Id();
  const s2t = getS2TopId();
  const s2c = getS2CenterId();
  const s2b = getS2BotId();
  return {
    [s1]: { x: 0, y: 0, z: 0, scale: 1 },
    [s2t]: { x: 0, y: 0.5, z: -0.5, scale: 0.85 },
    [s2c]: { x: 0, y: 0.8, z: -1.0, scale: 0.85 },
    [s2b]: { x: 0, y: 1.3, z: -1.5, scale: 0.85 },
  } as Record<
    ElevatedSectionId,
    { x: number; y: number; z: number; scale: number }
  >;
}

export const HANDOFF_SECTION_TARGET = new Proxy(
  {} as Record<
    ElevatedSectionId,
    { x: number; y: number; z: number; scale: number }
  >,
  { get: (_t, key) => getHandoffSectionTarget()[key as ElevatedSectionId] },
);

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

// ─── Module-level mutable stores (keyed by section id, populated lazily) ──
/** Current lerped transform for each section. Read by all useIntroSectionOffset consumers. */
const _liveTransforms: Record<string, Transform7> = {};

/** Group refs registered by consumers — the controller applies transforms to all of them. */
const _registeredGroups: Record<string, Set<RefObject<Group | null>>> = {};

// Flush stale references to prevent memory leaks
export function cleanupIntroAnimations() {
  for (const key in _liveTransforms) delete _liveTransforms[key];
  for (const key in _registeredGroups) {
    _registeredGroups[key].clear();
    delete _registeredGroups[key];
  }
}

/** Ensure entries exist for all current session section ids. */
function ensureSessionEntries() {
  for (const sid of getSessionIds()) {
    if (!_liveTransforms[sid]) _liveTransforms[sid] = { ...IDENTITY };
    if (!_registeredGroups[sid]) _registeredGroups[sid] = new Set();
  }
}

let _identityReadyAt = 0;

// ─── Target computation (called 4× per frame by the single controller) ─────
function getTransformTarget(
  sectionId: ElevatedSectionId,
  time: number,
): Transform7 {
  const scatter = getIntroSectionScatter()[sectionId];
  if (!scatter) return IDENTITY;
  const scatterX = scatter[0];
  const scatterY = scatter[1];
  const scatterZ = scatter[2];
  const scatterRx = scatter[3] || 0;
  const scatterRy = scatter[4] || 0;
  const scatterRz = scatter[5] || 0;

  const {
    introProgress,
    isIntroActive,
    introHandoffProgress,
    ambientProgress,
    rawOffset,
  } = useFoldStore.getState();

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
  let rz = scatterRz * invT;

  // ── s1 idle breathing while scattered ──
  if (sectionId === getS1Id() && invT > 0.01) {
    const breathe = invT; // fade breathing out as section converges
    y += Math.sin(time * S1_IDLE.yFreq) * S1_IDLE.yAmp * breathe;
    rx += Math.sin(time * S1_IDLE.rxFreq) * S1_IDLE.rxAmp * breathe;
    ry += Math.sin(time * S1_IDLE.ryFreq) * S1_IDLE.ryAmp * breathe;
    z += Math.sin(time * S1_IDLE.zFreq) * S1_IDLE.zAmp * breathe;
  }

  // Mid-transition scale bulge during Page 2 (Ambient Phase)
  // Get big and stay big, immediately get small at Page 3
  if (isIntroActive && introHandoffProgress < 1) {
    let animProgress = 0;

    // 1. Scale UP based on overall scroll percentage
    const startOffset = SCALE_START_PERCENT / 100;
    if (rawOffset >= startOffset) {
      // Calculate how far past the start point we have scrolled
      const progressSinceStart = rawOffset - startOffset;
      // Multiply by 20 so it reaches full size in just 5% of scroll (adjusted by speed)
      const upT = clamp01(progressSinceStart * SCALE_UP_SPEED * 20);
      animProgress = easeInOut(upT);
    }

    // 2. Scale DOWN immediately as Page 3 (handoff) starts
    if (introHandoffProgress > 0) {
      const downT = clamp01(introHandoffProgress * 3); // Finishes scaling down quickly
      animProgress *= 1 - easeInOut(downT);
    }

    scale += animProgress * SCALE_EXTRA_AMOUNT;
    y += animProgress * PAGE2_EXTRA_HEIGHT;
    rx += animProgress * PAGE2_EXTRA_RX;
  }

  const clampedHandoff = clamp01(introHandoffProgress);
  const handoffT = easeInOut(clampedHandoff);
  if (handoffT > 0) {
    const target = getHandoffSectionTarget()[sectionId];
    if (target) {
      x += target.x * handoffT;
      y += target.y * handoffT;
      z += target.z * handoffT;
      scale -= (1 - target.scale) * handoffT;
    }
  }

  // Creative Highlight Effect at the "joined step"
  if (handoffT === 0 && (ambientProgress > 0 || introProgress >= 0.99)) {
    const { activeAmbientMediaId, scrollAmbientMediaId } =
      useFoldStore.getState();
    const highlightedId = activeAmbientMediaId || scrollAmbientMediaId;

    const isActive =
      highlightedId === sectionId ||
      (highlightedId && highlightedId.startsWith(`${sectionId}_step`));
    if (isActive) {
      z += 0.25 + Math.sin(time * 1.5) * 0.03; // Added Z-axis floating animation
      y += -0.05 + Math.sin(time * 1.5) * 0.006; // Reverted to original
      scale *= 1.06;
      rx -= -0.07 + Math.sin(time * 1.2) * 0.004; // Reverted to original
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
    // Skip all intro animation work for Surahs that have no intro.
    const hasIntro = getActiveStoryConfig().features.hasIntro;
    if (!hasIntro) return;

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

    ensureSessionEntries();

    const time = state.clock.elapsedTime;
    // Softer (narm-tar) lerp for a premium transition feel
    const factor = Math.min(delta * 4.5, 1);
    let allIdentity = true;
    const { isIntroActive, introHandoffProgress } = useFoldStore.getState();
    // When target is identity (handoff complete), snap live values instead of
    // slow lerp so the crossfade starts with positions exactly matching paper.
    const shouldSnap = !isIntroActive && introHandoffProgress >= 1;

    const currentIds = getSessionIds();
    for (let i = 0; i < currentIds.length; i++) {
      const sid = currentIds[i];
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
      if (groups) {
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

    if (!_registeredGroups[sectionId]) {
      _registeredGroups[sectionId] = new Set();
    }

    // Register this group ref so the controller can write transforms to it
    _registeredGroups[sectionId].add(groupRef);

    if (!_liveTransforms[sectionId]) {
      _liveTransforms[sectionId] = { ...IDENTITY };
    }

    // Apply initial transform immediately (don't wait for first frame)
    const live = _liveTransforms[sectionId];
    const g = groupRef.current;
    if (g) {
      g.position.set(live.x, live.y, live.z);
      g.scale.setScalar(live.scale);
      g.rotation.set(live.rx, live.ry, live.rz);
    }

    return () => {
      _registeredGroups[sectionId]?.delete(groupRef);
    };
  }, [sectionId]);

  return groupRef;
}
