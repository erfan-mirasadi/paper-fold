"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { PAGE_WIDTH, SURAH_DATA } from "../../data/SurahConfig";
import { QURAN_FONT, TEXT_SIZES } from "../../data/theme";
import { useElevatedStore } from "../elevated-verses/useElevatedStore";
import { CanvasText } from "../../shared/CanvasText";

const TOP_EDGE_OFFSET = 0.01;
const MANUAL_DOWN_SHIFT = -0.0008;
const FRONT_CLEARANCE = 0.016;
const EXTRUSION_LAYERS = 3;
const EXTRUSION_STEP = 0.00095;

interface BismillahFloatingText3DProps {
  surfaceZ: number;
  isDarkMode?: boolean;
}

export function BismillahFloatingText3D({
  surfaceZ,
  isDarkMode = false,
}: BismillahFloatingText3DProps) {
  const isElevatedPhase = useElevatedStore((s) => s.phase === "elevated");

  const layers = isDarkMode ? 4 : EXTRUSION_LAYERS;
  const step = isDarkMode ? 0.0006 : EXTRUSION_STEP;
  const baseRenderOrder = isElevatedPhase ? 70 : 270;
  const frontRenderOrder = isElevatedPhase ? 89 : 290;

  const bismillahColor = isDarkMode ? "#F2F2ED" : "#000000";

  const depthColors = useMemo(() => {
    const color = new THREE.Color(bismillahColor);

    return Array.from({ length: layers }, () => {
      return color.clone().getStyle();
    });
  }, [bismillahColor, layers]);

  const bismillahText = SURAH_DATA.bismillah;
  const maxWidth = PAGE_WIDTH * 0.9;
  const bismillahHeight = 0.14; // Tighter height for Bismillah

  return (
    <group
      position={[
        0,
        TOP_EDGE_OFFSET + MANUAL_DOWN_SHIFT,
        surfaceZ + FRONT_CLEARANCE,
      ]}
    >
      {depthColors.map((color, i) => {
        const z = -(layers - i) * step;

        return (
          <CanvasText
            key={`bismillah-depth-${i}`}
            text={bismillahText}
            font={QURAN_FONT}
            fontSize={TEXT_SIZES.BISMILLAH}
            color={color}
            textAlign="center"
            verticalAlign="bottom"
            width={maxWidth}
            height={bismillahHeight}
            position={[0, bismillahHeight / 2, z]}
            renderOrder={baseRenderOrder + i}
          >
            <meshStandardMaterial
              color={color}
              metalness={0.95}
              roughness={0.3}
              envMapIntensity={1.6}
              transparent
              depthTest={false}
            />
          </CanvasText>
        );
      })}

      <CanvasText
        text={bismillahText}
        font={QURAN_FONT}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={bismillahColor}
        textAlign="center"
        verticalAlign="bottom"
        width={maxWidth}
        height={bismillahHeight}
        position={[0, bismillahHeight / 2, 0.0008]}
        renderOrder={frontRenderOrder}
      >
        <meshPhysicalMaterial
          color={bismillahColor}
          metalness={1}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={2}
          transparent
          depthTest={false}
        />
      </CanvasText>
    </group>
  );
}
