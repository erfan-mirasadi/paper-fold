export interface Verse {
  number: number;
  text: string;
}

export interface SurahTextData {
  bismillah?: string;
  labels: Record<string, string>;
  verses: Record<number, Verse>;
}

export interface SurahFeatures {
  hasIntro: boolean;
  hasElevatedSections: boolean;
  hasPopUps: boolean;
  hideVerseNumbers?: boolean;
  /**
   * When true, the floating 3D bismillah text overlay is NOT rendered on the
   * paper surface for this surah. Use for surahs (e.g. Fatiha) where the
   * bismillah is already part of the verse content and the 3D overlay would
   * duplicate it.
   */
  hideBismillah3D?: boolean;
}

export interface LayoutDimensions {
  paperWidth: number;
  paperHeight: number;
  sceneCenterYOffset: number;
  padding: number;
  scrollPages: number;
  /**
   * When true, the paper does NOT widen for English/Turkish translations
   * (which normally need extra horizontal room for longer text). Set this
   * for surahs whose layout is already wide enough or tuned per-language
   * separately. Defaults to false (paper widens as usual).
   */
  fixedWidthAcrossLanguages?: boolean;
}

export interface CurveColorConfig {
  color: string;
  fillColor: string;
  bowGap?: number;
  innerBowGap?: number;
  inwardOffset?: number;
  lineWidth?: number;
  /** Whether the curves should be symmetrical (default) or both bow to the 'left' or 'right'. */
  curveSide?: "symmetrical" | "left" | "right";
  /** If true, draws additional curves on the inner edges of the columns (in the center gap). */
  drawInnerCurves?: boolean;
  innerCurvesBowGap?: number;
  innerCurvesInnerBowGap?: number;
  tipThickness?: number;
  topAnchorXOffset?: number;
  bottomAnchorXOffset?: number;
  topAnchorYOffset?: number;
  bottomAnchorYOffset?: number;
  /**
   * Render style for this bracket. Defaults to "bracket" (the standard
   * filled two-line capsule). "arrow" caps the ribbon's tail end in a
   * flared arrowhead pointing into the target verse instead of the usual
   * flat/rounded tip — see SideCurves.tsx's `computeArrowHeadPoints`.
   */
  shape?: "bracket" | "arrow";
  /** Arrow-only: how far (world units) the tip pokes past the ribbon's natural end. */
  arrowHeadLength?: number;
  /** Arrow-only: how far (world units) the flare's back corners spread perpendicular to the ribbon. */
  arrowHeadWidth?: number;
  /**
   * Arrow-only: renders the body as a folded ribbon — full-width at both
   * capsules, pinching to a single point at the arc's far extremity where
   * the edges cross over, with the segment before the fold auto-darkened
   * so the ribbon reads as flipping from its back face to its front face.
   */
  twist?: boolean;
  /** Arrow-only: where along the arc (0-1) the fold pinch sits. Defaults to 0.5 (the arc's extremity). */
  twistT?: number;
}

export interface ThemeColors {
  paperBase: string;
  shadow: string;
  backface: string;
  textDark: string;
  textLabel: string;
  circleBorder: string;
  verseNumberText: string;
  s1AnaLabelBg: string;
  s1AnaLabelText: string;
  s1AnaLabelBorder: string;
  s2FrameBg: string;
  boarderFrame: string;
  boarderHalo: string;
  innerCard: string;
  sectionBgTexture: string;
  hollowConnectorInnerBg: string;
  maroonTheme: string;
  greenTheme: string;
  s1InnerBorder: string;
  s2IntroOutroBg: string;
  s2Group1Bg: string;
  s2Group2Bg: string;
  s2Group3Bg: string;
  /**
   * Color sequence for the side brackets in SideCurves, outermost → innermost.
   * Each entry is { color, fillColor } for the bracket line and its fill mesh.
   * The last entry is always the center (inner) bracket.
   * Provide one entry per bracket (outer brackets first, center last).
   */
  curveColors?: CurveColorConfig[];
  curveLineWidth?: number;

