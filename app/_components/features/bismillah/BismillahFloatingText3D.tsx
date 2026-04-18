"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { PAGE_WIDTH, SURAH_DATA } from "../../data/SurahConfig";
import { QURAN_FONT, TEXT_SIZES } from "../../data/theme";

const TOP_EDGE_OFFSET = 0.01;
const FRONT_CLEARANCE = 0.016;
const EXTRUSION_LAYERS = 8;
const EXTRUSION_STEP = 0.00085;

interface BismillahFloatingText3DProps {
  surfaceZ: number;
}

export function BismillahFloatingText3D({
  surfaceZ,
}: BismillahFloatingText3DProps) {
  const depthColors = useMemo(() => {
    const nearColor = new THREE.Color("#000000");
    const farColor = new THREE.Color("#000000");

    return Array.from({ length: EXTRUSION_LAYERS }, (_, i) => {
      const t = i / Math.max(1, EXTRUSION_LAYERS - 1);
      return farColor.clone().lerp(nearColor, t).getStyle();
    });
  }, []);

  return (
    <group position={[0, TOP_EDGE_OFFSET, surfaceZ + FRONT_CLEARANCE]}>
      {depthColors.map((color, i) => {
        const z = -(EXTRUSION_LAYERS - i) * EXTRUSION_STEP;

        return (
          <Text
            key={`bismillah-depth-${i}`}
            position={[0, 0, z]}
            font={QURAN_FONT}
            fontSize={TEXT_SIZES.BISMILLAH}
            color={color}
            anchorX="center"
            anchorY="bottom"
            textAlign="center"
            direction="rtl"
            maxWidth={PAGE_WIDTH * 0.9}
            renderOrder={270 + i}
          >
            {SURAH_DATA.bismillah}
            <meshStandardMaterial
              color={color}
              metalness={0.95}
              roughness={0.3}
              envMapIntensity={1.6}
            />
          </Text>
        );
      })}

      <Text
        position={[0, 0, 0.0008]}
        font={QURAN_FONT}
        fontSize={TEXT_SIZES.BISMILLAH}
        color="#000000"
        anchorX="center"
        anchorY="bottom"
        textAlign="center"
        direction="rtl"
        maxWidth={PAGE_WIDTH * 0.9}
        renderOrder={290}
      >
        {SURAH_DATA.bismillah}
        <meshPhysicalMaterial
          color="#000000"
          metalness={1}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={2}
        />
      </Text>
    </group>
  );
}
