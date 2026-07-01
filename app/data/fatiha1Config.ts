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

// ── LAYOUT TUNING ──────────────────────────────────────────────────────────
// Adjust this single value to move the cluster 2-3-4 up/down relative to
// the cluster 5-6-7. Positive = cluster 2-3-4 moves UP (gap grows).
// At the correct value the midpoint of the gap lands on the page center.
const CLUSTER_SHIFT = -0.1;

export const FATIHA_1_CONFIG: SurahLayoutConfig = {
  id: "fatiha1",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
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
      3: 4,
      4: 3,
      6: 7,
      7: 6,
    },
  },
  // NOTE on expandW values below: Fatiha's own globalSettings (sectionPadX
  // 0.08, blockPadding 0.02, columnGap 0.03) leave a narrower base column
  // width than Kafirun's (sectionPadX 0.028, blockPadding 0.012, columnGap
  // 0.02) or Ayat al-Kursi's (sectionPadX 0.08, blockPadding 0.012,
  // columnGap 0.02, wider sectionW from padding 0.15 vs 0.29). Copying the
  // same expandW numbers verbatim therefore renders a visibly narrower
  // capsule — expandW here is solved per-verse so the FINAL rendered width
  // (colW + 2*expandW) matches the target surah's final width exactly:
  //   Fatiha colW (inset 0) = 0.365
  //   Kafirun verse1/6 final width  = 0.94  → expandW = (0.94-0.365)/2  = 0.2875
  //   Ayat-al-Kursi top/bottom block final width (no expand) = 0.518
  //                                  → expandW = (0.518-0.365)/2 = 0.0765
  verseOverrides: {
    1: {
      isPill: false,
      expandW: 0.2875,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    2: {
      isPill: false,
      expandW: 0.2875,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    3: {
      expandW: 0.0442, // 0.0486 / 1.1
      bg: CAPSULE_BG_9_10_15_16, // Blue theme
      border: MAROON_THEME, // Slate blue border
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    4: {
      expandW: 0.0442, // 0.0486 / 1.1
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    5: {
      isPill: false,
      expandW: 0.2875,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    6: {
      expandW: 0.0442, // synced with v3&v4, then /1.1
      expandH: 0.018, // Ayat al-Kursi capsule size, slightly taller
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      expandW: 0.0442, // synced with v3&v4, then /1.1
      expandH: 0.018, // Ayat al-Kursi capsule size, slightly taller
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
          inwardOffset: 0.015,
          bowGap: 0.32,
          innerBowGap: 0.31,
          tipThickness: 0.13,
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
  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  // Legacy params mapping:
  //   smallBoxH2: 0.075      → capsuleHeight
  //   s2Gap: 0.03            → columnGap
  //   s2VerticalRowGap: 0.02 → rowGap
  //   groupGap + middleExtraGap (0.05 + 0.01) → blockGap
  //   s2PadLeftRight: 0.08   → sectionPadX
  //   groupPad: 0.02         → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  //   s2VerticalPad: 0.1     → framePad
  //
  // NOTE: the legacy `sections[0].svgOverlays` (2 entries, "/fatiha/section-frame.svg")
  // were never actually rendered — every consumer reads the top-level
  // `config.svgOverlays`, not the per-section one — so they were already dead
  // config. Intentionally NOT carried over here to avoid introducing a new
  // (previously-invisible) visual element.
  globalSettings: {
    capsuleHeight: 0.075,
    columnGap: 0.03,
    rowGap: 0.02,
    blockGap: 0.06,
    sectionPadX: 0.08,
    blockPadding: 0.02,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.1,
  },

  // Section-wide resting-state background is intentionally omitted here —
  // Fatiha renders 3 independent section frames instead of one whole-stack
  // frame, via `svgOverlays` below (the same mechanism ahzab35Config.ts
  // uses — rendered unconditionally in BlockRenderer's resting-page pass,
  // not gated behind elevation/all-sections mode like `backgroundTexture`).

  blocks: [
    {
      id: "section2_g0",
      type: "group",
      verseIds: [1],
      columns: 1,
      horizontalInset: 0,
      isCenter: false,
      verticalNudge: -0.05,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Verses 2, 4, 3 form one visual/elevation section (see `customSections`
    // and `svgOverlays` below).
    {
      id: "section2_g1",
      type: "group",
      verseIds: [2],
      columns: 1,
      horizontalInset: 0,
      isCenter: false,
      // Negative nudge → moves this block AND all subsequent blocks UP.
      // Compensated by +CLUSTER_SHIFT on g3 so only 2-3-4 shift up.
      verticalNudge: -CLUSTER_SHIFT,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g2",
      type: "group",
      verseIds: [4, 3],
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      // colGapForPosition = targetVisualGap + 2*expandW = 0.02 + 2*0.0442 = 0.108
      // so the visual gap between capsules 4 & 3 matches kafirun's middle section.
      columnGap: 0.108,
      // Negative nudge → pulls 4-3 pair closer to verse 2 above it.
      // Cascades down, compensated by +0.04 on g3.
      verticalNudge: -0.03,
      dragBehavior: "pair",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // Verses 5, 7, 6 form the second unified section.
    {
      id: "section2_g3",
      type: "group",
      verseIds: [5],
      columns: 1,
      horizontalInset: 0,
      isCenter: false,
      // +CLUSTER_SHIFT cancels the cascade from g1's nudge, so 5-6-7 stay
      // centered and only 2-3-4 shift upward.
      // +0.04 compensates the cascade from g2's -0.04 nudge.
      verticalNudge: CLUSTER_SHIFT + 0.27,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g4",
      type: "group",
      verseIds: [7, 6],
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      // colGapForPosition = targetVisualGap + 2*expandW = 0.02 + 2*0.0442 = 0.108
      // so the visual gap between capsules 7 & 6 matches kafirun's middle section.
      columnGap: 0.108,
      // Negative nudge → pulls 7-6 pair closer to verse 5 above it.
      verticalNudge: -0.03,
      dragBehavior: "pair",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  // Decorative section frames — same mechanism as ahzab35Config.ts's
  // `svgOverlays`: rendered as flat 1×1 planes scaled directly to
  // `scaleX`×`scaleY` world units, anchored to a block index + edge.
  // anchorGroupIndex is the flat block index (0=verse1, 1=verse2, 3=verse5).
  svgOverlays: [
    {
      src: "/fatiha/bismillah-frame-2.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 1.1,
      scaleY: 0.22, // preserve the svg's native aspect
      offsetX: 0,
      offsetY: 0,
      renderOrder: 10,
      customSectionId: "section2_v1",
    },
    {
      // Spans down through section2_g2's frame too (blockPadding*2 +
      // capsuleHeight, twice, + blockGap = 0.115 + 0.06 + 0.115 = 0.29).
      src: "/fatiha/bismillah-frame-2.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 1.09,
      scaleY: 0.45,
      offsetX: 0,
      offsetY: -0.105,
      renderOrder: 3,
      customSectionId: "section2_v234",
    },
    {
      src: "/fatiha/bismillah-frame-2.svg",
      anchorGroupIndex: 3,
      anchorEdge: "top",
      scaleX: 1.09,
      scaleY: 0.45,
      offsetX: 0,
      offsetY: -0.105,
      renderOrder: 3,
      customSectionId: "section2_v567",
    },
  ],

  // Cross-block elevation zones: verse 1 alone, verses 2+3+4 unified,
  // verses 5+6+7 unified (mirrors the pattern in ihlas112Config.ts /
  // ayatAlKursiConfig.ts).
  customSections: [
    {
      id: "section2_v1",
      verseIds: [1],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v234",
      verseIds: [2, 4, 3],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v567",
      verseIds: [5, 7, 6],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
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
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0.5 },
          { direction: 1, angleFactor: 1 },
          { direction: 1, angleFactor: 1 },
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
          { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
          { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
        ],
      },
      {
        verses: [
          { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
        ],
      },
      {
        verses: [
          { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          },
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
            text: "In the name of Allah ! For He is the Most Gracious, the Most Merciful.",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "All praise is to Allah, Lord of the Worlds !",
          },
        ],
      },
      {
        verses: [
          { number: 4, text: "The Most Gracious, the Most Merciful." },
          { number: 3, text: "Owner of the Day of Judgment." },
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
          { number: 7, text: "Show us the straight path." },
          {
            number: 6,
            text: "That path is the path You taught the Prophet, not the path of those who have earned anger and of those who have gone astray.",
          },
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
        verses: [
          { number: 1, text: "Allah adına ! ki O Rahmandır, Rahimdir." },
        ],
      },
      {
        verses: [
          { number: 2, text: "Tüm övgüler Allaha, Alemlerin Rabbine !" },
        ],
      },
      {
        verses: [
          { number: 4, text: "Rahmandır, Rahimdir." },
          { number: 3, text: "Din gününün sahibidir." },
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
          { number: 7, text: "Bize doğru yolu göster." },
          {
            number: 6,
            text: "O yol, Peygambere öğrettiğin yoldur, gazap ettiklerinin ve sapmışların yolu değil.",
          },
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
