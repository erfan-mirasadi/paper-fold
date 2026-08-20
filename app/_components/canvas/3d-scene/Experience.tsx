"use client";
import { SpotLight } from "@react-three/drei";
import { a } from "@react-spring/three";
import dynamic from "next/dynamic";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { SinglePaper } from "./SinglePaper";
import { FoldSliderTracker } from "./FoldSliderTracker";
import {
  PaperTransitionLayer,
  PaperSlideGroup,
  TransitionShaderWarmup,
} from "./PaperTransitionMesh";
import { VersesRenderer } from "../verses-object/VersesRenderer";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { ElevatedSectionSurfaces } from "../sections-object/ElevatedSectionSurfaces";
import { ElevatedSectionLabels } from "../sections-object/ElevatedSectionLabels";
import { useDragState } from "../../../utils/dragEngine";
import { VerseClickHitboxes } from "../verses-object/VerseClickHitboxes";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { IntroCameraScrollController } from "../orchestrator/IntroCameraScrollController";
import { useIntroToPaperScroll } from "../../../hooks/useIntroToPaperScroll";
import { IntroSectionAnimationController } from "../../../hooks/useIntroSectionAnimation";
import { SectionZoomCamera } from "../orchestrator/SectionZoomCamera";
import { ViewSpinGroup } from "../orchestrator/ViewSpinGroup";
import { useStoryStore } from "../../../stores/useStoryStore";
import { usePaperStore } from "../../../stores/usePaperStore";
import { PageSpaceAnchor } from "./PageSpaceAnchor";

/**
 * The two development read-outs, behind `dynamic()` ON PURPOSE.
 *
 * A plain `import { Perf } from "r3f-perf"` at the top of this file puts the
 * whole library — ~78 KB gzipped, and its own bundled copy of zustand — into the
 * production chunk, because a `NODE_ENV` check at the JSX call site guards when
 * the component RENDERS and not whether the module is SHIPPED. A dynamic import
 * that only the development branch ever reaches leaves it out of the build
 * entirely, which is the whole point of `Experience` being code-split to begin
 * with.
 *
 * Keep both. Between them they answer "is this frame expensive" (Perf) and "is
 * this device getting the quality it should, and is anything leaking"
 * (DevStatsOverlay) — the two questions this project keeps having to ask.
 */
const Perf = dynamic(
  () => import("r3f-perf").then((m) => ({ default: m.Perf })),
  { ssr: false },
);
const DevStatsOverlay = dynamic(
  () =>
    import("../dev/DevStatsOverlay").then((m) => ({
      default: m.DevStatsOverlay,
    })),
  { ssr: false },
);

const IS_DEV = process.env.NODE_ENV === "development";

interface ExperienceProps {
  isFolded?: boolean;
  onReady?: () => void;
}

