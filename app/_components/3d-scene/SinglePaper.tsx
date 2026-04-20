"use client";
import {
  OrthographicCamera,
  RenderTexture,
  useScroll,
  useTexture,
} from "@react-three/drei";
import {
  FOLD_Y_POSITIONS,
  SurahLayout as PaperContent,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  layoutMath,
} from "../SurahLayout/index";
import { getFoldAnglesForScroll, FOLD_STORY_STEPS } from "./FoldStory";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import {
  Bone,
  BoxGeometry,
  ClampToEdgeWrapping,
  Color,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
  Vector2,
  NoColorSpace,
  RepeatWrapping,
} from "three";
import { BismillahFloatingText3D } from "../features/bismillah/BismillahFloatingText3D";
import { PAGE_BG_COLOR } from "../data/theme";

const easingFactor = 0.5;
const CREASE_BAND_HEIGHT = 0.05;
const CREASE_NORMAL_OPACITY = 1;

const PAPER_NORMAL_OPACITY = 0.75;

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

// Changed to a slight off-white for better lighting interaction without washing out
const paperBaseColor = new Color("#f2f0e6");
const paperBackColor = new Color(PAGE_BG_COLOR);
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
}

export const SinglePaper: React.FC<SinglePaperProps> = ({
  isFolded = false,
  isDarkMode = false,
}) => {
  const group = useRef<Group>(null);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);
  const scroll = useScroll();
  const creaseNormalMap = useTexture("/crease-normal.png", (texture) => {
    texture.colorSpace = NoColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.repeat.set(5, 1);
    texture.needsUpdate = true;
  });
  const paperTextureNormal = useTexture(
    "/Paper-Texture-7_normal.png",
    (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;
    },
  );

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
      new MeshStandardMaterial({ color: paperBaseColor, roughness: 0.8 }), // front face
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
    const maxStageIndex = FOLD_STORY_STEPS.length - 1;
    const currentStage = Math.round(paperProgress * maxStageIndex);

    if (currentStage !== lastActiveStage.current) {
      lastActiveStage.current = currentStage;
      // Guard against browser autoplay policy — only play after first user interaction.
      if (foldSound.current && paperProgress > 0 && hasInteracted.current) {
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

      const targetAngle = foldContributions[i];

      easing.dampAngle(target.rotation, "x", targetAngle, easingFactor, delta);
    }
  });

  return (
    <group ref={group} position={[0, PAGE_HEIGHT / 2, 0]}>
      {/* <Tafsir3DTracker skeleton={manualSkinnedMesh.skeleton} /> */}

      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef}>
        <meshStandardMaterial
          attach="material-4"
          roughness={0.8}
          metalness={0.05} // Just a tiny bit of density to help the bumps catch light
          color={paperBaseColor}
          bumpScale={0.015} // This controls how high the elements pop out (adjust if needed)
          normalScale={new Vector2(0.8, 0.8)}
          envMapIntensity={0.5} // Balanced to show off the bumps without blowing out colors
        >
          {/* The main color content map (Offsets removed to fix layout drop) */}
          <RenderTexture attach="map" width={1200} height={1700}>
            <PaperContent isFolded={isFolded} />
          </RenderTexture>

          {/* The new Bump Map for the embossed UI elements */}
          <RenderTexture attach="bumpMap" width={1200} height={1700}>
            <PaperContent isBumpMap={true} />
          </RenderTexture>

          {/* The existing Normal Map for the folded creases */}
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

            {/* The base paper normal texture covering the entire page */}
            <mesh
              position={[PAGE_WIDTH / 2, -PAGE_HEIGHT / 2, -1]}
              renderOrder={0}
            >
              <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
              <meshBasicMaterial
                map={paperTextureNormal}
                transparent={true}
                opacity={PAPER_NORMAL_OPACITY}
                depthTest={false}
                toneMapped={false}
              />
            </mesh>

            {/* Render order 10 so creases render ON TOP of the base paper texture */}
            {FOLD_Y_POSITIONS.map((y, i) => (
              <mesh
                key={i}
                position={[PAGE_WIDTH / 2, y, i * 0.01]}
                renderOrder={10}
              >
                <planeGeometry args={[PAGE_WIDTH, CREASE_BAND_HEIGHT]} />
                <meshBasicMaterial
                  map={creaseNormalMap}
                  transparent={true}
                  opacity={CREASE_NORMAL_OPACITY}
                  depthTest={false}
                  toneMapped={false}
                />
              </mesh>
            ))}

            {/* Vertical crease line between verses 7 to 18 */}
            <mesh
              position={[
                PAGE_WIDTH / 2,
                (layoutMath.g1Y + (layoutMath.g3Y - layoutMath.groupH)) / 2,
                0.62,
              ]}
              rotation={[0, 0, Math.PI / 2]}
              renderOrder={10}
            >
              {/* CHANGED: Made the thickness match the new CREASE_BAND_HEIGHT instead of 0.25 */}
              <planeGeometry
                args={[
                  layoutMath.g1Y - (layoutMath.g3Y - layoutMath.groupH),
                  CREASE_BAND_HEIGHT,
                ]}
              />
              <meshBasicMaterial
                map={creaseNormalMap}
                transparent={true}
                opacity={CREASE_NORMAL_OPACITY}
                depthTest={false}
                toneMapped={false}
              />
            </mesh>

            {/* Vertical crease line between verses 1 to 4 (Section 1) */}
            <mesh
              position={[
                PAGE_WIDTH / 2,
                layoutMath.s1Top -
                  layoutMath.s1Pad -
                  (layoutMath.smallBoxH + layoutMath.gap / 2),
                0.62,
              ]}
              rotation={[0, 0, Math.PI / 2]}
              renderOrder={10}
            >
              {/* CHANGED: Made the thickness match the new CREASE_BAND_HEIGHT instead of 0.25 */}
              <planeGeometry
                args={[
                  layoutMath.smallBoxH * 2 + layoutMath.gap,
                  CREASE_BAND_HEIGHT,
                ]}
              />
              <meshBasicMaterial
                map={creaseNormalMap}
                transparent={true}
                opacity={CREASE_NORMAL_OPACITY}
                depthTest={false}
                toneMapped={false}
              />
            </mesh>
          </RenderTexture>
        </meshStandardMaterial>
      </primitive>

      <BismillahFloatingText3D
        surfaceZ={PAGE_DEPTH / 2}
        isDarkMode={isDarkMode}
      />
    </group>
  );
};
