"use client";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { CanvasText } from "../shared/CanvasText";
import { HANDWRITTEN_FONT } from "../../../data/theme";
import type { HandwrittenNoteConfig } from "../../../data/schema";

/**
 * Deterministic per-line "wobble" so untouched lines still look hand-drawn
 * instead of perfectly straight — same seed every render (no `Math.random`,
 * which would otherwise re-jitter on every re-render/hydration).
 */
function autoWobbleRotation(index: number): number {
  return Math.sin(index * 12.9898) * 0.012;
}
function autoWobbleY(index: number): number {
  return Math.cos(index * 7.233) * 0.0015;
}

function NoteSvg({
  src, x, y, scaleX, scaleY, rotationZ, renderOrder,
}: {
  src: string; x: number; y: number;
  scaleX: number; scaleY: number; rotationZ: number; renderOrder: number;
}) {
  const tex = useTexture(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  return (
    <mesh position={[x, y, 0.0006]} scale={[scaleX, scaleY, 1]} rotation={[0, 0, rotationZ]} renderOrder={renderOrder}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/**
 * Renders a per-surah handwritten margin note as a stack of canvas-texture
 * text lines (same text-to-texture technique used for Arabic/Latin verse
 * text — see `CanvasText`), using the cursive `HANDWRITTEN_FONT` instead of
 * the Quran/Latin fonts. Each line gets its own small group so it can carry
 * an independent size/rotation/offset, which is what sells the "actually
 * handwritten" look rather than one perfectly uniform text block.
 */
export function HandwrittenNote({ note }: { note: HandwrittenNoteConfig }) {
  const {
    lines,
    x,
    y,
    fontSize,
    color = "#2a2a2a",
    lineSpacing = 1.4,
    maxWidth,
    textAlign = "left",
    rotationZ = 0,
    opacity = 0.94,
    renderOrder = 20,
    svg,
  } = note;

  const baseMaxWidth = maxWidth ?? fontSize * 12;
  const lineGap = fontSize * lineSpacing;
  const alignSign = textAlign === "right" ? -1 : textAlign === "center" ? 0 : 1;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, rotationZ]}>
      {lines.map((line, i) => {
        const lineScale = line.scale ?? 1;
        const lineFontSize = fontSize * lineScale;
        const lineW = baseMaxWidth * lineScale;
        // Cursive scripts (loopy ascenders/descenders) need far more vertical
        // headroom than a normal font's ~1.2x line-height — otherwise the
        // canvas clips tall swashes top/bottom. This is decoupled from
        // `lineGap` (row-to-row spacing, driven by `lineSpacing`), so a taller
        // box here doesn't push lines further apart.
        const lineH = lineFontSize * 3;
        const lineRotation = line.rotation ?? autoWobbleRotation(i);
        const lineOffsetY = line.offsetY ?? autoWobbleY(i);
        const lineX = line.offsetX ?? 0;
        const lineY = -i * lineGap + lineOffsetY;

        return (
          <group key={i} position={[lineX, lineY, 0]} rotation={[0, 0, lineRotation]}>
            <CanvasText
              text={line.text}
              font={HANDWRITTEN_FONT}
              fontSize={lineFontSize}
              color={color}
              width={lineW}
              height={lineH}
              maxWidth={lineW}
              textAlign={textAlign}
              verticalAlign="middle"
              renderOrder={renderOrder}
              depthTest={false}
              opacity={opacity}
              position={[(alignSign * lineW) / 2, 0, 0]}
            />
          </group>
        );
      })}
      {svg && (
        <NoteSvg
          src={svg.src}
          x={svg.offsetX ?? 0}
          y={svg.offsetY ?? -lines.length * lineGap}
          scaleX={svg.scaleX ?? 0.3}
          scaleY={svg.scaleY ?? 0.3}
          rotationZ={svg.rotationZ ?? 0}
          renderOrder={renderOrder + 1}
        />
      )}
    </group>
  );
}
