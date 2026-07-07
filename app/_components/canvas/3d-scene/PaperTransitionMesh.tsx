"use client";

/**
 * PaperTransitionMesh — the animated page-turn choreography.
 *
 * Two cooperating pieces, both driven by usePaperStore's transitionPhase:
 *
 * ── TransitionSheet ("exit" phase) ──────────────────────────────────────────
 * A FLAT clone of the outgoing paper that shares the live paper's material
 * (same shader, same masking, same normal map — pixel-perfect, zero copy).
 * Unlike the real paper (whose bones fold around HORIZONTAL crease lines),
 * the sheet is rigged with a bone chain along the WIDTH, hinged at the
 * trailing edge — so it bends around a VERTICAL axis like a real page being
 * turned, with the curvature concentrated toward the leading edge. It never
 * interacts with fold crease lines: the choreography flattens the real paper
 * first ("flatten" phase), then hands off to this sheet.
 *
 * Direction: next → slides LEFT (leading edge curling inward toward the
 * viewer); previous → mirrored to the RIGHT.
 *
 * ── PaperSlideGroup (wraps the real scene content) ──────────────────────────
 * Visible during "flatten" (the real paper smoothly unfolds in place),
 * hidden during "exit", parked OFF-SCREEN during "waiting" (the freshly
 * swapped content renders there: shaders compile and the RenderTexture draws
 * out of sight — no white frame can ever be seen), and glides in during
 * "enter". The waiting→enter handoff is an ADAPTIVE gate: it requires both a
 * frame count and a minimum time, so slower devices automatically hold the
 * paper off-screen a little longer instead of showing half-drawn content.
 *
 * Per-frame cost: one extra skinned mesh during the exit + simple group
 * transforms — no React state, no springs, zero allocations.
 */

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Bone,
  BoxGeometry,
  Float32BufferAttribute,
  Group,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
} from "three";
import {
  usePaperStore,
  getActiveTransitionCapture,
  type PaperTransitionPhase,
} from "../../../stores/usePaperStore";
import { PAGE_DEPTH } from "./SinglePaper";
import { PAGE_BG_COLOR } from "../../../data/theme";
import type { PaperTransitionCapture } from "./paperSnapshot";

// ── Exit timeline ───────────────────────────────────────────────────────────
/** Two frames of hold so the sheet↔paper handoff commit fully settles. */
const EXIT_WARMUP_FRAMES = 2;
/** Slow, deliberate exit — the curl is worth watching. */
const EXIT_DURATION_S = 1.7;
/** Bone segments across the sheet's width (vertical-axis bend resolution). */
const SHEET_SEGMENTS = 48;
/** Total curl (radians) accumulated across the curl zone at its peak. */
const CURL_MAX = 2.2;
/** Curl ramps in across this window of the timeline, then holds. */
const CURL_RISE_START = 0.04;
const CURL_RISE_END = 0.45;
/**
 * Flip to -1 to curl the leading edge AWAY from the viewer instead of
 * inward toward the viewer.
 */
const CURL_TOWARD_VIEWER = 1;
/** Subtle whole-sheet tilt while flying (radians) — natural paper feel. */
const EXIT_TILT_Z = 0.035;
/** Gentle lift toward the camera + upward drift at mid-flight. */
const EXIT_LIFT_Z = 0.12;
const EXIT_RISE_Y = 0.06;
/** Past this point the sheet is guaranteed off-screen → run the swap. */
const EXIT_HANDOFF_T = 0.93;
/** Keeps the sheet off the real paper's surface (no z-fighting). */
const SHEET_Z_EPSILON = 0.004;

// ── Waiting gate + enter glide ──────────────────────────────────────────────
/**
 * Adaptive warm-up gate: BOTH conditions must pass before the new paper may
 * enter. Frames adapt to device speed (a struggling GPU ticks fewer frames,
 * extending the hold automatically); the time floor guarantees the content
 * buffers have had real wall-clock time to draw.
 */
const ENTER_GATE_FRAMES = 14;
const ENTER_GATE_S = 0.3;
const ENTER_DURATION_S = 1.0;
/** Extra world-units past the half-viewport to guarantee "fully off-screen". */
const OFFSCREEN_MARGIN = 3;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─────────────────────────────────────────────────────────────────────────────
// TransitionSheet — the flying copy of the outgoing paper
// ─────────────────────────────────────────────────────────────────────────────

interface TransitionRig {
  mesh: SkinnedMesh;
  /** Local X of the hinge (trailing edge) relative to the page center. */
  hingeOffsetX: number;
  dispose: () => void;
}

