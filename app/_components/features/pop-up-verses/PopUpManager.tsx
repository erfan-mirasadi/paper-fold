"use client";
import {
  useFoldAnimation,
  useMiddleHorizontalFoldAnimation,
} from "./useFoldAnimation";
import { PopUpVerseCard } from "./PopUpVerseCard";
import { usePopUpStore } from "./ui/usePopUpStore";
import { useEffect, useMemo, useState } from "react";
import { useSpring, a, to } from "@react-spring/three";
import { useElevatedStore } from "../elevated-verses/useElevatedStore";
import { useElevateAnimation } from "../elevated-verses/useElevateAnimation";
import { useElevatedDrag } from "../elevated-verses/drag/useElevatedDrag";
import {
  dragEngine,
  getVerseSectionId,
  useDragState,
} from "../elevated-verses/drag/dragEngine";
import { calculateSectionBounds } from "../elevated-verses/drag/boundsHelper";
import { VerseFiveMetallic } from "./VerseFiveMetallic";
import { PopUpHoverSensors } from "./hover-scroll/PopUpHoverSensors";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  CAPSULE_BG_7_10_15_18,
  CAPSULE_BG_12_14,
  MAROON_THEME,
  GREEN_THEME,
  BLUE_THEME,
  CAPSULE_BG_6_19,
} from "../../data/theme";
import {
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../data/useSurahLanguageStore";
import { useSurahLayoutRuntime } from "../../data/useSurahLayoutRuntime";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";

interface VerseConfig {
  id: number;
  verse: string;
  number: number;
  y: number;
  w: number;
  h: number;
  hingeX: number;
  direction: "left" | "right";
  bg: string;
  border: string;
  circleBorderCol: string;
  circleBg: string;
  circleTextCol: string;
  isPill?: boolean;
}

type ShadowSurfaceSectionId = "s1" | "s2_top" | "s2_bottom";

const SECTION_SURFACE_SHADOW_MOTION = {
  liftHeight: 0.095,
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

function getShadowSurfaceSectionId(
  verseId: number,
): ShadowSurfaceSectionId | null {
  if (verseId >= 1 && verseId <= 5) return "s1";
  if (verseId >= 6 && verseId <= 10) return "s2_top";
  if (verseId >= 15 && verseId <= 19) return "s2_bottom";
  return null;
}

const ZERO_OFFSET = { x: 0, y: 0 };

function buildVerseConfigs(
  surahData: (typeof SURAH_DATA_BY_LANGUAGE)["ar"],
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
): VerseConfig[] {
  const configs: VerseConfig[] = [];
  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  // Section 1 (Verses 1 to 4)
  surahData.section1.gridVerses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const t = SURAH_TRANSFORMS.s1.verses[v.number];
    if (!t) return;

    const worldX = t.x - PAGE_WIDTH / 2;
    const direction = isRightCol ? "right" : "left";
    const hingeX = isRightCol ? worldX : worldX + t.w;

    configs.push({
      id: v.number,
      verse: v.text,
      number: v.number,
      y: t.y,
      w: t.w,
      h: t.h,
      hingeX,
      direction,
      bg: S1_INNER_BG,
      border: S1_INNER_BORDER,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: S1_VERSE_NUMBER_BG,
      circleTextCol: S1_VERSE_NUMBER_BORDER,
    });
  });

  const introT = SURAH_TRANSFORMS.s2.introVerse;
  configs.push({
    id: surahData.section2.introVerse.number,
    verse: surahData.section2.introVerse.text,
    number: surahData.section2.introVerse.number,
    y: introT.y,
    w: introT.w,
    h: introT.h,
    hingeX: introT.x - PAGE_WIDTH / 2,
    direction: "right",
    bg: CAPSULE_BG_6_19,
    border: BLUE_THEME,
    circleBorderCol: BLUE_THEME,
    circleBg: CAPSULE_BG_6_19,
    circleTextCol: BLUE_THEME,
    isPill: false,
  });

  // Section 2 Color Groups
  surahData.section2.colorGroups.forEach((group, gIdx) => {
    const bg = gIdx === 1 ? CAPSULE_BG_12_14 : CAPSULE_BG_7_10_15_18;
    const border = gIdx === 1 ? GREEN_THEME : MAROON_THEME;

    group.verses.forEach((v, i) => {
      const isRightCol = i % 2 !== 0;
      const t = SURAH_TRANSFORMS.s2.groups[gIdx].verses[v.number];
      if (!t) return;

      const worldX = t.x - PAGE_WIDTH / 2;
      const direction = isRightCol ? "right" : "left";
      const hingeX = isRightCol ? worldX : worldX + t.w;

      configs.push({
        id: v.number,
        verse: v.text,
        number: v.number,
        y: t.y,
        w: t.w,
        h: t.h,
        hingeX,
        direction,
        bg,
        border,
        circleBorderCol: border,
        circleBg: bg,
        circleTextCol: border,
      });
    });
  });

  const outroT = SURAH_TRANSFORMS.s2.outroVerse;
  configs.push({
    id: surahData.section2.outroVerse.number,
    verse: surahData.section2.outroVerse.text,
    number: surahData.section2.outroVerse.number,
    y: outroT.y,
    w: outroT.w,
    h: outroT.h,
    hingeX: outroT.x - PAGE_WIDTH / 2,
    direction: "right",
    bg: CAPSULE_BG_6_19,
    border: BLUE_THEME,
    circleBorderCol: BLUE_THEME,
    circleBg: CAPSULE_BG_6_19,
    circleTextCol: BLUE_THEME,
    isPill: false,
  });

  return configs;
}

