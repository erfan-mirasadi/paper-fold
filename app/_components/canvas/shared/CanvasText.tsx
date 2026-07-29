"use client";
import { a } from "@react-spring/three";
import { cloneElement, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { FONT_FAMILY_NAMES } from "../../../data/theme";
import { detectGpuTier } from "../../../utils/gpuTier";

interface CanvasTextSegment {
  /** This segment's text, concatenated directly after the previous segment (no auto-spacing). */
  text: string;
  /** Color for just this segment. Falls back to the top-level `color` prop when omitted. */
  color?: string;
}

interface CanvasTextHighlight {
  /** Exact substring of `text` to recolor — see `VerseOverrideConfig.textHighlights`. */
  text: string;
  /** Color for every character of that substring. */
  color: string;
  /** 1-based occurrence to recolor. Omit to recolor every occurrence. */
  occurrence?: number;
}

/** Arabic block + its supplements/presentation forms. */
const RTL_CHARS = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
/**
 * A strongly-directional character. Anything else (punctuation, digits, the
 * `*` footnote marker, whitespace) is a bidi NEUTRAL, which is what decides
 * whether a run stays put or travels with the reversed RTL block below.
 */
const STRONG_DIR_CHARS =
  /[A-Za-zÀ-ɏ؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** One stretch of a single line that is drawn in one color. */
interface ColorRun {
  text: string;
  color: string;
}

/**
 * Splits `line` into per-color runs, then peels any whitespace sitting on a
 * run's edge into a run of its own.
 *
 * The peeling matters only for RTL. Canvas lays each run out on its own, and a
 * space left dangling on the edge of an Arabic run is a neutral next to that
 * run's boundary, so it renders on the wrong side of the words and the gap
 * between two recolored phrases collapses. As its own run it simply becomes
 * the gap, wherever the two phrases end up.
 */
function buildColorRuns(
  line: string,
  lineStart: number,
  charColors: (string | undefined)[],
  baseColor: string,
): ColorRun[] {
  const byColor: ColorRun[] = [];
  for (let i = 0; i < line.length; i++) {
    const c = charColors[lineStart + i] ?? baseColor;
    const last = byColor[byColor.length - 1];
    if (last && last.color === c) last.text += line[i];
    else byColor.push({ text: line[i], color: c });
  }

  const runs: ColorRun[] = [];
  for (const run of byColor) {
    const lead = /^\s+/.exec(run.text)?.[0] ?? "";
    const tail = /\s+$/.exec(run.text.slice(lead.length))?.[0] ?? "";
    const core = run.text.slice(lead.length, run.text.length - tail.length);
    if (lead) runs.push({ text: lead, color: run.color });
    if (core) runs.push({ text: core, color: run.color });
    if (tail) runs.push({ text: tail, color: run.color });
  }
  return runs;
}

/**
 * Visual left→right order of `runs` on one line, following the Unicode bidi
 * algorithm for the LTR base direction a detached canvas always uses:
 * the strong RTL block reverses, while neutrals hanging off either END of the
 * line keep the base direction and stay on that end. That last part is why the
 * `*` footnote marker opening an Arabic line still renders on the left.
 */
function visualRunOrder(runs: ColorRun[], line: string): number[] {
  const order = runs.map((_, i) => i);
  if (!RTL_CHARS.test(line)) return order;

  let lead = 0;
  while (lead < runs.length && !STRONG_DIR_CHARS.test(runs[lead].text)) lead++;
  let tail = runs.length - 1;
  while (tail >= lead && !STRONG_DIR_CHARS.test(runs[tail].text)) tail--;
  if (tail <= lead) return order;

  return [
    ...order.slice(0, lead),
    ...order.slice(lead, tail + 1).reverse(),
    ...order.slice(tail + 1),
  ];
}

interface CanvasTextProps {
  text?: string;
  font: string;
  fontSize: number;
  color: string;
  maxWidth?: number;
  lineHeight?: number;
  textAlign?: "left" | "right" | "center";
  verticalAlign?: "top" | "middle" | "bottom";
  width: number;
  height: number;
  resolution?: number;
  renderOrder?: number;
  position?: [number, number, number];
  fontWeight?: string | number;
  fontStyle?: string;
  depthTest?: boolean;
  opacity?: any;
  children?: React.ReactNode;
  /**
   * Renders a row made of differently-colored segments instead of `text`
   * (e.g. to highlight one word in a line). When set, `text` is ignored.
   */
  segments?: CanvasTextSegment[];
  /**
   * Recolors substrings of `text` in place — same wrapping, same line breaks,
   * same position, only the ink of the matched characters changes.
   */
  highlights?: CanvasTextHighlight[];
}

export function CanvasText({
  text = "",
  font,
  fontSize,
  color,
  maxWidth,
  lineHeight = 1.2,
  textAlign = "center",
  verticalAlign = "middle",
  width,
  height,
  resolution = 3,
  renderOrder = 15,
  position = [0, 0, 0],
  fontWeight = "normal",
  fontStyle = "normal",
  depthTest = false,
  opacity,
  children,
  segments,
  highlights,
}: CanvasTextProps) {
  const [fontsLoadedKey, setFontsLoadedKey] = useState(0);

  useEffect(() => {
    let active = true;

    const handleFontsReady = () => {
      document.fonts.ready.then(() => {
        if (active) {
          setTimeout(() => setFontsLoadedKey((k) => k + 1), 100);
        }
      });
    };

    handleFontsReady();

    if ("fonts" in document) {
      document.fonts.addEventListener("loadingdone", handleFontsReady);
      return () => {
        active = false;
        document.fonts.removeEventListener("loadingdone", handleFontsReady);
      };
    }

    return () => {
      active = false;
    };
  }, []);

  // `text`, `segments` and `highlights` all boil down to the same thing: one
  // string plus a per-character color, where `undefined` means "use `color`".
  // A null map is the common case — no recoloring anywhere in the string.
  const source = useMemo(() => {
    if (segments && segments.length > 0) {
      let joined = "";
      const charColors: (string | undefined)[] = [];
      for (const seg of segments) {
        joined += seg.text;
        for (let i = 0; i < seg.text.length; i++) charColors.push(seg.color);
      }
      return { text: joined, charColors };
    }

    if (highlights && highlights.length > 0) {
      const charColors: (string | undefined)[] = new Array(text.length);
      let matched = false;
      for (const hl of highlights) {
        if (!hl.text) continue;
        let from = 0;
        let seen = 0;
        for (;;) {
          const at = text.indexOf(hl.text, from);
          if (at === -1) break;
          seen += 1;
          if (hl.occurrence === undefined || hl.occurrence === seen) {
            for (let i = at; i < at + hl.text.length; i++) {
              charColors[i] = hl.color;
            }
            matched = true;
          }
          from = at + hl.text.length;
        }
      }
      // A highlight that matches nothing (e.g. an Arabic phrase looked up in
      // the Turkish text) leaves the string on the untouched fast path.
      if (matched) return { text, charColors };
    }

    return { text, charColors: null as (string | undefined)[] | null };
  }, [text, segments, highlights]);

  const texture = useMemo(() => {
    if (fontsLoadedKey < 0) return null;
    const canvas = document.createElement("canvas");

    // 🎯 GPU-BASED quality scaling — NOT screen-size based.
    const tier = detectGpuTier();

    // ضریب پایه برای حفظ کیفیت بالا
    const scaleFactor = 1024;
    // resolution (DPR) هم بالا بریم تا متن كیف بمونه; GPU tier سقف رو تعیین میکنه
    const dpr = resolution;

    let targetW = width * scaleFactor * dpr;
    let targetH = height * scaleFactor * dpr;
    let activeScaleFactor = scaleFactor * dpr;

    // سقف امنیتی VRAM بر اساس توان GPU (نه اندازه صفحه)
    const MAX_TEX_SIZE = tier === "high" ? 8192 : tier === "medium" ? 4096 : 2048;
    const maxDim = Math.max(targetW, targetH);

    if (maxDim > MAX_TEX_SIZE) {
      const ratio = MAX_TEX_SIZE / maxDim;
      targetW *= ratio;
      targetH *= ratio;
      activeScaleFactor *= ratio; // مقیاس فونت هم متناسب باهاش کوچیک میشه تا دفرمه نشه
    }

    // مقادیر کانوِس حتماً باید عدد صحیح (رُند) باشن تا WebGL ارور نده
    const w = Math.round(targetW);
    const h = Math.round(targetH);
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, w, h);

    const fontName = FONT_FAMILY_NAMES[font] ?? "LatinFont";

    // جادوی حل مشکل کش‌آمدگی متن: فقط از activeScaleFactor استفاده می‌کنیم
    const scaledFontSize = fontSize * activeScaleFactor;

    ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "${fontName}", Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline =
      verticalAlign === "top"
        ? "top"
        : verticalAlign === "bottom"
          ? "bottom"
          : "middle";

    const x = textAlign === "center" ? w / 2 : textAlign === "right" ? w : 0;
    const y =
      verticalAlign === "top" ? 0 : verticalAlign === "bottom" ? h : h / 2;

    const finalMaxWidth = (maxWidth || width) * activeScaleFactor;
    const paragraphs = source.text.split("\n");
    // Every line carries its offset into `source.text`, so the per-character
    // colors survive the wrap and land on the right line.
    const lines: { text: string; start: number }[] = [];

    let paragraphStart = 0;
    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ");
      let currentLine = "";
      let currentStart = paragraphStart;
      let wordStart = paragraphStart;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > finalMaxWidth && i > 0) {
          lines.push({ text: currentLine, start: currentStart });
          currentLine = words[i];
          currentStart = wordStart;
        } else {
          currentLine = testLine;
        }
        wordStart += words[i].length + 1; // + the space split() consumed
      }
      lines.push({ text: currentLine, start: currentStart });
      paragraphStart += paragraph.length + 1; // + the "\n"
    }

    const totalHeight = lines.length * scaledFontSize * lineHeight;
    let startY = y;
    if (verticalAlign === "middle") {
      startY = (h - totalHeight) / 2 + (scaledFontSize * lineHeight) / 2;
    } else if (verticalAlign === "top") {
      startY = (scaledFontSize * lineHeight) / 2;
    } else {
      startY = h - totalHeight + (scaledFontSize * lineHeight) / 2;
    }

    lines.forEach((line) => {
      const runs = source.charColors
        ? buildColorRuns(line.text, line.start, source.charColors, color)
        : null;

      if (!runs || runs.length <= 1) {
        // Nothing to recolor on this line — one fillText, laid out by the
        // browser's own bidi pass, exactly as before.
        ctx.textAlign = textAlign;
        ctx.fillStyle = runs?.[0]?.color ?? color;
        ctx.fillText(line.text, x, startY);
      } else {
        // Two or more colors on one line: each run is drawn on its own, so
        // their visual order is ours to get right (see `visualRunOrder`).
        const widths = runs.map((run) => ctx.measureText(run.text).width);
        const total = widths.reduce((sum, runW) => sum + runW, 0);
        // Starts the run train on the same left edge the single-fillText
        // branch above would have put this line's ink box on.
        let cursorX =
          textAlign === "center"
            ? (w - total) / 2
            : textAlign === "right"
              ? w - total
              : 0;
        ctx.textAlign = "left";
        for (const i of visualRunOrder(runs, line.text)) {
          ctx.fillStyle = runs[i].color;
          ctx.fillText(runs[i].text, cursorX, startY);
          cursorX += widths[i];
        }
      }
      startY += scaledFontSize * lineHeight;
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    // نهایت کیفیت وکتور بدون فلیکر زدن لبه‌ها
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = tier === "low" ? 4 : tier === "medium" ? 8 : 16;

    return tex;
  }, [
    source,
    font,
    fontSize,
    color,
    textAlign,
    verticalAlign,
    width,
    height,
    resolution,
    maxWidth,
    lineHeight,
    fontsLoadedKey,
    fontWeight,
    fontStyle,
  ]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={position} renderOrder={renderOrder}>
      <planeGeometry args={[width, height]} />
      {children ? (
        cloneElement(
          children as React.ReactElement<{ map: THREE.CanvasTexture }>,
          {
            map: texture,
          },
        )
      ) : (
        <a.meshBasicMaterial
          {...({
            map: texture as any,
            color: "#ffffff",
            transparent: true,
            toneMapped: false,
            depthTest: depthTest ?? true,
            depthWrite: false,
            opacity: opacity ?? 1,
          } as any)}
        />
      )}
    </mesh>
  );
}
