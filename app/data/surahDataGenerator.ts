import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
  MAROON_THEME,
  GREEN_THEME,
  BLUE_THEME,
  CAPSULE_BG_6_19,
} from "./theme";
import { SurahDataShape } from "./surahData";
import { useSurahLayoutRuntime } from "../hooks/useSurahLayoutRuntime";

import { GridSectionConfig, VerticalGroupsSectionConfig } from "./schema";

export interface VerseConfig {
  id: number;
  verse: string;
  number: number;
  y: number;
  w: number;
  h: number;
  hingeX: number;
  direction: "left" | "right";
  bg: string;
  border: string;
  circleBorderCol: string;
  circleBg: string;
  circleTextCol: string;
  textColor?: string;
  textScaleOverride?: number;
  isPill?: boolean;
  isSectionIntroOutro?: boolean;
  customFrameSvg?: string;
  frameScaleLTR?: number;
  capsuleLabel?: {
    x: number;
    y: number;
    w: number;
    h: number;
    borderWidth: number;
    labelDrop?: number;
    customText?: string;
  };
}

export function buildVerseConfigs(
  surahData: SurahDataShape,
  arabicData: SurahDataShape,
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
): VerseConfig[] {
  const configs: VerseConfig[] = [];
  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  runtime.config.sections.forEach((sectionConfig, sectionIdx) => {
    const transforms = SURAH_TRANSFORMS.sections[sectionIdx];
    if (!transforms) return;

    if (sectionConfig.type === "gridWithAnaAyet") {
      const gridConfig = sectionConfig as GridSectionConfig;

      // Build a language-aware text map keyed by verse number (always Arabic ID).
      // This works for all languages since v.number is always the canonical Arabic number.
      const verseTextMap: Record<number, string> = {};
      surahData.section1.gridVerses.forEach((v) => {
        verseTextMap[v.number] = v.text;
      });
      if (surahData.section1.anaAyet) {
        verseTextMap[surahData.section1.anaAyet.number] =
          surahData.section1.anaAyet.text;
      }

      // Unified entry list: grid verses (with column index) + optional anaAyet.
      const verseEntries: Array<{ vId: number; gridIdx?: number }> = [
        ...gridConfig.verses.map((vId, i) => ({ vId, gridIdx: i })),
        ...(gridConfig.anaAyet !== undefined
          ? [{ vId: gridConfig.anaAyet }]
          : []),
      ];

      for (const { vId, gridIdx } of verseEntries) {
        const isGridVerse = gridIdx !== undefined;

        // Swapping layout lookup for LTR grid verses
        let lookupNumber = vId;
        let actualVerseId = vId;
        if (isGridVerse) {
          const arabicVerseNumber = gridConfig.verses[gridIdx];
          const currentLanguageVerseNumber = surahData.section1.gridVerses[gridIdx]?.number;
          if (currentLanguageVerseNumber !== undefined && currentLanguageVerseNumber !== arabicVerseNumber) {
            lookupNumber = arabicVerseNumber;
            actualVerseId = currentLanguageVerseNumber;
          }
        }

        // Resolve the layout transform for this verse using lookupNumber.
        // Grid verses live in transforms.verses; the anaAyet has its own slot.
        const rawTransform = isGridVerse
          ? transforms.verses?.[lookupNumber]
          : transforms.anaAyet;
        if (!rawTransform) continue;

        // --- Override-driven properties (all optional, default to section values) ---
        const override = runtime.config.verseOverrides?.[actualVerseId];
        const expandW = override?.expandW ?? 0;
        const expandH = override?.expandH ?? 0;
        const expandedW = rawTransform.w + expandW * 2;
        const expandedH = rawTransform.h + expandH * 2;

        const isPill = override?.isPill ?? true;
        const bg = override?.bg ?? S1_INNER_BG;
        const border = override?.border ?? S1_INNER_BORDER;
        const circleBorderCol =
          override?.circleBorderCol ??
          override?.border ??
          S1_VERSE_NUMBER_BORDER;
        const circleBg =
          override?.circleBg ?? override?.bg ?? S1_VERSE_NUMBER_BG;
        const circleTextCol =
          override?.circleTextCol ?? override?.border ?? S1_VERSE_NUMBER_BORDER;
        const textColor = override?.textColor;
        const textScaleOverride = override?.textScaleOverride;

        // --- Hinge and fold direction ---
        let direction: "left" | "right";
        let hingeX: number;
        if (isGridVerse) {
          // Even column index (0, 2, …) → left-fold; odd (1, 3, …) → right-fold
          const isRightCol = gridIdx % 2 !== 0;
          direction = isRightCol ? "right" : "left";
          const worldX = rawTransform.x - PAGE_WIDTH / 2;
          hingeX = isRightCol ? worldX : worldX + rawTransform.w;
        } else {
          direction = "right";
          hingeX = rawTransform.x - PAGE_WIDTH / 2 - expandW;
        }

        // --- CapsuleLabel: only generated when the override declares it and the
        // layout provides its dimensions.
        const capsuleLabel =
          !isGridVerse &&
          override?.hasCapsuleLabel &&
          transforms.capsuleLabelW != null
            ? {
                x: transforms.capsuleLabelX! - (rawTransform.x - expandW),
                y: transforms.capsuleLabelY! - (rawTransform.y + expandH),
                w: transforms.capsuleLabelW!,
                h: transforms.capsuleLabelH!,
                borderWidth: transforms.capsuleLabelBorderWidth!,
                labelDrop: transforms.capsuleLabelDrop,
                customText: override?.customCapsuleLabel,
              }
            : undefined;

        configs.push({
          id: actualVerseId,
          verse: verseTextMap[actualVerseId] ?? "",
          number: actualVerseId,
          y: rawTransform.y + expandH,
          w: expandedW,
          h: expandedH,
          hingeX,
          direction,
          bg,
          border,
          circleBorderCol,
          circleBg,
          circleTextCol,
          textColor,
          textScaleOverride,
          isPill,
          isSectionIntroOutro: !isGridVerse,
          customFrameSvg: override?.customFrameSvg,
          frameScaleLTR: override?.frameScaleLTR,
          capsuleLabel,
        });
      }
    } else if (sectionConfig.type === "verticalGroups") {
      const vConfig = sectionConfig as VerticalGroupsSectionConfig;
      const introT = transforms.introVerse;
      const introVerseData = surahData.section2?.introVerse;
      if (introT && introVerseData?.number) {
        configs.push({
          id: introVerseData.number,
          verse: introVerseData.text || "",
          number: introVerseData.number,
          y: introT.y,
          w: introT.w,
          h: introT.h,
          hingeX: introT.x - PAGE_WIDTH / 2,
          direction: "right",
          bg: CAPSULE_BG_6_19,
          border: BLUE_THEME,
          circleBorderCol: BLUE_THEME,
          circleBg: CAPSULE_BG_6_19,
          circleTextCol: BLUE_THEME,
          isPill: false,
        });
      }

      surahData.section2?.colorGroups?.forEach((group, gIdx) => {
        group.verses?.forEach((v, i) => {
          const isRightCol = i % 2 !== 0;
          const arabicGroup = arabicData.section2?.colorGroups?.[gIdx];
          const arabicVerseNumber = arabicGroup?.verses?.[i]?.number;
          if (arabicVerseNumber === undefined) return;
          const isLTR = arabicVerseNumber !== v.number;
          const lookupNumber = isLTR ? arabicVerseNumber : v.number;
          const t = transforms.groups![gIdx].verses[lookupNumber];
          if (!t) return;

          const override = runtime.config.verseOverrides?.[lookupNumber] ?? runtime.config.verseOverrides?.[v.number];
          
          const expandW = override?.expandW ?? 0;
          const expandH = override?.expandH ?? 0;

          const isCenterGroup = gIdx === 1;
          const groupFallbackBorder = isCenterGroup 
            ? runtime.config.styling.colors.greenTheme 
            : runtime.config.styling.colors.maroonTheme;

          const finalBg =
            override?.bg ??
            (isCenterGroup
              ? runtime.config.styling.colors.greenTheme
              : runtime.config.styling.colors.maroonTheme);

          const finalBorder = override?.border ?? groupFallbackBorder;
          const finalCircleBg = override?.circleBg ?? finalBg;
          const finalCircleBorderCol = override?.circleBorderCol ?? finalBorder;
          const finalCircleTextCol = override?.circleTextCol ?? runtime.config.styling.colors.verseNumberText;
          const finalTextColor = override?.textColor;
          const textScaleOverride = override?.textScaleOverride;

          const worldX = t.x - expandW - PAGE_WIDTH / 2;
          const expandedW = t.w + expandW * 2;
          const expandedH = t.h + expandH * 2;
          const direction = isRightCol ? "right" : "left";
          const hingeX = isRightCol ? worldX : worldX + expandedW;

          const capsuleLabelW = runtime.layoutMath.capsuleLabelW ?? 0.2;
          const capsuleLabelH = runtime.layoutMath.capsuleLabelH ?? 0.032;
          const capsuleLabelBorderWidth = runtime.layoutMath.capsuleLabelBorderWidth ?? 0.0035;
          const capsuleLabelDrop = runtime.layoutMath.capsuleLabelDrop ?? 0.015;

          let capsuleLabel;
          if (override?.hasCapsuleLabel) {
            const isTop = override.capsuleLabelPosition !== "bottom";

            // Mirror exactly what VerseGroup.tsx does on the static paper:
            //   tabX = finalX + finalW / 2  (center of capsule, world space)
            //   tabY = isTop ? finalY + labelDrop : finalY - finalH - labelDrop
            //
            // In VerseMesh the fold-group is placed at position-y = config.y = finalY.
            // So local space Y = world Y - finalY:
            //   top:    localY = (finalY + labelDrop) - finalY = +labelDrop
            //   bottom: localY = (finalY - expandedH - labelDrop) - finalY = -expandedH - labelDrop
            //
            // X: CapsuleLabel uses x as its horizontal center (it renders at x - w/2).
            //   direction="right": hinge is left edge, capsule center = +expandedW / 2
            //   direction="left":  hinge is right edge, capsule center = -expandedW / 2

            const capsuleCenterX = direction === "right" ? expandedW / 2 : -expandedW / 2;
            const yTop    = capsuleLabelDrop;
            const yBottom = -expandedH - capsuleLabelDrop;

            capsuleLabel = {
               x: capsuleCenterX,
               y: isTop ? yTop : yBottom,
               w: capsuleLabelW,
               h: capsuleLabelH,
               borderWidth: capsuleLabelBorderWidth,
               labelDrop: capsuleLabelDrop,
               customText: override.customCapsuleLabel,
            };
          }

          configs.push({
            id: v.number,
            verse: v.text,
            number: v.number,
            y: t.y + expandH,
            w: expandedW,
            h: expandedH,
            hingeX,
            direction,
            bg: finalBg,
            border: finalBorder,
            circleBorderCol: finalCircleBorderCol,
            circleBg: finalCircleBg,
            circleTextCol: finalCircleTextCol,
            textColor: finalTextColor,
            textScaleOverride,
            capsuleLabel,
          });
        });
      });

      const outroT = transforms.outroVerse;
      const outroVerseData = surahData.section2?.outroVerse;
      if (outroT && outroVerseData?.number) {
        configs.push({
          id: outroVerseData.number,
          verse: outroVerseData.text || "",
          number: outroVerseData.number,
          y: outroT.y,
          w: outroT.w,
          h: outroT.h,
          hingeX: outroT.x - PAGE_WIDTH / 2,
          direction: "right",
          bg: CAPSULE_BG_6_19,
          border: BLUE_THEME,
          circleBorderCol: BLUE_THEME,
          circleBg: CAPSULE_BG_6_19,
          circleTextCol: BLUE_THEME,
          isPill: false,
        });
      }
    }
  });

  return configs;
}
