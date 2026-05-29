"use client";
import * as THREE from "three";
import { useMemo } from "react";
import {
  RenderTexture,
  OrthographicCamera,
  useTexture,
} from "@react-three/drei";
import { CanvasText } from "../shared/CanvasText";
import { VerseBox, RoundedShapeComponent } from "./SharedUI";
import {
  CAPSULE_BORDER_WIDTH,
  VERSE_5_6_19_RADIUS,
} from "../../../data/SurahConfig";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import {
  ANA_AYET_LABEL_BY_LANGUAGE,
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import {
  QURAN_FONT,
  LATIN_LABEL_FONT,
  S1_ANA_BG,
  LANGUAGE_TEXT_SCALE,
  CAPSULE_BG_5,
  S1_ANA_LABEL_BG,
  S1_ANA_LABEL_TEXT,
  S1_VERSE_5_NUMBER_BG,
  S1_VERSE_5_NUMBER_BORDER,
  S1_VERSE_5_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
  TEXT_SIZES,
} from "../../../data/theme";
import { SHADOW_CONFIG } from "../../../hooks/useFoldAnimation";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import {
  ELEVATE_TIMING,
  useElevateAnimation,
} from "../../../hooks/useElevateAnimation";
import { a, to, useSpring } from "@react-spring/three";
import { useElevatedDrag } from "../../../hooks/useElevatedDrag";
import { calculateSectionBounds } from "../../../utils/boundsHelper";
import { dragEngine, useDragState } from "../../../utils/dragEngine";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useIntroSectionOffset } from "../../../hooks/useIntroSectionAnimation";

// --- ADJUSTABLE PARAMETERS ---
const ZERO_OFFSET = { x: 0, y: 0 };
const EXTRUDE_DEPTH = 0.01; // How thick the 3D object is
const Z_OFFSET = 0.01; // Distance from the paper surface
const BW = CAPSULE_BORDER_WIDTH; // Using global thickness
const ANA_LABEL_DEPTH = 0.0035;
const ANA_LABEL_Z_OFFSET = 0.0025;
const ANA_LABEL_PIN_OVERLAP = 0.0015;

// const DECORATIVE_SVG_SIZE = 295;
// const DECORATIVE_SVG_SCALE = 0.00042;
// const DECORATIVE_SVG_COLOR = "#8B7C74";
// const DECORATIVE_SVG_INSET_X = 0.2;
// const DECORATIVE_SVG_Z_OFFSET = 0.004;
// const DECORATIVE_SVG_BRACKET_ROTATION = (Math.PI * 3) / 4;

const CAPSULE_SIDE_EXPAND = 0.025;

const METALLIC_SHADOW = {
  opacityRest: 0,
  opacityLifted: 0.5,
  scaleRest: 1.02,
  scaleLifted: 1.14,
  fadePower: 1.7,
  surfaceScaleDampen: 0.6,
};

const SECTION_SURFACE_SHADOW_MOTION = {
  liftHeight: 0.095,
  liftDelayMs: 120,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
} as const;

function normalizeLiftProgress(lift: number) {
  const ratio = lift / ELEVATE_TIMING.liftHeight;
  return Math.max(0, Math.min(1, ratio));
}

function normalizeSurfaceLiftProgress(surfaceLift: number) {
  const ratio = surfaceLift / 0.095;
  return Math.max(0, Math.min(1, ratio));
}

// function DecorativeSvg({
//   shapes,
//   x,
//   y,
//   rotationZ,
//   mirrorX = false,
// }: {
//   shapes: THREE.Shape[];
//   x: number;
//   y: number;
//   rotationZ: number;
//   mirrorX?: boolean;
// }) {
//   return (
//     <group
//       position={[x, y, EXTRUDE_DEPTH + DECORATIVE_SVG_Z_OFFSET]}
//       rotation={[0, 0, rotationZ]}
//       scale={[
//         mirrorX ? -DECORATIVE_SVG_SCALE : DECORATIVE_SVG_SCALE,
//         -DECORATIVE_SVG_SCALE,
//         DECORATIVE_SVG_SCALE,
//       ]}
//     >
//       <group position={[-DECORATIVE_SVG_SIZE / 2, -DECORATIVE_SVG_SIZE / 2, 0]}>
//         {shapes.map((shape, index) => (
//           <mesh key={index} renderOrder={105}>
//             <shapeGeometry args={[shape]} />
//             <meshBasicMaterial
//               color={DECORATIVE_SVG_COLOR}
//               transparent
//               opacity={1}
//               toneMapped={false}
//               depthWrite={false}
//               side={THREE.DoubleSide}
//             />
//           </mesh>
//         ))}
//       </group>
//     </group>
//   );
// }