  /**
   * Optional background colors for vertical sections (like Ayat Al Kursi).
   * Usually an array mapping to groups: e.g. [topColor, middleColor, bottomColor].
   */
  sectionBackgrounds?: string[];
}

// ----------------------------------------------------------------------------
// BLOCK-BASED LAYOUT SCHEMA (NEW — replaces GridSectionConfig / VerticalGroupsSectionConfig)
// ----------------------------------------------------------------------------

/**
 * Minimal global settings that drive the layout engine's auto-centering math.
 * Replaces the sprawling `AlakLayoutParams` object (~30 fields).
 */
export interface SurahGlobalSettings {
  /** Height of a single capsule row in world units. (was `smallBoxH2`) */
  capsuleHeight: number;

  /** Horizontal gap between the two columns inside a 2-col group. (was `s2Gap`) */
  columnGap: number;

  /** Vertical gap between rows within a single group. (was `s2VerticalRowGap` or `s2Gap`) */
  rowGap: number;

  /** Vertical gap between adjacent blocks. (was `groupGap`) */
  blockGap: number;

  /** Horizontal padding from the section edge to the outer group frame. (was `s2PadLeftRight`) */
  sectionPadX: number;

  /** Top/bottom internal padding inside each block frame. (was `groupPad` / `groupPadBottom`) */
  blockPadding: number;

  /** Border width of the outer section connector/frame. (was `sgBorderWidth`) */
  sectionBorderWidth: number;

  /**
   * Horizontal padding of the outer section connector/frame, independent of
   * `sectionPadX` (which pads the group content). Falls back to
   * `sectionPadX * 0.5` when omitted. (was the always-0.03 `sgPad`)
   */
  connectorPad?: number;

  /**
   * Vertical padding added around the whole block stack's decorative outer
   * frame (`shiftedTop`/`shiftedBot`/`shiftedH`), beyond the content itself.
   * Defaults to 0 (frame hugs the content tightly). (was `s2VerticalPad`)
   */
  framePad?: number;

  /** Optional uniform scale for Arabic verse text. */
  verseTextScale?: number;

  /** Optional uniform scale for translation verse text. null = inherit. */
  translationVerseTextScale?: number | null;

  /**
   * Sizing for the small pill-shaped label rendered above/below a verse when
   * `verseOverrides[id].hasCapsuleLabel` is set (e.g. Ahzab's "İman"/"Zekat"
   * tags). Falls back to generic defaults (0.2/0.032/0.0035/0.015) when omitted.
   */
  capsuleLabelW?: number;
  capsuleLabelH?: number;
  capsuleLabelBorderWidth?: number;
  capsuleLabelDrop?: number;

  /**
   * How far the decorative top/bottom connector frames (rendered only when
   * `features.hasIntro` is true) extend beyond the first/last vertical
   * group. Defaults to 0. (was `boxExtOffset`, Alak-only)
   */
  boxExtOffset?: number;

  /**
   * Bypasses the auto-centering pass and pins the content stack's top edge
   * to this exact Y value instead (was Alak's hand-tuned fixed `s1Top`).
   * Defaults to undefined (auto-center on the paper, the standard for every
   * other surah).
   */
  contentStartYOverride?: number;

  /**
   * When true, drastically reduces the internal padding inside capsules
   * (especially non-pill capsules) by pushing the verse number closer to the
   * edge and expanding the text's maximum width constraint.
   */
  tightVersePadding?: boolean;
}

/**
 * The single unified primitive for ALL layout content — replaces both
 * `GridSectionConfig` (Alak Section 1) and `VerseBlockConfig` (Section 2 groups).
 *
 * A flat `blocks: LayoutBlock[]` array on `SurahLayoutConfig` is the
 * sole source of truth for the layout hierarchy.
 */
export interface LayoutBlock {
  /** Unique ID used for camera targets, drag sections, elevation, etc. */
  id: string;

