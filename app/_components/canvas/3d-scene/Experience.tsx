"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { VersesRenderer } from "../verses-object/VersesRenderer";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { ElevatedSectionSurfaces } from "../sections-object/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../sections-object/ElevatedSectionLabels";
import { useDragState } from "../../../utils/dragEngine";
import { CAMERA_CONFIG, INTRO_CAMERA_CONFIG } from "../../../data/cameraConfig";
import { VerseClickHitboxes } from "../verses-object/VerseClickHitboxes";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { IntroExperience } from "../intro/IntroExperience";
import { IntroCameraScrollController } from "../orchestrator/IntroCameraScrollController";

interface ExperienceProps {
  isFolded?: boolean;
  isDarkMode?: boolean;
  onReady?: () => void;
}

// variables when elevated verse is draged and paper is docked
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
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  // We track paper readiness
  const [paperReady, setPaperReady] = useState(false);

  // Intercept the paper's onReady event
  const handlePaperReady = useCallback(() => {
    setPaperReady(true);
  }, []);

  // Scene Readiness Management
  const readyFiredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // We are "ready" if we are in the intro (no paper needed) OR if the paper is compiled.
    const isReady = isIntroActive || paperReady;

    if (isReady && !readyFiredRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!readyFiredRef.current) {
          readyFiredRef.current = true;
          onReady?.();
        }
      }, 500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isIntroActive, paperReady, onReady]);

  // Ensure the elevated store is in the correct state for the intro
  useEffect(() => {
    if (isIntroActive) {
      useElevatedStore.getState().forceShowAllSections();
    } else {
      useElevatedStore.getState().restoreAllSections();
    }
  }, [isIntroActive]);

  const handleBackgroundClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (isIntroActive) return;
      if (e.delta > 2) return;
      const { hasDragged } = useDragState.getState();
      if (hasDragged) return;
      // Dismiss elevated verse on background click
      useElevatedStore.getState().dismiss();
    },
    [isIntroActive],
  );

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
      <IntroCameraScrollController />
      <a.group
        rotation-x={-Math.PI / 4}
        position-x={sceneOffsetX}
        scale-x={sceneScale}
        scale-y={sceneScale}
        scale-z={sceneScale}
      >
        <a.group
          visible={!isIntroActive}
          position-y={paperFocusY}
          position-z={paperFocusZ}
          scale-x={paperFocusScale}
          scale-y={paperFocusScale}
          scale-z={paperFocusScale}
        >
          <SinglePaper
            isFolded={isFolded}
            isDarkMode={isDarkMode}
            onReady={handlePaperReady}
          />
        </a.group>
        <ElevatedSectionSurfaces />
        <ElevatedSectionLabels introGuidesActive={isIntroActive} />
        <VersesRenderer />
        {!isAllSectionsMode && <VerseClickHitboxes />}
      </a.group>

      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Imported the dedicated IntroExperience component */}
      <IntroExperience isIntroActive={isIntroActive} isDarkMode={isDarkMode} />

      <DynamicControls isIntroActive={isIntroActive} />
      <Environment preset="apartment" />
      <ambientLight intensity={1} />
      <directionalLight position={[0, 4.2, -2]} intensity={1} />
    </>
  );
}

function DynamicControls({ isIntroActive }: { isIntroActive: boolean }) {
  if (isIntroActive) {
    const allowOrbit = INTRO_CAMERA_CONFIG.allowOrbit;

    return (
      <OrbitControls
        enabled={true}
        enableRotate={allowOrbit}
        enableZoom={allowOrbit}
        enablePan={allowOrbit}
        makeDefault={true}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    );
  }

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
