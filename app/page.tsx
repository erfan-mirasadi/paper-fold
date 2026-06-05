"use client";
import { motion, AnimatePresence } from "framer-motion";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { PopUpHoverScrollController } from "./_components/canvas/pop-up-verses/PopUpHoverScrollController";
// VerseNeonOverlay is currently fully commented out (not a module).
// import {
//   VerseNeonTracker,
//   VerseNeonHTMLOverlay,
// } from "./_components/canvas/camera-zoom/VerseNeonOverlay";
// import Effects from "./_components/canvas/3d-scene/Effects";
import { ScrollManager } from "./_components/canvas/orchestrator/ScrollManager";
import { useFoldStore } from "./_components/canvas/orchestrator/ScrollManager";
import { NavigationOverlay } from "./_components/dom/ui-overlay/NavigationOverlay";
import { TitleOverlay } from "./_components/dom/ui-overlay/TitleOverlay";
import { ThemeToggleOverlay } from "./_components/dom/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/dom/ui-overlay/LanguageSwitchOverlay";
import { AllSectionsOverlay } from "./_components/dom/ui-overlay/AllSectionsOverlay";
import { SiteLoadingOverlay } from "./_components/dom/ui-overlay/SiteLoadingOverlay";
import { CameraViewPresetOverlay } from "./_components/dom/ui-overlay/CameraViewPresetOverlay";
import { CameraViewController } from "./_components/canvas/orchestrator/CameraViewController";
import { IntroSectionGuidesOverlay } from "./_components/dom/IntroSectionGuidesOverlay";
import AmbientMedia from "./_components/dom/AmbientMedia";
import JoinedStepOverlay from "./_components/dom/JoinedStepOverlay";
import { IntroBackgroundTextOverlay } from "./_components/dom/IntroBackgroundTextOverlay";
import { HeroTitleOverlay } from "./_components/dom/ui-overlay/HeroTitleOverlay";
import { SkipIntroButton } from "./_components/dom/ui-overlay/SkipIntroButton";
import { LenisProvider } from "./_components/dom/LenisProvider";
import { CAMERA_CONFIG } from "./data/cameraConfig";
const Experience = dynamic(
  () =>
    import("./_components/canvas/3d-scene/Experience").then(
      (mod) => mod.Experience,
    ),
  { ssr: false },
);

const SCROLL_PAGES = 6;

export default function Home() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [mountMainOverlays, setMountMainOverlays] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Decoupled from immediate Zustand hooks to prevent render cascade at handoff!
  const [showPostIntroUI, setShowPostIntroUI] = useState(
    () => !useFoldStore.getState().isIntroActive,
  );
  const [isIntroRenderPhase, setIsIntroRenderPhase] = useState(
    () => useFoldStore.getState().isIntroActive,
  );

  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect mobile device safely on mount to prevent SSR hydration mismatches
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth < 768;
    setIsMobile(mobileCheck);

    // Mount the Canvas almost immediately using requestAnimationFrame.
    // This pushes the heavy initial WebGL blocking to the very start of the load,
    // right before the loader animation is fully visible to the user.
    const rafId = requestAnimationFrame(() => {
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
        // Handoff complete! Instantly enable canvas interaction imperatively
        // so we don't trigger a React render cascade.
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.pointerEvents = "auto";
        }

        const waitTime = state.isInstantSkip ? 0 : 2000;

        // Wait 2 SECONDS before running the heavy UI mount cascade
        timeoutId = window.setTimeout(() => {
          setShowPostIntroUI(true);
          setIsIntroRenderPhase(false);
          timeoutId = null;
        }, waitTime);
      }

      if (state.isIntroActive && !prevState.isIntroActive) {
        // Scrolling BACK up into the intro!
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
    // Pre-mount heavy overlays offscreen to avoid a first-frame hitch.
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
      <main
        style={{
          width: "100vw",
          minHeight: "100dvh",
          backgroundColor: "var(--page-bg)",
          transition: "background-color 0.5s ease",
          position: "relative", // Ensure relative positioning for absolute children
        }}
      >
        <div
          aria-hidden="true"
          style={{
            height: `${SCROLL_PAGES * 100}vh`,
            pointerEvents: "none",
          }}
        />

        <IntroBackgroundTextOverlay />

        {isIntroRenderPhase && (
          <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 h-[65vh] md:h-[65vh] pointer-events-none z-10">
            <AmbientMedia />
          </div>
        )}

        {/* Soft static shadow removed in favor of dynamic Canvas drop-shadow */}

        <Suspense fallback={null}>
          <div
            className={`canvas-wrapper ${isMobile ? "is-mobile" : ""}`}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              opacity: isSceneReady ? 1 : 0,
              // Prevent pointer events while hidden or during intro to avoid blocking UI interactions behind canvas
              pointerEvents:
                isSceneReady && !isIntroRenderPhase ? "auto" : "none",
              // Apple-like buttery smooth ease transition
              transition:
                "opacity 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.5s ease",
            }}
          >
            {/* Render Intro Guides INSIDE the Canvas wrapper but BEFORE Canvas, so they share the filter and aren't shadowed, but get occluded by 3D pixels */}
            {isSceneReady && isIntroRenderPhase && (
              <IntroSectionGuidesOverlay />
            )}
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
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  camera={{
                    position: CAMERA_CONFIG.initialCamera.position,
                    fov: CAMERA_CONFIG.initialCamera.fov,
                  }}
                  dpr={isMobile ? [1, 1] : [1, 2]}
                  gl={{
                    antialias: !isMobile, // Turned off antialiasing on mobile for a massive performance boost on high-DPI screens
                    powerPreference: "high-performance",
                    toneMapping: THREE.NoToneMapping,
                    outputColorSpace: THREE.SRGBColorSpace,
                  }}
                  frameloop="always"
                >
                  {/* <color attach="background" args={["var(--page-bg)"]} /> Removed to allow transparent background for background text */}
                  {/* <Effects glitchTrigger={glitchKey} /> */}
                  <ScrollManager />
                  <PopUpHoverScrollController />
                  <Experience
                    onReady={handleSceneReady}
                  />
                  {/* <VerseNeonTracker /> */}
                  <CameraViewController />
                  {!isMobile && <Preload all />}{" "}
                  {/* Bypassed heavy synchronous shader compilation on mobile to avoid memory crashes during layout boot */}
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
            <SkipIntroButton />
            {/* Hide standard chrome while intro runs. Delayed by 2 seconds after handoff. */}
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
                    <ThemeToggleOverlay
                      onToggle={handleThemeToggle}
                    />
                    <NavigationOverlay />
                    <TitleOverlay />
                    <AllSectionsOverlay />
                    <LanguageSwitchOverlay />
                    <CameraViewPresetOverlay />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </main>
    </LenisProvider>
  );
}
