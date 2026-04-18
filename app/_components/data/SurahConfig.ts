// ============================================================================
// SURAH CONFIG — SINGLE SOURCE OF TRUTH
// Location: SurahLayout/core/SurahConfig.ts
// Purpose: All layout math, content data, and shape-behavior flags live here.
//          The UI reads this file and renders itself accordingly.
//          To change visual structure, edit the flags here — NOT the components.
// ============================================================================

// ----------------------------------------------------------------------------
// SECTION: TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface Verse {
  number: number;
  text: string;
}

export interface ColorGroup {
  /** Verse items in the group. */
  verses: Verse[];
  /**
   * Optional override for the verse background color.
   * If omitted, the component's default theme color will be used.
   */
  verseBg?: string;
  /**
   * When true, the parent group box will be visually indented/shrunk on
   * the X axis by `g2Shrink` on both sides. Used for the chiastic middle block.
   */
  isPushedIn?: boolean;
  /**
   * When true, the group border will use the accent color (GREEN_THEME)
   * and a drop shadow will be applied. Marks the semantically central group.
   */
  isCenter?: boolean;
  /**
   * Per-row extra vertical gap applied when rendering the second row of verses.
   * Useful when grouped verses have taller content.
   */
  extraRowGap?: number;
}

export interface SectionOneData {
  label: string;
  gridVerses: Verse[];
  anaAyet: Verse;
}

export interface SectionTwoData {
  topLabel: string;
  introVerse: Verse;
  colorGroups: ColorGroup[];
  outroVerse: Verse;
  bottomLabel: string;
}

// ----------------------------------------------------------------------------
// SECTION: LAYOUT MATH ENGINE
// All dimensional constants are computed here and exported as `layoutMath`.
// Components receive `layoutMath` as a prop and never perform layout math themselves.
// ----------------------------------------------------------------------------

// --- Page Dimensions ---
export const PAGE_WIDTH = 1.54;
export const PAGE_HEIGHT = 1.76;
export const PW = PAGE_WIDTH;
export const PADDING = 0.29;
export const CONTENT_W = PW - PADDING * 2;
export const START_X = PADDING;

// --- Section 1 (Top Block) ---
const s1Top = -0.08;
const s1Pad = 0.045;
const gap = 0.02;
const s1AnaGap = 0.05;
const smallBoxH = 0.07;
const anaAyetH = 0.11;
const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + s1AnaGap + anaAyetH;

// --- Section 2 (Main Lower Block) ---
const gapBetweenS1andS2 = 0.09;
const s2TopExtra = 0.025;
const s2Top = s1Top - s1H - gapBetweenS1andS2;

const s2PadTop = 0.035 + s2TopExtra;
const s2PadBottom = 0.06;
const bigBoxH = 0.11;
const groupGap = 0.025;
const groupPad = 0.012;
const groupPadBottom = 0.025;
const s2Gap = 0.02;
const smallBoxH2 = 0.075;
const groupH = groupPad + groupPadBottom + (smallBoxH2 * 2 + s2Gap);
const middleExtraGap = 0.033;

const s2H =
  s2PadTop +
  s2PadBottom +
  bigBoxH * 2 +
  groupGap * 4 +
  groupH * 3 +
  middleExtraGap * 2;

// --- Element Y Positions ---
const v6Y = s2Top - s2PadTop;
const baseG1Y = v6Y - bigBoxH - groupGap;
const baseG2Y = baseG1Y - groupH - (groupGap + middleExtraGap);
const baseG3Y = baseG2Y - groupH - (groupGap + middleExtraGap);
const baseV19Y = baseG3Y - groupH - groupGap;

const g1Y = baseG1Y;
const g2Y = baseG2Y;
const g3Y = baseG3Y;
const v19Y = baseV19Y;

