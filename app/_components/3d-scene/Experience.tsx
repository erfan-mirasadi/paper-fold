"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { PopUpManager } from "../features/pop-up-verses/PopUpManager";
import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { ElevatedSectionSurfaces } from "../features/elevated-verses/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../features/elevated-verses/ElevatedSectionLabels";
import { useDragState } from "../features/elevated-verses/drag/dragEngine";
import { CAMERA_CONFIG } from "../data/cameraConfig";
import { VerseClickHitboxes } from "../features/camera-zoom/VerseClickHitboxes";

interface ExperienceProps {
  isFolded?: boolean;
  isDarkMode?: boolean;
}

//variables when elevated verse is draged and paper is docked
const PAPER_DOCK_X = -0.9;
const PAPER_DOCK_SCALE = 0.9;

export function Experience({
  isFolded = false,
  isDarkMode = false,
}: ExperienceProps) {
  const isPaperMoving = useDragState((s) => s.isPaperDocked);
  
  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 2) return;
    const { hasDragged } = useDragState.getState();
    if (hasDragged) return;
    // Dismiss elevated verse on background click
    useElevatedStore.getState().dismiss();
  }, []);

  const { paperOffsetX, paperScale } = useSpring({
    paperOffsetX: isPaperMoving ? PAPER_DOCK_X : 0,
    paperScale: isPaperMoving ? PAPER_DOCK_SCALE : 1,
    config: { mass: 1.4, tension: 170, friction: 31 },
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={CAMERA_CONFIG.initialCamera.position}
        fov={CAMERA_CONFIG.initialCamera.fov}
      />

      <a.group
        rotation-x={-Math.PI / 4}
        position-x={paperOffsetX}
        scale-x={paperScale}
        scale-y={paperScale}
        scale-z={paperScale}
      >
        <SinglePaper isFolded={isFolded} isDarkMode={isDarkMode} />
        <ElevatedSectionSurfaces />
        <ElevatedSectionLabels />
        <PopUpManager />
        <VerseClickHitboxes />
      </a.group>

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
  return (
    <OrbitControls
      enabled={true}
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