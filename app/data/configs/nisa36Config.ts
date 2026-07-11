/**
 * An-Nisa 36 — Full Layout Config & Text Data
 *
 * Layout (top to bottom), per the hand-drawn brief:
 *   Block 0        verseIds [1, 2]        — stacked (1 col), orange, NO curve
 *   Block 1 "mid1" verseIds [4,3,6,5]     — 2×2 grid, blue, curve + pop-ups
 *                                            AR order: i=0→id4(LEFT), i=1→id3(RIGHT)
 *                                            (sized identically to Ayat
 *                                            al-Kursi's pushed-in center box)
 *   Block 2 "mid2" verseIds [8,7,10,9]    — 2×2 grid, green, curve + pop-ups
 *                                            AR order: i=0→id8(LEFT), i=1→id7(RIGHT)
 *   Block 3        verseId  [11]          — standalone pill, "yellow"
 *                                            (modeled on Alak's verse 5)
 *   Block 4        verseId  [12]          — standalone LONG non-pill capsule,
 *                                            orange, outside the main
 *                                            section (own elevation/drag zone)
 *
 * Only blocks 1 and 2 ("mid1"/"mid2") get side-curve brackets and pop-ups —
 * every other block sets `disablePopUp: true` and simply isn't flagged
 * `isCenter`, so it never enters the SideCurves bracket computation.
 *
 * The two middle sections each get their own independent "hug this block"
 * curve via the new `LayoutBlock.curveOverride` field (see schema.ts /
 * SideCurves.tsx) — previously only ONE such bracket was possible per surah.
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  ORANGE_THEME,
  GREEN_THEME,
  GREEN_VERSE_BG,
  CAPSULE_BG_6_19,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
} from "../theme";

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

// Middle section 1 (verses 3-6) — same blue/grey palette Ayat al-Kursi uses
// for its pushed-in center block.
const MID1_BG = "#ECF4F9";
const MID1_BORDER = "#7A9CAD";

// Middle section 2 (verses 7-10) — green theme.
const MID2_BG = GREEN_VERSE_BG; // "#eaf2db"
const MID2_BORDER = GREEN_THEME; // "#5E7367"

// Top block (1,2), verse 11, and verse 12 all share the same warm gold fill —
// only the border/circle colors differ: 11 is self-bordered ("yellow", like
// Alak's verse 5), while 1/2/12 get the distinct orange border.
const WARM_BG = CAPSULE_BG_6_19; // "#E5CFA4"

export const NISA_36_CONFIG: SurahLayoutConfig = {
  id: "nisa36",
  title: "Nisa suresi 36",
  heroTitle: "Nisa",
  heroSubtitle: "suresi 36",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 2,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    // Only the two middle sections pop up, each as row pairs — see
    // `disablePopUp` on the other blocks below.
    versePairings: {
      3: 4,
      4: 3,
      5: 6,
      6: 5,
      7: 8,
      8: 7,
      9: 10,
      10: 9,
    },
  },

  verseOverrides: {
    // ── Top block — verses 1, 2 (stacked, orange theme, no curve) ─────────
    // Non-pill + red text, same treatment as 11. Sized to 2/3 of Alak's
    // verse 6/19 (full-width target 0.89 → 0.593) — width via expandW,
    // height via the block's own capsuleHeight override, text via the
    // scale overrides below (all three reduced together this time so
    // nothing clips):
    //   colW = 0.423 (see block-width derivation) → expandW = (0.593-0.423)/2 ≈ 0.0852
    1: {
      bg: WARM_BG,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: WARM_BG,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
      isPill: false,
      expandW: 0.0852,
      expandH: 0.015,
      textScaleOverride: 0.667,
      translationTextScaleOverride: 0.467,
    },
    2: {
      bg: WARM_BG,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: WARM_BG,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
      isPill: false,
      expandW: 0.0852,
      expandH: 0.015,
      textScaleOverride: 0.667,
      translationTextScaleOverride: 0.467,
    },
    // ── Middle section 1 — verses 3,4,5,6 (blue, exact Ayat al-Kursi sizing)
    // ── Middle section 1 — verses 3,4,5,6 (blue, exact Ayat al-Kursi sizing)
    // block.verseIds=[4,3,6,5]: verse 4 is at LEFT slot, verse 3 at RIGHT slot.
    // displayNumber   = LTR reading order (TR/EN): LEFT=1, RIGHT=2, LEFT=3, RIGHT=4
    // arDisplayNumber = RTL reading order (Arabic): RIGHT=1, LEFT=2, RIGHT=3, LEFT=4
    3: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 2, // RIGHT slot → 2nd in LTR reading
      arDisplayNumber: 1, // RIGHT slot → 1st in RTL reading (right-to-left)
      expandW: -0.02,
    },
    4: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 1, // LEFT slot → 1st in LTR reading
      arDisplayNumber: 2, // LEFT slot → 2nd in RTL reading
      expandW: -0.02,
    },
    5: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 4, // RIGHT slot → 4th in LTR
      arDisplayNumber: 3, // RIGHT slot → 3rd in RTL
      expandW: -0.02,
    },
    6: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 3, // LEFT slot → 3rd in LTR
      arDisplayNumber: 4, // LEFT slot → 4th in RTL
      expandW: -0.02,
    },
    // ── Middle section 2 — verses 7,8,9,10 (green) ─────────────────────────
    // block.verseIds=[8,7,10,9]: verse 8 is at LEFT slot, verse 7 at RIGHT slot.
    7: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 6, // RIGHT slot → 6th in LTR
      arDisplayNumber: 5, // RIGHT slot → 5th in RTL
    },
    8: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 5, // LEFT slot → 5th in LTR
      arDisplayNumber: 6, // LEFT slot → 6th in RTL
    },
    9: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 8, // RIGHT slot → 8th in LTR
      arDisplayNumber: 7, // RIGHT slot → 7th in RTL
    },
    10: {
      bg: MID1_BG,
      border: MID1_BORDER,
      circleBorderCol: MID1_BG,
      circleBg: MID1_BG,
      circleTextCol: "#000000",
      showNumber: true,
      displayNumber: 7, // LEFT slot → 7th in LTR
      arDisplayNumber: 8, // LEFT slot → 8th in RTL
    },
    // ── Verse 11 — standalone, "yellow" (modeled on Alak's verse 5) ───────
    // Same 2/3-size treatment as 1/2 — see the comment there.
    11: {
      bg: WARM_BG,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: WARM_BG,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
      isPill: false,
      expandW: 0.0852,
      expandH: 0.015,
      textScaleOverride: 0.667,
      translationTextScaleOverride: 0.447,
    },
    // ── Verse 12 — standalone LONG non-pill capsule, orange theme, red text
    // Only verse on the page that shows a number badge — and it shows the
    // real ayah number (36), not its internal chunk id (12).
    12: {
      bg: WARM_BG,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: WARM_BG,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT,
      isPill: false,
      expandW: 0.2335,
      expandH: 0.01,
      showNumber: true,
      displayNumber: 36,
      textScaleOverride: 0.867,
      translationTextScaleOverride: 0.5,
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
      maroonTheme: ORANGE_THEME,
      greenTheme: MID2_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: WARM_BG, // top (1,2) / verse 11 / verse 12 frame bg
      s2Group1Bg: WARM_BG,
      s2Group2Bg: MID1_BG,
      s2Group3Bg: MID2_BG,
      // Curve for the outermost pair (block 0 and block 4).
      // We only want the left side.
      curveColors: [
        {
          color: ORANGE_THEME,
          fillColor: WARM_BG,
          curveSide: "left",
          bowGap: 0.34,
          innerBowGap: 0.32,
          tipThickness: 0.14,
          topAnchorYOffset: -0.05,
          topAnchorXOffset: 0.091,
          bottomAnchorYOffset: 0.03,
          bottomAnchorXOffset: 0.01,
        },
        { color: "transparent", fillColor: "transparent" },
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

  // capsuleHeight/columnGap/rowGap/blockPadding/sectionBorderWidth/connectorPad
  // match Ayat al-Kursi's pushed-in center block 1:1. blockGap/sectionPadX/
  // framePad are overridden to Alak's own values instead, per the brief:
  // "the 2 middle sections' capsule size + all the gaps between them must
  // match Alak's (green) middle section exactly."
  globalSettings: {
    capsuleHeight: 0.075,
    columnGap: 0.02,
    rowGap: 0.02,
    blockGap: 0.035, // Alak's groupGap
    sectionPadX: 0.035, // Alak's s2PadLeftRight
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.054, // Alak's s2VerticalPad
    contentStartYOverride: -0.545,
  },

  // Handwritten margin note, centered in the empty space below the content.
  // Content is auto-centered on the page (contentStartY ± totalContentH/2
  // around paperCenter = -0.935), so with the current block heights the
  // bottom empty band runs from content-bottom (-1.4325) to the paper's
  // own bottom edge (-1.825) — band center ≈ -1.629. `y` below is that
  // band-center offset by half the note's own rendered height so the whole
  // 7-line block sits centered in the gap, not just its top-left anchor.
  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.08,
      fontSize: 0.044,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "Nisa Suresi 36",
        },
      ],
    },
    {
      x: 0.77,
      y: -1.51,
      fontSize: 0.038,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          segments: [
            { text: "Ana-baba başta anılırken, kölenin sonda " },
            { text: "tek başına", color: "#8a4b3d" },
          ],
        },
        {
          text: "zikredilmesi dikkatleri özellikle ona yöneltiyor.",
        },
        {
          text: "Böylece iyiliğe en çok muhtac olan kimsenin köle",
        },
        {
          text: "olduğu, kelime dizilişiyle bile ince bir şekilde hissettiriliyor.",
        },
      ],
    },
  ],

  // Two drag/elevation zones: verses 1-11 together, verse 12 on its own.
  customSections: [
    {
      id: "section2_mid1",
      verseIds: [3, 4, 5, 6],
    },
    {
      id: "section2_mid2",
      verseIds: [7, 8, 9, 10],
    },
    {
      id: "section2_all",
      verseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      cameraTarget: { y: 1.2, fov: 28, tilt: -1.3 },
    },
    {
      id: "section2_main",
      verseIds: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      cameraTarget: { y: 1.2, fov: 28, tilt: -1.3 },
    },
    {
      id: "section2_v12",
      verseIds: [12],
      cameraTarget: { y: 0.8, fov: 35, tilt: -1.2 },
    },
  ],

  blocks: [
    // ── Block 0 — verses 1, 2 stacked, orange, NO curve, no pop-up ────────
    // 2/3 of Alak's verse 6/19 height (0.125 * 2/3 ≈ 0.0833) — see the
    // matching width/text-scale reduction on verseOverrides[1]/[2].
    {
      id: "section2_top",
      type: "group",
      verseIds: [1, 2],
      columns: 1,
      isCenter: false,
      capsuleHeight: 0.0833,
      rowGap: 0.055,
      bgThemeKey: "s2IntroOutroBg",
      disablePopUp: true,
      verticalNudge: -0.29, // Shifted down slightly to be closer to center
    },
    // ── Block 1 — Middle section 1 (verses 3,4,5,6) — blue, curve, pop-up ──
    {
      id: "section2_mid1",
      type: "group",
      verseIds: [4, 3, 6, 5],
      columns: 2,
      horizontalInset: 0.01,
      isCenter: true,
      bgThemeKey: "s2Group2Bg",
      curveOverride: {
        color: "transparent",
        fillColor: "transparent",
        bowGap: 0.1,
        innerBowGap: 0.095,
      },
      dragBehavior: "individual",
      verticalNudge: -0.21,
    },
    // ── Block 2 — Middle section 2 (verses 7,8,9,10) — green, curve, pop-up
    {
      id: "section2_mid2",
      type: "group",
      verseIds: [8, 7, 10, 9],
      columns: 2,
      horizontalInset: 0.01,
      isCenter: true,
      bgThemeKey: "s2Group3Bg",
      curveOverride: {
        color: "transparent",
        fillColor: "transparent",
        bowGap: 0.1,
        innerBowGap: 0.095,
      },
      dragBehavior: "individual",
      verticalNudge: 0.02,
    },
    // ── Block 3 — verse 11, standalone, "yellow", no pop-up ────────────────
    {
      id: "section2_v11",
      type: "group",
      verseIds: [11],
      columns: 1,
      isCenter: false,
      capsuleHeight: 0.0833,
      bgThemeKey: "s2IntroOutroBg",
      disablePopUp: true,
      verticalNudge: 0.01,
    },
    // ── Block 4 — verse 12, standalone LONG non-pill capsule, orange,
    //     outside the main section, own elevation/drag zone, no pop-up ─────
    {
      id: "section2_v12",
      type: "group",
      verseIds: [12],
      columns: 1,
      isCenter: false,
      bgThemeKey: "s2IntroOutroBg",
      disablePopUp: true,
      capsuleHeight: 0.125,
      verticalNudge: 0.05,
    },
  ],

  svgOverlays: [
    {
      src: "/nisa/all-section.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 0.75,
      scaleY: 0.35,
      offsetX: 0,
      offsetY: 0.015,
      renderOrder: 3,
      customSectionId: "section2_top",
    },
    {
      src: "/nisa/all-section.svg",
      anchorGroupIndex: 1,
      anchorEdge: "center",
      scaleX: 1,
      scaleY: 0.25,
      offsetX: 0,
      offsetY: 0.01,
      renderOrder: 3,
      customSectionId: "section2_mid1",
    },
    {
      src: "/nisa/all-section.svg",
      anchorGroupIndex: 2,
      anchorEdge: "center",
      scaleX: 1,
      scaleY: 0.25,
      offsetX: 0,
      offsetY: 0.01,
      renderOrder: 3,
      customSectionId: "section2_mid2",
    },
    {
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 3,
      anchorEdge: "center",
      scaleX: 1.05,
      scaleY: 0.76,
      offsetX: 0,
      offsetY: 0.28,
      renderOrder: 2,
      customSectionId: "section2_main",
    },

    // {
    //   src: "/nisa/curved-arrow.svg",
    //   scaleX: 0.74,
    //   scaleY: 1.18,
    //   offsetX: -0.48,
    //   offsetY: 0.15,
    //   renderOrder: 4,
    // },
    // {
    //   src: "/nisa/curved-arrow.svg",
    //   scaleX: -0.74, // Flipped
    //   scaleY: 1.18,
    //   offsetX: 0.48,
    //   offsetY: 0.15,
    //   renderOrder: 4,
    // },
    // {
    //   src: "/fatiha/all-section-bg.svg",
    //   anchorGroupIndex: 1,
    //   anchorEdge: "top",
    //   scaleX: 1.17,
    //   scaleY: 1.17,
    //   offsetX: 0,
    //   offsetY: -0.09,
    //   renderOrder: 1,
    //   customSectionId: "section2_all",
    // },
  ],
  animations: {
    computeFoldYPositions: (lm) => {
      const y = lm.groupYPositions;
      const h = lm.groupHeights;
      const fold0 = (y[0] - h[0] + y[1]) / 2 - 0.045; // between [1,2] and mid1
      const fold1 = y[1] - lm.groupPad - lm.smallBoxH2 - lm.rowGap / 2; // inside mid1
      const fold2 = (y[1] - h[1] + y[2]) / 2; // between mid1 and mid2
      const fold3 = y[2] - lm.groupPad - lm.smallBoxH2 - lm.rowGap / 2; // inside mid2
      const fold4 = (y[2] - h[2] + y[3]) / 2; // between mid2 and verse 11
      const fold5 = (y[3] - h[3] + y[4]) / 2; // between verse 11 and verse 12
      const fold6 = y[4] - h[4] - 0.04; // crease exactly under 12
      return [fold0, fold1, fold2, fold3, fold4, fold5, fold6];
    },

    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.6 },
          { direction: -1, angleFactor: 1.1 },
          { direction: 1, angleFactor: 1 },
          { direction: -1, angleFactor: 1.1 },
          { direction: 1, angleFactor: 0.6 },
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
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
          { direction: -1, angleFactor: 0 },
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
// TEXT DATA — Arabic (canonical)
// ---------------------------------------------------------------------------
// verse ordering inside each colorGroup must match the config's verseIds:
//   group 0: [i=0 → id 1, i=1 → id 2]
//   group 1: [i=0 → id 4, i=1 → id 3, i=2 → id 6, i=3 → id 5]
//   group 2: [i=0 → id 8, i=1 → id 7, i=2 → id 10, i=3 → id 9]
//   group 3: [i=0 → id 11]
//   group 4: [i=0 → id 12]
// ---------------------------------------------------------------------------

export const NISA_36_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "النساء ٣٦",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },

  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // ── Group 0 — top, verses 1, 2 ───────────────────────────────────────
      {
        verses: [
          { number: 1, text: "وَاعْبُدُوا اللَّهَ" },
          { number: 2, text: "وَلَا تُشْرِكُوا بِهِ شَيْئًا" },
        ],
      },
      // ── Group 1 — middle section 1 (blue) — AR RTL order: i=0→id4(LEFT), i=1→id3(RIGHT)
      {
        verses: [
          { number: 4, text: "وَبِذِي الْقُرْبَىٰ" },
          { number: 3, text: "وَبِالْوَالِدَيْنِ إِحْسَانًا" },
          { number: 6, text: "وَالْمَسَاكِينِ" },
          { number: 5, text: "وَالْيَتَامَىٰ" },
        ],
      },
      // ── Group 2 — middle section 2 (green) — AR RTL order: i=0→id8(LEFT), i=1→id7(RIGHT)
      {
        verses: [
          { number: 8, text: "وَالْجَارِ الْجُنُبِ" },
          { number: 7, text: "وَالْجَارِ ذِي الْقُرْبَىٰ" },
          { number: 10, text: "وَابْنِ السَّبِيلِ" },
          { number: 9, text: "وَالصَّاحِبِ بِالْجَنْبِ" },
        ],
      },
      // ── Group 3 — verse 11 (standalone) ──────────────────────────────────
      {
        verses: [{ number: 11, text: "وَمَا مَلَكَتْ أَيْمَانُكُمْ" }],
      },
      // ── Group 4 — verse 12 (standalone, long) ────────────────────────────
      {
        verses: [
          {
            number: 12,
            text: "إِنَّ اللَّهَ لَا يُحِبُّ مَنْ كَانَ مُخْتَالًا فَخُورًا",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish (verbatim from the provided reference)
// ---------------------------------------------------------------------------

export const NISA_36_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Nisa 36",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          { number: 1, text: "Yalnızca Allah'a ibadet edin," },
          { number: 2, text: "Ve Ondan başka İlah tanımayın." },
        ],
      },
      // LTR order — TR[i] maps to AR[i]'s spatial position via isLTR=true.
      // Verse numbers match actual verse IDs to ensure unique React keys.
      {
        verses: [
          { number: 3, text: "Ve önce ana-babaya," },
          { number: 4, text: "Sonra diğer yakınlara," },
          { number: 5, text: "Önce yetimlere," },
          { number: 6, text: "Sonra fakirlere," },
        ],
      },
      {
        verses: [
          { number: 7, text: "Önce yakın komşuya," },
          { number: 8, text: "Sonra uzak komşuya," },
          { number: 9, text: "Önce yol arkadaşına," },
          { number: 10, text: "Sonra yolcuya, garibe," },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "Ve özellikle de kölelere (hizmetçilere) iyi davranın ve iyilikte bulunun.",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "İyi bilin ki Allah; kendini beğenen, (büyüklenen) ve boş yere övünüp duran (kafirleri) sevmez.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English (translated FROM the Turkish rendering above, not a
// fresh literal rendering of the Arabic)
// ---------------------------------------------------------------------------

export const NISA_36_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "An-Nisa 36",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          { number: 1, text: "Worship Allah alone," },
          { number: 2, text: "and recognize no god besides Him." },
        ],
      },
      // LTR order — EN[i] maps to AR[i]'s spatial position via isLTR=true.
      // Verse numbers match actual verse IDs to ensure unique React keys.
      {
        verses: [
          { number: 3, text: "And first, to parents," },
          { number: 4, text: "then to other close relatives," },
          { number: 5, text: "first, to orphans," },
          { number: 6, text: "then to the poor," },
        ],
      },
      {
        verses: [
          { number: 7, text: "first, to the near neighbor," },
          { number: 8, text: "then to the distant neighbor," },
          { number: 9, text: "first, to the companion at your side," },
          {
            number: 10,
            text: "then to the traveler, the stranger far from home,",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "And treat those bound in your service well, and be especially good to them.",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "Know well that Allah does not love the self-admiring, the arrogant, and those who boast in vain.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// Aggregated text data (Record<SurahLanguage, SurahDataShape>)
// ---------------------------------------------------------------------------

export const NISA_36_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: NISA_36_TEXT_AR,
  en: NISA_36_TEXT_EN,
  tr: NISA_36_TEXT_TR,
};
