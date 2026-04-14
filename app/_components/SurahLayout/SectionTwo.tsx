"use client";

// ============================================================================
// SECTION TWO
// Location: SurahLayout/components/SectionTwo.tsx
// Purpose: Renders the lower Surah block. Receives pre-computed S2Transforms
//          from the LayoutEngine — does ZERO positional math in JSX.
//          Still receives `layout` + `startX` because SideCurves consumes raw
//          layout math (that component has its own coordinate derivation).
// ============================================================================

import { useEffect, useState } from "react";
import { TopLabel, UiRect, VerseBox } from "./SharedUI";
import { SideCurves } from "./SideCurves";
import { usePopUpState } from "../features/pop-up-verses/ui/PopUpState";
import { ORIGINAL_TEXTURE_TIMING } from "../features/pop-up-verses/useFoldAnimation";
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

// ----------------------------------------------------------------------------
// HOOK: useDelayedPopUpGroups
// ----------------------------------------------------------------------------
function useDelayedPopUpGroups() {
  const { groups } = usePopUpState();
  const [delayedIsOpen, setDelayedIsOpen] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      groups.forEach((g) => (init[g.id] = g.isOpen));
      return init;
    },
  );

  useEffect(() => {
    const timeouts = groups.map((g) => {
      const delay = g.isOpen
        ? ORIGINAL_TEXTURE_TIMING.hideDelay
        : ORIGINAL_TEXTURE_TIMING.showDelay;
      return setTimeout(() => {
        setDelayedIsOpen((prev) => {
          if (prev[g.id] === g.isOpen) return prev;
          return { ...prev, [g.id]: g.isOpen };
        });
      }, delay);
    });
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [groups]);

  const isVerseHidden = (verseId: number) => {
    const group = groups.find((g) => g.verseIds.includes(verseId));
    if (!group) return false;
    return delayedIsOpen[group.id] ?? group.isOpen;
  };

  return { isVerseHidden };
}

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------
export function SectionTwo({
  data,
  transforms,
  layout,
  startX,
  PW,
  isBumpMap = false,
}: SectionTwoProps) {
  const { isVerseHidden } = useDelayedPopUpGroups();
  const t = transforms;

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

      {/* ─── BOTTOM HOLLOW CONNECTOR ─────────────────────────────────────── */}
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

      {/* ─── INTRO VERSE (verse 6) ───────────────────────────────────────── */}
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
        isBumpMap={isBumpMap}
      />

      {/* ─── VERSE GROUPS — mapped from pre-computed group transforms ─────── */}
      {data.colorGroups.map((group, index) => (
        <VerseGroup
          key={index}
          group={group}
          groupTransform={t.groups[index]}
          isBumpMap={isBumpMap}
          isVerseHidden={isVerseHidden}
        />
      ))}

      {/* ─── OUTRO VERSE (verse 19) ──────────────────────────────────────── */}
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
        isBumpMap={isBumpMap}
      />

      {/* ─── SIDE CURVES (still read raw layout math) ────────────────────── */}
      <SideCurves layout={layout} startX={startX} isBumpMap={isBumpMap} />

      {/* ─── SECTION LABELS ──────────────────────────────────────────────── */}
      <TopLabel
        x={PW / 2}
        y={t.topLabelPinY}
        z={0.004}
        text={data.topLabel}
        animateOnScroll={true}
        isBumpMap={isBumpMap}
        partialBorder={true}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
      />
      <TopLabel
        x={PW / 2}
        y={t.bottomLabelPinY}
        z={0.004}
        text={data.bottomLabel}
        animateOnScroll={true}
        isBumpMap={isBumpMap}
        partialBorder={true}
        bottomBorder={true}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
      />
    </group>
  );
}
