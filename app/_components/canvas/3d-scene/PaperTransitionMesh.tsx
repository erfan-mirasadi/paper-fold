"use client";

/**
 * PaperTransitionMesh — the truth-gated page-turn choreography.
 *
 * Loading and animating NEVER overlap. During usePaperStore's "loading"
 * phase, a FROZEN sheet (an independent GPU-texture copy of the outgoing
 * page, holding whatever fold pose it had at click time) sits completely
 * still in the paper's exact former position — zero per-frame work beyond a
 * static draw call, so it can never compete with the new paper's settling
 * for frame budget. Only once the new paper's true "settled" signal arrives
 * does "animating" begin, and the ENTIRE choreography (unfold → curl-exit →
 * enter-glide) plays once, back to back, uninterrupted:
 *
 * ── FlattenSheet (sheetStage "flatten") ──────────────────────────────────────
 * Own vertical bone rig, identical to SinglePaper's own fold rig. Frozen at
 * the captured pose while phase is "loading"; the instant phase becomes
 * "animating" it starts unfolding to flat on its own clock. On completion it
 * reports done — the store flips sheetStage to "curl", and since both sheets
 * show an identical flat page at that instant, the React `key` swap is
 * imperceptible.
 *
 * ── CurlSheet (sheetStage "curl") ────────────────────────────────────────────
 * Rigged along the WIDTH (hinged at the trailing edge) so it bends around a
 * VERTICAL axis like a real turned page, curvature concentrated toward the
 * leading edge. Frozen until phase is "animating" (this covers BOTH "still
 * waiting on the flatten sheet" and "not yet ready" cases), then curls and
 * slides fully out.
 *
 * ── PaperSlideGroup (wraps the real scene content) ──────────────────────────
 * Parked off-screen for the entire "loading" phase AND for as long as
 * "animating" is still on the flatten stage — so it only starts gliding in
 * the instant the curl sheet does, keeping the crossing perfectly
 * synchronized ("old leaves, new immediately takes its place").
 *
 * Per-frame cost while frozen: nothing (bones are set once and never
 * touched again). While animating: one skinned mesh + simple group
 * transforms — no React state, no springs, zero steady-state allocations.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Bone,
  BoxGeometry,
  DataTexture,
  Float32BufferAttribute,
  Group,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  UnsignedByteType,
  Vector2,
} from "three";
import {
  usePaperStore,
  getActiveTransitionCapture,
} from "../../../stores/usePaperStore";
import { createPanelGeometry, PAGE_DEPTH, PAGE_SEGMENTS } from "./SinglePaper";
import { PAPER_MATERIAL_CONFIG } from "./PaperMaterial";
import { PAGE_BG_COLOR } from "../../../data/theme";
import type { PaperTransitionCapture } from "./paperSnapshot";

// ── Flatten sheet timeline (plays only after "animating" begins) ───────────
/** A calm, natural-paced unfold — no longer needs to "buy" loading time. */
const FLATTEN_DURATION_S = 0.9;

// ── Curl sheet timeline ─────────────────────────────────────────────────────
/** Slowed down for a smoother, more deliberate feel. */
const EXIT_DURATION_S = 1.6;
/** Bone segments across the sheet's width (vertical-axis bend resolution). */
const SHEET_SEGMENTS = 48;
/** Total curl (radians) accumulated across the chain at its peak. */
const CURL_MAX = 2.2;
/** Curl ramps in across this window of the timeline, then holds. */
const CURL_RISE_START = 0.04;
const CURL_RISE_END = 0.42;
/** Flip to -1 to curl the leading edge AWAY from the viewer. */
const CURL_TOWARD_VIEWER = 1;
/** Subtle whole-sheet tilt while flying (radians) — natural paper feel. */
const EXIT_TILT_Z = 0.035;
/** Gentle lift toward the camera + upward drift at mid-flight. */
const EXIT_LIFT_Z = 0.12;
const EXIT_RISE_Y = 0.06;
/** Matches the live paper's enabled normal scale (PaperMaterial). */
const SHEET_NORMAL_SCALE = new Vector2(1.2, 1.2);
/** Keeps sheets off the incoming paper's plane (no z-fighting). */
const SHEET_Z_EPSILON = 0.004;

