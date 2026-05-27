"use client";

import { useSpring } from "@react-spring/three";
import { useCallback, useEffect, useRef } from "react";
import { useElevatedStore } from "../stores/useElevatedStore";
import { useDragState } from "../utils/dragEngine";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import { useLenis } from "../_components/dom/LenisProvider";

// Transition targets when elevated verse is dragged and paper is docked.
const PAPER_DOCK_X = -0.9;
const PAPER_DOCK_SCALE = 0.9;
const PAPER_FOCUS_Y = 0;
const PAPER_FOCUS_Z = -0.7;
const PAPER_FOCUS_SCALE = 0;
const PAPER_HIDE_SPRING = { mass: 2.2, tension: 74, friction: 24 };
const PAPER_RESTORE_SPRING = { mass: 1.1, tension: 150, friction: 28 };
const SCENE_SPRING = { mass: 1.4, tension: 170, friction: 31 };

const computeTargets = (
  handoff: number,
  introNowActive: boolean,
  dockedNow: boolean,
  allSections: boolean,
) => {
  if (introNowActive || handoff < 1) {
    // Delay paper animation to the second half of the handoff so intro sections
    // are seen moving and stacking below each other first.
    let t = Math.max(0, (handoff - 0.5) * 2);
    t = t * t * (3 - 2 * t); // Smoothstep easing for a natural start and end

    return {
      isHandoff: true,
      paperFocusY: PAPER_FOCUS_Y * (1 - t),
      paperFocusZ: PAPER_FOCUS_Z * (1 - t),
      paperFocusScale: PAPER_FOCUS_SCALE + (1 - PAPER_FOCUS_SCALE) * t,
      paperConfig: PAPER_RESTORE_SPRING,
      sceneOffsetX: 0,
      sceneScale: 1,
      sceneConfig: SCENE_SPRING,
    };
  }

  const showAllSections = allSections;
  const docked = dockedNow && !showAllSections;

  return {
    isHandoff: false,
    paperFocusY: showAllSections ? PAPER_FOCUS_Y : 0,
    paperFocusZ: showAllSections ? PAPER_FOCUS_Z : 0,
    paperFocusScale: showAllSections ? PAPER_FOCUS_SCALE : 1,
    paperConfig: showAllSections ? PAPER_HIDE_SPRING : PAPER_RESTORE_SPRING,
    sceneOffsetX: docked ? PAPER_DOCK_X : 0,
    sceneScale: docked ? PAPER_DOCK_SCALE : 1,
    sceneConfig: SCENE_SPRING,
  };
};

export function useIntroToPaperScroll() {
  const lenis = useLenis();

  const initialTargets = computeTargets(
    useFoldStore.getState().introHandoffProgress,
    useFoldStore.getState().isIntroActive,
    useDragState.getState().isPaperDocked,
    useElevatedStore.getState().isAllSectionsMode,
  );

  const [sceneSpring, sceneApi] = useSpring(() => ({
    sceneOffsetX: initialTargets.sceneOffsetX,
    sceneScale: initialTargets.sceneScale,
    config: initialTargets.sceneConfig,
  }));

  const [paperSpring, paperApi] = useSpring(() => ({
    paperFocusY: initialTargets.paperFocusY,
    paperFocusZ: initialTargets.paperFocusZ,
    paperFocusScale: initialTargets.paperFocusScale,
    config: initialTargets.paperConfig,
  }));

  // Ref so syncSceneTargets always reads the latest "has restored" state.
  const restoredRef = useRef(false);

  const syncSceneTargets = useCallback(() => {
    const store = useFoldStore.getState();
    const dockedNow = useDragState.getState().isPaperDocked;
    let allSections = useElevatedStore.getState().isAllSectionsMode;

    let targets = computeTargets(
      store.introHandoffProgress,
      store.isIntroActive,
      dockedNow,
      allSections,
    );

    if (targets.isHandoff) {
      restoredRef.current = false;
    } else if (!restoredRef.current) {
      // First frame after handoff completes -- call restoreAllSections once.
      restoredRef.current = true;
      useElevatedStore.getState().restoreAllSections();

      // CRITICAL: Recompute targets with updated state BEFORE sending to springs.
      // Without this, paperFocusScale: 0 (from the stale isAllSectionsMode=true)
      // is sent to the spring, causing the paper to briefly shrink to invisible
      // before the subscription corrects it — creating the visible "lag" pulse.
      allSections = useElevatedStore.getState().isAllSectionsMode;
      targets = computeTargets(
        store.introHandoffProgress,
        store.isIntroActive,
        dockedNow,
        allSections,
      );
    }

    paperApi.start({
      paperFocusY: targets.paperFocusY,
      paperFocusZ: targets.paperFocusZ,
      paperFocusScale: targets.paperFocusScale,
      config: targets.paperConfig,
      immediate: false,
    });

    sceneApi.start({
      sceneOffsetX: targets.sceneOffsetX,
      sceneScale: targets.sceneScale,
      config: targets.sceneConfig,
      immediate: false,
    });
  }, [paperApi, sceneApi]);

  useEffect(() => {
    if (!lenis) return;
    const handleSync = () => {
      const store = useFoldStore.getState();
      if (!store.isIntroActive && store.introHandoffProgress >= 1) return;
      syncSceneTargets();
    };

    syncSceneTargets();
    lenis.on("scroll", handleSync);

    return () => {
      lenis.off("scroll", handleSync);
    };
  }, [lenis, syncSceneTargets]);

  useEffect(() => {
    // Gate subscriptions: only call syncSceneTargets when there's actually
    // intro/handoff/allSections/dock state that could affect the paper position.
    // After the handoff completes and paper is in its default state, these are no-ops.
    const guardedSync = () => {
      const store = useFoldStore.getState();
      const elevated = useElevatedStore.getState();
      const drag = useDragState.getState();

      // Still need sync during intro, handoff, allSectionsMode, or paper docked
      if (
        store.isIntroActive ||
        store.introHandoffProgress < 1 ||
        elevated.isAllSectionsMode ||
        drag.isPaperDocked
      ) {
        syncSceneTargets();
        return;
      }

      // After handoff: only react to allSectionsMode or dock state changes
      syncSceneTargets();
    };

    const unsubscribeFold = useFoldStore.subscribe(guardedSync);
    const unsubscribeElevated = useElevatedStore.subscribe(guardedSync);
    const unsubscribeDrag = useDragState.subscribe(guardedSync);

    return () => {
      unsubscribeFold();
      unsubscribeElevated();
      unsubscribeDrag();
    };
  }, [syncSceneTargets]);

  return {
    sceneOffsetX: sceneSpring.sceneOffsetX,
    sceneScale: sceneSpring.sceneScale,
    paperFocusY: paperSpring.paperFocusY,
    paperFocusZ: paperSpring.paperFocusZ,
    paperFocusScale: paperSpring.paperFocusScale,
  };
}
