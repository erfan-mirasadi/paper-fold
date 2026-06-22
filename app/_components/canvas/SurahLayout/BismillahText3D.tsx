"use client";

import { useMemo, useEffect, useRef, useState } from "react";
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

// ─── Font tracking — mirrors CanvasText's fontsLoadedKey pattern ─────────────
// Ensures the canvas is re-drawn after the QuranFont family is fully registered.
function useFontsLoadedKey(): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let active = true;
    const onFontsReady = () => {
      document.fonts.ready.then(() => {
        if (active) setTimeout(() => setKey((k) => k + 1), 100);
      });
    };
    onFontsReady();
    if ("fonts" in document) {
      document.fonts.addEventListener("loadingdone", onFontsReady);
      return () => {
        active = false;
        document.fonts.removeEventListener("loadingdone", onFontsReady);
      };
    }
    return () => {
      active = false;
    };
  }, []);
  return key;
}

// ─── Shared depth texture factory ────────────────────────────────────────────
// Creates ONE CanvasTexture that all depth-shadow layers will share.
// Called inside useMemo so it only re-runs on text/size/font changes.
//
// NOTE: BismillahText3D uses Canvas 2D (not Three.js TextGeometry + Earcut),
// so there is no triangulation blocking. The optimization here is preventing
// 4× duplicate canvas allocations for layers that are visually identical.
function createDepthCanvasTexture(
  text: string,
  fontSize: number,
  maxWidth: number,
  height: number,
  color: string,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const scaleFactor = 1024;
  const dpr = 3; // matches CanvasText default resolution
  const canvasW = Math.floor(maxWidth * scaleFactor * dpr);
  const canvasH = Math.floor(height * scaleFactor * dpr);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvasW, canvasH);

  // "QuranFont" is the family name registered by PaperMaterial's preloadFontUrl.
  // PaperMaterial is always mounted on the primary panel before BismillahText3D renders.
  const scaledFontSize = fontSize * scaleFactor * dpr;
  ctx.font = `normal normal ${scaledFontSize}px "QuranFont", Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  
  // Replicate CanvasText's verticalAlign="bottom" math to ensure perfect overlap
  ctx.textBaseline = "bottom";
  const lineHeight = 1.2;
  const startY = canvasH - (scaledFontSize * lineHeight) / 2;
  
  ctx.fillText(text, canvasW / 2, startY);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 1;
  return tex;
}

export function BismillahText3D({ surfaceZ }: BismillahText3DProps) {
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
  const bismillahText = SURAH_DATA.bismillah;
  const maxWidth = PAGE_WIDTH * 0.9;
  const bismillahHeight = 0.14;

  // Track font load state so the canvas re-renders after QuranFont is ready.
  const fontsLoadedKey = useFontsLoadedKey();

  // 🚀 OPTIMIZATION: ONE CanvasTexture shared by ALL 4 depth shadow layers.
  //
  // Previously: 4 separate CanvasText components → 4 canvas allocations + 4 GPU texture
  // uploads at mount, and all 4 re-created synchronously on every font-load event.
  //
  // Now: 1 canvas allocation → 1 GPU texture upload, shared across all 4 depth meshes.
  // The 4 layers only differ in Z-offset (0.0006 step) and renderOrder — identical content.
  const depthTexture = useMemo(() => {
    if (fontsLoadedKey < 0) return null; // satisfies linter — fontsLoadedKey used as trigger
    return createDepthCanvasTexture(
      bismillahText,
      TEXT_SIZES.BISMILLAH,
      maxWidth,
      bismillahHeight,
      baseCanvasColor,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bismillahText, maxWidth, bismillahHeight, fontsLoadedKey]);

  useEffect(() => {
    // Dispose the old texture when a new one is created or on unmount.
    return () => {
      depthTexture?.dispose();
    };
  }, [depthTexture]);

  return (
    <group
      position={[
        0,
        TOP_EDGE_OFFSET + MANUAL_DOWN_SHIFT,
        surfaceZ + FRONT_CLEARANCE,
      ]}
    >
      {/*
       * 🚀 OPTIMIZED: All 4 depth shadow layers share ONE CanvasTexture instance.
       * Only position.z and renderOrder differ between layers — content is identical.
       * This replaces 4 independent CanvasText components (4× canvas creation).
       */}
      {depthTexture &&
        Array.from({ length: layers }, (_, i) => {
          const z = -(layers - i) * step;
          return (
            <mesh
              key={`bismillah-depth-${i}`}
              renderOrder={baseRenderOrder + i}
              position={[0, bismillahHeight / 2, z]}
            >
              <planeGeometry args={[maxWidth, bismillahHeight]} />
              <meshStandardMaterial
                map={depthTexture}
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
            </mesh>
          );
        })}

      {/* Front layer: separate CanvasText with its own premium physical material */}
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