export function PopUpManager() {
  const runtime = useSurahLayoutRuntime();
  const { s1Top } = runtime.layoutMath;
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];
  const verseConfigs = useMemo(
    () => buildVerseConfigs(surahData, runtime),
    [surahData, runtime],
  );

  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;
  const backfaceColor = "#e8e4d8";

  const groups = usePopUpStore((state) => state.popUpGroups);
  const setHoveredGroupId = usePopUpStore((state) => state.setHoveredGroupId);
  const middleHorizontalFolded = usePopUpStore(
    (state) => state.middleHorizontalFolded,
  );
  const activeVerseIds = useElevatedStore((state) => state.activeVerseIds);
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const isCenterSectionRaised = activeSectionIds.includes("s2_center");

  const VISIBILITY_THRESHOLDS: Record<string, number> = {
    g_1_2: 0,
    g_3_4: 0,
    g_7_8: 0.5,
    g_9_10: 0.75,
    g_11_12_13_14: 0.9,
    g_15_16: 0.9,
    g_17_18: 0.9,
  };

  return (
    <group position={[0, runtime.PAGE_HEIGHT / 2, 0]}>
      {verseConfigs.map((config) => {
        const group = groups.find((g) => g.verseIds.includes(config.id));
        const isOpen = group?.isOpen ?? false;
        const hasEverOpened = group?.hasEverOpened ?? false;
        const isMiddleGroup = group?.id === "g_11_12_13_14";
        const isElevated = activeVerseIds.includes(config.id);
        const shadowSurfaceSectionId = getShadowSurfaceSectionId(config.id);
        const isSectionSurfaceRaised =
          shadowSurfaceSectionId !== null &&
          activeSectionIds.includes(shadowSurfaceSectionId);

        return (
          <PopUpCardWrapper
            key={`popup-${config.id}`}
            config={config}
            isOpen={isOpen}
            hasEverOpened={hasEverOpened}
            isElevated={isElevated}
            isSectionSurfaceRaised={isSectionSurfaceRaised}
            isCenterSectionRaised={isCenterSectionRaised}
            isMiddleHorizontalFolded={isMiddleGroup && middleHorizontalFolded}
            zBaseOffset={zBaseOffset}
            backfaceColor={backfaceColor}
          />
        );
      })}

      <PopUpHoverSensors
        groups={groups}
        versesConfig={verseConfigs}
        zBaseOffset={zBaseOffset}
        setHoveredGroupId={setHoveredGroupId}
      />

      {/* Static Metallic Verse 5 */}
      <VerseFiveMetallic />
    </group>
  );
}

function PopUpCardWrapper({
  config,
  isOpen,
  hasEverOpened,
  isElevated,
  isSectionSurfaceRaised,
  isCenterSectionRaised,
  isMiddleHorizontalFolded,
  zBaseOffset,
  backfaceColor,
}: {
  config: VerseConfig;
  isOpen: boolean;
  hasEverOpened: boolean;
  isElevated: boolean;
  isSectionSurfaceRaised: boolean;
  isCenterSectionRaised: boolean;
  isMiddleHorizontalFolded: boolean;
  zBaseOffset: number;
  backfaceColor: string;
}) {
  const runtime = useSurahLayoutRuntime();
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
  } = useElevateAnimation(isElevated);

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
  const isMiddleFoldCandidate = isMiddleTopRow || isMiddleBottomRow;
  const isHorizontalFoldActive =
    isMiddleFoldCandidate && isMiddleHorizontalFolded;
  const foldVisibility = useFoldAnimation(isOpen || isHorizontalFoldActive);

  const foldProgress = foldVisibility.foldProgress;
  const shadowGlobalOpacity = foldVisibility.shadowGlobalOpacity;
  const zOffset = foldVisibility.zOffset;
  const opacity = foldVisibility.opacity;

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

  const sectionId = getVerseSectionId(config.id);
  const leadVerseId = VERSE_PAIR_LEAD[config.id] ?? config.id;
  const leadVerseDrag = dragEngine.verses[leadVerseId];

  const sectionDrag = sectionId ? dragEngine.sections[sectionId] : null;
  const useSectionGroupDrag =
    isCenterSectionRaised && sectionId === "s2_center" && sectionDrag !== null;

  const isVerseSeparated = useDragState((s) =>
    s.draggedVerseIds.includes(leadVerseId),
  );
  const separationOffset = useDragState(
    (s) => s.separatedVerseOffsets[leadVerseId] || ZERO_OFFSET,
  );

  const sectionBounds = useMemo(() => {
    if (!sectionId || !runtime.SURAH_TRANSFORMS || sectionId === "s2_center") return undefined;
    return calculateSectionBounds(
      sectionId,
      runtime.SURAH_TRANSFORMS,
      runtime.PAGE_WIDTH,
    );
  }, [sectionId, runtime.SURAH_TRANSFORMS, runtime.PAGE_WIDTH]);

  const dragBind = useElevatedDrag({
    enabled: isElevated || isSectionSurfaceRaised,
    springX:
      useSectionGroupDrag && sectionDrag ? sectionDrag.x : leadVerseDrag.x,
    springY:
      useSectionGroupDrag && sectionDrag ? sectionDrag.y : leadVerseDrag.y,
    dragVerseId: useSectionGroupDrag ? undefined : leadVerseId,
    dragSectionId: useSectionGroupDrag ? "s2_center" : undefined,
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
    <a.group {...dragBind} position-x={dragX} position-y={dragY}>
      <PopUpVerseCard
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
        elevateOpacity={elevateOpacity}
        isPill={config.isPill !== false}
        backfaceColor={backfaceColor}
        verse={config.verse}
        number={config.number}
        bg={config.bg}
        border={config.border}
        circleBorderCol={config.circleBorderCol}
        circleBg={config.circleBg}
        circleTextCol={config.circleTextCol}
      />
    </a.group>
  );
}
