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

import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { ElevatedSectionSurfaces } from "../features/elevated-verses/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../features/elevated-verses/ElevatedSectionLabels";
import { CameraViewController } from "../features/camera-views/CameraViewController";
import { useCameraViewStore } from "../features/camera-views/useCameraViewStore";
import { CAMERA_CONFIG } from "../data/cameraConfig";

interface ExperienceProps {
  isFolded?: boolean;
}

export function Experience({ isFolded = false }: ExperienceProps) {
  const isElevatedUnlocked = useElevatedStore((s) => s.isEnabledByScroll);

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

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
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
        {isElevatedUnlocked && <ElevatedSectionSurfaces />}
        {isElevatedUnlocked && <ElevatedSectionLabels />}
        <PopUpManager />

        {isElevatedUnlocked && <VerseClickHitboxes />}
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
  const setUserInteracting = useCameraViewStore((s) => s.setUserInteracting);
  const clearRequest = useCameraViewStore((s) => s.clearRequest);

  return (
    <OrbitControls
      enabled={controlsEnabled}
      enableZoom={false}
      enablePan={false}
      makeDefault={true}
      minAzimuthAngle={CAMERA_CONFIG.orbitControls.minAzimuthAngle}
      maxAzimuthAngle={CAMERA_CONFIG.orbitControls.maxAzimuthAngle}
      minPolarAngle={CAMERA_CONFIG.orbitControls.minPolarAngle}
      maxPolarAngle={CAMERA_CONFIG.orbitControls.maxPolarAngle}
      onStart={() => {
        setUserInteracting(true);
        clearRequest();
        document.body.style.cursor = "grabbing";
      }}
      onEnd={() => {
        setUserInteracting(false);
        document.body.style.cursor = "grab";
      }}
    />
  );
}
