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
import { IntroSectionAnimationController } from "../../../hooks/useIntroSectionAnimation";

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

  const isMobile =
    typeof window !== "undefined" &&
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
      window.innerWidth < 768);

  useEffect(() => {
    // We MUST wait for the paper to compile even in intro to avoid stutter when scene appears.
    const isReady = paperReady;

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
  }, [paperReady, onReady]);

  // Background Compilation
  useEffect(() => {
    if (paperReady && useFoldStore.getState().isIntroActive && !isMobile) {
      gl.compileAsync(scene, camera).catch(() => {});
    }
  }, [paperReady, gl, scene, camera, isMobile]);

  // Ensure the elevated store is in the correct state for the intro.
  // restoreAllSections() is intentionally deferred until introHandoffProgress
  // has reached 1 so the boolean flip never interrupts scroll-driven springs.
  useEffect(() => {
    const unsub = useFoldStore.subscribe((state, prevState) => {
      if (state.isIntroActive && !prevState.isIntroActive) {
        useElevatedStore.getState().forceShowAllSections();
      }
    });
    if (useFoldStore.getState().isIntroActive) {
      useElevatedStore.getState().forceShowAllSections();
    }
    return unsub;
  }, []);

  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (useFoldStore.getState().isIntroActive) return;
    if (e.delta > 2) return;
    const { hasDragged } = useDragState.getState();
    if (hasDragged) return;
    // Dismiss elevated verse on background click
    useElevatedStore.getState().dismiss();
  }, []);

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
        <ElevatedSectionLabels />
        <VersesRenderer />
        {!isAllSectionsMode && <VerseClickHitboxes />}
      </a.group>

      {/* Single centralized controller for all intro section animations.
          Replaces ~28 individual useFrame callbacks with 1. */}
      <IntroSectionAnimationController />

      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Imported the dedicated IntroExperience component */}
      <IntroExperience isDarkMode={isDarkMode} />

      <DynamicControls />
      <Environment preset="apartment" />
      <ambientLight intensity={1} />
      <SpotLight
        castShadow={!isMobile} // Disabled dynamic shadow maps on mobile to prevent extreme GPU overhead
        penumbra={1}
        distance={13}
        angle={0.45}
        attenuation={4} // Controls how the light falls off
        anglePower={4} // Controls the sharpness of the light cone
        intensity={1}
        color="#ffddaa" // Warm, cinematic yellow/orange like your reference image
        position={[1, 0.9, 3]}
        // depthBuffer={new Float32Array(100000000)}
        volumetric={!isMobile} // This is the magic prop that creates the visible light beam! Disabled on mobile to prevent crashes.
      />

      {!isAllSectionsMode && (
        <directionalLight position={[0, 4.2, -2]} intensity={1} />
      )}
    </>
  );
}

function DynamicControls() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const enableInteractions = isIntroActive
    ? INTRO_CAMERA_CONFIG.allowOrbit
    : false;

  const minAzimuthAngle = isIntroActive
    ? -Infinity
    : CAMERA_CONFIG.orbitControls.minAzimuthAngle;
  const maxAzimuthAngle = isIntroActive
    ? Infinity
    : CAMERA_CONFIG.orbitControls.maxAzimuthAngle;
  const minPolarAngle = isIntroActive
    ? 0
    : CAMERA_CONFIG.orbitControls.minPolarAngle;
  const maxPolarAngle = isIntroActive
    ? Math.PI
    : CAMERA_CONFIG.orbitControls.maxPolarAngle;

  return (
    <OrbitControls
      enabled={true}
      makeDefault={true}
      enableRotate={enableInteractions}
      enableZoom={enableInteractions}
      enablePan={enableInteractions}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  );
}
