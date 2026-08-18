import type { RecitationTranscript } from "./recitations/types";
// Type-only — erased at build time, so this carries no runtime dependency on
// the (client-side, zustand-backed) language store.
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

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
  /**
   * Draw the page's texture in stages instead of all at once — see
   * `PageTextureLod`. For a paper that carries MANY SHEETS: one buffer big
   * enough for all of them at reading resolution is the slowest thing on the
   * page and the thing a weak GPU refuses, so such a page arrives at a low
   * resolution on every device, sharpens to its resting one a frame at a time
   * once it is on screen, and draws a screen-sized picture of whatever a
   * section zoom is about to frame.
   *
   * Off (and untouched) for a single-sheet surah, which fits in one buffer at
   * full quality and has nothing to gain from the machinery.
   */
  progressivePageTexture?: boolean;
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
  /**
   * Pulls the camera back by this factor, for a page too big to be framed by
   * the app's fixed camera (see `cameraConfig`, which is otherwise page-size
   * agnostic — every surah sheet is the same 1.54-wide page). Roughly
   * `paperWidth / 1.54` frames a big paper the way a single sheet is framed;
   * a smaller number lets it fill more of the screen. Defaults to 1, i.e. the
   * camera every existing surah uses, untouched.
   */
  cameraDistanceScale?: number;
}

export interface CurveColorConfig {
  color: string;
  fillColor: string;
  bowGap?: number;
  innerBowGap?: number;
  inwardOffset?: number;
  /**
   * Outline thickness in PIXELS (drei's `Line` is screen-space by default), so
   * a bracket's rule gets thinner relative to the page the further you zoom in.
   * That is the historical behaviour and every page that does not say otherwise
   * still gets it.
   */
  lineWidth?: number;
  /**
   * Outline thickness in WORLD units — takes precedence over `lineWidth` and
   * switches the line material to `worldUnits`. Set it to the page's
   * `styling.capsuleBorderWidth` and a bracket's rule is drawn exactly as thick
   * as a capsule's rule, at every zoom, which is the only way the two actually
   * match: a capsule's border is world-space geometry, not a screen-space line.
   */
  lineWidthWorld?: number;
  /**
   * Overall opacity of the curve fill (and its outline lines), from 0 (fully
   * transparent) to 1 (fully opaque). Defaults to 1 when omitted.
   * Use e.g. 0.5 to let content behind the bracket show through.
   */
  opacity?: number;
  /** Whether the curves should be symmetrical (default) or both bow to the 'left' or 'right'. */
  curveSide?: "symmetrical" | "left" | "right";
  /**
   * The two BLOCKS this bracket joins, as indices into `blocks`. Omit it and
   * the default pairing stands: the i-th entry of `curveColors` brackets the
   * i-th block from the TOP of the page to the i-th from the BOTTOM, which is
   * right for a page that is one chiasm end to end.
   *
   * Name it when the chiasm is only PART of the page — Yâsîn 1-12's rings hold
   * ayahs 6 … 11 inside an opening and a closing that sit outside them, so its
   * pairs are (6,11), (7,10), (8,9) and none of the three is the i-th from each
   * end. An entry that names a pair is drawn even past the
   * `floor(blocks / 2)` limit that caps the default pairing.
   */
  pair?: [number, number];
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
   * Per-language TRIM on the verse text, applied on top of whatever size the
   * capsule already resolved to (the language baseline in
   * `LANGUAGE_TEXT_SCALE`, `verseTextScale`, or a verse's own
   * `textScaleOverride`).
   *
   * This exists because a translation is not the same length as the Arabic:
   * the English of Alak overflows its capsules at the shared baseline even
   * though the Arabic sits perfectly. Rather than re-authoring every
   * `textScaleOverride` per language — which would fight the Arabic — a
   * language states how much SMALLER (or bigger) its own text runs, page-wide
   * and then per block / per verse. See `LanguageTextScaleConfig`.
   */
  languageTextScale?: Partial<Record<SurahLanguage, LanguageTextScaleConfig>>;

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
 * One language's verse-text trim, in three layers that MULTIPLY together:
 *
 *   final = resolvedSize × all × blocks[blockId] × verses[verseId]
 *
 * Multiplying (rather than the usual "most specific wins") is what makes the
 * layers readable the way the page is actually judged: `all` is the page-wide
 * notch — "the English runs one size smaller everywhere" — and a block or
 * verse entry says how that one differs FROM its neighbours, not from the
 * Arabic. Nudging `all` later re-sizes the whole page and keeps every
 * relationship inside it.
 *
 * Every layer is optional and defaults to 1, and a language that declares
 * nothing is untouched — so this stays an opt-in per surah, per language.
 * Values are multipliers, not sizes: 0.9 = 10% smaller, 1.1 = 10% bigger.
 */
export interface LanguageTextScaleConfig {
  /** Page-wide notch for this language. Multiplies every verse capsule. */
  all?: number;

