/**
 * TEVBE: 24 — At-Tawbah 9:24, one ayah split into 12 chunks.
 *
 * Layout matches the reference photo:
 *
 *            ┌───────────────┐
 *            │      (1)       │            ← top cream box
 *            └───────────────┘
 *   ┌───────┬───────┐   ┌───────┬───────┐
 *   │  (6)  │  (5)  │   │  (3)  │  (2)  │  ← LEFT shield 5-6-7 | RIGHT shield 2-3-4
 *   └──── (7) ────┘     └──── (4) ────┘   ← dome-DOWN ovals
 *          ╲___╱               ╲___╱
 *              ╭─── (8) ───╮                ← dome-UP oval (center)
 *              │ (10) │ (9) │               ← center row
 *              └──────┴─────┘
 *        ┌─────────────────────────┐
 *        │           (11)          │        ← teal full-width bar
 *        └─────────────────────────┘
 *        ┌─────────────────────────┐
 *        │       (12)        ۲٤     │        ← maroon full-width bar (ayah marker)
 *        └─────────────────────────┘
 *
 * NOTE the verse ids are NOT in reading order left→right (see verseIds in each
 * block below). Numbers are shown (features.hideVerseNumbers = false).
 *
 * Ovals 4 & 7 use verseShape: "dome-down"; oval 8 uses verseShape: "dome-up"
 * (the new ayah model added to the engine — see VerseOverrideConfig.verseShape).
 *
 * The four requested "SVG sections" are wired as svgOverlays at the bottom:
 *   - shield.svg        → 2-3-4  and  5-6-7
 *   - dome-section.svg  → 8-9-10
 *   - overall.svg       → the whole 1-9 top block
 *
 * Structured like ahzab35Config.ts / ihlas112Config.ts so positions
 * (horizontalInset / xOffset / verticalNudge) are easy to hand-tune.
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  ORANGE_THEME,
  CAPSULE_BG_6_19,
  GREEN_THEME,
  CAPSULE_BG_12_14,
} from "../theme";

// ---------------------------------------------------------------------------
// COLOR PALETTE — matches the photo
// ---------------------------------------------------------------------------

const CREAM_BG = "#F3EAD6"; // verse 1 (top box)
const GOLD_BORDER = "#D0A24E";

const LAV_BG = "#E1E3F3"; // shields 2-3-4 & 5-6-7
const LAV_BORDER = "#8E93C8";

const DOME_BG = "#F5EEDC"; // verse 8 dome-up (cream)
const DOME_BORDER = "#D0A24E";

const WHITE_BG = "#FBFAF4"; // verses 9 & 10 (center row)
const WHITE_BORDER = "#C7C1AC";

const TEAL_BG = "#CFE2E6"; // verse 11
const TEAL_BORDER = "#79A7AC";

const MAROON_BG = "#F6EDE8"; // verse 12
const MAROON_BORDER = "#B0504D";

// Shared helper: a shield capsule (lavender)
const shield = (extra: Record<string, unknown> = {}) => ({
  bg: LAV_BG,
  border: LAV_BORDER,
  circleBg: LAV_BG,
  circleBorderCol: LAV_BG,
  circleTextCol: "#3A3D63",
  textColor: "#26283F",
  isPill: false,
  ...extra,
});

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

export const TEVBE_24_CONFIG: SurahLayoutConfig = {
  id: "tevbe24",
  title: "TEVBE: 24",
  heroTitle: "Tevbe",
  heroSubtitle: "suresi 24",

  scriptInfo: {
    title: "Tevbe: 24",
    sayfa: 190,
    juz: 10,
    hizb: 19,
    singleAyahNumber: 24,
  },

  // Fold-story → script sync (left ayah-list sidebar).
  scriptHighlights: {
    "pre-start": [1, 4, 7, 8, 11, 12],
    end: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false, // numbers ON — the small 1..12 chunk numerals
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  // ── Per-verse appearance ───────────────────────────────────────────────
  verseOverrides: {
    // Top box
    1: {
      bg: CREAM_BG,
      border: GOLD_BORDER,
      circleBg: CREAM_BG,
      circleBorderCol: CREAM_BG,
      circleTextCol: "#7A5A18",
      textColor: "#5A3D12",
      isPill: false,
    },

    // ── RIGHT shield 2-3-4 ────────────────────────────────────────────────
    2: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: "#2C2A22",
      isPill: false,
    },
    3: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: "#2C2A22",
      isPill: false,
    },
    4: {
      bg: DOME_BG,
      border: "#6B8EAD",
      circleBg: DOME_BG,
      circleBorderCol: DOME_BG,
      circleTextCol: "#7A5A18",
      textColor: "#634E73",
      isPill: false,
      verseShape: "dome-down",
      domeSideRatio: 0.2,
      expandH: 0.02,
    },

    // ── LEFT shield 5-6-7 ─────────────────────────────────────────────────
    5: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: "#2C2A22",
      isPill: false,
    },
    6: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: "#2C2A22",
      isPill: false,
    },
    7: {
      bg: DOME_BG,
      border: "#6B8EAD",
      circleBg: DOME_BG,
      circleBorderCol: DOME_BG,
      circleTextCol: "#7A5A18",
      textColor: GREEN_THEME,
      isPill: false,
      verseShape: "dome-down",
      domeSideRatio: 0.2,
      expandH: 0.02,
    },

    // ── CENTER dome 8-9-10 ────────────────────────────────────────────────
    8: {
      bg: DOME_BG,
      border: DOME_BORDER,
      circleBg: DOME_BG,
      circleBorderCol: DOME_BG,
      circleTextCol: "#7A5A18",
      textColor: "#634E73",
      isPill: false,
      verseShape: "dome-up",
      domeSideRatio: 0.2,
      expandH: 0.02,
    },
    9: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: GREEN_THEME,
      isPill: false,
    },
    10: {
      bg: WHITE_BG,
      border: WHITE_BORDER,
      circleBg: WHITE_BG,
      circleBorderCol: WHITE_BG,
      circleTextCol: "#4A4636",
      textColor: "#A30000",
      isPill: false,
    },

    // ── Bottom bars ───────────────────────────────────────────────────────
    11: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleBorderCol: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
      isPill: false,
    },
    12: {
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleBorderCol: ORANGE_THEME,
      circleTextCol: ORANGE_THEME,
      textColor: "#A30000",
      isPill: false,
      // Last chunk of the ayah → carries the mushaf ayah marker (24) with the
      // chunk counter (12) stacked above it.
      showAyahNumber: true,
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
      maroonTheme: LAV_BORDER,
      greenTheme: DOME_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: CREAM_BG,
      s2Group1Bg: LAV_BG,
      s2Group2Bg: DOME_BG,
      s2Group3Bg: WHITE_BG,
      // No side brackets/curves on this page. A single fully-transparent entry
      // makes SideCurves emit nothing (an empty [] would instead fall back to
      // the default olive center bracket for every isCenter group).
      curveColors: [{ color: "transparent", fillColor: "transparent" }],
    },
    capsuleBorderWidth: 0.0042,
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

  // ── GLOBAL SIZING ───────────────────────────────────────────────────────
  globalSettings: {
    capsuleHeight: 0.12,
    columnGap: 0.02,
    rowGap: 0.02,
    blockGap: 0.02,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    verseTextScale: 0.8,
    translationVerseTextScale: 0.5,
    // Lets verse text use the FULL capsule width (no wide number-badge padding),
    // so 2-word phrases wrap cleanly to 2 lines instead of clipping.
    tightVersePadding: true,
    // The two shields are collapsed onto one visual band with a big negative
    // verticalNudge on the left shield (see blocks). The engine still reserves
    // full stacked height for auto-centering, so pin the top edge instead.
    contentStartYOverride: -0.36,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.05,
      fontSize: 0.05,
      color: "#7C2C2A",
      lineSpacing: 1.4,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [{ text: "Tevbe: 24" }],
    },
  ],

  // ── BLOCKS — one group per colorGroup, in this exact order ───────────────
  // allGroups index (used by svgOverlays anchorGroupIndex):
  //   0 top(1) · 1 rightRow(3,2) · 2 rightDome(4) · 3 leftRow(6,5)
  //   4 leftDome(7) · 5 centerDome(8) · 6 centerRow(10,9) · 7 v11 · 8 v12
  blocks: [
    // 0 — Top box (verse 1), centered
    {
      id: "g_top",
      type: "group",
      verseIds: [1],
      columns: 1,
      horizontalInset: -0.45,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // 1 — RIGHT shield top row (left=3, right=2), pushed to the right half.
    //     Tall capsules → 2 lines of text like the reference.
    {
      id: "g_right_row",
      type: "group",
      verseIds: [3, 2],
      columns: 2,
      capsuleHeight: 0.18,
      horizontalInset: 0.155,
      xOffset: 0.34,
      isCenter: false,
      columnGap: 0.015,
      dragBehavior: "group",
      hideRowConnectors: true,
    },
    // 2 — RIGHT shield dome (verse 4, dome-down) — spans the full shield width
    {
      id: "g_right_dome",
      type: "group",
      verseIds: [4],
      columns: 1,
      capsuleHeight: 0.12,
      horizontalInset: 0.05,
      xOffset: 0.34,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // 3 — LEFT shield top row (left=6, right=5), pulled UP to the right-row
    //     band and pushed to the left half.
    {
      id: "g_left_row",
      type: "group",
      verseIds: [6, 5],
      columns: 2,
      capsuleHeight: 0.18,
      horizontalInset: 0.155,
      xOffset: -0.33,
      isCenter: false,
      columnGap: 0.015,
      dragBehavior: "group",
      hideRowConnectors: true,
      verticalNudge: -0.388,
    },
    // 4 — LEFT shield dome (verse 7, dome-down), left half.
    //     Natural stacking now lands it on the right-dome band.
    {
      id: "g_left_dome",
      type: "group",
      verseIds: [7],
      columns: 1,
      capsuleHeight: 0.12,
      horizontalInset: 0.05,
      xOffset: -0.33,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // 5 — CENTER dome (verse 8, dome-up) — wide shallow dome
    {
      id: "g_center_dome",
      type: "group",
      verseIds: [8],
      columns: 1,
      capsuleHeight: 0.12,
      horizontalInset: 0,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      verticalNudge: 0.02,
    },
    // 6 — CENTER row (left=10, right=9)
    {
      id: "g_center_row",
      type: "group",
      verseIds: [10, 9],
      columns: 2,
      horizontalInset: 0.06,
      isCenter: true,
      columnGap: 0.015,
      dragBehavior: "group",
      hideRowConnectors: true,
    },
    // 7 — Verse 11 (teal full-width bar)
    {
      id: "g_v11",
      type: "group",
      verseIds: [11],
      columns: 1,
      horizontalInset: -0.45,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.035,
    },
    // 8 — Verse 12 (maroon full-width bar, carries the ۲٤ ayah marker)
    {
      id: "g_v12",
      type: "group",
      verseIds: [12],
      columns: 1,
      horizontalInset: -0.45,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0,
    },
  ],

  customSections: [
    {
      id: "g_top",
      verseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // Decorative frames behind the capsule groups. Positions (offsetX/offsetY/
  // scaleX/scaleY) are starting points — tune against the live preview.
  svgOverlays: [
    // Overall warm frame around the whole 1-9 top block
    {
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.15,
      scaleY: 1.05,
      offsetX: 0,
      offsetY: -0.395,
      renderOrder: 2,
      customSectionId: null,
    },
    // RIGHT shield 2-3-4 (offsetX = the block xOffset, pushes it right)
    {
      src: "/tevbe/dome-section-1.svg",
      anchorGroupIndex: 1,
      anchorEdge: "center",
      scaleX: 0.72,
      scaleY: -0.45,
      offsetX: 0.34,
      offsetY: -0.105,
      renderOrder: 3,
      customSectionId: "g_top",
    },
    // LEFT shield 5-6-7
    {
      src: "/tevbe/dome-section-1.svg",
      anchorGroupIndex: 3,
      anchorEdge: "center",
      scaleX: 0.72,
      scaleY: -0.45,
      offsetX: -0.33,
      offsetY: -0.105,
      renderOrder: 3,
      customSectionId: "g_top",
    },
    // CENTER dome 8-9-10
    {
      src: "/tevbe/dome-section.svg",
      anchorGroupIndex: 5,
      anchorEdge: "top",
      scaleX: 0.935,
      scaleY: 0.4,
      offsetX: 0.0,
      offsetY: -0.132,
      renderOrder: 3,
      customSectionId: "g_top",
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // ── fold0: midpoint between g0 (v1) and g1 (v3,2) ───────────────────
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;

      // ── fold1: moved to fold0 (was between top row and bottom dome of shields)
      const fold1 = fold0 - 0.1;

      // ── fold2: moved to original fold1 (was below verses 7 and 4) ────────
      const fold2 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;

      // ── fold3: midpoint between g5 (v8) and g6 (v10,9) ──────────────────
      const fold3 =
        (lm.groupYPositions[5] - lm.groupHeights[5] + lm.groupYPositions[6]) /
        2;

      // ── fold4: midpoint between g6 (v10,9) and g7 (v11) ─────────────────
      const fold4 =
        (lm.groupYPositions[6] - lm.groupHeights[6] + lm.groupYPositions[7]) /
          2 +
        0.1;

      // ── fold5: midpoint between g7 (v11) and g8 (v12) ───────────────────
      const fold5 = fold4 - 0.1;

      return [fold0, fold1, fold2, fold3, fold4, fold5];
    },

    foldSteps: [
      {
        // Kept flat — the page rests exactly like the reference image.
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 }, // fold0
          { direction: -1, angleFactor: 1.05 }, // fold1
          { direction: 1, angleFactor: 0.6 }, // fold2
          { direction: 1, angleFactor: 0.5 }, // fold3
          { direction: -1, angleFactor: 1.05 }, // fold4
          { direction: 1, angleFactor: 0.55 }, // fold5
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 }, // fold0
          { direction: -1, angleFactor: 0 }, // fold1
          { direction: 1, angleFactor: 0 }, // fold2
          { direction: -1, angleFactor: 0 }, // fold3
          { direction: 1, angleFactor: 0 }, // fold4
          { direction: -1, angleFactor: 0 }, // fold5
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

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical). colorGroups order MUST match blocks order,
// and verses[] order inside each group MUST match that block's verseIds.
// ---------------------------------------------------------------------------

export const TEVBE_24_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // 0 — top
      { verses: [{ number: 1, text: "قُلْ إِنْ كَانَ" }] },
      // 1 — right row [3, 2]
      {
        verses: [
          { number: 3, text: "وَإِخْوَانُكُمْ وَأَزْوَاجُكُمْ" },
          { number: 2, text: "آبَاؤُكُمْ وَأَبْنَاؤُكُمْ" },
        ],
      },
      // 2 — right dome
      { verses: [{ number: 4, text: "وَعَشِيرَتُكُمْ" }] },
      // 3 — left row [6, 5]  (6 = ticaret on the left, 5 = mallar on the right)
      {
        verses: [
          { number: 6, text: "وَتِجَارَةٌ تَخْشَوْنَ كَسَادَهَا" },
          { number: 5, text: "وَأَمْوَالٌ اقْتَرَفْتُمُوهَا" },
        ],
      },
      // 4 — left dome
      { verses: [{ number: 7, text: "وَمَسَاكِنُ تَرْضَوْنَهَا" }] },
      // 5 — center dome
      { verses: [{ number: 8, text: "أَحَبَّ إِلَيْكُمْ" }] },
      // 6 — center row [10, 9]
      {
        verses: [
          { number: 10, text: "مِنَ اللَّهِ وَرَسُولِهِ" },
          { number: 9, text: "وَجِهَادٍ فِي سَبِيلِهِ" },
        ],
      },
      // 7 — v11
      {
        verses: [
          {
            number: 11,
            text: "فَتَرَبَّصُوا حَتَّىٰ يَأْتِيَ اللَّهُ بِأَمْرِهِ",
          },
        ],
      },
      // 8 — v12
      {
        verses: [
          { number: 12, text: "وَاللَّهُ لَا يَهْدِي الْقَوْمَ الْفَاسِقِينَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish (placeholder-quality, fill so the row is complete)
// ---------------------------------------------------------------------------

export const TEVBE_24_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "De ki eğer," }] },
      {
        verses: [
          { number: 5, text: "Kazandığınız\nmalları" },
          { number: 6, text: "Bozulmasından korktuğunuz ticareti," },
        ],
      },
      { verses: [{ number: 7, text: "Ve hoşlandığınız evlerde oturmayı" }] },
      {
        verses: [
          { number: 2, text: "Babalarınızı ve çocuklarınızı," },
          { number: 3, text: "Kardeşlerinizi\nve eşlerinizi," },
        ],
      },
      { verses: [{ number: 4, text: "Ve yakınlarınızla beraber olmayı" }] },
      { verses: [{ number: 8, text: "Allah ve Rasulünden" }] },
      {
        verses: [
          { number: 9, text: "Ve Allah yolunda savaşmaktan" },
          { number: 10, text: "(olmaz ya) Daha çok seviyorsanız" },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "O zaman hakkınızda Allah'ın\nhükmü gelinceye kadar bekleyin!",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "Allah, (fasık), itaatsiz bir topluluğa yol göstermez.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English (placeholder-quality)
// ---------------------------------------------------------------------------

export const TEVBE_24_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "Say, if" }] },
      {
        verses: [
          { number: 5, text: "the wealth\nyou have\nearned" },
          { number: 6, text: "the commerce\nyou fear\nmay decline," },
        ],
      },
      {
        verses: [
          { number: 7, text: "and living in dwellings you are fond of" },
        ],
      },
      {
        verses: [
          { number: 2, text: "your fathers\nand your\nchildren," },
          { number: 3, text: "your brothers\nand your\nspouses," },
        ],
      },
      {
        verses: [{ number: 4, text: "and being together with your relatives" }],
      },
      { verses: [{ number: 8, text: "than Allah\nand His Messenger" }] },
      {
        verses: [
          { number: 9, text: "and striving\nin His cause" },
          { number: 10, text: "(though unthinkable)\nyou love more" },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "then wait until Allah's decree comes regarding you!",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "Allah does not guide a (fasik), disobedient people.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const TEVBE_24_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: TEVBE_24_TEXT_AR,
  en: TEVBE_24_TEXT_EN,
  tr: TEVBE_24_TEXT_TR,
};
