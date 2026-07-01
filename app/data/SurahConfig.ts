import {
  SurahLayoutConfig,
  SectionConfig,
  GridSectionConfig,
  VerticalGroupsSectionConfig,
  type LayoutBlock,
  type SurahGlobalSettings,
} from "./schema";
import type {
  ElementTransform,
  GroupTransforms,
  RowConnectorTransform,
  SectionTransforms,
} from "./schema";
import { SURAH_DATA_ARABIC as SURAH_DATA } from "./surahData";
import { ALAK_LAYOUT_CONFIG } from "./alak96Config";
export { ALAK_LAYOUT_CONFIG };

export interface Verse {
  number: number;
  text: string;
  /**
   * When set, this verse renders as TWO side-by-side capsules sharing a
   * single verse-number badge (instead of one capsule with its own number).
   * Order is RTL reading order: [nearNumberText, farFromNumberText] — index 0
   * sits closest to the shared number badge (read second), index 1 sits
   * furthest away (read first). `text` above is kept as the full combined
   * string and stays the fallback for any renderer that doesn't know about
   * `splitTexts` (e.g. languages that don't set it).
   */
  splitTexts?: [string, string];
}

export interface ColorGroup {
  verses: Verse[];
  verseBg?: string;
  topLabel?: string;
  isPushedIn?: boolean;
  isCenter?: boolean;
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

export { SURAH_DATA };

// ----------------------------------------------------------------------------
// ALAK CONFIGURATION (Fully Config-Driven)
// ----------------------------------------------------------------------------

export interface AlakLayoutParams {
  s1Top: number;
  s1Pad: number;
  gap: number;
  s1AnaGap: number;
  smallBoxH: number;
  anaAyetH: number;
  gapBetweenS1andS2: number;
  s2VerticalPad: number;
  bigBoxH: number;
  groupGap: number;
  groupPad: number;
  groupPadBottom: number;
  s2Gap: number;
  smallBoxH2: number;
  middleExtraGap: number;
  s2PadLeftRight: number;
  g2Scale: number;
  s1BorderWidth: number;
  capsuleLabelW: number;
  capsuleLabelH: number;
  capsuleLabelBorderWidth: number;
  capsuleLabelDrop: number;
  sgPad: number;
  sgBorderWidth: number;
  boxExtOffset: number;
  extraRowGap: number;
  labelHitboxWidth: number;
  verseTextScale?: number;
  translationVerseTextScale?: number | null;
  groupRows?: number[];
  s2VerticalRowGap?: number;
  outerScale?: number;
  curvePad?: number;
  outerCurveXOffset?: number;
  centerCurveXOffset?: number;
  g2Shrink?: number;
  outerShrink?: number;
}


// ----------------------------------------------------------------------------
// LEGACY CONSTANTS & COMPATIBILITY LAYER
// To keep existing components unbroken until they are updated
// ----------------------------------------------------------------------------
export const ALAQ_LAYOUT_CONFIG = ALAK_LAYOUT_CONFIG;
export const BASE_PAGE_WIDTH = ALAK_LAYOUT_CONFIG.dimensions.paperWidth;
export const PAGE_HEIGHT = ALAK_LAYOUT_CONFIG.dimensions.paperHeight;
export const SCENE_CENTER_Y_OFFSET =
  ALAK_LAYOUT_CONFIG.dimensions.sceneCenterYOffset;
export const CAPSULE_BORDER_WIDTH =
  ALAK_LAYOUT_CONFIG.styling.capsuleBorderWidth;
export const CIRCLE_BORDER_WIDTH = ALAK_LAYOUT_CONFIG.styling.circleBorderWidth;
export const VERSE_5_6_19_RADIUS = ALAK_LAYOUT_CONFIG.styling.verseRadius;
export const OPPOSITE_VERSE_CONNECTOR = {
  paddingX: 0.0065,
  paddingY: 0.0065,
  radius: ALAK_LAYOUT_CONFIG.styling.oppositeVerseConnectorRadius,
};
export const VERSE_TEXT_RIGHT_PADDING = 0.003;
export const TOP_LABEL_WIDTH =
  ALAK_LAYOUT_CONFIG.styling.s1NeonConfig.topLabelGapWidth;
export const S2_LABEL_WIDTH = 0.47;
export const S2_LABEL_Y_OFFSET = 0.004;
export const SMALL_TEXT_SHIFT = -0.018;
export const BIG_VERSE_VERTICAL_SHIFT = -0.006;
export const SMALL_VERSE_VERTICAL_SHIFT = -0.005;
export const S1_NEON_CONFIG = ALAK_LAYOUT_CONFIG.styling.s1NeonConfig;

// ----------------------------------------------------------------------------
// SECTION: LAYOUT MATH ENGINE — BLOCK-BASED (new) + LEGACY (backward compat)
// ----------------------------------------------------------------------------

// ── BLOCK ENGINE HELPERS ────────────────────────────────────────────────────

/**
 * Compute the rendered height of a single LayoutBlock.
 *
 * Height = blockPadding(top) + rows * capsuleH + (rows-1) * rowGap + blockPadding(bottom)
 *
 * For `type: 'spacer'`, the height is just `block.fixedHeight`.
 * For `type: 'grid'`, we also include the anaAyet row + an extra gap.
 */
function computeBlockHeight(
  block: LayoutBlock,
  gs: SurahGlobalSettings,
): number {
  if (block.type === 'spacer') {
    return block.fixedHeight ?? 0;
  }

  const capH = block.capsuleHeight ?? gs.capsuleHeight;
  const rGap = block.rowGap ?? gs.rowGap;
  const bPad = block.blockPadding ?? gs.blockPadding;
  const cols = block.columns ?? 2;
  const verseIds = block.verseIds ?? [];
  const numRows = block.rows ?? (cols > 0 ? Math.ceil(verseIds.length / cols) : 0);

  let height = bPad * 2 + numRows * capH + Math.max(0, numRows - 1) * rGap;

  if (block.type === 'grid' && block.anaAyetId !== undefined) {
    // Add the AnaAyet row below the grid, separated by an extra rowGap
    const anaH = block.fixedHeight ?? capH * 1.8; // AnaAyet is taller
    height += rGap + anaH;
  }

  return height;
}

// ── BLOCK-BASED LayoutConfig shape ──────────────────────────────────────────

export interface BlockLayoutConfig {
  /** Engine mode discriminant */
  mode: 'blocks';
  id: string;
  PAGE_WIDTH: number;
  PAGE_HEIGHT: number;
  PW: number;
  PADDING: number;
  CONTENT_W: number;
  START_X: number;
  sectionW: number;