  /**
   * Per-block trim, keyed by `LayoutBlock.id` — every verse the block owns
   * (its `verseIds` plus a grid's `anaAyetId`) gets it. Use when a whole
   * region reads too big, e.g. a 2×2 group whose translations all wrap.
   */
  blocks?: Record<string, number>;

  /**
   * Per-verse trim, keyed by the ARABIC verse/chunk id — the same id used by
   * `verseOverrides` and `blocks[].verseIds`, so the key means the same thing
   * in every language even where the reading order differs.
   */
  verses?: Record<number, number>;
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
  type: "group" | "grid" | "spacer";

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
  dragBehavior?: "group" | "pair" | "single" | "individual";

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
    translationTextScaleOverride?: number;
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

  // ── PER-LANGUAGE LAYOUT ──────────────────────────────────────────────────

  /**
   * Layout tweaks that apply only while a given language is active. The block
   * itself (its id, verse ids, colors, shapes, drag zones) is untouched — only
   * the numbers listed in `LayoutBlockLanguageOverride` change, so a
   * translation can sit somewhere else on the page without becoming a second
   * block that everything else would have to know about.
   *
   * Use it when a translation's own book lays the same chunks out differently
   * — e.g. Tevbe-24, where the Turkish edition prints the two-capsule row
   * ABOVE the dome capsule while the Arabic prints the dome first (see
   * `stackOrder`).
   */
  languageOverrides?: Partial<Record<SurahLanguage, LayoutBlockLanguageOverride>>;
}

/**
 * The subset of `LayoutBlock` a single language may override. Deliberately
 * limited to pure positioning/sizing numbers: content, ids, colors, drag
 * behavior and shapes stay identical across languages, so nothing downstream
 * (customSections, svgOverlays' `anchorGroupIndex`, colorGroups index
 * alignment, scriptHighlights) has to be re-authored per language.
 */
export interface LayoutBlockLanguageOverride {
  /**
   * Where this block sits in the vertical stack for this language, as a sort
   * key over the blocks array (default: the block's own index). Blocks with
   * equal keys keep their config order.
   *
   * ONLY the top-to-bottom stacking changes: `blocks` keeps its config order
   * everywhere else, so group indices, `colorGroups` alignment and every
   * `anchorGroupIndex` stay valid. Give BOTH swapped blocks a key (e.g. 6 and
   * 5) rather than one, so the intent reads off the config.
   */
  stackOrder?: number;

