"use client";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { writeFoldAnglesForScroll } from "./FoldStory";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, FC } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Mesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { BismillahText3D } from "../SurahLayout/BismillahText3D";
import { PAGE_BG_COLOR } from "../../../data/theme";
import {
  PaperMaterial,
  PaperMaterialHandle,
  TextureToggles,
} from "./PaperMaterial";
import { useFoldStore } from "../orchestrator/ScrollManager";
import {
  registerPaperSnapshotSource,
  unregisterPaperSnapshotSource,
  processPendingCaptureRequest,
  type PaperSnapshotSource,
} from "./paperSnapshot";
import {
  attachGlobalAudioUnlockListeners,
  useAudioUnlockStore,
} from "../../../stores/useAudioUnlockStore";

const easingFactor = 0.5;
export const PAGE_DEPTH = 0.003;
export const PAGE_SEGMENTS = 80;

/**
 * Set by PaperSlideGroup for the WHOLE duration of the ash-eligible "falling
 * paper" drop (see PaperTransitionMesh's FALL_BOW_* constants) — a gentle
 * bow through the page's own vertical middle (edges unaffected) that rises
 * and falls in sync with the same rock/tumble while it's in the air, fading
 * out together with it by landing. Stays 0 the rest of the time, and for
 * every non-ash-eligible Surah nothing ever sets it away from 0, so it's a
 * true no-op unless actively driven. The bone loop below reads it every
 * frame; the cost of checking is one cheap comparison.
 */
export const paperBowAmount = { value: 0 };

// 🚀 OPTIMIZATION 1: Static materials created ONCE as module-level singletons.
// Prevents continuous WebGL shader recompilation on mobile GPUs.
const paperBaseColor = new Color(PAGE_BG_COLOR);
const paperBackColor = new Color("#f4f2ee");

const staticSideL = new MeshStandardMaterial({ color: paperBaseColor });
const staticSideR = new MeshStandardMaterial({
  color: "#111",
  roughness: 1,
  metalness: 0,
  toneMapped: false,
});
const staticTopCap = new MeshStandardMaterial({ color: paperBaseColor });
const staticBottomCap = new MeshStandardMaterial({ color: paperBaseColor });
const sharedFrontMaterial = new MeshStandardMaterial({
  color: paperBaseColor,
  roughness: 0.8,
});
const sharedBackMaterial = new MeshBasicMaterial({ color: paperBackColor });

// Module-level template array — each panel gets a SHALLOW COPY of this array
// so they can independently swap slot 4 without cross-contamination.
const SHARED_MATERIALS: Material[] = [
  staticSideL,
  staticSideR,
  staticTopCap,
  staticBottomCap,
  sharedFrontMaterial,
  sharedBackMaterial,
];

export interface PaperPanelConfig {
  id: string;
  w: number;
  h: number;
  offsetX: number;
  offsetY: number;
  isStatic?: boolean;
  ignoreFolds?: number[];
}

export function createPanelGeometry(
  panelW: number,
  panelH: number,
  fullW: number,
  fullH: number,
  offsetX: number,
  offsetY: number,
) {
  const pageGeometry = new BoxGeometry(
    panelW,
    panelH,
    PAGE_DEPTH,
    2,
    PAGE_SEGMENTS,
  );
  pageGeometry.translate(0, -panelH / 2 - offsetY, 0);

  const uvs = pageGeometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const u = uvs.getX(i);
    const v = uvs.getY(i);
    const globalU = (u * panelW + offsetX) / fullW;
    const globalV = (v * panelH + (fullH - offsetY - panelH)) / fullH;
    uvs.setXY(i, globalU, globalV);
  }

  const position = pageGeometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];
  const globalSegmentHeight = fullH / PAGE_SEGMENTS;

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const distFromTop = -vertex.y;
    let skinIndex = Math.floor(distFromTop / globalSegmentHeight);
    skinIndex = Math.max(0, Math.min(skinIndex, PAGE_SEGMENTS - 1));
    const skinWeight =
      (distFromTop % globalSegmentHeight) / globalSegmentHeight;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4),
  );
  pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4),
  );

  return pageGeometry;
}

interface PaperPanelProps {
  panel: PaperPanelConfig;
  isFolded?: boolean;
  toggles: TextureToggles; // required — fixes TS build error
  globalFoldAngles: React.MutableRefObject<Float32Array | null>;
  onReady?: () => void;
  isPrimary?: boolean; // only primary renders PaperMaterial
  sharedMatRef?: React.RefObject<PaperMaterialHandle | null>; // texture source for siblings
}