  /** Y of the TOP edge of the entire content stack (highest Y value). */
  contentStartY: number;
  /** Total height of all blocks + gaps. */
  totalContentH: number;

  /** Per-block metadata, in config order. */
  blockMeta: Array<{
    id: string;
    /** Y of the TOP edge of this block's frame. */
    frameY: number;
    /** Full frame height (including blockPadding). */
    frameH: number;
    /** Y of the first capsule row top edge (= frameY - blockPadding). */
    contentY: number;
  }>;

  // Sizing scalars consumed by VerseGroup / SideCurves
  capsuleHeight: number;
  columnGap: number;
  rowGap: number;
  blockGap: number;
  sectionPadX: number;
  blockPadding: number;
  sectionBorderWidth: number;
  verseTextScale?: number;
  translationVerseTextScale?: number | null;
  capsuleLabelW?: number;
  capsuleLabelH?: number;
  capsuleLabelBorderWidth?: number;
  capsuleLabelDrop?: number;

  // SideCurves / DynamicBackground compatibility
  s2Top: number;    // alias for contentStartY
  s2H: number;      // alias for totalContentH
  s2BackgroundTexture?: string;
  s2BackgroundScaleX?: number;
  s2BackgroundScaleY?: number;
  s2BackgroundOffsetX?: number;
  s2BackgroundOffsetY?: number;
  hasIntroOutro: false;

  // groupYPositions / groupHeights: parallel arrays for SideCurves & computeFoldYPositions
  groupYPositions: number[];
  groupHeights: number[];

