"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

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
      {/* Premium Theme Toggle Button */}
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
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontWeight: "bold",
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
        <div
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Canvas shadows camera={{ position: [0, 1, 1.7], fov: 45 }}>
            <color attach="background" args={[bgColor]} />
            <Experience isDarkMode={isDarkMode} />
          </Canvas>
        </div>
      </Suspense>
    </main>
  );
}
