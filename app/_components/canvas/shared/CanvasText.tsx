"use client";
import { cloneElement, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { QURAN_FONT } from "../../../data/theme";

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
  children,
}: CanvasTextProps) {
  const [fontsLoadedKey, setFontsLoadedKey] = useState(0);

  useEffect(() => {
    let active = true;

    const handleFontsReady = () => {
      document.fonts.ready.then(() => {
        if (active) {
          // Small delay ensures the browser has fully registered the new FontFaces
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
    // Force re-run when fonts are loaded
    if (fontsLoadedKey < 0) return null; // Use the variable to satisfy the linter
    const canvas = document.createElement("canvas");

    // Decreased scaleFactor to save VRAM and improve performance
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
    <mesh renderOrder={renderOrder} position={position}>
      <planeGeometry args={[width, height]} />
      {children ? (
        cloneElement(
          children as React.ReactElement<{ map: THREE.CanvasTexture }>,
          {
            map: texture,
          },
        )
      ) : (
        <meshBasicMaterial
          map={texture}
          color="#ffffff"
          transparent={true}
          toneMapped={false}
          depthTest={depthTest}
        />
      )}
    </mesh>
  );
}