  // ── SideCurves compatibility aliases ────────────────────────────────────
  // SideCurves.computeBrackets() destructures these from `layout` by name.
  // They map 1:1 to globalSettings values so no NaN ever reaches Three.js.
  smallBoxH2: number;   // = gs.capsuleHeight
  groupPad:   number;   // = gs.blockPadding
  s2Gap:      number;   // = gs.columnGap (used as a generic spacing reference)
  curvePad:   number;   // = gs.blockPadding (bracket placement pad)
  innerW:     number;   // = sectionW - sectionPadX*2
  baseX:      number;   // = START_X + sectionPadX
}

// ── NEW BLOCK-BASED ENGINE ──────────────────────────────────────────────────

/**
 * NEW: Block-based layout math engine.
 *
 * Algorithm (4 passes):
 *   Pass 1 — Compute height of each block.
 *   Pass 2 — Sum all heights + blockGaps → `totalContentH`.
 *   Pass 3 — Derive `contentStartY` so the stack is perfectly centred.
 *   Pass 4 — Walk blocks top-to-bottom, assigning frameY for each.
 *
 * Returns a `BlockLayoutConfig` that is consumed by `buildBlockTransforms`.
 */
export function createBlockLayoutMath(
  config: SurahLayoutConfig<any>,
  dynamicPageWidth: number,
): BlockLayoutConfig {
  const gs = config.globalSettings!;
  const blocks = config.blocks ?? [];
  const PAGE_WIDTH = dynamicPageWidth;
  const PADDING = config.dimensions.padding;
  const CONTENT_W = PAGE_WIDTH - PADDING * 2;
  const START_X = PADDING;
  const sectionW = CONTENT_W;
  const PH = config.dimensions.paperHeight;
  const sceneCenterYOffset = config.dimensions.sceneCenterYOffset;

  // ── Pass 1: block heights ──────────────────────────────────────────────
  const blockHeights = blocks.map((b) => computeBlockHeight(b, gs));

  // ── Pass 2: total content height ─────────────────────────────────────
  const numGaps = Math.max(0, blocks.length - 1);
  const totalContentH =
    blockHeights.reduce((sum, h) => sum + h, 0) + numGaps * gs.blockGap;

  // ── Pass 3: vertical centering ───────────────────────────────────────
  // The 3D scene y-axis: y=0 is the paper top, y=-PH is the paper bottom.
  // Paper vertical center = -(PH/2) + sceneCenterYOffset.
  // We want the content block centre to sit at that point.
  //   contentCenter = contentStartY - totalContentH / 2
  //   ⟹ contentStartY = paperCenter + totalContentH / 2
  const paperCenter = -(PH / 2) + sceneCenterYOffset;
  const contentStartY = paperCenter + totalContentH / 2;

  // ── Pass 4: per-block Y positions ────────────────────────────────────
  const blockMeta: BlockLayoutConfig['blockMeta'] = [];
  let cursorY = contentStartY; // walks downward

  for (let i = 0; i < blocks.length; i++) {
    const nudge = blocks[i].verticalNudge ?? 0;
    const frameH = blockHeights[i];
    let frameY: number;
    if (i === 0) {
      // Legacy quirk, preserved exactly: block 0's nudge is isolated and does
      // NOT cascade to later blocks (it's applied as a post-hoc adjustment
      // after every other block's position was already computed).
      frameY = cursorY - nudge;
    } else {
      cursorY -= nudge; // manual offset, cascades to later blocks
      frameY = cursorY;
    }
    const bPad = blocks[i].blockPadding ?? gs.blockPadding;
    const contentY = frameY - bPad; // top edge of first capsule row

    blockMeta.push({ id: blocks[i].id, frameY, frameH, contentY });

    cursorY -= frameH;
    if (i < blocks.length - 1) cursorY -= gs.blockGap;
  }

  // ── Compatibility arrays for SideCurves & computeFoldYPositions ───────
  const groupYPositions = blockMeta.map((m) => m.frameY);
  const groupHeights    = blockMeta.map((m) => m.frameH);

  // ── Section-wide background: explicit `sectionBackground` wins; falls back
  // to the first block that declares its own `backgroundTexture` (back-compat
  // for configs where one block's frame doubles as the section background).
  const sectionBg = config.sectionBackground;
  const bgBlock = blocks.find((b) => b.backgroundTexture);

  return {
    mode: 'blocks',
    id: config.id,
    PAGE_WIDTH,
    PAGE_HEIGHT: PH,
    PW: PAGE_WIDTH,
    PADDING,
    CONTENT_W,
    START_X,
    sectionW,

    contentStartY,
    totalContentH,
    blockMeta,

    capsuleHeight:      gs.capsuleHeight,
    columnGap:          gs.columnGap,
    rowGap:             gs.rowGap,
    blockGap:           gs.blockGap,
    sectionPadX:        gs.sectionPadX,
    blockPadding:       gs.blockPadding,
    sectionBorderWidth: gs.sectionBorderWidth,
    verseTextScale:     gs.verseTextScale,
    translationVerseTextScale: gs.translationVerseTextScale,
    capsuleLabelW:      gs.capsuleLabelW,
    capsuleLabelH:      gs.capsuleLabelH,
    capsuleLabelBorderWidth: gs.capsuleLabelBorderWidth,
    capsuleLabelDrop:   gs.capsuleLabelDrop,

    // SideCurves / DynamicBackground compat aliases
    s2Top: contentStartY,
    s2H:   totalContentH,
    s2BackgroundTexture:  sectionBg?.texture ?? bgBlock?.backgroundTexture,
    s2BackgroundScaleX:   sectionBg?.scaleX ?? bgBlock?.backgroundScaleX,
    s2BackgroundScaleY:   sectionBg?.scaleY ?? bgBlock?.backgroundScaleY,
    s2BackgroundOffsetX:  sectionBg?.offsetX ?? bgBlock?.backgroundOffsetX,
    s2BackgroundOffsetY:  sectionBg?.offsetY ?? bgBlock?.backgroundOffsetY,
    hasIntroOutro: false,

    // ── SideCurves field aliases ────────────────────────────────────────
    // computeBrackets() destructures these from `layout` by name.
    // Map them from globalSettings so no NaN reaches SideCurves.
    smallBoxH2: gs.capsuleHeight,          // height of one capsule
    groupPad:   gs.blockPadding,           // top/bottom padding inside a frame
    s2Gap:      gs.columnGap,              // horizontal gap (used as spacing ref)
    curvePad:   gs.blockPadding,           // same as groupPad for bracket placement
    innerW:     sectionW - gs.sectionPadX * 2,
    baseX:      START_X + gs.sectionPadX,

    groupYPositions,
    groupHeights,
  };
}

// ── BLOCK-BASED TRANSFORM BUILDER ───────────────────────────────────────────

export interface BlockSurahTransforms {
  mode: 'blocks';
  sections: SectionTransforms[]; // one entry per LayoutBlock
}

/**
 * NEW: Builds concrete world-space transforms for every verse in every block.
 *
 * For each `LayoutBlock`:
 *  - `group`  → emits a `SectionTransforms` with `groups[0]` containing
 *               per-verse `ElementTransform` records and row-connector rects.
 *  - `grid`   → emits the Alak-style `SectionTransforms` with `verses` +
 *               `anaAyet` + `rowConnectors`.
 *  - `spacer` → emits an empty `SectionTransforms` (no verses).
 *
 * The shape of `SectionTransforms` / `GroupTransforms` is UNCHANGED so that
 * `SectionOne`, `SectionTwo`, `VerseGroup`, `SideCurves` need zero edits.
 */
export function buildBlockTransforms(
  lm: BlockLayoutConfig,
  startX: number,
  config: SurahLayoutConfig<any>,
): BlockSurahTransforms {
  const gs = config.globalSettings!;
  const blocks = config.blocks ?? [];
  const sections: SectionTransforms[] = [];

  // Mirror shift for the outer section frame (cosmetic, same as legacy)
  const S2_MIRROR_SHIFT = 0.015;
  const framePad = gs.framePad ?? 0;
  const shiftedTop = lm.contentStartY + framePad - S2_MIRROR_SHIFT;
  const shiftedBot = lm.contentStartY - lm.totalContentH - framePad + S2_MIRROR_SHIFT;
  const shiftedH   = lm.totalContentH + framePad * 2 - 2 * S2_MIRROR_SHIFT;

  const bw   = gs.sectionBorderWidth;
  // connectorPad mirrors the legacy independent `sgPad` field exactly (baseX -
  // pad, innerW + pad*2). When omitted, falls back to the original block-engine
  // expression byte-for-bit so already-migrated configs (Ihlas/Kafirun) are untouched.
  const connX =
    gs.connectorPad !== undefined
      ? startX + gs.sectionPadX - gs.connectorPad
      : startX - gs.sectionPadX * 0.5;
  const connW =
    gs.connectorPad !== undefined
      ? lm.sectionW - gs.sectionPadX * 2 + gs.connectorPad * 2
      : lm.sectionW + gs.sectionPadX;

  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block  = blocks[bIdx];
    const meta   = lm.blockMeta[bIdx];
    const capH   = block.capsuleHeight   ?? gs.capsuleHeight;
    const rGap   = block.rowGap          ?? gs.rowGap;
    const bPad   = block.blockPadding    ?? gs.blockPadding;
    // colGap (width calc) mirrors legacy `standardGHalfW`, which always uses the
    // GLOBAL gap — only the X-position offset uses a per-block override (xGap).
    // This decoupling is a deliberate legacy quirk, preserved exactly.
    const colGap = gs.columnGap;
    const colGapForPosition = block.columnGap ?? gs.columnGap;
    const cols   = block.columns ?? 2;
    const inset  = block.horizontalInset ?? 0;

    // ── Section-level geometry (horizontal) ───────────────────────────────
    const sectionInnerW = lm.sectionW - gs.sectionPadX * 2;
    const blockInnerW   = sectionInnerW - inset * 2;
    const blockBaseX    = startX + gs.sectionPadX + inset;

    // Width of a single capsule column.
    // IMPORTANT: mirrors legacy `standardGHalfW = (gInnerW - groupPad*2 - s2Gap) / 2`.
    // Even for columns:1, the base width is the half-column size so that
    // verseOverrides.expandW (e.g. 0.2) does the full-width stretching — exactly
    // as in the legacy engine. Using full blockInnerW here would double-count expandW.
    const colW = (blockInnerW - bPad * 2 - colGap) / 2;

    const centerX = blockBaseX + blockInnerW / 2;

    if (block.type === 'spacer') {
      // Spacer emits no verse transforms — just a structural placeholder.
      sections.push({
        frameX: startX,
        frameY: meta.frameY,
        frameW: lm.sectionW,
        frameH: meta.frameH,
        shiftedTop,
        shiftedBot,
        shiftedH,
        connectorX: connX,
        connectorW: connW,
        borderWidth: bw,
        groups: [],
      });
      continue;
    }

    if (block.type === 'grid') {
      // ── ALAK-style grid block ────────────────────────────────────────
      // verseIds are in display order: [left0, right0, left1, right1, ...]
      const verseIds = block.verseIds ?? [];
      const anaAyetId = block.anaAyetId;
      const gridCapH = block.capsuleHeight ?? gs.capsuleHeight;
      const gridGap  = block.rowGap ?? gs.rowGap;
      const gridPad  = block.blockPadding ?? gs.blockPadding;

      const gridInnerW  = lm.sectionW - gridPad * 2;
      const gridHalfW   = (gridInnerW - colGap) / 2;
      const gridBaseX   = startX + gridPad;
      const gridContentY = meta.frameY - gridPad;

      const verseTransforms: Record<number, ElementTransform> = {};
      verseIds.forEach((vId, i) => {
        const isRight  = i % 2 !== 0;
        const row      = Math.floor(i / 2);
        verseTransforms[vId] = {
          x: isRight ? gridBaseX + gridHalfW + colGap : gridBaseX,
          y: gridContentY - row * (gridCapH + gridGap),
          z: 0.002,
          w: gridHalfW,
          h: gridCapH,
        };
      });

      // Row connectors
      const numGridRows = Math.ceil(verseIds.length / 2);
      const gridConnectors: RowConnectorTransform[] = [];
      for (let r = 0; r < numGridRows; r++) {
        const lv = verseTransforms[verseIds[r * 2]];
        const rv = verseTransforms[verseIds[r * 2 + 1]];
        if (lv && rv) {
          gridConnectors.push({
            x: lv.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
            y: lv.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
            z: 0.0015,
            w: rv.x + rv.w - lv.x + OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
            h: lv.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
          });
        }
      }

      // AnaAyet transform (below the grid rows)
      let anaAyetTransform: ElementTransform | undefined;
      if (anaAyetId !== undefined) {
        const anaH = block.fixedHeight ?? gridCapH * 1.8;
        const lastRowY = gridContentY - Math.max(0, numGridRows - 1) * (gridCapH + gridGap) - gridCapH;
        anaAyetTransform = {
          x: gridBaseX,
          y: lastRowY - gridGap,
          z: 0.002,
          w: gridInnerW,
          h: anaH,
        };
      }

      const anaAyetFrame = anaAyetTransform;
      sections.push({
        frameX: startX,
        frameY: meta.frameY,
        frameW: lm.sectionW,
        frameH: meta.frameH,
        borderWidth: block.fixedHeight ?? 0, // s1BorderWidth compat
        labelPinY: meta.frameY,
        verses: verseTransforms,
        rowConnectors: gridConnectors,
        ...(anaAyetFrame !== undefined ? {
          anaAyet: anaAyetFrame,
          capsuleLabelX: gridBaseX + gridInnerW / 2,
          capsuleLabelY: anaAyetFrame.y + 0.015,
          capsuleLabelW: 0.2,
          capsuleLabelH: 0.032,
          capsuleLabelBorderWidth: 0.0035,
          capsuleLabelDrop: 0.015,
        } : {}),
        shiftedTop,
        shiftedBot,
        shiftedH,
        groups: [],
      });
      continue;
    }

    // ── GROUP block (the common case) ────────────────────────────────────
    const verseIds = block.verseIds ?? [];
    const verses: Record<number, ElementTransform> = {};

    verseIds.forEach((vId, i) => {
      const isRight  = cols === 2 ? i % 2 !== 0 : false;
      const row      = Math.floor(i / cols);
      const rowOffset = row * (capH + rGap + (block.extraRowGap ?? 0));

      let vx: number;
      if (cols === 1) {
        vx = centerX - colW / 2;
      } else {
        vx = isRight
          ? centerX + colGapForPosition / 2
          : centerX - colGapForPosition / 2 - colW;
      }

      // Per-verse xOffset nudge from verseOverrides
      const xOffset = config.verseOverrides?.[vId]?.xOffset ?? 0;

      verses[vId] = {
        x: vx + xOffset,
        y: meta.contentY - rowOffset,
        z: 0.003,
        w: colW,
        h: capH,
      };
    });

    // Row connectors (only for 2-col blocks)
    const numRows = Math.ceil(verseIds.length / cols);
    const rowConnectors: RowConnectorTransform[] = [];
    if (cols === 2 && !(block.hideRowConnectors)) {
      for (let r = 0; r < numRows; r++) {
        const lv = verses[verseIds[r * 2]];
        const rv = verses[verseIds[r * 2 + 1]];
        if (lv && rv) {
          rowConnectors.push({
            x: lv.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
            y: lv.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
            z: 0.0025,
            w: rv.x + rv.w - lv.x + OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
            h: lv.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
          });
        }
      }
    }

    const groupT: GroupTransforms = {
      frameX: blockBaseX,
      frameY: meta.frameY,
      frameW: blockInnerW,
      frameH: meta.frameH,
      isPushedIn: block.isPushedIn ?? (block.horizontalInset ?? 0) > 0,
      isCenter:   block.isCenter ?? false,
      verses,
      rowConnectors,
      topLabelConfig: block.topLabelConfig,
      backgroundTexture:  block.backgroundTexture,
      backgroundScaleX:   block.backgroundScaleX,
      backgroundScaleY:   block.backgroundScaleY,
      backgroundOffsetX:  block.backgroundOffsetX,
      backgroundOffsetY:  block.backgroundOffsetY,
    };

    sections.push({
      frameX: startX,
      frameY: meta.frameY,
      frameW: lm.sectionW,
      frameH: meta.frameH,
      shiftedTop,
      shiftedBot,
      shiftedH,
      connectorX: connX,
      connectorW: connW,
      borderWidth: bw,
      topLabelPinY:    shiftedTop,
      bottomLabelPinY: shiftedBot,
      innerW: sectionInnerW,
      baseX:  startX + gs.sectionPadX,
      groups: [groupT],
    });
  }