  /**
   * Layout mode for this block:
   * - `'group'`   → A box of verse capsules in a 1- or 2-column grid (was VerseBlockConfig).
   * - `'grid'`    → Alak-style 2-column grid with a full-width AnaAyet verse below.
   * - `'spacer'`  → Invisible gap of `fixedHeight` (for intro/outro verse slots).
   */
  type: 'group' | 'grid' | 'spacer';

  // ── CONTENT ──────────────────────────────────────────────────────────────

  /** Verse IDs to render in this block (in display order). */
  verseIds?: number[];

  /**
   * For `type: 'grid'` only — the single full-width AnaAyet verse ID.
   * Rendered below the 2-column grid rows.
   */
  anaAyetId?: number;

  /**
   * For `type: 'grid'` only — gap between the last grid row and the AnaAyet
   * row, used for both height reservation and position. Falls back to the
   * block's own `rowGap`. (was `s1AnaGap`)
   */
  anaAyetGap?: number;

  /**
   * For `type: 'grid'` only — small cosmetic Y fine-tune applied ONLY to the
   * AnaAyet's final position (not reflected in height reservation).
   * Defaults to 0.
   */
  anaAyetYOffset?: number;

  /** Label key to look up in the surah text labels (for `type: 'grid'` header). */
  labelKey?: string;

  /**
   * Surah-wide elevated top/bottom title labels (Alak-only: "Beş ayetlik 1./2.
   * Açıklama Böl."), looked up in the same text-label table as `labelKey`.
   * Declared on any one block; the label anchors to the first/last "real"
   * group block regardless of which block declares it.
   */
  topLabelKey?: string;
  bottomLabelKey?: string;

  // ── LAYOUT ───────────────────────────────────────────────────────────────

  /** Number of columns inside this block. Defaults to 2. Use 1 for full-width. */
  columns?: number;

  /**
   * Override capsule height for this block only.
   * Falls back to `globalSettings.capsuleHeight`.
   */
  capsuleHeight?: number;

  /**
   * Override row gap for this block only.
   * Falls back to `globalSettings.rowGap`.
   */
  rowGap?: number;

  /**
   * Additional row gap applied ONLY to the within-block row offset (between
   * capsule rows), NOT to the block's overall frame height. Mirrors the
   * legacy `extraRowGap` field exactly — a deliberate decoupling where extra
   * spacing nudges later rows down without expanding the frame to match.
   */
  extraRowGap?: number;

  /**
   * Override the gap between this block and the PREVIOUS block only.
   * Falls back to `globalSettings.blockGap`. Use for a one-off larger gap
   * (e.g. Alak's Section 1 → Section 2 gap, distinct from the uniform gap
   * between the vertical groups themselves).
   */
  gapBefore?: number;

  /**
   * Marks this block as the special full-width "intro" or "outro" verse
   * (Alak-only: verse 6 / verse 19) rendered via BlockRenderer's dedicated
   * intro/outro path (non-pill, section borderWidth) instead of the regular
   * per-block group rendering. Such a block still occupies layout height
   * and participates in Y-positioning like any other block, but emits no
   * `groups[]` entry of its own — assign it to a neighboring group's
   * elevation zone via a top-level `customSections` entry.
   */
  introOutroRole?: "intro" | "outro";

  /**
   * Override the horizontal gap between the two columns for this block only.
   * Falls back to `globalSettings.columnGap`. (was per-group `xGap`)
   */
  columnGap?: number;

  /**
   * Override internal top/bottom padding for this block only.
   * Falls back to `globalSettings.blockPadding`.
   */
  blockPadding?: number;

  /**
   * Explicit row count for this block, overriding the value inferred from
   * `ceil(verseIds.length / columns)`. Use when a block needs reserved
   * vertical space beyond what its verses alone would occupy. (was `groupRows[i]`)
   */
  rows?: number;

  /**
   * Manual vertical nudge (world units) applied to this block's frameY
   * after the auto-centering pass. Positive moves down, negative moves up.
   * Cascades to all subsequent blocks, same as the legacy `pushDown` field.
   */
  verticalNudge?: number;

  /**
   * Signed horizontal inset from the section edge (world units).
   * Positive = pushed in (narrower), Negative = pushed out (wider).
   * Defaults to 0.
   */
  horizontalInset?: number;

