"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import TheatreManager from "./_components/TheatreManager";
import { TafsirUI, TafsirScrollTracker } from "./_components/TafsirUI";

const Experience = dynamic(
  () => import("./_components/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const bgColor = isDarkMode ? "#121212" : "#f4f1ea";
  const btnBg = isDarkMode ? "#ffffff" : "#121212";
  const btnColor = isDarkMode ? "#121212" : "#ffffff";

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
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 50,
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
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

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
            <TheatreManager>
              <ScrollControls pages={3} damping={0.2}>
                <Experience isDarkMode={isDarkMode} />
                <TafsirScrollTracker />
              </ScrollControls>
            </TheatreManager>
          </Canvas>
        </div>
      </Suspense>

      {/* TafsirUI is now a plain HTML overlay, rendered OUTSIDE the Canvas */}
      <TafsirUI isDarkMode={isDarkMode} />
    </main>
  );
}