// ── Enter glide (real content) ──────────────────────────────────────────────
/** Matches EXIT_DURATION_S so the crossing motion starts AND ends together. */
const ENTER_DURATION_S = 1.6;
/** Extra world-units past the half-viewport to guarantee "fully off-screen". */
const OFFSCREEN_MARGIN = 3;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function buildSheetMaterials(capture: PaperTransitionCapture): Material[] {
  const sideMaterial = new MeshStandardMaterial({ color: PAGE_BG_COLOR });
  const backMaterial = new MeshBasicMaterial({ color: "#ffffff" });
  const frontMaterial = new MeshStandardMaterial({
    ...PAPER_MATERIAL_CONFIG,
    map: capture.mapCopy,
    normalMap: capture.normalCopy,
    normalScale: capture.normalCopy
      ? SHEET_NORMAL_SCALE.clone()
      : new Vector2(0, 0),
  });
  // Same slot layout as SinglePaper: [sideL, sideR, top, bottom, front, back].
  return [
    sideMaterial,
    sideMaterial,
    sideMaterial,
    sideMaterial,
    frontMaterial,
    backMaterial,
  ];
}

function disposeSheetMaterials(materials: Material[]): void {
  new Set(materials).forEach((m) => m.dispose());
}

// ─────────────────────────────────────────────────────────────────────────────
// TransitionShaderWarmup — precompiles the sheets' shader ahead of any switch
// ─────────────────────────────────────────────────────────────────────────────
//
// The sheet's front material is a PLAIN MeshStandardMaterial (map + normalMap,
// no onBeforeCompile) — a DIFFERENT shader permutation from the live paper's
// material (which always carries usePaperMasking's injected onBeforeCompile
// GLSL). The very first time that plain permutation is ever drawn, three.js
// has to compile it from scratch, which can stall the main thread for
// hundreds of milliseconds — exactly the "everything freezes and flashes
// black for a moment, only on the very first switch" symptom. Mounting one
// invisible mesh with the SAME material shape and precompiling it with
// gl.compileAsync (the same technique Experience already uses for the intro
// flow) warms that shader before the user ever triggers a real switch, so
// the first real switch is exactly as fast as every later one.

function TransitionShaderWarmup() {
  const { gl, scene, camera } = useThree();
  const warmedRef = useRef(false);

  const warmupTexture = useMemo(() => {
    const texture = new DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
      RGBAFormat,
      UnsignedByteType,
    );
    texture.needsUpdate = true;
    return texture;
  }, []);

  const warmupMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        ...PAPER_MATERIAL_CONFIG,
        map: warmupTexture,
        normalMap: warmupTexture,
        normalScale: SHEET_NORMAL_SCALE.clone(),
      }),
    [warmupTexture],
  );

  useEffect(() => {
    return () => {
      warmupTexture.dispose();
      warmupMaterial.dispose();
    };
  }, [warmupTexture, warmupMaterial]);

  useEffect(() => {
    if (warmedRef.current) return;
    // A short delay mirrors Experience's own intro-shader warmup — gives the
    // main thread a moment of breathing room right after the paper settles,
    // instead of compiling right on top of that other work.
    const timer = setTimeout(() => {
      warmedRef.current = true;
      gl.compileAsync(scene, camera).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [gl, scene, camera]);

  // scene.traverse() (which compile()/compileAsync() use to find materials)
  // does not skip invisible objects — only the renderer's actual draw calls
  // do. So this mesh's shader gets warmed up while never being drawn.
  return (
    <mesh visible={false} frustumCulled={false}>
      <planeGeometry args={[0.01, 0.01]} />
      <primitive object={warmupMaterial} attach="material" />
    </mesh>
  );
}

export { TransitionShaderWarmup };

// ─────────────────────────────────────────────────────────────────────────────
// FlattenSheet — frozen during "loading", unfolds only during "animating"
// ─────────────────────────────────────────────────────────────────────────────

interface FlattenRig {
  mesh: SkinnedMesh;
  dispose: () => void;
}

/** Mirrors SinglePaper's own vertical fold rig exactly (same helper functions). */
function buildFlattenRig(capture: PaperTransitionCapture): FlattenRig {
  const { pageWidth, pageHeight } = capture;
  const geometry = createPanelGeometry(
    pageWidth,
    pageHeight,
    pageWidth,
    pageHeight,
    0,
    0,
  );
  const materials = buildSheetMaterials(capture);

  const globalSegmentHeight = pageHeight / PAGE_SEGMENTS;
  const bones: Bone[] = [];
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const bone = new Bone();
    bones.push(bone);
    bone.position.y = i === 0 ? 0 : -globalSegmentHeight;
    if (i > 0) bones[i - 1].add(bone);
  }
  const skeleton = new Skeleton(bones);

  const mesh = new SkinnedMesh(geometry, materials);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.add(bones[0]);
  mesh.bind(skeleton);

  // Frozen starting pose — exactly what the live paper looked like at the
  // moment of capture. Stays untouched until "animating" begins.
  for (let i = 0; i < bones.length; i++) {
    bones[i].rotation.x = capture.boneRotations[i] ?? 0;
  }

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      disposeSheetMaterials(materials);
    },
  };
}

