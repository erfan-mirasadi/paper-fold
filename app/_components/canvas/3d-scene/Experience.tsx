"use client";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  SpotLight,
} from "@react-three/drei";
import { a } from "@react-spring/three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { VersesRenderer } from "../verses-object/VersesRenderer";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { ElevatedSectionSurfaces } from "../sections-object/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../sections-object/ElevatedSectionLabels";
import { useDragState } from "../../../utils/dragEngine";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { VerseClickHitboxes } from "../verses-object/VerseClickHitboxes";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { IntroCameraScrollController } from "../orchestrator/IntroCameraScrollController";
import { useIntroToPaperScroll } from "../../../hooks/useIntroToPaperScroll";
import { IntroSectionAnimationController } from "../../../hooks/useIntroSectionAnimation";
import { SectionZoomCamera } from "../orchestrator/SectionZoomCamera";
import { useStoryStore } from "../../../stores/useStoryStore";

interface ExperienceProps {
  isFolded?: boolean;
  onReady?: () => void;
}

export function Experience({ isFolded = false, onReady }: ExperienceProps) {
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const config = useStoryStore((state) => state.activeConfig);
  const hasIntro = config.features.hasIntro;
  const showSpotlight = useFoldStore((s) => hasIntro && s.rawOffset < 0.37);
  const { gl, scene, camera } = useThree();

  const [paperReady, setPaperReady] = useState(false);
  const handlePaperReady = useCallback(() => {
    setPaperReady(true);
  }, []);

  const readyFiredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🚀 OPTIMIZATION: Memoize کردن Regex برای جلوگیری از درگیری CPU در هر رندر
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth < 768
    );
  }, []);

  useEffect(() => {
    if (paperReady && !readyFiredRef.current) {
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

  useEffect(() => {
    if (paperReady && useFoldStore.getState().isIntroActive && !isMobile) {
      // 🚀 OPTIMIZATION: دادنِ یک تنفسِ ۱۰۰ میلی‌ثانیه‌ای به ترد اصلی قبل از کامپایل شیدرها
      const compileTimer = setTimeout(() => {
        gl.compileAsync(scene, camera).catch(() => {});
      }, 100);
      return () => clearTimeout(compileTimer);
    }
  }, [paperReady, gl, scene, camera, isMobile]);

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
      {hasIntro && <IntroCameraScrollController />}
      <SectionZoomCamera />
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
          <SinglePaper isFolded={isFolded} onReady={handlePaperReady} />
        </a.group>
        {config.features.hasElevatedSections && (
          <>
            <ElevatedSectionSurfaces />
            <ElevatedSectionLabels />
          </>
        )}
        {!isAllSectionsMode && <VerseClickHitboxes />}
        <VersesRenderer />
      </a.group>

      {hasIntro && <IntroSectionAnimationController />}

      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group name="intro-scene" visible={useFoldStore.getState().isIntroActive}>
         {/* اگر کامپوننتی برای Intro داشتی اینجا میذاری */}
      </group>

      <DynamicControls />

      {/* 1. انعکاس محیطی برای طبیعی شدن جنس کاغذ (خیلی مهمه!) */}
      <Environment preset="apartment" environmentIntensity={1} />

      {/* 1. نور محیطی رو کم کن تا سایهها بتونن شکل بگیرن */}
      <ambientLight intensity={0.8} />

      {showSpotlight && (
        <SpotLight
          castShadow={!isMobile}
          penumbra={1}
          distance={13}
          angle={0.65}
          attenuation={7}
          anglePower={5}
          intensity={0.001}
          color="#ffddaa"
          position={[2.5, 3.5, 0]}
          volumetric={!isMobile}
        />
      )}

      {/* 3. این همون نوریه که به چروکها زاویه میده و خط تا رو سهبعدی میکنه! (از کامنت درش بیار) */}
      {!isAllSectionsMode && (
        <directionalLight position={[0, 4.2, -2]} intensity={1} />
      )}
    </>
  );
}

// ... DynamicControls remains the same
function DynamicControls() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const config = useStoryStore((state) => state.activeConfig);

  const enableInteractions = isIntroActive
    ? (config.animations.introCamera?.allowOrbit ?? false)
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
