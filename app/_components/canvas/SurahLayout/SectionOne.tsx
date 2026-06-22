"use client";
import { TopLabel, UiRect, VerseBox, CapsuleLabel } from "./SharedUI";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S1_FRAME_IMAGE,
  S1_FRAME_BG_COLOR,
} from "../../../data/theme";
import {
  OPPOSITE_VERSE_CONNECTOR,
  type SectionOneData,
} from "../../../data/SurahConfig";
import { SectionTransforms, GridSectionConfig } from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

import { useMemo } from "react";

interface SectionOneProps {
  data: SectionOneData;
  transforms: SectionTransforms;
  PW: number;
  isFolded?: boolean;
}

export const S1_SOLID_SCALE_X = 0.9;
export const S1_SOLID_SCALE_Y = 0.9;
export const S1_SOLID_Y_OFFSET = -0.005;
export const S1_IMAGE_SCALE = 1.1;
export const S1_IMAGE_Y_OFFSET = 0.01;

/** Generic SVG overlay — used for any verse that has a customFrameSvg override */
function SvgFrameOverlay({
  x,
  y,
  z,
  w,
  h,
  svgUrl,
  renderW,
  renderH,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  svgUrl: string;
  renderW: number;
  renderH: number;
}) {
  const texture = useTexture(svgUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <mesh position={[x + w / 2, y - h / 2, z]} renderOrder={15}>
      <planeGeometry args={[renderW, renderH]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function SectionOne({ data, transforms, PW }: SectionOneProps) {
  const hideSectionLabel = false;
  const t = transforms as Required<SectionTransforms>;

  const texture = useTexture(S1_FRAME_IMAGE, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const config = useStoryStore((state) => state.activeConfig);
  const s1Config = config.sections[0] as GridSectionConfig;

  // Build a verse-number → text map from the prop data.
  // Keyed by canonical Arabic verse number — works for any active language.
  const verseTextMap = useMemo(() => {
    const map: Record<number, string> = {};
    data.gridVerses.forEach((v) => {
      map[v.number] = v.text;
    });
    if (data.anaAyet) map[data.anaAyet.number] = data.anaAyet.text;
    return map;
  }, [data]);

  // All verse IDs for this section in config order: grid verses first, then anaAyet.
  const allVerseIds: number[] = [
    ...s1Config.verses,
    ...(s1Config.anaAyet !== undefined ? [s1Config.anaAyet] : []),
  ];

  const BW = 0.0055; // border width matching VerseMesh.bw
  const SVG_WIDTH_SCALE = 0.8;
  const SVG_HEIGHT_SCALE = 0.93;

  return (
    <group>
      <>
        {/* Yellow solid background */}
        <mesh
          position={[
            t.frameX + t.frameW / 2,
            t.frameY - t.frameH / 2 + S1_SOLID_Y_OFFSET,
            -0.001,
          ]}
          renderOrder={1}
        >
          <planeGeometry args={[t.frameW * S1_SOLID_SCALE_X, t.frameH * S1_SOLID_SCALE_Y]} />
          <meshBasicMaterial
            color={S1_FRAME_BG_COLOR}
            toneMapped={false}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Simple stretched main-frame image as background */}
        <mesh
          position={[
            t.frameX + t.frameW / 2,
            t.frameY - t.frameH / 2 + S1_IMAGE_Y_OFFSET,
            0,
          ]}
          renderOrder={2}
        >
          <planeGeometry
            args={[t.frameW * S1_IMAGE_SCALE, t.frameH * S1_IMAGE_SCALE]}
          />
          <meshBasicMaterial
            map={texture}
            transparent
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </>

      {/* Row Connectors for opposite verses */}
      {t.rowConnectors.map((rc, i) => {
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
            renderOrder={3}
          />
        );
      })}

      {/* ── Unified verse loop: grid verses + anaAyet, all driven by config overrides ── */}
      {allVerseIds.map((vId, i) => {
        const isAnaAyet = vId === s1Config.anaAyet;

        let lookupNumber = vId;
        let actualVerseId = vId;

        // If not anaAyet, swap the layout positions for LTR languages
        if (!isAnaAyet && i < 4) {
          // We use SurahConfig's hardcoded grid order [2, 1, 4, 3] which gives the exact Arabic layout IDs in order
          const arabicVerseNumber = s1Config.verses[i];
          const currentLanguageVerseNumber = data.gridVerses[i]?.number;
          if (
            currentLanguageVerseNumber !== undefined &&
            currentLanguageVerseNumber !== arabicVerseNumber
          ) {
            lookupNumber = arabicVerseNumber;
            actualVerseId = currentLanguageVerseNumber;
          }
        }

        // Resolve the base layout transform using lookupNumber
        const rawT = isAnaAyet ? t.anaAyet : t.verses?.[lookupNumber];
        if (!rawT) return null;

        // Override-driven sizing, colors, and decorators using actualVerseId
        const override = config.verseOverrides?.[actualVerseId];
        const expandW = override?.expandW ?? 0;
        const expandH = override?.expandH ?? 0;

        const w = rawT.w + expandW * 2;
        const h = rawT.h + expandH * 2;
        const outerW = w + BW * 2;
        const outerH = h + BW * 2;

        // Expanded position: shift origin to account for the grow
        const expandedX = rawT.x - expandW;
        const expandedY = rawT.y + expandH;

        const bg = override?.bg ?? S1_INNER_BG;
        const border = override?.border ?? S1_INNER_BORDER;
        const isPill = override?.isPill ?? true;
        const shrinkX = isPill ? 0.001 : 0;
        const circleBorderCol =
          override?.circleBorderCol ??
          override?.border ??
          S1_VERSE_NUMBER_BORDER;
        const circleBg =
          override?.circleBg ?? override?.bg ?? S1_VERSE_NUMBER_BG;
        const circleTextCol =
          override?.circleTextCol ?? override?.border ?? S1_VERSE_NUMBER_TEXT;
        const textColor = override?.textColor;

        // SVG frame overlay (generic — any verse with a customFrameSvg gets one)
        const svgUrl = override?.customFrameSvg;

        // CapsuleLabel (generic — any verse with hasCapsuleLabel: true in its override)
        const hasCapsuleLabel = override?.hasCapsuleLabel;
        const customTabText = override?.customCapsuleLabel;

        const labelW = t.capsuleLabelW ?? 0.2;
        const labelH = t.capsuleLabelH ?? 0.032;

        return (
          <group key={actualVerseId}>
            <VerseBox
              x={expandedX}
              y={expandedY}
              z={rawT.z}
              w={w}
              h={h}
              verse={verseTextMap[actualVerseId] ?? ""}
              number={actualVerseId}
              bg={bg}
              border={border}
              circleBorderCol={circleBorderCol}
              circleBg={circleBg}
              circleTextCol={circleTextCol}
              isPill={isPill}
              textColor={textColor}
            />

            {/* Generic SVG decorative frame — rendered for any verse with customFrameSvg */}
            {svgUrl && (() => {
              const activeLanguage = useSurahLanguageStore.getState().activeLanguage;
              const isArabic = activeLanguage === "ar";
              
              // Scale up the SVG frame slightly for non-Arabic if override provides a scale
              const frameScaleMult = (!isArabic && override?.frameScaleLTR) ? override.frameScaleLTR : 1.0;
              
              return (
                <SvgFrameOverlay
                  x={expandedX - BW + shrinkX}
                  y={expandedY + BW}
                  z={rawT.z + 0.003}
                  w={outerW}
                  h={outerH}
                  svgUrl={svgUrl}
                  renderW={outerW * SVG_WIDTH_SCALE * frameScaleMult}
                  renderH={outerH * SVG_HEIGHT_SCALE * frameScaleMult}
                />
              );
            })()}

            {/* Generic CapsuleLabel — rendered for any verse with hasCapsuleLabel: true */}
            {hasCapsuleLabel && (
              <CapsuleLabel
                x={t.capsuleLabelX!}
                y={t.capsuleLabelY!}
                w={labelW}
                h={labelH}
                z={0.002}
                borderWidth={t.capsuleLabelBorderWidth!}
                renderOrder={100}
                customText={customTabText}
              />
            )}
          </group>
        );
      })}

      {/* Section title label pinned to the top edge */}
      {!hideSectionLabel && (
        <TopLabel
          x={PW / 2}
          y={t.labelPinY}
          z={0.004}
          text={data.label}
          bgColor={S1_TOP_LABEL_BG}
          borderColor={S1_TOP_LABEL_BORDER}
          renderOrder={100}
          shadow={false}
        />
      )}
    </group>
  );
}
