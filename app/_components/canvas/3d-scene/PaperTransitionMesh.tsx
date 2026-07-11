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
 * "animating" is still on the flatten stage. What happens the instant the
 * curl/flip sheet takes over differs by exit style: below
 * BURN_EFFECT_MIN_PAPER_COUNT it glides in from the side, synchronized with
 * CurlSheet's slide so the crossing reads as one motion ("old leaves, new
 * immediately takes its place"). Past that threshold (FlipSheet's real
 * book-turn), it instead appears straight in its resting spot — at
 * ENTER_SCALE_START, growing imperceptibly slowly to full size — the moment
 * the old page is fully open and the turn begins. That's safe because every
 * sheet mesh is forced to SHEET_RENDER_ORDER, well above anything the live
 * page draws (see that constant's comment) — so the new page is simply
 * already there, waiting, completely hidden, and the turn's own curl/slide
 * is what reveals it.
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
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoBlending,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  UnsignedByteType,
  Vector2,
  type WebGLRenderer,
} from "three";
import {
  usePaperStore,
  getActiveTransitionCapture,
  BURN_EFFECT_MIN_PAPER_COUNT,
} from "../../../stores/usePaperStore";
import {
  createPanelGeometry,
  paperBowAmount,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
} from "./SinglePaper";
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
/**
 * Draw order every transition sheet mesh is forced to — and why renderOrder
 * alone is NOT enough. The live page's decoration (verse text, section
 * surfaces/labels — see CanvasText's `transparent: true` + `depthTest: false`
 * defaults and VerseController's `dynamicRenderOrder`, which alone reaches
 * 1000 + verseId * 10) is TRANSPARENT, and three.js draws the entire
 * transparent list after the entire opaque list; renderOrder only sorts
 * WITHIN each list. So an opaque sheet — any renderOrder, any z — is always
 * painted before that text, and text that also skips the depth test then
 * lands on top of it unconditionally. Full coverage therefore needs all
 * three of the tricks below, together (see makeSheetMaterialsCover):
 *
 *   1. `transparent: true` on the sheet materials — moves the sheets into
 *      the transparent list, so they can compete with the text at all;
 *   2. this renderOrder — sorts them after every real transparent drawable
 *      (highest real order is ~4k; DOM overlays are outside WebGL entirely);
 *   3. `blending: NoBlending` — "transparent" is only the LIST assignment;
 *      the page capture is a RenderTexture whose empty pixels carry alpha 0,
 *      and normal alpha blending would turn those into literal holes.
 *      NoBlending writes the sheet's color outright, fully opaque.
 *
 * DepthClearGuard (drawn at this order − 1) completes the picture for the
 * depth-WRITING content the page also has.
 */
const SHEET_RENDER_ORDER = 100000;

// ── Book-flip exit (FlipSheet — Surahs past BURN_EFFECT_MIN_PAPER_COUNT) ───
// The outgoing page turns EXACTLY like a page of an open book, using the
// classic analytic PAGE-CURL: the sheet wraps around an invisible cylinder
// whose crease line starts as a diagonal through the page's bottom outer
// corner (the "finger grabbed it there" dog-ear), then sweeps across the
// page while rotating upright, so the corner peels first, the curl rolls
// smoothly through the whole sheet in one continuous curved surface (zero
// kinks — this is pure math on a dense grid, not bone skinning), the back
// is fully revealed, and the turned page glides off-screen.
//
// If the outgoing page was folded, the usual FlattenSheet stage plays first
// (the fold-story gently unfolds), and this sheet takes over only once the
// page is flat — so the turn itself is always one crease-free piece of
// paper.

/** Total time (seconds), grab → fully off-screen. */
const FLIP_DURATION_S = 3.6;
/** Grid resolution of the flip sheet — a plain (non-skinned) mesh whose
 *  vertices are re-positioned analytically on the CPU every frame (a few
 *  thousand vertices — trivial), so the curl silhouette is perfectly
 *  smooth. Raise for extra silkiness, lower for weak devices. */
const FLIP_WIDTH_SEGMENTS = 96;
const FLIP_HEIGHT_SEGMENTS = 48;
/** Radius of the roll the page bends around, as a fraction of page width.
 *  Bigger = looser, softer curl; smaller = tighter roll. Also caps how far
 *  the page ever reaches toward the camera (max = 2 × this × pageWidth). */
