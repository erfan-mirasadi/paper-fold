import { SURAH_DATA_ARABIC as SURAH_DATA } from "./surahData";

export interface Verse {
  number: number;
  text: string;
}

export interface ColorGroup {
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
export const BASE_PAGE_WIDTH = 1.54;
export const PAGE_HEIGHT = 1.78;
export const SCENE_CENTER_Y_OFFSET = -0.045; // Centralized offset for the entire paper scene

export function createLayoutMath(pageWidth: number) {
  const PAGE_WIDTH = pageWidth;
  const PW = PAGE_WIDTH;
  const PADDING = 0.29;
  const CONTENT_W = PW - PADDING * 2;
  const START_X = PADDING;

  // --- Section 1 (Top Block) ---
  const s1Top = -0.06;
  const s1Pad = 0.045;
  const gap = 0.02;
  const s1AnaGap = 0.05;
  const smallBoxH = 0.07;
  const anaAyetH = 0.132;
  const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + s1AnaGap + anaAyetH;

  // --- Section 2 (Main Lower Block) ---
  const gapBetweenS1andS2 = 0.09;
  const s2Top = s1Top - s1H - gapBetweenS1andS2;

  // Symmetric padding for top and bottom sections (verses 6-10 and 15-19)
  const s2VerticalPad = 0.054;
  const s2PadTop = s2VerticalPad;
  const s2PadBottom = s2VerticalPad;
  const bigBoxH = 0.125;
  const groupGap = 0.035;
  const groupPad = 0.012;
  const groupPadBottom = 0.012;
  const s2Gap = 0.02;
  const smallBoxH2 = 0.075;
  const groupH = groupPad + groupPadBottom + (smallBoxH2 * 2 + s2Gap);
  const middleExtraGap = 0.03;

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
  return {
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PW,
    PADDING,
    CONTENT_W,
    START_X,
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
    s1BorderWidth: 0,
    anaAyetTabW: 0.2,
    anaAyetTabH: 0.032,
    anaAyetTabBorderWidth: 0.0035,
    // Positive values move only the Ana Ayet label downward.
    anaAyetLabelDrop: 0.015, // Increased to move the label further down independently!
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.01,
  } satisfies Record<string, number>;
}

export const layoutMath = createLayoutMath(BASE_PAGE_WIDTH);
export type LayoutConfig = ReturnType<typeof createLayoutMath>;

// Legacy named exports (base layout). Prefer using `createLayoutMath(...)`.
export const PAGE_WIDTH = layoutMath.PAGE_WIDTH;
export const PW = layoutMath.PW;
export const PADDING = layoutMath.PADDING;
export const CONTENT_W = layoutMath.CONTENT_W;
export const START_X = layoutMath.START_X;

// ----------------------------------------------------------------------------
// CAPSULE BORDER WIDTH
// Controls the border thickness around all verse capsules (pill + non-pill).
// Adjust this one value to change borders globally across the whole page.
// ----------------------------------------------------------------------------
export const CAPSULE_BORDER_WIDTH = 0.0039;

// Controls the thickness of the border ring around verse numbers.
export const CIRCLE_BORDER_WIDTH = 0.0035;

// Controls the corner radius for non-pill verse boxes (specifically verses 5, 6 and 19).
export const VERSE_5_6_19_RADIUS = 0.04;

// ----------------------------------------------------------------------------
// OPPOSITE VERSE CONNECTOR CONFIG
// Controls the background section connecting opposite (side-by-side) verses.
// ----------------------------------------------------------------------------
export const OPPOSITE_VERSE_CONNECTOR = {
  paddingX: 0.0065,
  paddingY: 0.0065,
  radius: 0.05,
};

export const VERSE_TEXT_RIGHT_PADDING = 0.003;

// Width for Section 1 label
export const TOP_LABEL_WIDTH = 0.425;

// Width and vertical offset for Section 2 labels
export const S2_LABEL_WIDTH = 0.47;
export const S2_LABEL_Y_OFFSET = 0.004; // Moves labels up by ~1mm

// Section 1 neon border tuning.
export const SMALL_TEXT_SHIFT = -0.018;
export const BIG_VERSE_VERTICAL_SHIFT = -0.006;
export const SMALL_VERSE_VERTICAL_SHIFT = -0.005;

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
  topLabelGapWidth: TOP_LABEL_WIDTH,
  topLabelGapPadding: 0.01,
  topLabelGapHeight: 0.058,
  topLabelGapYOffset: 0.022,
} as const;

