"use client";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import { TopLabel, UiRect, VerseBox, CapsuleLabel } from "./SharedUI";
import { SideCurves } from "./SideCurves";
import { VerseGroup } from "./VerseGroup";
import { HandwrittenNote } from "./HandwrittenNote";
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
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
  S2_FRAME_BG_COLOR,
  S2_FRAME_IMAGE,
} from "../../../data/theme";
import {
  OPPOSITE_VERSE_CONNECTOR,
  type SectionOneData,
  type SectionTwoData,
  type LayoutConfig,
  S2_LABEL_WIDTH,
  S2_LABEL_Y_OFFSET,
} from "../../../data/SurahConfig";
import type { SectionTransforms, GroupTransforms } from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// Re-export scale constants (backward compat for any external imports)
// ---------------------------------------------------------------------------
export const S1_SOLID_SCALE_X = 0.9;
export const S1_SOLID_SCALE_Y = 0.9;
export const S1_SOLID_Y_OFFSET = -0.005;
export const S1_IMAGE_SCALE = 1.1;
export const S1_IMAGE_Y_OFFSET = 0.01;

export const S2_TOP_SOLID_SCALE_X = 0.9;
export const S2_TOP_SOLID_SCALE_Y = 0.9;
export const S2_TOP_SOLID_X_OFFSET = 0;
export const S2_TOP_SOLID_Y_OFFSET = 0.003;
export const S2_TOP_IMAGE_SCALE_X = 1.05;
export const S2_TOP_IMAGE_SCALE_Y = 1.15;
export const S2_TOP_IMAGE_X_OFFSET = 0;
export const S2_TOP_IMAGE_Y_OFFSET = 0.025;
export const S2_BOTTOM_SOLID_SCALE_X = 0.9;
export const S2_BOTTOM_SOLID_SCALE_Y = 0.9;
export const S2_BOTTOM_SOLID_X_OFFSET = 0;
export const S2_BOTTOM_SOLID_Y_OFFSET = -0.003;
export const S2_BOTTOM_IMAGE_SCALE_X = 1.05;
export const S2_BOTTOM_IMAGE_SCALE_Y = -1.15;
export const S2_BOTTOM_IMAGE_X_OFFSET = 0;
export const S2_BOTTOM_IMAGE_Y_OFFSET = -0.025;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface BlockRendererProps {
  sections: SectionTransforms[];
  layout: LayoutConfig | any;
  surahData: { section1?: SectionOneData; section2?: SectionTwoData };
  startX: number;
  PW: number;
  isFolded?: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function SvgFrameOverlay({
  x, y, z, w, h, svgUrl, renderW, renderH,
}: {
  x: number; y: number; z: number; w: number; h: number;
  svgUrl: string; renderW: number; renderH: number;
}) {
  const texture = useTexture(svgUrl, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  return (
    <mesh position={[x + w / 2, y - h / 2, z]} renderOrder={15}>
      <planeGeometry args={[renderW, renderH]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function DynamicBackground({ url, layout, startX }: { url: string; layout: any; startX: number }) {
  const tex = useTexture(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  return (
    <mesh
      position={[
        startX + layout.sectionW / 2 + (layout.s2BackgroundOffsetX ?? 0),
        layout.s2Top - layout.s2H / 2 + (layout.s2BackgroundOffsetY ?? 0),
        -0.001,
      ]}
      scale={[layout.s2BackgroundScaleX ?? 1, layout.s2BackgroundScaleY ?? 1, 1]}
      renderOrder={1}
    >
      <planeGeometry args={[layout.sectionW, layout.s2H]} />
      <meshBasicMaterial map={tex} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function SingleSvgOverlay({
  src, posX, posY, scaleX, scaleY, rotationZ, renderOrder,
}: {
  src: string; posX: number; posY: number;
  scaleX: number; scaleY: number; rotationZ: number; renderOrder: number;
}) {
  const tex = useTexture(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  return (
    <mesh position={[posX, posY, -0.0001]} scale={[scaleX, scaleY, 1]} rotation={[0, 0, rotationZ]} renderOrder={renderOrder}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function SvgOverlays({ startX, layout, groups }: { startX: number; layout: any; groups: GroupTransforms[] }) {
  const config = useStoryStore((state) => state.activeConfig);
  const overlays = config.svgOverlays;
  if (!overlays || overlays.length === 0) return null;
  const centerX = startX + layout.sectionW / 2;
  return (
    <group>
      {overlays.map((item, i) => {
        let anchorY = layout.s2Top - layout.s2H / 2;
        const g = groups[item.anchorGroupIndex ?? -1];
        if (g) {
          const edge = item.anchorEdge ?? "center";
          if (edge === "top") anchorY = g.frameY;
          else if (edge === "bottom") anchorY = g.frameY - g.frameH;
          else anchorY = g.frameY - g.frameH / 2;
        }
        return (
          <SingleSvgOverlay
            key={i} src={item.src}
            posX={centerX + (item.offsetX ?? 0)} posY={anchorY + (item.offsetY ?? 0)}
            scaleX={item.scaleX ?? 1} scaleY={item.scaleY ?? 1}
            rotationZ={item.rotationZ ?? 0} renderOrder={item.renderOrder ?? 3}
          />
        );
      })}
    </group>
  );
}

function HandwrittenNotes() {
  const config = useStoryStore((state) => state.activeConfig);
  const notes = config.handwrittenNotes;
  if (!notes || notes.length === 0) return null;
  return (
    <>
      {notes.map((note, i) => (
        <HandwrittenNote key={i} note={note} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Grid block renderer (was SectionOne)
// ---------------------------------------------------------------------------
function GridBlock({
  sectionT, section1Data, PW,
}: {
  sectionT: SectionTransforms; section1Data: SectionOneData; PW: number;
}) {
  const t = sectionT as Required<SectionTransforms>;
  const config = useStoryStore((state) => state.activeConfig);
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);
  const gridBlock = config.blocks?.find((b: any) => b.type === "grid") as any;

  const s1FrameTexture = useTexture(S1_FRAME_IMAGE, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; });

  const verseTextMap = useMemo(() => {
    const map: Record<number, string> = {};
    section1Data.gridVerses.forEach((v) => { map[v.number] = v.text; });
    if (section1Data.anaAyet) map[section1Data.anaAyet.number] = section1Data.anaAyet.text;
    return map;
  }, [section1Data]);

  const allVerseIds: number[] = gridBlock
    ? [...(gridBlock.verseIds ?? []), ...(gridBlock.anaAyetId !== undefined ? [gridBlock.anaAyetId] : [])]
    : [];

  const BW = 0.0055;
  const SVG_WIDTH_SCALE = 0.8;
  const SVG_HEIGHT_SCALE = 0.93;

  return (
    <group>
      <mesh position={[t.frameX + t.frameW / 2, t.frameY - t.frameH / 2 + S1_SOLID_Y_OFFSET, -0.001]} renderOrder={1}>
        <planeGeometry args={[t.frameW * S1_SOLID_SCALE_X, t.frameH * S1_SOLID_SCALE_Y]} />
        <meshBasicMaterial color={S1_FRAME_BG_COLOR} toneMapped={false} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={[t.frameX + t.frameW / 2, t.frameY - t.frameH / 2 + S1_IMAGE_Y_OFFSET, 0]} renderOrder={2}>
        <planeGeometry args={[t.frameW * S1_IMAGE_SCALE, t.frameH * S1_IMAGE_SCALE]} />
        <meshBasicMaterial map={s1FrameTexture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>

      {t.rowConnectors.map((rc, i) => {
        const leftV = section1Data.gridVerses[i * 2];
        const rightV = section1Data.gridVerses[i * 2 + 1];
        if (!leftV || !rightV) return null;
        return (
          <UiRect key={`connector-${i}`} x={rc.x} y={rc.y} z={rc.z} w={rc.w} h={rc.h}
            radius={OPPOSITE_VERSE_CONNECTOR.radius} color={S1_INNER_BORDER} renderOrder={3} />
        );
      })}

      {allVerseIds.map((vId, i) => {
        const isAnaAyet = vId === gridBlock?.anaAyetId;
        let lookupNumber = vId;
        let actualVerseId = vId;
        if (!isAnaAyet && i < 4 && gridBlock) {
          const arabicVerseNumber = gridBlock.verseIds[i];
          const currentLanguageVerseNumber = section1Data.gridVerses[i]?.number;
          if (currentLanguageVerseNumber !== undefined && currentLanguageVerseNumber !== arabicVerseNumber) {
            lookupNumber = arabicVerseNumber;
            actualVerseId = currentLanguageVerseNumber;
          }
        }
        const rawT = isAnaAyet ? t.anaAyet : t.verses?.[lookupNumber];
        if (!rawT) return null;

        const override = config.verseOverrides?.[actualVerseId];
        const expandW = override?.expandW ?? 0;
        const expandH = override?.expandH ?? 0;
        const w = rawT.w + expandW * 2;
        const h = rawT.h + expandH * 2;
        const outerW = w + BW * 2;
        const outerH = h + BW * 2;
        const expandedX = rawT.x - expandW;
        const expandedY = rawT.y + expandH;
        const bg = override?.bg ?? S1_INNER_BG;
        const border = override?.border ?? S1_INNER_BORDER;
        const isPill = override?.isPill ?? true;
        const shrinkX = isPill ? 0.001 : 0;
        const circleBorderCol = override?.circleBorderCol ?? override?.border ?? S1_VERSE_NUMBER_BORDER;
        const circleBg = override?.circleBg ?? override?.bg ?? S1_VERSE_NUMBER_BG;
        const circleTextCol = override?.circleTextCol ?? override?.border ?? S1_VERSE_NUMBER_TEXT;
        const svgUrl = override?.customFrameSvg;
        const hasCapsuleLabel = override?.hasCapsuleLabel;
        const customTabText = override?.customCapsuleLabel;
        const labelW = t.capsuleLabelW ?? 0.2;
        const labelH = t.capsuleLabelH ?? 0.032;

        let finalTextScale = override?.textScaleOverride ?? config.globalSettings?.verseTextScale;
        if (activeLanguage !== "ar") {
          if (override?.translationTextScaleOverride !== undefined) {
            finalTextScale = override.translationTextScaleOverride;
          } else if (config.globalSettings?.translationVerseTextScale !== undefined) {
            finalTextScale = config.globalSettings.translationVerseTextScale === null ? undefined : config.globalSettings.translationVerseTextScale;
          }
        }

        return (
          <group key={actualVerseId}>
            <VerseBox x={expandedX} y={expandedY} z={rawT.z} w={w} h={h}
              verse={verseTextMap[actualVerseId] ?? ""} number={actualVerseId}
              bg={bg} border={border} circleBorderCol={circleBorderCol}
              circleBg={circleBg} circleTextCol={circleTextCol}
              isPill={isPill} textColor={override?.textColor}
              translationPadding={override?.translationPadding}
              textScaleOverride={finalTextScale} />
            {svgUrl && (() => {
              const isArabic = activeLanguage === "ar";
              const isFixed = config?.dimensions?.fixedWidthAcrossLanguages === true;
              const frameScaleMult = (!isArabic && !isFixed && override?.frameScaleLTR) ? override.frameScaleLTR : 1.0;
              return (
                <SvgFrameOverlay
                  x={expandedX - BW + shrinkX} y={expandedY + BW} z={rawT.z + 0.003}
                  w={outerW} h={outerH} svgUrl={svgUrl}
                  renderW={outerW * SVG_WIDTH_SCALE * frameScaleMult}
                  renderH={outerH * SVG_HEIGHT_SCALE * frameScaleMult} />
              );
            })()}
            {hasCapsuleLabel && (
              <CapsuleLabel x={t.capsuleLabelX!} y={t.capsuleLabelY!}
                w={labelW} h={labelH} z={0.002}
                borderWidth={t.capsuleLabelBorderWidth!} renderOrder={100} customText={customTabText} />
            )}
          </group>
        );
      })}

      {section1Data.label && (
        <TopLabel x={PW / 2} y={t.labelPinY} z={0.004} text={section1Data.label}
          bgColor={S1_TOP_LABEL_BG} borderColor={S1_TOP_LABEL_BORDER} renderOrder={100} shadow={false} />
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main unified BlockRenderer
// ---------------------------------------------------------------------------
/**
 * Unified renderer replacing SectionOne + SectionTwo.
 *
 * Accepts SectionTransforms[] from EITHER engine:
 *  - Legacy: sections[0]=grid, sections[1]=verticalGroups (multi-group)
 *  - Block:  sections[0..n] each has groups[0] (one group per section)
 *
 * Detection:
 *  - Non-empty `verses` record → grid block (SectionOne visual logic)
 *  - Non-empty `groups[]`     → group block (SectionTwo visual logic)
 *
 * SideCurves / DynamicBackground / SvgOverlays rendered ONCE with allGroups[].
 */
export function BlockRenderer({
  sections, layout, surahData, startX, PW,
}: BlockRendererProps) {
  const config = useStoryStore((state) => state.activeConfig);
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  // Grid section: has non-empty verses record
  const gridSection = sections.find(
    (s) => s.verses && Object.keys(s.verses).length > 0,
  );

  // All groups flattened — key unification across both engines
  const allGroups: GroupTransforms[] = sections.flatMap((s) => s.groups ?? []);

  // The section that carries intro/outro + labels (legacy: sections[1])
  const s2Section = sections.find(
    (s) => !!(s.introVerse ?? s.outroVerse ?? (s as any).topLabelPinY),
  );
  const t = s2Section as Required<SectionTransforms> | undefined;

  const section2Data = surahData.section2;
  const introVerseNum = section2Data?.introVerse?.number ?? 6;
  const outroVerseNum = section2Data?.outroVerse?.number ?? 19;
  const introOverride = config.verseOverrides?.[introVerseNum];
  const outroOverride = config.verseOverrides?.[outroVerseNum];
  const introBg = introOverride?.bg ?? config.styling.colors.s2IntroOutroBg;
  const introBorder = introOverride?.border ?? config.styling.colors.maroonTheme;
  const outroBg = outroOverride?.bg ?? config.styling.colors.s2IntroOutroBg;
  const outroBorder = outroOverride?.border ?? config.styling.colors.maroonTheme;

  const hasFrames = t?.topConnectorY !== undefined && t?.topConnectorH !== undefined
    && t?.bottomConnectorY !== undefined && t?.bottomConnectorH !== undefined;
  const hasIntroVerse = s2Section?.introVerse !== undefined && (section2Data?.introVerse?.number ?? 0) > 0;
  const hasOutroVerse = s2Section?.outroVerse !== undefined && (section2Data?.outroVerse?.number ?? 0) > 0;
  const edgeVerseBorderWidth = t?.borderWidth ?? 0;
  const colorGroups = section2Data?.colorGroups ?? [];
  const hasTopLabel = !!section2Data?.topLabel;
  const hasBottomLabel = !!section2Data?.bottomLabel;

  // Hook always called (rule of hooks)
  const s2FrameTexture = useTexture(S2_FRAME_IMAGE, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; });

  return (
    <group>
      {/* Grid block */}
      {gridSection && surahData.section1 && (
        <GridBlock sectionT={gridSection} section1Data={surahData.section1} PW={PW} />
      )}

      {/* Alak top/bottom connector frames */}
      {hasFrames && t && (
        <>
          <mesh position={[t.connectorX + t.connectorW / 2 + S2_TOP_SOLID_X_OFFSET, t.topConnectorY - t.topConnectorH / 2 + S2_TOP_SOLID_Y_OFFSET, -0.001]}
            scale={[S2_TOP_SOLID_SCALE_X, S2_TOP_SOLID_SCALE_Y, 1]} renderOrder={1}>
            <planeGeometry args={[t.connectorW, t.topConnectorH]} />
            <meshBasicMaterial color={S2_FRAME_BG_COLOR} toneMapped={false} depthTest={false} depthWrite={false} />
          </mesh>
          <mesh position={[t.connectorX + t.connectorW / 2 + S2_TOP_IMAGE_X_OFFSET, t.topConnectorY - t.topConnectorH / 2 + S2_TOP_IMAGE_Y_OFFSET, 0]}
            scale={[S2_TOP_IMAGE_SCALE_X, S2_TOP_IMAGE_SCALE_Y, 1]} renderOrder={2}>
            <planeGeometry args={[t.connectorW, t.topConnectorH]} />
            <meshBasicMaterial map={s2FrameTexture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[t.connectorX + t.connectorW / 2 + S2_BOTTOM_SOLID_X_OFFSET, t.bottomConnectorY - t.bottomConnectorH / 2 + S2_BOTTOM_SOLID_Y_OFFSET, -0.001]}
            scale={[S2_BOTTOM_SOLID_SCALE_X, S2_BOTTOM_SOLID_SCALE_Y, 1]} renderOrder={1}>
            <planeGeometry args={[t.connectorW, t.bottomConnectorH]} />
            <meshBasicMaterial color={S2_FRAME_BG_COLOR} toneMapped={false} depthTest={false} depthWrite={false} />
          </mesh>
          <mesh position={[t.connectorX + t.connectorW / 2 + S2_BOTTOM_IMAGE_X_OFFSET, t.bottomConnectorY - t.bottomConnectorH / 2 + S2_BOTTOM_IMAGE_Y_OFFSET, 0]}
            scale={[S2_BOTTOM_IMAGE_SCALE_X, S2_BOTTOM_IMAGE_SCALE_Y, 1]} renderOrder={2}>
            <planeGeometry args={[t.connectorW, t.bottomConnectorH]} />
            <meshBasicMaterial map={s2FrameTexture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}

      {/* Dynamic background texture */}
      {layout.s2BackgroundTexture && (
        <DynamicBackground url={layout.s2BackgroundTexture} layout={layout} startX={startX} />
      )}

      {/* Section paper backgrounds (AyatAlKursi) */}
      {config.styling.colors.sectionBackgrounds && (
        <group position={[startX, 0, -0.0005]}>
          {allGroups.map((gt, i) => {
            const bgColors = config.styling.colors.sectionBackgrounds!;
            const color = bgColors[i] || bgColors[0];
            const isFirst = i === 0;
            const isLast = i === allGroups.length - 1;
            const gtBottom = gt.frameY - gt.frameH;
            const padYOuter = 0.02;
            const yTop = isFirst ? gt.frameY + padYOuter : (allGroups[i - 1].frameY - allGroups[i - 1].frameH + gt.frameY) / 2;
            const yBot = isLast ? gtBottom - padYOuter : (gtBottom + allGroups[i + 1].frameY) / 2;
            const padX = 0.035;
            const w = layout.sectionW - padX * 2;
            const h = yTop - yBot;
            return <UiRect key={`sec-bg-${i}`} x={padX} y={yTop} w={w} h={h} radius={0.06} color={color} depthTest={false} />;
          })}
        </group>
      )}

      {/* Intro verse (Alak v6) */}
      {hasIntroVerse && s2Section && section2Data?.introVerse && (
        <VerseBox
          x={s2Section.introVerse!.x} y={s2Section.introVerse!.y} z={s2Section.introVerse!.z}
          w={s2Section.introVerse!.w} h={s2Section.introVerse!.h}
          verse={section2Data.introVerse.text} number={section2Data.introVerse.number}
          bg={introBg} border={introBorder}
          circleBorderCol={introOverride?.circleBorderCol ?? introBorder}
          circleBg={introOverride?.circleBg ?? introBg}
          circleTextCol={introOverride?.circleTextCol ?? introBorder}
          isPill={false} borderWidth={edgeVerseBorderWidth} textColor={introOverride?.textColor}
          textScaleOverride={activeLanguage !== "ar" ? (introOverride?.translationTextScaleOverride ?? config.globalSettings?.translationVerseTextScale ?? undefined) : (introOverride?.textScaleOverride ?? config.globalSettings?.verseTextScale ?? undefined)}
          translationPadding={introOverride?.translationPadding} />
      )}

      {/* All verse groups — keyed by flat index for both engines */}
      {allGroups.map((groupT, i) => {
        const colorGroup = colorGroups[i];
        if (!colorGroup) return null;
        return (
          <VerseGroup key={i} group={colorGroup} groupTransform={groupT} groupIndex={i} layout={layout} />
        );
      })}

      {/* Outro verse (Alak v19) */}
      {hasOutroVerse && s2Section && section2Data?.outroVerse && (
        <VerseBox
          x={s2Section.outroVerse!.x} y={s2Section.outroVerse!.y} z={s2Section.outroVerse!.z}
          w={s2Section.outroVerse!.w} h={s2Section.outroVerse!.h}
          verse={section2Data.outroVerse.text} number={section2Data.outroVerse.number}
          bg={outroBg} border={outroBorder}
          circleBorderCol={outroOverride?.circleBorderCol ?? outroBorder}
          circleBg={outroOverride?.circleBg ?? outroBg}
          circleTextCol={outroOverride?.circleTextCol ?? outroBorder}
          isPill={false} borderWidth={edgeVerseBorderWidth} textColor={outroOverride?.textColor}
          textScaleOverride={activeLanguage !== "ar" ? (outroOverride?.translationTextScaleOverride ?? config.globalSettings?.translationVerseTextScale ?? undefined) : (outroOverride?.textScaleOverride ?? config.globalSettings?.verseTextScale ?? undefined)}
          translationPadding={outroOverride?.translationPadding} />
      )}

      {/* SideCurves — single instance spanning ALL groups */}
      {allGroups.length > 0 && (
        <SideCurves
          layout={layout} startX={startX} borderWidth={edgeVerseBorderWidth}
          groups={allGroups}
          introOutro={
            hasIntroVerse && hasOutroVerse && s2Section?.introVerse && s2Section?.outroVerse
              ? {
                  v6Y: s2Section.introVerse.y,
                  v6H: s2Section.introVerse.h,
                  v19Y: s2Section.outroVerse.y,
                  v19H: s2Section.outroVerse.h,
                }
              : null
          } />
      )}

      {/* SVG overlays */}
      <SvgOverlays startX={startX} layout={layout} groups={allGroups} />

      {/* Handwritten margin notes */}
      <HandwrittenNotes />

      {/* Section labels */}
      {hasTopLabel && t && (
        <TopLabel x={PW / 2} y={t.topLabelPinY + S2_LABEL_Y_OFFSET} z={0.004}
          text={section2Data!.topLabel} labelWidth={S2_LABEL_WIDTH}
          partialBorder={true} bgColor={S2_TOP_LABEL_BG} borderColor={S2_TOP_LABEL_BORDER} renderOrder={100} />
      )}
      {hasBottomLabel && t && (
        <TopLabel x={PW / 2} y={t.bottomLabelPinY - S2_LABEL_Y_OFFSET} z={0.004}
          text={section2Data!.bottomLabel} labelWidth={S2_LABEL_WIDTH}
          partialBorder={true} bottomBorder={true} bgColor={S2_TOP_LABEL_BG} borderColor={S2_TOP_LABEL_BORDER} renderOrder={100} />
      )}
    </group>
  );
}
