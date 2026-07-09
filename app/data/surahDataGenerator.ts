import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  ORANGE_THEME,
  CAPSULE_BG_6_19,
} from "./theme";
import { SurahDataShape } from "./SurahConfig";
import { useSurahLayoutRuntime } from "../hooks/useSurahLayoutRuntime";

export interface VerseConfig {
  id: number;
  verse: string;
  /** See `Verse.splitTexts` in SurahConfig.ts — renders as two capsules
   * sharing one number badge instead of a single numbered capsule. */
  splitTexts?: [string, string];
  number: number | string;
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
  translationTextScaleOverride?: number | null;
  translationTextAlign?: "left" | "center" | "right";
  isPill?: boolean;
  /** See `VerseOverrideConfig.showNumber` — forces the number badge on even
   * when `features.hideVerseNumbers` is globally true. */
  forceShowNumber?: boolean;
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

function getTranslatedLabel(
  label: string | Record<string, string> | undefined,
  lang: string,
) {
  if (!label) return undefined;
  if (typeof label === "string") return label;
  return label[lang] || label.ar || Object.values(label)[0];
}

export function buildVerseConfigs(
  surahData: SurahDataShape,
  arabicData: SurahDataShape,
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
): VerseConfig[] {
  const configs: VerseConfig[] = [];
  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  // Section2's `colorGroups` array only counts "real" verse groups (g0/g1/
  // g2) — Alak's grid block and intro/outro blocks sit interleaved in
  // `config.blocks` but have no entry there, so we can't index it by raw
  // `blockIdx`. Track a separate counter that only advances past real
  // group blocks.
  let colorGroupIdx = 0;

  (runtime.config.blocks ?? []).forEach((block: any, blockIdx: number) => {
    if (block.type === "spacer") return;
    const transforms = SURAH_TRANSFORMS.sections[blockIdx];
    if (!transforms) return;

    if (block.type === "grid") {
      // Mirrors the legacy "gridWithAnaAyet" branch below exactly (same
      // hinge/direction/capsuleLabel math), driven by `block.verseIds`/
      // `block.anaAyetId` instead of `sectionConfig.verses`/`.anaAyet`.
      const verseIds: number[] = block.verseIds ?? [];
      const anaAyetId: number | undefined = block.anaAyetId;

      const verseTextMap: Record<number, string> = {};
      surahData.section1.gridVerses.forEach((v) => {
        verseTextMap[v.number] = v.text;
      });
      if (surahData.section1.anaAyet) {
        verseTextMap[surahData.section1.anaAyet.number] =
          surahData.section1.anaAyet.text;
      }

      const verseEntries: Array<{ vId: number; gridIdx?: number }> = [
        ...verseIds.map((vId, i) => ({ vId, gridIdx: i })),
        ...(anaAyetId !== undefined ? [{ vId: anaAyetId }] : []),
      ];

      for (const { vId, gridIdx } of verseEntries) {
        const isGridVerse = gridIdx !== undefined;

        let lookupNumber = vId;
        let actualVerseId = vId;
        if (isGridVerse) {
          const arabicVerseNumber = verseIds[gridIdx!];
          const currentLanguageVerseNumber =
            surahData.section1.gridVerses[gridIdx!]?.number;
          if (
            currentLanguageVerseNumber !== undefined &&
            currentLanguageVerseNumber !== arabicVerseNumber
          ) {
            lookupNumber = arabicVerseNumber;
            actualVerseId = currentLanguageVerseNumber;
          }
        }

        const rawTransform = isGridVerse
          ? transforms.verses?.[lookupNumber]
          : transforms.anaAyet;
        if (!rawTransform) continue;

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
        const translationTextScaleOverride = override?.translationTextScaleOverride;
        const translationTextAlign = override?.translationTextAlign;

        let direction: "left" | "right";
        let hingeX: number;
        if (isGridVerse) {
          const isRightCol = gridIdx! % 2 !== 0;
          direction = isRightCol ? "right" : "left";
          const worldX = rawTransform.x - PAGE_WIDTH / 2;
          hingeX = isRightCol ? worldX : worldX + rawTransform.w;
        } else {
          direction = "right";
          hingeX = rawTransform.x - PAGE_WIDTH / 2 - expandW;
        }

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
                customText: getTranslatedLabel(
                  override?.customCapsuleLabel,
                  runtime.activeLanguage,
                ),
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
          translationTextScaleOverride,
          translationTextAlign,
          isPill,
          isSectionIntroOutro: !isGridVerse,
          customFrameSvg: override?.customFrameSvg,
          frameScaleLTR: override?.frameScaleLTR,
          capsuleLabel,
        });
      }
      return;
    }

    if (block.introOutroRole) {
      // Mirrors the legacy dedicated introT/outroT push below exactly —
      // hardcoded orange theme, non-pill, ignoring verseOverrides (kept
      // identical even though alak96Config.ts's overrides for 6/19
      // happen to match these constants already).
      const t =
        block.introOutroRole === "intro"
          ? transforms.introVerse
          : transforms.outroVerse;
      const verseData =
        block.introOutroRole === "intro"
          ? surahData.section2?.introVerse
          : surahData.section2?.outroVerse;
      if (t && verseData?.number) {
        configs.push({
          id: verseData.number,
          verse: verseData.text || "",
          number: verseData.number,
          y: t.y,
          w: t.w,
          h: t.h,
          hingeX: t.x - PAGE_WIDTH / 2,
          direction: "right",
          bg: CAPSULE_BG_6_19,
          border: ORANGE_THEME,
          circleBorderCol: ORANGE_THEME,
          circleBg: CAPSULE_BG_6_19,
          circleTextCol: ORANGE_THEME,
          isPill: false,
        });
      }
      return;
    }

    const group = transforms.groups?.[0];
    if (!group) return;

    const cols = block.columns ?? 2;
    const colorGroup = surahData.section2?.colorGroups?.[colorGroupIdx];
    const arabicGroup = arabicData.section2?.colorGroups?.[colorGroupIdx];
    colorGroupIdx++;
    const isCenterGroup = block.isCenter ?? false;

    (block.verseIds ?? []).forEach((_vId: number, i: number) => {
      const v = colorGroup?.verses?.[i];
      if (!v) return;
      const isRightCol = cols === 2 ? i % 2 !== 0 : false;
      const arabicVerseNumber = arabicGroup?.verses?.[i]?.number;
      if (arabicVerseNumber === undefined) return;
      const isLTR = arabicVerseNumber !== v.number;
      const lookupNumber = isLTR ? arabicVerseNumber : v.number;
      const t = group.verses[lookupNumber];
      if (!t) return;

      const override =
        runtime.config.verseOverrides?.[lookupNumber] ??
        runtime.config.verseOverrides?.[v.number];
      const expandW = override?.expandW ?? 0;
      const expandH = override?.expandH ?? 0;

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
      const finalCircleTextCol =
        override?.circleTextCol ?? runtime.config.styling.colors.verseNumberText;
      const finalTextColor = override?.textColor;
      const textScaleOverride = override?.textScaleOverride;
      const translationTextScaleOverride = override?.translationTextScaleOverride;
      const translationTextAlign = override?.translationTextAlign;

      const worldX = t.x - expandW - PAGE_WIDTH / 2;
      const expandedW = t.w + expandW * 2;
      const expandedH = t.h + expandH * 2;
      const direction = isRightCol ? "right" : "left";
      const hingeX = isRightCol ? worldX : worldX + expandedW;

      const capsuleLabelW = (runtime.layoutMath as any).capsuleLabelW ?? 0.2;
      const capsuleLabelH = (runtime.layoutMath as any).capsuleLabelH ?? 0.032;
      const capsuleLabelBorderWidth =
        (runtime.layoutMath as any).capsuleLabelBorderWidth ?? 0.0035;
      const capsuleLabelDrop = (runtime.layoutMath as any).capsuleLabelDrop ?? 0.015;

      let capsuleLabel;
      if (override?.hasCapsuleLabel) {
        const isTop = override.capsuleLabelPosition !== "bottom";
        const capsuleCenterX =
          direction === "right" ? expandedW / 2 : -expandedW / 2;
        const yTop = capsuleLabelDrop;
        const yBottom = -expandedH - capsuleLabelDrop;

        capsuleLabel = {
          x: capsuleCenterX,
          y: isTop ? yTop : yBottom,
          w: capsuleLabelW,
          h: capsuleLabelH,
          borderWidth: capsuleLabelBorderWidth,
          labelDrop: capsuleLabelDrop,
          customText: getTranslatedLabel(
            override.customCapsuleLabel,
            runtime.activeLanguage,
          ),
        };
      }

      configs.push({
        id: v.number,
        verse: v.text,
        splitTexts: v.splitTexts,
        number: override?.displayNumber ?? v.number,
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
        translationTextScaleOverride,
        translationTextAlign,
        isPill: override?.isPill,
        forceShowNumber: override?.showNumber,
        capsuleLabel,
      });
    });
  });

  return configs;
}
