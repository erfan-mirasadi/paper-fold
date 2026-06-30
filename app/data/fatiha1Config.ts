import type { SurahLayoutConfig, VerticalGroupsSectionConfig } from "./schema";
import type { AlakLayoutParams } from "./SurahConfig";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

import {
  ORANGE_THEME,
  MAROON_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_9_10_15_16,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
} from "./theme";

export const FATIHA_1_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "fatiha1",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: false,
  },
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 1.5,
  },
  specialVerses: {
    versePairings: {
      3: 4,
      4: 3,
      6: 7,
      7: 6,
    },
  },
  verseOverrides: {
    1: {
      customFrameSvg: "/fatiha/bismillah-frame-2.svg",
      expandW: 0.035,
      expandH: 0.01,
      isPill: false,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    2: {
      isPill: false,
      expandH: 0.025, // Height of big boxes in Alak (intro/outro)
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    3: {
      bg: CAPSULE_BG_9_10_15_16, // Blue theme
      border: MAROON_THEME, // Slate blue border
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    4: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    5: {
      isPill: false,
      expandH: 0.025, // Height of big boxes in Alak (intro/outro)
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    6: {
      expandH: 0.07, // Double height
      expandW: 0.02,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      expandH: 0.07, // Double height
      expandW: 0.02,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
  },
  styling: {
    colors: {
      paperBase: "#FAF7F2",
      shadow: "#000000",
      backface: "#EDE8D6",
      textDark: "#333333",
      textLabel: "#555555",
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
      greenTheme: ORANGE_THEME,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: ORANGE_THEME,
      s2Group1Bg: ORANGE_THEME,
      s2Group2Bg: MAROON_THEME,
      s2Group3Bg: ORANGE_THEME,
      curveColors: [
        { color: "transparent", fillColor: "transparent" }, // Pair 0 (1 to 7-6) hidden
        {
          color: ORANGE_THEME,
          fillColor: CAPSULE_BG_6_19,
          inwardOffset: 0.035,
          bowGap: 0.12,
          innerBowGap: 0.12,
        }, // Pair 1 (2 to 5) shown
        { color: "transparent", fillColor: "transparent" }, // Center pair (4-3) hidden
      ],
    },
    capsuleBorderWidth: 0.0039,
    circleBorderWidth: 0.0035,
    verseRadius: 0.04,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,
      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
  },
  params: {
    s1Top: 0.5,
    s1Pad: 0.01,
    gap: 0.01,
    s1AnaGap: 0.01,
    smallBoxH: 0.04,
    anaAyetH: 0.04,
    gapBetweenS1andS2: 0.01,
    s2VerticalPad: 0.1,
    bigBoxH: 0.07,
    groupGap: 0.05,
    groupPad: 0.02,
    groupPadBottom: 0.02,
    s2Gap: 0.03,
    s2VerticalRowGap: 0.02,
    smallBoxH2: 0.075,
    middleExtraGap: 0.01,
    s2PadLeftRight: 0.08,
    g2Scale: 0.01,
    outerScale: 0.0,
    s1BorderWidth: 0,
    capsuleLabelW: 0.2,
    capsuleLabelH: 0.032,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.015,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.01,
    labelHitboxWidth: 0.43,
    groupRows: [1, 1, 1, 1, 3], // Extra rows for group 4 to account for expandH
  },
  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      backgroundTexture: "/ayatalKursi/frame-section-1.svg",
      backgroundScaleX: 0.9,
      backgroundScaleY: 1.1,
      backgroundSolidScaleX: 0.6,
      backgroundSolidScaleY: 1,
      groupElevation: "perGroup",
      svgOverlays: [
        {
          src: "/fatiha/section-frame.svg",
          anchorGroupIndex: 1,
          anchorEdge: "top",
          scaleX: 1.1,
          scaleY: 0.45,
          offsetX: 0,
          offsetY: -0.21,
          rotationZ: 0,
          renderOrder: 3,
        },
        {
          src: "/fatiha/section-frame.svg",
          anchorGroupIndex: 3,
          anchorEdge: "top",
          scaleX: 1.1,
          scaleY: 0.6,
          offsetX: 0,
          offsetY: -0.28,
          rotationZ: 0,
          renderOrder: 3,
        }
      ],
      groups: [
        {
          verseIds: [1],
          columns: 1,
          isPushedIn: false,
          isCenter: false,
          dragBehavior: "individual",
        },
        {
          verseIds: [2],
          columns: 1,
          isPushedIn: false,
          isCenter: false,
          dragBehavior: "individual",
        },
        {
          verseIds: [4, 3],
          columns: 2,
          isPushedIn: false,
          isCenter: false,
          dragBehavior: "pair",
        },
        {
          verseIds: [5],
          columns: 1,
          isPushedIn: false,
          isCenter: false,
          dragBehavior: "individual",
        },
        {
          verseIds: [7, 6],
          columns: 2,
          isPushedIn: false,
          isCenter: false,
          dragBehavior: "pair",
        },
      ],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],
  animations: {
    computeFoldYPositions: (lm) => {
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold2 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      const fold3 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
        2;
      const fold4 =
        (lm.groupYPositions[3] - lm.groupHeights[3] + lm.groupYPositions[4]) /
        2;
      return [fold1, fold2, fold3, fold4];
    },
    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.3 },
          { direction: -1, angleFactor: 0.3 },
          { direction: 1, angleFactor: 0.3 },
          { direction: -1, angleFactor: 0.3 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
    ],
    scrollTimeline: {
      intro: { start: 0, end: 10 },
      ambient: { start: 10, end: 40 },
      handoff: { start: 40, end: 55 },
      story: { start: 55, end: 100 },
    },
    scrollLock: {
      lockPositionPercentage: 0.55,
      effortRequired: 2500,
      grabRangePixels: 50,
    },
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA
// ---------------------------------------------------------------------------

export const FATIHA_1_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "الفاتحة",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" }],
      },
      {
        verses: [{ number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" }],
      },
      {
        verses: [
          { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
          { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
        ],
      },
      {
        verses: [
          { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          },
          { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_1_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Al-Fatiha",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "[All] praise is [due] to Allah, Lord of the worlds -",
          },
        ],
      },
      {
        verses: [
          { number: 4, text: "Sovereign of the Day of Recompense." },
          {
            number: 3,
            text: "The Entirely Merciful, the Especially Merciful,",
          },
        ],
      },
      {
        verses: [
          { number: 5, text: "It is You we worship and You we ask for help." },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
          },
          { number: 6, text: "Guide us to the straight path -" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_1_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Fatiha Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Bismillahirrahmanirrahim" }],
      },
      {
        verses: [{ number: 2, text: "Elhamdülillahi rabbil alemin" }],
      },
      {
        verses: [
          { number: 4, text: "Maliki yevmiddin" },
          { number: 3, text: "Errahmanirrahim" },
        ],
      },
      {
        verses: [{ number: 5, text: "İyyake na'budu ve iyyake nestain" }],
      },
      {
        verses: [
          {
            number: 7,
            text: "Sıratallezine en'amte aleyhim, gayril mağdubi aleyhim veleddallin",
          },
          { number: 6, text: "İhdinas sıratal müstakim" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_1_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: FATIHA_1_TEXT_AR,
  en: FATIHA_1_TEXT_EN,
  tr: FATIHA_1_TEXT_TR,
};
