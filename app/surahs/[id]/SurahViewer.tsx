"use client";

/**
 * SurahViewer — full 3D canvas experience (extracted from the root page).
 *
 * This component must be rendered AFTER <StoreInitializer /> so that
 * useStoryStore already holds the correct config when the canvas boots.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Preload, PerspectiveCamera } from "@react-three/drei";
import dynamic from "next/dynamic";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import * as THREE from "three";

import { PopUpHoverScrollController } from "@/app/_components/canvas/pop-up-verses/PopUpHoverScrollController";
import { ScrollManager } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { NavigationOverlay } from "@/app/_components/dom/ui-overlay/NavigationOverlay";
import { ThemeToggleOverlay } from "@/app/_components/dom/ui-overlay/ThemeToggleOverlay";
import { HomeButtonOverlay } from "@/app/_components/dom/ui-overlay/HomeButtonOverlay";
import { SurahMenuOverlay } from "@/app/_components/dom/ui-overlay/SurahMenuOverlay";
import { LanguageSwitchOverlay } from "@/app/_components/dom/ui-overlay/LanguageSwitchOverlay";
import { AllSectionsOverlay } from "@/app/_components/dom/ui-overlay/AllSectionsOverlay";
import { SiteLoadingOverlay } from "@/app/_components/dom/ui-overlay/SiteLoadingOverlay";
// import { CameraViewPresetOverlay } from "@/app/_components/dom/ui-overlay/CameraViewPresetOverlay";
import { CameraViewController } from "@/app/_components/canvas/orchestrator/CameraViewController";
import { DynamicControls } from "@/app/_components/canvas/orchestrator/DynamicControls";
import { SceneLighting } from "@/app/_components/canvas/orchestrator/SceneLighting";
import { IntroSectionGuidesOverlay } from "@/app/_components/dom/IntroSectionGuidesOverlay";
import AmbientMedia from "@/app/_components/dom/AmbientMedia";
import JoinedStepOverlay from "@/app/_components/dom/JoinedStepOverlay";
import { IntroBackgroundTextOverlay } from "@/app/_components/dom/IntroBackgroundTextOverlay";
import { HeroTitleOverlay } from "@/app/_components/dom/ui-overlay/HeroTitleOverlay";
import { SkipIntroButton } from "@/app/_components/dom/ui-overlay/SkipIntroButton";
import { ScrollHintOverlay } from "@/app/_components/dom/ui-overlay/ScrollHintOverlay";
import { FoldSliderOverlay } from "@/app/_components/dom/ui-overlay/FoldSliderOverlay";
import { useHasFoldStory } from "@/app/hooks/useHasFoldStory";
import { PaperArrowsOverlay } from "@/app/_components/dom/ui-overlay/PaperArrowsOverlay";
import { PaperPaginationOverlay } from "@/app/_components/dom/ui-overlay/PaperPaginationOverlay";
import { SectionZoomArrowsOverlay } from "@/app/_components/dom/ui-overlay/SectionZoomArrowsOverlay";
import { PaperSwitchCursorSpinner } from "@/app/_components/dom/ui-overlay/PaperSwitchCursorSpinner";
import { SurahScriptSidebar } from "@/app/_components/dom/ui-overlay/SurahScriptSidebar";
import { SideInfoPanel } from "@/app/_components/dom/ui-overlay/SideInfoPanel";
import { LenisProvider, useLenis } from "@/app/_components/dom/LenisProvider";
import { WebGLUnsupportedOverlay } from "@/app/_components/dom/ui-overlay/WebGLUnsupportedOverlay";

/**
 * The vellum's dials, live on screen. Dynamically imported so it stays in its
 * own chunk, and it decides for itself whether it may open — always in
 * development, and in production only behind `?vellum`. See `panelAllowed`.
 *
 * Mounted HERE rather than inside the Canvas because it is DOM — see the note
 * in the component.
 */
