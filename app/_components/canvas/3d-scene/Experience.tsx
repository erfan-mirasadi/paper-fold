"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  SpotLight,
} from "@react-three/drei";
import { a } from "@react-spring/three";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
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
import { useIntroToPaperScroll } from "../../../hooks/useIntroToPaperScroll";

interface ExperienceProps {
  isFolded?: boolean;
  isDarkMode?: boolean;
  onReady?: () => void;
}

export function Experience({
  isFolded = false,
  isDarkMode = false,
  onReady,
}: ExperienceProps) {
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const { gl, scene, camera } = useThree();

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

  // Background Compilation
  useEffect(() => {
    if (isIntroActive && paperReady) {
      gl.compileAsync(scene, camera).catch(() => {});
    }
  }, [isIntroActive, paperReady, gl, scene, camera]);

  // Ensure the elevated store is in the correct state for the intro.
  // restoreAllSections() is intentionally deferred until introHandoffProgress
  // has reached 1 so the boolean flip never interrupts scroll-driven springs.
  useEffect(() => {
    if (isIntroActive) {
      useElevatedStore.getState().forceShowAllSections();
    }
    // The "else" path (restoreAllSections) is handled inside syncSceneTargets
    // once the handoff scroll progress is complete.
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

  const {
    sceneOffsetX,
    sceneScale,
    paperFocusY,
    paperFocusZ,
    paperFocusScale,
  } = useIntroToPaperScroll();

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
      <SpotLight
        castShadow
        penumbra={1}
        distance={13}
        angle={0.45}
        attenuation={4} // Controls how the light falls off
        anglePower={4} // Controls the sharpness of the light cone
        intensity={1}
        color="#ffddaa" // Warm, cinematic yellow/orange like your reference image
        position={[1, 0.9, 3]}
        // depthBuffer={new Float32Array(100000000)}
        volumetric // This is the magic prop that creates the visible light beam!
      />

      {!isAllSectionsMode && (
        <directionalLight position={[0, 4.2, -2]} intensity={1} />
      )}
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