// ----------------------------------------------------------------------------
// EXPORTED LAYOUT OBJECT
// Passed as `layout` prop down to SectionOne, SectionTwo, and SideCurves.
// ----------------------------------------------------------------------------
export const layoutMath = {
  // Section 1
  sectionW: CONTENT_W,
  innerW: CONTENT_W - s1Pad * 2,
  innerHalfW: (CONTENT_W - s1Pad * 2 - gap) / 2,
  s1Top,
  s1Pad,
  gap,
  s1AnaGap,
  smallBoxH,
  anaAyetH,
  s1H,

  // Section 2
  s2Top,
  s2Pad: s2PadTop,
  s2PadTop,
  s2PadBottom,
  bigBoxH,
  groupGap,
  groupPad,
  s2Gap,
  smallBoxH2,
  groupH,
  s2H,

  // Absolute Y placements
  v6Y,
  g1Y,
  g2Y,
  g3Y,
  v19Y,
  baseG1Y,
  baseG3Y,

  // Group inner widths
  groupInnerW: CONTENT_W - 0.07 - groupPad * 2,
  groupInnerHalfW: (CONTENT_W - 0.07 - groupPad * 2 - s2Gap) / 2,

  // Spacing & decoration offsets
  s2PadLeftRight: 0.035,
  g2Shrink: 0.01,
  s1BorderWidth: 0.011,
  anaAyetTabW: 0.2,
  anaAyetTabH: 0.032,
  anaAyetTabBorderWidth: 0.0035,
  // Positive values move only the Ana Ayet label downward.
  anaAyetLabelDrop: 0.012,
  sgPad: 0.03,
  sgBorderWidth: 0.006,
  boxExtOffset: 0.02,
  extraRowGap: 0.01,
} satisfies Record<string, number>;

export type LayoutConfig = typeof layoutMath;

// Section 1 neon border tuning.
// Sizes live here so glow spread can be adjusted without touching JSX.
export const S1_NEON_CONFIG = {
  haloPad: 0.014,
  haloZ: -0.001,
  haloOpacity: 0.36,
  haloEmissiveIntensity: 4.2,
  outerHaloPad: 0.026,
  outerHaloOpacity: 0.16,
  outerHaloEmissiveIntensity: 2.4,
  topLabelGapWidth: 0.4,
  topLabelGapPadding: 0.01,
  topLabelGapHeight: 0.058,
  topLabelGapYOffset: 0.022,
} as const;

// ----------------------------------------------------------------------------
// EXPORTED FOLD POSITIONS
// Used by animation engine to know where page fold-lines sit.
// ----------------------------------------------------------------------------
export const FOLD_Y_POSITIONS: readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
] = [
  s2Top + gapBetweenS1andS2 / 2, // New fold: between 5 and 6
  v6Y - bigBoxH - groupGap / 2,
  g1Y - groupPad - smallBoxH2 - s2Gap / 2,
  g1Y - groupH - (groupGap + middleExtraGap) / 2,
  g2Y - groupPad - smallBoxH2 - s2Gap / 2,
  g2Y - groupH - (groupGap + middleExtraGap) / 2,
  g3Y - groupPad - smallBoxH2 - s2Gap / 2,
  g3Y - groupH - groupGap / 2,
] as const;

// ----------------------------------------------------------------------------
// SURAH CONTENT DATA
// The actual Quranic verses and section labels.
// ColorGroup flags (isPushedIn, isCenter, extraRowGap) drive UI behavior.
// ----------------------------------------------------------------------------
export const SURAH_DATA = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Beş ayetlik Ana Böl.",
    gridVerses: [
      { number: 2, text: "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ" },
      { number: 1, text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" },
      { number: 4, text: "الَّذِي عَلَّمَ بِالْقَلَمِ" },
      { number: 3, text: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ" },
    ],
    anaAyet: { number: 5, text: "عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ" },
  } satisfies SectionOneData,

  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: { number: 6, text: "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ" },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          { number: 8, text: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ" },
          { number: 7, text: "أَنْ رَآهُ اسْتَغْنَىٰ" },
          { number: 10, text: "عَبْدًا إِذَا صَلَّىٰ" },
          { number: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَىٰ" },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "أَوْ أَمَرَ بِالتَّقْوَىٰ" },
          { number: 11, text: "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ" },
          { number: 14, text: "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ" },
          { number: 13, text: "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ" },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          { number: 16, text: "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ" },
          {
            number: 15,
            text: "كَلَّا لئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
          },
          { number: 18, text: "سَنَدْعُ الزَّبَانِيَةَ" },
          { number: 17, text: "فَلْيَدْعُ نَادِيَهُ" },
        ],
      },
    ] satisfies ColorGroup[],
    outroVerse: {
      number: 19,
      text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  } satisfies SectionTwoData,
};