const VellumControls = dynamic(
  () =>
    import("@/app/_components/canvas/dev/VellumControls").then((m) => ({
      default: m.VellumControls,
    })),
  { ssr: false },
);
import { CAMERA_CONFIG } from "@/app/data/cameraConfig";
import { useStoryStore } from "@/app/stores/useStoryStore";
import { usePaperStore } from "@/app/stores/usePaperStore";
import { useAudioUnlockStore } from "@/app/stores/useAudioUnlockStore";
import { isWebGLSupported, maxDevicePixelRatio } from "@/app/utils/gpuTier";
import { useAdaptiveFrameloop } from "@/app/hooks/useAdaptiveFrameloop";
import { useAutoCollapsePanelsOnElevate } from "@/app/hooks/useAutoCollapsePanelsOnElevate";

// @react-three/fiber's <Canvas> still creates a THREE.Clock internally to
// drive its render loop; three r183 deprecated Clock in favor of Timer but
// fiber hasn't migrated yet. Silence just that one notice via three's own
// console hook (rather than patching global console.warn) so real warnings
// still surface.
if (typeof window !== "undefined") {
  THREE.setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && message.includes("Clock: This module has been deprecated")) {
      return;
    }
    console[type](message, ...params);
  });
}

/**
 * Surah routes that read WITHOUT the two side panels — the left script
 * sidebar and the right tafsir panel. On these pages the panels are never
 * mounted at all (not hidden with CSS), so none of their content, fonts or
 * scroll listeners ever reach the DOM. Both panels carry their own toggle
 * rail, so leaving them out removes the buttons with them.
 *
 * To bring the panels back to a page, delete its id from this list.
 */
const SURAHS_WITHOUT_SIDE_PANELS: ReadonlySet<string> = new Set(["yasin"]);

const Experience = dynamic(
  () =>
    import("@/app/_components/canvas/3d-scene/Experience").then(
      (mod) => mod.Experience,
    ),
  { ssr: false },
);

/**
 * The phone profile: half the buffers, no multisampling, no bulk preload.
 *
 * Device identity comes first and is the only part of this that is certain —
 * `Experience` makes the same call, and for the same reason. The width is a
 * second opinion for a desktop browser squeezed to phone size, and it is only
 * ever asked of a window that HAS a width: `innerWidth` reads 0 while the
 * window is still coming up, and a 0 that counts as "narrow" is how a desktop
 * ends up rendering at half resolution for the rest of the session.
 */
function readIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    return true;
  }
  const width = window.innerWidth || document.documentElement.clientWidth;
  return width > 0 && width < 768;
}