const FLIP_CURL_RADIUS_RATIO = 0.2;
/** Crease tilt at the very start: π/4 = a perfect 45° diagonal through the
 *  bottom corner — the classic corner peel. */
const FLIP_START_TILT = Math.PI / 4;
/** The crease finishes rotating upright (parallel to the book spine) at
 *  this fraction of the timeline… */
const FLIP_UPRIGHT_END = 0.75;
/** …and finishes traveling across the page (fully turned over) at this.
 *  The travel uses an ease-OUT so the very first frame after the unfold
 *  already shows the corner visibly peeling — an ease-in start here read
 *  as a dead "timeout" pause between the unfold and the turn. */
const FLIP_TRAVEL_END = 0.85;
/** From here the turned-over page eases back down toward flat… */
const FLIP_SETTLE_START = 0.78;
/** …reaching this fraction of the full curl height by the end. */
const FLIP_SETTLE_MIN = 0.12;
/** The glide out begins here — deliberately OVERLAPPING the turn's tail
 *  ("back shows, and at the same time it slides away"). */
const FLIP_SLIDE_START = 0.6;

// ── Enter glide (real content) ──────────────────────────────────────────────
/** Matches EXIT_DURATION_S so the crossing motion starts AND ends together. */
const ENTER_DURATION_S = 1.6;
/** Extra world-units past the half-viewport to guarantee "fully off-screen". */
const OFFSCREEN_MARGIN = 1;

// ── Book-flip enter (Surahs past BURN_EFFECT_MIN_PAPER_COUNT) ──────────────
/** The new page appears under the flip sheet SMALLER than full size, so its
 *  rim sits comfortably inside the sheet's silhouette — at 1:1 the incoming
 *  page's antialiased edges shimmer out around the outgoing sheet's border
 *  ("its corners poke out"). */
const ENTER_SCALE_START = 0.95;
/** Seconds to drift from ENTER_SCALE_START back to exactly 1, pivoting on
 *  the page center. Deliberately much shorter than the turn itself: the
 *  page is already full-size and "ready" well before the sheet's slide-out
 *  uncovers most of it, while the ease-in-out keeps the growth gentle
 *  enough not to read as motion under the turning page. */
const ENTER_GROW_DURATION_S = 1.4;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Flips every sheet material into the transparent render list while keeping
 * it visually opaque — the coverage half of the SHEET_RENDER_ORDER strategy
 * (see that constant's comment for the full why).
 */
function makeSheetMaterialsCover(materials: Material[]): Material[] {
  new Set(materials).forEach((m) => {
    m.transparent = true;
    m.blending = NoBlending;
  });
  return materials;
}

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
  return makeSheetMaterialsCover([
    sideMaterial,
    sideMaterial,
    sideMaterial,
    sideMaterial,
    frontMaterial,
    backMaterial,
  ]);
}

function disposeSheetMaterials(materials: Material[]): void {
  new Set(materials).forEach((m) => m.dispose());
}

// ─────────────────────────────────────────────────────────────────────────────
// TransitionShaderWarmup — precompiles the sheets' shaders ahead of any switch
// ─────────────────────────────────────────────────────────────────────────────
//
// The very first time a shader permutation is ever drawn, three.js has to
// compile it from scratch, which can stall the main thread for hundreds of
// milliseconds — exactly the "everything freezes and the page flashes away
// for a moment, only on the very first switch" symptom (intermittent across
// refreshes because the browser's GPU shader cache sometimes still holds the
// compiled program). Mounting invisible meshes with the SAME program-relevant
// parameters and precompiling them with gl.compileAsync (the same technique
// Experience already uses for the intro flow) warms those shaders before the
// user ever triggers a real switch.
//
// The transition draws FOUR distinct permutations, and every program-key
// input must match the real sheets exactly — `transparent` is part of the
// program key (opaque materials compile with `#define OPAQUE`), and so is
// skinning; map/normalMap presence too:
//   1. standard + map + normalMap, transparent  (Curl/Flip front)
//   2. same as 1 but on a SkinnedMesh           (Flatten front)
//   3. standard, no maps, transparent           (sides, Flip back)
//   4. basic, no maps, transparent              (Flatten/Curl back, guard)

interface WarmupRig {
  objects: (Mesh | SkinnedMesh)[];
  dispose: () => void;
}