  /**
   * Manual horizontal shift (world units) applied to this block's frameX on
   * top of `horizontalInset`, additive, defaults to 0. Lets a block sit off
   * the page's horizontal center — e.g. two blocks with a symmetric
   * `horizontalInset` (both narrowed to half-width) and opposite `xOffset`
   * values render as side-by-side panels instead of one centered stack.
   */
  xOffset?: number;

  /**
   * Explicit override for the "is this the pushed-in/center group" flag used
   * by SideCurves to pick the innermost bracket (`isCenter && isPushedIn`).
   * Defaults to `horizontalInset > 0` when omitted — only needed when a
   * block has a positive `horizontalInset` (e.g. a decorative scale offset)
   * without being the semantic "center" group.
   */
  isPushedIn?: boolean;

  /**
   * Per-block override for the "center" bracket color/shape drawn by
   * SideCurves when this block is flagged `isCenter && isPushedIn`. Falls
   * back to the shared `styling.colors.curveColors` last entry when omitted
   * (the original single-centerGroup behavior). Multiple blocks may each set
   * `isCenter: true` + their own `curveOverride` to get independent
   * "hug this one block" bracket curves in the same section (e.g. two
   * separate middle-section boxes each with their own color).
   */
  curveOverride?: CurveColorConfig;

  /**
   * Fixed height in world units for `type: 'spacer'` or
   * for the AnaAyet row in `type: 'grid'`.
   */
  fixedHeight?: number;

  // ── APPEARANCE ───────────────────────────────────────────────────────────

  /**
   * References a key in `ThemeColors` for the block's background fill.
   * Decouples color from positioning.
   */
  bgThemeKey?: keyof ThemeColors;

  /**
   * When `true`, this block is the "center" block — affects SideCurves
   * bracket nesting assignment.
   */
  isCenter?: boolean;

  // ── INTERACTION ──────────────────────────────────────────────────────────

  /** Drag/click interaction mode for verses in this block. */
  dragBehavior?: 'group' | 'pair' | 'single' | 'individual';

  /** When `true`, the popup interaction is disabled for all verses in this block. */
  disablePopUp?: boolean;

  /**
   * When provided, all verses in this block belong to this drag/elevation section
   * instead of the default per-block assignment. Enables cross-block column sections
   * (e.g., Ahzab 35 left/right column sections).
   */
  customSectionId?: string;

  /** Camera target when this block (or its custom section) is focused. */
  cameraTarget?: CameraTargetConfig;

  // ── BACKGROUND TEXTURE ───────────────────────────────────────────────────

  backgroundTexture?: string;
  backgroundScaleX?: number;
  backgroundScaleY?: number;
  backgroundOffsetX?: number;
  backgroundOffsetY?: number;
  /** Scale of the solid color quad rendered behind the background texture. */
  backgroundSolidScaleX?: number;
  /** Scale of the solid color quad rendered behind the background texture. */
  backgroundSolidScaleY?: number;

  // ── LABELS ───────────────────────────────────────────────────────────────

  /** Optional top-label config rendered above this block. */
  topLabelConfig?: {
    width?: number;
    height?: number;
    yOffset?: number;
    textOffsetY?: number;
    textScaleOverride?: number;
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    xMultiplier?: number;
    isSimpleText?: boolean;
    shadow?: boolean;
    noBorder?: boolean;
  };

  /** When `true`, horizontal row-connector bars between paired capsules are hidden. */
  hideRowConnectors?: boolean;

  /** When `true`, forces a row connector background even if the block has 1 column. */
  forceRowConnector?: boolean;

  /**
   * Limits the row connector span to this many columns from the LEFT, instead
   * of spanning the full row width. Use when the rightmost column(s) should
   * NOT be bridged by the connector.
   * Example: in a 3-column block [4,3,2] with `rowConnectorCols: 2`, the
   * connector spans only between col-0 (verse 4) and col-1 (verse 3), leaving
   * the orange verse 2 unconnected.
   */
  rowConnectorCols?: number;

