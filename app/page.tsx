"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
// import {
//   TafsirScrollTracker,
// } from "./_components/ui-overlay/TafsirUI";
import { PopUpUI } from "./_components/features/pop-up-verses/ui/PopUpUI";
import BackgroundParticlesDesktop from "./_components/3d-scene/BackgroundParticlesDesktop";
import Effects from "./_components/3d-scene/Effects";
const Experience = dynamic(
  () =>
    import("./_components/3d-scene/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [glitchKey, setGlitchKey] = useState(0);
  const bgColor = isDarkMode ? "#000000" : "#F2F2ED";
  const btnBg = isDarkMode ? "#F2F2ED" : "#121212";
  const btnColor = isDarkMode ? "#121212" : "#F2F2ED";
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
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 50,
          display: "flex",
          gap: "12px",
        }}
      >
        <button
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            setGlitchKey((prev) => prev + 1); // trigger the subtle 3D glitch
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "30px",
            border: "none",
            backgroundColor: btnBg,
            color: btnColor,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

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
          <Canvas shadows camera={{ position: [0, 1, 1.7], fov: 45 }}>
            <color attach="background" args={[bgColor]} />
            <BackgroundParticlesDesktop isDarkMode={isDarkMode} />
            <Effects glitchTrigger={glitchKey} />
            <ScrollControls pages={2} damping={0.2}>
              <Experience />
              {/* <TafsirScrollTracker /> */}
            </ScrollControls>
          </Canvas>
        </div>
      </Suspense>
      {/* <TafsirUI isDarkMode={isDarkMode} /> */}
      <PopUpUI isDarkMode={isDarkMode} />
    </main>
  );
}
