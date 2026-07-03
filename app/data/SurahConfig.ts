import {
  SurahLayoutConfig,
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

// ----------------------------------------------------------------------------
// SHARED CONSTANTS
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
// SECTION: LAYOUT MATH ENGINE — BLOCK-BASED
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
    // Add the AnaAyet row below the grid, separated by anaAyetGap (falls
    // back to the regular row gap). Height reservation intentionally does
    // NOT include `anaAyetYOffset` — that's a purely cosmetic position nudge.
    const anaH = block.fixedHeight ?? capH * 1.8; // AnaAyet is taller
    height += (block.anaAyetGap ?? rGap) + anaH;
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
  config: SurahLayoutConfig,
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
  let totalGapsH = 0;
  for (let i = 1; i < blocks.length; i++) {
    totalGapsH += blocks[i].gapBefore ?? gs.blockGap;
  }
  const totalContentH = blockHeights.reduce((sum, h) => sum + h, 0) + totalGapsH;

  // ── Pass 3: vertical centering ───────────────────────────────────────
  // The 3D scene y-axis: y=0 is the paper top, y=-PH is the paper bottom.
  // Paper vertical center = -(PH/2) + sceneCenterYOffset.
  // We want the content block centre to sit at that point.
  //   contentCenter = contentStartY - totalContentH / 2
  //   ⟹ contentStartY = paperCenter + totalContentH / 2
  const paperCenter = -(PH / 2) + sceneCenterYOffset;
  const contentStartY = gs.contentStartYOverride ?? (paperCenter + totalContentH / 2);

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
    if (i < blocks.length - 1) cursorY -= blocks[i + 1].gapBefore ?? gs.blockGap;
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
  config: SurahLayoutConfig,
): BlockSurahTransforms {
  const gs = config.globalSettings!;
  const blocks = config.blocks ?? [];
  const sections: SectionTransforms[] = [];

  // Mirror shift for the outer section frame (cosmetic, same as legacy).
  // Scoped to the non-grid ("section 2") blocks only — when a `'grid'` block
  // (Alak's Section 1) is present, it has its own independent frame and must
  // NOT be included in this span, matching legacy's separate `s1H`/`s2H`.
  // When there's no grid block (every other surah), this reduces to the
  // exact original expression byte-for-bit — nudge-agnostic, exactly as
  // numerically verified for Ahzab (whose block0/block4 nudges intentionally
  // do NOT shift this cosmetic frame span).
  const S2_MIRROR_SHIFT = 0.015;
  const framePad = gs.framePad ?? 0;
  const hasGridBlock = blocks.some((b) => b.type === 'grid');
  const nonGridMeta = blocks
    .map((b, i) => ({ b, meta: lm.blockMeta[i] }))
    .filter(({ b }) => b.type !== 'grid');
  const s2StackTop = hasGridBlock
    ? (nonGridMeta[0]?.meta.frameY ?? lm.contentStartY)
    : lm.contentStartY;
  const s2StackBottom = hasGridBlock
    ? (() => {
        const last = nonGridMeta[nonGridMeta.length - 1];
        return last ? last.meta.frameY - last.meta.frameH : lm.contentStartY - lm.totalContentH;
      })()
    : lm.contentStartY - lm.totalContentH;
  const s2StackH = s2StackTop - s2StackBottom;
  const shiftedTop = s2StackTop + framePad - S2_MIRROR_SHIFT;
  const shiftedBot = s2StackBottom - framePad + S2_MIRROR_SHIFT;
  const shiftedH   = s2StackH + framePad * 2 - 2 * S2_MIRROR_SHIFT;

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

  // Alak-only: intro/outro verse transforms, stashed here and injected onto
  // every non-grid section entry after the main loop (mirrors the legacy
  // engine's single unified verticalGroups SectionTransforms carrying both).
  let introVerseTransform: ElementTransform | undefined;
  let outroVerseTransform: ElementTransform | undefined;

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
        const anaGap = block.anaAyetGap ?? gridGap;
        const lastRowY = gridContentY - Math.max(0, numGridRows - 1) * (gridCapH + gridGap) - gridCapH;
        anaAyetTransform = {
          x: gridBaseX,
          y: lastRowY - anaGap + (block.anaAyetYOffset ?? 0),
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
        borderWidth: 0, // grid section frame currently renders no separate border stroke
        labelPinY: meta.frameY,
        verses: verseTransforms,
        rowConnectors: gridConnectors,
        ...(anaAyetFrame !== undefined ? {
          anaAyet: anaAyetFrame,
          capsuleLabelX: gridBaseX + gridInnerW / 2,
          capsuleLabelY: anaAyetFrame.y + (gs.capsuleLabelDrop ?? 0.015),
          capsuleLabelW: gs.capsuleLabelW ?? 0.2,
          capsuleLabelH: gs.capsuleLabelH ?? 0.032,
          capsuleLabelBorderWidth: gs.capsuleLabelBorderWidth ?? 0.0035,
          capsuleLabelDrop: gs.capsuleLabelDrop ?? 0.015,
        } : {}),
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

    // Alak-only: intro/outro verses render via BlockRenderer's dedicated
    // introVerse/outroVerse path (see below), not as a normal group — stash
    // the transform and emit an empty-groups entry so `allGroups` (and its
    // 1:1 index alignment with `surahData.section2.colorGroups`) stays
    // unaffected by these two extra blocks.
    if (block.introOutroRole) {
      // Unlike a regular columns:1 group verse, intro/outro span the FULL
      // section inner width directly (legacy never routes them through the
      // half-column + expandW-stretch convention).
      const t: ElementTransform = {
        ...verses[verseIds[0]],
        x: blockBaseX,
        w: blockInnerW,
      };
      if (block.introOutroRole === "intro") introVerseTransform = t;
      else outroVerseTransform = t;

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
        groups: [],
      });
      continue;
    }

    // Row connectors (only for 2-col blocks, or forced 1-col)
    const numRows = Math.ceil(verseIds.length / cols);
    const rowConnectors: RowConnectorTransform[] = [];
    const shouldDrawConnectors = (cols === 2 && !block.hideRowConnectors) || block.forceRowConnector;
    if (shouldDrawConnectors) {
      for (let r = 0; r < numRows; r++) {
        const lv = verses[verseIds[r * cols]];
        const rv = cols === 2 ? verses[verseIds[r * cols + 1]] : lv;
        if (lv && rv) {
          const padX = block.rowConnectorPadX ?? OPPOSITE_VERSE_CONNECTOR.paddingX;
          const padY = block.rowConnectorPadY ?? OPPOSITE_VERSE_CONNECTOR.paddingY;
          rowConnectors.push({
            x: lv.x - padX,
            y: lv.y + padY,
            z: 0.0025,
            w: rv.x + rv.w - lv.x + padX * 2,
            h: lv.h + padY * 2,
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

  // Alak-only: inject introVerse/outroVerse + decorative top/bottom connector
  // frames onto every non-grid ("section 2") entry, mirroring the legacy
  // engine's single unified SectionTransforms carrying all of these at once
  // (BlockRenderer.tsx finds whichever entry has them via `.find(...)`).
  if (config.features.hasIntro && (introVerseTransform || outroVerseTransform)) {
    const realGroups = blocks
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.type === 'group' && !b.introOutroRole);
    const firstGroup = realGroups[0];
    const lastGroup = realGroups[realGroups.length - 1];
    const boxExtOffset = gs.boxExtOffset ?? 0;

    let topConnectorY: number | undefined;
    let topConnectorH: number | undefined;
    let bottomConnectorY: number | undefined;
    let bottomConnectorH: number | undefined;
    if (firstGroup && lastGroup) {
      const g1Meta = lm.blockMeta[firstGroup.i];
      const g3Meta = lm.blockMeta[lastGroup.i];
      const outerSectionH = shiftedTop - (g1Meta.frameY - g1Meta.frameH - boxExtOffset);
      topConnectorY = shiftedTop;
      topConnectorH = outerSectionH;
      bottomConnectorY = g3Meta.frameY + boxExtOffset;
      bottomConnectorH = outerSectionH;
    }

    for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
      if (blocks[bIdx].type === 'grid') continue;
      Object.assign(sections[bIdx], {
        introVerse: introVerseTransform,
        outroVerse: outroVerseTransform,
        topConnectorY,
        topConnectorH,
        bottomConnectorY,
        bottomConnectorH,
      });
    }
  }

  return { mode: 'blocks', sections };
}

export const layoutMath = createBlockLayoutMath(ALAK_LAYOUT_CONFIG, BASE_PAGE_WIDTH);
export type LayoutConfig = ReturnType<typeof createBlockLayoutMath>;

// PAGE_WIDTH is Alak's static width, kept for the intro-only BismillahText3D
// (bismillah overlay only exists on Alak's intro — see `hasIntro`/`hasIntro`-
// gated consumers). Every other runtime consumer reads the per-surah,
// per-language value via `useSurahLayoutRuntime().PAGE_WIDTH` instead.
export const PAGE_WIDTH = layoutMath.PAGE_WIDTH;
export const PW = layoutMath.PW;
export const PADDING = layoutMath.PADDING;
export const CONTENT_W = layoutMath.CONTENT_W;
export const START_X = layoutMath.START_X;
