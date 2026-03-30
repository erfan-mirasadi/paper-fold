"use client";
import { Environment, OrbitControls, ScrollControls } from "@react-three/drei";
import React from "react";
import { SinglePaper } from "./SinglePaper";

export const Experience: React.FC = () => {
  return (
    <>
      <ScrollControls pages={4} damping={0.3}>
        <group rotation-x={-Math.PI / 4}>
          <SinglePaper />
        </group>
      </ScrollControls>

      <OrbitControls enableZoom={false} enablePan={false} />

      <Environment preset="studio" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
