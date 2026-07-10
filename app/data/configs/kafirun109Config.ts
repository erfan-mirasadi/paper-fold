import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import { CAPSULE_BG_6_19, ORANGE_THEME } from "../theme";

const OUTER_GROUP_BG = "#FDF4CA"; // Yellow (top and bottom full-width verses)
const CENTER_GROUP_BG = "#eaf2db"; // Green (middle 2-col group)
const CENTER_GROUP_BORDER = "#5E7367"; // Dark green border

export const KAFIRUN_109_CONFIG: SurahLayoutConfig = {
  id: "kafirun109",
  title: "Kafirun Suresi",
  heroTitle: "Kafirun",
  heroSubtitle: "Suresi",

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
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    middleFoldVerses: { left: [3, 5], right: [2, 4] },
    versePairings: {
      2: 3,
      3: 2,
      4: 5,
      5: 4,
    },
  },

  verseOverrides: {
    1: {
      isPill: false,
      expandW: 0.2,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
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
      isPill: false,
      expandW: 0.2,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
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
      hollowConnectorInnerBg: "#FAF7F2",
      maroonTheme: OUTER_GROUP_BG,
      greenTheme: CENTER_GROUP_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B",
      s2Group1Bg: OUTER_GROUP_BG,
      s2Group2Bg: CENTER_GROUP_BORDER,
      s2Group3Bg: OUTER_GROUP_BG,
      curveColors: [
        {
          color: ORANGE_THEME,
          fillColor: CAPSULE_BG_6_19,
          bowGap: 0.25,
          innerBowGap: 0.24,
          tipThickness: 0.135,
          topAnchorXOffset: -0.01,
          topAnchorYOffset: -0.001,
          bottomAnchorYOffset: 0.001,
          bottomAnchorXOffset: -0.01,
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

  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  globalSettings: {
    capsuleHeight: 0.075, // was smallBoxH2
    columnGap: 0.02, // was s2Gap (horizontal gap between the 2 columns)
    rowGap: 0.02, // was s2VerticalRowGap (defaults to s2Gap)
    blockGap: 0.06, // was groupGap (gap between the 3 blocks)
    sectionPadX: 0.028, // was s2PadLeftRight
    blockPadding: 0.012, // was groupPad / groupPadBottom
    sectionBorderWidth: 0.006, // was sgBorderWidth
  },

  // Section-wide resting-state background — was incorrectly attached to
  // block0 alone, which also made it (wrongly) render as block0's own small
  // elevated/all-sections frame instead of the whole section's.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 1.1,
    scaleY: 1.4,
    offsetY: 0.03,
  },

  blocks: [
    // Block 0 — Verse 1 (full-width, yellow "Say" verse)
    {
      id: "section2", // reuse same id so elevation/drag section IDs are stable
      type: "group",
      verseIds: [1],
      columns: 1,
      // outerScale: -0.11 in legacy = the block was wider than the section inner width.
      // horizontalInset < 0 → pushed OUT (wider). 0.11 outward.
      horizontalInset: -0.11,
      isCenter: false,
      disablePopUp: true,
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    },
    // Block 1 — Verses 2–5 (2-column center group, pushed in)
    {
      id: "section2_g1",
      type: "group",
      verseIds: [3, 2, 5, 4], // display order: right,left (Arabic RTL)
      columns: 2,
      // g2Scale: 0.01 → pushed in by 0.01 on each side
      horizontalInset: 0.01,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: false,
    },
    // Block 2 — Verse 6 (full-width, yellow closing verse)
    {
      id: "section2_g2",
      type: "group",
      verseIds: [6],
      columns: 1,
      horizontalInset: -0.11,
      isCenter: false,
      disablePopUp: true,
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i.
      // groupHeights[i]    = frameH of block i.
      // Verse 1 (block 0) has expandH=0.028 → expands downward, shift fold1 down 0.01.
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
          2 -
        0.01;

      // fold2 sits inside block 1 — between the top row and the gap below it.
      const fold2 =
        lm.groupYPositions[1] -
        (lm as any).blockPadding -
        (lm as any).capsuleHeight -
        (lm as any).columnGap / 2;

      // Verse 6 (block 2) has expandH=0.028 → expands upward, shift fold3 up 0.01.
      const fold3 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
          2 +
        0.01;

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

// ── TEXT DATA (unchanged) ────────────────────────────────────────────────────

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
        verses: [{ number: 1, text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ" }],
      },
      {
        verses: [
          { number: 3, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 2, text: "لَا أَعْبُدُ مَا تَعْبُدُونَ" },
          { number: 5, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 4, text: "وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ" },
        ],
      },
      {
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
        verses: [
          {
            number: 1,
            text: "Say, O you who do not believe (in my religion)!",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "I (did not worship), do not worship what you worship",
          },
          { number: 3, text: "You also do not worship the Allah I worship" },
          { number: 4, text: "I am not going to worship what you worship" },
          {
            number: 5,
            text: "You also are not worshippers of the Allah I worship",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "Your religion is for you, my religion is for me !",
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
        verses: [
          { number: 1, text: "De ki, Ey (benim dinime) inanmayanlar !" },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "Ben sizin taptıklarınıza (tapmadım), tapmıyorum",
          },
          {
            number: 3,
            text: "Siz de benim ibadet ettiğim Allah'a ibadet etmiyorsunuz",
          },
          { number: 4, text: "Ben sizin taptıklarınıza tapacak değilim" },
          {
            number: 5,
            text: "Siz de benim ibadet ettiğim Allah'a ibadet edici değilsiz",
          },
        ],
      },
      {
        verses: [{ number: 6, text: "Sizin dininiz size, benim dinim bana !" }],
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