/**
 * Build a flat sheet rigged along its WIDTH: bone 0 sits at the trailing
 * edge (opposite the slide direction) and the chain extends to the leading
 * edge, so rotating bones around Y bends the page around a vertical axis —
 * a clean book-like curl with zero relation to the fold crease lines.
 */
function buildTransitionRig(
  capture: PaperTransitionCapture,
  direction: 1 | -1,
): TransitionRig {
  const { pageWidth, pageHeight } = capture;

  const geometry = new BoxGeometry(
    pageWidth,
    pageHeight,
    PAGE_DEPTH,
    SHEET_SEGMENTS,
    2,
  );
  // Hinge (trailing edge) at local x=0; the sheet extends toward -direction,
  // i.e. toward where it is about to travel.
  geometry.translate(-direction * (pageWidth / 2), 0, 0);

  // Skin weights by distance from the hinge along the width.
  const position = geometry.attributes.position;
  const segmentWidth = pageWidth / SHEET_SEGMENTS;
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const distFromHinge = Math.min(Math.abs(position.getX(i)), pageWidth);
    let skinIndex = Math.floor(distFromHinge / segmentWidth);
    skinIndex = Math.max(0, Math.min(skinIndex, SHEET_SEGMENTS - 1));
    const skinWeight = (distFromHinge % segmentWidth) / segmentWidth;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  geometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4),
  );

  // Same slot layout as SinglePaper: [sideL, sideR, top, bottom, front, back].
  const sideMaterial = new MeshStandardMaterial({ color: PAGE_BG_COLOR });
  const backMaterial = new MeshBasicMaterial({ color: "#ffffff" });
  const materials: Material[] = [
    sideMaterial,
    sideMaterial,
    sideMaterial,
    sideMaterial,
    capture.material,
    backMaterial,
  ];

  const bones: Bone[] = [];
  for (let i = 0; i <= SHEET_SEGMENTS; i++) {
    const bone = new Bone();
    bone.position.x = i === 0 ? 0 : -direction * segmentWidth;
    if (i > 0) bones[i - 1].add(bone);
    bones.push(bone);
  }
  const skeleton = new Skeleton(bones);

  const mesh = new SkinnedMesh(geometry, materials);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.add(bones[0]);
  mesh.bind(skeleton);

  return {
    mesh,
    hingeOffsetX: direction * (pageWidth / 2),
    dispose: () => {
      geometry.dispose();
      sideMaterial.dispose();
      backMaterial.dispose();
      // capture.material is the live paper's — owned by the scene content.
    },
  };
}

export function PaperTransitionLayer() {
  const transitionPhase = usePaperStore((s) => s.transitionPhase);
  if (transitionPhase !== "exit") return null;

  const capture = getActiveTransitionCapture();
  if (!capture) return null;

  return <TransitionSheet capture={capture} />;
}

interface TransitionSheetProps {
  capture: PaperTransitionCapture;
}

