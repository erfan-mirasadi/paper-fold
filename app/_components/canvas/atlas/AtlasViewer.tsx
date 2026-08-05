"use client";

/**
 * AtlasViewer — the board's own canvas.
 *
 * Mounted INSTEAD of SurahViewer, not inside it. The reading experience is
 * built around one folding page: a scroll-driven fold story, an offscreen
 * RenderTexture, elevation zones, two reading panels. The board shares none of
 * that — it is seven flat sheets and a camera — so wiring it through that
 * pipeline would mean disabling most of it and then working around what was
 * left. A separate mount keeps both intact and neither has to know about the
 * other.
 */

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";

import { AtlasBoard } from "./AtlasBoard";
import { useAtlasStore } from "../../../stores/useAtlasStore";
import { isWebGLSupported } from "../../../utils/gpuTier";
import { WebGLUnsupportedOverlay } from "../../dom/ui-overlay/WebGLUnsupportedOverlay";
import { HomeButtonOverlay } from "../../dom/ui-overlay/HomeButtonOverlay";
import { ThemeToggleOverlay } from "../../dom/ui-overlay/ThemeToggleOverlay";

export function AtlasViewer() {
  const [webglSupported, setWebglSupported] = useState(true);
  const focusedSheetId = useAtlasStore((s) => s.focusedSheetId);

  useEffect(() => {
    setWebglSupported(isWebGLSupported());
  }, []);

  // Escape leaves a sheet — the keyboard half of clicking the backdrop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAtlasStore.getState().clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The board never scrolls; the camera is the whole navigation.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!webglSupported) return <WebGLUnsupportedOverlay />;

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#111111",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* Inside the Canvas, and inside its own boundary: Environment
            suspends while its HDR loads, and an unguarded suspension would
            unmount the whole Canvas rather than just wait. */}
        <Suspense fallback={null}>
          <Environment files="/hdri/lebombo_1k.hdr" environmentIntensity={0.7} />
        </Suspense>
        <ambientLight intensity={1.1} />
        <directionalLight position={[1.5, 2.5, 3]} intensity={1.4} />

        <AtlasBoard />
      </Canvas>

      <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-100 flex flex-row-reverse items-center gap-0 pointer-events-none">
        <HomeButtonOverlay />
        <ThemeToggleOverlay />
      </div>

      {focusedSheetId && (
        <button
          onClick={() => useAtlasStore.getState().clearFocus()}
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(20,20,20,0.7)",
            color: "rgba(255,255,255,0.85)",
            fontSize: 13,
            letterSpacing: "0.04em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          Tüm sayfalar
        </button>
      )}
    </main>
  );
}
