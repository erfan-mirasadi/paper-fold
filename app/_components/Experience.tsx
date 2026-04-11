"use client";

import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { SinglePaper } from "./SinglePaper";
import { mainSheet } from "./TheatreManager";
import { PopUpManager } from "./pop-up-verses/PopUpManager";

interface ExperienceProps {
  isDarkMode: boolean;
  isFolded: boolean;
  onTogglePopUp?: () => void;
}

export function Experience({ isDarkMode, isFolded }: ExperienceProps) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isDragging = useRef(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  useEffect(() => {
    if (controlsEnabled) {
      document.body.style.cursor = "grab";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [controlsEnabled]);

  useFrame(() => {
    if (mainSheet) {
      mainSheet.sequence.position = 5;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 1.5]} fov={45} />

      <group rotation-x={-Math.PI / 4}>
        <SinglePaper isFolded={isFolded} />
        <PopUpManager isFolded={isFolded} />
      </group>

      <OrbitControls
        ref={controlsRef}
        enabled={controlsEnabled}
        enableZoom={false}
        enablePan={false}
        makeDefault={controlsEnabled}
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
