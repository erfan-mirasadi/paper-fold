import {
  SurahLayoutConfig,
  SectionConfig,
  GridSectionConfig,
  VerticalGroupsSectionConfig,
} from "./schema";
import type {
  ElementTransform,
  GroupTransforms,
  RowConnectorTransform,
  SectionTransforms,
} from "./schema";
import { SURAH_DATA_ARABIC as SURAH_DATA } from "./surahData";
import {
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
  BLUE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
  S2_VERSE_NUMBER_TEXT,
} from "./theme";

export interface Verse {
  number: number;
  text: string;
}

export interface ColorGroup {
  verses: Verse[];
  verseBg?: string;
  topLabel?: string;
  isPushedIn?: boolean;
  isCenter?: boolean;
  extraRowGap?: number;
}

export interface SectionOneData {
  label: string;
  gridVerses: Verse[];
  anaAyet: Verse;
}

export interface SectionTwoData {
  topLabel: string;
  introVerse: Verse;
  colorGroups: ColorGroup[];
  outroVerse: Verse;
  bottomLabel: string;
}

export { SURAH_DATA };

// ----------------------------------------------------------------------------
// ALAK CONFIGURATION (Fully Config-Driven)
// ----------------------------------------------------------------------------

export interface AlakLayoutParams {
  s1Top: number;
  s1Pad: number;
  gap: number;
  s1AnaGap: number;
  smallBoxH: number;
  anaAyetH: number;
  gapBetweenS1andS2: number;
  s2VerticalPad: number;
  bigBoxH: number;
  groupGap: number;
  groupPad: number;
  groupPadBottom: number;
  s2Gap: number;
  smallBoxH2: number;
  middleExtraGap: number;
  s2PadLeftRight: number;
  g2Scale: number;
  s1BorderWidth: number;
  anaAyetTabW: number;
  anaAyetTabH: number;
  anaAyetTabBorderWidth: number;
  anaAyetLabelDrop: number;
  sgPad: number;
  sgBorderWidth: number;
  boxExtOffset: number;
  extraRowGap: number;
  labelHitboxWidth: number;
  verseTextScale?: number;
  groupRows?: number[];
  s2VerticalRowGap?: number;
  outerScale?: number;
}