  capsuleHeight?: number;
  rowGap?: number;
  extraRowGap?: number;
  gapBefore?: number;
  columnGap?: number;
  blockPadding?: number;
  rows?: number;
  verticalNudge?: number;
  horizontalInset?: number;
  xOffset?: number;
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
 * The patch of page a section's zoom should FRAME, rather than a hand-tuned
 * camera height. `CameraTargetConfig` states where the camera goes; this states
 * what has to be on screen when it gets there, and the camera solves its own
 * distance from the page's size and the viewport's shape (SectionZoomCamera).
 *
 * One page holds ONE surah on every ordinary sheet, so the two describe the
 * same thing there and `cameraTarget` is the shorter way to say it. On an atlas
 * — a dozen sheets composed onto one paper (paperComposer) — they part company:
 * a height and a tilt frame the middle of the paper no matter which sheet was
 * clicked, while a rectangle frames the sheet itself.
 *
 * Stated in the composed page's own coordinates, the ones every placement uses:
 * x runs 0 → paperWidth rightwards from the page's left edge, y runs 0 →
 * −paperHeight downwards from its top, and `x, y` is the rectangle's TOP-LEFT
 * corner.
 */
export interface CameraFocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
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
  /**
   * What this section's zoom must frame. Takes precedence over
   * `cameraTarget` — see `CameraFocusRect`.
   */
  cameraFocus?: CameraFocusRect;
  /**
   * Where this section can be CLICKED, when nothing on the page draws it.
   *
   * Every other zone gets its hitbox for free: `VerseClickHitboxes` derives
   * one from each verse capsule and each block frame, so a zone made of
   * capsules is clickable wherever its capsules are. A zone whose content is
   * not a capsule at all — a `handwrittenNotes` passage printed outside the
   * frame, say — has no transform to derive anything from, and so cannot be
   * reached however plainly it is sitting there. Stating the rectangle is how
   * such a zone gets a way in; the zoom, the elevation and the masking all
   * still run off `verseIds` exactly as they do everywhere else.
   *
   * Page space, same convention as `CameraFocusRect`.
   */
  hitRect?: CameraFocusRect;
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
  /**
   * NEW AYAH MODEL — renders the verse capsule as a half-oval / dome instead of
   * the usual pill or rounded rectangle. The flat side always carries the verse
   * text; the domed side is a smooth arch (like the Tevbe:24 shield/dome ayahs).
   *
   *  'dome-up'   → flat BOTTOM, domed TOP    (e.g. Tevbe verse 8, points up)
   *  'dome-down' → flat TOP,    domed BOTTOM (e.g. Tevbe verses 4 & 7, point down)
   *
   * Works in both the resting SVG-section view and the elevated mesh view.
   */
  verseShape?: "capsule" | "dome-up" | "dome-down";
  /**
   * For `verseShape` domes only — fraction of the capsule height (0–1) that
   * stays a straight vertical wall before the arch begins. Smaller = a taller,
   * rounder dome; larger = a flatter dome. Defaults to 0.35.
   */
  domeSideRatio?: number;
  /**
   * PADDING INSIDE THE CAPSULE — world units, taken off EACH side, so the text
   * gets `capsuleWidth − 2 · versePadding` to set itself in. Applies to every
   * language unless `translationPadding` narrows it, which makes this the
   * ARABIC padding on a page that pads the two differently (the same split as
   * `textColor` / `translationTextColor`).
   *
   * NEGATIVE opens the capsule up past its own border — the text is allowed to
   * set wider than the box it sits in. That is the only way to reduce the air
   * on a `tightVersePadding` page, where the default padding is already zero.
   *
   * It is a WRAP-AND-CLIP width, not a nudge: the text stays centred in the
   * capsule either way, and what this changes is where a line breaks and where
   * CanvasText stops drawing it. So it does nothing to a line that already fits
   * — to actually close a gap between a short line and the border, move
   * `textScaleOverride` instead, or narrow the capsule.
   */
  versePadding?: number;
  /** The EN/TR padding, replacing `versePadding` there — see `versePadding`. */
  translationPadding?: number;
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
  /**
   * Explicit hex color for this verse's text. Applies to every language unless
   * `translationTextColor` narrows it — so on a page that colors Arabic and
   * translation differently, this is the ARABIC color.
   */
  textColor?: string;
  /**
   * EN/TR color for this verse's text, replacing `textColor` there. Set it
   * when the Arabic and the translation of the same chunk are printed in
   * different inks — e.g. Nisâ 23's chunk 1, where the translation is fully
   * red but the Arabic is black apart from one red word (`textHighlights`).
   */
  translationTextColor?: string;
  /**
   * Recolors substrings INSIDE this verse's text, on top of `textColor` — the
   * way the reference pages print one word of a phrase in red and the rest in
   * black. Each entry matches against the text of the language being drawn, so
   * an Arabic phrase listed here simply finds nothing in EN/TR and no-ops;
   * `translationTextHighlights` is where those languages say their own.
   *
   * Line breaks, wrapping and position are untouched — only the ink changes.
   */
  textHighlights?: VerseTextHighlight[];
  /**
   * EN/TR counterpart to `textHighlights`, replacing it wholesale in those
   * languages (an empty array therefore means "no highlights in translation").
   */
  translationTextHighlights?: VerseTextHighlight[];
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
  /**
   * SINGLE-AYAH PAGES ONLY (`scriptInfo.singleAyahNumber` set) — this verse's
   * badge slot carries BOTH numbers stacked on top of each other: the chunk
   * counter on top (plain, no circle) and the page's real mushaf ayah number
   * underneath it in the normal badge design. Mirrors how a mushaf prints the
   * ayah-ending marker next to the last chunk of the ayah.
   *
   * Ignored when the config has no `singleAyahNumber` — there is no single
   * ayah number to show, so the badge just keeps the counter.
   */
  showAyahNumber?: boolean;
  /** Override the background color of the stacked ayah number badge (e.g. "24").
   * Defaults to `circleBg` when not set. */
  ayahBadgeBg?: string;
  /** Override the border color of the stacked ayah number badge (e.g. "24").
   * Defaults to `circleBorderCol` when not set. */
  ayahBadgeBorderCol?: string;
  /** Override the text color of the stacked ayah number badge (e.g. "24").
   * Defaults to `circleTextCol` when not set. */
  ayahBadgeTextCol?: string;
  /**
   * STACKED BADGE ONLY (`showAyahNumber: true`) — where the two numbers sit
   * inside the capsule. Unset, they keep the default: the ayah marker on the
   * same slot a plain counter badge takes, the chunk counter one badge diameter
   * above it.
   */
  ayahBadgeLayout?: AyahBadgeLayout;
  /**
   * STACKED BADGE ONLY — the EN/TR layout, merged field by field over
   * `ayahBadgeLayout`. The same capsule holds a short Arabic phrase and a
   * wrapped translation, so the room left beside the badge differs by language;
   * this is where a page says so.
   */
  translationAyahBadgeLayout?: AyahBadgeLayout;
}

/**
 * One recolored stretch of a verse's own text — see
 * `VerseOverrideConfig.textHighlights`.
 */
export interface VerseTextHighlight {
  /**
   * The exact substring to recolor, copied from this verse's entry in the
   * TEXT DATA — diacritics and all, since that is what gets matched. Splitting
   * on a word boundary is the safe choice: Arabic letters join inside a word,
   * so cutting mid-word would break the shaping.
   */
  text: string;
  /** Color for every character of the match. */
  color: string;
  /**
   * Which occurrence to recolor, 1-based. Omit to recolor every occurrence —
   * which is what you want for a word that appears once, and what you must
   * NOT leave off for a single letter like the `*` footnote marker if it also
   * appears elsewhere in the same verse.
   */
  occurrence?: number;
}

/**
 * Placement of the two numbers a single-ayah page stacks in one badge slot —
 * the mushaf ayah marker and the chunk counter above it. Every value is a world
 * -unit offset from the spot that number takes by default, so `{}` is exactly
 * today's stack. Positive X → right, positive Y → up.
 */
export interface AyahBadgeLayout {
  /** Moves the ayah marker (e.g. "23"). */
  offsetX?: number;
  /** Moves the ayah marker. */
  offsetY?: number;
  /**
   * Moves the chunk counter (e.g. "14") independently of the marker — a roomy
   * capsule can drop the marker in beside the text and leave the counter out in
   * the corner. Defaults to `offsetX`, i.e. the counter rides above the marker.
   */
  counterOffsetX?: number;
  /** Moves the chunk counter. Defaults to `offsetY`. */
  counterOffsetY?: number;
}

export interface SurahAssets {
  metallicVerseBorderSvg?: string;
}

/**
 * Surah script metadata shown in the left ayah-list sidebar (SurahScriptSidebar):
 * the surah title line and the "SAYFA / JUZ / HIZB" info row beneath it.
 */
export interface SurahScriptInfo {
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
  /**
   * Restricts this overlay to the listed languages. Omitted → drawn in all of
   * them (the normal case: the geometry is shared and only the text changes).
   *
   * Set it when a decoration only makes sense for some translations — e.g.
   * Nisa-23's chunk-1 wrapper box, which exists because Turkish and English
   * split the ayah's opener onto its own line while Arabic says the opener
   * and chunk 1 in one breath and needs no box at all.
   */
  languages?: ("ar" | "en" | "tr")[];