  /** Custom padding overrides for the row connector, allowing it to be larger or smaller. */
  rowConnectorPadX?: number;
  rowConnectorPadY?: number;
}

export interface LayoutStyling {
  colors: ThemeColors;
  capsuleBorderWidth: number;
  circleBorderWidth: number;
  verseRadius: number;
  oppositeVerseConnectorRadius: number;
  s1NeonConfig?: any;
  elevatedSectionRadii: {
    base: number;

    outer: number;
    innerA: number;
    innerB: number;
  };
}

export interface CameraTargetConfig {
  y: number;
  fov: number;
  tilt: number;
}

/**
 * Defines a custom section for drag/click/elevation that can span verses
 * from multiple blocks. Used by Ahzab 35 (left/right column sections) and
 * also referenced by `LayoutBlock.customSectionId`.
 */
export interface CustomSectionDef {
  /** Unique section ID (e.g. "section2_right") */
  id: string;
  /** Verse IDs that belong to this section */
  verseIds: number[];
  /** Optional specific camera target for this custom section */
  cameraTarget?: CameraTargetConfig;
}

export interface SpecialVerses {
  middleFoldVerses?: { left: number[]; right: number[] };
  versePairings?: Record<number, number>;
}

export interface VerseOverrideConfig {
  customFrameSvg?: string;
  expandW?: number;
  expandH?: number;
  /** Custom scale for the SVG frame when rendering in left-to-right languages */
  frameScaleLTR?: number;
  /** When false, the verse renders as a rounded rectangle instead of a pill */
  isPill?: boolean;
  /** Direct hex color for the verse box background (also used by paper masking) */
  bg?: string;
  /** Direct hex color for the verse border / circle decorations */
  border?: string;
  /** Explicit hex color for the verse number circle border */
  circleBorderCol?: string;
  /** Explicit hex color for the verse number circle background */
  circleBg?: string;
  /** Explicit hex color for the verse number text */
  circleTextCol?: string;
  /** Explicit hex color for the Arabic and Latin verse text */
  textColor?: string;
  /** When true, a CapsuleLabel is rendered above this verse in section and mesh views */
  hasCapsuleLabel?: boolean;
  /** Optional custom text to display in the CapsuleLabel instead of the default 'Ana Ayet' */
  customCapsuleLabel?: string | Record<string, string>;
  /** Position of the CapsuleLabel: 'top' (default) or 'bottom' */
  capsuleLabelPosition?: "top" | "bottom";
  /** Override the verse text scale for this specific verse. */
  textScaleOverride?: number;
  /** Override the verse text scale for translations (English, Turkish, etc.) */
  translationTextScaleOverride?: number;
  /** Override the translation text alignment */
  translationTextAlign?: "left" | "center" | "right";
  /**
   * Additional horizontal offset (in world units) applied to this verse's X
   * position after the layout engine places it.
   * Positive → moves right, Negative → moves left.
   * Useful for pushing a short right-side verse further toward the paper edge
   * so both sides appear visually balanced.
   */
  xOffset?: number;
  /**
   * Forces this verse's number badge to render even when
   * `features.hideVerseNumbers` is globally true. Use for a page where all
   * verses are sub-clauses of one ayah and only the LAST one should carry
   * the ayah-ending number.
   */
  showNumber?: boolean;
  /**
   * Overrides the text shown inside the number badge, independent of this
   * verse's own id (which stays the lookup key everywhere else — overrides,
   * blocks, pairings, camera targets). E.g. verseId 12 displaying "36".
   */
  displayNumber?: number | string;
  /**
   * Arabic-specific badge number override for RTL layouts. When the active
   * language is 'ar', this takes precedence over `displayNumber` so each
   * verse can show reading-order numbers that differ between LTR and RTL
   * directions. E.g. verse 3 at the RIGHT column in an RTL grid displays "1"
   * (first in Arabic reading) while the same spatial slot shows "2" in LTR.
   */
  arDisplayNumber?: number | string;
}

