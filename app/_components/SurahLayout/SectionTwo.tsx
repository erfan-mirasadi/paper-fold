"use client";
import { TopLabel, UiRect, VerseBox } from "./SharedUI";
import { SideCurves } from "./SideCurves";
import { useDelayedVerseVisibility } from "../shared/useDelayedVerseVisibility";
import { useDelayedHidden } from "../shared/useDelayedHidden";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
} from "../features/elevated-verses/useElevatedStore";
import { HollowConnector } from "./HollowConnector";
import { VerseGroup } from "./VerseGroup";
import {
  S2_OUTER_BORDER,
  S2_OUTER_BG,
  BLUE_THEME,
  CAPSULE_BG_6_19,
  WHITE_BASE,
  BUMP_MAX,
  BUMP_DEEP,
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
} from "../data/theme";
import type {
  SectionTwoData,
  LayoutConfig,
  S2Transforms,
} from "../data/SurahConfig";

interface SectionTwoProps {
  data: SectionTwoData;
  transforms: S2Transforms;
  layout: LayoutConfig;
  startX: number;
  PW: number;
  isBumpMap?: boolean;
  isFolded?: boolean;
}

export function SectionTwo({
  data,
  transforms,
  layout,
  startX,
  PW,
  isBumpMap = false,
}: SectionTwoProps) {
  const isVerseHidden = useDelayedVerseVisibility();
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const hideTopConnectorNow = activeSectionIds.includes("s2_top");
  const hideBottomConnectorNow = activeSectionIds.includes("s2_bottom");

  const hideTopConnector = useDelayedHidden(
    hideTopConnectorNow,
    ELEVATED_RETURN_SYNC_MS,
  );
  const hideBottomConnector = useDelayedHidden(
    hideBottomConnectorNow,
    ELEVATED_RETURN_SYNC_MS,
  );

  const hideTopLabel = hideTopConnector;
  const hideBottomLabel = hideBottomConnector;
  const t = transforms;
  const edgeVerseBorderWidth = t.borderWidth;

  return (
    <group>
      {/* ─── SECTION OUTER FRAME ─────────────────────────────────────────── */}
      <UiRect
        x={t.frameX}
        y={t.shiftedTop}
        z={0}
        w={t.frameW}
        h={t.shiftedH}
        radius={0.02}
        color={S2_OUTER_BORDER}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      <UiRect
        x={t.frameX + 0.003}
        y={t.shiftedTop - 0.003}
        z={0.001}
        w={t.frameW - 0.006}
        h={t.shiftedH - 0.006}
        radius={0.017}
        color={S2_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_DEEP}
      />

      {/* ─── TOP HOLLOW CONNECTOR ────────────────────────────────────────── */}
      {!hideTopConnector && (
        <HollowConnector
          position="top"
          boxX={t.connectorX}
          boxW={t.connectorW}
          yTop={t.topConnectorY}
          yBottom={t.topConnectorY - t.topConnectorH}
          height={t.topConnectorH}
          borderWidth={t.borderWidth}
          isBumpMap={isBumpMap}
        />
      )}

      {/* ─── BOTTOM HOLLOW CONNECTOR ─────────────────────────────────────── */}
      {!hideBottomConnector && (
        <HollowConnector
          position="bottom"
          boxX={t.connectorX}
          boxW={t.connectorW}
          yTop={t.bottomConnectorY}
          yBottom={t.bottomConnectorY - t.bottomConnectorH}
          height={t.bottomConnectorH}
          borderWidth={t.borderWidth}
          isBumpMap={isBumpMap}
        />
      )}

      {/* ─── INTRO VERSE (verse 6) ───────────────────────────────────────── */}
      {!isVerseHidden(data.introVerse.number) && (
        <VerseBox
          x={t.introVerse.x}
          y={t.introVerse.y}
          z={t.introVerse.z}
          w={t.introVerse.w}
          h={t.introVerse.h}
          verse={data.introVerse.text}
          number={data.introVerse.number}
          bg={CAPSULE_BG_6_19}
          border={BLUE_THEME}
          circleBorderCol={BLUE_THEME}
          circleBg={BLUE_THEME}
          circleTextCol={WHITE_BASE}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
          isBumpMap={isBumpMap}
        />
      )}

      {/* ─── VERSE GROUPS — mapped from pre-computed group transforms ─────── */}
      {data.colorGroups.map((group, index) => (
        <VerseGroup
          key={index}
          group={group}
          groupTransform={t.groups[index]}
          isBumpMap={isBumpMap}
          isVerseHidden={(id) => isVerseHidden(id)}
        />
      ))}

      {/* ─── OUTRO VERSE (verse 19) ──────────────────────────────────────── */}
      {!isVerseHidden(data.outroVerse.number) && (
        <VerseBox
          x={t.outroVerse.x}
          y={t.outroVerse.y}
          z={t.outroVerse.z}
          w={t.outroVerse.w}
          h={t.outroVerse.h}
          verse={data.outroVerse.text}
          number={data.outroVerse.number}
          bg={CAPSULE_BG_6_19}
          border={BLUE_THEME}
          circleBorderCol={BLUE_THEME}
          circleBg={BLUE_THEME}
          circleTextCol={WHITE_BASE}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
          isBumpMap={isBumpMap}
        />
      )}

      {/* ─── SIDE CURVES (still read raw layout math) ────────────────────── */}
      <SideCurves
        layout={layout}
        startX={startX}
        isBumpMap={isBumpMap}
        borderWidth={edgeVerseBorderWidth}
      />

      {/* ─── SECTION LABELS ──────────────────────────────────────────────── */}
      {!hideTopLabel && (
        <TopLabel
          x={PW / 2}
          y={t.topLabelPinY}
          z={0.004}
          text={data.topLabel}
          animateOnScroll={true}
          scrollStart={0.65}
          scrollRange={0.18}
          isBumpMap={isBumpMap}
          partialBorder={true}
          bgColor={S2_TOP_LABEL_BG}
          borderColor={S2_TOP_LABEL_BORDER}
        />
      )}
      {!hideBottomLabel && (
        <TopLabel
          x={PW / 2}
          y={t.bottomLabelPinY}
          z={0.004}
          text={data.bottomLabel}
          animateOnScroll={true}
          scrollStart={0.65}
          scrollRange={0.18}
          isBumpMap={isBumpMap}
          partialBorder={true}
          bottomBorder={true}
          bgColor={S2_TOP_LABEL_BG}
          borderColor={S2_TOP_LABEL_BORDER}
        />
      )}
    </group>
  );
}