  return { mode: 'blocks', sections };
}

// ────────────────────────────────────────────────────────────────────────────
// ALAK-ONLY ENGINE — every other surah (Fatiha, Ayat al-Kursi, Ahzab, Ihlas,
// Kafirun) runs on the `blocks` engine above, which is the standard for all
// future surahs. Alak 96 is the one deliberate exception: it's the only surah
// with a grid+anaAyet header (Section 1) plus full-width intro/outro verses
// and decorative top/bottom connector frames around the group stack — a
// richer shape than the flat `LayoutBlock[]` model (and its renderer in
// ElevatedSectionSurfaces.tsx) currently supports. Rather than rewrite Alak's
// battle-tested, pixel-tuned renderer to chase architectural purity, this
// engine is kept alive scoped to Alak alone. Do not add new surahs here —
// use `blocks` + `globalSettings` instead (see ihlas112Config.ts for a
// minimal example).
// ────────────────────────────────────────────────────────────────────────────
export function createLayoutMath(
  config: SurahLayoutConfig<AlakLayoutParams>,
  dynamicPageWidth: number,
) {
  const p = config.params!;
  const PAGE_WIDTH = dynamicPageWidth;
  const PW = PAGE_WIDTH;
  const PADDING = config.dimensions.padding;
  const CONTENT_W = PW - PADDING * 2;
  const START_X = PADDING;

  // --- Section 1 ---
  const s1H = p.s1Pad * 2 + (p.smallBoxH * 2 + p.gap) + p.s1AnaGap + p.anaAyetH;

  // --- Section 2 ---
  // groupH, hasIntroOutro, and s2H must be computed BEFORE s2Top because
  // the centering formula (hasS1 === false branch) depends on s2H.

  const getGroupH = (rows: number, extraGap: number = 0) => {
    const s2VertGap = p.s2VerticalRowGap ?? p.s2Gap;
    return (
      p.groupPad +
      p.groupPadBottom +
      (rows * p.smallBoxH2 + Math.max(0, rows - 1) * s2VertGap) +
      extraGap
    );
  };

  const groupH = getGroupH(2);

  // ── Dynamic group heights — driven by the actual groupRows array length ──
  // groupRows[i] specifies how many rows of capsules group i contains.
  // Any group not listed in groupRows defaults to 2 rows (backward-compat).
  const numGroups = p.groupRows ? p.groupRows.length : 3;
  const dynamicGroupHeights: number[] = Array.from(
    { length: numGroups },
    (_, i) => getGroupH(p.groupRows?.[i] ?? 2),
  );

  // Legacy aliases kept for backward-compatibility with Alak / Ayat al-Kursi.
  const g0H = dynamicGroupHeights[0] ?? getGroupH(2);
  const g1H = dynamicGroupHeights[1] ?? getGroupH(2);
  const g2H = dynamicGroupHeights[2] ?? getGroupH(2);

  const totalGroupsH = dynamicGroupHeights.reduce((sum, h) => sum + h, 0);

  // When hasIntro is false there are no intro/outro verse boxes, so the two
  // bigBoxH slots and their two flanking groupGaps are collapsed to zero.
  // When hasIntro is true the formula is mathematically identical to before.
  const hasIntroOutro = config.features.hasIntro;

  // Number of inter-group gaps = numGroups - 1 (minimum 0).
  const interGroupGaps = Math.max(0, numGroups - 1);

  const s2H = hasIntroOutro
    ? p.s2VerticalPad * 2 +
      p.bigBoxH * 2 +
      p.groupGap * (interGroupGaps + 2) + // gaps between groups + 2 flanking
      totalGroupsH +
      p.middleExtraGap * interGroupGaps
    : p.s2VerticalPad * 2 +
      p.groupGap * interGroupGaps + // gaps *between* groups
      totalGroupsH +
      p.middleExtraGap * interGroupGaps;

  // Detect whether a gridWithAnaAyet (Section 1) is part of this config.
  // If not, we center s2 on the paper rather than chaining from s1Top.
  const hasS1 = config.sections?.some((s) => s.type === "gridWithAnaAyet");

  // s2Top: the Y coordinate of the top of the vertical-groups block.
  //   hasS1 === true  → Alak path (identical to original formula)
  //   hasS1 === false → center the block vertically on the paper
  const s2Top = hasS1
    ? p.s1Top - s1H - p.gapBetweenS1andS2 // Alak: unchanged
    : // Ayat al-Kursi / Ahzab: camera lives in 0 → -PAGE_HEIGHT, center is -(height/2).
      // Shift up by s2H/2 so the block straddles that center symmetrically.
      -(config.dimensions.paperHeight / 2) +
      s2H / 2 +
      config.dimensions.sceneCenterYOffset;

  // --- Element Y Positions ---
  // v6Y marks the intro-verse top; when there is no intro verse the groups
  // start immediately after s2VerticalPad (same anchor, no bigBoxH shift).
  const v6Y = s2Top - p.s2VerticalPad;
  const baseG1Y = hasIntroOutro
    ? v6Y - p.bigBoxH - p.groupGap // Alak: identical to original
    : v6Y; // Ayat al-Kursi / Ahzab: groups slide up

  // Build all group Y positions dynamically.
  // groupYPositions[0] = baseG1Y; each subsequent group steps down by the
  // previous group's height + the inter-group gap (with middleExtraGap).
  const dynamicGroupYPositions: number[] = [];
  dynamicGroupYPositions[0] = baseG1Y;
  const s2Config = config.sections?.find((s) => s.type === "verticalGroups") as
    | VerticalGroupsSectionConfig
    | undefined;
  const s2Groups = s2Config?.groups ?? [];
  for (let i = 1; i < numGroups; i++) {
    const pushDown = s2Groups[i]?.pushDown ?? 0;
    dynamicGroupYPositions[i] =
      dynamicGroupYPositions[i - 1] -
      dynamicGroupHeights[i - 1] -
      (p.groupGap + p.middleExtraGap) -
      pushDown;
  }

  // Allow independent vertical shifting for the very first group
  if (s2Groups[0]?.pushDown) {
    dynamicGroupYPositions[0] -= s2Groups[0].pushDown;
  }

  // Legacy aliases for Alak / Ayat al-Kursi backward compatibility.
  const baseG2Y = dynamicGroupYPositions[1] ?? baseG1Y;
  const baseG3Y = dynamicGroupYPositions[2] ?? baseG2Y;

  // v19Y position is always computed (keeps type consistent) but only rendered
  // when hasIntro is true.
  const lastGroupY = dynamicGroupYPositions[numGroups - 1] ?? baseG1Y;
  const lastGroupH = dynamicGroupHeights[numGroups - 1] ?? g0H;
  const baseV19Y = hasIntroOutro
    ? lastGroupY - lastGroupH - p.groupGap
    : lastGroupY - lastGroupH; // not rendered; safe sentinel

  return {
    id: config.id,
    PAGE_WIDTH,
    PAGE_HEIGHT: config.dimensions.paperHeight,
    PW,
    PADDING,
    CONTENT_W,
    START_X,

    // Section 1
    sectionW: CONTENT_W,
    innerW: CONTENT_W - p.s1Pad * 2,
    innerHalfW: (CONTENT_W - p.s1Pad * 2 - p.gap) / 2,
    s1Top: p.s1Top,
    s1Pad: p.s1Pad,
    gap: p.gap,
    s1AnaGap: p.s1AnaGap,
    smallBoxH: p.smallBoxH,
    anaAyetH: p.anaAyetH,
    s1H,

    // Section 2
    s2Top,
    s2Pad: p.s2VerticalPad,
    s2PadTop: p.s2VerticalPad,
    s2PadBottom: p.s2VerticalPad,
    bigBoxH: p.bigBoxH,
    groupGap: p.groupGap,
    groupPad: p.groupPad,
    s2Gap: p.s2Gap,
    smallBoxH2: p.smallBoxH2,
    g2Scale: p.g2Scale,
    outerScale: p.outerScale ?? 0,
    curvePad: p.curvePad,
    groupH,
    s2H,

    s2BackgroundTexture: (
      config.sections?.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundTexture,
    s2BackgroundScaleX: (
      config.sections?.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundScaleX,
    s2BackgroundScaleY: (
      config.sections?.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundScaleY,
    s2BackgroundOffsetX: (
      config.sections?.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundOffsetX,
    s2BackgroundOffsetY: (
      config.sections?.find((s) => s.type === "verticalGroups") as
        | VerticalGroupsSectionConfig
        | undefined
    )?.backgroundOffsetY,

    v6Y,
    g1Y: baseG1Y,
    g2Y: baseG2Y,
    g3Y: baseG3Y,
    v19Y: baseV19Y,
    baseG1Y,
    baseG3Y,

    groupInnerW: CONTENT_W - p.s2PadLeftRight * 2 - p.groupPad * 2,
    groupInnerHalfW:
      (CONTENT_W - p.s2PadLeftRight * 2 - p.groupPad * 2 - p.s2Gap) / 2,

    s2PadLeftRight: p.s2PadLeftRight,
    s2VerticalRowGap: p.s2VerticalRowGap ?? p.s2Gap,
    g2Shrink: p.g2Shrink,
    outerShrink: p.outerShrink ?? 0,
    s1BorderWidth: p.s1BorderWidth,
    capsuleLabelW: p.capsuleLabelW,
    capsuleLabelH: p.capsuleLabelH,
    capsuleLabelBorderWidth: p.capsuleLabelBorderWidth,
    capsuleLabelDrop: p.capsuleLabelDrop,
    sgPad: p.sgPad,
    sgBorderWidth: p.sgBorderWidth,
    boxExtOffset: p.boxExtOffset,
    extraRowGap: p.extraRowGap,
    verseTextScale: p.verseTextScale ?? undefined,
    translationVerseTextScale: p.translationVerseTextScale,

    // ── Dynamic layout metadata consumed by SideCurves & SectionTwo ──────
    // NOTE: satisfies Record<string, number> is removed because these new
    // fields are non-number. We use an explicit return type instead.
    hasIntroOutro, // boolean
    // Fully dynamic — length matches the actual number of groups defined.
    groupYPositions: dynamicGroupYPositions as number[],
    groupHeights: dynamicGroupHeights as number[],
  };
}

export const layoutMath = createLayoutMath(ALAK_LAYOUT_CONFIG, BASE_PAGE_WIDTH);
export type LayoutConfig = ReturnType<typeof createLayoutMath>;

export const PAGE_WIDTH = layoutMath.PAGE_WIDTH;
export const PW = layoutMath.PW;
export const PADDING = layoutMath.PADDING;
export const CONTENT_W = layoutMath.CONTENT_W;
export const START_X = layoutMath.START_X;

// createFoldYPositions and FOLD_Y_POSITIONS were removed and moved to ALAK_LAYOUT_CONFIG.animations.computeFoldYPositions

// ============================================================================
// LAYOUT ENGINE
// ============================================================================

export interface SurahTransforms {
  sections: SectionTransforms[];
}

export function buildSurahTransforms(
  lm: LayoutConfig,
  startX: number,
  config: SurahLayoutConfig<AlakLayoutParams>,
): SurahTransforms {
  const sections: SectionTransforms[] = [];

  // Build transforms for each section dynamically based on its type
  (config.sections ?? []).forEach((section) => {
    if (section.type === "gridWithAnaAyet") {
      const s1Config = section as GridSectionConfig;
      const s1BaseX = startX + lm.s1Pad;
      const ANA_AYET_Y_OFFSET = -0.01;
      const anaAyetY =
        lm.s1Top -
        lm.s1Pad -
        (lm.smallBoxH * 2 + lm.gap) -
        lm.s1AnaGap +
        ANA_AYET_Y_OFFSET;

      const s1Verses: Record<number, ElementTransform> = {};
      s1Config.verses.forEach((verseId, i) => {
        const isRightCol = i % 2 !== 0;
        const isBottomRow = i >= 2;
        s1Verses[verseId] = {
          x: s1BaseX + (isRightCol ? lm.innerHalfW + lm.gap : 0),
          y: lm.s1Top - lm.s1Pad - (isBottomRow ? lm.smallBoxH + lm.gap : 0),
          z: 0.002,
          w: lm.innerHalfW,
          h: lm.smallBoxH,
        };
      });

      const s1Connectors: RowConnectorTransform[] = [];
      for (let r = 0; r < 2; r++) {
        const leftV = s1Verses[s1Config.verses[r * 2]];
        const rightV = s1Verses[s1Config.verses[r * 2 + 1]];
        if (leftV && rightV) {
          s1Connectors.push({
            x: leftV.x - OPPOSITE_VERSE_CONNECTOR.paddingX,
            y: leftV.y + OPPOSITE_VERSE_CONNECTOR.paddingY,
            z: 0.0015,
            w:
              rightV.x +
              rightV.w -
              leftV.x +
              OPPOSITE_VERSE_CONNECTOR.paddingX * 2,
            h: leftV.h + OPPOSITE_VERSE_CONNECTOR.paddingY * 2,
          });
        }
      }

      sections.push({
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
        capsuleLabelX: s1BaseX + lm.innerW / 2,
        capsuleLabelY: anaAyetY + 0.015,
        capsuleLabelW: lm.capsuleLabelW,
        capsuleLabelH: lm.capsuleLabelH,
        capsuleLabelBorderWidth: lm.capsuleLabelBorderWidth,
        capsuleLabelDrop: lm.capsuleLabelDrop,
        borderWidth: lm.s1BorderWidth,
        labelPinY: lm.s1Top,
      });
    } else if (section.type === "verticalGroups") {
      const s2Config = section as VerticalGroupsSectionConfig;
      const s2InnerW = lm.sectionW - lm.s2PadLeftRight * 2;
      const s2BaseX = startX + lm.s2PadLeftRight;

      const S2_MIRROR_SHIFT = 0.015;
      const shiftedTop = lm.s2Top - S2_MIRROR_SHIFT;
      const shiftedBot = lm.s2Top - lm.s2H + S2_MIRROR_SHIFT;
      const shiftedH = lm.s2H - 2 * S2_MIRROR_SHIFT;

      const bw = lm.sgBorderWidth;
      const connX = s2BaseX - lm.sgPad;
      const connW = s2InnerW + lm.sgPad * 2;

      // ── Group Y positions come from the layout math engine ────────────────
      const groupYPositions = lm.groupYPositions;

      const groups: GroupTransforms[] = s2Config.groups.map((group, gIdx) => {
        const groupY = groupYPositions[gIdx];
        const isPushedIn = group.isPushedIn ?? false;
        const scaleAmount =
          group.customScale ?? (isPushedIn ? lm.g2Scale : lm.outerScale);
        const groupGapAmount = group.xGap ?? lm.s2Gap;
        const gInnerW = s2InnerW - scaleAmount * 2;
        const gBaseX = s2BaseX + scaleAmount;

        const standardGHalfW = (gInnerW - lm.groupPad * 2 - lm.s2Gap) / 2;
        const centerX = gBaseX + gInnerW / 2;
        const extraRowGap = group.extraRowGap ?? 0;

        const numCols = group.columns ?? 2;
        const verses: Record<number, ElementTransform> = {};
        group.verseIds.forEach((verseId, i) => {
          const isRightCol = numCols === 2 ? i % 2 !== 0 : false;
          // Dynamic row index: each pair of capsules (left+right) occupies one row.
          const rowIndex = Math.floor(i / numCols);
          const rowOffset =
            rowIndex * (lm.smallBoxH2 + lm.s2VerticalRowGap + extraRowGap);
            
          let verseX;
          if (numCols === 1) {
            verseX = centerX - standardGHalfW / 2;
          } else {
            verseX = isRightCol 
              ? centerX + groupGapAmount / 2 
              : centerX - groupGapAmount / 2 - standardGHalfW;
          }

          // Per-verse horizontal nudge — keyed by verseId (Arabic numbering).
          // Positive xOffset → pushes right, negative → pushes left.
          const verseXOffset = config.verseOverrides?.[verseId]?.xOffset ?? 0;

          verses[verseId] = {
            x: verseX + verseXOffset,
            y: groupY - lm.groupPad - rowOffset,
            z: 0.003,
            w: standardGHalfW,
            h: lm.smallBoxH2,
          };
        });

        // Dynamic row connectors — one per row (pair of capsules), only if 2 columns
        const numRows = Math.ceil(group.verseIds.length / numCols);
        const rowConnectors: RowConnectorTransform[] = [];
        if (numCols === 2) {
          for (let r = 0; r < numRows; r++) {
            const leftV = verses[group.verseIds[r * 2]];
            const rightV = verses[group.verseIds[r * 2 + 1]];
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
        }

        return {
          frameX: gBaseX,
          frameY: groupY,
          frameW: gInnerW,
          frameH: lm.groupHeights[gIdx] ?? lm.groupH,
          isPushedIn,
          isCenter: group.isCenter ?? false,
          verses,
          rowConnectors,
          topLabelConfig: group.topLabelConfig,
          backgroundTexture: group.backgroundTexture,
          backgroundScaleX: group.backgroundScaleX,
          backgroundScaleY: group.backgroundScaleY,
          backgroundOffsetX: group.backgroundOffsetX,
          backgroundOffsetY: group.backgroundOffsetY,
        };
      });

      // ── Base section transform (always present) ───────────────────────────
      const sectionTransform: SectionTransforms = {
        frameX: startX,
        frameW: lm.sectionW,
        shiftedTop,
        shiftedBot,
        shiftedH,
        connectorX: connX,
        connectorW: connW,
        borderWidth: bw,
        groups,
        innerW: s2InnerW,
        baseX: s2BaseX,
        topLabelPinY: shiftedTop,
        bottomLabelPinY: shiftedBot,
      };

      // ── Intro/outro verse boxes and frame connectors — ONLY when hasIntro ─
      if (config.features.hasIntro) {
        const tBox_Y = shiftedTop;
        const outerSectionH = tBox_Y - (lm.g1Y - lm.groupH - lm.boxExtOffset);
        const tBox_H = outerSectionH;
        const bBox_Y = lm.g3Y + lm.boxExtOffset;
        const bBox_H = outerSectionH;

        sectionTransform.topConnectorY = tBox_Y;
        sectionTransform.topConnectorH = tBox_H;
        sectionTransform.bottomConnectorY = bBox_Y;
        sectionTransform.bottomConnectorH = bBox_H;
        sectionTransform.introVerse = {
          x: s2BaseX,
          y: lm.v6Y,
          z: 0.003,
          w: s2InnerW,
          h: lm.bigBoxH,
        };
        sectionTransform.outroVerse = {
          x: s2BaseX,
          y: lm.v19Y,
          z: 0.003,
          w: s2InnerW,
          h: lm.bigBoxH,
        };
      }

      sections.push(sectionTransform);
    }
  });

  return { sections };
}

// Output is just { sections } now
export const SURAH_TRANSFORMS = buildSurahTransforms(
  layoutMath,
  START_X,
  ALAK_LAYOUT_CONFIG,
);

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