  /**
   * Per-language placement for an overlay that IS drawn in every language but
   * doesn't land in the same spot in all of them — typically because a
   * `LayoutBlock.languageOverrides` entry moved the group it anchors to.
   *
   * Merged over the base fields, so a language only states what differs.
   */
  languageOverrides?: Partial<Record<SurahLanguage, SvgOverlayLanguageOverride>>;
}

/** The placement fields of `SvgOverlayItem` a single language may override. */
export type SvgOverlayLanguageOverride = Partial<
  Pick<
    SvgOverlayItem,
    | "src"
    | "anchorGroupIndex"
    | "anchorEdge"
    | "scaleX"
    | "scaleY"
    | "offsetX"
    | "offsetY"
    | "rotationZ"
    | "renderOrder"
  >
>;

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

  /**
   * Per-language placement for this icon — same idea as
   * `SvgOverlayItem.languageOverrides`: an arrow that points at a chunk has to
   * follow that chunk when a translation lays the page out differently.
   */
  languageOverrides?: Partial<Record<SurahLanguage, HandwrittenNoteSvgLanguageOverride>>;
}

/** The placement fields of `HandwrittenNoteSvg` a single language may override. */
export type HandwrittenNoteSvgLanguageOverride = Partial<
  Pick<
    HandwrittenNoteSvg,
    "src" | "anchor" | "offsetX" | "offsetY" | "scaleX" | "scaleY" | "rotationZ"
  >
