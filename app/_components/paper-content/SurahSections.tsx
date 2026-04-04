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
} from "./SharedUI";
import { SideCurves } from "./SideCurves";

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
  groupInnerHalfW: number;
}

interface SectionOneProps {
  data: SectionOneData;
  layout: LayoutConfig;
  startX: number;
  PW: number;
}

export function SectionOne({ data, layout, startX, PW }: SectionOneProps) {
  const { s1Top, s1Pad, gap, smallBoxH, anaAyetH, s1H, innerW, innerHalfW } =
    layout;

  // Pure math for centering
  const baseX = startX + s1Pad;

  return (
    <group>
      <UiRect
        x={startX}
        y={s1Top}
        z={0}
        w={layout.sectionW}
        h={s1H}
        radius={0.02}
        color={S1_OUTER_BORDER}
        shadow
      />
      <UiRect
        x={startX + 0.003}
        y={s1Top - 0.003}
        z={0.001}
        w={layout.sectionW - 0.006}
        h={s1H - 0.006}
        radius={0.017}
        color={S1_OUTER_BG}
      />

      {data.gridVerses.map((v: Verse, i: number) => {
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
            circleTextCol="#ffffff"
            isPill={true}
          />
        );
      })}

      <group>
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
          circleTextCol="#ffffff"
          isPill={false}
        />
        <AnaAyetTab
          x={baseX - 0.04 - s1Pad}
          y={
            s1Top - s1Pad - (smallBoxH * 2 + gap) - gap - anaAyetH / 2 + 0.0225
          }
          z={0.005}
        />
      </group>
      <TopLabel x={PW / 2} y={s1Top} z={0.004} text={data.label} />
    </group>
  );
}

interface SectionTwoProps {
  data: SectionTwoData;
  layout: LayoutConfig;
  startX: number;
  PW: number;
}

