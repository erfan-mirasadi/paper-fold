"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { useCallback, useEffect, useState } from "react";
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
  onReady?: () => void;
}

//variables when elevated verse is draged and paper is docked
const PAPER_DOCK_X = -0.9;
const PAPER_DOCK_SCALE = 0.9;
const PAPER_FOCUS_Y = 0;
const PAPER_FOCUS_Z = -0.7;
const PAPER_FOCUS_SCALE = 0;
const PAPER_HIDE_SPRING = { mass: 2.2, tension: 74, friction: 24 };
const PAPER_RESTORE_SPRING = { mass: 1.1, tension: 150, friction: 28 };

export function Experience({
  isFolded = false,
  isDarkMode = false,
  onReady,
}: ExperienceProps) {
  const isPaperMoving = useDragState((s) => s.isPaperDocked);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  // We track paper readiness
  const [paperReady, setPaperReady] = useState(false);

  // Intercept the paper's onReady event
  const handlePaperReady = useCallback(() => {
    setPaperReady(true);
  }, []);

  // Only tell the parent component the scene is fully ready when
  // the paper is rendered.
  useEffect(() => {
    if (paperReady) {
      // Give the GPU a 500ms breathing room after compiling everything
      // so the fade-in transition doesn't stutter.
      const timer = setTimeout(() => {
        onReady?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [paperReady, onReady]);

  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 2) return;
    const { hasDragged } = useDragState.getState();
    if (hasDragged) return;
    // Dismiss elevated verse on background click
    useElevatedStore.getState().dismiss();
  }, []);

  const { sceneOffsetX, sceneScale } = useSpring({
    sceneOffsetX: isPaperMoving && !isAllSectionsMode ? PAPER_DOCK_X : 0,
    sceneScale: isPaperMoving && !isAllSectionsMode ? PAPER_DOCK_SCALE : 1,
    config: { mass: 1.4, tension: 170, friction: 31 },
  });

  const { paperFocusY, paperFocusZ, paperFocusScale } = useSpring({
    paperFocusY: isAllSectionsMode ? PAPER_FOCUS_Y : 0,
    paperFocusZ: isAllSectionsMode ? PAPER_FOCUS_Z : 0,
    paperFocusScale: isAllSectionsMode ? PAPER_FOCUS_SCALE : 1,
    config: isAllSectionsMode ? PAPER_HIDE_SPRING : PAPER_RESTORE_SPRING,
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
        position-x={sceneOffsetX}
        scale-x={sceneScale}
        scale-y={sceneScale}
        scale-z={sceneScale}
      >
        <a.group
          position-y={paperFocusY}
          position-z={paperFocusZ}
          scale-x={paperFocusScale}
          scale-y={paperFocusScale}
          scale-z={paperFocusScale}
        >
          <SinglePaper
            isFolded={isFolded}
            isDarkMode={isDarkMode}
            onReady={handlePaperReady} // Using our intercepted handler here
          />
        </a.group>
        <ElevatedSectionSurfaces />
        <ElevatedSectionLabels />
        <PopUpManager />
        {!isAllSectionsMode && <VerseClickHitboxes />}
      </a.group>
      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* <BackgroundText isDarkMode={isDarkMode} /> */}
      <DynamicControls />
      <Environment preset="apartment" />
      <ambientLight intensity={1} />
      <directionalLight position={[0, 4.2, -2]} intensity={1} />
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