>;

export interface HandwrittenNoteConfig {
  /** Lines of handwritten text, top to bottom. */
  lines: HandwrittenNoteLine[];
  /**
   * Font URL these lines are drawn with. Defaults to `HANDWRITTEN_FONT`, the
   * Latin cursive — which carries NO Arabic glyphs, so an Arabic-script note
   * must point this at `QURAN_FONT` or it rasterises as blank/tofu. Any URL
   * used here has to be registered in both `FONT_FAMILY_NAMES` (theme.ts) and
   * `PAGE_TEXT_FONTS` (PaperMaterial.tsx) so the FontFace is actually loaded —
   * `QURAN_FONT` and `HANDWRITTEN_FONT` already are.
   */
  font?: string;
  /**
   * Skip this note entirely. Its real use is per-language: the Arabic and the
   * Latin form of the same margin note want different fonts, line counts and
   * anchor points, so author them as two notes and let each language hide the
   * one it doesn't read (see nisa23Config).
   */
  hidden?: boolean;
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

  /**
   * Per-language form of the note itself (the icons carry their own
   * `languageOverrides`). Use when a translation moves the chunk this note
   * labels — or prints something else there entirely.
   */
  languageOverrides?: Partial<Record<SurahLanguage, HandwrittenNoteLanguageOverride>>;
}

/**
 * The fields of `HandwrittenNoteConfig` a single language may override.
 *
 * Covers CONTENT, not just placement, because a margin note is prose: where
 * the reference book prints the Arabic tail of an ayah, the translations print
 * an explanatory gloss of it, and the two differ in wording, line count,
 * script, font, ink colour and alignment all at once. So a language may
 * replace `lines` outright — see the "NOT:" note in nisa23Config.
 *
 * `svgs` is REPLACE, not merge: a language that sets it supplies the whole
 * icon list. Omit it to inherit the base note's icons, which then follow their
 * own per-icon `languageOverrides` for placement.
 */
export type HandwrittenNoteLanguageOverride = Partial<
  Pick<
    HandwrittenNoteConfig,
    | "lines"
    | "font"
    | "hidden"
    | "x"
    | "y"
    | "fontSize"
    | "color"
    | "lineSpacing"
    | "maxWidth"
    | "textAlign"
    | "rotationZ"
    | "opacity"
    | "renderOrder"
    | "svgs"
  >
>;

// ---------------------------------------------------------------------------
// SIDE INFORMATION (TAFSIR) PANEL — right-hand reading panel synced to the
// fold story, mirroring the left SurahScriptSidebar. Content is authored per
// surah and keyed EITHER by fold step id (byFoldStep) or by ayah number
// (byVerse); both may be combined. A verse entry surfaces the moment its
// verse first appears in `scriptHighlights` for the current fold step, and
// stays on screen (the panel is a growing, scrollable reading log) so the
// reader always has time to finish a story before the next one arrives.
// ---------------------------------------------------------------------------

