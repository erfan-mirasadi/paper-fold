import type { SurahLayoutConfig } from "./schema";
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

// ── LAYOUT ──────────────────────────────────────────────────────────────────
// Fatiha 3 — same 7 verses as Fatiha 1, but rearranged into a 2-column "book"
// layout (right column: 2,3,4 — left column: 5,6,7) sitting inside a single
// unified pink card, mirroring the Ahzab 35 block-per-row pattern:
//   - Verse 1 sits alone on top (own small pill, no card).
//   - Rows [5,2] / [6,3] / [7,4] each render as a 2-column `group` block.
//   - The pink card + center divider reuse Ahzab's own SVG assets.
//   - No SideCurves brackets (curveColors: []) — this design has no side
//     "bow" lines connecting verse pairs.
// ---------------------------------------------------------------------------

export const FATIHA_3_CONFIG: SurahLayoutConfig = {
  id: "fatiha3",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
    hideBismillah3D: true, // Bismillah is already verse 1 — skip the 3D overlay
  },
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: 0,
    padding: 0.29,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true, // Do not widen paper for translation
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
    // ── Verse 1 — solo wide pill, its own frame ─────────────────────────────
    1: {
      isPill: false,
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: "#000000",
    },
    // ── Row 1 (5 left, 2 right) — yellow ────────────────────────────────────
    2: {
      isPill: false,
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    5: {
      isPill: false,
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    // ── Row 2 (6 left, 3 right) — blue ──────────────────────────────────────
    3: {
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 1.15,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    6: {
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 1.15,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Row 3 (7 left — wide/long, 4 right) — blue ─────────────────────────
    4: {
      expandW: 0.06,
      expandH: 0.02,
      textScaleOverride: 1.15,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      expandW: 0.06,
      expandH: 0.02,
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
      // No side "bow" brackets for this layout.
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
    // NOTE: columnGap here only drives the capsule WIDTH formula (colW),
    // not the visual gap between the two columns — that's controlled
    // per-block below via `columnGap` (position offset), decoupled by
    // design in the layout engine. Kept large so each capsule stays
    // narrow enough for the two columns to read as clearly separate.
    capsuleHeight: 0.072,
    columnGap: 0.1,
    rowGap: 0.05,
    blockGap: 0.05,
    sectionPadX: 0.05,
    blockPadding: 0.016,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
  },

  blocks: [
    {
      id: "section2_g0",
      type: "group",
      verseIds: [1],
      columns: 1,
      isCenter: false,
      dragBehavior: "individual",
      customSectionId: "section2_v1",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
      verticalNudge: -0.04,
    },
    {
      id: "section2_g1",
      type: "group",
      verseIds: [5, 2],
      columns: 2,
      columnGap: 0.2,
      isCenter: false,
      hideRowConnectors: true,
      gapBefore: 0.075,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g2",
      type: "group",
      verseIds: [6, 3],
      columns: 2,
      columnGap: 0.2,
      isCenter: false,
      hideRowConnectors: true,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g3",
      type: "group",
      verseIds: [7, 4],
      columns: 2,
      columnGap: 0.2,
      isCenter: false,
      hideRowConnectors: true,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  svgOverlays: [
    {
      src: "/fatiha/all-section-bg.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 1.15,
      scaleY: 1.15,
      offsetX: 0,
      offsetY: -0.1,
      renderOrder: 1,
    },
    //   {
    //     src: "/fatiha/bismillah-frame-3.svg",
    //     anchorGroupIndex: 0,
    //     anchorEdge: "center",
    //     scaleX: 0.9,
    //     scaleY: 0.22,
    //     offsetX: 0,
    //     offsetY: 0,
    //     renderOrder: 10,
    //     customSectionId: "section2_v1",
    //   },
    // {
    //   src: "/fatiha/middle-3.svg",
    //   anchorGroupIndex: 1,
    //   anchorEdge: "top",
    //   scaleX: 0.5,
    //   scaleY: 0.65,
    //   offsetX: 0.28,
    //   offsetY: -0.21,
    //   rotationZ: -Math.PI / 2,
    //   renderOrder: 3,
    //   customSectionId: "section2_v234",
    // },
    // {
    //   src: "/fatiha/middle-3.svg",
    //   anchorGroupIndex: 1,
    //   anchorEdge: "top",
    //   scaleX: 0.5,
    //   scaleY: 0.65,
    //   offsetX: -0.28,
    //   offsetY: -0.21,
    //   rotationZ: -Math.PI / 2,
    //   renderOrder: 3,
    //   customSectionId: "section2_v567",
    // },
  ],

  customSections: [
    {
      id: "section2_v1",
      verseIds: [1],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v234",
      verseIds: [2, 3, 4],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v567",
      verseIds: [5, 6, 7],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold1 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      const fold2 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
        2;
      return [fold0, fold1, fold2];
    },
    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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

export const FATIHA_3_TEXT_AR: SurahDataShape = {
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
          { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
          { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
        ],
      },
      {
        verses: [
          { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
          { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ\nغَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          },
          { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_3_TEXT_EN: SurahDataShape = {
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
            text: "In the name of Allah ! For He is the Most Gracious, the Most Merciful.",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "We worship You alone and we ask for help from You alone.",
          },
          {
            number: 2,
            text: "All praise is to Allah, Lord of the Worlds !",
          },
        ],
      },
      {
        verses: [
          { number: 6, text: "Show us the straight path." },
          { number: 3, text: "The Most Gracious, the Most Merciful." },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "That path is the path You taught the Prophet, not the path of those who have earned anger and of those who have gone astray.",
          },
          { number: 4, text: "Owner of the Day of Judgment." },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_3_TEXT_TR: SurahDataShape = {
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
          { number: 1, text: "Allah adına ! ki O Rahmandır, Rahimdir." },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "Yalnız sana ibadet ediyoruz ve yalnız senden yardım istiyoruz.",
          },
          { number: 2, text: "Tüm övgüler Allaha, Alemlerin Rabbine !" },
        ],
      },
      {
        verses: [
          { number: 6, text: "Bize doğru yolu göster." },
          { number: 3, text: "Rahmandır, Rahimdir." },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "O yol, Peygambere öğrettiğin yoldur, gazap ettiklerinin ve sapmışların yolu değil.",
          },
          { number: 4, text: "Din gününün sahibidir." },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_3_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: FATIHA_3_TEXT_AR,
  en: FATIHA_3_TEXT_EN,
  tr: FATIHA_3_TEXT_TR,
};