export function Experience({ isFolded = false, onReady }: ExperienceProps) {
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const config = useStoryStore((state) => state.activeConfig);
  const storyRevision = useStoryStore((state) => state.storyRevision);
  const hasIntro = config.features.hasIntro;
  const showSpotlight = useFoldStore((s) => hasIntro && s.rawOffset < 0.37);
  const { gl, scene, camera } = useThree();

  // The scene persists across paper switches, so readiness is tracked PER
  // CONTENT REVISION: the paper is "ready" only when the revision it settled
  // at matches the live revision — each swap re-arms the signal by itself.
  const [settledRevision, setSettledRevision] = useState(-1);
  const handlePaperReady = useCallback(() => {
    setSettledRevision(useStoryStore.getState().storyRevision);
  }, []);
  const paperReady = settledRevision === storyRevision;

  const firedRevisionRef = useRef(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✏️ isMobile = سنجش بر اساس هویت دستگاه (UserAgent) — نه عرض صفحه.
  // برای کیفیت گرافیکی از gpuTier استفاده میشه.
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }, []);

  useEffect(() => {
    if (paperReady && firedRevisionRef.current !== storyRevision) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // The 500ms breather only matters on the very first load (it keeps the
      // intro's ready signal off the main thread's busiest moment). During a
      // paper SWITCH it would just be a visible frozen hold between "new
      // paper ready" and the page-turn choreography — fire immediately.
      const delay = usePaperStore.getState().isSwitching ? 0 : 500;
      timeoutRef.current = setTimeout(() => {
        if (firedRevisionRef.current !== storyRevision) {
          firedRevisionRef.current = storyRevision;
          onReady?.();
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [paperReady, storyRevision, onReady]);

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

  useEffect(() => {
    const updateCursor = () => {
      const { phase, isAllSectionsMode } = useElevatedStore.getState();
      const { isIntroActive } = useFoldStore.getState();

      // Framed a section → the entire window is a zoom-out target, whatever the
      // scroll has done to the folds. This used to be gated on the paper still
      // being folded, so a reader who had scrolled to the end — the usual place
      // to read from — got a zoomed page with no cursor saying how to leave it.
      // The background mesh already dismissed on a click from here; only the
      // cursor was missing, and `VerseClickHitboxes` stands down to match.
      if (phase === "elevated" && !isIntroActive && !isAllSectionsMode) {
        document.body.style.cursor = "zoom-out";
      } else {
        if (document.body.style.cursor === "zoom-out") {
          document.body.style.cursor = "";
        }
      }
    };

    const unsubElevated = useElevatedStore.subscribe(updateCursor);
    const unsubFold = useFoldStore.subscribe(updateCursor);

    updateCursor();
    return () => {
      unsubElevated();
      unsubFold();
    };
  }, []);

  const handleBackgroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    const { currentOffset } = useFoldStore.getState();
    const isPaperFolded = currentOffset < 0.98;
    const { phase } = useElevatedStore.getState();

    // When paper has folds: only allow background click if zoomed in (to zoom out)
    if (isPaperFolded && phase !== "elevated") return;
    // When paper is open and idle: nothing to dismiss
    if (!isPaperFolded && phase === "idle") return;

    if (e.delta > 10) return;
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
      {IS_DEV && (
        <>
          <Perf position="top-left" />
          <DevStatsOverlay />
        </>
      )}
      {/*
       * The PerspectiveCamera + DynamicControls live in SurahViewer, OUTSIDE
       * this paper-keyed subtree, so the camera survives paper switches.
       */}
      {hasIntro && <IntroCameraScrollController />}
      <SectionZoomCamera />
      {/*
       * Precompiles the page-turn sheet's shader (a distinct permutation
       * from the live paper's masked material) as soon as the first paper
       * has settled, so the FIRST real paper switch is never the one that
       * pays a first-time shader-compile stall.
       */}
      {paperReady && <TransitionShaderWarmup />}
      <a.group
        rotation-x={-Math.PI / 4}
        position-x={sceneOffsetX}
        scale-x={sceneScale}
        scale-y={sceneScale}
        scale-z={sceneScale}
      >
        {/*
         * Inside the 45° tilt, so ViewSpinGroup's Y axis is the PAGE's own
         * vertical — the slider turns the sheet in place around its centre
         * rather than swinging the camera through a cone around world Y.
         */}
        <ViewSpinGroup>
          <group position={[0, 0.03, 0]} scale={0.9}>
            {/*
             * PaperSlideGroup owns the switch choreography for the REAL
             * content: hidden during "exit" (the transition sheet is an exact
             * stand-in), parked off-screen during "waiting" (settles there
             * unseen), and glides in during "enter".
             */}
            <PaperSlideGroup>
              <a.group
                position-y={paperFocusY}
                position-z={paperFocusZ}
                scale-x={paperFocusScale}
                scale-y={paperFocusScale}
                scale-z={paperFocusScale}
              >
                <SinglePaper isFolded={isFolded} onReady={handlePaperReady} />
                <FoldSliderTracker />
              </a.group>
              {/*
               * Config-bound subtrees rebuild in place per content revision —
               * far cheaper than remounting the whole scene, and it guarantees
               * no per-paper state leaks across switches.
               *
               * CRITICAL: this Suspense boundary is local to this group. Verse
               * and section textures (useTexture) are config-dependent, so a
               * fresh paper — the FIRST time its specific asset URLs are
               * requested — suspends while they load. Without a boundary HERE,
               * that suspense bubbles all the way up to the outer
               * <Suspense fallback={null}> wrapping the whole canvas-wrapper
               * and unmounts EVERYTHING (camera, lights, the transition sheet,
               * the folded paper itself) — a full black flash. Catching it here
               * means only this small group defers for a moment while the
               * paper mesh, lights and any in-flight transition sheet keep
               * rendering normally.
               */}
              <PageSpaceAnchor />
              <Suspense fallback={null}>
                <group key={storyRevision}>
                  {config.features.hasElevatedSections && (
                    <>
                      <ElevatedSectionSurfaces />
                      <ElevatedSectionLabels />
                    </>
                  )}
                  {!isAllSectionsMode && <VerseClickHitboxes />}
                  <VersesRenderer />
                </group>
              </Suspense>
            </PaperSlideGroup>
            {/*
             * The flying page-turn sheet — a sibling of the slide group so it
             * stays visible while the real content is hidden. Renders null
             * outside of the "exit" phase.
             */}
            <PaperTransitionLayer />
          </group>
        </ViewSpinGroup>
      </a.group>

      {hasIntro && <IntroSectionAnimationController />}

      <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group
        name="intro-scene"
        visible={useFoldStore.getState().isIntroActive}
      ></group>

      {/* Environment + base lights live in SceneLighting (SurahViewer level)
          so illumination never pops across paper switches. */}

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
    </>
  );
}