export interface SideInfoImage {
  /** Path to the image asset (relative to /public). */
  src: string;
  /** Small italic caption rendered under the image. */
  caption?: string;
  /** Accessible alt text. Falls back to the caption. */
  alt?: string;
}

export interface SideInfoAudio {
  /** Path to the audio asset (relative to /public). */
  src: string;
  /** Small label rendered above the player (e.g. reciter name). */
  title?: string;
}

export interface SideInfoCapsuleItem {
  /** Leading number, rendered as an accent-colored "n." before the text. */
  n?: number | string;
  /**
   * The capsule's text. Its length drives the layout automatically: a short
   * line sits centered in a true pill; longer passages relax into a
   * left-aligned plaque, and very long ones float the number as a chip on
   * the top border so multi-line text stays clean inside the narrow panel.
   */
  text: string;
  /** Accent override (border + number color) for just this capsule. */
  color?: string;
  /** Fill override for just this capsule. */
  bg?: string;
  /** Text color override for just this capsule. */
  textColor?: string;
  /** In a 2-column grid, make this capsule span the full row (banner style). */
  span?: boolean;
}

export interface SideInfoCapsules {
  /** The capsules. A single item renders as one full-width capsule. */
  capsules: SideInfoCapsuleItem[];
  /**
   * Grid columns. Defaults to 2 when there is more than one capsule
   * (book-style side-by-side pairs), 1 otherwise. A 2-column grid collapses
   * to 1 column on narrow screens where the panel is only 160px wide.
   */
  columns?: 1 | 2;
  /** Accent color — borders and numbers — for all capsules. Defaults to the panel gold. */
  color?: string;
  /** Capsule fill for all capsules. Defaults to a faint tint of the accent. */
  bg?: string;
  /** Text color for all capsules. Defaults to the panel's body ink. */
  textColor?: string;
  /**
   * Corner treatment. "pill" forces fully-rounded ends; "soft" forces the
   * book's gently-rounded rectangle. Omit to pick automatically from each
   * capsule's text length (short → pill, long → soft plaque).
   */
  corners?: "pill" | "soft";
  /**
   * Draw a rounded frame around the whole group, like the book's boxed
   * capsule clusters. `true` derives the frame color from the accent;
   * pass a color string to override it.
   */
  frame?: boolean | string;
}

export interface SideInfoSubtitle {
  /** A smaller heading inserted between paragraphs. */
  subtitle: string;
}

export interface SideInfoHtml {
  /** Raw HTML string rendered exactly as-is (bypasses text animation). */
  html: string;
}

/**
 * One item of an entry's reading flow: a plain string renders as a body
 * paragraph, a `{ capsules: [...] }` object renders as a capsule group —
 * placed exactly where it sits in the array, so capsules can go before,
 * between or after any paragraph. A `{ subtitle: "..." }` object renders as a subheading.
 * A `{ html: "..." }` object renders raw HTML and bypasses word-by-word animation.
 */
export type SideInfoFlowItem =
  | string
  | SideInfoCapsules
  | SideInfoSubtitle
  | SideInfoHtml;

export interface SideInfoEntry {
  /**
   * Tiny uppercase lead-in line above the title (e.g. "1-5. Ayetler").
   * Verse entries fall back to "{n}. Ayet" automatically when omitted.
   */
  kicker?: string;
  /** Entry heading, animated in with the intro title animation. */
  title?: string;
  /**
   * The entry's reading flow, in order. Plain strings are body paragraphs;
   * `{ capsules: [...] }` items are capsule groups (single pills, 2-column
   * grids, framed clusters) — see SideInfoCapsules.
   */
  paragraphs?: SideInfoFlowItem[];
  /** Images rendered borderless below the text, in order. */
  images?: SideInfoImage[];
  /** Optional audio (e.g. recitation) rendered as a minimal player at the entry's end. */
  audio?: SideInfoAudio;
  /**
   * Optional time-aligned recitation(s) — pass one, or an array of as many as
   * the entry needs. Each claims the run of authored lines it actually speaks
   * and renders them live: karaoke-synced text with an inline player that
   * highlights every word as it's spoken and keeps the panel scrolled to it
   * (see SyncedRecitation.tsx). A recited run sits exactly where its lines sit
   * in the flow, and — unlike the rest — is never folded away by the "read
   * more" collapse.
   *
   * With several, they play as a chain: finishing one starts the next by
   * itself, in array order. Placement is automatic; give a transcript
   * `from` / `to` anchors (see RecitationAnchor) to pin it by hand.
   */
  recitation?: RecitationTranscript | RecitationTranscript[];
}

