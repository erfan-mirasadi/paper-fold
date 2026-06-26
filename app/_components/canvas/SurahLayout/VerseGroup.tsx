"use client";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { VerseBox, UiRect, TopLabel, CapsuleLabel } from "./SharedUI";
import type { ColorGroup } from "../../../data/SurahConfig";
import { OPPOSITE_VERSE_CONNECTOR } from "../../../data/SurahConfig";
import type {
  GroupTransforms,
  RowConnectorTransform,
  VerticalGroupsSectionConfig,
} from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

interface VerseGroupProps {
  group: ColorGroup;
  groupTransform: GroupTransforms;
  groupIndex?: number;
  layout?: any; // To receive verseTextScale
}

export function VerseGroup({
  group,
  groupTransform,
  groupIndex,
  layout,
}: VerseGroupProps) {
  const gt = groupTransform;
  const config = useStoryStore((state) => state.activeConfig);
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  let finalVerseTextScale = layout?.verseTextScale;
  if (activeLanguage !== "ar") {
    if (layout?.translationVerseTextScale !== undefined) {
      finalVerseTextScale =
        layout.translationVerseTextScale === null
          ? undefined
          : layout.translationVerseTextScale;
    }
  }

  // ── Group-level fallback border color from config.styling.colors ──────────
  // isCenter groups use the green theme key; outer groups use the maroon theme key.
  const groupFallbackBorder = gt.isCenter
    ? config.styling.colors.greenTheme
    : config.styling.colors.maroonTheme;

  // ── Row connector color — derived from the first verse in the group ────────
  // We use the border from the first verse's override if available; otherwise
  // the group-level fallback. This keeps the connector stripe in sync with
  // the verse capsule colours automatically.
  const firstVerseOverride =
    config.verseOverrides?.[group.verses?.[0]?.number ?? -1];
  const borderColor = firstVerseOverride?.border ?? groupFallbackBorder;

  // ── Row connector visibility ───────────────────────────────────────────────
  // Read hideRowConnectors from the verticalGroups section config.
  const sectionConfig = config.sections.find(
    (s) => s.type === "verticalGroups",
  ) as VerticalGroupsSectionConfig | undefined;
  const hideConnectors = sectionConfig?.hideRowConnectors ?? false;

  const topLabelText = group.topLabel;
  const topLabelConfig = (gt as any).topLabelConfig;

  const bgTex = (gt as any).backgroundTexture;
  const bgScaleX = (gt as any).backgroundScaleX;
  const bgScaleY = (gt as any).backgroundScaleY;
  const bgOffsetX = (gt as any).backgroundOffsetX;
  const bgOffsetY = (gt as any).backgroundOffsetY;

  const leftVerses: any[] = [];
  const rightVerses: any[] = [];
  const versesArr = Object.values(gt.verses).sort(
    (a: any, b: any) => a.x - b.x,
  );
  const half = Math.floor(versesArr.length / 2);
  leftVerses.push(...versesArr.slice(0, half));
  rightVerses.push(...versesArr.slice(half));

  const getBounds = (verses: any[]) => {
    if (verses.length === 0) return null;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const v of verses) {
      if (v.x < minX) minX = v.x;
      if (v.x + v.w > maxX) maxX = v.x + v.w;
      if (v.y - v.h < minY) minY = v.y - v.h;
      if (v.y > maxY) maxY = v.y;
    }
    return { x: minX, y: maxY, w: maxX - minX, h: maxY - minY };
  };

  const leftBox = getBounds(leftVerses);
  const rightBox = getBounds(rightVerses);
  const bp = 0.004;

  return (
    <group>
      {bgTex && leftBox && (
        <GroupFrameBackground
          url={bgTex}
          x={leftBox.x - bp}
          y={leftBox.y + bp}
          w={leftBox.w + bp * 2}
          h={leftBox.h + bp * 2}
          scaleX={bgScaleX}
          scaleY={bgScaleY}
          offsetX={bgOffsetX}
          offsetY={bgOffsetY}
        />
      )}
      {bgTex && rightBox && (
        <GroupFrameBackground
          url={bgTex}
          x={rightBox.x - bp}
          y={rightBox.y + bp}
          w={rightBox.w + bp * 2}
          h={rightBox.h + bp * 2}
          scaleX={bgScaleX}
          scaleY={bgScaleY}
          offsetX={bgOffsetX}
          offsetY={bgOffsetY}
        />
      )}
      {topLabelText && topLabelConfig && (
        <TopLabel
          x={gt.frameX + gt.frameW / 2}
          y={gt.frameY + (topLabelConfig.yOffset || 0)}
          z={0.005}
          text={topLabelText}
          labelWidth={topLabelConfig.width || 0.3}
          labelHeight={topLabelConfig.height}
          partialBorder={false}
          bgColor={topLabelConfig.bgColor || config.styling.colors.paperBase}
          borderColor={
            topLabelConfig.borderColor || config.styling.colors.s1InnerBorder
          }
          textColor={topLabelConfig.textColor}
          xMultiplier={topLabelConfig.xMultiplier}
          noBorder={topLabelConfig.noBorder}
          shadow={topLabelConfig.shadow}
          isSimpleText={topLabelConfig.isSimpleText}
          renderOrder={20}
          textScaleOverride={
            (config.id === "ayatalkursi" || config.id === "ahzab35") && activeLanguage !== "ar"
              ? undefined
              : topLabelConfig.textScaleOverride
          }
        />
      )}
      {/* Row Connectors for opposite verses — hidden when hideRowConnectors is set */}
      {!hideConnectors &&
        gt.rowConnectors.map((rc: RowConnectorTransform, i: number) => {
          const leftV = group.verses[i * 2];
          const rightV = group.verses[i * 2 + 1];

          if (!leftV || !rightV) return null;

          // Per-row connector color — derive from the left verse in this row so
          // each row pair tracks its own hue when overrides differ per row.
          const rowLeftOverride = config.verseOverrides?.[leftV.number];
          const rowBorderColor = rowLeftOverride?.border ?? groupFallbackBorder;

          return (
            <group key={`connector-${i}`}>
              <UiRect
                x={rc.x}
                y={rc.y}
                z={rc.z}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={rowBorderColor}
                renderOrder={3}
              />
            </group>
          );
        })}

      {/* 2×2 verse grid — position comes from the engine, no math here */}
      {group.verses.map((v, i) => {
        // ── Foolproof transform lookup ─────────────────────────────────────────
        // The gt.verses dictionary is keyed by the *Arabic* verse IDs (the ids
        // used in config.sections[*].groups[*].verseIds).  When rendering a
        // non-Arabic language, v.number is still the same verse ID (only the
        // text changes), but in some LTR display orderings the index i inside the
        // group may correspond to a different Arabic verse than v.number would
        // imply.  We resolve this by consulting the active Arabic text data for
        // the current surah, not the hardcoded Alak SURAH_DATA_ARABIC constant.
        let lookupNumber = v.number;

        if (groupIndex !== undefined) {
          // useStoryStore.getState() is the zustand static accessor — safe inside
          // a render function; not a hook call.
          const activeTextData = useStoryStore.getState().activeTextData;
          const arabicData = activeTextData?.["ar"];

          // The verticalGroups section always stores its colorGroups under
          // section2 in SurahDataShape — true for both Alak and Ayat al-Kursi.
          const arabicGroups = arabicData?.section2?.colorGroups;

          const arabicVerseNumber =
            arabicGroups?.[groupIndex]?.verses?.[i]?.number;

          // Only override if the Arabic data gives a *different* number (i.e.
          // the current language displays verses in a different position than
          // the Arabic RTL order and the transform was keyed by the Arabic id).
          if (
            arabicVerseNumber !== undefined &&
            arabicVerseNumber !== v.number
          ) {
            lookupNumber = arabicVerseNumber;
          }
        }

        // Primary lookup by resolved number; fallback to v.number in case the
        // Arabic data and the display data happen to have the same ordering
        // (which is normal for Arabic mode — both resolve to the same key).
        const vt = gt.verses[lookupNumber] ?? gt.verses[v.number];
        if (!vt) return null; // Transform genuinely absent — skip silently.

        // ── Color resolution — 100% config-driven ─────────────────────────────
        // 1. Check verseOverrides for this specific verse number (Arabic ID).
        // 2. Fallback: group.verseBg (SectionTwoData level, rarely set).
        // 3. Final fallback: group-level theme key from styling.colors.
        const override =
          config.verseOverrides?.[lookupNumber] ??
          config.verseOverrides?.[v.number];

        const finalBg =
          override?.bg ??
          group.verseBg ??
          (gt.isCenter
            ? config.styling.colors.greenTheme // centre group bg fallback
            : config.styling.colors.maroonTheme); // outer group bg fallback

        const finalBorder = override?.border ?? groupFallbackBorder;
        const finalCircleBg = override?.circleBg ?? finalBg;
        const finalCircleBorder = override?.circleBorderCol ?? finalBorder;
        const finalCircleText =
          override?.circleTextCol ?? config.styling.colors.verseNumberText;

        let finalTextScale =
          override?.textScaleOverride ?? finalVerseTextScale;
        if (activeLanguage !== "ar") {
          // If translationVerseTextScale is null, drop it.
          // Wait, if it's null, finalVerseTextScale is ALREADY undefined from the outer loop!
          // But override?.textScaleOverride might be set. If the config dictates translation scale should be dropped, we do it here too:
          if (override?.translationTextScaleOverride !== undefined) {
            finalTextScale = override.translationTextScaleOverride;
          } else if (layout?.translationVerseTextScale !== undefined) {
            if (layout.translationVerseTextScale === null) {
              finalTextScale = undefined;
            } else if (!override?.textScaleOverride) {
               // We already handled it in finalVerseTextScale, so just let it use finalTextScale as is.
            }
          }
        }

        const hasTab = override?.hasCapsuleLabel;
        let customTabText = override?.customCapsuleLabel;
        if (customTabText && typeof customTabText !== "string") {
          customTabText = customTabText[activeLanguage] || customTabText.ar || Object.values(customTabText)[0];
        }
        const tabPos = override?.capsuleLabelPosition ?? "top";

        const labelW = layout?.capsuleLabelW ?? 0.2;
        const labelH = layout?.capsuleLabelH ?? 0.032;
        const labelBorder = layout?.capsuleLabelBorderWidth ?? 0.0035;
        const labelDrop = layout?.capsuleLabelDrop ?? 0.015;

        const expandW = override?.expandW ?? 0;
        const expandH = override?.expandH ?? 0;

        const finalW = vt.w + expandW * 2;
        const finalH = vt.h + expandH * 2;
        const finalX = vt.x - expandW;
        const finalY = vt.y + expandH;

        const tabX = finalX + finalW / 2;
        const tabY =
          tabPos === "top" ? finalY + labelDrop : finalY - finalH - labelDrop;

        return (
          <group key={v.number}>
            <VerseBox
              x={finalX}
              y={finalY}
              z={vt.z}
              w={finalW}
              h={finalH}
              verse={v.text}
              number={v.number}
              bg={finalBg}
              border={finalBorder}
              circleBorderCol={finalCircleBorder}
              circleBg={finalCircleBg}
              circleTextCol={finalCircleText}
              isPill={override?.isPill ?? true}
              textScaleOverride={finalTextScale}
              textColor={override?.textColor}
            />
            {hasTab && (
              <CapsuleLabel
                x={tabX}
                y={tabY}
                w={labelW}
                h={labelH}
                z={vt.z + 0.004}
                borderWidth={labelBorder}
                renderOrder={110}
                customText={customTabText}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

function GroupFrameBackground({
  url,
  x,
  y,
  w,
  h,
  scaleX = 1,
  scaleY = 1,
  offsetX = 0,
  offsetY = 0,
}: {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
}) {
  const tex = useTexture(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <mesh
      position={[x + w / 2 + offsetX, y - h / 2 + offsetY, -0.002]}
      scale={[scaleX, scaleY, 1]}
      renderOrder={1}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
