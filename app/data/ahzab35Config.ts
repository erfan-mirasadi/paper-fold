/**
 * Ahzab 35 — Full Layout Config & Text Data
 *
 * Layout matches the hand-drawn design (see photo):
 *   5 groups arranged vertically:
 *     Group 0 (1 row):  verseIds [2, 1]        — Yellow  (إِيمَان row)
 *     Group 1 (1 row):  verseIds [4, 3]        — Blue
 *     Group 2 (2 rows): verseIds [6, 5, 8, 7]  — Green, pushed in
 *     Group 3 (1 row):  verseIds [10, 9]        — Blue
 *     Group 4 (1 row):  verseIds [12, 11]       — Yellow (dome text — smaller)
 *
 * hideRowConnectors: true — horizontal connector bars are suppressed.
 * curveColors: []         — no side brackets for now.
 */

import type { SurahLayoutConfig, VerticalGroupsSectionConfig } from "./schema";
import type { AlakLayoutParams } from "./SurahConfig";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// COLOR PALETTE — matches the hand-drawn sketch exactly
// ---------------------------------------------------------------------------

const YELLOW_BG = "#E5CFA4"; // Top & bottom groups (İman / dome)
const YELLOW_BORDER = "#BE9E63";

const BLUE_BG = "#CEE0E9"; // 2nd and 4th groups
const BLUE_BORDER = "#7A9CAD";

const GREEN_BG = "#eaf2db"; // Center pushed-in group
const GREEN_BORDER = "#8FA88F";

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