// ============================================================================
// LAYOUT ENGINE — AXIS-AGNOSTIC POSITION COMPUTER
// All element positions are computed HERE once. Components only render —
// they never perform positional math inline in JSX.
//
// Future extension: pass `{ isVertical: false }` options to swap primary/cross
// axes for a horizontal layout. All axis assignments are isolated in this
// function, making a layout flip a single-file change.
// ============================================================================

/** Pre-computed x/y/z/w/h for a single UI element. */
export interface ElementTransform {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

/** Pre-computed geometry and per-verse transforms for one verse group cluster. */
export interface GroupTransforms {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  isPushedIn: boolean;
  isCenter: boolean;
  /** Verse number → its exact screen transform. */
  verses: Record<number, ElementTransform>;
}

export interface S1Transforms {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  verses: Record<number, ElementTransform>;
  anaAyet: ElementTransform;
  anaAyetTabX: number;
  anaAyetTabY: number;
  anaAyetTabW: number;
  anaAyetTabH: number;
  anaAyetTabBorderWidth: number;
  anaAyetLabelDrop: number;
  borderWidth: number;
  labelPinY: number;
}

export interface S2Transforms {
  frameX: number;
  frameW: number;
  shiftedTop: number;
  shiftedBot: number;
  shiftedH: number;
  connectorX: number;
  connectorW: number;
  topConnectorY: number;
  topConnectorH: number;
  bottomConnectorY: number;
  bottomConnectorH: number;
  borderWidth: number;
  introVerse: ElementTransform;
  outroVerse: ElementTransform;
  groups: GroupTransforms[];
  innerW: number;
  baseX: number;
  topLabelPinY: number;
  bottomLabelPinY: number;
}

export interface SurahTransforms {
  s1: S1Transforms;
  s2: S2Transforms;
}

/**
 * buildSurahTransforms
 * Computes and returns the complete set of pre-baked element transforms for
 * the entire Surah layout in a single pass. Call this once at module load
 * time and share the result across all rendering components.
 */
export function buildSurahTransforms(startX: number): SurahTransforms {
  const lm = layoutMath;

  // ── SECTION 1 ──────────────────────────────────────────────────────────────
  const s1BaseX = startX + lm.s1Pad;
  // AnaAyet y absorbs the legacy <group position={[0, -0.01, 0]}> offset so
  // SectionOne.tsx no longer needs a wrapper group for that element.
  const ANA_AYET_Y_OFFSET = -0.01;
  const anaAyetY =
    lm.s1Top -
    lm.s1Pad -
    (lm.smallBoxH * 2 + lm.gap) -
    lm.s1AnaGap +
    ANA_AYET_Y_OFFSET;

  const s1Verses: Record<number, ElementTransform> = {};
  SURAH_DATA.section1.gridVerses.forEach((v, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    s1Verses[v.number] = {
      x: s1BaseX + (isRightCol ? lm.innerHalfW + lm.gap : 0),
      y: lm.s1Top - lm.s1Pad - (isBottomRow ? lm.smallBoxH + lm.gap : 0),
      z: 0.002,
      w: lm.innerHalfW,
      h: lm.smallBoxH,
    };
  });

  // ── SECTION 2 ──────────────────────────────────────────────────────────────
  const s2InnerW = lm.sectionW - lm.s2PadLeftRight * 2;
  const s2BaseX = startX + lm.s2PadLeftRight;

  const S2_MIRROR_SHIFT = 0.015;
  const shiftedTop = lm.s2Top - S2_MIRROR_SHIFT;
  const shiftedBot = lm.s2Top - lm.s2H + S2_MIRROR_SHIFT;
  const shiftedH = lm.s2H - 2 * S2_MIRROR_SHIFT;

  const bw = lm.sgBorderWidth;
  const connX = s2BaseX - lm.sgPad;
  const connW = s2InnerW + lm.sgPad * 2;

  const tBox_Y = shiftedTop;
  const tBox_H =
    tBox_Y - ((lm.baseG1Y || lm.g1Y) - lm.groupH - lm.boxExtOffset);

  const bBox_Y = (lm.baseG3Y || lm.g3Y) + lm.boxExtOffset;
  const bBox_H = bBox_Y - shiftedBot;

  // ── GROUP TRANSFORMS ───────────────────────────────────────────────────────
  const groupYPositions = [lm.g1Y, lm.g2Y, lm.g3Y];

  const groups: GroupTransforms[] = SURAH_DATA.section2.colorGroups.map(
    (group, gIdx) => {
      const groupY = groupYPositions[gIdx];
      const isPushedIn = group.isPushedIn ?? false;

      // Pushed-in groups shrink inward on both sides by g2Shrink
      const gInnerW = isPushedIn ? s2InnerW - lm.g2Shrink * 2 : s2InnerW;
      const gBaseX = isPushedIn ? s2BaseX + lm.g2Shrink : s2BaseX;
      const gHalfW = isPushedIn
        ? (gInnerW - lm.groupPad * 2 - lm.s2Gap) / 2
        : lm.groupInnerHalfW;

      const extraRowGap = group.extraRowGap ?? 0;

      const verses: Record<number, ElementTransform> = {};
      group.verses.forEach((v, i) => {
        const isRightCol = i % 2 !== 0;
        const isSecondRow = i >= 2;
        const rowOffset = isSecondRow
          ? lm.smallBoxH2 + lm.s2Gap + extraRowGap
          : 0;

        verses[v.number] = {
          // Primary axis (x) — swap with y here for a future horizontal layout
          x: gBaseX + lm.groupPad + (isRightCol ? gHalfW + lm.s2Gap : 0),
          // Cross axis (y) — swap with x here for a future horizontal layout
          y: groupY - lm.groupPad - rowOffset,
          z: 0.003,
          w: gHalfW,
          h: lm.smallBoxH2,
        };
      });

      return {
        frameX: gBaseX,
        frameY: groupY,
        frameW: gInnerW,
        frameH: lm.groupH,
        isPushedIn,
        isCenter: group.isCenter ?? false,
        verses,
      };
    },
  );

  return {
    s1: {
      frameX: startX,
      frameY: lm.s1Top,
      frameW: lm.sectionW,
      frameH: lm.s1H,
      verses: s1Verses,
      anaAyet: {
        x: s1BaseX,
        y: anaAyetY,
        z: 0.002,
        w: lm.innerW,
        h: lm.anaAyetH,
      },
      // Tab is now rendered as a label and pinned to verse 5's top border.
      anaAyetTabX: s1BaseX + lm.innerW / 2,
      anaAyetTabY: anaAyetY,
      anaAyetTabW: lm.anaAyetTabW,
      anaAyetTabH: lm.anaAyetTabH,
      anaAyetTabBorderWidth: lm.anaAyetTabBorderWidth,
      anaAyetLabelDrop: lm.anaAyetLabelDrop,
      borderWidth: lm.s1BorderWidth,
      labelPinY: lm.s1Top,
    },
    s2: {
      frameX: startX,
      frameW: lm.sectionW,
      shiftedTop,
      shiftedBot,
      shiftedH,
      connectorX: connX,
      connectorW: connW,
      topConnectorY: tBox_Y,
      topConnectorH: tBox_H,
      bottomConnectorY: bBox_Y,
      bottomConnectorH: bBox_H,
      borderWidth: bw,
      introVerse: {
        x: s2BaseX,
        y: lm.v6Y,
        z: 0.003,
        w: s2InnerW,
        h: lm.bigBoxH,
      },
      outroVerse: {
        x: s2BaseX,
        y: lm.v19Y,
        z: 0.003,
        w: s2InnerW,
        h: lm.bigBoxH,
      },
      groups,
      innerW: s2InnerW,
      baseX: s2BaseX,
      topLabelPinY: shiftedTop,
      bottomLabelPinY: shiftedBot,
    },
  };
}

// Module-level singleton — computed once at boot since all inputs are static constants.
// All components import `SURAH_TRANSFORMS` directly; no prop-drilling of math needed.
export const SURAH_TRANSFORMS = buildSurahTransforms(START_X);

export function getPopUpTrackerPosition(
  verses: { y: number; h: number }[],
  isGlobal = false,
  s1Top = 0,
): [number, number] {
  if (isGlobal) {
    return [0, s1Top + 0.25];
  }
  const centerY = verses[0].y - verses[0].h / 2;
  const btnX = -PAGE_WIDTH / 2 - 0.05;
  return [btnX, centerY];
}
