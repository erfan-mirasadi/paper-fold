"use client";

import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { PAGE_WIDTH, SURAH_DATA } from "../../../data/SurahConfig";
import { QURAN_FONT, TEXT_SIZES } from "../../../data/theme";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { CanvasText } from "../shared/CanvasText";

const TOP_EDGE_OFFSET = -0.02;
const MANUAL_DOWN_SHIFT = -0.0008;
const FRONT_CLEARANCE = 0.016;

interface BismillahText3DProps {
  surfaceZ: number;
}

export function BismillahText3D({
  surfaceZ,
}: BismillahText3DProps) {
  const isElevatedPhase = useElevatedStore((s) => s.phase === "elevated");

  const layers = 4;
  const step = 0.0006;
  const baseRenderOrder = isElevatedPhase ? 70 : 270;
  const frontRenderOrder = isElevatedPhase ? 89 : 290;

  const materialsRef = useRef<(THREE.Material | null)[]>([]);

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document !== "undefined") {
        const isDark = document.documentElement.classList.contains("dark");
        const colorStr = isDark ? "#F2F2ED" : "#000000";
        const color = new THREE.Color(colorStr);
        materialsRef.current.forEach((mat) => {
          if (mat && "color" in mat) {
            (mat as any).color.copy(color);
          }
        });
      }
    };

    updateTheme();

    window.addEventListener("themeChange", updateTheme);

    const observer = new MutationObserver(updateTheme);
    if (typeof document !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      window.removeEventListener("themeChange", updateTheme);
      observer.disconnect();
    };
  }, []);

  const baseCanvasColor = "#FFFFFF";

  const depthColors = useMemo(() => {
    return Array.from({ length: layers }, () => baseCanvasColor);
  }, [layers]);

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
              color="#000000"
              metalness={0.95}
              roughness={0.3}
              envMapIntensity={1.6}
              transparent
              depthTest={true}
              ref={(m) => {
                materialsRef.current[i] = m;
              }}
            />
          </CanvasText>
        );
      })}

      <CanvasText
        text={bismillahText}
        font={QURAN_FONT}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={baseCanvasColor}
        textAlign="center"
        verticalAlign="bottom"
        width={maxWidth}
        height={bismillahHeight}
        position={[0, bismillahHeight / 2, 0.0008]}
        renderOrder={frontRenderOrder}
      >
        <meshPhysicalMaterial
          color="#000000"
          metalness={1}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={2}
          transparent
          depthTest={true}
          ref={(m) => {
            materialsRef.current[layers] = m;
          }}
        />
      </CanvasText>
    </group>
  );
}
