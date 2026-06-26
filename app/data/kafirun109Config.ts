import type { SurahLayoutConfig, VerticalGroupsSectionConfig } from "./schema";
import type { AlakLayoutParams } from "./SurahConfig";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

const OUTER_GROUP_BG = "#FDF4CA"; // Yellow (Top and Bottom groups)
const OUTER_GROUP_BORDER = "#BE9E63"; // Lighter brown/gold border
const CENTER_GROUP_BG = "#eaf2db"; // Green (Middle group)
const CENTER_GROUP_BORDER = "#5E7367"; // Dark Green border

export const KAFIRUN_109_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "kafirun109",
  title: "Kafirun Suresi",
  heroTitle: "Kafirun",
  heroSubtitle: "Suresi",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 0.8,
    sceneCenterYOffset: 0.0,
    padding: 0.15,
    scrollPages: 1.5,
  },

  specialVerses: {
    versePairings: {
      2: 3,
      3: 2,
      4: 5,
      5: 4,
    },
  },

  verseOverrides: {
    1: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
      textColor: "#A30000",
    },
    2: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    3: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    6: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
      textColor: "#A30000",
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
      hollowConnectorInnerBg: "#FAF7F2", // No connector filling background (matches paper)
      maroonTheme: OUTER_GROUP_BG,
      greenTheme: CENTER_GROUP_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B",
      s2Group1Bg: OUTER_GROUP_BG,
      s2Group2Bg: CENTER_GROUP_BORDER,
      s2Group3Bg: OUTER_GROUP_BG,

      sectionBackgrounds: ["#DCE8DC", "#EDD8DF", "#DCE8DC"],

      curveColors: [
        {
          color: OUTER_GROUP_BORDER,
          fillColor: OUTER_GROUP_BG,
          bowGap: 0.45,
          innerBowGap: 0.44,
        },
        { color: CENTER_GROUP_BORDER, fillColor: CENTER_GROUP_BG },
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

    s2VerticalPad: 0.02,
    bigBoxH: 0.07,
    groupGap: 0.025,
    groupPad: 0.012,
    groupPadBottom: 0.012,
    s2Gap: 0.005,
    s2VerticalRowGap: 0.022,
    smallBoxH2: 0.085,
    middleExtraGap: 0,
    s2PadLeftRight: 0.028,
    g2Scale: 0.02,
    outerScale: -0.11,
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
    verseTextScale: 1.2,
    translationVerseTextScale: 0.8,
    groupRows: [1, 2, 1],
    outerCurveXOffset: 0.07, // Reverted offset
    centerCurveXOffset: -0.02,
  },

  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      backgroundTexture: "/ayatalKursi/frame-section-1.svg",
      backgroundScaleX: 1.15,
      backgroundScaleY: 1.25,
      groupElevation: "unified",
      groups: [
        {
          verseIds: [1],
          columns: 1, // Make it a single column
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
        },
        {
          verseIds: [3, 2, 5, 4], // mapping according to image
          isPushedIn: true,
          isCenter: true,
          dragBehavior: "individual",
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
        },
        {
          verseIds: [6],
          columns: 1, // Make it a single column
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group3Bg",
        },
      ],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      const fold1 = (lm.g1Y - lm.groupHeights[0] + lm.g2Y) / 2;
      const fold2 =
        lm.g2Y - lm.groupPad - lm.smallBoxH2 - lm.s2VerticalRowGap / 2;
      const fold3 = (lm.g2Y - lm.groupHeights[1] + lm.g3Y) / 2;

      return [fold1, fold2, fold3];
    },

    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.4 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.6 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
    ] as const,

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

export const KAFIRUN_109_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "سورة الكافرون",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [{ number: 1, text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ" }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 3, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 2, text: "لَا أَعْبُدُ مَا تَعْبُدُونَ" },
          { number: 5, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 4, text: "وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [{ number: 6, text: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ" }],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Surah Al-Kafirun",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [{ number: 1, text: "Say, O disbelievers," }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 3, text: "Nor are you worshippers of what I worship." },
          { number: 2, text: "I do not worship what you worship." },
          { number: 5, text: "Nor will you be worshippers of what I worship." },
          {
            number: 4,
            text: "Nor will I be a worshipper of what you worship.",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 6,
            text: "For you is your religion, and for me is my religion.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Kâfirûn Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [{ number: 1, text: "De ki: Ey kâfirler!" }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 3, text: "Siz de benim taptığıma tapıcılar değilsiniz." },
          { number: 2, text: "Ben sizin taptıklarınıza tapmam." },
          { number: 5, text: "Siz de benim taptığıma tapacak değilsiniz." },
          {
            number: 4,
            text: "Ben asla sizin taptıklarınıza tapacak değilim.",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 6, text: "Sizin dininiz size, benim dinim banadır." },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: KAFIRUN_109_TEXT_AR,
  en: KAFIRUN_109_TEXT_EN,
  tr: KAFIRUN_109_TEXT_TR,
};