export interface SurahAssets {
  metallicVerseBorderSvg?: string;
}

/**
 * Mushaf metadata shown in the left ayah-list sidebar (MushafSidebarOverlay):
 * the surah title line and the "SAYFA / JUZ / HIZB" info row beneath it.
 */
export interface MushafInfo {
  /** Sidebar title, e.g. "96 Al-'Alaq" (surah number + transliterated name). */
  title: string;
  /** Mushaf page number (Medina mushaf, 604-page layout). */
  sayfa: number;
  /** Juz (1-30) containing this page's content. */
  juz: number;
  /** Hizb (1-60) containing this page's content. */
  hizb: number;
  /**
   * When set, every verse chunk on this page is a fragment of this ONE real
   * ayah (e.g. Nisa 36, Ayat al-Kursi 255, Ahzab 35). The sidebar then joins
   * all chunks into a single flowing text ending in this one ayah number.
   * When omitted, each verse keeps its own trailing number (full surahs).
   */
  singleAyahNumber?: number;
}

/**
 * Section-wide background texture, independent of any single block's own
 * frame. Renders behind the whole block stack (the outer resting-state
 * frame), as opposed to `LayoutBlock.backgroundTexture` which renders a
 * decorative frame scoped to just that one block's own bounds.
 */
export interface SectionBackgroundConfig {
  texture: string;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
  solidScaleX?: number;
  solidScaleY?: number;
}

// ---------------------------------------------------------------------------
// SVG OVERLAY CONFIG — per-surah decorative SVG planes
// ---------------------------------------------------------------------------

export interface SvgOverlayItem {
  /** Path to the SVG asset (relative to /public) */
  src: string;
  /** Which group index to anchor this overlay on (0-based). When not provided, anchors to the whole section center. */
  anchorGroupIndex?: number;
  /** Which edge of the anchor group to align to: 'top' | 'bottom' | 'center' */
  anchorEdge?: "top" | "bottom" | "center";
  /** Scale in X direction (world units per unit plane). Negative = flip horizontal. */
  scaleX?: number;
  /** Scale in Y direction (world units per unit plane). Negative = flip vertical. */
  scaleY?: number;
  /** Additional X offset in world units, applied after anchoring */
  offsetX?: number;
  /** Additional Y offset in world units, applied after anchoring */
  offsetY?: number;
  /** Z rotation in radians */
  rotationZ?: number;
  /** Three.js renderOrder (higher = on top). Default 3. */
  renderOrder?: number;
  /**
   * When set, this overlay is wrapped in a DraggableSectionGroup and
   * moves with the specified custom section ID when dragged/elevated.
   * When null or omitted, the overlay is static (glued to the background frame).
   */
  customSectionId?: string | null;
}

// ---------------------------------------------------------------------------
// HANDWRITTEN NOTE CONFIG — per-surah "handwritten margin note" overlay,
// rendered as a canvas-texture (same technique as Arabic/Latin verse text)
// using a cursive/script font instead of native WebGL text.
// ---------------------------------------------------------------------------

export interface HandwrittenNoteSegment {
  /** This segment's text, concatenated directly after the previous segment (no auto-spacing — include spaces yourself). */
  text: string;
  /** Color for just this segment. Falls back to the line's/note's color when omitted. */
  color?: string;
}

export interface HandwrittenNoteLine {
  /**
   * The line's text content. Ignored when `segments` is set — use one or
   * the other, not both.
   */
  text?: string;
  /**
   * Split this line into differently-colored segments (e.g. to highlight a
   * single word). Segments are concatenated in order with no added spacing,
   * so include spaces in the segment text where needed. When set, `text` is
   * ignored.
   */
  segments?: HandwrittenNoteSegment[];
  /** Per-line color override. Falls back to the note's overall `color`. */
  color?: string;
  /** Per-line font-size multiplier over the note's base `fontSize`. Defaults to 1. */
  scale?: number;
  /**
   * Per-line extra Z rotation in radians, layered on top of the note's overall
   * `rotationZ`. When omitted, a small deterministic per-line wobble is
   * applied automatically so the lines don't look machine-straight.
   */
  rotation?: number;
  /** Per-line X offset in world units, applied after the note's layout. Defaults to 0. */
  offsetX?: number;
  /** Per-line Y offset in world units, applied after the note's layout. Defaults to 0. */
  offsetY?: number;
}

