"use client";

import {
  TopLabel,
  UiRect,
  VerseBox,
  AnaAyetTab,
  S1_OUTER_BORDER,
  S1_OUTER_BG,
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_ANA_BG,
  S1_ANA_BORDER,
  S2_OUTER_BORDER,
  S2_OUTER_BG,
  WHITE_VERSE_BG,
  MAROON_THEME,
  GREEN_THEME,
  BLUE_THEME,
  HOLLOW_BORDER_COLOR,
  CAPSULE_BG_7_10_15_18,
  CAPSULE_BG_12_14,
  CAPSULE_BG_6_19,
  BUMP_MAX,
  BUMP_MID,
  BUMP_LOWER,
  BUMP_DEEP,
  WHITE_BASE,
  DirectionalCross,
} from "./SharedUI";
import { SideCurves } from "./SideCurves";
import { ORIGINAL_TEXTURE_TIMING } from "../pop-up-verses/useFoldAnimation";
import { useEffect, useState } from "react";

// ============================================================================
// DATA INTERFACES
// Setup structure of the content mapped dynamically down from `index.tsx`.
// ============================================================================
export interface Verse {
  number: number;
  text: string;
}

export interface SectionOneData {
  label: string;
  gridVerses: Verse[];
  anaAyet: Verse;
}

export interface ColorGroup {
  verses: Verse[];
  verseBg?: string;
}

export interface SectionTwoData {
  topLabel: string;
  introVerse: Verse;
  colorGroups: ColorGroup[];
  outroVerse: Verse;
  bottomLabel: string;
}

// ============================================================================
// LAYOUT CONFIG INTERFACE
// Mapped safely representing absolutely placed items across Section layout.
// ============================================================================
export interface LayoutConfig {
  sectionW: number;
  innerW: number;
  innerHalfW: number;
  s1Top: number;
  s1Pad: number;
  gap: number;
  smallBoxH: number;
  anaAyetH: number;
  s1H: number;
  s2Top: number;
  s2Pad: number;
  s2PadTop: number;
  s2PadBottom: number;
  bigBoxH: number;
  groupGap: number;
  groupPad: number;
  s2Gap: number;
  smallBoxH2: number;
  groupH: number;
  s2H: number;
  v6Y: number;
  g1Y: number;
  g2Y: number;
  g3Y: number;
  v19Y: number;
  baseG1Y: number;
  baseG3Y: number;
  groupInnerHalfW: number;
  s2PadLeftRight: number;
  g2Shrink: number;
  sgPad: number;
  sgBorderWidth: number;
  boxExtOffset: number;
  extraRowGap: number;
}

// ============================================================================
// SECTION 1 (UPPER WRAPPER)
// Responsible for Top content visualization with Main Grid arrays and single AnaAyet tag
// ============================================================================
interface SectionOneProps {
  data: SectionOneData;
  layout: LayoutConfig;
  startX: number;
  PW: number;
  isBumpMap?: boolean;
  isFolded?: boolean;
}