function TransitionSheet({ capture }: TransitionSheetProps) {
  const groupRef = useRef<Group>(null);
  const rigRef = useRef<TransitionRig | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const warmupFramesRef = useRef(0);
  const elapsedRef = useRef(0);
  const handoffFiredRef = useRef(false);

  // Layout effect (not passive) so the sheet is attached BEFORE the browser
  // paints the handoff commit — the real paper is hidden and replaced by
  // this sheet with no blank frame in between.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const direction = usePaperStore.getState().transitionDirection;
    const rig = buildTransitionRig(capture, direction);
    rigRef.current = rig;
    directionRef.current = direction;
    warmupFramesRef.current = 0;
    elapsedRef.current = 0;
    handoffFiredRef.current = false;

    // Place the hinge so the sheet exactly overlays the real page, vertically
    // centered like SinglePaper's mesh (its geometry hangs from y=0).
    group.position.set(
      rig.hingeOffsetX,
      capture.sceneCenterY - capture.pageHeight / 2,
      SHEET_Z_EPSILON,
    );
    group.rotation.set(0, 0, 0);
    group.add(rig.mesh);

    return () => {
      rigRef.current = null;
      group.remove(rig.mesh);
      rig.dispose();
    };
  }, [capture]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const rig = rigRef.current;
    if (!group || !rig) return;

    // Hold briefly so the handoff commit settles before motion starts.
    if (warmupFramesRef.current < EXIT_WARMUP_FRAMES) {
      warmupFramesRef.current += 1;
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(elapsedRef.current / EXIT_DURATION_S, 1);
    const direction = directionRef.current;
    const bones = rig.mesh.skeleton.bones;

    // Vertical-axis curl, concentrated toward the leading edge (p² ramp):
    // per-bone deltas sum to curlTotal, so the page bows like a turned page
    // instead of the whole sheet hinging.
    const curlTotal =
      CURL_MAX *
      easeOutCubic(
        clamp01((t - CURL_RISE_START) / (CURL_RISE_END - CURL_RISE_START)),
      );
    for (let i = 0; i < bones.length; i++) {
      const p = i / SHEET_SEGMENTS;
      const perBone = (curlTotal / SHEET_SEGMENTS) * 3 * p * p;
      bones[i].rotation.y = CURL_TOWARD_VIEWER * direction * perBone;
    }

    // Horizontal slide out of the viewport: next → LEFT, previous → RIGHT.
    const slideDistance =
      state.viewport.width / 2 + capture.pageWidth + OFFSCREEN_MARGIN;
    group.position.x =
      rig.hingeOffsetX - direction * slideDistance * easeInOutCubic(t);

    // Natural paper touches: a soft tilt, a slight rise and a gentle lift.
    const arc = Math.sin(Math.PI * clamp01(t * 1.05));
    group.rotation.z = direction * EXIT_TILT_Z * arc;
    group.position.y =
      capture.sceneCenterY - capture.pageHeight / 2 + EXIT_RISE_Y * arc;
    group.position.z = SHEET_Z_EPSILON + EXIT_LIFT_Z * arc;

    // Off-screen → hand off to the in-place swap (runs on a static screen).
    if (t >= EXIT_HANDOFF_T && !handoffFiredRef.current) {
      handoffFiredRef.current = true;
      usePaperStore.getState().exitFinished();
    }
  });

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// PaperSlideGroup — phase-driven wrapper around the real scene content
// ─────────────────────────────────────────────────────────────────────────────

interface PaperSlideGroupProps {
  children: ReactNode;
}

export function PaperSlideGroup({ children }: PaperSlideGroupProps) {
  const groupRef = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);
  const appliedPhaseRef = useRef<PaperTransitionPhase | null>(null);
  const enterFromRef = useRef(0);
  const enterElapsedRef = useRef(0);
  const gateFramesRef = useRef(0);
  const gateElapsedRef = useRef(0);

  const applyPhase = (phase: PaperTransitionPhase, group: Group) => {
    if (appliedPhaseRef.current === phase) return;
    appliedPhaseRef.current = phase;

    switch (phase) {
      case "flatten":
        // The real paper is unfolding in place — fully visible.
        group.visible = true;
        group.position.x = 0;
        break;
      case "exit":
        // The transition sheet (an exact visual stand-in) took over.
        group.visible = false;
        break;
      case "waiting": {
        // Freshly swapped content: park it fully off-screen on the incoming
        // side. It still renders there (nothing is frustum-culled), so its
        // shaders compile and its texture draws without ever being seen.
        const direction = usePaperStore.getState().transitionDirection;
        enterFromRef.current =
          direction * (viewport.width / 2 + OFFSCREEN_MARGIN + 2);
        gateFramesRef.current = 0;
        gateElapsedRef.current = 0;
        group.visible = true;
        group.position.x = enterFromRef.current;
        break;
      }
      case "enter":
        enterElapsedRef.current = 0;
        break;
      default:
        group.visible = true;
        group.position.x = 0;
    }
  };

  // Position the group correctly BEFORE the first paint after a mount — on
  // route load the phase is "idle"; if a hot-reload lands mid-switch the
  // group must still start in a consistent pose.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (group) applyPhase(usePaperStore.getState().transitionPhase, group);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const store = usePaperStore.getState();
    const phase = store.transitionPhase;
    applyPhase(phase, group);

    if (phase === "waiting") {
      // Adaptive warm-up gate — see constants above.
      gateFramesRef.current += 1;
      gateElapsedRef.current += Math.min(delta, 0.1);
      if (
        gateFramesRef.current >= ENTER_GATE_FRAMES &&
        gateElapsedRef.current >= ENTER_GATE_S
      ) {
        store.beginEnter();
      }
      return;
    }

    if (phase === "enter") {
      enterElapsedRef.current += Math.min(delta, 0.05);
      const t = Math.min(enterElapsedRef.current / ENTER_DURATION_S, 1);
      group.position.x = enterFromRef.current * (1 - easeInOutCubic(t));

      if (t >= 1) {
        group.position.x = 0;
        store.enterFinished();
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