function buildWarmupRig(warmupTexture: DataTexture): WarmupRig {
  const frontMaterial = new MeshStandardMaterial({
    ...PAPER_MATERIAL_CONFIG,
    map: warmupTexture,
    normalMap: warmupTexture,
    normalScale: SHEET_NORMAL_SCALE.clone(),
  });
  const plainStandardMaterial = new MeshStandardMaterial({
    color: PAGE_BG_COLOR,
  });
  const plainBasicMaterial = new MeshBasicMaterial({ color: "#ffffff" });
  makeSheetMaterialsCover([
    frontMaterial,
    plainStandardMaterial,
    plainBasicMaterial,
  ]);
  // Skinned variant of the front material (clone keeps every param in sync).
  const skinnedFrontMaterial = frontMaterial.clone();

  const geometry = new BoxGeometry(0.01, 0.01, 0.01);

  const objects: (Mesh | SkinnedMesh)[] = [
    frontMaterial,
    plainStandardMaterial,
    plainBasicMaterial,
  ].map((material) => {
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    mesh.frustumCulled = false;
    return mesh;
  });

  const skinnedGeometry = new BoxGeometry(0.01, 0.01, 0.01);
  const vertexCount = skinnedGeometry.attributes.position.count;
  const skinIndexes = new Uint16Array(vertexCount * 4);
  const skinWeights = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) skinWeights[i * 4] = 1;
  skinnedGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4),
  );
  skinnedGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4),
  );
  const bone = new Bone();
  const skinnedMesh = new SkinnedMesh(skinnedGeometry, skinnedFrontMaterial);
  skinnedMesh.visible = false;
  skinnedMesh.frustumCulled = false;
  skinnedMesh.add(bone);
  skinnedMesh.bind(new Skeleton([bone]));
  objects.push(skinnedMesh);

  return {
    objects,
    dispose: () => {
      geometry.dispose();
      skinnedGeometry.dispose();
      frontMaterial.dispose();
      plainStandardMaterial.dispose();
      plainBasicMaterial.dispose();
      skinnedFrontMaterial.dispose();
    },
  };
}

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

  const warmupRig = useMemo(
    () => buildWarmupRig(warmupTexture),
    [warmupTexture],
  );

  useEffect(() => {
    return () => {
      warmupTexture.dispose();
      warmupRig.dispose();
    };
  }, [warmupTexture, warmupRig]);

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
  // do. So these meshes' shaders get warmed up while never being drawn.
  return (
    <group>
      {warmupRig.objects.map((object, i) => (
        <primitive key={i} object={object} />
      ))}
    </group>
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
  mesh.renderOrder = SHEET_RENDER_ORDER;
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
  mesh.renderOrder = SHEET_RENDER_ORDER;
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
// FlipSheet — the real book page-turn (Surahs past BURN_EFFECT_MIN_PAPER_COUNT)
// ─────────────────────────────────────────────────────────────────────────────

interface FlipRig {
  mesh: Mesh;
  geometry: BoxGeometry;
  /** Untouched flat-pose vertex positions — the input of every frame's curl. */
  basePositions: Float32Array;
  dispose: () => void;
}

/**
 * A plain dense-grid sheet, centered exactly like the live page. No bones:
 * every frame the analytic curl below rewrites the positions from
 * `basePositions`, so its rest state is the perfectly flat page.
 */
function buildFlipRig(capture: PaperTransitionCapture): FlipRig {
  const { pageWidth, pageHeight } = capture;

  const geometry = new BoxGeometry(
    pageWidth,
    pageHeight,
    PAGE_DEPTH,
    FLIP_WIDTH_SEGMENTS,
    FLIP_HEIGHT_SEGMENTS,
  );
  const basePositions = Float32Array.from(
    geometry.attributes.position.array as Float32Array,
  );

  // Like buildSheetMaterials, but the BACK is a lit paper-toned standard
  // material instead of SinglePaper's unlit pure white: mid-flip the back
  // fills much of the screen, and unlit white reads as a glaring blob while
  // a lit paper tone shades naturally with the scene lighting.
  const sideMaterial = new MeshStandardMaterial({ color: PAGE_BG_COLOR });
  const backMaterial = new MeshStandardMaterial({ color: PAGE_BG_COLOR });
  const frontMaterial = new MeshStandardMaterial({
    ...PAPER_MATERIAL_CONFIG,
    map: capture.mapCopy,
    normalMap: capture.normalCopy,
    normalScale: capture.normalCopy
      ? SHEET_NORMAL_SCALE.clone()
      : new Vector2(0, 0),
  });
  const materials: Material[] = makeSheetMaterialsCover([
    sideMaterial,
    sideMaterial,
    sideMaterial,
    sideMaterial,
    frontMaterial,
    backMaterial,
  ]);

  const mesh = new Mesh(geometry, materials);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = SHEET_RENDER_ORDER;

  return {
    mesh,
    geometry,
    basePositions,
    dispose: () => {
      geometry.dispose();
      disposeSheetMaterials(materials);
    },
  };
}

/**
 * The classic analytic page-curl: everything on the free-corner side of a
 * moving crease line wraps around a cylinder of radius `r` lying on that
 * line; past half a turn the paper continues flat, upside down, at height
 * 2r. C1-continuous everywhere → one smooth curved surface, no facets.
 *
 * `dirX/dirY` is the unit direction the curl advances in (perpendicular to
 * the crease, pointing toward the grabbed corner), `s` is how far the
 * crease has traveled from the corner, `settle` scales the lift so the
 * turned page can ease back down to flat near the end.
 */
function applyPageCurl(
  rig: FlipRig,
  dirX: number,
  dirY: number,
  cornerX: number,
  cornerY: number,
  s: number,
  r: number,
  settle: number,
): void {
  const positionAttr = rig.geometry.attributes.position;
  const positions = positionAttr.array as Float32Array;
  const base = rig.basePositions;
  const halfTurn = Math.PI * r;

  for (let i = 0; i < positions.length; i += 3) {
    const x0 = base[i];
    const y0 = base[i + 1];
    const z0 = base[i + 2];
    // Signed distance past the crease line, toward the grabbed corner.
    const u = (x0 - cornerX) * dirX + (y0 - cornerY) * dirY + s;
    if (u <= 0) {
      positions[i] = x0;
      positions[i + 1] = y0;
      positions[i + 2] = z0;
      continue;
    }

    // In-plane pullback (du - u) and lift w, plus the local surface normal
    // (nu, nw) so the sheet's tiny thickness follows the curl too.
    let du: number;
    let w: number;
    let nu: number;
    let nw: number;
    const theta = u / r;
    if (theta < Math.PI) {
      du = r * Math.sin(theta);
      w = r * (1 - Math.cos(theta));
      nu = -Math.sin(theta);
      nw = Math.cos(theta);
    } else {
      du = -(u - halfTurn);
      w = 2 * r;
      nu = 0;
      nw = -1;
    }

    const inPlane = du - u + nu * z0;
    positions[i] = x0 + dirX * inPlane;
    positions[i + 1] = y0 + dirY * inPlane;
    positions[i + 2] = w * settle + nw * z0;
  }

  positionAttr.needsUpdate = true;
  rig.geometry.computeVertexNormals();
}

function FlipSheet({ capture }: { capture: PaperTransitionCapture }) {
  const groupRef = useRef<Group>(null);
  const rigRef = useRef<FlipRig | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const rig = buildFlipRig(capture);
    rigRef.current = rig;
    directionRef.current = usePaperStore.getState().transitionDirection;
    elapsedRef.current = 0;
    finishedRef.current = false;

    // Centered exactly over the live page, like FlattenSheet (the geometry
    // is centered, so only the vertical center needs offsetting).
    group.position.set(
      0,
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

    // Frozen in place until the store actually flips to "animating" —
    // identical truth-gating to CurlSheet. The rig's rest pose IS the flat
    // page, so no per-frame work happens while frozen.
    if (usePaperStore.getState().transitionPhase !== "animating") return;

    elapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(elapsedRef.current / FLIP_DURATION_S, 1);
    const direction = directionRef.current;
    const { pageWidth, pageHeight } = capture;
    const r = FLIP_CURL_RADIUS_RATIO * pageWidth;

    // Crease tilt: starts as a 45° diagonal through the bottom corner
    // (corner peels first), eases upright as the turn progresses.
    const tilt =
      FLIP_START_TILT * (1 - easeInOutCubic(clamp01(t / FLIP_UPRIGHT_END)));
    // Crease travel: from resting exactly ON the corner (page untouched) to
    // far enough past the opposite edge that the page is fully turned over
    // no matter the tilt. Ease-OUT: moving from the very first frame (see
    // FLIP_TRAVEL_END's note), calm by the end.
    const travel = easeOutCubic(clamp01(t / FLIP_TRAVEL_END));
    const s =
      travel *
      (pageWidth * Math.cos(tilt) +
        pageHeight * Math.sin(tilt) +
        Math.PI * r +
        0.1);
    // Ease the turned-over page back down toward flat near the end.
    const settle =
      1 -
      (1 - FLIP_SETTLE_MIN) *
        easeInOutCubic(
          clamp01((t - FLIP_SETTLE_START) / (1 - FLIP_SETTLE_START)),
        );

    // Curl advances FROM the bottom exit-opposite corner TOWARD the exit:
    // grab bottom-right when leaving left, bottom-left when leaving right.
    const dirX = direction * Math.cos(tilt);
    const dirY = -Math.sin(tilt);
    const cornerX = direction * (pageWidth / 2);
    const cornerY = -pageHeight / 2;

    applyPageCurl(rig, dirX, dirY, cornerX, cornerY, s, r, settle);

    // The glide out — overlaps the turn's tail. The fully turned page lies
    // just past the exit-side edge of where it was, so carrying the group a
    // bit past half the viewport takes every part of it off-screen.
    const slide = easeInOutCubic(
      clamp01((t - FLIP_SLIDE_START) / (1 - FLIP_SLIDE_START)),
    );
    const slideDistance =
      state.viewport.width / 2 + capture.pageWidth / 2 + OFFSCREEN_MARGIN;
    group.position.x = -direction * slideDistance * slide;

    // The slide starting is the "page has arrived" moment: the turn is
    // essentially complete (its ease-out packs the motion early) and from
    // here the sheet only glides AWAY — nothing is loading anymore, so the
    // busy indicators can stand down while the exit plays out cosmetically.
    if (t >= FLIP_SLIDE_START) {
      usePaperStore.getState().markNewPaperRevealed();
    }

    // Finish as soon as the whole sheet is genuinely outside the viewport —
    // the trailing edge sits pageWidth/2 from the group origin, so once the
    // group has traveled half the viewport plus that, nothing is visible and
    // waiting out the timeline's mathematical tail would just prolong
    // isSwitching for nothing. The t >= 1 check stays as the fallback.
    // 0.2 pad: the residual curl lift tilts parts of the sheet toward the
    // camera, which projects them slightly wider than their world extent.
    const traveled = slideDistance * slide;
    const fullyOffscreen =
      traveled >= state.viewport.width / 2 + capture.pageWidth / 2 + 0.2;
    if (t >= 1 || fullyOffscreen) {
      finishedRef.current = true;
      usePaperStore.getState().curlSheetFinished();
    }
  });

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// DepthClearGuard — wipes the depth buffer right before the sheets draw
// ─────────────────────────────────────────────────────────────────────────────
//
// The sheets sit only SHEET_Z_EPSILON in front of the page plane, but some of
// the live page's content DOES write depth from further forward (verse
// backings settle around z ≈ 0.005–0.02) — those pixels would fail the
// sheets' depth test and punch page-shaped holes straight through them. This
// invisible mesh renders at SHEET_RENDER_ORDER − 1 (same transparent list as
// the sheets, immediately before them) and clears the whole depth buffer, so
// the sheets depth-test purely against THEMSELVES: nothing in the scene can
// stab through them, while their own front/back still self-occludes
// correctly mid-curl. Nothing real draws after the sheets, so wiping the
// scene's depth costs nothing.

function clearDepthBeforeSheets(renderer: WebGLRenderer) {
  // gl.clear honors the current depth mask — force it writable first, or a
  // preceding depthWrite:false material would silently turn this into a no-op.
  renderer.state.buffers.depth.setMask(true);
  renderer.clearDepth();
}

function DepthClearGuard() {
  return (
    <mesh
      renderOrder={SHEET_RENDER_ORDER - 1}
      frustumCulled={false}
      onBeforeRender={clearDepthBeforeSheets}
    >
      <planeGeometry args={[0.001, 0.001]} />
      <meshBasicMaterial
        transparent
        colorWrite={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PaperTransitionLayer — mounts whichever sheet matches the current stage
// ─────────────────────────────────────────────────────────────────────────────

export function PaperTransitionLayer() {
  const phase = usePaperStore((s) => s.transitionPhase);
  const hasSheet = usePaperStore((s) => s.hasTransitionSheet);
  const stage = usePaperStore((s) => s.sheetStage);
  const bookFlip = usePaperStore(
    (s) => s.paperCount > BURN_EFFECT_MIN_PAPER_COUNT,
  );

  if (!hasSheet || phase === "idle") return null;

  const capture = getActiveTransitionCapture();
  if (!capture) return null;

  // key includes captureId so a NEW switch always remounts cleanly, and the
  // flatten→curl handoff for the SAME switch is a clean swap too — both show
  // an identical flat page at that instant, so it is imperceptible.
  let sheet: ReactNode;
  if (stage === "flatten") {
    sheet = (
      <FlattenSheet key={`flatten-${capture.captureId}`} capture={capture} />
    );
  } else if (bookFlip) {
    // Surahs past BURN_EFFECT_MIN_PAPER_COUNT get the real book page-turn;
    // everything else keeps the original plain curl+slide untouched.
    sheet = <FlipSheet key={`flip-${capture.captureId}`} capture={capture} />;
  } else {
    sheet = <CurlSheet key={`curl-${capture.captureId}`} capture={capture} />;
  }

  return (
    <>
      <DepthClearGuard />
      {sheet}
    </>
  );
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
  const enterFromXRef = useRef(0);
  const enterElapsedRef = useRef(0);
  const glidingRef = useRef(false);
  const ashEligible = usePaperStore(
    (s) => s.paperCount > BURN_EFFECT_MIN_PAPER_COUNT,
  );

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
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(1);
      paperBowAmount.value = 0;
      return;
    }

    // The reveal moment ONLY starts once the outgoing page is fully open
    // and its real curl/flip is under way — i.e. once "animating" has moved
    // past any flatten prefix (whether that prefix ran at all, or was
    // skipped because the page was already flat). Before that instant the
    // new page must stay completely out of sight.
    const shouldReveal = phase === "animating" && store.sheetStage === "curl";
    const direction = store.transitionDirection;

    if (!shouldReveal) {
      // Parked off-screen: covers "loading" AND "animating while the
      // flatten sheet is still unfolding". Re-asserted every frame is cheap
      // and needs no separate mount-time bookkeeping.
      glidingRef.current = false;
      group.visible = true;
      group.position.x =
        direction * (viewport.width / 2 + OFFSCREEN_MARGIN + 2);
      group.position.set(group.position.x, 0, 0);
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(1);
      paperBowAmount.value = 0;
      return;
    }

    if (ashEligible) {
      // FlipSheet's real book-turn is forced to SHEET_RENDER_ORDER — it
      // paints over the live page's own content unconditionally, no matter
      // how that content orders its own depth — so the new page appears in
      // its resting spot with no entrance of its own: it was never visible
      // on the way here, and it only becomes visible as FlipSheet's own
      // curl/slide peels away and uncovers it, exactly like a real page
      // turn revealing the sheet underneath. It arrives at ENTER_SCALE_START
      // (rim strictly inside the sheet's silhouette — nothing peeks out
      // around the border) and grows to exactly 1 so slowly the motion is
      // imperceptible.
      if (!glidingRef.current) {
        glidingRef.current = true;
        enterElapsedRef.current = 0;
      }

      enterElapsedRef.current += Math.min(delta, 0.05);
      const t = Math.min(enterElapsedRef.current / ENTER_GROW_DURATION_S, 1);
      const s =
        ENTER_SCALE_START + (1 - ENTER_SCALE_START) * easeInOutCubic(t);

      // Pivot the growth on the PAGE's center, not the group origin, so it
      // swells perfectly symmetrically under the sheet.
      const capture = getActiveTransitionCapture();
      const pageCenterY = capture
        ? capture.sceneCenterY - capture.pageHeight / 2
        : 0;

      group.scale.setScalar(s);
      group.position.set(0, pageCenterY * (1 - s), 0);
      group.rotation.set(0, 0, 0);
      paperBowAmount.value = 0;

      if (t >= 1) {
        group.scale.setScalar(1);
        group.position.set(0, 0, 0);
        store.enterFinished();
      }
      return;
    }

    if (!glidingRef.current) {
      glidingRef.current = true;
      enterElapsedRef.current = 0;
      enterFromXRef.current = group.position.x;
    }

    enterElapsedRef.current += Math.min(delta, 0.05);

    const t = Math.min(enterElapsedRef.current / ENTER_DURATION_S, 1);
    group.position.x = enterFromXRef.current * (1 - easeInOutCubic(t));
    paperBowAmount.value = 0;

    if (t >= 1) {
      group.position.x = 0;
      store.enterFinished();
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}