const PaperPanelMesh: FC<PaperPanelProps> = ({
  panel,
  isFolded,
  toggles,
  globalFoldAngles,
  onReady,
  isPrimary = false,
  sharedMatRef,
}) => {
  const runtime = useSurahLayoutRuntime();
  const group = useRef<Group>(null);
  const meshRef = useRef<any>(null);

  // 🚀 OPTIMIZATION 2: Extract primitive values — stable deps for all useMemos below.
  const { w, h, offsetX, offsetY, isStatic, ignoreFolds } = panel;
  const { PAGE_WIDTH, PAGE_HEIGHT } = runtime;

  // 🚀 OPTIMIZATION 3: Per-panel materials array (shallow copy of SHARED_MATERIALS).
  // Each panel independently owns slot 4 so the primary's PaperMaterial instance can
  // be injected into sibling panels without contaminating the module-level array.
  const panelMaterials = useMemo(() => [...SHARED_MATERIALS] as Material[], []);

  // 🚀 OPTIMIZATION 4: Pre-convert ignoreFolds → Set for O(1) lookup in the hot
  // useFrame path. With 15 folds × 3 panels, this replaces 45 O(n) Array.includes
  // calls per frame with 45 O(1) Set.has calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ignoreFoldsSet = useMemo(
    () => (ignoreFolds ? new Set(ignoreFolds) : null),
    // String fingerprint avoids issues with array reference identity across
    // computePanels calls while still updating when the content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ignoreFolds?.join(",")],
  );

  const foldContributionsRef = useRef(new Float32Array(PAGE_SEGMENTS + 1));

  const foldBonePositions = useMemo(() => {
    const globalSegmentHeight = PAGE_HEIGHT / PAGE_SEGMENTS;
    return runtime.FOLD_Y_POSITIONS.map((globalY) => {
      const distFromPanelTop = Math.abs(globalY);
      if (distFromPanelTop < 0) return 0;
      if (distFromPanelTop > PAGE_HEIGHT) return PAGE_SEGMENTS;
      return distFromPanelTop / globalSegmentHeight;
    });
  }, [runtime.FOLD_Y_POSITIONS, PAGE_HEIGHT]);

  const manualMesh = useMemo(() => {
    const pageGeometry = createPanelGeometry(
      w,
      h,
      PAGE_WIDTH,
      PAGE_HEIGHT,
      offsetX,
      offsetY,
    );

    if (isStatic) {
      const mesh = new Mesh(pageGeometry, panelMaterials);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      return mesh;
    }

    const globalSegmentHeight = PAGE_HEIGHT / PAGE_SEGMENTS;
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.y = i === 0 ? 0 : -globalSegmentHeight;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);

    const mesh = new SkinnedMesh(pageGeometry, panelMaterials);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
    // All deps are primitives — mesh is NEVER recreated on global state updates.
  }, [
    w,
    h,
    offsetX,
    offsetY,
    isStatic,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    panelMaterials,
  ]);

  useEffect(() => {
    return () => {
      if (manualMesh) {
        manualMesh.geometry.dispose();
        // ⛔ Materials are NOT disposed — they are module-level singletons or shared instances.
      }
    };
  }, [manualMesh]);

  // 🚀 CRITICAL OPTIMIZATION 5: Material sharing for non-primary panels.
  //
  // The primary panel (idx=0) renders <PaperMaterial> which creates ONE RenderTexture
  // scene (the full SurahLayout offscreen canvas). Non-primary panels instead read the
  // settled MeshStandardMaterial instance from sharedMatRef and swap it into their own
  // panelMaterials[4] slot imperatively.
  //
  // This eliminates N-1 redundant RenderTexture scenes — the root cause of mobile lag.
  // Three.js fully supports multiple meshes sharing the same material instance.
  const hasSyncedMaterialRef = useRef(false);

  useFrame(() => {
    // Primary owns the material and never needs to sync.
    // After syncing once, stop checking every frame.
    if (isPrimary || hasSyncedMaterialRef.current) return;

    const sourceMat = sharedMatRef?.current?.getMaterial();
    if (!sourceMat) return; // Primary panel not committed yet — wait.

    // Swap the front-face slot to the primary's material instance.
    // Since mesh.material === panelMaterials (same reference), Three.js sees
    // this change immediately on the next draw call — no needsUpdate required.
    panelMaterials[4] = sourceMat;
    hasSyncedMaterialRef.current = true;
  });

  // 🚀 OPTIMIZATION 6: Bone animation loop — strictly zero allocations per frame.
  // foldContributions is a pre-allocated Float32Array mutated in place via .fill().
  // ignoreFoldsSet.has() is O(1) vs the previous ignoreFolds?.includes() O(n).
  useFrame((_, delta) => {
    if (
      isStatic ||
      !meshRef.current ||
      !group.current ||
      !globalFoldAngles.current
    )
      return;

    const safeDelta = Math.min(delta, 0.1);

    const bones = (meshRef.current as SkinnedMesh).skeleton.bones;
    const targetFoldAngles = globalFoldAngles.current;
    const foldContributions = foldContributionsRef.current;

    foldContributions.fill(0, 0, bones.length);

    for (let foldIdx = 0; foldIdx < targetFoldAngles.length; foldIdx++) {
      // O(1) Set lookup — replaces O(n) Array.includes in the 45-call-per-frame hot path
      if (ignoreFoldsSet?.has(foldIdx)) continue;

      const totalAngle = targetFoldAngles[foldIdx];
      const rawBonePos = foldBonePositions[foldIdx];

      const lowerBone = Math.floor(rawBonePos);
      const upperBone = Math.min(lowerBone + 1, bones.length - 1);
      const blendToUpper = rawBonePos - lowerBone;

      foldContributions[lowerBone] += totalAngle * (1 - blendToUpper);
      foldContributions[upperBone] += totalAngle * blendToUpper;
    }

    // In-flight bow (see paperBowAmount) — a single sine hump across the
    // WHOLE page's bone range. Bone index i maps to the same global Y on
    // every panel (see createPanelGeometry), so this composes into one
    // unified bow even on multi-panel layouts, not a separate bow per panel.
    // Anti-symmetric around the midpoint means the cumulative tilt rises
    // through the top half and falls back through the bottom half, so the
    // page's own top and bottom edges land back at zero net tilt — only the
    // middle bulges. Zero the rest of the time, so this is a no-op then.
    const bow = paperBowAmount.value;
    if (bow !== 0) {
      for (let i = 0; i < bones.length; i++) {
        foldContributions[i] +=
          bow * Math.sin((2 * Math.PI * i) / PAGE_SEGMENTS);
      }
    }

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      easing.dampAngle(
        target.rotation,
        "x",
        foldContributions[i],
        easingFactor,
        safeDelta,
      );
    }
  });

  const posX = -PAGE_WIDTH / 2 + offsetX + w / 2;

  return (
    <group ref={group} position={[posX, 0, 0]}>
      <primitive object={manualMesh} ref={meshRef}>
        {/*
         * 🚀 CRITICAL: PaperMaterial (and its two RenderTexture offscreen scenes)
         * is mounted ONLY on the primary panel. Non-primary panels receive the same
         * MeshStandardMaterial instance via the hasSyncedMaterialRef + useFrame sync
         * above, bypassing the RenderTexture entirely.
         *
         * Before this change: 3 panels × 2 RenderTextures = 6 live offscreen scenes.
         * After: 1 panel × 2 RenderTextures = 2 offscreen scenes total.
         */}
        {isPrimary && (
          <PaperMaterial
            ref={sharedMatRef}
            toggles={toggles}
            isFolded={isFolded}
            onReady={onReady}
          />
        )}
      </primitive>
    </group>
  );
};

