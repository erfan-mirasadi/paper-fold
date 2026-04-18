"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
// import {
//   TafsirScrollTracker,
// } from "./_components/ui-overlay/TafsirUI";
import { PopUpUI } from "./_components/features/pop-up-verses/ui/PopUpUI";
import { CameraResetOverlay } from "./_components/features/camera-zoom/CameraResetOverlay";
import {
  VerseNeonTracker,
  VerseNeonHTMLOverlay,
} from "./_components/features/camera-zoom/VerseNeonOverlay";
import Effects from "./_components/3d-scene/Effects";
import { ScrollManager } from "./_components/3d-scene/ScrollManager";
import { NavigationOverlay } from "./_components/ui-overlay/NavigationOverlay";
import { ThemeToggleOverlay } from "./_components/ui-overlay/ThemeToggleOverlay";
import { CameraViewPresetOverlay } from "./_components/features/camera-views/CameraViewPresetOverlay";
import { CAMERA_CONFIG } from "./_components/data/cameraConfig";
const Experience = dynamic(
  () =>
    import("./_components/3d-scene/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [glitchKey, setGlitchKey] = useState(0);
  const bgColor = isDarkMode ? "#000000" : "#F2F2ED";

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    setGlitchKey((prev) => prev + 1);
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: bgColor,
        overflow: "hidden",
        transition: "background-color 0.5s ease",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{ color: isDarkMode ? "white" : "black", padding: "20px" }}
          >
            Loading 3D...
          </div>
        }
      >
        <div style={{ width: "100vw", height: "100vh" }}>
          <Canvas
            camera={{
              position: CAMERA_CONFIG.initialCamera.position,
              fov: CAMERA_CONFIG.initialCamera.fov,
            }}
          >
            <color attach="background" args={[bgColor]} />
            <Effects glitchTrigger={glitchKey} />
            <ScrollControls pages={2} damping={0.28}>
              <ScrollManager />
              <Experience />
              {/* <TafsirScrollTracker /> */}
            </ScrollControls>
            <VerseNeonTracker />
          </Canvas>
        </div>
      </Suspense>
      {/* <TafsirUI isDarkMode={isDarkMode} /> */}
      <CameraResetOverlay />
      <PopUpUI isDarkMode={isDarkMode} />
      <VerseNeonHTMLOverlay />
      <NavigationOverlay isDarkMode={isDarkMode} />
      <ThemeToggleOverlay
        isDarkMode={isDarkMode}
        onToggle={handleThemeToggle}
      />
      <CameraViewPresetOverlay />
    </main>
  );
}
