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
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

const SECTION_SURFACE_SHADOW_MOTION = {
  liftHeight: SECTION_ELEVATION_HEIGHT,
  liftDelayMs: 120,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
} as const;

/** Dynamic verse pair lead: the smaller ID of the two paired verses. */
function getLeadVerseId(
  configId: number,
  pairings: Record<number, number> | undefined,
) {
  const pairedVerseId = pairings?.[configId];
  return pairedVerseId ? Math.min(configId, pairedVerseId) : configId;
}

const ZERO_OFFSET = { x: 0, y: 0 };

import { usePopUpStore } from "../../../stores/usePopUpStore";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";

import { useStoryStore } from "../../../stores/useStoryStore";
import { SurahLayoutConfig } from "../../../data/schema";

export function VerseController({ config }: { config: VerseConfig }) {
  const activeStoryConfig = useStoryStore((state) => state.activeConfig);

  const runtime = useSurahLayoutRuntime();
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  let finalVerseTextScale = runtime.layoutMath.verseTextScale;
  if (activeStoryConfig.id === "ayatalkursi" && activeLanguage !== "ar") {
    finalVerseTextScale = undefined; // Drop scaling for translations so it uses smaller defaults
  }

  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;
  const backfaceColor = "#e8e4d8";

  const group = usePopUpStore((state) =>
    state.popUpGroups.find((g) => g.verseIds.includes(config.id)),
  );
  const isOpen = group?.isOpen ?? false;
  const hasEverOpened = group?.hasEverOpened ?? false;

  const middleFoldVerses = activeStoryConfig.specialVerses?.middleFoldVerses;
  const isMiddleFoldCandidate = middleFoldVerses
    ? middleFoldVerses.left.includes(config.id) ||
      middleFoldVerses.right.includes(config.id)
    : false;

  const isMiddleGroup =
    group && middleFoldVerses
      ? middleFoldVerses.left.some((id) => group.verseIds.includes(id)) ||
        middleFoldVerses.right.some((id) => group.verseIds.includes(id))
      : false;
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
  const sectionId = getVerseSectionId(config.id);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  // ✅ FIXED: Prevent applying the entire section's surface shadow to individual middle fold verses
  let shadowSurfaceSectionId = getVerseSectionId(config.id);
  if (isMiddleFoldCandidate) {
    shadowSurfaceSectionId = null;
  }

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

  const isMiddleLeftColumn =
    isMiddleFoldCandidate && middleFoldVerses?.left.includes(config.id);
  const isMiddleRightColumn =
    isMiddleFoldCandidate && middleFoldVerses?.right.includes(config.id);
  // Approximation for top vs bottom row if there are 4 middle fold verses (2 top, 2 bottom)
  const isMiddleTopRow =
    isMiddleFoldCandidate &&
    middleFoldVerses &&
    (config.id === Math.min(...middleFoldVerses.left) ||
      config.id === Math.min(...middleFoldVerses.right));
  const isMiddleBottomRow = isMiddleFoldCandidate && !isMiddleTopRow;
  const isHorizontalFoldActive =
    (middleHorizontalFoldedValue === "left" && isMiddleLeftColumn) ||
    (middleHorizontalFoldedValue === "right" && isMiddleRightColumn);
  const foldVisibility = useFoldAnimation(
    (isOpen || isHorizontalFoldActive) === true,
  );

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
    isHorizontalFoldActive === true,
    horizontalDirection,
    isMiddleFoldCandidate === true,
  );
  const middleGapHalf = runtime.layoutMath.s2Gap / 2;
  const horizontalPivotOffsetY = isMiddleTopRow
    ? -(config.h + middleGapHalf)
    : isMiddleBottomRow
      ? middleGapHalf
      : 0;

  const leadVerseId = getLeadVerseId(
    config.id,
    activeStoryConfig.specialVerses?.versePairings,
  );
  const leadVerseDrag = dragEngine.verses[leadVerseId];

  const sectionDrag = sectionId ? dragEngine.sections[sectionId] : null;
  const isSectionRaised = sectionId !== null && activeSectionIds.includes(sectionId);
  let useSectionGroupDrag = false;
  if (sectionId && sectionDrag && isSectionRaised) {
    const s2Groups = (
      activeStoryConfig.sections.find((s) => s.type === "verticalGroups") as any
    )?.groups;
    if (s2Groups && sectionId.includes("_g")) {
      const idxStr = sectionId.split("_g")[1];
      const gIndex = parseInt(idxStr, 10);
      const targetGroup = s2Groups[gIndex];
      if (targetGroup) {
        // dragBehavior takes precedence: 'individual' overrides isCenter
        if (targetGroup.dragBehavior === "individual") {
          useSectionGroupDrag = false;
        } else {
          useSectionGroupDrag =
            targetGroup.dragBehavior === "group" || targetGroup.isCenter;
        }
      }
    }
  }

  const isVerseSeparated = useDragState((s) =>
    s.draggedVerseIds.includes(leadVerseId),
  );
  const separationOffset = useDragState(
    (s) => s.separatedVerseOffsets[leadVerseId] || ZERO_OFFSET,
  );

  // Static check: does this verse belong to a center/group-drag section?
  // Used for bounds calc — must NOT be reactive to avoid stale useMemo.
  const isGroupDragType = useMemo(() => {
    if (!sectionId || !sectionId.includes("_g")) return false;
    const s2Groups = (
      activeStoryConfig.sections.find((s) => s.type === "verticalGroups") as any
    )?.groups;
    if (!s2Groups) return false;
    const idxStr = sectionId.split("_g")[1];
    const gIndex = parseInt(idxStr, 10);
    const targetGroup = s2Groups[gIndex];
    if (!targetGroup) return false;
    if (targetGroup.dragBehavior === "individual") return false;
    return targetGroup.dragBehavior === "group" || targetGroup.isCenter;
  }, [sectionId, activeStoryConfig]);

  const sectionBounds = useMemo(() => {
    if (!sectionId || !runtime.SURAH_TRANSFORMS || isGroupDragType)
      return undefined;
    return calculateSectionBounds(
      sectionId,
      runtime.SURAH_TRANSFORMS,
      runtime.PAGE_WIDTH,
    );
  }, [sectionId, runtime.SURAH_TRANSFORMS, runtime.PAGE_WIDTH, isGroupDragType]);

  const dragBind = useElevatedDrag({
    enabled:
      (isElevated || isSectionSurfaceRaised) &&
      !useFoldStore.getState().isIntroActive,
    springX:
      useSectionGroupDrag && sectionDrag ? sectionDrag.x : leadVerseDrag.x,
    springY:
      useSectionGroupDrag && sectionDrag ? sectionDrag.y : leadVerseDrag.y,
    dragVerseId: useSectionGroupDrag ? undefined : leadVerseId,
    dragSectionId: useSectionGroupDrag ? (sectionId ?? undefined) : undefined,
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
          textScaleOverride={finalVerseTextScale}
          suppressShadow={!isIntroActive}
          shadowRenderOrder={isMiddleFoldCandidate ? 0 : 90}
          customFrameSvg={config.customFrameSvg}
          frameScaleLTR={config.frameScaleLTR}
          capsuleLabel={config.capsuleLabel}
        />
      </a.group>
    </group>
  );
}
