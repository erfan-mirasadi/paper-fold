"use client";
import { useScroll } from "@react-three/drei";
import {
  FOLD_Y_POSITIONS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
} from "../SurahLayout/index";
import { FloatingArrows } from "../SurahLayout/FloatingArrows";
import { writeFoldAnglesForScroll, FOLD_STORY_STEPS } from "./FoldStory";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { BismillahFloatingText3D } from "../features/bismillah/BismillahFloatingText3D";
import { PAGE_BG_COLOR } from "../data/theme";
import { PaperMaterial, TextureToggles } from "./PaperMaterial";

const easingFactor = 0.5;
export const PAGE_DEPTH = 0.003;

const PAGE_SEGMENTS = 80;
const SEGMENT_HEIGHT = PAGE_HEIGHT / PAGE_SEGMENTS;

export const foldBonePositions: readonly number[] = FOLD_Y_POSITIONS.map((y) =>
  Math.min(Math.max(Math.abs(y) / SEGMENT_HEIGHT, 0), PAGE_SEGMENTS),
);

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  2,
  PAGE_SEGMENTS,
);

pageGeometry.translate(0, -PAGE_HEIGHT / 2, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const distFromTop = -vertex.y;
  let skinIndex = Math.floor(distFromTop / SEGMENT_HEIGHT);
  skinIndex = Math.max(0, Math.min(skinIndex, PAGE_SEGMENTS - 1));
  const skinWeight = (distFromTop % SEGMENT_HEIGHT) / SEGMENT_HEIGHT;
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

interface SinglePaperProps {
  isFolded?: boolean;
  isDarkMode?: boolean;
  toggles?: TextureToggles;
  onReady?: () => void;
}

export const SinglePaper: React.FC<SinglePaperProps> = ({
  isFolded = false,
  isDarkMode = false,
  toggles = { diffuse: true, normal: true, roughness: false, ao: false },
  onReady,
}) => {
  const group = useRef<Group>(null);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);
  const foldAnglesRef = useRef(new Float32Array(FOLD_Y_POSITIONS.length));
  const foldContributionsRef = useRef(new Float32Array(PAGE_SEGMENTS + 1));
  const scroll = useScroll();
  const [showArrows, setShowArrows] = useState(false);

  // Audio Setup
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

  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.y = i === 0 ? 0 : -SEGMENT_HEIGHT;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      staticSideL,
      staticSideR,
      staticTopCap,
      staticBottomCap,
      new MeshStandardMaterial({ color: paperBaseColor, roughness: 0.8 }), // Temporary front face placeholder
      new MeshBasicMaterial({ color: paperBackColor }), // back face (flat/unlit, no bloom highlights)
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) return;
    const bones = skinnedMeshRef.current.skeleton.bones;
    const paperProgress = scroll.offset;

    const isAtEnd = paperProgress > 0.85;
    // Use functional update or check against a ref to avoid stale closure issues
    setShowArrows((prev) => {
      if (prev !== isAtEnd) return isAtEnd;
      return prev;
    });

    const maxStageIndex = FOLD_STORY_STEPS.length - 1;
    const currentStage = Math.round(paperProgress * maxStageIndex);

    if (currentStage !== lastActiveStage.current) {
      lastActiveStage.current = currentStage;
      if (foldSound.current && paperProgress > 0 && hasInteracted.current) {
        foldSound.current.currentTime = 0;
        foldSound.current.play().catch(() => {});
      }
    }

    const targetFoldAngles = foldAnglesRef.current;
    const foldContributions = foldContributionsRef.current;
    writeFoldAnglesForScroll(paperProgress, targetFoldAngles);
    foldContributions.fill(0, 0, bones.length);

    for (let foldIdx = 0; foldIdx < targetFoldAngles.length; foldIdx++) {
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
      const targetAngle = foldContributions[i];
      easing.dampAngle(target.rotation, "x", targetAngle, easingFactor, delta);
    }
  });

  return (
    <group ref={group} position={[0, PAGE_HEIGHT / 2, 0]}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef}>
        {/* The abstracted material component is injected here */}
        <PaperMaterial
          toggles={toggles}
          isFolded={isFolded}
          onReady={onReady}
        />
      </primitive>

      <BismillahFloatingText3D
        surfaceZ={PAGE_DEPTH / 2}
        isDarkMode={isDarkMode}
      />

      {showArrows && <FloatingArrows />}
    </group>
  );
};
