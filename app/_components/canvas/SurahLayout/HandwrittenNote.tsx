"use client";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { CanvasText } from "../shared/CanvasText";
import { HANDWRITTEN_FONT, QURAN_FONT } from "../../../data/theme";
import type { HandwrittenNoteConfig } from "../../../data/schema";
import {
  resolveNoteForLanguage,
  resolveNoteSvgForLanguage,
} from "../../../data/SurahConfig";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

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

/** Arabic block + its supplements/presentation forms — same range CanvasText uses. */
const ARABIC_CHARS = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * The font a note falls back to when it doesn't name one.
 *
 * `HANDWRITTEN_FONT` (Latin cursive) has no Arabic coverage, so a note whose
 * text is Arabic — the reference book quotes the ayah's own tail in the margin
 * where the translations print a gloss — would rasterise as tofu. Detecting the
 * script keeps every existing Latin note byte-identical while letting a config
 * author an Arabic note without having to remember `font:` every time. An
 * explicit `font` always wins.
 */
function autoFont(lines: HandwrittenNoteConfig["lines"]): string {
  const text = lines
    .map((l) => l.segments?.map((s) => s.text).join("") ?? l.text ?? "")
    .join("");
  return ARABIC_CHARS.test(text) ? QURAN_FONT : HANDWRITTEN_FONT;
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
 * text — see `CanvasText`), using the cursive `HANDWRITTEN_FONT` by default
 * instead of the Quran/Latin fonts. Each line gets its own small group so it
 * can carry an independent size/rotation/offset, which is what sells the
 * "actually handwritten" look rather than one perfectly uniform text block.
 *
 * Everything here reads through `resolveNoteForLanguage`, so the note re-renders
 * on the language switch: a language can move the note, restyle it, replace its
 * `lines` outright, swap the `font` (Arabic margin notes need `QURAN_FONT`) or
 * hide it — see `HandwrittenNoteLanguageOverride`.
 */
export function HandwrittenNote({ note: rawNote }: { note: HandwrittenNoteConfig }) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const note = resolveNoteForLanguage(rawNote, activeLanguage);
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
    svgs,
    font,
    hidden = false,
  } = note;

  // A language may drop this note entirely — the Arabic and Latin forms of one
  // margin note are usually two separate notes, each hidden in the other's
  // languages (see `HandwrittenNoteLanguageOverride`).
  if (hidden || lines.length === 0) return null;

  const resolvedFont = font ?? autoFont(lines);
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
              text={line.segments ? undefined : line.text}
              segments={line.segments}
              font={resolvedFont}
              fontSize={lineFontSize}
              color={line.color ?? color}
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
      {svgs?.map((rawItem, i) => {
        const item = resolveNoteSvgForLanguage(rawItem, activeLanguage);
        const anchor = item.anchor ?? "end";
        const defaultY =
          anchor === "start"
            ? lineGap * 0.7
            : -(lines.length - 1) * lineGap - lineGap * 0.9;
        return (
          <NoteSvg
            key={i}
            src={item.src}
            x={item.offsetX ?? 0}
            y={item.offsetY ?? defaultY}
            scaleX={item.scaleX ?? 0.3}
            scaleY={item.scaleY ?? 0.3}
            rotationZ={item.rotationZ ?? 0}
            renderOrder={renderOrder + 1}
          />
        );
      })}
    </group>
  );
}
