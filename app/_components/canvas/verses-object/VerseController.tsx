"use client";
import { useEffect, useMemo, useState } from "react";
import { useSpring, a, to, SpringValue } from "@react-spring/three";
import {
  useFoldAnimation,
  useMiddleHorizontalFoldAnimation,
} from "../../../hooks/useFoldAnimation";
import {
  useElevateAnimation,
  SECTION_ELEVATION_HEIGHT,
} from "../../../hooks/useElevateAnimation";

import { useElevatedDrag } from "../../../hooks/useElevatedDrag";
import {
  dragEngine,
  getVerseSectionId,
  useDragState,
} from "../../../utils/dragEngine";
import { calculateSectionBounds } from "../../../utils/boundsHelper";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useIntroSectionOffset } from "../../../hooks/useIntroSectionAnimation";
import { useHandoffOpacity } from "../sections-object/ElevatedSectionSurfaces";
import { VerseConfig } from "../../../data/surahDataGenerator";
import { VerseMesh } from "./VerseMesh";

const SECTION_SURFACE_SHADOW_MOTION = {
  liftHeight: SECTION_ELEVATION_HEIGHT,
  liftDelayMs: 120,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
} as const;

/** Static verse-pair mapping: paired verses share a single drag lead. */
const VERSE_PAIR_LEAD: Record<number, number> = {
  1: 1,
  2: 1,
  3: 3,
  4: 3,
  7: 7,
  8: 7,
  9: 9,
  10: 9,
  11: 11,
  12: 11,
  13: 13,
  14: 13,
  15: 15,
  16: 15,
  17: 17,
  18: 17,
};

const ZERO_OFFSET = { x: 0, y: 0 };

import { usePopUpStore } from "../../../stores/usePopUpStore";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";

import { useStoryStore } from "../../../stores/useStoryStore";
import { SurahLayoutConfig } from "../../../data/schema";

type ShadowSurfaceSectionId = string;

function getShadowSurfaceSectionId(
  verseId: number,
  storyConfig: SurahLayoutConfig<any>
): ShadowSurfaceSectionId | null {
  const S1_ID = storyConfig.sections[0].id;
  const S2_ID = storyConfig.sections[1].id;
  const S2_TOP_ID = `${S2_ID}_top`;
  const S2_BOTTOM_ID = `${S2_ID}_bottom`;

  if (verseId >= 1 && verseId <= 5) return S1_ID;
  if (verseId >= 6 && verseId <= 10) return S2_TOP_ID;
  if (verseId >= 15 && verseId <= 19) return S2_BOTTOM_ID;
  return null;
}