// ----------------------------------------------------------------------------
// EXPORTED FOLD POSITIONS
// Used by animation engine to know where page fold-lines sit.
// ----------------------------------------------------------------------------
export function createFoldYPositions(
  lm: LayoutConfig,
): readonly [number, number, number, number, number, number, number, number] {
  return [
    lm.s2Top + 0.09 / 2, // between s1 and s2 (gapBetweenS1andS2 / 2)
    lm.v6Y - lm.bigBoxH - lm.groupGap / 2,
    lm.g1Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
    lm.g1Y - lm.groupH - (lm.groupGap + 0.033) / 2, // middleExtraGap / 2
    lm.g2Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
    lm.g2Y - lm.groupH - (lm.groupGap + 0.033) / 2,
    lm.g3Y - lm.groupPad - lm.smallBoxH2 - lm.s2Gap / 2,
    lm.g3Y - lm.groupH - lm.groupGap / 2,
  ] as const;
}

export const FOLD_Y_POSITIONS = createFoldYPositions(layoutMath);

export { SURAH_DATA };

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

export interface RowConnectorTransform {
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
  rowConnectors: RowConnectorTransform[];
}

export interface S1Transforms {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  verses: Record<number, ElementTransform>;
  rowConnectors: RowConnectorTransform[];
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
export function buildSurahTransforms(
  lm: LayoutConfig,
  startX: number,
): SurahTransforms {
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

  const s1Connectors: RowConnectorTransform[] = [];
  for (let r = 0; r < 2; r++) {
    const leftV = s1Verses[SURAH_DATA.section1.gridVerses[r * 2].number];
    const rightV = s1Verses[SURAH_DATA.section1.gridVerses[r * 2 + 1].number];
    if (leftV && rightV) {
      s1Connectors.push({
        x: leftV.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
        y: leftV.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
        z: 0.0015,
        w:
          rightV.x + rightV.w - leftV.x + OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
        h: leftV.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
      });
    }
  }

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

  // Since Section 1 (Top Block, verses 6-10) and Section 3 (Bottom Block, verses 15-19)
  // are perfectly symmetrical, we calculate the outer box dimensions once to ensure
  // they are exactly identical.
  const tBox_Y = shiftedTop;
  const outerSectionH =
    tBox_Y - ((lm.baseG1Y || lm.g1Y) - lm.groupH - lm.boxExtOffset);
  const tBox_H = outerSectionH;

  const bBox_Y = (lm.baseG3Y || lm.g3Y) + lm.boxExtOffset;
  const bBox_H = outerSectionH; // Forcing EXACT same height as the top section!

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

      const rowConnectors: RowConnectorTransform[] = [];
      for (let r = 0; r < 2; r++) {
        const leftV = verses[group.verses[r * 2].number];
        const rightV = verses[group.verses[r * 2 + 1].number];
        if (leftV && rightV) {
          rowConnectors.push({
            x: leftV.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
            y: leftV.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
            z: 0.0025,
            w:
              rightV.x +
              rightV.w -
              leftV.x +
              OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
            h: leftV.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
          });
        }
      }

      return {
        frameX: gBaseX,
        frameY: groupY,
        frameW: gInnerW,
        frameH: lm.groupH,
        isPushedIn,
        isCenter: group.isCenter ?? false,
        verses,
        rowConnectors,
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
      rowConnectors: s1Connectors,
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
export const SURAH_TRANSFORMS = buildSurahTransforms(layoutMath, START_X);

export function getPopUpTrackerPosition(
  verses: { y: number; h: number }[],
  isGlobal = false,
  s1Top = 0,
  pageWidth = PAGE_WIDTH,
): [number, number] {
  if (isGlobal) {
    return [0, s1Top + 0.25];
  }
  const centerY = verses[0].y - verses[0].h / 2;
  const btnX = -pageWidth / 2 - 0.05;
  return [btnX, centerY];
}
