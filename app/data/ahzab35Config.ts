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

const YELLOW_BG = "#FDF4CA"; // Top & bottom groups (İman / dome)
const YELLOW_BORDER = "#BE9E63";

const BLUE_BG = "#CBE2EE"; // 2nd and 4th groups
const BLUE_BORDER = "#7A9CAD";

const GREEN_BG = "#DCE8DC"; // Center pushed-in group
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
    hideVerseNumbers: false,
  },

  dimensions: {
    paperWidth: 1.8,
    paperHeight: 1.65,
    sceneCenterYOffset: 0.0,
    padding: 0.22,
    scrollPages: 2,
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
    },
    2: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
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
    },
    // ── Group 4 — Yellow (dome text, compact) ───────────────────────────
    11: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
    },
    12: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: YELLOW_BORDER,
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
      curveColors: [
        { color: YELLOW_BORDER, fillColor: YELLOW_BG },
        { color: BLUE_BORDER, fillColor: BLUE_BG },
        { color: GREEN_BORDER, fillColor: GREEN_BG },
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
    smallBoxH2: 0.16, // make capsules extremely tall
    middleExtraGap: 0.0,
    s2PadLeftRight: 0.005, // push outward to the red borders
    g2Shrink: 0.1, // indent the green group to fit the inward SVG border
    outerShrink: 0.0,
    s1BorderWidth: 0,

    // --- Misc ---
    anaAyetTabW: 0.2,
    anaAyetTabH: 0.032,
    anaAyetTabBorderWidth: 0.0035,
    anaAyetLabelDrop: 0.015,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.0,
    labelHitboxWidth: 0.43,
    verseTextScale: 1.5,

    // 5 groups: [1-row, 1-row, 2-row, 1-row, 1-row]
    groupRows: [1, 1, 2, 1, 1],

    outerCurveXOffset: 0.05,
    centerCurveXOffset: -0.015,
    curvePad: 0.005,
    curveTipThickness: 0.006,
    curveInnerInwardOffset: 0.004,
    innerCurveGapDiff: -0.002,
  },

  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      // Horizontal connector bars between paired capsules are hidden.
      hideRowConnectors: true,
      backgroundTexture: "/ahzab/ahzab-frame.svg",
      backgroundScaleX: 1.55,
      backgroundScaleY: 1.45,
      groups: [
        // ── Group 0 — Yellow / İman (1 row) ──────────────────────────────
        {
          verseIds: [2, 1],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
          pushDown: -0.06, // negative value pushes the group UP
        },
        // ── Group 1 — Blue (1 row) ────────────────────────────────────────
        {
          verseIds: [4, 3],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
        },
        // ── Group 2 — Green / pushed in (2 rows) ─────────────────────────
        {
          verseIds: [6, 5, 8, 7],
          isPushedIn: true,
          isCenter: true,
          extraRowGap: 0,
          bgThemeKey: "s2Group3Bg",
        },
        // ── Group 3 — Blue (1 row) ────────────────────────────────────────
        {
          verseIds: [10, 9],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
        },
        // ── Group 4 — Yellow / dome text (1 row, smaller capsules) ───────
        {
          verseIds: [12, 11],
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
          customShrink: 0.22,
          customGap: 0.18,
          pushDown: 0.135,
          topLabelConfig: {
            width: 0.3,
            height: 0.065,
            yOffset: 0.07,
            textOffsetY: -0.008,
          },
        },
      ],
      cameraTarget: { y: 0.8, fov: 35, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // 5 groups with 4 inter-group gaps → 4 fold positions, one between each group.
      const positions = lm.groupYPositions as number[];
      const heights = lm.groupHeights as number[];
      return Array.from({ length: 4 }, (_, i) => {
        const botOfGroup = positions[i] - heights[i];
        const topOfNext = positions[i + 1] ?? botOfGroup;
        return (botOfGroup + topOfNext) / 2;
      });
    },

    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 0.8 },
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 0.8 },
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
