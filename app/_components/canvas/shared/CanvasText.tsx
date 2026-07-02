"use client";
import { a } from "@react-spring/three";
import { cloneElement, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { QURAN_FONT } from "../../../data/theme";
import { detectGpuTier } from "../../../utils/gpuTier";

interface CanvasTextProps {
  text: string;
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
}

export function CanvasText({
  text,
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

    const fontName = font === QURAN_FONT ? "QuranFont" : "LatinFont";

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
    const paragraphs = text.split("\n");
    const lines = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ");
      let currentLine = "";

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > finalMaxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
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
      ctx.fillText(line, x, startY);
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
    text,
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
