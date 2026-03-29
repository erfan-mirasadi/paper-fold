// "use client";

// import CssPaper from "./_components/non-3d/CssPaper";

// export default function Home() {
//   return (
//     <>
//       <CssPaper />
//     </>
//   );
// }

"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const Experience = dynamic(
  () => import("./_components/3d/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export default function Home() {
  // State for toggling the horizontal fold
  const [isFolded, setIsFolded] = useState(false);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        position: "relative",
      }}
    >
      {/* UI Overlay Button, absolute positioned to the top-right */}
      <button
        onClick={() => setIsFolded(!isFolded)}
        style={{
          position: "absolute",
          top: "30px",
          right: "30px",
          zIndex: 10,
          padding: "15px 30px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          backgroundColor: isFolded ? "#fff" : "#222",
          color: isFolded ? "#000" : "#fff",
          border: "2px solid #444",
          borderRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        {isFolded ? "Open it 📄" : "Fold it 🗂️"}
      </button>

      <Suspense
        fallback={
          <div style={{ color: "white", padding: "20px" }}>Loading 3D...</div>
        }
      >
        <Canvas shadows camera={{ position: [0, 1, 1.7], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <Experience isFolded={isFolded} />
        </Canvas>
      </Suspense>
    </main>
  );
}
