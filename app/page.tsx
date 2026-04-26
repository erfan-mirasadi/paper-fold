"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, ScrollControls } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { PopUpHoverScrollController } from "./_components/features/pop-up-verses/hover-scroll/PopUpHoverScrollController";
import { CameraResetOverlay } from "./_components/features/camera-zoom/CameraResetOverlay";
// VerseNeonOverlay is currently fully commented out (not a module).
// import {
//   VerseNeonTracker,
//   VerseNeonHTMLOverlay,
// } from "./_components/features/camera-zoom/VerseNeonOverlay";
// import Effects from "./_components/3d-scene/Effects";
import { ScrollManager } from "./_components/3d-scene/ScrollManager";
import { NavigationOverlay } from "./_components/ui-overlay/NavigationOverlay";
import { ThemeToggleOverlay } from "./_components/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/ui-overlay/LanguageSwitchOverlay";
import { AllSectionsOverlay } from "./_components/ui-overlay/AllSectionsOverlay";
import { SiteLoadingOverlay } from "./_components/ui-overlay/SiteLoadingOverlay";
import { CameraViewPresetOverlay } from "./_components/features/camera-views/CameraViewPresetOverlay";
import { CameraViewController } from "./_components/features/camera-views/CameraViewController";
import { CAMERA_CONFIG } from "./_components/data/cameraConfig";
const Experience = dynamic(
  () =>
    import("./_components/3d-scene/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bgColor = isDarkMode && !isMobile ? "#000000" : "#ffffff";

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    // setGlitchKey((prev) => prev + 1);
  };

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: bgColor,
        overflow: "hidden",
        transition: "background-color 0.5s ease",
      }}
    >
      <Suspense fallback={<SiteLoadingOverlay isDarkMode={isDarkMode} />}>
        <div
          style={{
            width: "100vw",
            height: "100dvh",
            opacity: isSceneReady ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
        >
          <Canvas
            camera={{
              position: CAMERA_CONFIG.initialCamera.position,
              fov: CAMERA_CONFIG.initialCamera.fov,
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.NoToneMapping,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
          >
            <color attach="background" args={[bgColor]} />
            {/* <Effects glitchTrigger={glitchKey} /> */}
            <ScrollControls pages={2} damping={0.28}>
              <ScrollManager />
              <PopUpHoverScrollController />
              <Experience isDarkMode={isDarkMode} onReady={handleSceneReady} />
            </ScrollControls>
            {/* <VerseNeonTracker /> */}
            <CameraViewController />
            <Preload all />
          </Canvas>
        </div>
      </Suspense>
      {!isSceneReady && <SiteLoadingOverlay isDarkMode={isDarkMode} />}
      <CameraResetOverlay />
      {/* PopUpUI removed: hover/scroll flow doesn't need DOM anchors */}
      {/* <VerseNeonHTMLOverlay /> */}
      <NavigationOverlay isDarkMode={isDarkMode} />
      <AllSectionsOverlay isDarkMode={isDarkMode} />
      <LanguageSwitchOverlay isDarkMode={isDarkMode} />
      <ThemeToggleOverlay
        isDarkMode={isDarkMode}
        onToggle={handleThemeToggle}
      />
      <CameraViewPresetOverlay />
    </main>
  );
}