function BorderSvg({
  x,
  y,
  w,
  h,
  z,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}) {
  const texture = useTexture("/Group 11.svg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  // ضریب‌های ساده برای تغییر سایز نسبت به خود کپسول:
  // 1.0 یعنی دقیقاً هم‌عرض/هم‌ارتفاع کپسول باشه.
  // مثلاً 1.1 یعنی ۱۰ درصد بزرگتر بشه، یا 0.9 یعنی کوچیکتر بشه.
  const widthScale = 0.8;
  const heightScale = 0.93;

  const renderW = w * widthScale;
  const renderH = h * heightScale;

  return (
    <mesh position={[x + w / 2, y - h / 2, z]} renderOrder={102}>
      <planeGeometry args={[renderW, renderH]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthTest={true}
        depthWrite={false}
        opacity={1}
        toneMapped={false}
      />
    </mesh>
  );
}

export function VerseFiveMetallic() {
  const runtime = useSurahLayoutRuntime();
  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];
  const anaAyetLabel = ANA_AYET_LABEL_BY_LANGUAGE[activeLanguage];
  // const decorativeSvg = useLoader(SVGLoader, "/decorative.svg");
  const isElevated = useElevatedStore((s) => s.activeVerseIds.includes(5));
  const isSectionSurfaceRaised = useElevatedStore((s) =>
    s.activeSectionIds.includes("s1"),
  );
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const {
    liftZ,
    tiltX,
    scale,
    shadowOpacity: elevateShadowOpacity,
  } = useElevateAnimation(isElevated);

  const { surfaceLiftZ } = useSpring({
    surfaceLiftZ: isSectionSurfaceRaised
      ? SECTION_SURFACE_SHADOW_MOTION.liftHeight
      : 0,
    from: { surfaceLiftZ: 0 },
    delay: isSectionSurfaceRaised
      ? SECTION_SURFACE_SHADOW_MOTION.liftDelayMs
      : 0,
    config: SECTION_SURFACE_SHADOW_MOTION.spring,
  });

  const t = SURAH_TRANSFORMS.s1.anaAyet;
  const data = surahData.section1.anaAyet;
  const verseDrag = dragEngine.verses[5];
  const sectionDrag = dragEngine.sections.s1;

  const w = t.w + CAPSULE_SIDE_EXPAND * 2;
  const h = t.h;
  const radius = VERSE_5_6_19_RADIUS; // Base radius for non-pill verse

  const outerW = w + BW * 2;
  const outerH = h + BW * 2;
  const outerRadius = radius + BW / 2; // Adjusted to look natural

  const labelW = SURAH_TRANSFORMS.s1.anaAyetTabW;
  const labelH = SURAH_TRANSFORMS.s1.anaAyetTabH;
  const labelDrop = SURAH_TRANSFORMS.s1.anaAyetLabelDrop;
  const labelRadius = labelH / 2;

  const zBasePosition = PAGE_DEPTH / 2 + Z_OFFSET;
  const baseX = t.x - PAGE_WIDTH / 2 - BW - CAPSULE_SIDE_EXPAND;
  const baseY = t.y + BW;

  const sectionBounds = useMemo(
    () => calculateSectionBounds("s1", SURAH_TRANSFORMS, PAGE_WIDTH),
    [SURAH_TRANSFORMS, PAGE_WIDTH],
  );

  const dragBind = useElevatedDrag({
    enabled:
      (isElevated || isSectionSurfaceRaised) &&
      !useFoldStore.getState().isIntroActive,
    springX: verseDrag.x,
    springY: verseDrag.y,
    dragVerseId: 5,
    sectionBounds,
    sectionSpringX: sectionDrag.x,
    sectionSpringY: sectionDrag.y,
  });

  const isVerseSeparated = useDragState((s) => s.draggedVerseIds.includes(5));
  const separationOffset = useDragState(
    (s) => s.separatedVerseOffsets[5] || ZERO_OFFSET,
  );

  const dragX = to(
    [verseDrag.x, sectionDrag.x],
    (vx, sx) => vx + (isVerseSeparated ? separationOffset.x : sx),
  );
  const dragY = to(
    [verseDrag.y, sectionDrag.y],
    (vy, sy) => vy + (isVerseSeparated ? separationOffset.y : sy),
  );

  const shadowScale = to([liftZ, surfaceLiftZ], (lift, surfaceLift) => {
    const liftProgress = normalizeLiftProgress(lift);
    const surfaceDampen =
      1 -
      normalizeSurfaceLiftProgress(surfaceLift) *
        METALLIC_SHADOW.surfaceScaleDampen;
    const scaledLiftProgress = liftProgress * surfaceDampen;

    return (
      METALLIC_SHADOW.scaleRest +
      (METALLIC_SHADOW.scaleLifted - METALLIC_SHADOW.scaleRest) *
        scaledLiftProgress
    );
  });

  const finalShadowOpacity = to(
    [elevateShadowOpacity, liftZ],
    (elevateOpacity, lift) => {
      if (isIntroActive) return 0;
      const liftProgress = normalizeLiftProgress(lift);
      const blend = Math.pow(liftProgress, METALLIC_SHADOW.fadePower);
      const liftedTarget = Math.max(
        elevateOpacity,
        METALLIC_SHADOW.opacityLifted,
      );

      return (
        METALLIC_SHADOW.opacityRest +
        (liftedTarget - METALLIC_SHADOW.opacityRest) * blend
      );
    },
  );

  const shadowX = to([shadowScale, surfaceLiftZ], (scaleValue, surfaceLift) => {
    const surfaceProgress = normalizeSurfaceLiftProgress(surfaceLift);
    return (
      SHADOW_CONFIG.baseOffsetX +
      SHADOW_CONFIG.directionBiasX * surfaceProgress -
      (outerW * (scaleValue - 1)) / 2
    );
  });

  const shadowY = to(
    shadowScale,
    (scaleValue) => SHADOW_CONFIG.baseOffsetY + (outerH * (scaleValue - 1)) / 2,
  );

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = outerRadius;
    const width = outerW;
    const height = outerH;

    s.moveTo(r, 0);
    s.lineTo(width - r, 0);
    s.quadraticCurveTo(width, 0, width, -r);
    s.lineTo(width, -(height - r));
    s.quadraticCurveTo(width, -height, width - r, -height);
    s.lineTo(r, -height);
    s.quadraticCurveTo(0, -height, 0, -(height - r));
    s.lineTo(0, -r);
    s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }, [outerW, outerH, outerRadius]);

  const labelInnerShape = useMemo(() => {
    const s = new THREE.Shape();
    const r = labelRadius;

    s.moveTo(r, 0);
    s.lineTo(labelW - r, 0);
    s.quadraticCurveTo(labelW, 0, labelW, -r);
    s.lineTo(labelW, -(labelH - r));
    s.quadraticCurveTo(labelW, -labelH, labelW - r, -labelH);
    s.lineTo(r, -labelH);
    s.quadraticCurveTo(0, -labelH, 0, -(labelH - r));
    s.lineTo(0, -r);
    s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }, [labelW, labelH, labelRadius]);

  const extrudeSettings = useMemo(
    () => ({ depth: EXTRUDE_DEPTH, bevelEnabled: false }),
    [],
  );

  const labelExtrudeSettings = useMemo(
    () => ({ depth: ANA_LABEL_DEPTH, bevelEnabled: false }),
    [],
  );

  // const decorativeShapes = useMemo(
  //   () => decorativeSvg.paths.flatMap((path) => SVGLoader.createShapes(path)),
  //   [decorativeSvg.paths],
  // );

  // const decorativeY = -outerH / 2;

  const introMotionRef = useIntroSectionOffset("s1");

  return (
    <group ref={introMotionRef}>
      <a.group {...dragBind} position-x={dragX} position-y={dragY}>
        <group position={[baseX, baseY, zBasePosition]}>
          <a.group
            position-x={shadowX}
            position-y={shadowY}
            position-z={to(surfaceLiftZ, (surfaceLift) => {
              const surfaceProgress = normalizeSurfaceLiftProgress(surfaceLift);
              const surfaceZBias =
                SHADOW_CONFIG.surfaceLiftZBias * surfaceProgress;
              return -Z_OFFSET + 0.001 + surfaceLift + surfaceZBias;
            })}
            scale-x={shadowScale}
            scale-y={shadowScale}
          >
            <mesh renderOrder={90}>
              <RoundedShapeComponent
                w={outerW}
                h={outerH}
                radius={outerRadius}
              />
              <a.meshBasicMaterial
                color="#000000"
                transparent
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
                opacity={finalShadowOpacity}
              />
            </mesh>
          </a.group>

          {/* Animated 3D Body + Content */}
          <a.group
            position-z={liftZ}
            rotation-x={tiltX}
            scale-x={scale}
            scale-y={scale}
          >
            {/* Metallic Body */}
            <mesh position={[0, 0, 0]} renderOrder={100}>
              <extrudeGeometry args={[shape, extrudeSettings]} />
              <meshStandardMaterial
                color={S1_ANA_BG}
                metalness={1}
                roughness={0.12}
                envMapIntensity={1.8}
              />
            </mesh>

            {/* Content Overlay - Shifted to accommodate border and circle */}
            <mesh
              position={[outerW / 2, -outerH / 2, EXTRUDE_DEPTH + 0.001]}
              renderOrder={101}
            >
              <planeGeometry args={[outerW, outerH]} />
              <meshStandardMaterial
                transparent
                opacity={1}
                metalness={0.1}
                roughness={0.8}
              >
                <RenderTexture attach="map" width={512} height={256} frames={4}>
                  <OrthographicCamera
                    makeDefault
                    manual
                    left={0}
                    right={outerW}
                    top={0}
                    bottom={-outerH}
                    position={[0, 0, 10]}
                  />
                  <group position={[BW, -BW, 0]}>
                    <VerseBox
                      x={0}
                      y={0}
                      z={0}
                      w={w}
                      h={h}
                      verse={data.text}
                      number={data.number}
                      bg={S1_ANA_BG}
                      bgOpacity={0}
                      border={CAPSULE_BG_5}
                      circleBorderCol={S1_VERSE_5_NUMBER_BORDER}
                      circleBg={S1_VERSE_5_NUMBER_BG}
                      circleTextCol={S1_VERSE_5_NUMBER_TEXT}
                      textColor={S1_VERSE_5_TEXT}
                      isPill={false}
                      shadow={false}
                      textOffsetY={-0.004}
                    />
                  </group>
                </RenderTexture>
              </meshStandardMaterial>
            </mesh>

            {activeLanguage === "ar" && (
              <>
                {/* --- DECORATIVE SVG COMMENTED OUT ---
                <DecorativeSvg
                  shapes={decorativeShapes}
                  x={outerW - DECORATIVE_SVG_INSET_X}
                  y={decorativeY}
                  rotationZ={-DECORATIVE_SVG_BRACKET_ROTATION}
                />

                <DecorativeSvg
                  shapes={decorativeShapes}
                  x={DECORATIVE_SVG_INSET_X}
                  y={decorativeY}
                  rotationZ={DECORATIVE_SVG_BRACKET_ROTATION}
                  mirrorX
                />
                --- */}

                {/* New SVG Border */}
                <BorderSvg
                  x={0}
                  y={0}
                  w={outerW}
                  h={outerH}
                  z={EXTRUDE_DEPTH + 0.002}
                />
              </>
            )}
          </a.group>

          {/* Keep label out of tilt rotation so it stays mounted on top from all view angles. */}
          <a.group position-z={liftZ} scale-x={scale} scale-y={scale}>
            <group
              position={[
                outerW / 2 - labelW / 2,
                labelH - ANA_LABEL_PIN_OVERLAP - labelDrop,
                EXTRUDE_DEPTH + ANA_LABEL_Z_OFFSET,
              ]}
            >
              <mesh renderOrder={110}>
                <extrudeGeometry
                  args={[labelInnerShape, labelExtrudeSettings]}
                />
                <meshBasicMaterial
                  color={S1_ANA_LABEL_BG}
                  toneMapped={false}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <group
                position={[
                  labelW / 2,
                  -labelH / 2 - 0.002,
                  ANA_LABEL_DEPTH + 0.002,
                ]}
              >
                <CanvasText
                  text={anaAyetLabel}
                  font={activeLanguage === "ar" ? QURAN_FONT : LATIN_LABEL_FONT}
                  fontSize={
                    TEXT_SIZES.ANA_AYET_TAB *
                    LANGUAGE_TEXT_SCALE[activeLanguage].anaAyet
                  }
                  color={S1_ANA_LABEL_TEXT}
                  textAlign="center"
                  width={labelW}
                  height={labelH}
                  fontWeight="bold"
                />
              </group>
            </group>
          </a.group>
        </group>
      </a.group>
    </group>
  );
}
