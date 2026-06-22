/**
 * Ayat al-Kursi — Full Layout Config & Text Data
 *
 * Layout matches the hand-drawn design:
 *   - ONE fold in the middle (2 paper segments)
 *   - ONE VerticalGroupsSectionConfig with 3 groups:
 *       Top    (not pushed in): verseIds [2, 1]         — 2 chunks side-by-side
 *       Middle (pushed in):     verseIds [4, 3, 6, 5]   — 4 chunks in a 2×2 grid
 *       Bottom (not pushed in): verseIds [8, 7]         — 2 chunks side-by-side
 *
 * verseId ordering within a group: [left-col, right-col, left-col-row2, right-col-row2]
 * (i.e. even indices → left/RTL-start column, odd indices → right/RTL-end column)
 */

import type { SurahLayoutConfig, VerticalGroupsSectionConfig } from "./schema";
import type { AlakLayoutParams } from "./SurahConfig";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

const OUTER_GROUP_BG = "#FDF4CA"; // Yellow (Top and Bottom groups)
const OUTER_GROUP_BORDER = "#BE9E63"; // Lighter brown/gold border
const CENTER_GROUP_BG = "#CBE2EE"; // Blue/Grey (Middle group)
const CENTER_GROUP_BORDER = "#7A9CAD"; // Lighter slate blue border

