"use client";
import { useFoldAnimation } from "./useFoldAnimation";
import { PopUpVerseCard } from "./PopUpVerseCard";
import { usePopUpStore } from "./ui/usePopUpStore";
import { useState } from "react";
import { useSpring } from "@react-spring/three";
import { useElevatedStore } from "../elevated-verses/useElevatedStore";
import { useElevateAnimation } from "../elevated-verses/useElevateAnimation";
import { PopUp3DTracker } from "./ui/PopUp3DTracker";
import { VerseFiveMetallic } from "./VerseFiveMetallic";
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
  WHITE_BASE,
} from "../../data/theme";
import {
  layoutMath,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  START_X,
  SURAH_DATA,
  getPopUpTrackerPosition,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
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

function getShadowSurfaceSectionId(
  verseId: number,
): ShadowSurfaceSectionId | null {
  if (verseId >= 1 && verseId <= 5) return "s1";
  if (verseId >= 6 && verseId <= 10) return "s2_top";
  if (verseId >= 15 && verseId <= 19) return "s2_bottom";
  return null;
}

const VERSES_CONFIG: VerseConfig[] = (() => {
  const configs: VerseConfig[] = [];
  const {
    sectionW,
    s1Top,
    s1Pad,
    gap,
    smallBoxH,
    innerHalfW,
    s2PadLeftRight,
    groupPad,
    s2Gap,
    smallBoxH2,
    groupInnerHalfW,
    g1Y,
    g2Y,
    g3Y,
    g2Shrink,
    extraRowGap,
  } = layoutMath;

  //  Section 1 (Verses 1 to 4)
  const s1BaseX = START_X + s1Pad;
  SURAH_DATA.section1.gridVerses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    const w = innerHalfW;
    const h = smallBoxH;

    const localX = s1BaseX + (isRightCol ? w + gap : 0);
    const worldX = localX - PAGE_WIDTH / 2;
    const y = s1Top - s1Pad - (isBottomRow ? h + gap : 0);

    const direction = isRightCol ? "right" : "left";
    const hingeX = isRightCol ? worldX : worldX + w;

    configs.push({
      id: v.number,
      verse: v.text,
      number: v.number,
      y,
      w,
      h,
      hingeX,
      direction,
      bg: S1_INNER_BG,
      border: S1_INNER_BORDER,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: S1_VERSE_NUMBER_BG,
      circleTextCol: "#ffffff",
    });
  });

  const introT = SURAH_TRANSFORMS.s2.introVerse;
  configs.push({
    id: SURAH_DATA.section2.introVerse.number,
    verse: SURAH_DATA.section2.introVerse.text,
    number: SURAH_DATA.section2.introVerse.number,
    y: introT.y,
    w: introT.w,
    h: introT.h,
    hingeX: introT.x - PAGE_WIDTH / 2,
    direction: "right",
    bg: CAPSULE_BG_6_19,
    border: BLUE_THEME,
    circleBorderCol: BLUE_THEME,
    circleBg: BLUE_THEME,
    circleTextCol: WHITE_BASE,
    isPill: false,
  });

  // 2. Section 2 Bases
  const s2BaseX = START_X + s2PadLeftRight;

  // Group 1 (Verses 7 to 10)
  SURAH_DATA.section2.colorGroups[0].verses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    const w = groupInnerHalfW;
    const h = smallBoxH2;

    const localX = s2BaseX + groupPad + (isRightCol ? w + s2Gap : 0);
    const worldX = localX - PAGE_WIDTH / 2;
    const y = g1Y - groupPad - (isBottomRow ? h + s2Gap + extraRowGap : 0);

    const direction = isRightCol ? "right" : "left";
    const hingeX = isRightCol ? worldX : worldX + w;

    configs.push({
      id: v.number,
      verse: v.text,
      number: v.number,
      y,
      w,
      h,
      hingeX,
      direction,
      bg: CAPSULE_BG_7_10_15_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: MAROON_THEME,
      circleTextCol: "#ffffff",
    });
  });

  // Group 2 (Verses 11 to 14)
  const g2BaseX = s2BaseX + g2Shrink;
  const g2InnerW = sectionW - s2PadLeftRight * 2 - g2Shrink * 2;
  const g2GroupInnerHalfW = (g2InnerW - groupPad * 2 - s2Gap) / 2;

  SURAH_DATA.section2.colorGroups[1].verses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    const w = g2GroupInnerHalfW;
    const h = smallBoxH2;

    const localX = g2BaseX + groupPad + (isRightCol ? w + s2Gap : 0);
    const worldX = localX - PAGE_WIDTH / 2;
    const y = g2Y - groupPad - (isBottomRow ? h + s2Gap : 0);

    const direction = isRightCol ? "right" : "left";
    const hingeX = isRightCol ? worldX : worldX + w;

    configs.push({
      id: v.number,
      verse: v.text,
      number: v.number,
      y,
      w,
      h,
      hingeX,
      direction,
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: GREEN_THEME,
      circleTextCol: "#ffffff",
    });
  });

  // Group 3 (Verses 15 to 18)
  SURAH_DATA.section2.colorGroups[2].verses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    const w = groupInnerHalfW;
    const h = smallBoxH2;

    const localX = s2BaseX + groupPad + (isRightCol ? w + s2Gap : 0);
    const worldX = localX - PAGE_WIDTH / 2;
    const y = g3Y - groupPad - (isBottomRow ? h + s2Gap + extraRowGap : 0);

    const direction = isRightCol ? "right" : "left";
    const hingeX = isRightCol ? worldX : worldX + w;

    configs.push({
      id: v.number,
      verse: v.text,
      number: v.number,
      y,
      w,
      h,
      hingeX,
      direction,
      bg: CAPSULE_BG_7_10_15_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: MAROON_THEME,
      circleTextCol: "#ffffff",
    });
  });

  const outroT = SURAH_TRANSFORMS.s2.outroVerse;
  configs.push({
    id: SURAH_DATA.section2.outroVerse.number,
    verse: SURAH_DATA.section2.outroVerse.text,
    number: SURAH_DATA.section2.outroVerse.number,
    y: outroT.y,
    w: outroT.w,
    h: outroT.h,
    hingeX: outroT.x - PAGE_WIDTH / 2,
    direction: "right",
    bg: CAPSULE_BG_6_19,
    border: BLUE_THEME,
    circleBorderCol: BLUE_THEME,
    circleBg: BLUE_THEME,
    circleTextCol: WHITE_BASE,
    isPill: false,
  });

  return configs;
})();

