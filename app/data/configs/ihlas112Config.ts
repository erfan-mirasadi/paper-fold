import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";

const YELLOW_BG = "#EFE2C7";
const YELLOW_BORDER = "#BE9E63";
const GREEN_BG = "#eaf2db";
const GREEN_BORDER = "#5E7367";

export const IHLAS_112_CONFIG: SurahLayoutConfig = {
  id: "ihlas112",
  title: "İhlas Suresi",
  heroTitle: "İhlas Suresi",
  heroSubtitle: "Ihlas Suresi 112",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.2,
    scrollPages: 1.5,
  },

  specialVerses: {},

  verseOverrides: {
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#A30000",
      expandW: 0.1985,
      expandH: 0.0025,
      isPill: false,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.65,
    },
    2: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.05,
      translationTextAlign: "center",
    },
    3: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.05,
      translationTextAlign: "center",
    },
    4: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#A30000",
      expandW: 0.1985,
      expandH: 0.0025,
      isPill: false,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.65,
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
      maroonTheme: YELLOW_BORDER,
      greenTheme: GREEN_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: YELLOW_BG,
      s2Group1Bg: "transparent",
      s2Group2Bg: "transparent",
      s2Group3Bg: "transparent",
      curveColors: [
        {
          color: YELLOW_BORDER,
          fillColor: YELLOW_BG,
          curveSide: "symmetrical",
          bowGap: 0.25,
          innerBowGap: 0.24,
          topAnchorXOffset: 0.0,
          bottomAnchorXOffset: 0.0,
        },
        {
          color: GREEN_BORDER,
          fillColor: GREEN_BG,
          curveSide: "symmetrical",
          topAnchorXOffset: -0.02,
          bottomAnchorXOffset: -0.02,
        },
        {
          // Dummy transparent entry prevents a third SideCurves bracket from
          // appearing when there is no real third group pair.
          color: "transparent",
          fillColor: "transparent",
        },
      ],
    },
    capsuleBorderWidth: 0.0045,
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

  svgOverlays: [],

  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  globalSettings: {
    // Legacy params mapping:
    //   smallBoxH2: 0.12  → capsuleHeight
    //   s2Gap: 0.12       → columnGap
    //   s2VerticalRowGap: 0.02 → rowGap
    //   groupGap: 0.025   → blockGap
    //   s2PadLeftRight: 0.005 → sectionPadX
    //   groupPad: 0.012   → blockPadding
    //   sgBorderWidth: 0.006 → sectionBorderWidth
    //   verseTextScale: 1.6, translationVerseTextScale: 1.1
    capsuleHeight: 0.12,
    columnGap: 0.12,
    rowGap: 0.02,
    blockGap: 0.025,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    verseTextScale: 1.6,
    translationVerseTextScale: 1.1,
  },

  // Section-wide resting-state background — was incorrectly attached to
  // block0 alone, which also made it (wrongly) render as block0's own small
  // elevated/all-sections frame instead of the whole section's.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 0.9,
    scaleY: 1.3,
    offsetY: 0.046,
    solidScaleX: 0.87,
    solidScaleY: 0.85,
  },

  blocks: [
    // Block 0 — Verse 1 (full-width yellow, not pushed in)
    {
      id: "section2",
      type: "group",
      verseIds: [1],
      columns: 1,
      // outerScale was 0.0 for Ihlas → no push-out, standard width.
      // isPushedIn: false → horizontalInset: 0
      horizontalInset: 0,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // Block 1 — Verse 2 (single column, pushed in)
    {
      id: "section2_main", // carries the customSection id for unified elevation drag
      type: "group",
      verseIds: [2],
      columns: 1,
      // g2Scale: 0.0 → no explicit scale offset; isPushedIn: true → inset inward
      horizontalInset: 0.04, // small push-in (approximates legacy isPushedIn visual)
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      customSectionId: "section2_main",
    },
    // Block 2 — Verse 3 (single column, pushed in, slight pushDown compensation)
    {
      id: "section2_g2",
      type: "group",
      verseIds: [3],
      columns: 1,
      horizontalInset: 0.04,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      verticalNudge: -0.03,
      // Legacy had pushDown: -0.03 to compensate for extra gap above.
      // In the block engine the auto-centering handles this, so no offset needed.
    },
    // Block 3 — Verse 4 (full-width yellow, not pushed in)
    {
      id: "section2_g3",
      type: "group",
      verseIds: [4],
      columns: 1,
      horizontalInset: 0,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
  ],

  // customSections maps a virtual drag/elevation zone across all 4 blocks.
  customSections: [
    {
      id: "section2_main",
      verseIds: [1, 2, 3, 4],
      cameraTarget: { y: 1.4, fov: 27.5, tilt: -1.4 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i.
      // groupHeights[i]    = frameH of block i.
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold2 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      const fold3 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
        2;
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

export const IHLAS_112_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "الإخلاص",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" }],
      },
      {
        verses: [{ number: 2, text: "اللَّهُ الصَّمَدُ" }],
      },
      {
        verses: [{ number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" }],
      },
      {
        verses: [{ number: 4, text: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ" }],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Al-Ikhlas",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Say, He is Allah, the One" }],
      },
      {
        verses: [{ number: 2, text: "Allah is Samet :" }],
      },
      {
        verses: [
          { number: 3, text: "He has not begotten and has not been begotten" },
        ],
      },
      {
        verses: [
          { number: 4, text: "And nothing is equal and equivalent to Him" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "İhlas Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Söyle, O Allah tek'tir" }],
      },
      {
        verses: [{ number: 2, text: "Allah, Samet'tir :" }],
      },
      {
        verses: [{ number: 3, text: "Doğurmamış ve doğurulmamıştır" }],
      },
      {
        verses: [
          { number: 4, text: "Ve hiçbir şey Onun eşiti ve dengi değildir" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: IHLAS_112_TEXT_AR,
  en: IHLAS_112_TEXT_EN,
  tr: IHLAS_112_TEXT_TR,
};