export const AYAT_AL_KURSI_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "ayatalkursi",
  title: "Bakara 255",
  heroTitle: "Ayetel",
  heroSubtitle: "kürsî",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 2.104,
    paperHeight: 0.9,
    sceneCenterYOffset: 0.0,
    padding: 0.26,
    scrollPages: 1.5,
  },

  specialVerses: {
    // The single fold sits between the top group and the pushed-in middle group.
    // Verses flanking that crease are 1/2 (top) and 3/4 (middle top row).
    // No middleFoldVerses — all pairs fold as normal V-shape popups
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      5: 6,
      6: 5,
      7: 8,
      8: 7,
    },
  },

  verseOverrides: {
    1: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    2: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    3: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    6: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    7: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    8: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
  },

  styling: {
    colors: {
      paperBase: "#FAF7F2", // Lighter, creamy paper color for the background fill
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
      maroonTheme: OUTER_GROUP_BG, // Yellow (Top and Bottom groups, since they are symmetrical)
      greenTheme: CENTER_GROUP_BG, // Blue/Grey (Middle group)
      // The three group background colours echo the hand-drawn image:
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B", // unused (no intro/outro verse)
      s2Group1Bg: OUTER_GROUP_BG, // yellow  — top group
      s2Group2Bg: CENTER_GROUP_BG, // light blue/grey — middle (pushed-in)
      s2Group3Bg: OUTER_GROUP_BG, // yellow — bottom group (symmetrical)

      // The background rectangles for the paper, echoing the hand-drawn sections
      sectionBackgrounds: ["#DCE8DC", "#EDD8DF", "#DCE8DC"],

      curveColors: [
        { color: OUTER_GROUP_BORDER, fillColor: OUTER_GROUP_BG }, // Outer curves (top/bottom)
        { color: CENTER_GROUP_BORDER, fillColor: CENTER_GROUP_BG }, // Center curves (middle)
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

  // -------------------------------------------------------------------------
  // PARAMS — feed into createLayoutMath (AlakLayoutParams-compatible).
  //
  // Section-1 fields are set to minimal values (no real section 1 is rendered).
  // Section-2 fields are tuned so the 3 groups fit the 1.1-unit paper height.
  //
  // Derived reference (approximate, with paperHeight=1.1, sceneCenterY=0.55):
  //   s2Top  ≈  0.30
  //   g1Y    ≈  0.17   (top group — 2 verses, 1 row)
  //   g2Y    ≈ -0.07   (middle group — 4 verses, 2 rows, pushed in)
  //   g3Y    ≈ -0.32   (bottom group — 2 verses, 1 row)
  // -------------------------------------------------------------------------
  params: {
    // --- Section 1 (stub — not rendered) ---
    s1Top: 0.5,
    s1Pad: 0.01,
    gap: 0.01,
    s1AnaGap: 0.01,
    smallBoxH: 0.04,
    anaAyetH: 0.04,
    gapBetweenS1andS2: 0.01,

    // --- Section 2 (active — drives VerticalGroupsSectionConfig) ---
    s2VerticalPad: 0.02,
    bigBoxH: 0.07, // only used for intro/outro verse; not rendered here
    groupGap: 0.025,
    groupPad: 0.012,
    groupPadBottom: 0.012,
    s2Gap: 0.06, // reduced horizontal gap
    s2VerticalRowGap: 0.046, // the vertical gap between rows in the same group!
    smallBoxH2: 0.085, // height of each individual verse capsule
    middleExtraGap: 0.007,
    s2PadLeftRight: 0.028,
    g2Scale: 0.0,
    outerScale: 0.05,
    s1BorderWidth: 0,

    // --- Misc (carried over from Alak; not material for this layout) ---
    capsuleLabelW: 0.2,
    capsuleLabelH: 0.032,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.015,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.01,
    labelHitboxWidth: 0.43,
    verseTextScale: 1.35,
    groupRows: [1, 2, 1],
    outerCurveXOffset: 0.07,
    centerCurveXOffset: -0.02,
  },

  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      backgroundTexture: "/ayatalKursi/frame-section-1.svg",
      backgroundScaleX: 1.15,
      backgroundScaleY: 1.25,
      groupElevation: "unified",
      // No topLabelKey / bottomLabelKey / introVerse / outroVerse — clean slate.
      groups: [
        // ── Top group: 2 verses side-by-side (NOT pushed in) ─────────────
        {
          verseIds: [2, 1], // [left-col=2, right-col=1]
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group1Bg",
        },
        // ── Middle group: 4 verses 2×2 (pushed in / indented) ────────────
        {
          verseIds: [4, 3, 6, 5], // [left-row1=4, right-row1=3, left-row2=6, right-row2=5]
          isPushedIn: true,
          isCenter: true,
          dragBehavior: "individual",
          extraRowGap: 0,
          bgThemeKey: "s2Group2Bg",
        },
        // ── Bottom group: 2 verses side-by-side (NOT pushed in) ──────────
        {
          verseIds: [8, 7], // [left-col=8, right-col=7]
          isPushedIn: false,
          isCenter: false,
          extraRowGap: 0,
          bgThemeKey: "s2Group3Bg",
        },
      ],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // Position 1: between Group 0 and Group 1
      const fold1 = (lm.g1Y - lm.groupHeights[0] + lm.g2Y) / 2;
      // Position 2: between row 1 and row 2 of Group 1
      const fold2 =
        lm.g2Y - lm.groupPad - lm.smallBoxH2 - lm.s2VerticalRowGap / 2;
      // Position 3: between Group 1 and Group 2
      const fold3 = (lm.g2Y - lm.groupHeights[1] + lm.g3Y) / 2;

      return [fold1, fold2, fold3];
    },

    foldSteps: [
      // Fully folded (paper closed in on itself)
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

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical)
// ---------------------------------------------------------------------------
// verse ordering inside each colorGroup must match the config's verseIds:
//   group 0: [i=0 → id 2, i=1 → id 1]
//   group 1: [i=0 → id 4, i=1 → id 3, i=2 → id 6, i=3 → id 5]
//   group 2: [i=0 → id 8, i=1 → id 7]
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  // section1 is a stub — the Ayat al-Kursi config has no gridWithAnaAyet section.
  section1: {
    label: "آية الكرسي",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },

  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" }, // no intro verse
    colorGroups: [
      // ── Group 0 — top, not pushed in ─────────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          // i=0 → verseId 2 (left column)
          { number: 2, text: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ" },
          // i=1 → verseId 1 (right column)
          {
            number: 1,
            text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          },
        ],
      },
      // ── Group 1 — middle, pushed in ─────────────────────────────────────
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          // i=0 → verseId 4 (left col, row 1)
          {
            number: 4,
            text: "مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ",
          },
          // i=1 → verseId 3 (right col, row 1)
          { number: 3, text: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ" },
          // i=2 → verseId 6 (left col, row 2)
          {
            number: 6,
            text: "وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ",
          },
          // i=3 → verseId 5 (right col, row 2)
          {
            number: 5,
            text: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ",
          },
        ],
      },
      // ── Group 2 — bottom, not pushed in ─────────────────────────────────
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          // i=0 → verseId 8 (left column)
          {
            number: 8,
            text: "وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          },
          // i=1 → verseId 7 (right column)
          { number: 7, text: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" }, // no outro verse
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English (empty strings per spec)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayat al-Kursi",
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
          { number: 2, text: "Neither drowsiness overtakes Him nor sleep." },
          {
            number: 1,
            text: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.",
          },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 4,
            text: "Who is it that can intercede with Him except by His permission?",
          },
          {
            number: 3,
            text: "To Him belongs whatever is in the heavens and whatever is on the earth.",
          },
          {
            number: 6,
            text: "and they encompass not a thing of His knowledge except for what He wills.",
          },
          {
            number: 5,
            text: "He knows what is [presently] before them and what will be after them,",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 8,
            text: "and their preservation tires Him not. And He is the Most High, the Most Great.",
          },
          {
            number: 7,
            text: "His Kursi extends over the heavens and the earth,",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish (empty strings per spec)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayetü'l-Kürsî",
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
          {
            number: 2,
            text: "O'nu ne bir uyuklama tutabilir, ne de bir uyku.",
          },
          {
            number: 1,
            text: "Allah, kendisinden başka hiçbir ilâh bulunmayandır. Diridir, kayyumdur.",
          },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          {
            number: 4,
            text: "İzni olmaksızın O'nun katında şefaatte bulunacak kimdir?",
          },
          { number: 3, text: "Göklerdeki her şey, yerdeki her şey O'nundur." },
          {
            number: 6,
            text: "Onlar O'nun ilminden, kendisinin dilediği kadarından başka bir şey kavrayamazlar.",
          },
          {
            number: 5,
            text: "O, kullarının önlerindekileri ve arkalarındakileri bilir.",
          },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          {
            number: 8,
            text: "Gökleri ve yeri koruyup gözetmek O'na güç gelmez. O, yücedir, büyüktür.",
          },
          {
            number: 7,
            text: "O'nun kürsüsü bütün gökleri ve yeri kaplayıp kuşatmıştır.",
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

export const AYAT_AL_KURSI_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: AYAT_AL_KURSI_TEXT_AR,
  en: AYAT_AL_KURSI_TEXT_EN,
  tr: AYAT_AL_KURSI_TEXT_TR,
};
