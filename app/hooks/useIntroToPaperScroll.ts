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
    const t = handoff; // 0 = hidden, 1 = normal

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
    const allSections = useElevatedStore.getState().isAllSectionsMode;

    const targets = computeTargets(
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
    const unsubscribeFold = useFoldStore.subscribe(() => syncSceneTargets());
    const unsubscribeElevated = useElevatedStore.subscribe(() =>
      syncSceneTargets(),
    );
    const unsubscribeDrag = useDragState.subscribe(() => syncSceneTargets());

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