function FlattenSheet({ capture }: { capture: PaperTransitionCapture }) {
  const groupRef = useRef<Group>(null);
  const rigRef = useRef<FlattenRig | null>(null);
  const elapsedRef = useRef(0);
  const reportedDoneRef = useRef(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const rig = buildFlattenRig(capture);
    rigRef.current = rig;
    elapsedRef.current = 0;
    reportedDoneRef.current = false;

    // SinglePaper's own group sits at [0, SCENE_CENTER_Y, 0] with the panel
    // geometry itself already translated by createPanelGeometry — mirror
    // that exactly so this sheet exactly overlays the real page.
    group.position.set(0, capture.sceneCenterY, SHEET_Z_EPSILON);
    group.add(rig.mesh);

    return () => {
      rigRef.current = null;
      group.remove(rig.mesh);
      rig.dispose();
    };
  }, [capture]);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    if (!rig || reportedDoneRef.current) return;

    // Frozen while "loading" — no per-frame work at all beyond this check.
    if (usePaperStore.getState().transitionPhase !== "animating") return;

    elapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(elapsedRef.current / FLATTEN_DURATION_S, 1);
    const eased = easeOutCubic(t);
    const bones = rig.mesh.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      bones[i].rotation.x = (capture.boneRotations[i] ?? 0) * (1 - eased);
    }

    if (t >= 1) {
      reportedDoneRef.current = true;
      usePaperStore.getState().markFlattenVisualDone();
    }
  });

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CurlSheet — frozen until phase is "animating", then curls + slides out
// ─────────────────────────────────────────────────────────────────────────────

interface CurlRig {
  mesh: SkinnedMesh;
  /** Local X of the hinge (trailing edge) relative to the page center. */
  hingeOffsetX: number;
  dispose: () => void;
}

/**
 * Flat sheet rigged along its WIDTH: bone 0 sits at the trailing edge
 * (opposite the slide direction) and the chain extends to the leading edge,
 * so rotating bones around Y bends the page around a vertical axis — a
 * clean book-like curl, unrelated to the fold crease lines.
 */
function buildCurlRig(
  capture: PaperTransitionCapture,
  direction: 1 | -1,
): CurlRig {
  const { pageWidth, pageHeight } = capture;

  const geometry = new BoxGeometry(
    pageWidth,
    pageHeight,
    PAGE_DEPTH,
    SHEET_SEGMENTS,
    2,
  );
  geometry.translate(-direction * (pageWidth / 2), 0, 0);

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
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4),
  );

  const materials = buildSheetMaterials(capture);

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
      disposeSheetMaterials(materials);
    },
  };
}

