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
}

export interface LayoutDimensions {
  paperWidth: number;
  paperHeight: number;
  sceneCenterYOffset: number;
  padding: number;
  scrollPages: number;
}

export interface CurveColorConfig {
  color: string;
  fillColor: string;
  bowGap?: number;
  innerBowGap?: number;
  inwardOffset?: number;
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

  /** Optional uniform scale for Arabic verse text. */
  verseTextScale?: number;

  /** Optional uniform scale for translation verse text. null = inherit. */
  translationVerseTextScale?: number | null;

  /**
   * Controls how blocks are treated for drag/elevation:
   * - "perBlock" (default): Each block gets its own section ID and drag spring.
   * - "unified": All blocks share one section ID — drag moves everything together.
   */
  groupElevation?: "unified" | "perBlock";
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

  /** Label key to look up in the surah text labels (for `type: 'grid'` header). */
  labelKey?: string;

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
   * Override internal top/bottom padding for this block only.
   * Falls back to `globalSettings.blockPadding`.
   */
  blockPadding?: number;

  /**
   * Signed horizontal inset from the section edge (world units).
   * Positive = pushed in (narrower), Negative = pushed out (wider).
   * Replaces the boolean `isPushedIn` flag. Defaults to 0.
   */
  horizontalInset?: number;

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

  // ── LABELS ───────────────────────────────────────────────────────────────

  /** Optional top-label config rendered above this block. */
  topLabelConfig?: VerseBlockConfig['topLabelConfig'];

  /** When `true`, horizontal row-connector bars between paired capsules are hidden. */
  hideRowConnectors?: boolean;
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

export interface VerseBlockConfig {
  verseIds: number[];
  columns?: number;
  dragBehavior?: "group" | "pair" | "single" | "individual";
  disablePopUp?: boolean;
  isPill?: boolean;
  isSectionIntroOutro?: boolean;
  customFrameSvg?: string;
  capsuleLabel?: {
    x: number;
    y: number;
    w: number;
    h: number;
    borderWidth: number;
    labelDrop?: number;
  };
  isPushedIn?: boolean;
  isCenter?: boolean;
  extraRowGap?: number;
  bgThemeKey?: keyof ThemeColors;
  customScale?: number;
  xGap?: number;
  pushDown?: number;
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
  };
  backgroundTexture?: string;
  backgroundScaleX?: number;
  backgroundScaleY?: number;
  backgroundOffsetX?: number;
  backgroundOffsetY?: number;
}

export interface CameraTargetConfig {
  y: number;
  fov: number;
  tilt: number;
}

/** @deprecated Use `LayoutBlock` with `type: 'grid'` instead. */
export interface GridSectionConfig {
  id: string;
  type: "gridWithAnaAyet";
  labelKey?: string;
  verses: number[];
  anaAyet: number;
  bgThemeKey?: keyof ThemeColors;
  cameraTarget?: CameraTargetConfig;
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

/** @deprecated Use a flat `blocks: LayoutBlock[]` array instead. */
export interface VerticalGroupsSectionConfig {
  id: string;
  type: "verticalGroups";
  topLabelKey?: string;
  bottomLabelKey?: string;
  introVerse?: number;
  outroVerse?: number;
  introOutroBgThemeKey?: keyof ThemeColors;
  groups: VerseBlockConfig[];
  /**
   * Controls how groups are treated for drag/elevation:
   * - "perGroup" (default): Each group gets its own section ID and drag spring (Alak).
   * - "unified": All groups share one section ID — drag moves everything together (AyatAlKursi).
   */
  groupElevation?: "unified" | "perGroup";
  /**
   * When provided, overrides the default group-based section mapping.
   * Each custom section defines its own ID and verse list, allowing
   * column-based or cross-group sections (e.g. Ahzab 35 left/right columns).
   * Takes precedence over both "perGroup" and "unified" groupElevation.
   */
  customSections?: CustomSectionDef[];
  cameraTarget?: CameraTargetConfig;
  subCameraTargets?: {
    top?: CameraTargetConfig;
    center?: CameraTargetConfig;
    bottom?: CameraTargetConfig;
  };
  backgroundTexture?: string;
  backgroundScaleX?: number;
  backgroundScaleY?: number;
  backgroundOffsetX?: number;
  backgroundOffsetY?: number;
  backgroundSolidScaleX?: number;
  backgroundSolidScaleY?: number;
  /** When true, the horizontal row-connector bars between paired capsules are hidden. */
  hideRowConnectors?: boolean;
  svgOverlays?: SvgOverlayItem[];
}

/** @deprecated Use `LayoutBlock` union type instead. */
export type SectionConfig = GridSectionConfig | VerticalGroupsSectionConfig;

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
}

export interface SurahAssets {
  metallicVerseBorderSvg?: string;
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

export interface SurahLayoutConfig<TParams = any> {
  id: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  features: SurahFeatures;
  dimensions: LayoutDimensions;
  styling: LayoutStyling;
  specialVerses: SpecialVerses;
  assets?: SurahAssets;
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

  // ── DEPRECATED LEGACY SCHEMA (kept for backward compat during migration) ──
  /**
   * @deprecated Use `globalSettings: SurahGlobalSettings` instead.
   * Will be removed after Step 3 migration.
   */
  params?: TParams;

  /**
   * @deprecated Use `blocks: LayoutBlock[]` instead.
   * Will be removed after Step 3 migration.
   */
  sections?: SectionConfig[];

  animations: SurahAnimations;
  introMedia?: Record<string, IntroMediaItem>;
  introGuides?: Record<string, string>;
  /** Optional per-surah SVG overlay planes rendered on top of the section */
  svgOverlays?: SvgOverlayItem[];
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