export interface HandwrittenNoteSvg {
  /** Path to the SVG/image asset (relative to /public). */
  src: string;
  /**
   * Where to anchor this icon relative to the note: "start" (just above the
   * first line) or "end" (just below the last line). Defaults to "end".
   */
  anchor?: "start" | "end";
  /** X offset in world units, relative to the anchor point. Defaults to 0. */
  offsetX?: number;
  /** Y offset in world units, relative to the anchor point. Defaults to a small gap outside the note. */
  offsetY?: number;
  /** Scale in X (world units). Defaults to 0.3. */
  scaleX?: number;
  /** Scale in Y (world units). Defaults to 0.3. */
  scaleY?: number;
  /** Extra Z rotation in radians, layered on top of the note's overall rotation. */
  rotationZ?: number;
}

export interface HandwrittenNoteConfig {
  /** Lines of handwritten text, top to bottom. */
  lines: HandwrittenNoteLine[];
  /** World-space X of the note's anchor (left edge of the text block). */
  x: number;
  /** World-space Y of the note's anchor (top edge of the text block). */
  y: number;
  /** Base font size (world units) for lines that don't set their own `scale`. */
  fontSize: number;
  /** Ink color. Defaults to a dark charcoal tone. */
  color?: string;
  /** Vertical gap between lines, as a multiplier of `fontSize`. Defaults to 1.4. */
  lineSpacing?: number;
  /** Max width per line before wrapping (world units). Defaults to `fontSize * 12`. */
  maxWidth?: number;
  /** Horizontal alignment of each line. Defaults to "left". */
  textAlign?: "left" | "center" | "right";
  /** Overall rotation (radians) of the whole note, for the natural "tilted on paper" look. Defaults to 0. */
  rotationZ?: number;
  /** Ink opacity, letting the paper texture show through slightly. Defaults to 0.94. */
  opacity?: number;
  /** Three.js renderOrder. Defaults to 20 (above verse text). */
  renderOrder?: number;
  /** Optional decorative icons anchored to this note's start/end (e.g. an arrow pointing at a verse). */
  svgs?: HandwrittenNoteSvg[];
}

export interface FoldState {
  direction: -1 | 0 | 1;
  angleFactor: number;
}

export interface FoldStoryStep {
  id: string;
  folds: FoldState[];
}

export interface ScrollTimelineConfig {
  intro: { start: number; end: number };
  ambient: { start: number; end: number };
  handoff: { start: number; end: number };
  story: { start: number; end: number };
}

export interface ScrollLockConfig {
  lockPositionPercentage: number;
  effortRequired: number;
  grabRangePixels: number;
}

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
  backgroundText?: {
    caption?: string;
    title?: string;
    subtitle?: string;
    body?: string;
    titleSize?: string;
    arabicHollowText?: string;
    isZoomed?: boolean;
    groupId?: string;
  };
}

export interface IntroCameraConfig {
  introPosition: [number, number, number];
  introTarget: [number, number, number];
  scrollOffset: [number, number, number];
  targetFollow: number;
  allowOrbit: boolean;
  handoffDurationMs: number;
}

export interface SurahAnimations {
  foldSteps: readonly FoldStoryStep[];
  computeFoldYPositions: (layoutMath: any) => readonly number[];
  scrollTimeline?: ScrollTimelineConfig;
  scrollLock?: ScrollLockConfig;
  ambientMediaKeys?: string[];
  introCamera?: IntroCameraConfig;
}

export interface SurahLayoutConfig {
  id: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  features: SurahFeatures;
  dimensions: LayoutDimensions;
  styling: LayoutStyling;
  specialVerses: SpecialVerses;
  assets?: SurahAssets;
  /** Mushaf page metadata for the ayah-list sidebar (title + sayfa/juz/hizb). */
  mushafInfo?: MushafInfo;
  verseOverrides?: Record<number, VerseOverrideConfig>;