export function SectionTwo({ data, layout, startX, PW }: SectionTwoProps) {
  const {
    s2Top,
    s2Pad,
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
  } = layout;

  const s2_innerW = sectionW - s2Pad * 2;
  const baseX = startX + s2Pad;

  // ==========================================
  // Middle group settings (11 to 14) that will be shrunk
  const g2Shrink = 0.01; // Shrink amount from both sides
  const g2_baseX = baseX + g2Shrink;
  const g2_innerW = s2_innerW - g2Shrink * 2;
  const g2_groupInnerHalfW = (g2_innerW - groupPad * 2 - s2Gap) / 2;

  // ==========================================
  // Container box settings (Super Groups) for verses 6-10 and 15-19
  const sgPad = 0.015; // Safe margin around boxes
  const sg_X = baseX - sgPad;
  const sg_W = s2_innerW + sgPad * 2;

  // Upper container box (6 to 10)
  const sg1_Y = v6Y + sgPad;
  const sg1_bottom = g1Y - groupH - sgPad;
  const sg1_H = sg1_Y - sg1_bottom;

  // Lower container box (15 to 19)
  const sg2_Y = g3Y + sgPad;
  const sg2_bottom = v19Y - bigBoxH - sgPad;
  const sg2_H = sg2_Y - sg2_bottom;

  // Soft colors for container boxes
  const SG_BG = "#C9B5A5"; // Soft cream
  const SG_BORDER = "#AD7B2A"; // Brownish cream for border
  const bw = 0.003;

  const renderGroupVerses = (
    verses: Verse[],
    gY: number,
    bgColor: string | undefined,
    borderCol: string,
    isGroup2: boolean = false,
  ) => {
    const currentBaseX = isGroup2 ? g2_baseX : baseX;
    const currentHalfW = isGroup2 ? g2_groupInnerHalfW : groupInnerHalfW;

    return verses.map((v, i) => (
      <VerseBox
        key={v.number}
        x={currentBaseX + groupPad + (i % 2 !== 0 ? currentHalfW + s2Gap : 0)}
        y={gY - groupPad - (i >= 2 ? smallBoxH2 + s2Gap : 0)}
        z={0.003}
        w={currentHalfW}
        h={smallBoxH2}
        verse={v.text}
        number={v.number}
        bg={bgColor || WHITE_VERSE_BG}
        border={WHITE_VERSE_BG}
        circleBorderCol={borderCol}
        circleBg={borderCol}
        circleTextCol="#ffffff"
        isPill={true}
      />
    ));
  };

  return (
    <group>
      {/* Section 2 main background */}
      <UiRect
        x={startX}
        y={s2Top}
        z={0}
        w={sectionW}
        h={s2H}
        radius={0.02}
        color={S2_OUTER_BORDER}
        shadow
      />
      <UiRect
        x={startX + 0.003}
        y={s2Top - 0.003}
        z={0.001}
        w={sectionW - 0.006}
        h={s2H - 0.006}
        radius={0.017}
        color={S2_OUTER_BG}
      />

      {/* ================= Upper container box (6-10) ================= */}
      <UiRect
        x={sg_X - bw}
        y={sg1_Y + bw}
        z={0.0015}
        w={sg_W + bw * 2}
        h={sg1_H + bw * 2}
        radius={0.025}
        color={SG_BORDER}
        shadow
      />
      <UiRect
        x={sg_X}
        y={sg1_Y}
        z={0.002}
        w={sg_W}
        h={sg1_H}
        radius={0.022}
        color={SG_BG}
      />

      {/* ================= Lower container box (15-19) ================= */}
      <UiRect
        x={sg_X - bw}
        y={sg2_Y + bw}
        z={0.0015}
        w={sg_W + bw * 2}
        h={sg2_H + bw * 2}
        radius={0.025}
        color={SG_BORDER}
        shadow
      />
      <UiRect
        x={sg_X}
        y={sg2_Y}
        z={0.002}
        w={sg_W}
        h={sg2_H}
        radius={0.022}
        color={SG_BG}
      />

      {/* Verse 6 */}
      <VerseBox
        x={baseX}
        y={v6Y}
        z={0.003}
        w={s2_innerW}
        h={bigBoxH}
        verse={data.introVerse.text}
        number={data.introVerse.number}
        bg={WHITE_VERSE_BG}
        border={BLUE_THEME}
        circleBorderCol={BLUE_THEME}
        circleBg={BLUE_THEME}
        circleTextCol="#ffffff"
        isPill={false}
      />

      {/* Upper maroon group */}
      <UiRect
        x={baseX}
        y={g1Y}
        z={0.0025}
        w={s2_innerW}
        h={groupH}
        radius={0.015}
        color={MAROON_THEME}
        shadow
      />
      {renderGroupVerses(
        data.colorGroups[0].verses,
        g1Y,
        data.colorGroups[0].verseBg,
        MAROON_THEME,
        false,
      )}

      {/* Middle green group (shrunk) */}
      <UiRect
        x={g2_baseX}
        y={g2Y}
        z={0.0025}
        w={g2_innerW}
        h={groupH}
        radius={0.015}
        color={GREEN_THEME}
        shadow
      />
      {renderGroupVerses(
        data.colorGroups[1].verses,
        g2Y,
        data.colorGroups[1].verseBg,
        GREEN_THEME,
        true,
      )}

      {/* Lower maroon group */}
      <UiRect
        x={baseX}
        y={g3Y}
        z={0.0025}
        w={s2_innerW}
        h={groupH}
        radius={0.015}
        color={MAROON_THEME}
        shadow
      />
      {renderGroupVerses(
        data.colorGroups[2].verses,
        g3Y,
        data.colorGroups[2].verseBg,
        MAROON_THEME,
        false,
      )}

      {/* Verse 19 */}
      <VerseBox
        x={baseX}
        y={v19Y}
        z={0.003}
        w={s2_innerW}
        h={bigBoxH}
        verse={data.outroVerse.text}
        number={data.outroVerse.number}
        bg={WHITE_VERSE_BG}
        border={BLUE_THEME}
        circleBorderCol={BLUE_THEME}
        circleBg={BLUE_THEME}
        circleTextCol="#ffffff"
        isPill={false}
      />

      {/* Connecting lines */}
      <SideCurves layout={layout} startX={startX} />
      <TopLabel
        x={PW / 2}
        y={s2Top}
        z={0.004}
        text={data.topLabel}
        animateOnScroll={true}
      />
      <TopLabel x={PW / 2} y={s2Top - s2H} z={0.004} text={data.bottomLabel} />
    </group>
  );
}