export function VerseController({ config }: { config: VerseConfig }) {
  const activeStoryConfig = useStoryStore((state) => state.activeConfig);
  const S1_ID = activeStoryConfig.sections[0].id;
  const S2_ID = activeStoryConfig.sections[1].id;
  const S2_CENTER_ID = `${S2_ID}_center`;
  
  const runtime = useSurahLayoutRuntime();

  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;
  const backfaceColor = "#e8e4d8";

  const group = usePopUpStore((state) =>
    state.popUpGroups.find((g) => g.verseIds.includes(config.id)),
  );
  const isOpen = group?.isOpen ?? false;
  const hasEverOpened = group?.hasEverOpened ?? false;

  const isMiddleGroup = group?.id === "g_11_12_13_14";
  const middleHorizontalFolded = usePopUpStore(
    (state) => state.middleHorizontalFolded,
  );
  const middleHorizontalFoldedValue = isMiddleGroup
    ? middleHorizontalFolded
    : null;

  const isElevated = useElevatedStore((state) =>
    state.activeVerseIds.includes(config.id),
  );
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const isCenterSectionRaised = activeSectionIds.includes(S2_CENTER_ID);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const shadowSurfaceSectionId = getShadowSurfaceSectionId(config.id, activeStoryConfig);
  const isSectionSurfaceRaised =
    shadowSurfaceSectionId !== null &&
    activeSectionIds.includes(shadowSurfaceSectionId);
  const [hasEverBeenElevated, setHasEverBeenElevated] = useState(isElevated);
  useEffect(() => {
    if (!isElevated) return;
    const timer = window.setTimeout(() => {
      setHasEverBeenElevated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isElevated]);

  const hasVisibleElevationHistory = hasEverBeenElevated || isElevated;

  const verticalFold = useFoldAnimation(isOpen);

  const sectionId = getVerseSectionId(config.id);

  const {
    liftZ,
    tiltX,
    scale,
    shadowOpacity: elevateShadowOpacity,
    opacity: elevateOpacity,
  } = useElevateAnimation(isElevated, sectionId);

  const { surfaceLiftZ } = useSpring({
    surfaceLiftZ: isSectionSurfaceRaised
      ? SECTION_SURFACE_SHADOW_MOTION.liftHeight
      : 0,
    from: { surfaceLiftZ: 0 },
    delay: isSectionSurfaceRaised
      ? SECTION_SURFACE_SHADOW_MOTION.liftDelayMs
      : 0,
    config: SECTION_SURFACE_SHADOW_MOTION.spring,
  });

  const isMiddleTopRow = config.id === 11 || config.id === 12;
  const isMiddleBottomRow = config.id === 13 || config.id === 14;
  const isMiddleFoldCandidate =
    config.id === 11 ||
    config.id === 12 ||
    config.id === 13 ||
    config.id === 14;
  const isMiddleLeftColumn =
    isMiddleFoldCandidate && config.direction === "left";
  const isMiddleRightColumn =
    isMiddleFoldCandidate && config.direction === "right";
  const isHorizontalFoldActive =
    (middleHorizontalFoldedValue === "left" && isMiddleLeftColumn) ||
    (middleHorizontalFoldedValue === "right" && isMiddleRightColumn);
  const foldVisibility = useFoldAnimation(isOpen || isHorizontalFoldActive);

  const foldProgress = foldVisibility.foldProgress;
  const shadowGlobalOpacity = foldVisibility.shadowGlobalOpacity;
  const zOffset = foldVisibility.zOffset;

  // Fade out both the fold opacity and elevate opacity during the handoff phase
  const baseOpacity = foldVisibility.opacity;
  const opacity = useHandoffOpacity(baseOpacity, sectionId);
  const handoffElevateOpacity = useHandoffOpacity(elevateOpacity, sectionId);

  const rotLeft = verticalFold.rotLeft;
  const rotRight = verticalFold.rotRight;
  const horizontalDirection: 1 | -1 = isMiddleTopRow ? 1 : -1;
  const { horizontalTiltX, horizontalLiftZ } = useMiddleHorizontalFoldAnimation(
    isHorizontalFoldActive,
    horizontalDirection,
    isMiddleFoldCandidate,
  );
  const middleGapHalf = runtime.layoutMath.s2Gap / 2;
  const horizontalPivotOffsetY = isMiddleTopRow
    ? -(config.h + middleGapHalf)
    : isMiddleBottomRow
      ? middleGapHalf
      : 0;

  const leadVerseId = VERSE_PAIR_LEAD[config.id] ?? config.id;
  const leadVerseDrag = dragEngine.verses[leadVerseId];

  const sectionDrag = sectionId ? dragEngine.sections[sectionId] : null;
  const useSectionGroupDrag =
    isCenterSectionRaised && sectionId === S2_CENTER_ID && sectionDrag !== null;

  const isVerseSeparated = useDragState((s) =>
    s.draggedVerseIds.includes(leadVerseId),
  );
  const separationOffset = useDragState(
    (s) => s.separatedVerseOffsets[leadVerseId] || ZERO_OFFSET,
  );

  const sectionBounds = useMemo(() => {
    if (!sectionId || !runtime.SURAH_TRANSFORMS || sectionId === S2_CENTER_ID)
      return undefined;
    return calculateSectionBounds(
      sectionId,
      runtime.SURAH_TRANSFORMS,
      runtime.PAGE_WIDTH,
    );
  }, [sectionId, runtime.SURAH_TRANSFORMS, runtime.PAGE_WIDTH]);

  const dragBind = useElevatedDrag({
    enabled:
      (isElevated || isSectionSurfaceRaised) &&
      !useFoldStore.getState().isIntroActive,
    springX:
      useSectionGroupDrag && sectionDrag ? sectionDrag.x : leadVerseDrag.x,
    springY:
      useSectionGroupDrag && sectionDrag ? sectionDrag.y : leadVerseDrag.y,
    dragVerseId: useSectionGroupDrag ? undefined : leadVerseId,
    dragSectionId: useSectionGroupDrag ? S2_CENTER_ID : undefined,
    sectionBounds,
    sectionSpringX: sectionDrag?.x,
    sectionSpringY: sectionDrag?.y,
  });

  const dragX = to(
    [leadVerseDrag.x, sectionDrag ? sectionDrag.x : leadVerseDrag.x],
    (vx, sx) =>
      vx + (isVerseSeparated ? separationOffset.x : sectionDrag ? sx : 0),
  );

  const dragY = to(
    [leadVerseDrag.y, sectionDrag ? sectionDrag.y : leadVerseDrag.y],
    (vy, sy) =>
      vy + (isVerseSeparated ? separationOffset.y : sectionDrag ? sy : 0),
  );

  const introSectionMotionRef = useIntroSectionOffset(sectionId);

  const [hasEverBeenHorizontallyFolded, setHasEverBeenHorizontallyFolded] =
    useState(isHorizontalFoldActive);
  useEffect(() => {
    if (!isHorizontalFoldActive) return;
    const timer = window.setTimeout(() => {
      setHasEverBeenHorizontallyFolded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isHorizontalFoldActive]);

  const hasVisibleHorizontalHistory =
    isMiddleFoldCandidate && hasEverBeenHorizontallyFolded;

  if (
    !hasEverOpened &&
    !isOpen &&
    !isHorizontalFoldActive &&
    !hasVisibleElevationHistory &&
    !hasVisibleHorizontalHistory
  ) {
    return null;
  }

  return (
    <group ref={introSectionMotionRef}>
      <a.group {...dragBind} position-x={dragX} position-y={dragY}>
        <VerseMesh
          direction={config.direction}
          hingeX={config.hingeX}
          y={config.y}
          w={config.w}
          h={config.h}
          zBaseOffset={zBaseOffset}
          rotValue={config.direction === "left" ? rotLeft : rotRight}
          foldProgress={foldProgress}
          shadowGlobalOpacity={shadowGlobalOpacity}
          zOffset={zOffset}
          opacity={opacity}
          liftZ={liftZ}
          surfaceLiftZ={surfaceLiftZ}
          tiltX={tiltX}
          horizontalTiltX={horizontalTiltX}
          horizontalLiftZ={horizontalLiftZ}
          horizontalPivotOffsetY={horizontalPivotOffsetY}
          scale={scale}
          elevateShadowOpacity={elevateShadowOpacity}
          elevateOpacity={handoffElevateOpacity}
          isPill={config.isPill !== false}
          backfaceColor={backfaceColor}
          verse={config.verse}
          number={config.number}
          bg={config.bg}
          border={config.border}
          circleBorderCol={config.circleBorderCol}
          circleBg={config.circleBg}
          circleTextCol={config.circleTextCol}
          textColor={config.textColor}
          suppressShadow={!isIntroActive}
          shadowRenderOrder={isMiddleFoldCandidate ? 0 : 90}
          customFrameSvg={config.customFrameSvg}
          frameScaleLTR={config.frameScaleLTR}
          anaAyetTab={config.anaAyetTab}
        />
      </a.group>
    </group>
  );
}
