"use client";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { writeFoldAnglesForScroll } from "./FoldStory";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, FC } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Mesh,
  Uint16BufferAttribute,
  Vector3,
  Material,
} from "three";
import { BismillahText3D } from "../SurahLayout/BismillahText3D";
import { PAGE_BG_COLOR } from "../../../data/theme";
import { PaperMaterial, TextureToggles } from "./PaperMaterial";
import { useFoldStore } from "../orchestrator/ScrollManager";

const easingFactor = 0.5;
export const PAGE_DEPTH = 0.003;

const PAGE_SEGMENTS = 80;

const paperBaseColor = new Color(PAGE_BG_COLOR);
const paperBackColor = new Color("#ffffff");
const staticSideL = new MeshStandardMaterial({ color: paperBaseColor }); // side L
const staticSideR = new MeshStandardMaterial({
  color: "#111",
  roughness: 1,
  metalness: 0,
  toneMapped: false,
}); // side R
const staticTopCap = new MeshStandardMaterial({ color: paperBaseColor }); // top cap
const staticBottomCap = new MeshStandardMaterial({ color: paperBaseColor }); // bottom cap

// ── Define Cut Panel Structure ──
export interface PaperPanelConfig {
  id: string;
  w: number;
  h: number;
  offsetX: number;
  offsetY: number;
  isStatic?: boolean;
  ignoreFolds?: number[]; // Indexes of folds that this panel should not react to
}

function createPanelGeometry(
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
  // Map vertex positions based on offsetY so they are placed exactly in global coordinates
  pageGeometry.translate(0, -panelH / 2 - offsetY, 0);

  // ── Core magic: Accurately mapping UVs so the texture doesn't break ──
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

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const distFromTop = -vertex.y;
    // Use full height to construct a global skeleton
    const globalSegmentHeight = fullH / PAGE_SEGMENTS;
    let skinIndex = Math.floor(distFromTop / globalSegmentHeight);
    skinIndex = Math.max(0, Math.min(skinIndex, PAGE_SEGMENTS - 1));
    const skinWeight = (distFromTop % globalSegmentHeight) / globalSegmentHeight;
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
  toggles?: TextureToggles;
  onReady?: () => void;
}

