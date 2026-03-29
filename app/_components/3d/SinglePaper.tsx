"use client";

import { RenderTexture, useTexture } from "@react-three/drei";
import { PaperContent } from "./PaperContent";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import React, { useMemo, useRef } from "react";
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

// Controls the speed of the easing
const easingFactor = 0.5;
// Controls the strength of the curves
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;

export const PAGE_WIDTH = 1.28;
export const PAGE_HEIGHT = 1.71;
export const PAGE_DEPTH = 0.003;
// INCREASED segments for higher resolution paper and sharper folds!
const PAGE_SEGMENTS = 50;
const SEGMENT_HEIGHT = PAGE_HEIGHT / PAGE_SEGMENTS;

// Base geometry setup (Segments applied to Y axis)
const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  2,
  PAGE_SEGMENTS,
);

// Translate so the TOP of the paper is at Y=0
pageGeometry.translate(0, -PAGE_HEIGHT / 2, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

// Apply skinning weights vertically
for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const y = vertex.y;

  const distFromTop = -y;
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

// Exact colors from your source code
const whiteColor = new Color("white");

interface SinglePaperProps {
  isFolded: boolean;
}

export const SinglePaper: React.FC<SinglePaperProps> = ({ isFolded }) => {
  const group = useRef<Group>(null);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);

  // Load the normal map
  const creaseNormalMap = useTexture("/crease-normal.png");

  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.y = 0;
      } else {
        bone.position.y = -SEGMENT_HEIGHT;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      new MeshStandardMaterial({ color: whiteColor }), // side
      new MeshStandardMaterial({ color: "#111" }), // side
      new MeshStandardMaterial({ color: whiteColor }), // top
      new MeshStandardMaterial({ color: whiteColor }), // bottom
      new MeshStandardMaterial({ color: whiteColor, roughness: 0.1 }), // front
      new MeshStandardMaterial({ color: whiteColor, roughness: 0.1 }), // back
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
    if (!skinnedMeshRef.current || !group.current) {
      return;
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    const baseRotation = degToRad(10);

    const middleBoneIndex = Math.floor(PAGE_SEGMENTS / 2);

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const normalizedI = (i / PAGE_SEGMENTS) * 30;
      const insideCurveIntensity =
        normalizedI < 8 ? Math.sin(normalizedI * 0.2 + 0.25) : 0;
      const outsideCurveIntensity =
        normalizedI >= 8 ? Math.cos(normalizedI * 0.3 + 0.09) : 0;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * baseRotation -
        outsideCurveStrength * outsideCurveIntensity * baseRotation;

      if (i === middleBoneIndex || i === middleBoneIndex + 1) {
        const foldAngle = isFolded ? (Math.PI - 0.02) / 2 : 0;
        rotationAngle += foldAngle;
      }

      easing.dampAngle(
        target.rotation,
        "x",
        rotationAngle,
        easingFactor,
        delta,
      );
    }
  });

  return (
    <group ref={group} position={[0, PAGE_HEIGHT / 2, 0]}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef}>
        <meshStandardMaterial
          attach="material-4"
          roughness={0.55}
          color={whiteColor}
          normalMap={creaseNormalMap}
          normalScale={new Vector2(0.8, 0.8)}
        >
          <RenderTexture attach="map" width={1200} height={1700}>
            <PaperContent />
          </RenderTexture>
        </meshStandardMaterial>
      </primitive>
    </group>
  );
};