interface SinglePaperProps {
  isFolded?: boolean;
  toggles?: TextureToggles;
  onReady?: () => void;
}

export const SinglePaper: FC<SinglePaperProps> = ({
  isFolded = false,
  toggles = { diffuse: true, normal: true },
  onReady,
}) => {
  const runtime = useSurahLayoutRuntime();
  const foldSound = useRef<HTMLAudioElement | null>(null);
  const lastActiveStage = useRef<number>(0);

  // 🚀 OPTIMIZATION 7: Global fold angle buffer written ONCE in the parent useFrame,
  // then shared via ref with all panels. Eliminates N redundant writeFoldAnglesForScroll
  // calls — previously each panel would compute the same angles independently.
  const globalFoldAngles = useRef<Float32Array | null>(null);
  if (
    !globalFoldAngles.current ||
    globalFoldAngles.current.length !== runtime.FOLD_Y_POSITIONS.length
  ) {
    globalFoldAngles.current = new Float32Array(
      runtime.FOLD_Y_POSITIONS.length,
    );
  }

  // 🚀 OPTIMIZATION 8: sharedMatRef holds the primary panel's PaperMaterialHandle.
  // Non-primary panels call getMaterial() to retrieve the settled MeshStandardMaterial
  // and inject it into their panelMaterials[4] slot — no RenderTexture needed.
  const sharedMatRef = useRef<PaperMaterialHandle | null>(null);

  const { gl } = useThree();

  // Register this paper as the capture source for the page-turn transition.
  // usePaperStore blits GPU copies of the page textures the instant a switch
  // starts, so the transition sheet can keep showing the old page WHILE the
  // live material is already rebuilding with the new paper's content.
  useEffect(() => {
    const pageHeight = runtime.PAGE_HEIGHT;
    const foldYPositions = runtime.FOLD_Y_POSITIONS;
    const segmentHeight = pageHeight / PAGE_SEGMENTS;
    const foldAnglesRef = globalFoldAngles;

    const source: PaperSnapshotSource = {
      getMaterial: () => sharedMatRef.current?.getMaterial() ?? null,
      getBoneRotations: () => {
        const targetAngles = foldAnglesRef.current;
        if (!targetAngles) return null;
        // Distribute the global fold angles onto the bone chain exactly like
        // PaperPanelMesh does per frame, so the transition sheet starts in
        // the same pose the live paper is showing.
        const rotations = new Float32Array(PAGE_SEGMENTS + 1);
        for (let foldIdx = 0; foldIdx < targetAngles.length; foldIdx++) {
          const rawBonePos = Math.min(
            Math.abs(foldYPositions[foldIdx]) / segmentHeight,
            PAGE_SEGMENTS,
          );
          const lowerBone = Math.min(Math.floor(rawBonePos), PAGE_SEGMENTS - 1);
          const upperBone = Math.min(lowerBone + 1, PAGE_SEGMENTS);
          const blendToUpper = rawBonePos - lowerBone;
          rotations[lowerBone] += targetAngles[foldIdx] * (1 - blendToUpper);
          rotations[upperBone] += targetAngles[foldIdx] * blendToUpper;
        }
        return rotations;
      },
      pageWidth: runtime.PAGE_WIDTH,
      pageHeight,
      sceneCenterY: runtime.SCENE_CENTER_Y,
    };

    registerPaperSnapshotSource(source, gl);
    return () => unregisterPaperSnapshotSource(source);
  }, [
    runtime.PAGE_WIDTH,
    runtime.PAGE_HEIGHT,
    runtime.SCENE_CENTER_Y,
    runtime.FOLD_Y_POSITIONS,
    gl,
  ]);

  useEffect(() => {
    foldSound.current = new Audio("/paper-fold.mp3");
    if (foldSound.current) foldSound.current.volume = 1;

    // Safety net — AudioUnlockInitializer already attaches these at the app
    // root, but attaching is idempotent, so this covers any mount order.
    attachGlobalAudioUnlockListeners();

    return () => {
      if (foldSound.current) {
        foldSound.current.pause();
        foldSound.current.src = "";
        foldSound.current = null;
      }
    };
  }, []);

  useFrame(() => {
    // Processes usePaperStore's capture request (if any) right here, inside
    // R3F's own frame loop — the one place renderer.render() calls are
    // always safe to make. See paperSnapshot.ts for why this matters.
    processPendingCaptureRequest();

    const paperProgress = useFoldStore.getState().currentOffset;

    // Fold angle computation runs ONCE here and is shared with all panels via ref.
    writeFoldAnglesForScroll(
      paperProgress,
      runtime.foldSteps,
      globalFoldAngles.current!,
    );

    const maxStageIndex =
      runtime.foldSteps.length > 0 ? runtime.foldSteps.length - 1 : 0;
    const currentStage = Math.round(paperProgress * maxStageIndex);

    if (currentStage !== lastActiveStage.current) {
      lastActiveStage.current = currentStage;
      if (
        foldSound.current &&
        paperProgress > 0 &&
        useAudioUnlockStore.getState().hasInteracted
      ) {
        foldSound.current.currentTime = 0;
        foldSound.current.play().catch(() => {});
      }
    }
  });

  // 🚀 OPTIMIZATION 9: Panel config array locked by primitive deps.
  // computePanels is not re-called on unrelated global state updates.
  const computePanels = (runtime.config.animations as any)?.computePanels;
  const panels: PaperPanelConfig[] = useMemo(() => {
    return computePanels
      ? computePanels(runtime.layoutMath)
      : [
          {
            id: "full-page",
            w: runtime.PAGE_WIDTH,
            h: runtime.PAGE_HEIGHT,
            offsetX: 0,
            offsetY: 0,
          },
        ];
  }, [
    computePanels,
    runtime.layoutMath,
    runtime.PAGE_WIDTH,
    runtime.PAGE_HEIGHT,
  ]);

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {panels.map((panel, idx) => (
        <PaperPanelMesh
          key={panel.id}
          panel={panel}
          isFolded={isFolded}
          toggles={toggles}
          globalFoldAngles={globalFoldAngles}
          onReady={idx === 0 ? onReady : undefined}
          isPrimary={idx === 0}
          sharedMatRef={sharedMatRef}
        />
      ))}
      {!runtime.config.features.hideBismillah3D && (
        <BismillahText3D surfaceZ={PAGE_DEPTH / 2} />
      )}
    </group>
  );
};
