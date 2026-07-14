import type { SurahLayoutConfig } from "../../schema";
import type { SurahDataShape } from "../../SurahConfig";
import type { SurahLanguage } from "../../../hooks/useSurahLanguageStore";

import {
  ORANGE_THEME,
  MAROON_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_9_10_15_16,
  S1_VERSE_5_TEXT,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
} from "../../theme";

// ── LAYOUT ──────────────────────────────────────────────────────────────────
// Fatiha 4 — verses 2–7 only (Bismillah = 3D overlay, no verse 1 capsule).
//
// Each cluster is a "pyramid": the orange verse sits alone, centered on the
// full paper width, with its blue pair centered directly below it (same
// mutual columnGap the pair always had) — see fatiha2Config.ts's g1/g2 for
// the identical established pattern:
//
//   Cluster 1:      [2]          ← orange, solo, centered
//               [4]     [3]      ← blue pair, below
//
//   Cluster 2:      [5]          ← orange, solo, centered
//               [7]     [6]      ← blue pair, below
//
// Elevation / drag grouping (via customSections):
//   • verses 2, 3, 4 → section2_v234 (elevate together)
//   • verses 5, 6, 7 → section2_v567 (elevate together)
//
// SVG overlays (frame-section-1.svg):
//   • cluster 1 frame spans g1a+g1b, linked to section2_v234
//   • cluster 2 frame spans g2a+g2b, linked to section2_v567
// ---------------------------------------------------------------------------

const EXPAND_H = 0.05; // uniform so both blocks have identical heights
const EXPAND_W = 0.09; // uniform capsule expand for verses 2–7

// Geometry constants (mirrors the literals below in `dimensions` /
// `globalSettings` — hoisted here so the split-block derivation below stays
// exact if those ever change).
const PAPER_WIDTH = 1.54;
const PAGE_PADDING = 0.29;
const SECTION_PAD_X = 0.04;
const BLOCK_PADDING = 0.014;
const COLUMN_GAP = 0.06; // global columnGap — drives colW for columns<=2 blocks
const ROW_COL_GAP = 0.2; // mutual gap between capsules in a row (position AND, for columns>2, width)

// Vertical gap between the solo verse and its pair below — same for both
// clusters, so the two "pyramids" read as symmetric.
const PAIR_GAP = 0.1;

// ── Reproduce the ORIGINAL 3-up row's capsule width in the split blocks ────
// The layout engine's `columns <= 2` width formula always divides by the
// GLOBAL columnGap (not a block override — see SurahConfig.ts's `colGap` vs
// `colGapForPosition`), so a plain columns:1/2 block renders each capsule
// far WIDER than it was in the original 3-column row. `horizontalInset`
// shrinks a block's own content width (and cancels out of centerX, so
// horizontal centering is unaffected) — used here to force the split
// blocks' capsules back to the exact original size instead of stretching.
const CONTENT_W = PAPER_WIDTH - PAGE_PADDING * 2;
const SECTION_INNER_W = CONTENT_W - SECTION_PAD_X * 2;
const ORIGINAL_COL_W =
  (SECTION_INNER_W - BLOCK_PADDING * 2 - ROW_COL_GAP * 2) / 3;
const SPLIT_ROW_INNER_W = ORIGINAL_COL_W * 2 + BLOCK_PADDING * 2 + COLUMN_GAP;
const SPLIT_ROW_INSET = (SECTION_INNER_W - SPLIT_ROW_INNER_W) / 2;

// A single-row block's frame height: blockPadding*2 + capsuleHeight.
const SUB_ROW_H = BLOCK_PADDING * 2 + 0.1;
// Same per-side decorative margin the original single-row frame used
// (frame-section-1.svg at scaleY 0.27 around a 0.128-tall block).
const FRAME_MARGIN = 0.27 - SUB_ROW_H;
const CLUSTER_H = SUB_ROW_H * 2 + PAIR_GAP;

// Frame width: sized to the PAIR (the cluster's widest row), preserving the
// same per-side decorative margin the original 3-up row's frame had.
const ROW_SPAN_ORIGINAL = 3 * ORIGINAL_COL_W + 2 * ROW_COL_GAP + 2 * EXPAND_W;
const FRAME_MARGIN_X = (1.17 - ROW_SPAN_ORIGINAL) / 2;
const PAIR_SPAN = 2 * (ORIGINAL_COL_W + EXPAND_W) + ROW_COL_GAP;
const CLUSTER_FRAME_SCALE_X = PAIR_SPAN + 2 * FRAME_MARGIN_X;

