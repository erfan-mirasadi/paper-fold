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

// 🚀 OPTIMIZATION 1: متریال‌ها به صورت گلوبال یک بار ساخته می‌شوند
// این کار جلوی فریز شدن موبایل برای کامپایل شیدرهای تکراری را کاملاً می‌گیرد
const paperBaseColor = new Color(PAGE_BG_COLOR);
const paperBackColor = new Color("#ffffff");

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

const SHARED_MATERIALS = [
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
  toggles?: TextureToggles;
  globalFoldAngles: React.MutableRefObject<Float32Array | null>;
  onReady?: () => void;
}

const PaperPanelMesh: FC<PaperPanelProps> = ({
  panel,
  isFolded,
  toggles,
  globalFoldAngles,
  onReady,
}) => {
  const runtime = useSurahLayoutRuntime();
  const group = useRef<Group>(null);
  const meshRef = useRef<any>(null);

  // 🚀 OPTIMIZATION 2: استخراج مقادیر Primitive برای جلوگیری از باگ Reference Equality در useMemo
  const { w, h, offsetX, offsetY, isStatic, ignoreFolds } = panel;
  const { PAGE_WIDTH, PAGE_HEIGHT } = runtime;

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
      const mesh = new Mesh(pageGeometry, SHARED_MATERIALS);
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

    const mesh = new SkinnedMesh(pageGeometry, SHARED_MATERIALS);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
    // وابستگی‌ها کاملاً Primitive هستند، مش بی‌دلیل ساخته نمی‌شود
  }, [w, h, offsetX, offsetY, isStatic, PAGE_WIDTH, PAGE_HEIGHT]);

  useEffect(() => {
    return () => {
      if (manualMesh) {
        manualMesh.geometry.dispose();
        // ⛔ متریال‌ها اینجا Dispose نمی‌شوند چون گلوبال و مشترک هستند
      }
    };
  }, [manualMesh]);

  useFrame((_, delta) => {
    if (
      isStatic ||
      !meshRef.current ||
      !group.current ||
      !globalFoldAngles.current
    )
      return;

    const bones = (meshRef.current as SkinnedMesh).skeleton.bones;
    const targetFoldAngles = globalFoldAngles.current;
    const foldContributions = foldContributionsRef.current;

    foldContributions.fill(0, 0, bones.length);

    for (let foldIdx = 0; foldIdx < targetFoldAngles.length; foldIdx++) {
      if (ignoreFolds?.includes(foldIdx)) continue;

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

  const posX = -PAGE_WIDTH / 2 + offsetX + w / 2;

  return (
    <group ref={group} position={[posX, 0, 0]}>
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

  // 🚀 OPTIMIZATION 3: محاسبه زاویه‌ها به صورت مشترک
  // به جای اینکه 3 تا پنل جداگانه حساب کنن، اینجا ۱ بار حساب میشه و پاس داده میشه به پنل‌ها
  const globalFoldAngles = useRef<Float32Array | null>(null);
  if (
    !globalFoldAngles.current ||
    globalFoldAngles.current.length !== runtime.FOLD_Y_POSITIONS.length
  ) {
    globalFoldAngles.current = new Float32Array(
      runtime.FOLD_Y_POSITIONS.length,
    );
  }

  useEffect(() => {
    foldSound.current = new Audio("/paper-fold.mp3");
    if (foldSound.current) foldSound.current.volume = 1;

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

    // محاسبه زاویه‌ها فقط یک‌بار انجام می‌شود
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
      if (foldSound.current && paperProgress > 0 && hasInteracted.current) {
        foldSound.current.currentTime = 0;
        foldSound.current.play().catch(() => {});
      }
    }
  });

  // 🚀 OPTIMIZATION 4: مهم‌ترین بخش! قفل کردن آرایه پنل‌ها
  // با این کار در رندرهای اضافی، آرایه پنل‌ها از نو ساخته نمی‌شود.
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
        />
      ))}
      <BismillahText3D surfaceZ={PAGE_DEPTH / 2} />
    </group>
  );
};
