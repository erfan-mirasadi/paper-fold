"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { RenderTexture, OrthographicCamera } from "@react-three/drei";
import { VerseBox, RoundedShapeComponent } from "../../SurahLayout/SharedUI";
import {
  SURAH_TRANSFORMS,
  SURAH_DATA,
  PAGE_WIDTH,
} from "../../data/SurahConfig";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import {
  S1_ANA_BG,
  S1_ANA_BORDER,
  S1_VERSE_5_NUMBER_BG,
  S1_VERSE_5_NUMBER_BORDER,
  S1_VERSE_5_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
} from "../../data/theme";
import { SHADOW_CONFIG } from "./useFoldAnimation";
import { useElevatedStore } from "../elevated-verses/useElevatedStore";
import { useElevateAnimation } from "../elevated-verses/useElevateAnimation";
import { a } from "@react-spring/three";

// --- ADJUSTABLE PARAMETERS ---
const EXTRUDE_DEPTH = 0.01; // How thick the 3D object is
const Z_OFFSET = 0.01; // Distance from the paper surface
const SHADOW_OPACITY = 0.45; // Shadow intensity
const BW = 0.0055; // Border width to match VerseBox
const SHADOW_SCALE = 1.02; // Shadow slightly larger than object

export function VerseFiveMetallic() {
  const isElevated = useElevatedStore((s) => s.activeVerseId === 5);
  const { liftZ, tiltX, scale, shadowOpacity } =
    useElevateAnimation(isElevated);

  const t = SURAH_TRANSFORMS.s1.anaAyet;
  const data = SURAH_DATA.section1.anaAyet;

  const w = t.w;
  const h = t.h;
  const radius = 0.05; // Base radius for non-pill verse

  const outerW = w + BW * 2;
  const outerH = h + BW * 2;
  const outerRadius = radius + BW / 2; // Adjusted to look natural

  const zBasePosition = PAGE_DEPTH / 2 + Z_OFFSET;

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

  const extrudeSettings = useMemo(
    () => ({ depth: EXTRUDE_DEPTH, bevelEnabled: false }),
    [],
  );

  return (
    <group position={[t.x - PAGE_WIDTH / 2 - BW, t.y + BW, zBasePosition]}>
      {/* Static Shadow - Larger and slightly above paper to avoid flicker */}
      {/* Also adds the dynamic elevate shadow opacity on top of static opacity */}
      <group
        position={[
          SHADOW_CONFIG.baseOffsetX - (outerW * (SHADOW_SCALE - 1)) / 2,
          SHADOW_CONFIG.baseOffsetY + (outerH * (SHADOW_SCALE - 1)) / 2,
          -Z_OFFSET + 0.001,
        ]}
        scale={[SHADOW_SCALE, SHADOW_SCALE, 1]}
      >
        <mesh>
          <RoundedShapeComponent w={outerW} h={outerH} radius={outerRadius} />
          <a.meshBasicMaterial
            color="#000000"
            transparent
            opacity={shadowOpacity.to((o) => Math.max(o, SHADOW_OPACITY))}
          />
        </mesh>
      </group>

      {/* Animated 3D Body + Content */}
      <a.group
        position-z={liftZ}
        rotation-x={tiltX}
        scale-x={scale}
        scale-y={scale}
      >
        {/* Metallic Body */}
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial
            color={S1_ANA_BG}
            metalness={1}
            roughness={0.12}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* Content Overlay - Shifted to accommodate border and circle */}
        <mesh position={[outerW / 2, -outerH / 2, EXTRUDE_DEPTH + 0.001]}>
          <planeGeometry args={[outerW, outerH]} />
          <meshStandardMaterial
            transparent
            opacity={1}
            metalness={0.4}
            roughness={0.3}
          >
            <RenderTexture
              attach="map"
              width={512}
              height={256}
              frames={Infinity}
            >
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
                  border={S1_ANA_BORDER}
                  circleBorderCol={S1_VERSE_5_NUMBER_BORDER}
                  circleBg={S1_VERSE_5_NUMBER_BG}
                  circleTextCol={S1_VERSE_5_NUMBER_TEXT}
                  textColor={S1_VERSE_5_TEXT}
                  isPill={false}
                  shadow={false}
                />
              </group>
            </RenderTexture>
          </meshStandardMaterial>
        </mesh>
      </a.group>
    </group>
  );
}
