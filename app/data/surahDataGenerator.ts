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
  isPill?: boolean;
  isSectionIntroOutro?: boolean;
  customFrameSvg?: string;
  frameScaleLTR?: number;
  anaAyetTab?: {
    x: number;
    y: number;
    w: number;
    h: number;
    borderWidth: number;
    labelDrop?: number;
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

        // --- AnaAyetTab: only generated when the override declares it and the
        //     section transforms supply the tab dimensions ---
        const anaAyetTab =
          !isGridVerse &&
          override?.hasAnaAyetTab &&
          transforms.anaAyetTabW != null
            ? {
                x: transforms.anaAyetTabX! - (rawTransform.x - expandW),
                y: transforms.anaAyetTabY! - (rawTransform.y + expandH),
                w: transforms.anaAyetTabW!,
                h: transforms.anaAyetTabH!,
                borderWidth: transforms.anaAyetTabBorderWidth!,
                labelDrop: transforms.anaAyetLabelDrop,
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
          isPill,
          isSectionIntroOutro: !isGridVerse,
          customFrameSvg: override?.customFrameSvg,
          frameScaleLTR: override?.frameScaleLTR,
          anaAyetTab,
        });
      }
    } else if (sectionConfig.type === "verticalGroups") {
      const vConfig = sectionConfig as VerticalGroupsSectionConfig;
      const introT = transforms.introVerse;
      if (introT) {
        configs.push({
          id: surahData.section2.introVerse.number,
          verse: surahData.section2.introVerse.text,
          number: surahData.section2.introVerse.number,
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

      surahData.section2.colorGroups.forEach((group, gIdx) => {
        group.verses.forEach((v, i) => {
          const isRightCol = i % 2 !== 0;
          const arabicVerseNumber =
            arabicData.section2.colorGroups[gIdx].verses[i]
              .number;
          const isLTR = arabicVerseNumber !== v.number;
          const lookupNumber = isLTR ? arabicVerseNumber : v.number;
          const t = transforms.groups![gIdx].verses[lookupNumber];
          if (!t) return;

          const vNum = v.number;
          let bg = gIdx === 1 ? CAPSULE_BG_12_14 : CAPSULE_BG_7_8_17_18;
          if (vNum === 9 || vNum === 10 || vNum === 15 || vNum === 16) {
            bg = CAPSULE_BG_9_10_15_16;
          }
          if (vNum === 7 || vNum === 8 || vNum === 17 || vNum === 18) {
            bg = CAPSULE_BG_7_8_17_18;
          }

          const border = gIdx === 1 ? GREEN_THEME : MAROON_THEME;

          const worldX = t.x - PAGE_WIDTH / 2;
          const direction = isRightCol ? "right" : "left";
          const hingeX = isRightCol ? worldX : worldX + t.w;

          configs.push({
            id: v.number,
            verse: v.text,
            number: v.number,
            y: t.y,
            w: t.w,
            h: t.h,
            hingeX,
            direction,
            bg,
            border,
            circleBorderCol: border,
            circleBg: bg,
            circleTextCol: border,
          });
        });
      });

      const outroT = transforms.outroVerse;
      if (outroT) {
        configs.push({
          id: surahData.section2.outroVerse.number,
          verse: surahData.section2.outroVerse.text,
          number: surahData.section2.outroVerse.number,
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
