import type { SurahLayoutConfig } from "./schema";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

import {
  ORANGE_THEME,
  MAROON_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_9_10_15_16,
  S1_VERSE_5_TEXT,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
} from "./theme";

// ── LAYOUT ──────────────────────────────────────────────────────────────────
// Fatiha 4 — verses 2–7 only (Bismillah = 3D overlay, no verse 1 capsule).
//
// Two rows × 3 columns (Arabic RTL — col-0 is leftmost / highest number):
//
//   Row 1:  [4]  [3]  [2]    ← blue–blue–orange
//   Row 2:  [7]  [6]  [5]    ← blue–blue–orange
//
// Elevation / drag grouping (via customSections):
//   • verse 2   → section2_v2   (individual)
//   • verses 3+4 → section2_v34 (elevate together)
//   • verse 5   → section2_v5   (individual)
//   • verses 6+7 → section2_v67 (elevate together)
//
// SVG overlays (bismillah-frame-3.svg):
//   • top row    linked to section2_v34  (moves with 3&4 group)
//   • bottom row linked to section2_v67  (moves with 6&7 group)
// ---------------------------------------------------------------------------

const EXPAND_H = 0.05; // uniform so both blocks have identical heights

export const FATIHA_4_CONFIG: SurahLayoutConfig = {
  id: "fatiha4",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: false,
    hideBismillah3D: true, // verse 1 capsule replaces the 3D overlay
  },
  dimensions: {
    paperWidth: 1.72,
    paperHeight: 1.78,
    sceneCenterYOffset: 0,
    padding: 0.22,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },
  specialVerses: {
    versePairings: {
      2: 5,
      5: 2,
      3: 6,
      6: 3,
      4: 7,
      7: 4,
    },
  },
  verseOverrides: {
    // ── Verse 1 — Bismillah, solo wide pill, centered above the two rows ─────
    1: {
      isPill: false,
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: "#000000",
    },
    // ── Row 1 ────────────────────────────────────────────────────────────────
    2: {
      isPill: false,
      expandW: 0,
      expandH: EXPAND_H,
      textScaleOverride: 0.7, // further reduced
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    3: {
      expandW: 0.015,
      expandH: EXPAND_H,
      textScaleOverride: 1.2,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    4: {
      expandW: 0.015,
      expandH: EXPAND_H,
      textScaleOverride: 1.2,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Row 2 ────────────────────────────────────────────────────────────────
    5: {
      isPill: false,
      expandW: 0,
      expandH: EXPAND_H,
      textScaleOverride: 0.65, // further reduced
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    6: {
      expandW: 0.015,
      expandH: EXPAND_H,
      textScaleOverride: 1.16,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      expandW: 0.015,
      expandH: EXPAND_H,
      textScaleOverride: 1.06, // intentionally smaller — long multi-line verse
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
      s2Group1Bg: CAPSULE_BG_6_19,
      s2Group2Bg: CAPSULE_BG_9_10_15_16,
      s2Group3Bg: CAPSULE_BG_9_10_15_16,
      curveColors: [],
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

  globalSettings: {
    capsuleHeight: 0.1,
    columnGap: 0.04,
    rowGap: 0.05,
    blockGap: 0.18,
    sectionPadX: 0.04,
    blockPadding: 0.014,
    sectionBorderWidth: 0.006,
    connectorPad: 0.025,
  },

  blocks: [
    // ── Verse 1: Bismillah — single column, centered, same as fatiha3 ─────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [1],
      columns: 1,
      isCenter: false,
      dragBehavior: "individual",
      customSectionId: "section2_v1",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
      verticalNudge: 0.02,
    },
    // ── Row 1: [4, 3, 2] — connector bridges left 2 cols (4↔3) only ─────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [4, 3, 2],
      columns: 3,
      columnGap: 0.04,
      isCenter: false,
      hideRowConnectors: false,
      rowConnectorCols: 2,
      rowConnectorPadY: 0.04, // taller connector bar
      rowConnectorPadX: -0.01, // narrower — stops it overflowing the capsule edges
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── Row 2: [7, 6, 5] — connector bridges left 2 cols (7↔6) only ─────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [7, 6, 5],
      columns: 3,
      columnGap: 0.04,
      isCenter: false,
      hideRowConnectors: false,
      rowConnectorCols: 2,
      rowConnectorPadY: 0.04, // taller connector bar
      rowConnectorPadX: -0.01, // narrower — stops it overflowing the capsule edges
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  svgOverlays: [
    // ── Section background (static, behind everything) ────────────────────────
    {
      src: "/fatiha/all-section-bg.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 1.36,
      scaleY: 1.15,
      offsetX: 0,
      offsetY: -0.07,
      renderOrder: 1,
    },
    // ── Bismillah frame — top row (verses 2, 3, 4); moves with 3&4 section ───
    {
      src: "/fatiha/bismillah-frame-3.svg",
      anchorGroupIndex: 1,
      anchorEdge: "center",
      scaleX: 1.3,
      scaleY: 0.35,
      offsetX: 0,
      offsetY: 0,
      // rotationZ: -Math.PI / 2,
      renderOrder: 3,
      customSectionId: "section2_v34",
    },
    // ── Bismillah frame — bottom row (verses 5, 6, 7); moves with 6&7 section ─
    {
      src: "/fatiha/bismillah-frame-3.svg",
      anchorGroupIndex: 2,
      anchorEdge: "center",
      scaleX: 1.3,
      scaleY: 0.35,
      offsetX: 0,
      offsetY: 0,
      // rotationZ: -Math.PI / 2,
      renderOrder: 3,
      customSectionId: "section2_v67",
    },
  ],

  // ── Elevation / drag sections ─────────────────────────────────────────────
  // sectionResolver uses customSections (when present) as the exclusive source
  // of elevation zones. Each entry = one group that elevates as a unit.
  customSections: [
    // Verse 1 — Bismillah, elevates on its own
    {
      id: "section2_v1",
      verseIds: [1],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Row 1 — verse 2 elevates individually
    {
      id: "section2_v2",
      verseIds: [2],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Row 1 — verses 3 & 4 elevate together
    {
      id: "section2_v34",
      verseIds: [3, 4],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Row 2 — verse 5 elevates individually
    {
      id: "section2_v5",
      verseIds: [5],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Row 2 — verses 6 & 7 elevate together
    {
      id: "section2_v67",
      verseIds: [6, 7],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // 3 blocks: [0]=verse1, [1]=row1 (4,3,2), [2]=row2 (7,6,5)
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold1 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      return [fold0, fold1];
    },
    foldSteps: [
      // {
      //   id: "pre-start",
      //   folds: [
      //     { direction: 1, angleFactor: 0 },
      //     { direction: 1, angleFactor: 0 },
      //   ],
      // },
      {
        id: "end",
        folds: [
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

export const FATIHA_4_TEXT_AR: SurahDataShape = {
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
        verses: [
          { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
          { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
          { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ\nغَيْرِ الْمَغْضُوبِ عَلَيْهِمْ\n وَلَا الضَّالِّينَ",
          },
          { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
          { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_4_TEXT_EN: SurahDataShape = {
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
            text: "In the name of Allah, the Most Gracious, the Most Merciful.",
          },
        ],
      },
      {
        verses: [
          { number: 4, text: "Owner of the Day of Judgment." },
          { number: 3, text: "The Most Gracious, the Most Merciful." },
          { number: 2, text: "All praise is to Allah, Lord of the Worlds !" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "That path is the path You taught the Prophet, not the path of those who have earned anger and of those who have gone astray.",
          },
          { number: 6, text: "Show us the straight path." },
          {
            number: 5,
            text: "We worship You alone and we ask for help from You alone.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_4_TEXT_TR: SurahDataShape = {
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
        verses: [
          {
            number: 1,
            text: "Bismillahirrahmanirrahim — Rahman ve Rahim olan Allah'ın adıyla.",
          },
        ],
      },
      {
        verses: [
          { number: 4, text: "Din gününün sahibidir." },
          { number: 3, text: "Rahmandır, Rahimdir." },
          { number: 2, text: "Tüm övgüler Allaha, Alemlerin Rabbine !" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "O yol, Peygambere öğrettiğin yoldur, gazap ettiklerinin ve sapmışların yolu değil.",
          },
          { number: 6, text: "Bize doğru yolu göster." },
          {
            number: 5,
            text: "Yalnız sana ibadet ediyoruz ve yalnız senden yardım istiyoruz.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_4_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: FATIHA_4_TEXT_AR,
  en: FATIHA_4_TEXT_EN,
  tr: FATIHA_4_TEXT_TR,
};