const PaperPanelMesh: FC<PaperPanelProps> = ({
  panel,
  isFolded,
  toggles,
  onReady,
}) => {
  const runtime = useSurahLayoutRuntime();
  const group = useRef<Group>(null);
  const meshRef = useRef<any>(null);

  const foldAnglesRef = useRef<Float32Array | null>(null);
  if (
    !foldAnglesRef.current ||
    foldAnglesRef.current.length !== runtime.FOLD_Y_POSITIONS.length
  ) {
    foldAnglesRef.current = new Float32Array(runtime.FOLD_Y_POSITIONS.length);
  }

  const foldContributionsRef = useRef(new Float32Array(PAGE_SEGMENTS + 1));

  const foldBonePositions = useMemo(() => {
    const globalSegmentHeight = runtime.PAGE_HEIGHT / PAGE_SEGMENTS;
    return runtime.FOLD_Y_POSITIONS.map((globalY) => {
      const distFromPanelTop = Math.abs(globalY);

      if (distFromPanelTop < 0) return 0;
      if (distFromPanelTop > runtime.PAGE_HEIGHT) return PAGE_SEGMENTS;

      return distFromPanelTop / globalSegmentHeight;
    });
  }, [runtime.FOLD_Y_POSITIONS, runtime.PAGE_HEIGHT]);

  const manualMesh = useMemo(() => {
    const pageGeometry = createPanelGeometry(
      panel.w,
      panel.h,
      runtime.PAGE_WIDTH,
      runtime.PAGE_HEIGHT,
      panel.offsetX,
      panel.offsetY,
    );

    const materials = [
      staticSideL,
      staticSideR,
      staticTopCap,
      staticBottomCap,
      new MeshStandardMaterial({ color: paperBaseColor, roughness: 0.8 }),
      new MeshBasicMaterial({ color: paperBackColor }),
    ];

    if (panel.isStatic) {
      const mesh = new Mesh(pageGeometry, materials);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      return mesh;
    }

    const globalSegmentHeight = runtime.PAGE_HEIGHT / PAGE_SEGMENTS;
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.y = i === 0 ? 0 : -globalSegmentHeight;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [panel, runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT]);

  useEffect(() => {
    return () => {
      if (manualMesh) {
        manualMesh.geometry.dispose();
        const mats = manualMesh.material as Material[];
        if (Array.isArray(mats)) {
          mats[4]?.dispose();
          mats[5]?.dispose();
        }
      }
    };
  }, [manualMesh]);

  useFrame((_, delta) => {
    if (
      panel.isStatic ||
      !meshRef.current ||
      !group.current ||
      !foldAnglesRef.current
    )
      return;

    const bones = (meshRef.current as SkinnedMesh).skeleton.bones;
    const paperProgress = useFoldStore.getState().currentOffset;

    const targetFoldAngles = foldAnglesRef.current;
    const foldContributions = foldContributionsRef.current;

    writeFoldAnglesForScroll(
      paperProgress,
      runtime.foldSteps,
      targetFoldAngles,
    );
    foldContributions.fill(0, 0, bones.length);

    for (let foldIdx = 0; foldIdx < targetFoldAngles.length; foldIdx++) {
      // ── Here the left and right panels exhibit different behaviors! ──
      if (panel.ignoreFolds?.includes(foldIdx)) continue;

      const totalAngle = targetFoldAngles[foldIdx];
      const rawBonePos = foldBonePositions[foldIdx];

      const lowerBone = Math.floor(rawBonePos);
      const upperBone = Math.min(lowerBone + 1, bones.length - 1);
      const blendToUpper = rawBonePos - lowerBone;

      foldContributions[lowerBone] += totalAngle * (1 - blendToUpper);
      foldContributions[upperBone] += totalAngle * blendToUpper;
    }

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      easing.dampAngle(
        target.rotation,
        "x",
        foldContributions[i],
        easingFactor,
        delta,
      );
    }
  });

  const posX = -runtime.PAGE_WIDTH / 2 + panel.offsetX + panel.w / 2;
  // No need for Y shift in the group anymore, since vertices are translated with offsetY
  const posY = 0;

  return (
    <group ref={group} position={[posX, posY, 0]}>
      <primitive object={manualMesh} ref={meshRef}>
        <PaperMaterial
          toggles={toggles}
          isFolded={isFolded}
          onReady={onReady}
        />
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
  const hasInteracted = useRef(false);

  useEffect(() => {
    foldSound.current = new Audio("/paper-fold.mp3");
    if (foldSound.current) {
      foldSound.current.volume = 1;
    }
    const onInteract = () => {
      hasInteracted.current = true;
    };
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  useFrame(() => {
    const paperProgress = useFoldStore.getState().currentOffset;
    const maxStageIndex =
      runtime.foldSteps.length > 0 ? runtime.foldSteps.length - 1 : 0;
    const currentStage = Math.round(paperProgress * maxStageIndex);

    if (currentStage !== lastActiveStage.current) {
      lastActiveStage.current = currentStage;
      if (foldSound.current && paperProgress > 0 && hasInteracted.current) {
        foldSound.current.currentTime = 0;
        foldSound.current.play().catch(() => {});
      }
    }
  });

  // Check if cut panels are defined for this surah?
  const computePanels = (runtime.config.animations as any)?.computePanels;
  const panels: PaperPanelConfig[] = computePanels
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

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {panels.map((panel, idx) => (
        <PaperPanelMesh
          key={panel.id}
          panel={panel}
          isFolded={isFolded}
          toggles={toggles}
          onReady={idx === 0 ? onReady : undefined}
        />
      ))}
      <BismillahText3D surfaceZ={PAGE_DEPTH / 2} />
    </group>
  );
};
