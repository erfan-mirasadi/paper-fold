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

export const AYAT_AL_KURSI_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "ayatalkursi",
  title: "AYETEL KÜRSİ",
  heroTitle: "Ayetel",
  heroSubtitle: "kürsî",

  features: {
    hasIntro: false,
    hasElevatedSections: false,
    hasPopUps: false,
  },

  dimensions: {
    paperWidth: 2.0,
    paperHeight: 0.9,
    sceneCenterYOffset: 0.0,
    padding: 0.26,
    scrollPages: 2,
  },

  specialVerses: {
    // The single fold sits between the top group and the pushed-in middle group.
    // Verses flanking that crease are 1/2 (top) and 3/4 (middle top row).
    middleFoldVerses: { left: [4, 6], right: [3, 5] },
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

  assets: {},
  verseOverrides: {},

  styling: {
    colors: {
      paperBase: "#E9E3CD",
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
      maroonTheme: "#7c8cb0",
      greenTheme: "#5E7367",
      // The three group background colours echo the hand-drawn image:
      //   top/bottom groups → warm yellow, middle group → soft pink
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B", // unused (no intro/outro verse)
      s2Group1Bg: "#C9B882", // warm gold  — top group
      s2Group2Bg: "#C78E8E", // dusty rose — middle (pushed-in)
      s2Group3Bg: "#82B8A6", // sage green — bottom group
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
    s2Gap: 0.016,
    smallBoxH2: 0.085, // height of each individual verse capsule
    middleExtraGap: 0.022,
    s2PadLeftRight: 0.028,
    g2Shrink: 0.0,
    outerShrink: 0.05,
    s1BorderWidth: 0,

    // --- Misc (carried over from Alak; not material for this layout) ---
    anaAyetTabW: 0.2,
    anaAyetTabH: 0.032,
    anaAyetTabBorderWidth: 0.0035,
    anaAyetLabelDrop: 0.015,
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
      id: "section1",
      type: "verticalGroups",
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
      subCameraTargets: {
        top: { y: 0.5, fov: 28, tilt: -1.2 },
        center: { y: 0.0, fov: 32, tilt: -1.4 },
        bottom: { y: -0.4, fov: 28, tilt: -1.2 },
      },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    // -----------------------------------------------------------------------
    // ONE fold in the middle of the paper (between the top group and the
    // pushed-in middle group).
    // The returned array must have length === foldSteps[n].folds.length === 1.
    // -----------------------------------------------------------------------
    computeFoldYPositions: (lm) => [
      // Crease exactly in the middle of the page height
      -lm.PAGE_HEIGHT / 2,
    ],

    foldSteps: [
      // Fully folded (paper closed in on itself)
      {
        id: "pre-start",
        folds: [{ direction: 1, angleFactor: 0.9 }],
      },
      // Flat / fully open
      {
        id: "start",
        folds: [{ direction: 1, angleFactor: 0 }],
      },
      // Stay flat
      {
        id: "open",
        folds: [{ direction: 1, angleFactor: 0 }],
      },
      // Stay flat
      {
        id: "end",
        folds: [{ direction: 1, angleFactor: 0 }],
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
          { number: 2, text: "" },
          { number: 1, text: "" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "" },
          { number: 3, text: "" },
          { number: 6, text: "" },
          { number: 5, text: "" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 8, text: "" },
          { number: 7, text: "" },
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
          { number: 2, text: "" },
          { number: 1, text: "" },
        ],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "" },
          { number: 3, text: "" },
          { number: 6, text: "" },
          { number: 5, text: "" },
        ],
      },
      {
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0,
        verses: [
          { number: 8, text: "" },
          { number: 7, text: "" },
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
