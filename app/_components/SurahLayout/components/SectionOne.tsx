"use client";

// ============================================================================
// SECTION ONE
// Location: SurahLayout/components/SectionOne.tsx
// Purpose: Renders the upper Surah block. Receives pre-computed S1Transforms
//          from the LayoutEngine — does ZERO positional math in JSX.
//          All x/y/w/h values come straight from the engine output.
// ============================================================================

import { useEffect, useState } from "react";
import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
import { usePopUpState } from "../../pop-up-verses/ui/PopUpState";
import { ORIGINAL_TEXTURE_TIMING } from "../../pop-up-verses/useFoldAnimation";
import {
  S1_OUTER_BORDER,
  S1_OUTER_BG,
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_ANA_BG,
  S1_ANA_BORDER,
  WHITE_BASE,
  BUMP_MAX,
  BUMP_DEEP,
} from "../core/theme";
import type { SectionOneData, S1Transforms } from "../core/SurahConfig";

interface SectionOneProps {
  data: SectionOneData;
  transforms: S1Transforms;
  PW: number;
  isBumpMap?: boolean;
  isFolded?: boolean;
}

// ----------------------------------------------------------------------------
// HOOK: useDelayedPopUpGroups
// Delays verse-hidden state to sync with popup animation timing.
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
export function SectionOne({
  data,
  transforms,
  PW,
  isBumpMap = false,
}: SectionOneProps) {
  const { isVerseHidden } = useDelayedPopUpGroups();
  const t = transforms;

  return (
    <group>
      {/* Outer wrapper — border layer */}
      <UiRect
        x={t.frameX}
        y={t.frameY}
        z={0}
        w={t.frameW}
        h={t.frameH}
        radius={0.02}
        color={S1_OUTER_BORDER}
        shadow
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      {/* Outer wrapper — fill layer */}
      <UiRect
        x={t.frameX + 0.003}
        y={t.frameY - 0.003}
        z={0.001}
        w={t.frameW - 0.006}
        h={t.frameH - 0.006}
        radius={0.017}
        color={S1_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_DEEP}
      />

      {/* 2×2 verse grid — positions come from the engine, no math here */}
      {data.gridVerses.map((v) => {
        if (isVerseHidden(v.number)) return null;
        const vt = t.verses[v.number];

        return (
          <VerseBox
            key={v.number}
            x={vt.x}
            y={vt.y}
            z={vt.z}
            w={vt.w}
            h={vt.h}
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

      {/* AnaAyet — y offset absorbed by LayoutEngine, no wrapper group needed */}
      <VerseBox
        x={t.anaAyet.x}
        y={t.anaAyet.y}
        z={t.anaAyet.z}
        w={t.anaAyet.w}
        h={t.anaAyet.h}
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
        x={t.anaAyetTabX}
        y={t.anaAyetTabY}
        z={0.005}
        isBumpMap={isBumpMap}
      />

      {/* Section title label pinned to the top edge */}
      <TopLabel
        x={PW / 2}
        y={t.labelPinY}
        z={0.004}
        text={data.label}
        isBumpMap={isBumpMap}
        noBorder={true}
      />
    </group>
  );
}
