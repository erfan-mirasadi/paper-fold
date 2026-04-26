"use client";
import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
import { useDelayedHidden } from "../shared/useDelayedHidden";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
} from "../features/elevated-verses/useElevatedStore";
import {
  S1_OUTER_BORDER,
  S1_OUTER_BG,
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_ANA_BG,
  CAPSULE_BG_5,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S1_NEON_GOLD,
} from "../data/theme";
import {
  S1_NEON_CONFIG,
  OPPOSITE_VERSE_CONNECTOR,
  type SectionOneData,
  type S1Transforms,
} from "../data/SurahConfig";

interface SectionOneProps {
  data: SectionOneData;
  transforms: S1Transforms;
  PW: number;
  isFolded?: boolean;
}

export function SectionOne({
  data,
  transforms,
  PW,
}: SectionOneProps) {
  const neon = S1_NEON_CONFIG;
  const frameRadius = 0.02;
  const topLabelCutoutW = neon.topLabelGapWidth + neon.topLabelGapPadding * 2;
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const hideSectionSurfaceNow = activeSectionIds.includes("s1");
  const hideSectionSurface = useDelayedHidden(
    hideSectionSurfaceNow,
    ELEVATED_RETURN_SYNC_MS,
  );

  const hideSectionLabel = hideSectionSurface;
  const t = transforms;

  return (
    <group>
      {/* Outer wrapper — border layer */}
      {!hideSectionSurface && (
        <>
          {/* Smooth outer glow following the same corner profile as section 1 */}
          <UiRect
            x={t.frameX - neon.outerHaloPad}
            y={t.frameY + neon.outerHaloPad}
            z={neon.haloZ - 0.0005}
            w={t.frameW + neon.outerHaloPad * 2}
            h={t.frameH + neon.outerHaloPad * 2}
            radius={frameRadius + neon.outerHaloPad}
            color={S1_NEON_GOLD}
            transparent
            opacity={neon.outerHaloOpacity}
            emissive={S1_NEON_GOLD}
            emissiveIntensity={neon.outerHaloEmissiveIntensity}
            toneMapped={false}
            depthTest={true}
          />

          {/* Smooth inner glow hugging the border */}
          <UiRect
            x={t.frameX - neon.haloPad}
            y={t.frameY + neon.haloPad}
            z={neon.haloZ}
            w={t.frameW + neon.haloPad * 2}
            h={t.frameH + neon.haloPad * 2}
            radius={frameRadius + neon.haloPad}
            color={S1_NEON_GOLD}
            transparent
            opacity={neon.haloOpacity}
            emissive={S1_NEON_GOLD}
            emissiveIntensity={neon.haloEmissiveIntensity}
            toneMapped={false}
            depthTest={true}
          />

          {/* Center cutout: prevents the section background from turning neon */}
          <UiRect
            x={t.frameX}
            y={t.frameY}
            z={neon.haloZ + 0.0006}
            w={t.frameW}
            h={t.frameH}
            radius={frameRadius}
            color={S1_OUTER_BORDER}
            depthTest={true}
          />

          {/* Top label cutout: removes neon where the label sits */}
          <UiRect
            x={PW / 2 - topLabelCutoutW / 2}
            y={t.frameY + neon.topLabelGapYOffset}
            z={neon.haloZ + 0.0008}
            w={topLabelCutoutW}
            h={neon.topLabelGapHeight}
            radius={Math.min(neon.topLabelGapHeight / 2, 0.03)}
            color={S1_OUTER_BORDER}
            depthTest={true}
          />
          <UiRect
            x={t.frameX}
            y={t.frameY}
            z={0}
            w={t.frameW}
            h={t.frameH}
            radius={0.02}
            color={S1_OUTER_BORDER}
            shadow
          />
          {/* Outer wrapper — fill layer */}
          <UiRect
            x={t.frameX + t.borderWidth}
            y={t.frameY - t.borderWidth}
            z={0.001}
            w={t.frameW - t.borderWidth * 2}
            h={t.frameH - t.borderWidth * 2}
            radius={0.017}
            color={S1_OUTER_BG}
          />
        </>
      )}

      {/* Row Connectors for opposite verses */}
      {!hideSectionSurface && t.rowConnectors.map((rc, i) => {
        const leftV = data.gridVerses[i * 2];
        const rightV = data.gridVerses[i * 2 + 1];
        
        if (!leftV || !rightV) return null;

        return (
          <UiRect
            key={`connector-${i}`}
            x={rc.x}
            y={rc.y}
            z={rc.z}
            w={rc.w}
            h={rc.h}
            radius={OPPOSITE_VERSE_CONNECTOR.radius}
            color={S1_INNER_BORDER}
          />
        );
      })}

      {/* 2×2 verse grid — positions come from the engine, no math here */}
      {data.gridVerses.map((v) => {
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
            circleBorderCol={S1_VERSE_NUMBER_BORDER}
            circleBg={S1_VERSE_NUMBER_BG}
            circleTextCol={S1_VERSE_NUMBER_TEXT}
            isPill={true}
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
        border={CAPSULE_BG_5}
        circleBorderCol={CAPSULE_BG_5}
        circleBg={S1_ANA_BG}
        circleTextCol={CAPSULE_BG_5}
        isPill={false}
      />
      {!hideSectionSurface && (
        <AnaAyetTab
          x={t.anaAyetTabX}
          y={t.anaAyetTabY}
          w={t.anaAyetTabW}
          h={t.anaAyetTabH}
          z={0.005}
        />
      )}

      {/* Section title label pinned to the top edge */}
      {!hideSectionLabel && (
        <TopLabel
          x={PW / 2}
          y={t.labelPinY}
          z={0.004}
          text={data.label}
          bgColor={S1_TOP_LABEL_BG}
          borderColor={S1_TOP_LABEL_BORDER}
        />
      )}
    </group>
  );
}