function CurlSheet({ capture }: { capture: PaperTransitionCapture }) {
  const groupRef = useRef<Group>(null);
  const rigRef = useRef<CurlRig | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const direction = usePaperStore.getState().transitionDirection;
    const rig = buildCurlRig(capture, direction);
    rigRef.current = rig;
    directionRef.current = direction;
    elapsedRef.current = 0;
    finishedRef.current = false;

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
    if (!group || !rig || finishedRef.current) return;

    // Frozen (rest pose, no slide) until the store actually flips to
    // "animating" — covers both "still loading" and "flatten sheet still
    // unfolding" (this mesh isn't even mounted during the latter, but the
    // check stays cheap and correct either way).
    if (usePaperStore.getState().transitionPhase !== "animating") return;

    elapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(elapsedRef.current / EXIT_DURATION_S, 1);
    const direction = directionRef.current;
    const bones = rig.mesh.skeleton.bones;

    // Vertical-axis curl, concentrated toward the leading edge (p² ramp).
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

    if (t >= 1) {
      finishedRef.current = true;
      usePaperStore.getState().curlSheetFinished();
    }
  });

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// PaperTransitionLayer — mounts whichever sheet matches the current stage
// ─────────────────────────────────────────────────────────────────────────────

export function PaperTransitionLayer() {
  const phase = usePaperStore((s) => s.transitionPhase);
  const hasSheet = usePaperStore((s) => s.hasTransitionSheet);
  const stage = usePaperStore((s) => s.sheetStage);

  if (!hasSheet || phase === "idle") return null;

  const capture = getActiveTransitionCapture();
  if (!capture) return null;

  // key includes captureId so a NEW switch always remounts cleanly, and the
  // flatten→curl handoff for the SAME switch is a clean swap too — both show
  // an identical flat page at that instant, so it is imperceptible.
  if (stage === "flatten") {
    return (
      <FlattenSheet key={`flatten-${capture.captureId}`} capture={capture} />
    );
  }
  return <CurlSheet key={`curl-${capture.captureId}`} capture={capture} />;
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
  const enterFromRef = useRef(0);
  const enterElapsedRef = useRef(0);
  const glidingRef = useRef(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const store = usePaperStore.getState();
    const phase = store.transitionPhase;

    if (phase === "idle" || !store.hasTransitionSheet) {
      // No sheet exists to stand in for the outgoing page (either nothing
      // is switching, or the capture failed — the rare fallback path).
      // NEVER park the real content off-screen here: with no sheet to show
      // in its place, doing so would leave the paper's spot completely
      // empty for the whole "loading" wait. Staying visible in place means
      // the fallback is, at worst, a plain content refresh — never a blank
      // gap.
      glidingRef.current = false;
      group.visible = true;
      group.position.x = 0;
      return;
    }

    // Glide in ONLY once the curl sheet is actually curling — i.e. once
    // "animating" has moved past any flatten prefix. Synchronized start
    // with CurlSheet is what makes the crossing read as one motion.
    const shouldGlide = phase === "animating" && store.sheetStage === "curl";

    if (!shouldGlide) {
      // Parked off-screen: covers "loading" AND "animating while the
      // flatten sheet is still unfolding". Re-asserted every frame is cheap
      // and needs no separate mount-time bookkeeping.
      glidingRef.current = false;
      const direction = store.transitionDirection;
      group.visible = true;
      group.position.x =
        direction * (viewport.width / 2 + OFFSCREEN_MARGIN + 2);
      return;
    }

    if (!glidingRef.current) {
      glidingRef.current = true;
      enterElapsedRef.current = 0;
      enterFromRef.current = group.position.x;
    }

    enterElapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(enterElapsedRef.current / ENTER_DURATION_S, 1);
    group.position.x = enterFromRef.current * (1 - easeInOutCubic(t));

    if (t >= 1) {
      group.position.x = 0;
      store.enterFinished();
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
