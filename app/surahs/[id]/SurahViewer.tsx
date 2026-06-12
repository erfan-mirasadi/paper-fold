"use client";

/**
 * SurahViewer — full 3D canvas experience (extracted from the root page).
 *
 * This component must be rendered AFTER <StoreInitializer /> so that
 * useStoryStore already holds the correct config when the canvas boots.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import * as THREE from "three";

import { PopUpHoverScrollController } from "@/app/_components/canvas/pop-up-verses/PopUpHoverScrollController";
import { ScrollManager } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { NavigationOverlay } from "@/app/_components/dom/ui-overlay/NavigationOverlay";
import { TitleOverlay } from "@/app/_components/dom/ui-overlay/TitleOverlay";
import { ThemeToggleOverlay } from "@/app/_components/dom/ui-overlay/ThemeToggleOverlay";
import { HomeButtonOverlay } from "@/app/_components/dom/ui-overlay/HomeButtonOverlay";
import { LanguageSwitchOverlay } from "@/app/_components/dom/ui-overlay/LanguageSwitchOverlay";
import { AllSectionsOverlay } from "@/app/_components/dom/ui-overlay/AllSectionsOverlay";
import { SiteLoadingOverlay } from "@/app/_components/dom/ui-overlay/SiteLoadingOverlay";
import { CameraViewPresetOverlay } from "@/app/_components/dom/ui-overlay/CameraViewPresetOverlay";
import { CameraViewController } from "@/app/_components/canvas/orchestrator/CameraViewController";
import { IntroSectionGuidesOverlay } from "@/app/_components/dom/IntroSectionGuidesOverlay";
import AmbientMedia from "@/app/_components/dom/AmbientMedia";
import JoinedStepOverlay from "@/app/_components/dom/JoinedStepOverlay";
import { IntroBackgroundTextOverlay } from "@/app/_components/dom/IntroBackgroundTextOverlay";
import { HeroTitleOverlay } from "@/app/_components/dom/ui-overlay/HeroTitleOverlay";
import { SkipIntroButton } from "@/app/_components/dom/ui-overlay/SkipIntroButton";
import { ScrollHintOverlay } from "@/app/_components/dom/ui-overlay/ScrollHintOverlay";
import { LenisProvider, useLenis } from "@/app/_components/dom/LenisProvider";
import { CAMERA_CONFIG } from "@/app/data/cameraConfig";
import { useStoryStore } from "@/app/stores/useStoryStore";

const Experience = dynamic(
  () =>
    import("@/app/_components/canvas/3d-scene/Experience").then(
      (mod) => mod.Experience,
    ),
  { ssr: false },
);

export default function SurahViewer() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [mountMainOverlays, setMountMainOverlays] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Decoupled from immediate Zustand hooks to prevent render cascade at handoff
  const [showPostIntroUI, setShowPostIntroUI] = useState(
    () => !useFoldStore.getState().isIntroActive,
  );
  const [isIntroRenderPhase, setIsIntroRenderPhase] = useState(
    () => useFoldStore.getState().isIntroActive,
  );

  const scrollPages = useStoryStore(
    (s) => s.activeConfig.dimensions.scrollPages,
  );
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect mobile safely on mount — prevents SSR hydration mismatch
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth < 768;
    // Mount Canvas on the first animation frame so WebGL setup happens
    // right at the start of the load, while the loading overlay is visible
    const rafId = requestAnimationFrame(() => {
      setIsMobile(mobileCheck);
      setCanvasReady(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;

    const unsub = useFoldStore.subscribe((state, prevState) => {
      if (!state.isIntroActive && prevState.isIntroActive) {
        // Handoff complete — re-enable canvas interaction imperatively
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.pointerEvents = "auto";
        }

        const waitTime = state.isInstantSkip ? 0 : 2000;

        timeoutId = window.setTimeout(() => {
          setShowPostIntroUI(true);
          setIsIntroRenderPhase(false);
          timeoutId = null;
        }, waitTime);
      }

      if (state.isIntroActive && !prevState.isIntroActive) {
        // Scrolling back up into the intro
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.pointerEvents = "none";
        }
        setShowPostIntroUI(false);
        setIsIntroRenderPhase(true);
      }
    });

    return () => {
      unsub();
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSceneReady) return;
    // Pre-mount heavy overlays offscreen to avoid a first-frame hitch
    const timeoutId = window.setTimeout(() => {
      setMountMainOverlays(true);
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSceneReady]);

  const handleThemeToggle = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      window.dispatchEvent(new Event("themeChange"));
    }
  };

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  return (
    <LenisProvider>
      <SurahViewerInner
        isSceneReady={isSceneReady}
        canvasReady={canvasReady}
        isMobile={isMobile}
        showPostIntroUI={showPostIntroUI}
        isIntroRenderPhase={isIntroRenderPhase}
        mountMainOverlays={mountMainOverlays}
        scrollPages={scrollPages}
        canvasWrapperRef={canvasWrapperRef}
        handleThemeToggle={handleThemeToggle}
        handleSceneReady={handleSceneReady}
      />
    </LenisProvider>
  );
}

interface InnerProps {
  isSceneReady: boolean;
  canvasReady: boolean;
  isMobile: boolean;
  showPostIntroUI: boolean;
  isIntroRenderPhase: boolean;
  mountMainOverlays: boolean;
  scrollPages: number;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  handleThemeToggle: () => void;
  handleSceneReady: () => void;
}

function SurahViewerInner({
  isSceneReady,
  canvasReady,
  isMobile,
  showPostIntroUI,
  isIntroRenderPhase,
  mountMainOverlays,
  scrollPages,
  canvasWrapperRef,
  handleThemeToggle,
  handleSceneReady,
}: InnerProps) {
  const lenis = useLenis();

  // ── Lock scroll during loading so user cannot scroll before scene is ready ──
  // Part 1: Immediately lock native scroll on mount (before Lenis is ready)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Part 2: Mirror to Lenis when it becomes available, and unlock when ready
  useEffect(() => {
    if (!lenis) return;
    if (!isSceneReady) {
      lenis.stop();
    } else {
      lenis.start();
      document.body.style.overflow = "";
    }
  }, [lenis, isSceneReady]);

  return (
    <main
      style={{
        width: "100vw",
        minHeight: "100dvh",
        backgroundColor: "var(--page-bg)",
        transition: "background-color 0.5s ease",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: `${scrollPages * 100}vh`,
          pointerEvents: "none",
        }}
      />

      <IntroBackgroundTextOverlay />

      {isIntroRenderPhase && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 h-[65vh] md:h-[65vh] pointer-events-none z-10">
          <AmbientMedia />
        </div>
      )}

      <Suspense fallback={null}>
        <div
          className={`canvas-wrapper ${isMobile ? "is-mobile" : ""}`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            opacity: isSceneReady ? 1 : 0,
            pointerEvents:
              isSceneReady && !isIntroRenderPhase ? "auto" : "none",
            transition:
              "opacity 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.5s ease",
          }}
        >
          {isSceneReady && isIntroRenderPhase && <IntroSectionGuidesOverlay />}
          {canvasReady && (
            <div
              ref={canvasWrapperRef}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: useFoldStore.getState().isIntroActive
                  ? "none"
                  : "auto",
              }}
            >
              <Canvas
                style={{ pointerEvents: "inherit" }}
                eventSource={
                  canvasWrapperRef as React.MutableRefObject<HTMLDivElement>
                }
                camera={{
                  position: CAMERA_CONFIG.initialCamera.position,
                  fov: CAMERA_CONFIG.initialCamera.fov,
                }}
                dpr={isMobile ? [1, 1] : [1, 2]}
                gl={{
                  antialias: !isMobile,
                  powerPreference: "high-performance",
                  toneMapping: THREE.NoToneMapping,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
                frameloop="always"
              >
                <ScrollManager />
                <PopUpHoverScrollController />
                <Experience onReady={handleSceneReady} />
                <CameraViewController />
                {!isMobile && <Preload all />}
              </Canvas>
            </div>
          )}
        </div>
      </Suspense>

      <AnimatePresence>
        {!isSceneReady && <SiteLoadingOverlay key="site-loader" />}
      </AnimatePresence>

      {isSceneReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-40 pointer-events-none"
        >
          {isIntroRenderPhase && (
            <>
              <HeroTitleOverlay />
              <div className="fixed inset-0 z-80 pointer-events-none">
                <JoinedStepOverlay />
              </div>
            </>
          )}

          <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-100 flex flex-row-reverse md:flex-col items-center gap-0 pointer-events-none">
            <HomeButtonOverlay />
            <ThemeToggleOverlay onToggle={handleThemeToggle} />
            {mountMainOverlays && (
              <AnimatePresence>
                {showPostIntroUI && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="flex flex-row-reverse md:flex-col items-center gap-0 pointer-events-none"
                  >
                    <LanguageSwitchOverlay />
                    <NavigationOverlay />
                    <AllSectionsOverlay />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <SkipIntroButton />

          {mountMainOverlays && (
            <AnimatePresence>
              {showPostIntroUI && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ pointerEvents: "auto", willChange: "opacity" }}
                >
                  <TitleOverlay />
                  <CameraViewPresetOverlay />
                  <ScrollHintOverlay />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </main>
  );
}