export const ALAK_LAYOUT_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "alak",
  title: "ALAK SURESİ",
  heroTitle: "Alak",
  heroSubtitle: "suresi",
  features: {
    hasIntro: true,
    hasElevatedSections: true,
    hasPopUps: true,
  },
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 6,
  },
  specialVerses: {
    middleFoldVerses: { left: [12, 14], right: [11, 13] },
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      7: 8,
      8: 7,
      9: 10,
      10: 9,
      11: 12,
      12: 11,
      13: 14,
      14: 13,
      15: 16,
      16: 15,
      17: 18,
      18: 17,
    },
  },
  introMedia: {
    section1_start: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: false,
      },
    },
    section1_zoom: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: true,
      },
    },
    section1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İnsanlara oku!",
        titleSize: "text-[11vw] md:text-[8.5vw] leading-[1.05]",
      },
    },
    section1_step1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title:
          "Alak suresi, insanlığın ufkunda doğan İlahi bir güneş gibi\nMuhammed aleyhisselama peygamberlik tacının giydirildiğini\nbütün cihana ilan etmiş ve müjdelemiştir",
        titleSize: "text-[5.5vw] md:text-[3.5vw] leading-[1.2]",
      },
    },
    section1_step2: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Tebliğ\nirşad vazifesinin \ntarifi tebliği",
      },
    },
    section1_step3: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
      },
    },
    section2_top: {
      src: "/intro/section-2.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in dünyası",
        title: "Tuğyan\n zulüm\ninkâr \nistiğna",
      },
    },
    section2_center: {
      src: "/intro/section-3.mp4",
      isVideo: true,
      backgroundText: {
        title: "Dışarıdan bakanlara\n hitap",
      },
    },
    section2_bottom: {
      src: "/intro/section-4.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in ahireti",
        title: "Tuğyanın\n zulmün\n inkârın \nkarşılığı",
      },
    },
  },
  introGuides: {
    section1: "Ana bölüm",
    section2_top: "1. Açıklama bölümü",
    section2_center: "Orta bölüm",
    section2_bottom: "2. Açıklama bölümü",
  },
  assets: {},
  verseOverrides: {
    // ── Section 1 verse 5 ─────────────────────────────────────────────────
    5: {
      customFrameSvg: "/Group 11.svg",
      expandW: 0.035,
      expandH: 0.01,
      frameScaleLTR: 1.1,
      isPill: false,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT,
      hasAnaAyetTab: true,
    },
    // ── Section 2 intro verse (6) ─────────────────────────────────────────
    6: {
      bg: CAPSULE_BG_6_19,
      border: BLUE_THEME,
      circleBorderCol: BLUE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: BLUE_THEME,
    },
    // ── Group 1 outer rows (7, 8) ─────────────────────────────────────────
    7: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    8: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 1 inner rows (9, 10) ────────────────────────────────────────
    9: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    10: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 2 center (11, 12, 13, 14) ──────────────────────────────────
    11: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    12: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    13: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    14: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    // ── Group 3 inner rows (15, 16) ───────────────────────────────────────
    15: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    16: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 3 outer rows (17, 18) ───────────────────────────────────────
    17: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    18: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Section 2 outro verse (19) ────────────────────────────────────────
    19: {
      bg: CAPSULE_BG_6_19,
      border: BLUE_THEME,
      circleBorderCol: BLUE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: BLUE_THEME,
    },
  },
  styling: {
    colors: {
      paperBase: "#E4DFCA",
      shadow: "#000000",
      backface: "#e8e4d8",
      textDark: "#333333", // Assuming some dark hex
      textLabel: "#555555", // Assuming some label hex
      circleBorder: "#bbbbbb",
      verseNumberText: "#222222",
      s1AnaLabelBg: "#ffffff",
      s1AnaLabelText: "#000000",
      s1AnaLabelBorder: "#dddddd",
      s2FrameBg: "#f4f4f4",
      boarderFrame: "#ffffff",
      boarderHalo: "#ADADAD",
      innerCard: "#eeeeee",
      sectionBgTexture: "#fcfcfc",
      hollowConnectorInnerBg: "#e3e3e3",
      maroonTheme: MAROON_THEME,
      greenTheme: GREEN_THEME,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: BLUE_THEME,
      s2Group1Bg: MAROON_THEME,
      s2Group2Bg: GREEN_THEME,
      s2Group3Bg: MAROON_THEME,
      /**
       * Bracket color sequence for SideCurves, outermost → center.
       * Index 0–2 = outer brackets (blue → maroon → maroon).
       * Index 3   = center bracket (green).
       */
      curveColors: [
        { color: BLUE_THEME, fillColor: CAPSULE_BG_6_19 },
        { color: MAROON_THEME, fillColor: CAPSULE_BG_7_8_17_18 },
        { color: MAROON_THEME, fillColor: CAPSULE_BG_9_10_15_16 },
        { color: GREEN_THEME, fillColor: CAPSULE_BG_12_14 },
      ],
    },
    capsuleBorderWidth: 0.0039,
    circleBorderWidth: 0.0035,
    verseRadius: 0.04,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,
      scallopX: 0.015, // SCALLOP_RADIUS_X
      scallopY: 0.015, // SCALLOP_RADIUS_Y
      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
    s1NeonConfig: {
      haloPad: 0.014,
      haloZ: -0.001,
      haloOpacity: 0.36,
      haloEmissiveIntensity: 4.2,
      outerHaloPad: 0.026,
      outerHaloOpacity: 0.16,
      outerHaloEmissiveIntensity: 2.4,
      topLabelGapWidth: 0.425,
      topLabelGapPadding: 0.01,
      topLabelGapHeight: 0.058,
      topLabelGapYOffset: 0.022,
    },
  },
  params: {
    s1Top: -0.06,
    s1Pad: 0.045,
    gap: 0.02,
    s1AnaGap: 0.05,
    smallBoxH: 0.07,
    anaAyetH: 0.132,
    gapBetweenS1andS2: 0.09,
    s2VerticalPad: 0.054,
    bigBoxH: 0.125,
    groupGap: 0.035,
    groupPad: 0.012,
    groupPadBottom: 0.012,
    s2Gap: 0.02,
    smallBoxH2: 0.075,
    middleExtraGap: 0.03,
    s2PadLeftRight: 0.035,
    g2Scale: 0.01,
    s1BorderWidth: 0,
    anaAyetTabW: 0.2,
    anaAyetTabH: 0.032,
    anaAyetTabBorderWidth: 0.0035,
    anaAyetLabelDrop: 0.015,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.01,
    labelHitboxWidth: 0.43,
  },
  sections: [
    {
      id: "section1",
      type: "gridWithAnaAyet",
      labelKey: "section1Label",
      verses: [2, 1, 4, 3],
      anaAyet: 5,
      bgThemeKey: "s1InnerBorder",
      cameraTarget: { y: 2, fov: 20, tilt: -1.3 },
    } as GridSectionConfig,
    {
      id: "section2",
      type: "verticalGroups",
      topLabelKey: "section2TopLabel",
      bottomLabelKey: "section2BottomLabel",
      introVerse: 6,
      outroVerse: 19,
      introOutroBgThemeKey: "s2IntroOutroBg",
      groups: [
        {
          verseIds: [8, 7, 10, 9],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
        },
        {
          verseIds: [12, 11, 14, 13],
          isPushedIn: true,
          isCenter: true,
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
        },
        {
          verseIds: [16, 15, 18, 17],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group3Bg",
        },
      ],
      subCameraTargets: {
        top: { y: 1.4, fov: 25, tilt: -1.3 },
        center: { y: 1, fov: 30, tilt: -1.5 },
        bottom: { y: 0.7, fov: 35, tilt: -1.5 },
      },
    } as VerticalGroupsSectionConfig,
  ],
  animations: {
    introCamera: {
      introPosition: [-1.221, 0.343, 2.756],
      introTarget: [0.492, 0.176, 1.237],
      scrollOffset: [0.5, 1.5, 0],
      targetFollow: 1,
      allowOrbit: false,
      handoffDurationMs: 800,
    },
    scrollTimeline: {
      intro: { start: 0, end: 15 },
      ambient: { start: 15, end: 50 },
      handoff: { start: 50, end: 60 },
      story: { start: 60, end: 100 },
    },
    scrollLock: {
      lockPositionPercentage: 0.6,
      effortRequired: 3000,
      grabRangePixels: 50,
    },
    ambientMediaKeys: [
      "section1_start",
      "section1_zoom",
      "section1",
      "section1_step1",
      "section1_step2",
      "section1_step3",
      "section2_top",
      "section2_center",
      "section2_bottom",
    ],
    computeFoldYPositions: (lm) => [
      lm.s2Top + 0.09 / 2, // 0.09 is gapBetweenS1andS2
      lm.v6Y - lm.bigBoxH - lm.groupGap / 2,
      lm.g1Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
      lm.g1Y - lm.groupH - (lm.groupGap + 0.033) / 2,
      lm.g2Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
      lm.g2Y - lm.groupH - (lm.groupGap + 0.033) / 2,
      lm.g3Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
      lm.g3Y - lm.groupH - lm.groupGap / 2,
    ],
    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.93 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: +1, angleFactor: -1 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -1 },
        ],
      },
      {
        id: "start",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: +1, angleFactor: -1 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -1 },
        ],
      },
      {
        id: "outer-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: -1 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 0 },
        ],
      },
      {
        id: "inner-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: -1 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
    ],
  },
};