  // ── NEW BLOCK-BASED SCHEMA ────────────────────────────────────────────────
  /**
   * Minimal global sizing settings consumed by the new block-based layout engine.
   * Replaces the sprawling `params: AlakLayoutParams` object.
   */
  globalSettings?: SurahGlobalSettings;

  /**
   * Flat ordered list of layout blocks — the single source of truth for the
   * entire layout hierarchy. Replaces the nested `sections[].groups[]` tree.
   * The engine iterates this array top-to-bottom, calculates total height,
   * then auto-centers the content on the page.
   */
  blocks?: LayoutBlock[];

  /**
   * Cross-block custom sections (e.g. Ahzab left/right column drag zones).
   * Each entry overrides the per-block section mapping for its `verseIds`.
   */
  customSections?: CustomSectionDef[];

  animations: SurahAnimations;
  introMedia?: Record<string, IntroMediaItem>;
  introGuides?: Record<string, string>;
  /** Optional per-surah SVG overlay planes rendered on top of the section */
  svgOverlays?: SvgOverlayItem[];
  /** Optional per-surah handwritten margin notes, rendered in a cursive canvas-texture font. */
  handwrittenNotes?: HandwrittenNoteConfig[];

  /**
   * Section-wide resting-state background, independent of any block's own
   * frame. When omitted, the engine falls back to the first block that
   * declares `backgroundTexture` (back-compat for Ihlas/Kafirun-style configs
   * where a single block's frame doubles as the whole section's background).
   */
  sectionBackground?: SectionBackgroundConfig;
}

// ----------------------------------------------------------------------------
// LAYOUT ENGINE TYPES
// ----------------------------------------------------------------------------

export interface ElementTransform {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

export interface BracketSpec {
  outerYTop: number;
  outerYBot: number;
  innerYTop: number;
  innerYBot: number;
  nestLevel: number;
  isCenter: boolean;
  color: string;
  fillColor: string;
  scaleTop?: number;
  scaleBot?: number;
}

export interface RowConnectorTransform {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

export interface GroupTransforms {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  isPushedIn: boolean;
  isCenter: boolean;
  /** Per-group center-bracket color override — see `LayoutBlock.curveOverride`. */
  curveOverride?: CurveColorConfig;
  verses: Record<number, ElementTransform>;
  rowConnectors: RowConnectorTransform[];
  topLabelConfig?: {
    width?: number;
    height?: number;
    yOffset?: number;
    textOffsetY?: number;
    textScaleOverride?: number;
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    xMultiplier?: number;
    isSimpleText?: boolean;
    shadow?: boolean;
    noBorder?: boolean;
  };
  backgroundTexture?: string;
  backgroundScaleX?: number;
  backgroundScaleY?: number;
  backgroundOffsetX?: number;
  backgroundOffsetY?: number;
}

export interface SectionTransforms {
  frameX: number;
  frameY?: number;
  frameW: number;
  frameH?: number;
  shiftedTop?: number;
  shiftedBot?: number;
  shiftedH?: number;
  connectorX?: number;
  connectorW?: number;
  topConnectorY?: number;
  topConnectorH?: number;
  bottomConnectorY?: number;
  bottomConnectorH?: number;
  borderWidth: number;
  verses?: Record<number, ElementTransform>;
  rowConnectors?: RowConnectorTransform[];
  anaAyet?: ElementTransform;
  capsuleLabelX?: number;
  capsuleLabelY?: number;
  capsuleLabelW?: number;
  capsuleLabelH?: number;
  capsuleLabelBorderWidth?: number;
  capsuleLabelDrop?: number;
  labelPinY?: number;
  introVerse?: ElementTransform;
  outroVerse?: ElementTransform;
  groups?: GroupTransforms[];
  innerW?: number;
  baseX?: number;
  topLabelPinY?: number;
  bottomLabelPinY?: number;
  brackets?: BracketSpec[];
}
