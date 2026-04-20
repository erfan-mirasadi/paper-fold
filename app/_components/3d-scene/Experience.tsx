"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { PopUpManager } from "../features/pop-up-verses/PopUpManager";
import { CameraManager } from "./CameraManager";
import { VerseClickHitboxes } from "../features/camera-zoom/VerseClickHitboxes";
import { useCameraStore } from "../features/camera-zoom/useCameraStore";

import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { ElevatedSectionSurfaces } from "../features/elevated-verses/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../features/elevated-verses/ElevatedSectionLabels";
import { CameraViewController } from "../features/camera-views/CameraViewController";
import { CAMERA_CONFIG } from "../data/cameraConfig";

interface ExperienceProps {
  isFolded?: boolean;
}

export function Experience({ isFolded = false }: ExperienceProps) {
  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 2) return;
    // Dismiss elevated verse on background click
    useElevatedStore.getState().dismiss();
    // Also handle camera reset if it's ever re-enabled
    const { phase: p, resetCamera } = useCameraStore.getState();
    if (p === "zoomed") {
      resetCamera();
    }
  }, []);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={CAMERA_CONFIG.initialCamera.position}
        fov={CAMERA_CONFIG.initialCamera.fov}
      />
      <CameraManager />
      <CameraViewController />

      <group rotation-x={-Math.PI / 4}>
        <SinglePaper isFolded={isFolded} />
        <ElevatedSectionSurfaces />
        <ElevatedSectionLabels />
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
      enableRotate={false}
      enableZoom={false}
      enablePan={false}
      makeDefault={true}
      minAzimuthAngle={CAMERA_CONFIG.orbitControls.minAzimuthAngle}
      maxAzimuthAngle={CAMERA_CONFIG.orbitControls.maxAzimuthAngle}
      minPolarAngle={CAMERA_CONFIG.orbitControls.minPolarAngle}
      maxPolarAngle={CAMERA_CONFIG.orbitControls.maxPolarAngle}
    />
  );
}
