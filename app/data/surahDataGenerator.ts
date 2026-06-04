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
import { SURAH_DATA_BY_LANGUAGE } from "../hooks/useSurahLanguageStore";
import { useSurahLayoutRuntime } from "../hooks/useSurahLayoutRuntime";

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
  isPill?: boolean;
}

export function buildVerseConfigs(
  surahData: (typeof SURAH_DATA_BY_LANGUAGE)["ar"],
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
): VerseConfig[] {
  const configs: VerseConfig[] = [];
  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  // Section 1 (Verses 1 to 4)
  surahData.section1.gridVerses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isLTR = surahData.section1.gridVerses[0].number === 1;
    const lookupNumber = isLTR 
      ? SURAH_DATA_BY_LANGUAGE["ar"].section1.gridVerses[i].number
      : v.number;
    const t = SURAH_TRANSFORMS.s1.verses[lookupNumber];
    if (!t) return;

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
      bg: S1_INNER_BG,
      border: S1_INNER_BORDER,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: S1_VERSE_NUMBER_BG,
      circleTextCol: S1_VERSE_NUMBER_BORDER,
    });
  });

  const introT = SURAH_TRANSFORMS.s2.introVerse;
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

  surahData.section2.colorGroups.forEach((group, gIdx) => {
    group.verses.forEach((v, i) => {
      const isRightCol = i % 2 !== 0;
      const arabicVerseNumber = SURAH_DATA_BY_LANGUAGE["ar"].section2.colorGroups[gIdx].verses[i].number;
      const isLTR = arabicVerseNumber !== v.number;
      const lookupNumber = isLTR ? arabicVerseNumber : v.number;
      const t = SURAH_TRANSFORMS.s2.groups[gIdx].verses[lookupNumber];
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

  const outroT = SURAH_TRANSFORMS.s2.outroVerse;
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

  return configs;
}
