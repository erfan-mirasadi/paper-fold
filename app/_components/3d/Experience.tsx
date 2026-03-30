"use client";

import { Environment, OrbitControls, ScrollControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import React, { useEffect, useRef } from "react";
import { SinglePaper } from "./SinglePaper";

interface ExperienceProps {
  isDarkMode: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isDarkMode }) => {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current || isDragging.current) return;

    easing.damp3(state.camera.position, [0, 1, 1.7], 0.4, delta);
    easing.damp3(controlsRef.current.target, [0, 0, 0], 0.4, delta);
    controlsRef.current.update();
  });

  return (
    <>
      <ScrollControls pages={4} damping={0.3}>
        <group rotation-x={-Math.PI / 4}>
          <SinglePaper />
        </group>
      </ScrollControls>

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        makeDefault
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
      <directionalLight
        position={[2, 5, 2]}
        intensity={isDarkMode ? 1.5 : 2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={isDarkMode ? 0.4 : 0.15} />
      </mesh>
    </>
  );
};
