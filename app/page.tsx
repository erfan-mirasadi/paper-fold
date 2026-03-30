"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Experience = dynamic(
  () => import("./_components/3d/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
      }}
    >
      <Suspense
        fallback={
          <div style={{ color: "white", padding: "20px" }}>Loading 3D...</div>
        }
      >
        <Canvas shadows camera={{ position: [0, 1, 1.7], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <Experience />
        </Canvas>
      </Suspense>
    </main>
  );
}
