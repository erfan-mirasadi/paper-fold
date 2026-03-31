"use client";
import { QuadraticBezierLine } from "@react-three/drei";
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
      <TopLabel x={PW / 2} y={s1Top} z={0.004} text={data.label} />

      {data.gridVerses.map((v: Verse, i: number) => {
        const isRightCol = i % 2 !== 0;
        const isBottomRow = i >= 2;
        const xPos = startX + s1Pad + (isRightCol ? innerHalfW + gap : 0);
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
            isPill={true}
          />
        );
      })}

      <group>
        <VerseBox
          x={startX + s1Pad}
          y={s1Top - s1Pad - (smallBoxH * 2 + gap) - gap}
          z={0.002}
          w={innerW}
          h={anaAyetH}
          verse={data.anaAyet.text}
          number={data.anaAyet.number}
          bg={S1_ANA_BG}
          border={S1_ANA_BORDER}
          circleBorderCol={S1_ANA_BORDER}
          isPill={false}
        />
        <AnaAyetTab
          x={startX - 0.04}
          y={
            s1Top - s1Pad - (smallBoxH * 2 + gap) - gap - anaAyetH / 2 + 0.0225
          }
          z={0.005}
        />
      </group>
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
    innerW,
    groupInnerHalfW,
    v6Y,
    g1Y,
    g2Y,
    g3Y,
    v19Y,
    sectionW,
  } = layout;

  const renderGroupVerses = (
    verses: Verse[],
    gY: number,
    bgColor: string | undefined,
    borderCol: string,
  ) =>
    verses.map((v, i) => (
      <VerseBox
        key={v.number}
        x={
          startX +
          s2Pad +
          groupPad +
          (i % 2 !== 0 ? groupInnerHalfW + s2Gap : 0)
        }
        y={gY - groupPad - (i >= 2 ? smallBoxH2 + s2Gap : 0)}
        z={0.003}
        w={groupInnerHalfW}
        h={smallBoxH2}
        verse={v.text}
        number={v.number}
        bg={bgColor || WHITE_VERSE_BG}
        border={WHITE_VERSE_BG}
        circleBorderCol={borderCol}
        isPill={true}
      />
    ));

  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;
  const g2CenterY = g2Y - groupH / 2;

  return (
    <group>
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
      <TopLabel x={PW / 2} y={s2Top} z={0.004} text={data.topLabel} />
      <TopLabel x={PW / 2} y={s2Top - s2H} z={0.004} text={data.bottomLabel} />

      <group position={[0, 0, 0.02]}>
        <QuadraticBezierLine
          start={[startX_L, g1Y, 0]}
          end={[startX_L, g3Y - groupH, 0]}
          mid={[startX_L - 0.15, g2CenterY, 0]}
          color="#a0d1cc"
          lineWidth={4}
          material-depthTest={false}
        />
        <QuadraticBezierLine
          start={[startX_L, g2Y, 0]}
          end={[startX_L, g2Y - groupH, 0]}
          mid={[startX_L - 0.1, g2CenterY, 0]}
          color="#badfae"
          lineWidth={4}
          material-depthTest={false}
        />
        <QuadraticBezierLine
          start={[startX_L, g1Y - groupH, 0]}
          end={[startX_L, g3Y, 0]}
          mid={[startX_L - 0.05, g2CenterY, 0]}
          color="#dfb8c2"
          lineWidth={4}
          material-depthTest={false}
        />
        <QuadraticBezierLine
          start={[startX_R, g1Y, 0]}
          end={[startX_R, g3Y - groupH, 0]}
          mid={[startX_R + 0.15, g2CenterY, 0]}
          color="#a0d1cc"
          lineWidth={4}
          material-depthTest={false}
        />
        <QuadraticBezierLine
          start={[startX_R, g2Y, 0]}
          end={[startX_R, g2Y - groupH, 0]}
          mid={[startX_R + 0.1, g2CenterY, 0]}
          color="#badfae"
          lineWidth={4}
          material-depthTest={false}
        />
        <QuadraticBezierLine
          start={[startX_R, g1Y - groupH, 0]}
          end={[startX_R, g3Y, 0]}
          mid={[startX_R + 0.05, g2CenterY, 0]}
          color="#dfb8c2"
          lineWidth={4}
          material-depthTest={false}
        />
      </group>

      <VerseBox
        x={startX + s2Pad}
        y={v6Y}
        z={0.002}
        w={innerW}
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

      <UiRect
        x={startX + s2Pad}
        y={g1Y}
        z={0.002}
        w={innerW}
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
      )}

      <UiRect
        x={startX + s2Pad}
        y={g2Y}
        z={0.002}
        w={innerW}
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
      )}

      <UiRect
        x={startX + s2Pad}
        y={g3Y}
        z={0.002}
        w={innerW}
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
      )}

      <VerseBox
        x={startX + s2Pad}
        y={v19Y}
        z={0.002}
        w={innerW}
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
    </group>
  );
}
