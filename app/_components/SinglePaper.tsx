"use client";

import {
  OrthographicCamera,
  RenderTexture,
  useScroll,
  useTexture,
} from "@react-three/drei";
import {
  FOLD_Y_POSITIONS,
  PaperContent,
  PAGE_WIDTH,
  PAGE_HEIGHT,
} from "./paper-content/index";
import { getFoldAnglesForScroll, FOLD_STORY_STEPS } from "./FoldStory";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
  Vector2,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Tafsir3DTracker } from "./Tafsir3DTracker";

// Controls the speed of the easing
const easingFactor = 0.5;
//paper curve
const AMBIENT_CURVE_MULTIPLIER = 0.3;

// Controls the strength of the ambient paper curve
const insideCurveStrength = 0.28 * AMBIENT_CURVE_MULTIPLIER;
const outsideCurveStrength = 0.05 * AMBIENT_CURVE_MULTIPLIER;

export const PAGE_DEPTH = 0.003;

// segment for millimeter precision of hinges
const PAGE_SEGMENTS = 120;
const SEGMENT_HEIGHT = PAGE_HEIGHT / PAGE_SEGMENTS;

// Fractional bone position per crease line.
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

// Translate so the TOP edge of the paper is at Y = 0
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

// Changed to a slight off-white for better lighting interaction without washing out
const paperBaseColor = new Color("#f2f0e6");

export const SinglePaper: React.FC = () => {
  const group = useRef<Group>(null);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);
  const scroll = useScroll();

  const creaseNormalMap = useTexture("/crease-normal.png");

  // ---- Audio Setup ----
  const foldSound = useRef<HTMLAudioElement | null>(null);
  const lastActiveStage = useRef<number>(0);

  useEffect(() => {
    // Load the sound effect from the public folder
    foldSound.current = new Audio("/paper-fold.mp3");
    if (foldSound.current) {
      foldSound.current.volume = 1;
    }
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
      new MeshStandardMaterial({ color: paperBaseColor }), // side L
      new MeshStandardMaterial({ color: "#111" }), // side R
      new MeshStandardMaterial({ color: paperBaseColor }), // top cap
      new MeshStandardMaterial({ color: paperBaseColor }), // bottom cap
      // Initial materials, the front face will be overridden by the primitive material
      new MeshStandardMaterial({ color: paperBaseColor, roughness: 0.8 }), // front face
      new MeshStandardMaterial({ color: paperBaseColor, roughness: 0.8 }), // back face
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) return;

    const bones = skinnedMeshRef.current.skeleton.bones;
    const baseRotation = degToRad(10);

    //Paper unfolds from the start (intro removed)
    // const INTRO_SCROLL_RATIO = 0.3;
    let paperProgress = scroll.offset;

    /*
    if (scroll.offset > INTRO_SCROLL_RATIO) {
      paperProgress =
        (scroll.offset - INTRO_SCROLL_RATIO) / (1 - INTRO_SCROLL_RATIO);
    }
    */

    const maxStageIndex = FOLD_STORY_STEPS.length - 1;
    const currentStage = Math.round(paperProgress * maxStageIndex);

    if (currentStage !== lastActiveStage.current) {
      lastActiveStage.current = currentStage;
      if (foldSound.current && paperProgress > 0) {
        foldSound.current.currentTime = 0;
        foldSound.current.play().catch(() => {});
      }
    }

    // Get the dynamic angles from our state machine
    const targetFoldAngles = getFoldAnglesForScroll(paperProgress);
    const foldContributions = new Float32Array(bones.length);

    targetFoldAngles.forEach((totalAngle, foldIdx) => {
      const rawBonePos = foldBonePositions[foldIdx];
      const lowerBone = Math.floor(rawBonePos);
      const upperBone = Math.min(lowerBone + 1, bones.length - 1);
      const blendToUpper = rawBonePos - lowerBone;

      foldContributions[lowerBone] += totalAngle * (1 - blendToUpper);
      foldContributions[upperBone] += totalAngle * blendToUpper;
    });

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      // Ambient paper curve
      const normalizedI = (i / PAGE_SEGMENTS) * 30;
      const insideCurveIntensity =
        normalizedI < 8 ? Math.sin(normalizedI * 0.2 + 0.25) : 0;
      const outsideCurveIntensity =
        normalizedI >= 8 ? Math.cos(normalizedI * 0.3 + 0.09) : 0;

      const curveAngle =
        insideCurveStrength * insideCurveIntensity * baseRotation -
        outsideCurveStrength * outsideCurveIntensity * baseRotation;

      const targetAngle = curveAngle + foldContributions[i];

      easing.dampAngle(target.rotation, "x", targetAngle, easingFactor, delta);
    }
  });

  return (
    <group ref={group} position={[0, PAGE_HEIGHT / 2, 0]}>
      <Tafsir3DTracker skeleton={manualSkinnedMesh.skeleton} />

      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef}>
        <meshStandardMaterial
          attach="material-4"
          roughness={0.8}
          metalness={0.05} // Just a tiny bit of density to help the bumps catch light
          color={paperBaseColor}
          bumpScale={0.015} // This controls how high the elements pop out (adjust if needed)
          normalScale={new Vector2(0.8, 0.8)} // Keeps your creases intact
          envMapIntensity={0.5} // Balanced to show off the bumps without blowing out colors
        >
          {/* 1. The main color content map */}
          <RenderTexture attach="map" width={1200} height={1700}>
            <PaperContent />
          </RenderTexture>

          {/* 2. The new Bump Map for the embossed UI elements! */}
          <RenderTexture attach="bumpMap" width={1200} height={1700}>
            <PaperContent isBumpMap={true} />
          </RenderTexture>

          {/* 3. The existing Normal Map for the folded creases */}
          <RenderTexture attach="normalMap" width={1200} height={1700}>
            <color attach="background" args={["#8080ff"]} />
            <OrthographicCamera
              makeDefault
              left={0}
              right={PAGE_WIDTH}
              top={0}
              bottom={-PAGE_HEIGHT}
              position={[0, 0, 5]}
            />
            {FOLD_Y_POSITIONS.map((y, i) => (
              <mesh key={i} position={[PAGE_WIDTH / 2, y, i * 0.01]}>
                <planeGeometry args={[PAGE_WIDTH, 0.2]} />
                <meshBasicMaterial
                  map={creaseNormalMap}
                  transparent={true}
                  depthTest={false}
                />
              </mesh>
            ))}
          </RenderTexture>
        </meshStandardMaterial>
      </primitive>
    </group>
  );
};
