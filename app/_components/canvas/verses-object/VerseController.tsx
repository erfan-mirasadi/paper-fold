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
export function VerseController({ config }: { config: VerseConfig }) {
  const activeStoryConfig = useStoryStore((state) => state.activeConfig);

  const runtime = useSurahLayoutRuntime();
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  let finalVerseTextScale =
    config.textScaleOverride ?? runtime.layoutMath.verseTextScale;
  if (activeLanguage !== "ar") {
    if (config.translationTextScaleOverride !== undefined) {
      finalVerseTextScale = config.translationTextScaleOverride === null ? undefined : config.translationTextScaleOverride;
    } else if (runtime.layoutMath.translationVerseTextScale !== undefined) {
      finalVerseTextScale =
        runtime.layoutMath.translationVerseTextScale === null
          ? undefined
          : runtime.layoutMath.translationVerseTextScale;
    }
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
  const isSectionRaised =
    sectionId !== null && activeSectionIds.includes(sectionId);
  let useSectionGroupDrag = false;
  if (sectionId && sectionDrag && isSectionRaised) {
    const s2Config = activeStoryConfig.sections.find(
      (s) => s.type === "verticalGroups",
    ) as any;

    let targetGroup: any = null;
    if (s2Config?.groups) {
      if (sectionId.includes("_g")) {
        const idxStr = sectionId.split("_g")[1];
        const gIndex = parseInt(idxStr, 10);
        targetGroup = s2Config.groups[gIndex];
      } else {
        targetGroup = s2Config.groups.find((g: any) =>
          g.verseIds?.includes(leadVerseId),
        );
      }
    }

    // When customSections is present, evaluate its drag mode
    if (s2Config?.customSections?.length > 0) {
      if (targetGroup?.dragBehavior === "individual") {
        useSectionGroupDrag = false;
      } else {
        useSectionGroupDrag = true;
      }
    } else if (targetGroup) {
      // dragBehavior takes precedence: 'individual' overrides isCenter
      if (targetGroup.dragBehavior === "individual") {
        useSectionGroupDrag = false;
      } else {
        useSectionGroupDrag =
          targetGroup.dragBehavior === "group" || targetGroup.isCenter;
      }
    }
  }

  const isVerseSeparated = useDragState((s) =>
    s.draggedVerseIds.includes(leadVerseId),
  );

  const animatedLiftZ = to([liftZ], (l) => l + (isVerseSeparated ? 0.015 : 0));
  const dynamicRenderOrder = isVerseSeparated
    ? 1000 + config.id * 10
    : 100 + config.id * 10;
  const separationOffset = useDragState(
    (s) => s.separatedVerseOffsets[leadVerseId] || ZERO_OFFSET,
  );

  // ── Parent section for custom-sections (Ahzab) ──────────────────────────
  // Computed early so it can be used for both snap bounds and position offset.
  const s2Config = activeStoryConfig.sections.find(
    (s) => s.type === "verticalGroups",
  ) as any;
  const hasCustomSections = Boolean(s2Config?.customSections?.length);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  // parentSectionDrag: always track, used for snap and (in all-sections mode) position
  const parentSectionDrag =
    hasCustomSections && s2Config?.id ? dragEngine.sections[s2Config.id] : null;

  // Static check: does this verse belong to a center/group-drag section?
  const isGroupDragType = useMemo(() => {
    if (!sectionId) return false;

    let targetGroup: any = null;
    if (s2Config?.groups) {
      if (sectionId.includes("_g")) {
        const idxStr = sectionId.split("_g")[1];
        const gIndex = parseInt(idxStr, 10);
        targetGroup = s2Config.groups[gIndex];
      } else {
        targetGroup = s2Config.groups.find((g: any) =>
          g.verseIds?.includes(leadVerseId),
        );
      }
    }

    if (hasCustomSections) {
      if (targetGroup?.dragBehavior === "individual") return false;
      return true;
    }

    if (!targetGroup) return false;
    if (targetGroup.dragBehavior === "individual") return false;
    return targetGroup.dragBehavior === "group" || targetGroup.isCenter;
  }, [sectionId, hasCustomSections, s2Config, leadVerseId]);

  // ── Snap mode + bounds ────────────────────────────────────────────────────
  //
  // Paper mode + group/section drag (useSectionGroupDrag=true):
  //   → "page": snap back if section hasn't moved outside the page.
  //
  // All-sections mode + individual verse drag (useSectionGroupDrag=false):
  //   → "section": snap verse back if it hasn't moved outside its section frame.
  //   springX here = leadVerseDrag.x (verse's own displacement from its section-relative rest).
  //
  // All other cases (all-sections + group drag, paper + individual):
  //   → undefined: element stays wherever dropped.

  const snapMode: "page" | "section" | undefined = useMemo(() => {
    // Paper mode + section/group drag → snap back to page if section center is on paper
    if (!isAllSectionsMode && useSectionGroupDrag) return "page";
    // Individual verse drag (paper or all-sections mode) → snap back to section frame
    if (!useSectionGroupDrag) return "section";
    // All-sections mode + group drag → section placed freely (no auto snap)
    return undefined;
  }, [isAllSectionsMode, useSectionGroupDrag]);

  // sectionBounds only needed for "section" snap (individual verse in all-sections mode)
  const sectionBounds = useMemo(() => {
    if (snapMode !== "section") return undefined;
    if (!sectionId || !runtime.SURAH_TRANSFORMS) return undefined;
    if (hasCustomSections && s2Config?.id) {
      // For custom sections (Ahzab), snap zone = parent section frame
      return calculateSectionBounds(
        s2Config.id,
        runtime.SURAH_TRANSFORMS,
        runtime.PAGE_WIDTH,
      );
    }
    return calculateSectionBounds(
      sectionId,
      runtime.SURAH_TRANSFORMS,
      runtime.PAGE_WIDTH,
    );
  }, [
    snapMode,
    sectionId,
    runtime.SURAH_TRANSFORMS,
    runtime.PAGE_WIDTH,
    hasCustomSections,
    s2Config,
  ]);

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
    snapMode,
  });

  const dragX = to(
    [
      leadVerseDrag.x,
      sectionDrag ? sectionDrag.x : leadVerseDrag.x,
      parentSectionDrag ? parentSectionDrag.x : leadVerseDrag.x,
    ],
    (vx, sx, px) => {
      const parentOffset = parentSectionDrag ? px : 0;
      return (
        vx +
        (isVerseSeparated ? separationOffset.x : sectionDrag ? sx : 0) +
        parentOffset
      );
    },
  );

  const dragY = to(
    [
      leadVerseDrag.y,
      sectionDrag ? sectionDrag.y : leadVerseDrag.y,
      parentSectionDrag ? parentSectionDrag.y : leadVerseDrag.y,
    ],
    (vy, sy, py) => {
      const parentOffset = parentSectionDrag ? py : 0;
      return (
        vy +
        (isVerseSeparated ? separationOffset.y : sectionDrag ? sy : 0) +
        parentOffset
      );
    },
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
          liftZ={animatedLiftZ as any}
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
          translationTextAlign={config.translationTextAlign}
          suppressShadow={!isIntroActive}
          shadowRenderOrder={isMiddleFoldCandidate ? 0 : 90}
          customFrameSvg={config.customFrameSvg}
          frameScaleLTR={config.frameScaleLTR}
          capsuleLabel={config.capsuleLabel}
          baseRenderOrder={dynamicRenderOrder}
        />
      </a.group>
    </group>
  );
}
