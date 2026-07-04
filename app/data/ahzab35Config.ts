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

import type { SurahLayoutConfig } from "./schema";
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

export const AHZAB_35_CONFIG: SurahLayoutConfig = {
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
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.38,
    scrollPages: 5,
    fixedWidthAcrossLanguages: true,
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
    // Verse 1 is the RIGHT-side capsule (index 1 in verseIds [2,1]).
    // xOffset: positive → pushes further right toward the paper edge.
    1: {
      bg: YELLOW_BG,
      border: "#A30000",
      circleBg: YELLOW_BG,
      circleBorderCol: "#A30000",
      circleTextCol: "#A30000",
      textColor: "#A30000",
      xOffset: 0.0, // Yellow: no extra push (short text fits naturally)
      expandH: -0.001,
      expandW: 0.08,
    },
    2: {
      bg: YELLOW_BG,
      border: "#A30000",
      circleBg: YELLOW_BG,
      circleBorderCol: "#A30000",
      circleTextCol: "#A30000",
      hasCapsuleLabel: true,
      customCapsuleLabel: {
        ar: "İman",
        tr: "İman",
        en: "Faith",
      },
      capsuleLabelPosition: "top",
      textColor: "#A30000",
      expandH: -0.001,
      expandW: 0.08,
    },
    // ── Group 1 — Blue ───────────────────────────────────────────────────
    // Verse 3 is the RIGHT-side capsule (index 1 in verseIds [4,3]).
    3: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      expandW: 0.08,
      expandH: 0.005,
      xOffset: 0.09, // Blue right-side: push toward the right edge
    },
    4: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: {
        ar: "Zekat",
        tr: "Zekat",
        en: "Charity",
      },
      capsuleLabelPosition: "top",
      expandW: 0.08,
      expandH: 0.005,
    },
    // ── Group 2 — Green (pushed in) ──────────────────────────────────────
    // Verses 5 and 7 are the RIGHT-side capsules (odd indices in [6,5,8,7]).
    5: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      xOffset: 0.09, // Green right-side row 1: push right
      expandW: 0.14,
    },
    6: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: {
        ar: "İçki yasak",
        tr: "İçki yasak",
        en: "No Intoxicants",
      },
      capsuleLabelPosition: "top",
      expandW: 0.14,
    },
    7: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      xOffset: 0.09, // Green right-side row 2: push right
      expandW: 0.14,
    },
    8: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: GREEN_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: {
        ar: "Zina yasak",
        tr: "Zina yasak",
        en: "No Adultery",
      },
      capsuleLabelPosition: "bottom",
      expandW: 0.14,
    },
    // ── Group 3 — Blue ───────────────────────────────────────────────────
    // Verse 9 is the RIGHT-side capsule (index 1 in verseIds [10,9]).
    9: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      expandW: 0.08,
      expandH: 0.005,
      xOffset: 0.09, // Blue right-side: push toward the right edge
    },
    10: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: BLUE_BORDER,
      hasCapsuleLabel: true,
      customCapsuleLabel: {
        ar: "Namaz",
        tr: "Namaz",
        en: "Prayer",
      },
      capsuleLabelPosition: "bottom",
      expandW: 0.08,
      expandH: 0.005,
    },
    // ── Group 4 — Yellow (dome text, compact) ───────────────────────────
    // Verse 11 is the RIGHT-side capsule (index 1 in verseIds [12,11]).
    11: {
      bg: YELLOW_BG,
      border: "#A30000",
      circleBg: YELLOW_BG,
      circleBorderCol: "#A30000",
      circleTextCol: "#A30000",
      textColor: "#A30000",
      xOffset: 0.0, // Yellow dome: no push (symmetric dome layout)
      expandH: -0.003,
      expandW: 0,
    },
    12: {
      bg: YELLOW_BG,
      border: "#A30000",
      circleBg: YELLOW_BG,
      circleBorderCol: "#A30000",
      circleTextCol: "#A30000",
      textColor: "#A30000",
      expandH: -0.003,
      expandW: 0,
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
          color: "#A30000",
          fillColor: YELLOW_BG,
          bowGap: 0.255,
          innerBowGap: 0.29,
          inwardOffset: 0.04,
          // drawInnerCurves: false,
          // innerCurvesBowGap: 0.145,
          // innerCurvesInnerBowGap: 0.12,
          // How far apart the two curve lines are where they touch the yellow capsule.
          // Default is smallBoxH2 (0.085). Decrease to bring lines closer together.
          tipThickness: -0.13,
          topAnchorXOffset: 0.061,
          bottomAnchorXOffset: 0.09,
          topAnchorYOffset: 0.003,
          bottomAnchorYOffset: 0.033,
        },
        {
          color: BLUE_BORDER,
          fillColor: BLUE_BG,
          bowGap: 0.14,
          innerBowGap: 0.125,
          inwardOffset: 0.03,
          curveSide: "left",
          tipThickness: 0.1,
        },
        {
          color: GREEN_BORDER,
          fillColor: GREEN_BG,
          curveSide: "left",
          bottomAnchorYOffset: -0.011,
          bowGap: 0.07,
          innerBowGap: 0.05,
        },
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
  // Legacy params mapping:
  //   smallBoxH2: 0.085      → capsuleHeight
  //   s2Gap: 0.12            → columnGap (overridden per-block via xGap anyway)
  //   s2VerticalRowGap: 0.004 → rowGap
  //   groupGap + middleExtraGap (0.035 + -0.01) → blockGap
  //   s2PadLeftRight: 0.005  → sectionPadX
  //   groupPad: 0.012        → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  globalSettings: {
    capsuleHeight: 0.085,
    columnGap: 0.12,
    rowGap: 0.004,
    blockGap: 0.025,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    capsuleLabelW: 0.16,
    capsuleLabelH: 0.024,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.005,
  },

  sectionBackground: {
    texture: "/fatiha/all-section-bg.svg",
    scaleX: 1.47,
    scaleY: 1.41,
    offsetY: 0.035,
  },

  // ── Custom drag/click sections ─────────────────────────────────────────
  // Overrides the default per-block section mapping.
  // Section 1 (top):         verses 1, 2       — İman (top yellow)
  // Section 2 (middle right): verses 3, 5, 7, 9 — Right column
  // Section 3 (middle left):  verses 4, 6, 8, 10 — Left column
  // Section 4 (bottom):      verses 11, 12      — Dome (bottom yellow)
  customSections: [
    {
      id: "section2_top",
      verseIds: [1, 2],
      cameraTarget: { y: 1.7, fov: 22.5, tilt: -1.3 },
    },
    {
      id: "section2_right",
      verseIds: [3, 5, 7, 9],
      cameraTarget: { y: 1.2, fov: 27.5, tilt: -1.4 },
    },
    {
      id: "section2_left",
      verseIds: [4, 6, 8, 10],
      cameraTarget: { y: 1.2, fov: 27.5, tilt: -1.4 },
    },
    {
      id: "section2_bottom",
      verseIds: [11, 12],
      cameraTarget: { y: 0.8, fov: 35, tilt: -1.2 },
    },
  ],

  // ---------------------------------------------------------------------------
  // SVG OVERLAYS — decorative frames anchored to specific groups
  // anchorGroupIndex: which group (0-based) to align to
  // anchorEdge: 'top' | 'bottom' | 'center' — which edge of that group
  // ---------------------------------------------------------------------------
  svgOverlays: [
    // ── Mid left bracket — section2_left (verses 4,6,8,10)
    // {
    //   src: "/ahzab/middle.svg",
    //   anchorGroupIndex: 2,
    //   anchorEdge: "center",
    //   scaleX: 0.75,
    //   scaleY: 0.75,
    //   offsetX: -0.35,
    //   offsetY: 0.004,
    //   rotationZ: Math.PI / 2,
    //   renderOrder: 3,
    //   customSectionId: "section2_left",
    // },
    // ── Mid right bracket — section2_right (verses 3,5,7,9)
    // {
    //   src: "/ahzab/middle.svg",
    //   anchorGroupIndex: 2,
    //   anchorEdge: "center",
    //   scaleX: 0.75,
    //   scaleY: 0.7,
    //   offsetX: 0.35,
    //   offsetY: 0.004,
    //   rotationZ: -Math.PI / 2,
    //   renderOrder: 3,
    //   customSectionId: "section2_right",
    // },

    // ── Top bracket — section2_top (verses 1,2)
    {
      src: "/ahzab/bottom.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 0.9,
      scaleY: -0.3,
      offsetX: 0,
      offsetY: -0.04,
      rotationZ: 0,
      renderOrder: 10,
      customSectionId: "section2_top",
    },
    // ── Bottom bracket — section2_bottom (verses 11,12)
    {
      src: "/ahzab/bottom-1.svg",
      anchorGroupIndex: 4,
      anchorEdge: "center",
      scaleX: 0.9,
      scaleY: 0.3,
      offsetX: 0,
      offsetY: 0.0755,
      rotationZ: 0,
      renderOrder: 10,
      customSectionId: "section2_bottom",
    },

    // ── Center vertical line — static, glued to background (no drag)
    {
      src: "/ahzab/center-line.svg",
      anchorGroupIndex: 2,
      anchorEdge: "center",
      scaleX: 0.009,
      scaleY: 0.7,
      offsetX: 0,
      offsetY: 0.004,
      rotationZ: 0,
      renderOrder: 4,
      customSectionId: null,
    },

    // ── Arrow between verse 1 and 2 — section2_top
    {
      src: "/ahzab/arrows.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 0.08,
      scaleY: 0.07,
      offsetX: 0,
      offsetY: 0,
      rotationZ: -Math.PI / 2 + 0.4,
      renderOrder: 10,
      customSectionId: "section2_top",
    },
    // ── Arrow from "أَعَدَّ اللَّهُ لَهُمْ" to right capsule — section2_bottom
    {
      src: "/ahzab/arrows.svg",
      anchorGroupIndex: 4,
      anchorEdge: "top",
      scaleX: -0.07,
      scaleY: 0.07,
      offsetX: 0.045,
      offsetY: -0.01,
      rotationZ: 290 - 0.5, // opposite of -290
      renderOrder: 10,
      customSectionId: "section2_bottom",
    },
    // ── Arrow from "أَعَدَّ اللَّهُ لَهُمْ" to left capsule
    {
      src: "/ahzab/arrows.svg",
      anchorGroupIndex: 4,
      anchorEdge: "top",
      scaleX: 0.07,
      scaleY: 0.07,
      offsetX: -0.045,
      offsetY: -0.01,
      rotationZ: -(290 - 0.5), // Mirrored rotation from the right arrow
      renderOrder: 10,
      customSectionId: "section2_bottom",
    },
  ],

  blocks: [
    // ── Block 0 — Yellow / İman (1 row) ────────────────────────────────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [2, 1],
      horizontalInset: 0.1, // was customScale
      isPushedIn: false, // explicit: customScale>0 here is NOT the SideCurves center group
      isCenter: false,
      columnGap: 0.25, // was xGap
      bgThemeKey: "s2Group1Bg",
      verticalNudge: -0.03, // was pushDown (negative pushes UP)
      dragBehavior: "group",
      hideRowConnectors: true,
    },
    // ── Block 1 — Blue (1 row) ──────────────────────────────────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [4, 3],
      horizontalInset: 0.06,
      isPushedIn: false,
      isCenter: true,
      columnGap: 0.22,
      bgThemeKey: "s2Group2Bg",
      dragBehavior: "group",
      hideRowConnectors: true,
    },
    // ── Block 2 — Green / pushed in (2 rows) ───────────────────────────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [6, 5, 8, 7],
      horizontalInset: 0.2,
      isCenter: true,
      dragBehavior: "group",
      extraRowGap: 0.01, // affects only the within-block row offset, not frame height
      columnGap: 0.35,
      bgThemeKey: "s2Group3Bg",
      hideRowConnectors: true,
    },
    // ── Block 3 — Blue (1 row) ──────────────────────────────────────────────
    {
      id: "section2_g3",
      type: "group",
      verseIds: [10, 9],
      horizontalInset: 0.06,
      isPushedIn: false,
      isCenter: true,
      columnGap: 0.22,
      bgThemeKey: "s2Group2Bg",
      dragBehavior: "group",
      hideRowConnectors: true,
    },
    // ── Block 4 — Yellow / dome text (1 row, smaller capsules) ────────────
    {
      id: "section2_g4",
      type: "group",
      verseIds: [12, 11],
      horizontalInset: 0,
      isCenter: true,
      columnGap: 0.16, // Change this value to adjust the horizontal distance between the capsules!
      bgThemeKey: "s2Group1Bg",
      verticalNudge: 0.08,
      dragBehavior: "group",
      hideRowConnectors: true,
      topLabelConfig: {
        width: 0.3,
        height: 0.085,
        yOffset: 0.025,
        textColor: "#000000",
        xMultiplier: 1.0,
        isSimpleText: true,
        shadow: true,
      },
    },
  ],

  animations: {
    // @ts-ignore
    computePanels: (lm: any) => {
      return [
        {
          id: "left-panel",
          w: lm.PAGE_WIDTH / 2,
          h: lm.PAGE_HEIGHT,
          offsetX: 0,
          offsetY: 0,
          // 👈 Left panel only reacts to left folds (5 to 9)
          ignoreFolds: [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
        },
        {
          id: "right-panel",
          w: lm.PAGE_WIDTH / 2,
          h: lm.PAGE_HEIGHT,
          offsetX: lm.PAGE_WIDTH / 2,
          offsetY: 0,
          // 👈 Right panel only reacts to right folds (0 to 4)
          ignoreFolds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
          // -- Left --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
          // -- Bottom --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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
          { direction: -1, angleFactor: -0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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
        id: "fold-right-side-2",
        // 👈 Left stays flat, right folds into accordion state
        folds: [
          // -- Right folds --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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
        id: "fold-left-side",
        // 👈 Right stays flat, left starts accordion-folding
        folds: [
          // -- Right stays static --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
          // -- Left folds into accordion state --
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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
        id: "fold-left-side-2",
        // 👈 Right stays flat, left starts accordion-folding
        folds: [
          // -- Right stays static --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
          // -- Left folds into accordion state --
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.5 },
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
          { number: 4, text: "وَالْمُتَصَدِّقِينَ وَالْمُتَصَدِّقَاتِ" },
          { number: 3, text: "وَالْقَانِتِينَ وَالْقَانِتَاتِ" },
        ],
      },
      // ── Group 2 — Green (pushed in, 2 rows) ──────────────────────────────
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 6, text: "وَالصَّائِمِينَ وَالصَّائِمَاتِ" },
          { number: 5, text: "وَالصَّادِقِينَ وَالصَّادِقَاتِ" },
          { number: 8, text: "وَالْحَافِظِينَ فُرُوجَهُمْ وَالْحَافِظَاتِ" },
          { number: 7, text: "وَالصَّابِرِينَ وَالصَّابِرَاتِ" },
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
          { number: 9, text: "وَالْخَاشِعِينَ وَالْخَاشِعَاتِ" },
        ],
      },
      // ── Group 4 — Yellow / dome text ─────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        topLabel: "أَعَدَّ اللَّهُ لَهُمْ",
        verses: [
          { number: 12, text: "وَأَجْرًا عَظِيمًا" },
          { number: 11, text: "مَغْفِرَةً" },
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
          {
            number: 4,
            text: "ve sadaka veren erkekler ve sadaka veren kadınlar",
          },
          { number: 3, text: "ve itaatkâr erkekler ve itaatkâr kadınlar" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 6,
            text: "ve oruç tutan erkekler ve oruç tutan kadınlar",
          },
          {
            number: 5,
            text: "ve doğru sözlü erkekler ve doğru sözlü kadınlar",
          },
          {
            number: 8,
            text: "ve iffetlerini koruyan erkekler ve koruyan kadınlar",
          },
          {
            number: 7,
            text: "ve sabreden erkekler ve sabreden kadınlar",
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
            text: "ve Allah'ı çokça anan erkekler ve anan kadınlar",
          },
          {
            number: 9,
            text: "ve Allah'a gönülden saygı duyan erkekler ve saygı duyan kadınlar",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        topLabel: "Allah onlar için hazırlamıştır",
        verses: [
          { number: 12, text: "ve büyük bir mükâfat" },
          { number: 11, text: "bir bağışlanma" },
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
          { number: 2, text: "and the believing men and believing women" },
          { number: 1, text: "Indeed, the Muslim men and Muslim women" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "and the charitable men and charitable women" },
          { number: 3, text: "and the obedient men and obedient women" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 6,
            text: "and the fasting men and fasting women",
          },
          { number: 5, text: "and the truthful men and truthful women" },
          {
            number: 8,
            text: "and the men who guard their private parts and the women who do so",
          },
          { number: 7, text: "and the patient men and patient women" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 10,
            text: "and the men who remember Allah often and the women who do so",
          },
          {
            number: 9,
            text: "and the humble men and humble women",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        topLabel: "Allah has prepared for them",
        verses: [
          { number: 12, text: "and a great reward" },
          { number: 11, text: "forgiveness" },
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