export function PopUpManager() {
  const { s1Top } = layoutMath;

  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;
  const backfaceColor = "#e8e4d8";

  const groups = usePopUpStore((state) => state.popUpGroups);
  const activeVerseIds = useElevatedStore((state) => state.activeVerseIds);
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);

  const VISIBILITY_THRESHOLDS: Record<string, number> = {
    g_1_2: 0,
    g_3_4: 0,
    g_7_8: 0.50,
    g_9_10: 0.75,
    g_11_12_13_14: 0.90,
    g_15_16: 0.90,
    g_17_18: 0.90,
  };

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {VERSES_CONFIG.map((config) => {
        const group = groups.find((g) => g.verseIds.includes(config.id));
        const isOpen = group?.isOpen ?? false;
        const hasEverOpened = group?.hasEverOpened ?? false;
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
            zBaseOffset={zBaseOffset}
            backfaceColor={backfaceColor}
          />
        );
      })}

      {/* Render 3D Trackers for each group at the correct positions */}
      {groups.map((g) => {
        const versesInGroup = VERSES_CONFIG.filter((c) =>
          g.verseIds.includes(c.id),
        );
        if (!versesInGroup.length) return null;

        const [btnX, centerY] = getPopUpTrackerPosition(versesInGroup);

        // Determine specific scroll threshold mapping. Default 0 if missing.
        const threshold = VISIBILITY_THRESHOLDS[g.id] ?? 0;

        return (
          <PopUp3DTracker
            key={`tracker-${g.id}`}
            id={g.id}
            worldPosition={[btnX, centerY, zBaseOffset]}
            scrollThreshold={threshold}
          />
        );
      })}

      {/* Global button anchor at top center of the paper */}
      <PopUp3DTracker
        id="global"
        worldPosition={[
          ...getPopUpTrackerPosition([], true, s1Top),
          zBaseOffset,
        ]}
        scrollThreshold={0.90}
      />

      {/* Static Metallic Verse 5 (stuck to paper) */}
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
  zBaseOffset,
  backfaceColor,
}: {
  config: VerseConfig;
  isOpen: boolean;
  hasEverOpened: boolean;
  isElevated: boolean;
  isSectionSurfaceRaised: boolean;
  zBaseOffset: number;
  backfaceColor: string;
}) {
  const [hasEverBeenElevated, setHasEverBeenElevated] = useState(isElevated);
  if (isElevated && !hasEverBeenElevated) {
    setHasEverBeenElevated(true);
  }

  const {
    rotLeft,
    rotRight,
    foldProgress,
    shadowGlobalOpacity,
    zOffset,
    opacity,
  } = useFoldAnimation(isOpen);

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

  if (!hasEverOpened && !isOpen && !hasEverBeenElevated) return null;

  return (
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
  );
}