export const FATIHA_4_CONFIG: SurahLayoutConfig = {
  id: "fatiha4",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  scriptInfo: {
    title: "1 Fâtiha",
    sayfa: 1,
    juz: 1,
    hizb: 1,
  },

  // Fold-story → script sync: which script verses light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 2, 5],
    end: [1, 2, 3, 4, 5, 6, 7],
  },
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: false,
    hideBismillah3D: true, // verse 1 capsule replaces the 3D overlay
  },
  dimensions: {
    paperWidth: PAPER_WIDTH,
    paperHeight: 1.78,
    sceneCenterYOffset: 0,
    padding: PAGE_PADDING,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },
  specialVerses: {
    versePairings: {
      3: 4,
      4: 3,
      5: 6,
      6: 5,
    },
  },
  verseOverrides: {
    // ── Verse 1 — Bismillah, solo wide pill, centered above the two rows ─────
    1: {
      isPill: false,
      expandW: 0.17,
      expandH: 0.025,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.55,
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
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.55,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    3: {
      isPill: false,
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    4: {
      isPill: false,
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Row 2 ────────────────────────────────────────────────────────────────
    5: {
      isPill: false,
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.7, // further reduced
      translationTextScaleOverride: 0.55,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT,
    },
    6: {
      isPill: false,
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.45,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      isPill: false,
      expandW: EXPAND_W,
      expandH: EXPAND_H,
      textScaleOverride: 0.5,
      translationTextScaleOverride: 0.6,
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
    columnGap: COLUMN_GAP,
    rowGap: 0.05,
    blockGap: 0.18,
    sectionPadX: SECTION_PAD_X,
    blockPadding: BLOCK_PADDING,
    sectionBorderWidth: 0.006,
    connectorPad: 0.025,
    tightVersePadding: true,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.08,
      fontSize: 0.048,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "Fatiha suresi",
        },
      ],
    },
  ],

  blocks: [
    // ── Verse 1: Bismillah — single column, centered ─────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [1],
      columns: 1,
      isCenter: false,
      dragBehavior: "individual",
      customSectionId: "section2_v1",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
      verticalNudge: 0.06,
    },
    // ── Cluster 1a: verse 2 — solo, centered on the paper width ──────────
    // horizontalInset shrinks this block back to the original 3-up capsule
    // width (see SPLIT_ROW_INSET derivation above) — size unchanged, only
    // the position (now alone, centered) changed.
    {
      id: "section2_g1a",
      type: "group",
      verseIds: [2],
      columns: 1,
      horizontalInset: SPLIT_ROW_INSET,
      isCenter: false,
      dragBehavior: "group",
      customSectionId: "section2_v234",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── Cluster 1b: verses [4, 3] — pair below verse 2, no connectors ────
    {
      id: "section2_g1b",
      type: "group",
      verseIds: [4, 3],
      columns: 2,
      columnGap: ROW_COL_GAP, // Same mutual gap the pair always had
      horizontalInset: SPLIT_ROW_INSET, // Same original capsule width as g1a
      gapBefore: PAIR_GAP,
      isCenter: false,
      hideRowConnectors: true,
      dragBehavior: "group",
      customSectionId: "section2_v234",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── Cluster 2a: verse 5 — solo, centered on the paper width ──────────
    {
      id: "section2_g2a",
      type: "group",
      verseIds: [5],
      columns: 1,
      horizontalInset: SPLIT_ROW_INSET,
      gapBefore: 0.16, // Same cluster1→cluster2 gap as before the split
      isCenter: false,
      dragBehavior: "group",
      customSectionId: "section2_v567",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── Cluster 2b: verses [7, 6] — pair below verse 5, no connectors ────
    {
      id: "section2_g2b",
      type: "group",
      verseIds: [7, 6],
      columns: 2,
      columnGap: ROW_COL_GAP, // Same mutual gap the pair always had
      horizontalInset: SPLIT_ROW_INSET, // Same original capsule width as g2a
      gapBefore: PAIR_GAP,
      isCenter: false,
      hideRowConnectors: true,
      dragBehavior: "group",
      customSectionId: "section2_v567",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  svgOverlays: [
    // ── Section background (static, behind everything) ────────────────────────
    // {
    //   src: "/nisa/all-section-1.svg",
    //   anchorGroupIndex: 1,
    //   anchorEdge: "top",
    //   scaleX: 1.03,
    //   scaleY: 1.47,
    //   offsetX: 0,
    //   offsetY: -0.275,
    //   renderOrder: 1,
    // },
    // ── Bismillah frame — verse 1 ───
    // {
    //   src: "/ayatalKursi/frame-section-1.svg",
    //   anchorGroupIndex: 0,
    //   anchorEdge: "center",
    //   scaleX: 1.17,
    //   scaleY: 0.27,
    //   offsetX: 0,
    //   offsetY: 0,
    //   renderOrder: 3,
    //   customSectionId: "section2_v1",
    // },
    // ── Bismillah frame — cluster 1 (verse 2 solo + [4,3] pair below) ────
    // Anchored to g1a's TOP edge, then scaled/offset down to span through
    // g1b's frame too — same technique as fatiha2Config.ts's "234" overlay.
    {
      src: "/nisa/all-section.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: CLUSTER_FRAME_SCALE_X - 0.065,
      scaleY: CLUSTER_H + FRAME_MARGIN + 0.05,
      offsetX: 0,
      offsetY: -CLUSTER_H / 2 + 0.02,
      // rotationZ: -Math.PI / 2,
      renderOrder: 3,
      customSectionId: "section2_v234",
    },
    // ── Bismillah frame — cluster 2 (verse 5 solo + [7,6] pair below) ────
    {
      src: "/nisa/all-section.svg",
      anchorGroupIndex: 3,
      anchorEdge: "top",
      scaleX: CLUSTER_FRAME_SCALE_X - 0.065,
      scaleY: CLUSTER_H + FRAME_MARGIN + 0.05,
      offsetX: 0,
      offsetY: -CLUSTER_H / 2 + 0.02,
      // rotationZ: -Math.PI / 2,
      renderOrder: 3,
      customSectionId: "section2_v567",
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
    // Row 1 — verses 2, 3, 4 elevate together
    {
      id: "section2_v234",
      verseIds: [2, 3, 4],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Row 2 — verses 5, 6, 7 elevate together
    {
      id: "section2_v567",
      verseIds: [5, 6, 7],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // 5 blocks: [0]=verse1, [1]=g1a(2), [2]=g1b(4,3), [3]=g2a(5), [4]=g2b(7,6)
      // Only 2 physical creases (v1 ↔ cluster1, cluster1 ↔ cluster2) — the
      // solo/pair split inside each cluster is a layout-only gap, not a fold.
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold1 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
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
          { number: 5, text: "إِيَّاكَ نَعْبُدُ\nوَإِيَّاكَ نَسْتَعِينُ" },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ\nغَيْرِ الْمَغْضُوبِ عَلَيْهِمْ\nوَلَا الضَّالِّينَ",
          },
          { number: 6, text: "اهْدِنَا الصِّرَاطَ\nالْمُسْتَقِيمَ" },
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
          { number: 2, text: "All praise is to Allah, Lord of the Worlds !" },
        ],
      },
      {
        verses: [
          { number: 3, text: "The Most Gracious, the Most Merciful." },
          { number: 4, text: "Owner of the Day of Judgment." },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "We worship You alone and we ask for help from You alone.",
          },
        ],
      },
      {
        verses: [
          { number: 6, text: "Show us the straight path." },
          {
            number: 7,
            text: "That path is the path You taught the Prophet, not the path of those who have earned anger and of those who have gone astray.",
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
          { number: 2, text: "Tüm övgüler Allaha, Alemlerin Rabbine !" },
        ],
      },
      {
        verses: [
          { number: 3, text: "Rahmandır, Rahimdir." },
          { number: 4, text: "Din gününün sahibidir." },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "Yalnız sana ibadet ediyoruz ve yalnız senden yardım istiyoruz.",
          },
        ],
      },
      {
        verses: [
          { number: 6, text: "Bize doğru yolu göster." },
          {
            number: 7,
            text: "O yol, Peygambere öğrettiğin yoldur, gazap ettiklerinin ve sapmışların yolu değil.",
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
