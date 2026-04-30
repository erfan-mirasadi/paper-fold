"use client";
import { cloneElement, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { QURAN_FONT } from "../data/theme";

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
  /** Resolution multiplier for high quality text. */
  resolution?: number;
  renderOrder?: number;
  position?: [number, number, number];
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
  children,
}: CanvasTextProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      // Small delay ensures the browser has fully registered the new FontFaces
      setTimeout(() => setFontsLoaded(true), 100);
    });
  }, []);

  const texture = useMemo(() => {
    // Force re-run when fonts are loaded
    const _ = fontsLoaded;
    const canvas = document.createElement("canvas");

    // Decreased scaleFactor to save VRAM and improve performance
    // 128 is usually more than enough for crisp text
    const scaleFactor = 1024;

    const dpr = resolution;
    const w = width * scaleFactor * dpr;
    const h = height * scaleFactor * dpr;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, w, h);

    // Font names match what we registered in PaperMaterial.tsx
    const fontName = font === QURAN_FONT ? "QuranFont" : "LatinFont";
    const scaledFontSize = fontSize * scaleFactor * dpr;
    ctx.font = `${scaledFontSize}px "${fontName}", Arial`;
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

    // Split into lines if it exceeds maxWidth
    const finalMaxWidth = (maxWidth || width) * scaleFactor * dpr;
    const words = text.split(" ");
    const lines = [];
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

    // Lowered anisotropy to 4 to save GPU resources
    // 16 is overkill and drops FPS significantly
    tex.anisotropy = 4;

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
    fontsLoaded,
  ]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh renderOrder={renderOrder} position={position}>
      <planeGeometry args={[width, height]} />
      {children ? (
        cloneElement(children as React.ReactElement, { map: texture })
      ) : (
        <meshBasicMaterial
          map={texture}
          color="#ffffff" // Ensure it's not tinted black
          transparent={true}
          toneMapped={false}
          depthTest={false}
        />
      )}
    </mesh>
  );
}