// ----------------------------------------------------------------------------
// LEGACY CONSTANTS & COMPATIBILITY LAYER
// To keep existing components unbroken until they are updated
// ----------------------------------------------------------------------------
export const ALAQ_LAYOUT_CONFIG = ALAK_LAYOUT_CONFIG;
export const BASE_PAGE_WIDTH = ALAK_LAYOUT_CONFIG.dimensions.paperWidth;
export const PAGE_HEIGHT = ALAK_LAYOUT_CONFIG.dimensions.paperHeight;
export const SCENE_CENTER_Y_OFFSET =
  ALAK_LAYOUT_CONFIG.dimensions.sceneCenterYOffset;
export const CAPSULE_BORDER_WIDTH =
  ALAK_LAYOUT_CONFIG.styling.capsuleBorderWidth;
export const CIRCLE_BORDER_WIDTH = ALAK_LAYOUT_CONFIG.styling.circleBorderWidth;
export const VERSE_5_6_19_RADIUS = ALAK_LAYOUT_CONFIG.styling.verseRadius;
export const OPPOSITE_VERSE_CONNECTOR = {
  paddingX: 0.0065,
  paddingY: 0.0065,
  radius: ALAK_LAYOUT_CONFIG.styling.oppositeVerseConnectorRadius,
};
export const VERSE_TEXT_RIGHT_PADDING = 0.003;
export const TOP_LABEL_WIDTH =
  ALAK_LAYOUT_CONFIG.styling.s1NeonConfig.topLabelGapWidth;