export default function SurahViewer() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [mountMainOverlays, setMountMainOverlays] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  /** Bumped when the display's pixel ratio changes — see the effect below. */
  const [dprEpoch, setDprEpoch] = useState(0);

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

  // Multi-paper navigation: the scene is PERSISTENT — switches swap only the
  // content buffers in place. No overlay is shown for switches — a plain
  // loading cursor is enough, since the transition itself never starts
  // until the new content is truly ready (see usePaperStore).

  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mount Canvas on the first animation frame so WebGL setup happens
    // right at the start of the load, while the loading overlay is visible
    const rafId = requestAnimationFrame(() => {
      setIsMobile(readIsMobile());
      setWebglSupported(isWebGLSupported());
      setCanvasReady(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  /**
   * ...and asked again afterwards, because the first answer is the one that
   * cannot be trusted.
   *
   * `readIsMobile` is a width test as much as a device test, and a width is
   * only worth reading once the window has one. A window still being created —
   * restored from minimised, opened in a background tab, sized by a display
   * whose scaling has not settled — reports `innerWidth` 0, and 0 is under 768.
   * The check above used to be the only one there was, so a single early read
   * stood for the whole session: a desktop got the phone profile, and with it
   * `dpr` pinned to 1. That pins EVERY buffer in the page-texture ladder — the
   * zoom's own detail pass included — to half the linear resolution of the
   * screen it is being looked at on, which is exactly the ceiling a reader
   * hits when zooming in stops paying off.
   */
  useEffect(() => {
    const recheck = () => setIsMobile(readIsMobile());
    recheck();
    window.addEventListener("resize", recheck);
    return () => window.removeEventListener("resize", recheck);
  }, []);

  /**
   * `devicePixelRatio` is a constant on a Mac and a variable on Windows: it
   * moves with browser zoom, with the OS display scaling, and with dragging
   * the window onto a monitor scaled differently. R3F reads it when the Canvas
   * renders and never on its own, so a ratio that changes after mount leaves
   * the whole scene — and the texture ladder sized from it — built for a
   * display that is no longer there.
   *
   * A media query naming the CURRENT ratio is the only event the platform
   * offers for this, and it has to be re-armed after every change, since the
   * query itself names the value that just stopped being true. The state it
   * bumps exists only to re-render the Canvas, which is what makes R3F look
   * again.
   */
  useEffect(() => {
    let media: MediaQueryList | null = null;
    let cancelled = false;

    const onChange = () => {
      if (cancelled) return;
      setDprEpoch((n) => n + 1);
      arm();
    };

    const arm = () => {
      if (cancelled) return;
      media?.removeEventListener("change", onChange);
      media = window.matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`,
      );
      media.addEventListener("change", onChange);
    };

    arm();
    return () => {
      cancelled = true;
      media?.removeEventListener("change", onChange);
    };
  }, []);

  /**
   * Rebuilt whenever the ratio changes so the Canvas re-renders with it —
   * R3F compares the RESOLVED number, so an identical pair costs nothing.
   *
   * The ceiling is the GPU's to earn (`maxDevicePixelRatio`), not the user
   * agent's to veto. `isMobile` decided this alone until now, which meant the
   * softening described above was not limited to a mis-measured desktop: it was
   * what EVERY phone got, permanently, whatever silicon it had. A tier is the
   * one thing here that actually knows whether the pixels can be afforded.
   */
  const dpr: [number, number] = useMemo(
    () => [1, maxDevicePixelRatio(isMobile)],
    // `dprEpoch` is deliberately a dep the body does not read: producing a new
    // array is the whole point, since that is what re-renders the Canvas and
    // makes R3F sample `devicePixelRatio` again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile, dprEpoch],
  );

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

  // A paper too heavy to animate is swapped behind the SITE's own loading
  // screen instead of behind a page-turn — the same screen, the same fade, the
  // same lift, as arriving at the page for the first time. Dropping
  // `isSceneReady` is all it takes: the overlay is already bound to it, and so
  // are the scroll lock and the UI's own fade, so the whole "the page is not
  // ready yet" state comes back in one piece rather than being re-created.
  // `handleSceneReady` below raises it again when the new paper has genuinely
  // settled, which is the same signal the first visit waits for.
  useEffect(() => {
    return usePaperStore.subscribe((state, prevState) => {
      if (state.usesSiteLoader && !prevState.usesSiteLoader) {
        setIsSceneReady(false);
      }
    });
  }, []);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
    // If this ready signal comes from a freshly swapped paper, it dismisses
    // the switch overlay. No-op on the initial mount.
    usePaperStore.getState().completeSwitch();
  }, []);

  return (
    <LenisProvider>
      <SurahViewerInner
        isSceneReady={isSceneReady}
        canvasReady={canvasReady}
        isMobile={isMobile}
        dpr={dpr}
        webglSupported={webglSupported}
        showPostIntroUI={showPostIntroUI}
        isIntroRenderPhase={isIntroRenderPhase}
        mountMainOverlays={mountMainOverlays}
        scrollPages={scrollPages}
        canvasWrapperRef={canvasWrapperRef}
        handleSceneReady={handleSceneReady}
      />
    </LenisProvider>
  );
}

interface InnerProps {
  isSceneReady: boolean;
  canvasReady: boolean;
  isMobile: boolean;
  /** Resolved by the parent so a pixel-ratio change re-renders the Canvas. */
  dpr: [number, number];
  webglSupported: boolean;
  showPostIntroUI: boolean;
  isIntroRenderPhase: boolean;
  mountMainOverlays: boolean;
  scrollPages: number;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  handleSceneReady: () => void;
}

function SurahViewerInner({
  isSceneReady,
  canvasReady,
  isMobile,
  dpr,
  webglSupported,
  showPostIntroUI,
  isIntroRenderPhase,
  mountMainOverlays,
  scrollPages,
  canvasWrapperRef,
  handleSceneReady,
}: InnerProps) {
  const lenis = useLenis();
  /**
   * "always" while anything is happening, "demand" once the page has been
   * still for a while — see `useAdaptiveFrameloop` for why it is not simply
   * "demand" everywhere. Re-renders only on the transition, twice per idle
   * cycle, never per frame.
   */
  const frameloop = useAdaptiveFrameloop();

  // Whether this paper folds at all. A flat one (a composed atlas, or a sheet
  // whose creased step is commented out) gets no scroll length, no edge
  // slider, no Aç/Katla button and no scroll hint — there is nothing for any
  // of them to drive.
  const hasFoldStory = useHasFoldStory();

  // A composed atlas page (several sheets on one paper) is several times wider
  // than a surah sheet and would run straight off the sides of the app's fixed
  // camera. Every ordinary surah leaves this at 1 and is untouched — see
  // `LayoutDimensions.cameraDistanceScale`.
  const cameraDistanceScale = useStoryStore(
    (s) => s.activeConfig.dimensions.cameraDistanceScale ?? 1,
  );
  const cameraPosition = CAMERA_CONFIG.initialCamera.position.map(
    (v) => v * cameraDistanceScale,
  ) as [number, number, number];

  // See SURAHS_WITHOUT_SIDE_PANELS — pages listed there never mount either
  // side panel, so nothing of theirs is rendered or measured.
  const showSidePanels = usePaperStore(
    (s) => !s.surahId || !SURAHS_WITHOUT_SIDE_PANELS.has(s.surahId),
  );

  useAutoCollapsePanelsOnElevate();

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

  // "wait" cursor while a paper switch is in flight — subscribed via
  // zustand.subscribe (NOT a React hook) so toggling isSwitching never
  // re-renders the overlay tree. The cursor is purely imperative.
  // We also handle paper switch sound effects here.
  useEffect(() => {
    let playedOut = false;
    let playedIn = false;

    const unsub = usePaperStore.subscribe((state, prevState) => {
      // 1. Reset tracking when a new switch begins. The "wait" cursor drops
      // as soon as the incoming page is visually on screen
      // (newPaperRevealed) — not when the whole switch mechanically ends —
      // so the UI never feels busy over a page that has already arrived.
      const wasBusy = prevState.isSwitching && !prevState.newPaperRevealed;
      const isBusy = state.isSwitching && !state.newPaperRevealed;
      if (isBusy && !wasBusy) {
        document.body.style.cursor = "wait";
        playedOut = false;
        playedIn = false;
      } else if (!isBusy && wasBusy) {
        if (document.body.style.cursor === "wait") {
          document.body.style.cursor = "";
        }
      }

      // 2. Play out transition sound when the outgoing paper actually starts curling out
      if (
        state.transitionPhase === "animating" &&
        state.sheetStage === "curl" &&
        !playedOut
      ) {
        playedOut = true;
        if (useAudioUnlockStore.getState().hasInteracted) {
          setTimeout(() => {
            const outAudio = new Audio("/paper-flip.mp3");
            outAudio.playbackRate = 0.9; // Make it even slower
            outAudio.volume = 0.1;
            outAudio
              .play()
              .catch((e) => console.error("Audio play failed:", e));
          }, 300); // Delay slightly so it matches the visual acceleration of the cubic easing
        }
      }

      // 3. Play in transition sound when the incoming paper starts gliding in
      // (This coincides with the curl stage of the outgoing paper)
      if (
        state.transitionPhase === "animating" &&
        state.sheetStage === "curl" &&
        !playedIn
      ) {
        playedIn = true;
        if (useAudioUnlockStore.getState().hasInteracted) {
          const inAudio = new Audio("/paper-flip-2.mp3");
          inAudio.play().catch((e) => console.error("Audio play failed:", e));
        }
      }
    });
    return unsub;
  }, []);

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100dvh",
        backgroundColor: "var(--page-bg)",
        transition: "background-color 0.5s ease",
        position: "relative",
      }}
    >
      <div className="surah-bg-image" />
      {/* The scroll length of the fold story. A paper with nothing to fold
          gets none of it, so the page is exactly one viewport tall and the
          browser's scrollbar never appears beside it. */}
      <div
        aria-hidden="true"
        style={{
          height: hasFoldStory ? `${scrollPages * 100}vh` : 0,
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
          {canvasReady && !webglSupported && <WebGLUnsupportedOverlay />}
          {canvasReady && webglSupported && (
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
                  position: cameraPosition,
                  fov: CAMERA_CONFIG.initialCamera.fov,
                }}
                dpr={dpr}
                gl={{
                  antialias: !isMobile,
                  powerPreference: "high-performance",
                  toneMapping: THREE.NoToneMapping,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
                frameloop={frameloop}
              >
                <ScrollManager />
                <PopUpHoverScrollController />
                {/*
                 * Camera + controls are mounted here, OUTSIDE the paper-keyed
                 * Experience, so the user's camera orientation survives paper
                 * switches completely untouched — no reset, no re-aim.
                 */}
                <PerspectiveCamera
                  makeDefault
                  position={cameraPosition}
                  fov={CAMERA_CONFIG.initialCamera.fov}
                />
                <DynamicControls />
                {/*
                 * Persistent lighting — never remounts on paper switches, so
                 * illumination stays perfectly stable during the swap.
                 * The inner Suspense is CRITICAL: Environment suspends while
                 * its HDR loads, and without a boundary INSIDE the canvas the
                 * suspension bubbles to the outer <Suspense fallback={null}>
                 * and unmounts the entire Canvas (blank page).
                 */}
                <Suspense fallback={null}>
                  <SceneLighting />
                </Suspense>
                {/*
                 * PERSISTENT scene — never remounted on paper switches. Only
                 * the content buffers (RenderTextures keyed by storyRevision)
                 * and config-bound subtrees rebuild in place, so switches are
                 * cheap and nothing (camera, lights, meshes, compiled
                 * shaders) is ever torn down.
                 */}
                <Experience onReady={handleSceneReady} />
                <CameraViewController />
                {!isMobile && <Preload all />}
              </Canvas>
            </div>
          )}
        </div>
      </Suspense>

      <AnimatePresence>
        {!isSceneReady && webglSupported && <SiteLoadingOverlay key="site-loader" />}
      </AnimatePresence>

      <PaperSwitchCursorSpinner />

      {isSceneReady && showPostIntroUI && showSidePanels && <SurahScriptSidebar />}
      {/* The panel's copy for a non-default language is its own chunk
          (useSideInfoContent). The language switcher warms it before it
          flips, so this boundary is only the safety net for a cold read. */}
      {isSceneReady && showPostIntroUI && showSidePanels && (
        <Suspense fallback={null}>
          <SideInfoPanel />
        </Suspense>
      )}

      {isSceneReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-[110] pointer-events-none"
        >
          {isIntroRenderPhase && (
            <>
              <HeroTitleOverlay />
              <div className="fixed inset-0 z-80 pointer-events-none">
                <JoinedStepOverlay />
              </div>
            </>
          )}

          {/* Top-right overlay buttons — a single horizontal row (row-reverse:
              first child renders at the screen edge, later ones grow inward). */}
          <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-100 flex flex-row-reverse items-center gap-0 pointer-events-none">
            <SurahMenuOverlay />
            <HomeButtonOverlay />
            <ThemeToggleOverlay />
            <LanguageSwitchOverlay />
            {mountMainOverlays && (
              <AnimatePresence>
                {showPostIntroUI && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="flex flex-row-reverse items-center gap-0 pointer-events-none"
                  >
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
                  {/* Temporarily hidden camera rotation control. */}
                  {/* <CameraViewPresetOverlay /> */}
                  <ScrollHintOverlay />
                  <FoldSliderOverlay />
                  <PaperArrowsOverlay />
                  <SectionZoomArrowsOverlay />
                  <PaperPaginationOverlay />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/*
       * OUTSIDE EVERY motion wrapper, and that is the whole reason it is down
       * here rather than up with the other overlays.
       *
       * The panel is `position: fixed`, and `will-change` — like `transform` —
       * makes an element a containing block for its fixed descendants. Mounted
       * inside the overlay group, whose `motion.div` carries
       * `willChange: "opacity"`, its `top` and its `100vh` were being measured
       * against THAT div instead of the viewport, so the panel ran off the
       * bottom of the screen and the dials below the fold could not be reached.
       * Nothing about the panel's own CSS could fix that.
       *
       * Out here it is also independent of the intro: the paper is worth tuning
       * before `showPostIntroUI` ever becomes true.
       */}
      <VellumControls />
    </main>
  );
}