export interface SurahSideInfoConfig {
  /** Panel heading shown at the top. Defaults to "Tefsir". */
  panelTitle?: string;
  /** Faint hint shown while no entry is visible yet at the current fold step. */
  emptyText?: string;
  /**
   * Entries keyed by fold step id (same ids as `animations.foldSteps`).
   * The entry appears when the fold story reaches that step.
   */
  byFoldStep?: Record<string, SideInfoEntry>;
  /**
   * Entries keyed by verse id (the same `number` used in `scriptHighlights`
   * and `blocks[].verseIds`). The entry appears at the first fold step whose
   * `scriptHighlights` list contains the verse.
   */
  byVerse?: Record<number, SideInfoEntry>;
}

/**
 * One language's tafsir panel content — normally just the object itself,
 * defined as its own `const` at the end of the surah's config file (after
 * the config object, since the config wires it in by mutating
 * `sideInfoTranslations` once the const exists — see e.g. `ALAK_SIDE_INFO_EN`
 * at the bottom of alak96Config.ts).
 *
 * The `() => import(...)` loader form is also accepted (useSideInfoContent
 * resolves either), for a future surah whose tafsir gets heavy enough to
 * deserve its own chunk — nothing in this project needs that yet.
 */
export type SideInfoTranslation =
  | SurahSideInfoConfig
  | (() => Promise<SurahSideInfoConfig>);

/**
 * Per-language overrides for the tafsir panel, keyed by the same language ids
 * the language switcher cycles through ("ar" | "en" | "tr").
 *
 * A language listed here replaces `SurahLayoutConfig.sideInfo` wholesale while
 * it is active; a language NOT listed here falls back to `sideInfo`, which
 * stays the authored default (Turkish for every surah in this project — that
 * is also what Arabic shows, since the tafsir prose has no Arabic edition).
 */
export type SurahSideInfoTranslations = Partial<
  Record<SurahLanguage, SideInfoTranslation>
>;

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
  /** Script metadata for the ayah-list sidebar (title + sayfa/juz/hizb). */
  scriptInfo?: SurahScriptInfo;

  /**
   * Fold-story → script highlight sync for the SurahScriptSidebar.
   *
   * Key:   a fold step id from `animations.foldSteps` ("pre-start", "end", …).
   * Value: the verse ids (the same `number` used in the text data,
   *        `verseOverrides` and `blocks[].verseIds`) whose script text is
   *        highlighted while the fold story sits at that step — i.e. the
   *        verses currently VISIBLE on the (partially folded) paper.
   *
   * A step id missing from the map means "no highlight at this step".
   * The highlight border mirrors the paper capsule: pill by default,
   * rounded rectangle when `verseOverrides[id].isPill === false`, colored
   * with `verseOverrides[id].border` when set.
   */
  scriptHighlights?: Record<string, number[]>;

  /**
   * Right-hand tafsir/story reading panel (SideInfoPanel), synced to the fold
   * story exactly like `scriptHighlights` syncs the left script sidebar.
   * Author entries per fold step and/or per verse — see SurahSideInfoConfig.
   *
   * This is the DEFAULT-language panel (Turkish, as authored from the tafsir
   * book). Other languages go in `sideInfoTranslations`, and any language
   * missing there falls back to this one.
   */
  sideInfo?: SurahSideInfoConfig;

  /**
   * The same panel in the other languages the switcher offers — see
   * SurahSideInfoTranslations. Each entry should be a `() => import(...)`
   * loader so a translation only ever ships to a reader who selects it.
   */
  sideInfoTranslations?: SurahSideInfoTranslations;
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
    translationTextScaleOverride?: number;
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