export const S2_LABEL_WIDTH = 0.47;
export const S2_LABEL_Y_OFFSET = 0.004;
export const SMALL_TEXT_SHIFT = -0.018;
export const BIG_VERSE_VERTICAL_SHIFT = -0.006;
export const SMALL_VERSE_VERTICAL_SHIFT = -0.005;
export const S1_NEON_CONFIG = ALAK_LAYOUT_CONFIG.styling.s1NeonConfig;

// ----------------------------------------------------------------------------
// SECTION: LAYOUT MATH ENGINE
// ----------------------------------------------------------------------------
export function createLayoutMath(
  config: SurahLayoutConfig<AlakLayoutParams>,
  dynamicPageWidth: number,
) {
  const p = config.params;
  const PAGE_WIDTH = dynamicPageWidth;
  const PW = PAGE_WIDTH;
  const PADDING = config.dimensions.padding;
  const CONTENT_W = PW - PADDING * 2;
  const START_X = PADDING;

  // --- Section 1 ---
  const s1H = p.s1Pad * 2 + (p.smallBoxH * 2 + p.gap) + p.s1AnaGap + p.anaAyetH;

  // --- Section 2 ---
  // groupH, hasIntroOutro, and s2H must be computed BEFORE s2Top because
  // the centering formula (hasS1 === false branch) depends on s2H.

  const getGroupH = (rows: number, extraGap: number = 0) => {
    const s2VertGap = p.s2VerticalRowGap ?? p.s2Gap;
    return (
      p.groupPad +
      p.groupPadBottom +
      (rows * p.smallBoxH2 + Math.max(0, rows - 1) * s2VertGap) +
      extraGap
    );
  };

  const groupH = getGroupH(2);

  // ── Dynamic group heights — driven by the actual groupRows array length ──
  // groupRows[i] specifies how many rows of capsules group i contains.
  // Any group not listed in groupRows defaults to 2 rows (backward-compat).
  const numGroups = p.groupRows ? p.groupRows.length : 3;
  const dynamicGroupHeights: number[] = Array.from(
    { length: numGroups },
    (_, i) => getGroupH(p.groupRows?.[i] ?? 2),
  );

  // Legacy aliases kept for backward-compatibility with Alak / Ayat al-Kursi.
  const g0H = dynamicGroupHeights[0] ?? getGroupH(2);
  const g1H = dynamicGroupHeights[1] ?? getGroupH(2);
  const g2H = dynamicGroupHeights[2] ?? getGroupH(2);

  const totalGroupsH = dynamicGroupHeights.reduce((sum, h) => sum + h, 0);

  // When hasIntro is false there are no intro/outro verse boxes, so the two
  // bigBoxH slots and their two flanking groupGaps are collapsed to zero.
  // When hasIntro is true the formula is mathematically identical to before.
  const hasIntroOutro = config.features.hasIntro;

  // Number of inter-group gaps = numGroups - 1 (minimum 0).
  const interGroupGaps = Math.max(0, numGroups - 1);

  const s2H = hasIntroOutro
    ? p.s2VerticalPad * 2 +
      p.bigBoxH * 2 +
      p.groupGap * (interGroupGaps + 2) + // gaps between groups + 2 flanking
      totalGroupsH +
      p.middleExtraGap * 2
    : p.s2VerticalPad * 2 +
      p.groupGap * interGroupGaps + // gaps *between* groups
      totalGroupsH +
      p.middleExtraGap * 2;

  // Detect whether a gridWithAnaAyet (Section 1) is part of this config.
  // If not, we center s2 on the paper rather than chaining from s1Top.
  const hasS1 = config.sections.some((s) => s.type === "gridWithAnaAyet");

  // s2Top: the Y coordinate of the top of the vertical-groups block.
  //   hasS1 === true  → Alak path (identical to original formula)
  //   hasS1 === false → center the block vertically on the paper
  const s2Top = hasS1
    ? p.s1Top - s1H - p.gapBetweenS1andS2 // Alak: unchanged
    : // Ayat al-Kursi / Ahzab: camera lives in 0 → -PAGE_HEIGHT, center is -(height/2).
      // Shift up by s2H/2 so the block straddles that center symmetrically.
      -(config.dimensions.paperHeight / 2) +
      s2H / 2 +
      config.dimensions.sceneCenterYOffset;

  // --- Element Y Positions ---
  // v6Y marks the intro-verse top; when there is no intro verse the groups
  // start immediately after s2VerticalPad (same anchor, no bigBoxH shift).
  const v6Y = s2Top - p.s2VerticalPad;
  const baseG1Y = hasIntroOutro
    ? v6Y - p.bigBoxH - p.groupGap // Alak: identical to original
    : v6Y; // Ayat al-Kursi / Ahzab: groups slide up

  // Build all group Y positions dynamically.
  // groupYPositions[0] = baseG1Y; each subsequent group steps down by the
  // previous group's height + the inter-group gap (with middleExtraGap).
  const dynamicGroupYPositions: number[] = [];
  dynamicGroupYPositions[0] = baseG1Y;
  const s2Config = config.sections.find((s) => s.type === "verticalGroups") as
    | VerticalGroupsSectionConfig
    | undefined;
  const s2Groups = s2Config?.groups ?? [];
  for (let i = 1; i < numGroups; i++) {
    const pushDown = s2Groups[i]?.pushDown ?? 0;
    dynamicGroupYPositions[i] =
      dynamicGroupYPositions[i - 1] -
      dynamicGroupHeights[i - 1] -
      (p.groupGap + p.middleExtraGap) -
      pushDown;
  }

  // Allow independent vertical shifting for the very first group
  if (s2Groups[0]?.pushDown) {
    dynamicGroupYPositions[0] -= s2Groups[0].pushDown;
  }

  // Legacy aliases for Alak / Ayat al-Kursi backward compatibility.
  const baseG2Y = dynamicGroupYPositions[1] ?? baseG1Y;
  const baseG3Y = dynamicGroupYPositions[2] ?? baseG2Y;

  // v19Y position is always computed (keeps type consistent) but only rendered
  // when hasIntro is true.
  const lastGroupY = dynamicGroupYPositions[numGroups - 1] ?? baseG1Y;
  const lastGroupH = dynamicGroupHeights[numGroups - 1] ?? g0H;
  const baseV19Y = hasIntroOutro
    ? lastGroupY - lastGroupH - p.groupGap
    : lastGroupY - lastGroupH; // not rendered; safe sentinel

  return {
    PAGE_WIDTH,
    PAGE_HEIGHT: config.dimensions.paperHeight,
    PW,
    PADDING,
    CONTENT_W,
    START_X,

    // Section 1
    sectionW: CONTENT_W,
    innerW: CONTENT_W - p.s1Pad * 2,
    innerHalfW: (CONTENT_W - p.s1Pad * 2 - p.gap) / 2,
    s1Top: p.s1Top,
    s1Pad: p.s1Pad,
    gap: p.gap,
    s1AnaGap: p.s1AnaGap,
    smallBoxH: p.smallBoxH,
    anaAyetH: p.anaAyetH,
    s1H,

    // Section 2
    s2Top,
    s2Pad: p.s2VerticalPad,
    s2PadTop: p.s2VerticalPad,
    s2PadBottom: p.s2VerticalPad,
    bigBoxH: p.bigBoxH,
    groupGap: p.groupGap,
    groupPad: p.groupPad,
    s2Gap: p.s2Gap,
    smallBoxH2: p.smallBoxH2,
    g2Scale: p.g2Scale,
    outerScale: p.outerScale ?? 0,
    groupH,
    s2H,

    s2BackgroundTexture: (
      config.sections.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundTexture,
    s2BackgroundScaleX: (
      config.sections.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundScaleX,
    s2BackgroundScaleY: (
      config.sections.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundScaleY,

    v6Y,
    g1Y: baseG1Y,
    g2Y: baseG2Y,
    g3Y: baseG3Y,
    v19Y: baseV19Y,
    baseG1Y,
    baseG3Y,

    groupInnerW: CONTENT_W - p.s2PadLeftRight * 2 - p.groupPad * 2,
    groupInnerHalfW:
      (CONTENT_W - p.s2PadLeftRight * 2 - p.groupPad * 2 - p.s2Gap) / 2,

    s2PadLeftRight: p.s2PadLeftRight,
    s2VerticalRowGap: p.s2VerticalRowGap ?? p.s2Gap,
    g2Shrink: p.g2Shrink,
    outerShrink: p.outerShrink ?? 0,
    s1BorderWidth: p.s1BorderWidth,
    anaAyetTabW: p.anaAyetTabW,
    anaAyetTabH: p.anaAyetTabH,
    anaAyetTabBorderWidth: p.anaAyetTabBorderWidth,
    anaAyetLabelDrop: p.anaAyetLabelDrop,
    sgPad: p.sgPad,
    sgBorderWidth: p.sgBorderWidth,
    boxExtOffset: p.boxExtOffset,
    extraRowGap: p.extraRowGap,
    verseTextScale: p.verseTextScale ?? undefined,

    // ── Dynamic layout metadata consumed by SideCurves & SectionTwo ──────
    // NOTE: satisfies Record<string, number> is removed because these new
    // fields are non-number. We use an explicit return type instead.
    hasIntroOutro, // boolean
    // Fully dynamic — length matches the actual number of groups defined.
    groupYPositions: dynamicGroupYPositions as number[],
    groupHeights: dynamicGroupHeights as number[],
  };
}

export const layoutMath = createLayoutMath(ALAK_LAYOUT_CONFIG, BASE_PAGE_WIDTH);
export type LayoutConfig = ReturnType<typeof createLayoutMath>;

export const PAGE_WIDTH = layoutMath.PAGE_WIDTH;
export const PW = layoutMath.PW;
export const PADDING = layoutMath.PADDING;
export const CONTENT_W = layoutMath.CONTENT_W;
export const START_X = layoutMath.START_X;

// createFoldYPositions and FOLD_Y_POSITIONS were removed and moved to ALAK_LAYOUT_CONFIG.animations.computeFoldYPositions

// ============================================================================
// LAYOUT ENGINE
// ============================================================================

export interface SurahTransforms {
  sections: SectionTransforms[];
}

export function buildSurahTransforms(
  lm: LayoutConfig,
  startX: number,
  config: SurahLayoutConfig<AlakLayoutParams>,
): SurahTransforms {
  const sections: SectionTransforms[] = [];

  // Build transforms for each section dynamically based on its type
  config.sections.forEach((section) => {
    if (section.type === "gridWithAnaAyet") {
      const s1Config = section as GridSectionConfig;
      const s1BaseX = startX + lm.s1Pad;
      const ANA_AYET_Y_OFFSET = -0.01;
      const anaAyetY =
        lm.s1Top -
        lm.s1Pad -
        (lm.smallBoxH * 2 + lm.gap) -
        lm.s1AnaGap +
        ANA_AYET_Y_OFFSET;

      const s1Verses: Record<number, ElementTransform> = {};
      s1Config.verses.forEach((verseId, i) => {
        const isRightCol = i % 2 !== 0;
        const isBottomRow = i >= 2;
        s1Verses[verseId] = {
          x: s1BaseX + (isRightCol ? lm.innerHalfW + lm.gap : 0),
          y: lm.s1Top - lm.s1Pad - (isBottomRow ? lm.smallBoxH + lm.gap : 0),
          z: 0.002,
          w: lm.innerHalfW,
          h: lm.smallBoxH,
        };
      });

      const s1Connectors: RowConnectorTransform[] = [];
      for (let r = 0; r < 2; r++) {
        const leftV = s1Verses[s1Config.verses[r * 2]];
        const rightV = s1Verses[s1Config.verses[r * 2 + 1]];
        if (leftV && rightV) {
          s1Connectors.push({
            x: leftV.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
            y: leftV.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
            z: 0.0015,
            w:
              rightV.x +
              rightV.w -
              leftV.x +
              OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
            h: leftV.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
          });
        }
      }

      sections.push({
        frameX: startX,
        frameY: lm.s1Top,
        frameW: lm.sectionW,
        frameH: lm.s1H,
        verses: s1Verses,
        rowConnectors: s1Connectors,
        anaAyet: {
          x: s1BaseX,
          y: anaAyetY,
          z: 0.002,
          w: lm.innerW,
          h: lm.anaAyetH,
        },
        anaAyetTabX: s1BaseX + lm.innerW / 2,
        anaAyetTabY: anaAyetY + 0.015,
        anaAyetTabW: lm.anaAyetTabW,
        anaAyetTabH: lm.anaAyetTabH,
        anaAyetTabBorderWidth: lm.anaAyetTabBorderWidth,
        anaAyetLabelDrop: lm.anaAyetLabelDrop,
        borderWidth: lm.s1BorderWidth,
        labelPinY: lm.s1Top,
      });
    } else if (section.type === "verticalGroups") {
      const s2Config = section as VerticalGroupsSectionConfig;
      const s2InnerW = lm.sectionW - lm.s2PadLeftRight * 2;
      const s2BaseX = startX + lm.s2PadLeftRight;

      const S2_MIRROR_SHIFT = 0.015;
      const shiftedTop = lm.s2Top - S2_MIRROR_SHIFT;
      const shiftedBot = lm.s2Top - lm.s2H + S2_MIRROR_SHIFT;
      const shiftedH = lm.s2H - 2 * S2_MIRROR_SHIFT;

      const bw = lm.sgBorderWidth;
      const connX = s2BaseX - lm.sgPad;
      const connW = s2InnerW + lm.sgPad * 2;

      // ── Group Y positions come from the layout math engine ────────────────
      const groupYPositions = lm.groupYPositions;

      const groups: GroupTransforms[] = s2Config.groups.map((group, gIdx) => {
        const groupY = groupYPositions[gIdx];
        const isPushedIn = group.isPushedIn ?? false;
        const scaleAmount =
          group.customScale ?? (isPushedIn ? lm.g2Scale : lm.outerScale);
        const groupGapAmount = group.customGap ?? lm.s2Gap;
        const gInnerW = s2InnerW - scaleAmount * 2;
        const gBaseX = s2BaseX + scaleAmount;

        const gHalfW = (gInnerW - lm.groupPad * 2 - groupGapAmount) / 2;
        const extraRowGap = group.extraRowGap ?? 0;

        const verses: Record<number, ElementTransform> = {};
        group.verseIds.forEach((verseId, i) => {
          const isRightCol = i % 2 !== 0;
          // Dynamic row index: each pair of capsules (left+right) occupies one row.
          const rowIndex = Math.floor(i / 2);
          const rowOffset =
            rowIndex * (lm.smallBoxH2 + lm.s2VerticalRowGap + extraRowGap);
          verses[verseId] = {
            x:
              gBaseX +
              lm.groupPad +
              (isRightCol ? gHalfW + groupGapAmount : 0),
            y: groupY - lm.groupPad - rowOffset,
            z: 0.003,
            w: gHalfW,
            h: lm.smallBoxH2,
          };
        });

        // Dynamic row connectors — one per row (pair of capsules).
        const numRows = Math.ceil(group.verseIds.length / 2);
        const rowConnectors: RowConnectorTransform[] = [];
        for (let r = 0; r < numRows; r++) {
          const leftV = verses[group.verseIds[r * 2]];
          const rightV = verses[group.verseIds[r * 2 + 1]];
          if (leftV && rightV) {
            rowConnectors.push({
              x: leftV.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
              y: leftV.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
              z: 0.0025,
              w:
                rightV.x +
                rightV.w -
                leftV.x +
                OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
              h: leftV.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
            });
          }
        }

        return {
          frameX: gBaseX,
          frameY: groupY,
          frameW: gInnerW,
          frameH: lm.groupHeights[gIdx] ?? lm.groupH,
          isPushedIn,
          isCenter: group.isCenter ?? false,
          verses,
          rowConnectors,
          topLabelConfig: group.topLabelConfig,
          backgroundTexture: group.backgroundTexture,
          backgroundScaleX: group.backgroundScaleX,
          backgroundScaleY: group.backgroundScaleY,
          backgroundOffsetX: group.backgroundOffsetX,
          backgroundOffsetY: group.backgroundOffsetY,
        };
      });

      // ── Base section transform (always present) ───────────────────────────
      const sectionTransform: SectionTransforms = {
        frameX: startX,
        frameW: lm.sectionW,
        shiftedTop,
        shiftedBot,
        shiftedH,
        connectorX: connX,
        connectorW: connW,
        borderWidth: bw,
        groups,
        innerW: s2InnerW,
        baseX: s2BaseX,
        topLabelPinY: shiftedTop,
        bottomLabelPinY: shiftedBot,
      };

      // ── Intro/outro verse boxes and frame connectors — ONLY when hasIntro ─
      if (config.features.hasIntro) {
        const tBox_Y = shiftedTop;
        const outerSectionH = tBox_Y - (lm.g1Y - lm.groupH - lm.boxExtOffset);
        const tBox_H = outerSectionH;
        const bBox_Y = lm.g3Y + lm.boxExtOffset;
        const bBox_H = outerSectionH;

        sectionTransform.topConnectorY = tBox_Y;
        sectionTransform.topConnectorH = tBox_H;
        sectionTransform.bottomConnectorY = bBox_Y;
        sectionTransform.bottomConnectorH = bBox_H;
        sectionTransform.introVerse = {
          x: s2BaseX,
          y: lm.v6Y,
          z: 0.003,
          w: s2InnerW,
          h: lm.bigBoxH,
        };
        sectionTransform.outroVerse = {
          x: s2BaseX,
          y: lm.v19Y,
          z: 0.003,
          w: s2InnerW,
          h: lm.bigBoxH,
        };
      }

      sections.push(sectionTransform);
    }
  });

  return { sections };
}

// Output is just { sections } now
export const SURAH_TRANSFORMS = buildSurahTransforms(
  layoutMath,
  START_X,
  ALAK_LAYOUT_CONFIG,
);

export function getPopUpTrackerPosition(
  verses: { y: number; h: number }[],
  isGlobal = false,
  s1Top = 0,
  pageWidth = PAGE_WIDTH,
): [number, number] {
  if (isGlobal) {
    return [0, s1Top + 0.25];
  }
  const centerY = verses[0].y - verses[0].h / 2;
  const btnX = -pageWidth / 2 - 0.05;
  return [btnX, centerY];
}
