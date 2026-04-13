"use client";

import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useRef, useEffect } from "react";
import { SinglePaper } from "./SinglePaper";
import { PopUpManager } from "./pop-up-verses/PopUpManager";

interface ExperienceProps {
  isDarkMode: boolean;
  isFolded?: boolean;
}

export function Experience({ isDarkMode, isFolded = false }: ExperienceProps) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 1.7]} fov={45} />

      <group rotation-x={-Math.PI / 4}>
        <SinglePaper isFolded={isFolded} />
        <PopUpManager />
      </group>

      <OrbitControls
        ref={controlsRef}
        enabled={true}
        enableZoom={false}
        enablePan={false}
        makeDefault={true}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.45}
        onStart={() => {
          isDragging.current = true;
          document.body.style.cursor = "grabbing";
        }}
        onEnd={() => {
          isDragging.current = false;
          document.body.style.cursor = "grab";
        }}
      />

      <Environment preset={isDarkMode ? "studio" : "apartment"} />
      <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={isDarkMode ? 1.0 : 1.5}
      />
    </>
  );
}
