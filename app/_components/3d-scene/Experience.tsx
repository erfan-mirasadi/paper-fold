"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useEffect, useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { PopUpManager } from "../features/pop-up-verses/PopUpManager";
import { CameraManager } from "./CameraManager";
import { VerseClickHitboxes } from "../features/camera-zoom/VerseClickHitboxes";
import { useCameraStore } from "../features/camera-zoom/useCameraStore";

interface ExperienceProps {
  isFolded?: boolean;
}

export function Experience({ isFolded = false }: ExperienceProps) {
  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 2) return;
    const { phase: p, resetCamera } = useCameraStore.getState();
    if (p === "zoomed") {
      resetCamera();
    }
  }, []);

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 1.7]} fov={45} />
      <CameraManager />

      <group rotation-x={-Math.PI / 4}>
        <SinglePaper isFolded={isFolded} />
        <PopUpManager />
        <VerseClickHitboxes />
      </group>

      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <DynamicControls />

      <Environment preset="apartment" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 5, 2]} intensity={1.5} />
    </>
  );
}

function DynamicControls() {
  const phase = useCameraStore((s) => s.phase);
  const controlsEnabled = phase === "idle" || phase === "zoomed";

  return (
    <OrbitControls
      enabled={controlsEnabled}
      enableZoom={false}
      enablePan={false}
      makeDefault={true}
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI * 0.45}
      onStart={() => {
        document.body.style.cursor = "grabbing";
      }}
      onEnd={() => {
        document.body.style.cursor = "grab";
      }}
    />
  );
}
