import { SurahLayoutConfig } from "./schema";
import {
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
  ORANGE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
} from "./theme";

export const ALAK_LAYOUT_CONFIG: SurahLayoutConfig = {
  id: "alak",
  title: "ALAK SURESİ",
  heroTitle: "Alak",
  heroSubtitle: "suresi",
  features: {
    hasIntro: true,
    hasElevatedSections: true,
    hasPopUps: true,
  },
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 6,
  },
  specialVerses: {
    middleFoldVerses: { left: [12, 14], right: [11, 13] },
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      7: 8,
      8: 7,
      9: 10,
      10: 9,
      11: 12,
      12: 11,
      13: 14,
      14: 13,
      15: 16,
      16: 15,
      17: 18,
      18: 17,
    },
  },
  introMedia: {
    section1_start: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: false,
      },
    },
    section1_zoom: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: true,
      },
    },
    section1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İnsanlara oku!",
        titleSize: "text-[11vw] md:text-[8.5vw] leading-[1.05]",
      },
    },
    section1_step1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title:
          "Alak suresi, insanlığın ufkunda doğan İlahi bir güneş gibi\nMuhammed aleyhisselama peygamberlik tacının giydirildiğini\nbütün cihana ilan etmiş ve müjdelemiştir",
        titleSize: "text-[5.5vw] md:text-[3.5vw] leading-[1.2]",
      },
    },
    section1_step2: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Tebliğ\nirşad vazifesinin \ntarifi tebliği",
      },
    },
    section1_step3: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
      },
    },
    section2_g0: {
      src: "/intro/section-2.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in dünyası",
        title: "Tuğyan\n zulüm\ninkâr \nistiğna",
      },
    },
    section2_g1: {
      src: "/intro/section-3.mp4",
      isVideo: true,
      backgroundText: {
        title: "Dışarıdan bakanlara\n hitap",
      },
    },
    section2_g2: {
      src: "/intro/section-4.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in ahireti",
        title: "Tuğyanın\n zulmün\n inkârın \nkarşılığı",
      },
    },
  },
  introGuides: {
    section1: "Ana bölüm",
    section2_g0: "1. Açıklama bölümü",
    section2_g1: "Orta bölüm",
    section2_g2: "2. Açıklama bölümü",
  },
  assets: {},
  verseOverrides: {
    // ── Section 1 verse 5 ─────────────────────────────────────────────────
    5: {
      customFrameSvg: "/alak/Group 11.svg",
      expandW: 0.035,
      expandH: 0.01,
      frameScaleLTR: 1.1,
      isPill: false,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT,
      hasCapsuleLabel: true,
    },
    // ── Section 2 intro verse (6) ─────────────────────────────────────────
    // isPill:false is needed so the paper-mask radius (VERSE_5_6_19_RADIUS)
    // matches the actual rendered shape — BlockRenderer's dedicated
    // introVerse path always renders it non-pill regardless of this flag.
    6: {
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      isPill: false,
    },
    // ── Group 1 outer rows (7, 8) ─────────────────────────────────────────
    7: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    8: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 1 inner rows (9, 10) ────────────────────────────────────────
    9: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    10: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 2 center (11, 12, 13, 14) ──────────────────────────────────
    11: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    12: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    13: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    14: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    // ── Group 3 inner rows (15, 16) ───────────────────────────────────────
    15: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    16: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 3 outer rows (17, 18) ───────────────────────────────────────
    17: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    18: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Section 2 outro verse (19) ────────────────────────────────────────
    19: {
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      isPill: false,
    },
  },
  styling: {
    colors: {
      paperBase: "#E4DFCA",
      shadow: "#000000",
      backface: "#e8e4d8",
      textDark: "#333333", // Assuming some dark hex
      textLabel: "#555555", // Assuming some label hex
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
      greenTheme: GREEN_THEME,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: ORANGE_THEME,
      s2Group1Bg: MAROON_THEME,
      s2Group2Bg: GREEN_THEME,
      s2Group3Bg: MAROON_THEME,
      /**
       * Bracket color sequence for SideCurves, outermost → center.
       * Index 0–2 = outer brackets (blue → maroon → maroon).
       * Index 3   = center bracket (green).
       */
      curveColors: [
        {
          color: ORANGE_THEME,
          fillColor: CAPSULE_BG_6_19,
          topAnchorXOffset: 0.01,
          bottomAnchorXOffset: 0.01,
        },
        {
          color: MAROON_THEME,
          fillColor: CAPSULE_BG_7_8_17_18,
          topAnchorXOffset: 0.009,
          bottomAnchorXOffset: 0.009,
        },
        {
          color: MAROON_THEME,
          fillColor: CAPSULE_BG_9_10_15_16,
          topAnchorXOffset: 0.008,
          bottomAnchorXOffset: 0.008,
        },
        { color: GREEN_THEME, fillColor: CAPSULE_BG_12_14 },
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
    s1NeonConfig: {
      haloPad: 0.014,
      haloZ: -0.001,
      haloOpacity: 0.36,
      haloEmissiveIntensity: 4.2,
      outerHaloPad: 0.026,
      outerHaloOpacity: 0.16,
      outerHaloEmissiveIntensity: 2.4,
      topLabelGapWidth: 0.425,
      topLabelGapPadding: 0.01,
      topLabelGapHeight: 0.058,
      topLabelGapYOffset: 0.022,
    },
  },
  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  // Legacy params mapping:
  //   smallBoxH2: 0.075      → capsuleHeight
  //   s2Gap: 0.02            → columnGap
  //   s2VerticalRowGap: (unset, falls back to s2Gap) → rowGap
  //   groupGap: 0.035        → blockGap (middleExtraGap 0.03 applied via
  //                             verticalNudge on g1/g2 below — see note there)
  //   s2PadLeftRight: 0.035  → sectionPadX
  //   groupPad: 0.012        → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  //   s2VerticalPad: 0.054   → framePad
  //   boxExtOffset: 0.02     → boxExtOffset
  globalSettings: {
    capsuleHeight:      0.075,
    columnGap:           0.02,
    rowGap:              0.02,
    blockGap:            0.035,
    sectionPadX:         0.035,
    blockPadding:        0.012,
    sectionBorderWidth:  0.006,
    connectorPad:        0.03,
    framePad:            0.054,
    boxExtOffset:        0.02,
    contentStartYOverride: -0.06, // was the hand-tuned fixed s1Top (Alak does not auto-center)
    capsuleLabelW:            0.2,
    capsuleLabelH:            0.032,
    capsuleLabelBorderWidth:  0.0035,
    capsuleLabelDrop:         0.015,
  },

  blocks: [
    // ── Section 1 — grid + AnaAyet ─────────────────────────────────────────
    {
      id: "section1",
      type: "grid",
      verseIds: [2, 1, 4, 3],
      anaAyetId: 5,
      capsuleHeight: 0.07,   // was smallBoxH
      rowGap: 0.02,          // was gap
      blockPadding: 0.045,   // was s1Pad
      fixedHeight: 0.132,    // AnaAyet height, was anaAyetH
      anaAyetGap: 0.05,      // was s1AnaGap
      anaAyetYOffset: -0.01, // was the hardcoded ANA_AYET_Y_OFFSET
      bgThemeKey: "s1InnerBorder",
      labelKey: "section1Label",
      // Surah-wide Section 2 title labels — declared here (on Section 1)
      // purely as a stable single source; ElevatedSectionLabels anchors them
      // to the first/last "real" section2 group regardless of which block
      // declares the key.
      topLabelKey: "section2TopLabel",
      bottomLabelKey: "section2BottomLabel",
      cameraTarget: { y: 2, fov: 20, tilt: -1.3 },
    },
    // ── Intro verse (6) — merges into section2_g0's elevation zone ────────
    {
      id: "section2_intro",
      type: "group",
      verseIds: [6],
      columns: 1,
      capsuleHeight: 0.125, // was bigBoxH
      blockPadding: 0,
      isCenter: false,
      introOutroRole: "intro",
      customSectionId: "section2_g0",
      // was gapBetweenS1andS2 (0.09) + s2VerticalPad (0.054) — legacy derives
      // the intro verse's Y as `s2Top - s2VerticalPad`, where s2Top is
      // already offset from Section 1 by gapBetweenS1andS2, so both gaps
      // stack here.
      gapBefore: 0.144,
    },
    // ── Group 0 (top, not pushed in) ───────────────────────────────────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [8, 7, 10, 9],
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group1Bg",
      cameraTarget: { y: 1.4, fov: 25, tilt: -1.3 }, // was subCameraTargets.top
    },
    // ── Group 1 (center, pushed in, group-drag) ────────────────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [12, 11, 14, 13],
      horizontalInset: 0.01, // was g2Scale
      isCenter: true,
      dragBehavior: "group",
      bgThemeKey: "s2Group2Bg",
      // Legacy quirk, preserved: `middleExtraGap` (0.03) is added on top of
      // the standard blockGap for BOTH inner gaps (g0→g1, g1→g2). Each real
      // group's own verticalNudge cascades forward, so giving g1 AND g2
      // their own +0.03 nudge reproduces legacy's cumulative 2x offset by g2
      // exactly (verified numerically).
      verticalNudge: 0.03,
      cameraTarget: { y: 1, fov: 30, tilt: -1.5 }, // was subCameraTargets.center
    },
    // ── Group 2 (bottom, not pushed in) ────────────────────────────────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [16, 15, 18, 17],
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group3Bg",
      verticalNudge: 0.03,
      cameraTarget: { y: 0.7, fov: 35, tilt: -1.5 }, // was subCameraTargets.bottom
    },
    // ── Outro verse (19) — merges into section2_g2's elevation zone ───────
    {
      id: "section2_outro",
      type: "group",
      verseIds: [19],
      columns: 1,
      capsuleHeight: 0.125,
      blockPadding: 0,
      isCenter: false,
      introOutroRole: "outro",
      customSectionId: "section2_g2",
    },
  ],
  animations: {
    introCamera: {
      introPosition: [-1.221, 0.343, 2.756],
      introTarget: [0.492, 0.176, 1.237],
      scrollOffset: [0.5, 1.5, 0],
      targetFollow: 1,
      allowOrbit: false,
      handoffDurationMs: 800,
    },
    scrollTimeline: {
      intro: { start: 0, end: 15 },
      ambient: { start: 15, end: 50 },
      handoff: { start: 50, end: 60 },
      story: { start: 60, end: 100 },
    },
    scrollLock: {
      lockPositionPercentage: 0.6,
      effortRequired: 3000,
      grabRangePixels: 50,
    },
    ambientMediaKeys: [
      "section1_start",
      "section1_zoom",
      "section1",
      "section1_step1",
      "section1_step2",
      "section1_step3",
      "section2_g0",
      "section2_g1",
      "section2_g2",
    ],
    // groupYPositions/groupHeights index: 0=section1, 1=intro, 2=g0, 3=g1,
    // 4=g2, 5=outro. The 0.033 constants are a deliberate legacy quirk — the
    // visual fold crease sits slightly off from the real `middleExtraGap`
    // (0.03) layout gap, preserved exactly rather than "cleaned up".
    computeFoldYPositions: (lm: any) => {
      const y = lm.groupYPositions;
      const h = lm.groupHeights;
      return [
        // Midpoint of the Section1→Section2 GAP itself (gapBetweenS1andS2 /
        // 2 = 0.045) — NOT the midpoint with the intro verse's actual
        // position, which sits `framePad` further down inside Section 2's
        // own padded box.
        y[0] - h[0] - 0.045,
        (y[1] - h[1] + y[2]) / 2,
        y[2] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        y[2] - h[2] - (lm.blockGap + 0.033) / 2,
        y[3] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        y[3] - h[3] - (lm.blockGap + 0.033) / 2,
        y[4] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        (y[4] - h[4] + y[5]) / 2,
      ];
    },
    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.93 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: -1 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -1 },
        ],
      },
      {
        id: "start",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.5 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1.03 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.53 },
        ],
      },
      {
        id: "outer-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1.03 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0.53 },
          { direction: -1, angleFactor: 0 },
        ],
      },
      {
        id: "inner-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.6 },
          { direction: -1, angleFactor: 1.1 },
          { direction: -1, angleFactor: -0.5 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
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
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
    ],
  },
};