export function SectionOne({
  data,
  layout,
  startX,
  PW,
  isBumpMap = false,
  isFolded = false,
}: SectionOneProps) {
  const { s1Top, s1Pad, gap, smallBoxH, anaAyetH, s1H, innerW, innerHalfW } =
    layout;
  const baseX = startX + s1Pad;

  const [delayedIsFolded, setDelayedIsFolded] = useState(isFolded);

  useEffect(() => {
    const delay = isFolded
      ? ORIGINAL_TEXTURE_TIMING.hideDelay
      : ORIGINAL_TEXTURE_TIMING.showDelay;
    const timeout = setTimeout(() => {
      setDelayedIsFolded(isFolded);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isFolded]);

  return (
    <group>
      {/* Outer wrapper panel borders */}
      <UiRect
        x={startX}
        y={s1Top}
        z={0}
        w={layout.sectionW}
        h={s1H}
        radius={0.02}
        color={S1_OUTER_BORDER}
        shadow
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      <UiRect
        x={startX + 0.003}
        y={s1Top - 0.003}
        z={0.001}
        w={layout.sectionW - 0.006}
        h={s1H - 0.006}
        radius={0.017}
        color={S1_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_DEEP}
      />

      {/* Renders main verse 2 x 2 grid inside Section One limits */}
      {data.gridVerses.map((v: Verse, i: number) => {
        if (delayedIsFolded && (v.number === 1 || v.number === 2)) return null;

        const isRightCol = i % 2 !== 0;
        const isBottomRow = i >= 2;
        const xPos = baseX + (isRightCol ? innerHalfW + gap : 0);
        const yPos = s1Top - s1Pad - (isBottomRow ? smallBoxH + gap : 0);

        return (
          <VerseBox
            key={v.number}
            x={xPos}
            y={yPos}
            z={0.002}
            w={innerHalfW}
            h={smallBoxH}
            verse={v.text}
            number={v.number}
            bg={S1_INNER_BG}
            border={S1_INNER_BORDER}
            circleBorderCol={S1_OUTER_BORDER}
            circleBg={S1_OUTER_BORDER}
            circleTextCol={WHITE_BASE}
            isPill={true}
            isBumpMap={isBumpMap}
          />
        );
      })}

      {/* Main Focus Highlight (AnaAyet) Bottom Panel Row */}
      <group position={[0.0, -0.01, 0]}>
        <VerseBox
          x={baseX}
          y={s1Top - s1Pad - (smallBoxH * 2 + gap) - gap}
          z={0.002}
          w={innerW}
          h={anaAyetH}
          verse={data.anaAyet.text}
          number={data.anaAyet.number}
          bg={S1_ANA_BG}
          border={S1_ANA_BORDER}
          circleBorderCol={S1_ANA_BORDER}
          circleBg={S1_ANA_BORDER}
          circleTextCol={WHITE_BASE}
          isPill={false}
          isBumpMap={isBumpMap}
        />
        <AnaAyetTab
          x={baseX - 0.07 - s1Pad}
          y={s1Top - s1Pad - (smallBoxH * 2 + gap) - gap - anaAyetH / 2 + 0.046}
          z={0.005}
          isBumpMap={isBumpMap}
        />
      </group>

      {/* Absolute Section Title Label Pinning Target */}
      <TopLabel
        x={PW / 2}
        y={s1Top}
        z={0.004}
        text={data.label}
        isBumpMap={isBumpMap}
        noBorder={true}
      />
    </group>
  );
}

// ============================================================================
// SECTION 2 (LOWER WRAPPER)
// Manages large verse grids grouped into connected 3 main containers.
// ============================================================================
interface SectionTwoProps {
  data: SectionTwoData;
  layout: LayoutConfig;
  startX: number;
  PW: number;
  isBumpMap?: boolean;
}

export function SectionTwo({
  data,
  layout,
  startX,
  PW,
  isBumpMap = false,
}: SectionTwoProps) {
  const {
    s2Top,
    bigBoxH,
    groupPad,
    s2Gap,
    smallBoxH2,
    groupH,
    s2H,
    groupInnerHalfW,
    v6Y,
    g1Y,
    g2Y,
    g3Y,
    v19Y,
    sectionW,
    baseG1Y,
    baseG3Y,
    s2PadLeftRight,
    g2Shrink,
    sgPad,
    sgBorderWidth: bw,
    boxExtOffset,
    extraRowGap,
  } = layout;

  // --- Dynamic Container Scaling Configurations ---
  // Calculates inner working area widths ignoring vertical top/bottom safe lines.
  const s2_innerW = sectionW - s2PadLeftRight * 2;
  const baseX = startX + s2PadLeftRight;

  // Defines a specialized shrunken constraint explicitly for Group 2 Middle Block indenting
  const g2_baseX = baseX + g2Shrink;
  const g2_innerW = s2_innerW - g2Shrink * 2;
  const g2_groupInnerHalfW = (g2_innerW - groupPad * 2 - s2Gap) / 2;

  // Calculates bounding offsets extending safe lines mapping Hollow Border wraps
  const box_X = baseX - sgPad;
  const box_W = s2_innerW + sgPad * 2;

  // Top Hollow Wrapper constraints bridging top content into the main Group clusters
  // Mirrored shifting for Section 2 (Top moves down, Bottom moves up)
  const S2_MIRROR_SHIFT = 0.015;
  const shiftedTop = s2Top - S2_MIRROR_SHIFT;
  const shiftedBot = s2Top - s2H + S2_MIRROR_SHIFT;
  const shiftedH = s2H - 2 * S2_MIRROR_SHIFT;

  const tBox_Y = shiftedTop;
  const tBox_bottom = (baseG1Y || g1Y) - groupH - boxExtOffset;
  const tBox_H = tBox_Y - tBox_bottom;

  // Bottom Hollow Wrapper bridging final clusters out towards completion texts
  const bBox_Y = (baseG3Y || g3Y) + boxExtOffset;
  const bBox_bottom = shiftedBot;
  const bBox_H = bBox_Y - bBox_bottom;

  // Helper handling individual Verse Arrays placed inside unified thematic groupings
  const renderGroupVerses = (
    verses: Verse[],
    gY: number,
    bgColor: string | undefined,
    borderCol: string,
    isGroup2: boolean = false,
    extraYOffset: number = 0,
  ) => {
    // Map directly to dynamically shifted indent widths based on parent group
    const currentBaseX = isGroup2 ? g2_baseX : baseX;
    const currentHalfW = isGroup2 ? g2_groupInnerHalfW : groupInnerHalfW;

    return verses.map((v, i) => {
      const rowOffset = i >= 2 ? smallBoxH2 + s2Gap + extraYOffset : 0;

      // Override explicitly targeted internal highlighted sequences
      const finalBg =
        v.number >= 11 && v.number <= 14
          ? CAPSULE_BG_12_14
          : bgColor || WHITE_VERSE_BG;

      return (
        <VerseBox
          key={v.number}
          x={currentBaseX + groupPad + (i % 2 !== 0 ? currentHalfW + s2Gap : 0)}
          y={gY - groupPad - rowOffset}
          z={0.003}
          w={currentHalfW}
          h={smallBoxH2}
          verse={v.text}
          number={v.number}
          bg={finalBg}
          border={borderCol}
          borderWidth={0.009}
          circleBorderCol={borderCol}
          circleBg={borderCol}
          circleTextCol={WHITE_BASE}
          isPill={true}
          isBumpMap={isBumpMap}
        />
      );
    });
  };

  return (
    <group>
      {/* --------------------- SECTION BASE WRAPS --------------------- */}
      <UiRect
        x={startX}
        y={shiftedTop}
        z={0}
        w={sectionW}
        h={shiftedH}
        radius={0.02}
        color={S2_OUTER_BORDER}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      <UiRect
        x={startX + 0.003}
        y={shiftedTop - 0.003}
        z={0.001}
        w={sectionW - 0.006}
        h={shiftedH - 0.006}
        radius={0.017}
        color={S2_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_DEEP}
      />

      {/* --------------------- TOP HOLLOW BORDER CONNECTOR --------------------- */}
      <UiRect
        x={box_X - bw}
        y={tBox_Y + bw * 2}
        z={0.0015}
        w={box_W + bw * 2}
        h={tBox_H + bw * 3}
        radius={0.025}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      <UiRect
        x={box_X}
        y={tBox_Y}
        z={0.002}
        w={box_W}
        h={tBox_H}
        radius={0.022}
        color={S2_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
      />

      {/* --------------------- BOTTOM HOLLOW BORDER CONNECTOR --------------------- */}
      <UiRect
        x={box_X - bw}
        y={bBox_Y + bw}
        z={0.0015}
        w={box_W + bw * 2}
        h={bBox_H + bw * 3}
        radius={0.025}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      <UiRect
        x={box_X}
        y={bBox_Y}
        z={0.002}
        w={box_W}
        h={bBox_H}
        radius={0.022}
        color={S2_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
      />

      {/* --------------------- INTRO THEMATIC VERSE --------------------- */}
      <VerseBox
        x={baseX}
        y={v6Y}
        z={0.003}
        w={s2_innerW}
        h={bigBoxH}
        verse={data.introVerse.text}
        number={data.introVerse.number}
        bg={CAPSULE_BG_6_19}
        border={BLUE_THEME}
        circleBorderCol={BLUE_THEME}
        circleBg={BLUE_THEME}
        circleTextCol={WHITE_BASE}
        isPill={false}
        isBumpMap={isBumpMap}
      />

      {/* --------------------- CONTENT GROUP 1 (UPPER) --------------------- */}
      <UiRect
        x={baseX}
        y={g1Y}
        z={0.0025}
        w={s2_innerW}
        h={groupH}
        radius={0.015}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MID}
      />
      {renderGroupVerses(
        data.colorGroups[0].verses,
        g1Y,
        CAPSULE_BG_7_10_15_18,
        MAROON_THEME,
        false,
        extraRowGap,
      )}

      {/* --------------------- CONTENT GROUP 2 (MIDDLE SHRUNKEN) --------------------- */}
      <UiRect
        x={g2_baseX}
        y={g2Y}
        z={0.0025}
        w={g2_innerW}
        h={groupH}
        radius={0.015}
        color={GREEN_THEME}
        shadow
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MID}
      />
      {renderGroupVerses(
        data.colorGroups[1].verses,
        g2Y,
        data.colorGroups[1].verseBg,
        GREEN_THEME,
        true,
        0,
      )}

      {/* Indicator Cross for Directionality between Verses 11-14 */}
      <DirectionalCross
        x={g2_baseX + groupPad + g2_groupInnerHalfW + s2Gap / 2}
        y={g2Y - groupPad - smallBoxH2 - s2Gap / 2}
        z={0.1}
        size={0.06}
        color="#3B2F2F"
        isBumpMap={isBumpMap}
      />

      {/* --------------------- CONTENT GROUP 3 (LOWER) --------------------- */}
      <UiRect
        x={baseX}
        y={g3Y}
        z={0.0025}
        w={s2_innerW}
        h={groupH}
        radius={0.015}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MID}
      />
      {renderGroupVerses(
        data.colorGroups[2].verses,
        g3Y,
        CAPSULE_BG_7_10_15_18,
        MAROON_THEME,
        false,
        extraRowGap,
      )}

      {/* --------------------- OUTRO THEMATIC VERSE --------------------- */}
      <VerseBox
        x={baseX}
        y={v19Y}
        z={0.003}
        w={s2_innerW}
        h={bigBoxH}
        verse={data.outroVerse.text}
        number={data.outroVerse.number}
        bg={CAPSULE_BG_6_19}
        border={BLUE_THEME}
        circleBorderCol={BLUE_THEME}
        circleBg={BLUE_THEME}
        circleTextCol={WHITE_BASE}
        isPill={false}
        isBumpMap={isBumpMap}
      />

      {/* Extra Structural Elements (Curve decorations and pinning labels) */}
      <SideCurves layout={layout} startX={startX} />

      <TopLabel
        x={PW / 2}
        y={shiftedTop}
        z={0.004}
        text={data.topLabel}
        animateOnScroll={true}
        isBumpMap={isBumpMap}
        partialBorder={true}
      />

      <TopLabel
        x={PW / 2}
        y={shiftedBot}
        z={0.004}
        text={data.bottomLabel}
        animateOnScroll={true}
        isBumpMap={isBumpMap}
        partialBorder={true}
        bottomBorder={true}
      />
    </group>
  );
}