export const AHZAB_35_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "ahzab35",
  title: "Ahzab 35",
  heroTitle: "Ahzab",
  heroSubtitle: "suresi 35",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 2,
    paperHeight: 1.2,
    sceneCenterYOffset: 0.0,
    padding: 0.3,
    scrollPages: 5,
  },

  specialVerses: {
    middleFoldVerses: {
      left: [2, 4, 6, 8, 10, 12],
      right: [1, 3, 5, 7, 9, 11],
    },
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      5: 6,
      6: 5,
      7: 8,
      8: 7,
      9: 10,
      10: 9,
      11: 12,
      12: 11,
    },
  },

  verseOverrides: {
    // ── Group 0 — Yellow (İman) ───────────────────────────────────────────
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
      textColor: "#A30000",
    },
    2: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: "İman",
      capsuleLabelPosition: "top",
      textColor: "#A30000",
    },
    // ── Group 1 — Blue ───────────────────────────────────────────────────
    3: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
    },
    4: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: "Zekat",
      capsuleLabelPosition: "top",
    },
    // ── Group 2 — Green (pushed in) ──────────────────────────────────────
    5: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
    },
    6: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: "İçki yasak",
      capsuleLabelPosition: "top",
    },
    7: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
    },
    8: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: "Zina yasak",
      capsuleLabelPosition: "bottom",
    },
    // ── Group 3 — Blue ───────────────────────────────────────────────────
    9: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
    },
    10: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: "Namaz",
      capsuleLabelPosition: "bottom",
    },
    // ── Group 4 — Yellow (dome text, compact) ───────────────────────────
    11: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
      textColor: "#A30000",
    },
    12: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
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
      hollowConnectorInnerBg: "#e3e3e3",
      maroonTheme: YELLOW_BORDER, // fallback for outer groups
      greenTheme: GREEN_BORDER, // fallback for center group
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: YELLOW_BORDER, // unused
      s2Group1Bg: YELLOW_BG,
      s2Group2Bg: BLUE_BG,
      s2Group3Bg: GREEN_BG,
      curveColors: [
        {
          color: YELLOW_BORDER,
          fillColor: YELLOW_BG,
          bowGap: 0.4,
          innerBowGap: 0.39,
          inwardOffset: 0.02,
        },
        {
          color: BLUE_BORDER,
          fillColor: BLUE_BG,
          bowGap: 0.2,
          innerBowGap: 0.19,
          inwardOffset: 0.015,
        },
        {
          color: GREEN_BORDER,
          fillColor: GREEN_BG,
        },
      ],
    },
    capsuleBorderWidth: 0.0039,
    circleBorderWidth: 0.0035,
    verseRadius: 0.04,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,
      scallopX: 0.015,
      scallopY: 0.015,
      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
  },

  params: {
    // --- Section 1 (stub — not rendered) ---
    s1Top: 0.5,
    s1Pad: 0.01,
    gap: 0.01,
    s1AnaGap: 0.01,
    smallBoxH: 0.04,
    anaAyetH: 0.04,
    gapBetweenS1andS2: 0.01,

    // --- Section 2 ---
    s2VerticalPad: 0.02,
    bigBoxH: 0.07,
    groupGap: 0.035,
    groupPad: 0.012,
    groupPadBottom: 0.012,
    s2Gap: 0.12, // increase horizontal gap between left / right columns
    s2VerticalRowGap: 0.008, // very small gap between the two green rows
    smallBoxH2: 0.085, // default height of each individual verse capsule
    middleExtraGap: 0.0,
    s2PadLeftRight: 0.005, // push outward to the red borders
    g2Scale: 0.1, // indent the green group to fit the inward SVG border
    outerScale: 0.0,
    s1BorderWidth: 0,

    // --- Misc ---
    capsuleLabelW: 0.16,
    capsuleLabelH: 0.024,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.015,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.0,
    labelHitboxWidth: 0.43,
    verseTextScale: 1.25,
    // 5 groups: [1-row, 1-row, 2-row, 1-row, 1-row]
    groupRows: [1, 1, 2, 1, 1],

    outerCurveXOffset: 0.004,
    centerCurveXOffset: -0.0015,
  },

  // ---------------------------------------------------------------------------
  // SVG OVERLAYS — decorative frames anchored to specific groups
  // anchorGroupIndex: which group (0-based) to align to
  // anchorEdge: 'top' | 'bottom' | 'center' — which edge of that group
  // ---------------------------------------------------------------------------
  svgOverlays: [
    // ── Top frame  — anchored to Group 0 center
    {
      src: "/ahzab/frame-section.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 1.55,
      scaleY: 0.25,
      offsetX: 0,
      offsetY: 0,
      rotationZ: 0,
      renderOrder: 3,
    },
    // ── Bottom frame — anchored to Group 4 center, flipped Y
    {
      src: "/ahzab/frame-section.svg",
      anchorGroupIndex: 4,
      anchorEdge: "center",
      scaleX: 1.55,
      scaleY: -0.25,
      offsetX: 0,
      offsetY: 0.02, // Pulled UP closer to the bottom capsules
      rotationZ: 0,
      renderOrder: 3,
    },
    // ── Mid left bracket — anchored between Group 1–3, left side
    {
      src: "/Group 10.svg",
      anchorGroupIndex: 2,
      anchorEdge: "center",
      scaleX: 0.53, // Taller to close the gaps
      scaleY: 0.82, // Slightly thicker
      offsetX: -0.43, // Pushed outward to align with top frame
      offsetY: 0, // Shifted down to reach the bottom frame
      rotationZ: Math.PI / 2,
      renderOrder: 3,
    },
    // ── Mid right bracket — same SVG, flipped horizontally
    {
      src: "/Group 10.svg",
      anchorGroupIndex: 2,
      anchorEdge: "center",
      scaleX: 0.53,
      scaleY: -0.82,
      offsetX: 0.43,
      offsetY: 0,
      rotationZ: Math.PI / 2,
      renderOrder: 3,
    },
  ],

  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      // Horizontal connector bars between paired capsules are hidden.
      hideRowConnectors: true,
      groups: [
        // ── Group 0 — Yellow / İman (1 row) ──────────────────────────────
        {
          verseIds: [2, 1],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
          pushDown: -0.07, // negative value pushes the group UP
        },
        // ── Group 1 — Blue (1 row) ────────────────────────────────────────
        {
          verseIds: [4, 3],
          isPushedIn: false,
          isCenter: true,
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
          customScale: -0.07,
          pushDown: 0,
        },
        // ── Group 2 — Green / pushed in (2 rows) ─────────────────────────
        {
          verseIds: [6, 5, 8, 7],
          isPushedIn: true,
          isCenter: true,
          extraRowGap: 0.01,
          xGap: 0.3,
          bgThemeKey: "s2Group3Bg",
        },
        // ── Group 3 — Blue (1 row) ────────────────────────────────────────
        {
          verseIds: [10, 9],
          isPushedIn: false,
          isCenter: true,
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
          customScale: -0.07,
          // pushDown: 0.01,
        },
        // ── Group 4 — Yellow / dome text (1 row, smaller capsules) ───────
        {
          verseIds: [12, 11],
          isPushedIn: false,
          isCenter: true,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
          customScale: 0.15,
          pushDown: 0.09,
          topLabelConfig: {
            width: 0.25,
            height: 0.05,
            yOffset: 0.04,
            textScaleOverride: 0.75,
          },
        },
      ],
      cameraTarget: { y: 0.8, fov: 35, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    // @ts-ignore
    computePanels: (lm: any) => {
      const positions = lm.groupYPositions as number[];
      const heights = lm.groupHeights as number[];

      // Find the horizontal cut line
      const g3Bot = positions[3] - heights[3];
      const g4Top = positions[4] ?? g3Bot;
      const cutYWorld = (g3Bot + g4Top) / 2;

      const offsetY = Math.abs(cutYWorld);

      return [
        {
          id: "left-panel",
          w: lm.PAGE_WIDTH / 2,
          h: offsetY,
          offsetX: 0,
          offsetY: 0,
          // 👈 Left panel only reacts to left folds (5 to 9)
          ignoreFolds: [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
        },
        {
          id: "right-panel",
          w: lm.PAGE_WIDTH / 2,
          h: offsetY,
          offsetX: lm.PAGE_WIDTH / 2,
          offsetY: 0,
          // 👈 Right panel only reacts to right folds (0 to 4)
          ignoreFolds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        },
        {
          id: "bottom-panel",
          w: lm.PAGE_WIDTH,
          h: lm.PAGE_HEIGHT - offsetY,
          offsetX: 0,
          offsetY: offsetY,
          isStatic: false,
          // 👈 Bottom panel only reacts to global/bottom folds (10 to 14)
          ignoreFolds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
      ];
    },

    computeFoldYPositions: (lm) => {
      const positions = lm.groupYPositions as number[];
      const heights = lm.groupHeights as number[];

      const baseFolds = [
        (positions[0] -
          heights[0] +
          (positions[1] ?? positions[0] - heights[0])) /
          2,
        (positions[1] -
          heights[1] +
          (positions[2] ?? positions[1] - heights[1])) /
          2,
        positions[2] - heights[2] / 2, // 👈 Exactly the middle of the green group (since group 2 has two rows)
        (positions[2] -
          heights[2] +
          (positions[3] ?? positions[2] - heights[2])) /
          2,
        (positions[3] -
          heights[3] +
          (positions[4] ?? positions[3] - heights[3])) /
          2,
      ];

      // 👈 Here we return 15 folds (5 for right, 5 for left, 5 for bottom)
      return [...baseFolds, ...baseFolds, ...baseFolds];
    },

    // 👈 Now in each step, we must have exactly 15 objects
    // Index 0 to 4 = Right panel control
    // Index 5 to 9 = Left panel control
    // Index 10 to 14 = Bottom panel control
    foldSteps: [
      {
        id: "pre-start",
        // 👈 First state: The entire paper is accordion-folded and the yellows overlap
        folds: [
          // -- Right --
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0 },
          // -- Left --
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0 },
          // -- Bottom --
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0 },
        ],
      },
      {
        id: "open-all",
        // 👈 Everything opens and becomes flat
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
      {
        id: "fold-right-side",
        // 👈 Left stays flat, right folds into accordion state
        folds: [
          // -- Right folds --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0 },
          // -- Left stays static and open (angle zero) --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          // -- Bottom stays static and open (angle zero) --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
      {
        id: "open-right-side",
        // 👈 Right opens again until we reach left
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
      {
        id: "fold-left-side",
        // 👈 Right stays flat, left starts accordion-folding
        folds: [
          // -- Right stays static --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          // -- Left folds into accordion state --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0 },
          // -- Bottom stays static on the ground and detaches! --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
      {
        id: "end",
        // 👈 Finally the entire paper becomes completely flat and open
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
    ] as const,

    scrollTimeline: {
      intro: { start: 0, end: 10 },
      ambient: { start: 10, end: 30 },
      handoff: { start: 30, end: 40 },
      story: { start: 40, end: 100 },
    },

    scrollLock: {
      lockPositionPercentage: 0.55,
      effortRequired: 2500,
      grabRangePixels: 50,
    },
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical)
// Ordering inside each colorGroup matches config verseIds exactly.
// ---------------------------------------------------------------------------

export const AHZAB_35_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "الأحزاب ٣٥",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },

  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // ── Group 0 — Yellow ─────────────────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 2, text: "وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ" },
          { number: 1, text: "إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ" },
        ],
      },
      // ── Group 1 — Blue ───────────────────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "وَالصَّادِقِينَ وَالصَّادِقَاتِ" },
          { number: 3, text: "وَالْقَانِتِينَ وَالْقَانِتَاتِ" },
        ],
      },
      // ── Group 2 — Green (pushed in, 2 rows) ──────────────────────────────
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 6, text: "وَالْخَاشِعِينَ وَالْخَاشِعَاتِ" },
          { number: 5, text: "وَالصَّابِرِينَ وَالصَّابِرَاتِ" },
          { number: 8, text: "وَالصَّائِمِينَ وَالصَّائِمَاتِ" },
          { number: 7, text: "وَالْمُتَصَدِّقِينَ وَالْمُتَصَدِّقَاتِ" },
        ],
      },
      // ── Group 3 — Blue ───────────────────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 10,
            text: "وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ",
          },
          { number: 9, text: "وَالْحَافِظِينَ فُرُوجَهُمْ وَالْحَافِظَاتِ" },
        ],
      },
      // ── Group 4 — Yellow / dome text ─────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        topLabel: "أَعَدَّ اللَّهُ لَهُمْ",
        verses: [
          { number: 12, text: "مَغْفِرَةً" },
          { number: 11, text: "وَأَجْرًا عَظِيمًا" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish
// ---------------------------------------------------------------------------

export const AHZAB_35_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ahzab 35",
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
        verses: [
          { number: 2, text: "ve mümin erkekler ve mümin kadınlar" },
          {
            number: 1,
            text: "Şüphesiz müslüman erkekler ve müslüman kadınlar",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "ve sadık erkekler ve sadık kadınlar" },
          { number: 3, text: "ve itaat eden erkekler ve itaat eden kadınlar" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 6,
            text: "ve huşu içinde olan erkekler ve huşu içinde olan kadınlar",
          },
          { number: 5, text: "ve sabreden erkekler ve sabreden kadınlar" },
          { number: 8, text: "ve oruç tutan erkekler ve oruç tutan kadınlar" },
          {
            number: 7,
            text: "ve sadaka veren erkekler ve sadaka veren kadınlar",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 10,
            text: "ve Allah'ı çok zikreden erkekler ve zikreden kadınlar",
          },
          {
            number: 9,
            text: "ve iffetlerini koruyan erkekler ve koruyan kadınlar",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "mağfiret" },
          { number: 11, text: "ve büyük bir mükâfat" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English
// ---------------------------------------------------------------------------

export const AHZAB_35_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Al-Ahzab 35",
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
        verses: [
          { number: 2, text: "and believing men and believing women" },
          { number: 1, text: "Indeed, the Muslim men and Muslim women" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "and truthful men and truthful women" },
          { number: 3, text: "and obedient men and obedient women" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 6,
            text: "and humbly submissive men and humbly submissive women",
          },
          { number: 5, text: "and patient men and patient women" },
          { number: 8, text: "and fasting men and fasting women" },
          { number: 7, text: "and charitable men and charitable women" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 10,
            text: "and men who remember Allah often and women who do so",
          },
          {
            number: 9,
            text: "and men who guard their private parts and women who do so",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "forgiveness" },
          { number: 11, text: "and a great reward" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// Aggregated text data
// ---------------------------------------------------------------------------

export const AHZAB_35_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: AHZAB_35_TEXT_AR,
  en: AHZAB_35_TEXT_EN,
  tr: AHZAB_35_TEXT_TR,
};
