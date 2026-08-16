/**
 * yasinSheetKit — writes a Yâsîn SHEET from a short declaration.
 *
 * yasin36Config and yasin1319Config are hand-solved: every capsule height,
 * every `horizontalInset`, every frame's `scaleX / scaleY / offsetY` is a
 * number someone worked out on paper. That is the right way to build TWO
 * sheets, not the eight more that finish the surah, so this module does the
 * solving — from a declaration that only says what the page MEANS:
 *
 *     rows:   [ { ayah: 20, ar, tr, en },                        ← one capsule
 *               { right: [22, 23], left: [24, 25] },             ← two columns
 *               … ]
 *     frames: [ { from: 0, to: 6, tone: "outer" },
 *               { from: 1, to: 3, tone: "band" }, … ]
 *
 * A frame WRAPS a run of rows, and a row inside two frames is drawn narrower
 * than one inside one. That nesting is the whole visual grammar of these pages
 * — a passage inside a passage — and it is the only thing the declaration has
 * to get right. Widths, heights, the air a frame's rim needs between two
 * capsules, the text size that fits, the drag zones, the camera targets and
 * the frame rectangles all fall out of it.
 *
 * SIDE-BY-SIDE COLUMNS. The handwritten sheets put two short ayahs beside one
 * long one whenever they answer it — Yâsîn 22-23 with 24-25, say. The block
 * engine stacks, it does not place, so a `{ right, left }` row is emitted as
 * two stacks of blocks and the left one is jumped back up to the right one's
 * top edge with a NEGATIVE `gapBefore` (the same trick fatihaLandscapeConfig
 * uses by hand for its two panels).
 *
 * CALIBRATION. Every constant below is read off yasin1319Config, so a
 * generated sheet sits beside the two hand-made ones as a twin, not a cousin:
 *
 *              capsule w   frame pad x   frame pad y
 *   depth 1      0.900        0.080         0.058
 *   depth 2      0.790        0.065         0.040
 *   depth 3      0.680        0.050         0.035
 *
 * FRAME ART. `buildSheet` returns the frame rectangles the config points at,
 * in world units, so `scripts/emitSheetFrames.ts` can draw each SVG AT THE
 * ASPECT IT IS DISPLAYED AT — the rule every hand-made frame file in /public
 * documents at length (a shared file stretched to another aspect turns round
 * corners into ovals and an even rim uneven).
 */

import type {
  CustomSectionDef,
  HandwrittenNoteConfig,
  LayoutBlock,
  LayoutStyling,
  SurahLayoutConfig,
  SvgOverlayItem,
  VerseOverrideConfig,
} from "../../schema";
import type { ColorGroup, SurahDataShape } from "../../SurahConfig";
import type { SurahLanguage } from "../../../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// Palette — yasin36Config's, so every sheet of the surah shares one ink box.
// ---------------------------------------------------------------------------

export const SHEET_COLORS = {
  cream: { bg: "#F3EAD6", border: "#D0A24E", ink: "#5A3D12" },
  white: { bg: "#FBFAF4", border: "#C7C1AC", ink: "#2C2A22" },
  lav: { bg: "#E1E3F3", border: "#8E93C8", ink: "#26283F" },
  maroon: { bg: "#F6EDE8", border: "#B0504D", ink: "#A30000" },
  gold: { bg: "#F5EEDC", border: "#D0A24E", ink: "#5A3D12" },
  green: { bg: "#EDF3EA", border: "#6E9464", ink: "#2F5D3A" },
  blue: { bg: "#EAF1F5", border: "#6E96A8", ink: "#1F3D4A" },
} as const;

/**
 * The two shared frame textures used by the Yasin sheets. Keeping one URL per
 * visual role lets Three's texture cache reuse the same rasterised SVG across
 * every sheet that needs it.
 */
export const SHEET_FRAME_SVGS = {
  overall: "/yasin1319/all-section.svg",
  band: "/yasin1319/band.svg",
  inner: "/nisa/all-section.svg",
} as const;

/** Shared handwritten heading used at the top of every Yâsîn sheet. */
export const yasinHandwrittenTitle = (
  paperWidth: number,
  range: string,
): HandwrittenNoteConfig[] => [
  {
    x: paperWidth / 2,
    y: -0.08,
    fontSize: 0.048,
    color: "#2f4858",
    lineSpacing: 1.6,
    maxWidth: paperWidth,
    textAlign: "center",
    rotationZ: 0,
    lines: [{ text: `Yâsîn Suresi ${range.replaceAll("-", "–")}` }],
  },
];

export type Tone = keyof typeof SHEET_COLORS;

/**
 * The surah's one styling block. Every Yâsîn page — the generated sheets, and
 * the overview plan that is not a sheet at all — is drawn with this, so a
 * capsule rule, a badge and an elevated corner are the same thickness and the
 * same radius wherever in the surah you meet them.
 *
 * Note what is NOT here: a capsule's own colours. Those travel per verse, in
 * `verseOverrides`, picked off `SHEET_COLORS` — see `buildSheet`.
 */
export const SHEET_STYLING: LayoutStyling = {
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
    maroonTheme: SHEET_COLORS.maroon.border,
    greenTheme: SHEET_COLORS.cream.border,
    s1InnerBorder: "#cccccc",
    s2IntroOutroBg: SHEET_COLORS.cream.bg,
    s2Group1Bg: SHEET_COLORS.cream.bg,
    s2Group2Bg: SHEET_COLORS.white.bg,
    s2Group3Bg: SHEET_COLORS.maroon.bg,
    // The frames do the bracketing; one transparent entry stops SideCurves
    // falling back to its default olive bracket on every centred block.
    curveColors: [{ color: "transparent", fillColor: "transparent" }],
  },
  capsuleBorderWidth: 0.0038,
  circleBorderWidth: 0.003,
  verseRadius: 0.05,
  oppositeVerseConnectorRadius: 0.04,
  elevatedSectionRadii: {
    base: 0.04,
    outer: 0.026,
    innerA: 0.024,
    innerB: 0.022,
  },
};

/**
 * The frame paints. `outer` is the sheet's solid rim; everything else is one
 * of the translucent frames that stack inside it — `rose` and `band` for the
 * rounded-rectangle groups, and the three `ring*` tones for an onion of
 * stadium-ended ovals (the shape yasin36Config's three rings are drawn in,
 * and the one the handwritten 28-32 sheet uses).
 */
export type FrameTone =
  | "outer"
  | "rose"
  | "band"
  | "inner"
  | "ring"
  | "ringMid"
  | "ringInner"
  /** A mandorla — two arcs meeting at a point. One ayah per petal. */
  | "lens"
  /** A plain ellipse, for the ring that holds a rosette of petals. */
  | "circle"
  /**
   * GROUPS BUT DOES NOT DRAW. No SVG is emitted and nothing is painted, yet the
   * frame still narrows the rows it wraps, still opens air around them, and
   * still gives them their own drag zone and camera target. This is how a page
   * keeps a group that reads as a group without a rim around it.
   */
  | "none";

// ---------------------------------------------------------------------------
// Declaration
// ---------------------------------------------------------------------------

export interface CapsuleSpec {
  /** The real mushaf ayah number — what the badge prints. */
  ayah: number;
  ar: string;
  tr: string;
  en: string;
  tone?: Tone;
  /** No badge at all — for a capsule carrying half an ayah. */
  noNumber?: boolean;
  /**
   * Half-oval instead of a rounded rectangle — the Tevbe:24 ayah model.
   *
   *   "dome-up"   → flat bottom, arched top
   *   "dome-down" → flat top, arched bottom
   *
   * On a rosette this is what makes a petal close: the capsule at the top of a
   * lens arches UP into the lens's point, the one at the bottom arches DOWN
   * into the other. The capsule is given `DOME_EXTRA_H` of extra height so the
   * arch is room ADDED above the text, not room taken from it.
   */
  shape?: "dome-up" | "dome-down";
  /**
   * Share of the row's natural width this row takes, centred. Default 1.
   * 0.5 makes a full-width row exactly as wide as one column of a split row
   * beneath it — which is how a rosette gets four petals of equal size.
   */
  width?: number;
  /**
   * THE SIZE, SET BY HAND. Replaces the fit below for this capsule — the
   * multiplier VerseBox turns into `0.071 × arScale` world units of Arabic.
   *
   * The fit is an estimate off word and character counts; these numbers were
   * read off the capsule itself, at the size where the ink — vowel marks and
   * descenders included — just clears the rule. That is always the larger
   * number, often by half again, and it is the only way a capsule ends up
   * genuinely full rather than safely underset.
   *
   * IT GOES STALE IF THE TEXT CHANGES. Change the words or the line breaks in
   * this capsule and the number no longer describes it: delete it and the fit
   * takes over again (smaller, but never clipped).
   */
  arScale?: number;
  /** The same, for the EN/TR text. See `arScale`. */
  latScale?: number;
  /**
   * Geometry-only line count for the capsule. Use this when text is reflowed
   * into fewer visual lines but the original capsule/frame height must stay
   * unchanged. It does not change the text or either text scale.
  */
  heightLines?: number;
  /** Custom air after this capsule before the next stacked row. */
  gapAfter?: number;
  /** Move this row without moving rows that follow it. */
  offsetY?: number;
  /** Uniformly scale this capsule around its centre without moving its layout slot. */
  scale?: number;
  /** Extra capsule width on each side; affects the rendered capsule only. */
  expandW?: number;
  /**
   * THE AIR THIS CAPSULE KEEPS INSIDE ITS OWN BORDER, per side, in world units
   * — `VerseOverrideConfig.versePadding` for the Arabic of this one capsule.
   * Defaults to the sheet's `capsuleArPad`, then to `AR_PAD` below, so one
   * number moves one capsule, one sheet, or the whole surah.
   *
   * POSITIVE pulls the text in off the border; NEGATIVE lets it set wider than
   * the capsule it sits in. Zero is where every sheet stands today: these pages
   * declare `tightVersePadding`, whose whole point is that the text may run
   * right up to the rule.
   *
   * WHAT IT ACTUALLY MOVES is where a line wraps and where it gets clipped —
   * the text stays centred in the capsule either way. So it will not close the
   * gap around a line that already fits: for that, raise `arScale` (bigger
   * text) or narrow the capsule (`width`). Where it earns its keep is a capsule
   * whose text is set right to the edge — a few thousandths of padding buys the
   * ink its margin back without re-solving the scale.
   *
   * IT ALSO BOUNDS THE AUTO-FIT: a capsule with no `arScale` is fitted into the
   * width this leaves, not the capsule's own, so padding and the fallback fit
   * never fight each other.
   */
  arPad?: number;
  /** The same, for the EN/TR text. See `arPad`. */
  latPad?: number;
}

/**
 * Two capsules on ONE line, bridged by the horizontal connector bar the
 * renderer draws between paired capsules. The handwritten sheets use it for a
 * phrase that splits in two without breaking — "of palm · and vine" — and it
 * is what makes a petal read as one line rather than two stacked ones.
 * `[right, left]`, in reading order.
 */
export interface PairRow {
  pair: [CapsuleSpec, CapsuleSpec];
  /** Share of the row's natural width, centred. See `CapsuleSpec.width`. */
  width?: number;
  /** Horizontal air between this pair's two capsules. */
  columnGap?: number;
  /** Custom air after this pair before the next item in its column. */
  gapAfter?: number;
  /** Move this row without moving rows that follow it. */
  offsetY?: number;
}

/** What a column of a split row may hold: a capsule, or a bridged pair. */
export type ColumnItem = CapsuleSpec | PairRow;

/** Two stacks of capsules side by side. `right` reads first (RTL). */
export interface SplitRow {
  right: ColumnItem[];
  left: ColumnItem[];
  /** Share of the row's width the RIGHT column takes. Defaults to 0.5. */
  ratio?: number;
  /** Pull both columns towards the centre by this amount. */
  inwardShift?: number;
  /** Custom air after this split section before the next stacked row. */
  gapAfter?: number;
  /** Move this split section without moving the rows that follow it. */
  offsetY?: number;
}

export type SheetRow = CapsuleSpec | PairRow | SplitRow;

export interface FrameSpec {
  /** Inclusive ROW indices this frame wraps. */
  from: number;
  to: number;
  tone: FrameTone;
  /**
   * Wrap only ONE COLUMN of a split row, instead of the whole row. This is how
   * a rosette is drawn: the 33-36 sheet gives every ayah its own petal, and two
   * of those ayahs sit side by side in one row.
   */
  side?: "right" | "left";
  /**
   * Draw this frame with ART THAT ALREADY EXISTS — a path under /public —
   * instead of one emitted at its own aspect. Nothing is generated for it.
   *
   * Use it for the hand-made ornaments the other surahs are drawn with, and
   * know what it costs: those files are tuned to the aspect their own config
   * displays them at (each says so in its header), so one landing on a frame of
   * a different shape arrives stretched — round ends turn oval, an even rim
   * turns uneven. The generated frames exist precisely to avoid that.
   */
  src?: string;
  /**
   * Vertical air this frame opens between itself and whatever is outside it, in
   * world units. Defaults to its nesting level's padding. Turn it DOWN to pull a
   * group towards its neighbours — a `none` frame in particular wants far less
   * than a drawn one, having no rim for the air to clear.
   */
  pad?: number;
  /** Override the width of the frame. */
  w?: number;
  /** Override the height of the frame. */
  h?: number;
  /** Override the offsetY of the frame. */
  offsetY?: number;
}

export interface SheetSpec {
  id: string;
  /** Short key — names the SVG folder and namespaces the atlas ids. */
  key: string;
  title: string;
  heroSubtitle: string;
  sayfa: number;
  /** Page width in world units. Height is derived from the stack. */
  paperWidth?: number;
  /** Per-sheet capsule width multiplier. Defaults to 1. */
  capsuleWidthScale?: number;
  /** Per-sheet capsule height multiplier. Defaults to 1. */
  capsuleHeightScale?: number;
  /** This sheet's default `CapsuleSpec.arPad` — every capsule on it. */
  capsuleArPad?: number;
  /** This sheet's default `CapsuleSpec.latPad` — every capsule on it. */
  capsuleLatPad?: number;
  /** Override the starting Y coordinate of the content stack. Defaults to -0.2 (SHEET_MARGIN_TOP). */
  contentStartY?: number;
  rows: SheetRow[];
  frames: FrameSpec[];
}

export interface SheetFrameRect {
  /** Path the config points at, relative to /public. */
  src: string;
  /** Never `none` — a frame that draws nothing is never handed to the emitter. */
  tone: Exclude<FrameTone, "none">;
  /** World size — the aspect the SVG must be drawn at. */
  w: number;
  h: number;
}

export interface BuiltSheet {
  config: SurahLayoutConfig;
  textData: Record<SurahLanguage, SurahDataShape>;
  frames: SheetFrameRect[];
  paperWidth: number;
  paperHeight: number;
}

// ---------------------------------------------------------------------------
// Calibration — see the table in the file header.
// ---------------------------------------------------------------------------

const PADDING = 0.2; // dimensions.padding
const SECTION_PAD_X = 0.005; // globalSettings.sectionPadX
const BLOCK_PADDING = 0.008;
const COLUMN_GAP = 0.02;
const ROW_GAP = 0.014;

/** Capsule height for n lines of text. 1 → 0.105, 2 → 0.148, 3 → 0.191. */
const CAPSULE_H_BASE = 0.062;
const CAPSULE_H_PER_LINE = 0.043;

/**
 * DOMES (`CapsuleSpec.shape`). The straight-wall fraction is Tevbe:24's, so a
 * domed capsule here reads as the same ayah model, not a cousin of it — 0.2
 * leaves four fifths of the height to the arch, which is what makes it a half
 * oval rather than a rounded lid.
 *
 * The extra height is what keeps the text at a readable size: the arch closes
 * in over a vertically-centred text block, so without it a domed capsule would
 * hold noticeably smaller text than the flat one beside it.
 */
const DOME_SIDE_RATIO = 0.2;
const DOME_EXTRA_H = 0.055;

/** How much narrower each frame level makes the capsules inside it. */
const DEPTH_1_INSET = 0.115;
const DEPTH_STEP = 0.055;

/** Air between two capsules under the same frames. */
const ROW_AIR = 0.018;
/**
 * Air where a DOME meets the capsule it sits against. A dome carries its own
 * separation — the arch pulls away from its neighbour the moment it leaves the
 * wall — so the two sit flush, and `BLOCK_PADDING` on each side is all that is
 * left between them. That is what draws a petal's three lines into one group.
 */
const DOME_ROW_AIR = 0;
/** Extra air wherever a frame's rim has to pass between two capsules. */
const RIM_AIR = 0.012;

/** Top and bottom margin of the sheet, outside its outermost frame. */
const SHEET_MARGIN_TOP = 0.2; // the handwritten title lives in here
const SHEET_MARGIN_BOTTOM = 0.12;

const framePadX = (depth: number) => 0.08 - (depth - 1) * 0.015;
const framePadY = (depth: number) => 0.058 - (depth - 1) * 0.011;

/**
 * Verse-text size that fits, as the multiplier VerseGroup hands to VerseBox —
 * where it REPLACES the language baseline rather than scaling it (SharedUI:
 * `textScale = textScaleOverride ?? langScale.verseBig`, then
 * `fontSize = VERSE_TEXT_BIG · textScale`). So the number below IS the size,
 * in units of the 0.071 big-verse em.
 *
 * The two bounds are width and height, and whichever bites first wins, because
 * CanvasText re-wraps and then CLIPS what does not fit — overshooting does not
 * draw bigger, it draws cropped. The per-word and per-character ems are
 * measured off yasin1319Config's hand-tuned capsules (its ayah 14 sits at 0.65
 * for 5.5 Arabic words on a 0.82-wide capsule, and 0.44 for a 70-character
 * Turkish line on the same one).
 *
 * THIS IS ONLY THE FALLBACK. A word count cannot tell a short word from a long
 * one, so the answer has to be pessimistic to be safe, and a capsule sized by
 * it reads underset. Every capsule of the surah therefore carries its own
 * measured `arScale` / `latScale`; this runs for the ones that do not.
 *
 * THE MARGINS below (0.016 across, 0.022 down) are what the capsule keeps clear
 * of its own rule. They used to be 0.04 and 0.03, which on a 0.24-wide petal
 * threw away a sixth of the width before a single word was set. 0.022 down is
 * the 0.012 the Arabic block loses to `BIG_VERSE_VERTICAL_SHIFT` (it is drawn
 * 0.006 low, so the bottom edge binds first) plus 0.01 of air.
 */
/**
 * THE WHOLE SURAH'S CAPSULE PADDING — the air every generated sheet keeps
 * between a capsule's text and its own border, per side, in world units. A
 * sheet overrides it with `capsuleArPad` / `capsuleLatPad` and a single capsule
 * with `arPad` / `latPad`; see `CapsuleSpec.arPad` for what the number does and
 * what it cannot do.
 *
 * Zero is the look these pages were solved at, `tightVersePadding` and all: turn
 * it up to give every capsule of the surah a margin at once, and expect the
 * capsules whose `arScale` was measured right to the rule to re-wrap.
 *
 * (The two HAND-MADE sheets, 1-12 and 13-19, do not come through this kit and
 * are not touched by it — they carry their own `verseOverrides`, where the same
 * knob is spelled `versePadding` / `translationPadding`.)
 */
const AR_PAD = 0;
const LAT_PAD = 0;

const AR_EM = 0.071;
const AR_WORD_EM = 2.3;
const LINE_EM = 1.2;
// Shared Arabic baseline for generated sheets. The old 0.82 left nearly every
// generated capsule visibly underset beside the hand-tuned 13-19 sheet.
const AR_SCALE_CAP = 1;
const PAD_X = 0.016;
const PAD_Y = 0.022;

function fitArabicScale(text: string, w: number, h: number): number {
  const lines = text.split("\n");
  const widestWords = Math.max(
    ...lines.map((l) => l.trim().split(/\s+/).length),
  );
  const byWidth = (w - PAD_X) / (AR_EM * AR_WORD_EM * widestWords);
  const byHeight = (h - PAD_Y) / (AR_EM * LINE_EM * lines.length);
  return Math.min(byWidth, byHeight, AR_SCALE_CAP);
}

/** The same for a translation: Latin runs to the CHARACTER, not the word. */
const LAT_EM = 0.071;
const LAT_CHAR_EM = 0.36;

function fitLatinScale(text: string, w: number, h: number): number {
  const lines = text.split("\n");
  const widest = Math.max(...lines.map((l) => l.trim().length));
  const byWidth = (w - PAD_X) / (LAT_EM * LAT_CHAR_EM * widest);
  const byHeight = (h - 0.012) / (LAT_EM * 1.06 * lines.length);
  return Math.min(byWidth, byHeight, 0.9);
}

const LAT_LINE_EM = 1.06;

/**
 * How much of a domed capsule's width its text can actually reach. VerseBox
 * centres the text in the BOX, but a dome is only box-wide at the flat edge —
 * above that the arch (an ellipse of vertical radius `archH`) closes in, so
 * what binds is the ellipse's half-width at the far edge of the text block.
 */
function domeWidthFactor(h: number, textH: number, sideRatio: number): number {
  const archH = (1 - sideRatio) * h;
  // Height of the text's far edge above the arch's own centre line, as a
  // fraction of the arch. Negative ⇒ the text never leaves the straight wall.
  const reach = Math.max(
    0,
    Math.min(0.99, (h * (0.5 - sideRatio) + textH / 2) / archH),
  );
  return Math.sqrt(1 - reach * reach);
}

/**
 * `fit`, run against the width the dome leaves rather than the capsule's own.
 * The width depends on how tall the text sets, which depends on the width —
 * two passes off the flat-capsule answer settle it.
 *
 * The HEIGHT bound is deliberately the flat capsule's, not the domed one's:
 * `DOME_EXTRA_H` is clearance for the arch, not licence for bigger type. Fit to
 * the full height and a short domed phrase sets half again as large as the
 * rectangle under it, which is exactly what a page of even capsules must not do.
 */
function fitInDome(
  fit: (text: string, w: number, h: number) => number,
  text: string,
  w: number,
  h: number,
  lineH: number,
): number {
  const fitH = h - DOME_EXTRA_H;
  const lines = text.split("\n").length;
  let scale = fit(text, w, fitH);
  for (let i = 0; i < 2; i++) {
    const textH = lineH * lines * scale;
    scale = fit(text, w * domeWidthFactor(h, textH, DOME_SIDE_RATIO), fitH);
  }
  return scale;
}

const isSplit = (row: SheetRow): row is SplitRow =>
  (row as SplitRow).right !== undefined;

const isPair = (row: SheetRow | ColumnItem): row is PairRow =>
  (row as PairRow).pair !== undefined;

/**
 * Every capsule an item carries — one, or the two halves of a pair, IN THE
 * ORDER THE ENGINE PLACES THEM, which is left to right: `SurahConfig`'s
 * two-column path reads `colIndex = i % cols` and puts index 0 on the LEFT
 * (see its "left = index 0, right = index 1"). A `pair` is declared the way the
 * page reads — right first — so it is flipped here, once, and everything
 * downstream (ids, blocks, colorGroups, overrides) stays in step.
 */
const capsulesOf = (item: SheetRow | ColumnItem): CapsuleSpec[] =>
  isPair(item)
    ? [item.pair[1], item.pair[0]]
    : isSplit(item)
      ? []
      : [item];

/** Does this row/column item carry a domed capsule? */
const isDomed = (item: SheetRow | ColumnItem) =>
  capsulesOf(item).some((c) => c.shape !== undefined);

/** Air between two items stacked one under the other. */
const airBetween = (above: SheetRow | ColumnItem, below: SheetRow | ColumnItem) =>
  ("gapAfter" in above && typeof above.gapAfter === "number"
    ? above.gapAfter
    : capsulesOf(above)[0]?.gapAfter) ??
  (isDomed(above) || isDomed(below) ? DOME_ROW_AIR : ROW_AIR);

const capsuleHeight = (item: CapsuleSpec | ColumnItem) =>
  Math.max(
    ...capsulesOf(item).map(
      (c) =>
        CAPSULE_H_BASE +
        CAPSULE_H_PER_LINE * (c.heightLines ?? c.ar.split("\n").length) +
        (c.shape ? DOME_EXTRA_H : 0),
    ),
  );

// ---------------------------------------------------------------------------
// buildSheet
// ---------------------------------------------------------------------------

/** One capsule, solved: where it sits and how big it is, in sheet-local space. */
interface Placement {
  /** One capsule, or the two halves of a bridged pair. */
  capsules: CapsuleSpec[];
  verseIds: number[];
  /** Top edge of the capsule's BLOCK frame (y = 0 at the stack's top). */
  top: number;
  height: number;
  width: number;
  /** Optional horizontal gap for a bridged pair. */
  columnGap?: number;
  /** Signed shift of this block's centre from the page centre. */
  xOffset: number;
  rowIndex: number;
  /** Which column of a split row this capsule sits in. */
  side?: "right" | "left";
}

export function buildSheet(spec: SheetSpec): BuiltSheet {
  const paperWidth = spec.paperWidth ?? 1.54;
  const capsuleWidthScale = spec.capsuleWidthScale ?? 1;
  const capsuleHeightScale = spec.capsuleHeightScale ?? 1;
  const sectionInnerW = paperWidth - PADDING * 2 - SECTION_PAD_X * 2;

  const { rows, frames } = spec;

  /** Frames covering a row, and therefore how narrow that row is drawn. */
  const depth = rows.map(
    (_, i) => frames.filter((f) => i >= f.from && i <= f.to).length,
  );

  /**
   * Does g strictly enclose f? Its rows have to cover f's and it must not be
   * confined to the other column — strictly, i.e. looser somewhere: more rows,
   * or the whole row where f takes one column of it.
   */
  const encloses = (g: FrameSpec, f: FrameSpec) => {
    if (g.from > f.from || g.to < f.to) return false;
    if (g.side && g.side !== f.side) return false;
    return g.to - g.from > f.to - f.from || (!g.side && !!f.side);
  };

  /**
   * A frame's OWN nesting level: 1 for the sheet's outermost, +1 for each
   * frame that encloses it. Not the depth of the row it starts at — an outer
   * frame usually starts on a row that an inner frame also covers, and sizing
   * it off that row would draw the two the same width.
   */
  const frameDepth = frames.map(
    (f, i) => 1 + frames.filter((g, j) => j !== i && encloses(g, f)).length,
  );

  /** A row's full usable width at its nesting depth. */
  const rowWidth = (i: number) =>
    sectionInnerW -
    2 * (DEPTH_1_INSET + Math.max(0, depth[i] - 1) * DEPTH_STEP);

  /** A frame's own vertical padding — its `pad`, or its nesting level's. */
  const padOf = (fi: number) => frames[fi].pad ?? framePadY(frameDepth[fi]);

  /** Height of a stack of capsules, one under the other. */
  const stackHeight = (caps: ColumnItem[]) =>
    caps.reduce(
      (sum, c, i) =>
        sum +
        capsuleHeight(c) * capsuleHeightScale +
        BLOCK_PADDING * 2 +
        (i ? airBetween(caps[i - 1], c) : 0),
      0,
    );

  const rowHeight = (i: number) => {
    const row = rows[i];
    if (!isSplit(row)) return capsuleHeight(row) * capsuleHeightScale + BLOCK_PADDING * 2;
    return Math.max(stackHeight(row.right), stackHeight(row.left));
  };

  /** Air above row i: one rim's worth for every frame edge crossing here. */
  const gapAbove = (i: number) => {
    if (i === 0) return 0;
    let gap = airBetween(rows[i - 1], rows[i]);
    frames.forEach((f, fi) => {
      if (f.to === i - 1 || f.from === i) {
        // RIM_AIR is clearance for a rim to pass. A `none` frame has no rim.
        gap += padOf(fi) + (f.tone === "none" ? 0 : RIM_AIR);
      }
    });
    return gap;
  };

  // ── Pass 1: every capsule's place, in sheet-local coordinates ───────────
  const placements: Placement[] = [];
  const rowTop: number[] = [];
  let nextId = 1;
  let cursor = 0;

  rows.forEach((row, i) => {
    cursor -= gapAbove(i);
    const stackTop = cursor;
    const top =
      stackTop +
      ("offsetY" in row && typeof row.offsetY === "number" ? row.offsetY : 0);
    rowTop.push(top);
    const width = rowWidth(i);

    if (!isSplit(row)) {
      placements.push({
        capsules: capsulesOf(row),
        verseIds: capsulesOf(row).map(() => nextId++),
        top,
        height: capsuleHeight(row) * capsuleHeightScale,
        width: width * (row.width ?? 1) * capsuleWidthScale,
        xOffset: 0,
        rowIndex: i,
      });
    } else {
      const ratio = row.ratio ?? 0.5;
      const inner = width - COLUMN_GAP;
      const rightSlotW = inner * ratio;
      const leftSlotW = inner - rightSlotW;
      const rightW = rightSlotW * capsuleWidthScale;
      const leftW = leftSlotW * capsuleWidthScale;
      // Both columns keep their outer edge on the row's own edge, so the pair
      // reads as one band split in two rather than two centred stacks.
      const rightShift = width / 2 - rightSlotW / 2;
      const leftShift = -(width / 2 - leftSlotW / 2);
      const inwardShift = row.inwardShift ?? 0;

      const column = (
        caps: ColumnItem[],
        w: number,
        shift: number,
        side: "right" | "left",
      ) => {
        let y = top;
        caps.forEach((c, ci) => {
          if (ci) y -= airBetween(caps[ci - 1], c);
          const itemOffsetY =
            "offsetY" in c && typeof c.offsetY === "number" ? c.offsetY : 0;
          placements.push({
            capsules: capsulesOf(c),
            verseIds: capsulesOf(c).map(() => nextId++),
            top: y + itemOffsetY,
            height: capsuleHeight(c) * capsuleHeightScale,
            // A split-column item's OWN `width` is a share of the natural slot,
            // so undo the sheet-wide capsule scale baked into `w` before
            // applying it: `width: 0.95` means 95% of the slot, not 95% of the
            // already-scaled capsule. An item that declares no width keeps `w`
            // untouched — the scaled slot, same as every unsplit row gets.
            // Dividing that default through the scale too widens every column
            // capsule by 1/scale and runs the columns into each other.
            width: c.width === undefined ? w : (w / capsuleWidthScale) * c.width,
            columnGap: isPair(c) ? c.columnGap : undefined,
            xOffset: shift,
            rowIndex: i,
            side,
          });
          y -= capsuleHeight(c) * capsuleHeightScale + BLOCK_PADDING * 2;
        });
      };
      // Right first: it reads first, so it takes the lower verse ids and the
      // earlier colorGroups, which is the order the sidebar reads them in.
      column(row.right, rightW, rightShift - inwardShift, "right");
      column(row.left, leftW, leftShift + inwardShift, "left");
    }

    // A row offset is visual only: later rows keep their original positions.
    cursor = stackTop - rowHeight(i);
  });

  const stackH = -cursor;
  const contentStartY = spec.contentStartY ?? -SHEET_MARGIN_TOP;
  const paperHeight =
    Math.round((-contentStartY + stackH + SHEET_MARGIN_BOTTOM) * 1000) / 1000;

  // ── Pass 2: blocks, with the gap chain that reproduces those places ─────
  // Same arithmetic the paper composer uses: state where a block should be,
  // then say how far that is from where the previous one ended. Negative
  // wherever a left column jumps back up to its right column's top edge.
  const blocks: LayoutBlock[] = placements.map((p, i) => {
    // Invert the engine's colW = (blockInnerW − 2·pad − columnGap) / 2. A pair
    // splits the SAME width between its two capsules, so its block is only as
    // wide as the slot; a single capsule's block is twice its own width,
    // because the engine always reserves two columns and centres one of them.
    const pair = p.capsules.length === 2;
    const blockInnerW = pair
      ? p.width + BLOCK_PADDING * 2
      : p.width * 2 + BLOCK_PADDING * 2 + COLUMN_GAP;
    const prev = placements[i - 1];
    const gapBefore = prev
      ? prev.top - (prev.height + BLOCK_PADDING * 2) - p.top
      : undefined;
    return {
      id: `${spec.key}_c${p.verseIds[0]}`,
      type: "group",
      verseIds: p.verseIds,
      columns: pair ? 2 : 1,
      capsuleHeight: p.height,
      ...(p.columnGap !== undefined ? { columnGap: p.columnGap } : {}),
      horizontalInset: round((sectionInnerW - blockInnerW) / 2),
      xOffset: round(p.xOffset),
      isCenter: true,
      dragBehavior: pair ? "group" : "individual",
      // A pair KEEPS its connector — that bar is the whole reason to pair.
      hideRowConnectors: !pair,
      ...(gapBefore !== undefined ? { gapBefore: round(gapBefore) } : {}),
    };
  });

  // ── Verse overrides ─────────────────────────────────────────────────────
  const verseOverrides: Record<number, VerseOverrideConfig> = {};
  for (const p of placements) {
   const capW =
     p.capsules.length === 2 ? (p.width - COLUMN_GAP) / 2 : p.width;
   p.capsules.forEach((c, ci) => {
    const capsuleScale = c.scale ?? 1;
    const expandW =
      (c.expandW ?? 0) + (capW * (capsuleScale - 1)) / 2;
    const expandH = (p.height * (capsuleScale - 1)) / 2;
    const tone = SHEET_COLORS[c.tone ?? "white"];
    // Per capsule, then per sheet, then the whole surah — see `CapsuleSpec.arPad`.
    const arPad = c.arPad ?? spec.capsuleArPad ?? AR_PAD;
    const latPad = c.latPad ?? spec.capsuleLatPad ?? LAT_PAD;
    // The FIT is given the padded width, not the capsule's: the air the padding
    // opens is not room the fallback fit may spend on bigger text, or a capsule
    // sized by it would wrap the moment its padding went up.
    const arW = capW - arPad * 2;
    const latW = capW - latPad * 2;
    // A dome's text is bounded by the arch, not by the capsule's own width.
    const fitAr = (t: string) =>
      c.shape
        ? fitInDome(fitArabicScale, t, arW, p.height, AR_EM * LINE_EM)
        : fitArabicScale(t, arW, p.height);
    const fitLat = (t: string) =>
      c.shape
        ? fitInDome(fitLatinScale, t, latW, p.height, LAT_EM * LAT_LINE_EM)
        : fitLatinScale(t, latW, p.height);
    verseOverrides[p.verseIds[ci]] = {
      bg: tone.bg,
      border: tone.border,
      circleBg: tone.bg,
      circleBorderCol: tone.border,
      circleTextCol: tone.ink,
      textColor: tone.ink,
      // Every capsule on every sheet of this surah is a rounded rectangle,
      // never a pill: SharedUI picks the verse font off this flag, so a mixed
      // page would be set in two sizes almost 2x apart.
      isPill: false,
      textScaleOverride: round(
        (c.arScale ?? fitAr(c.ar)) * capsuleScale,
      ),
      translationTextScaleOverride: round(
        (c.latScale ?? Math.min(fitLat(c.tr), fitLat(c.en))) * capsuleScale,
      ),
      // Only emitted where it is asked for: a zero entry would be identical in
      // effect but would put the number on every capsule of every sheet.
      ...(arPad ? { versePadding: arPad } : {}),
      ...(latPad ? { translationPadding: latPad } : {}),
      ...(c.shape
        ? { verseShape: c.shape, domeSideRatio: DOME_SIDE_RATIO }
        : {}),
      ...(expandW ? { expandW: round(expandW) } : {}),
      ...(expandH ? { expandH: round(expandH) } : {}),
      ...(c.noNumber ? {} : { showNumber: true, displayNumber: c.ayah }),
    };
   });
  }

  // ── Frames ──────────────────────────────────────────────────────────────
  const rowBottom = (i: number) => rowTop[i] - rowHeight(i);
  /** First block of a row — what its frames anchor to. */
  const firstBlockOfRow = (i: number) =>
    placements.findIndex((p) => p.rowIndex === i);

  /** Capsule width at a nesting level — what a frame at that level wraps. */
  const widthAtDepth = (d: number) =>
    sectionInnerW - 2 * (DEPTH_1_INSET + Math.max(0, d - 1) * DEPTH_STEP);

  /**
   * The capsules a frame actually owns — every capsule in its rows, or just
   * the one column of them that `side` names.
   */
  const ownedBy = (f: FrameSpec) =>
    placements.filter(
      (p) =>
        p.rowIndex >= f.from &&
        p.rowIndex <= f.to &&
        (!f.side || p.side === f.side),
    );

  const frameRects = frames.map((f, fi) => {
    const d = frameDepth[fi];
    const pad = padOf(fi);

    // A one-column frame is measured off the capsules in that column alone —
    // its own width and its own centre line. That is what lets a rosette give
    // each ayah its own petal when two of them sit side by side in one row.
    const owned = ownedBy(f);
    // EVERY frame takes the row band it covers, top and bottom — a one-column
    // frame included. That is what makes the two columns of a split row come
    // out the same height however unevenly they are filled, and two boxes of
    // different heights do not read as two things weighed against each other.
    const top = rowTop[f.from] + pad;
    const bottom = rowBottom(f.to) - pad;
    const anchor = f.side
      ? placements.indexOf(owned[0])
      : firstBlockOfRow(f.from);
    return {
      src: f.src ?? `/${spec.key}/frame-${fi}.svg`,
      /** Only an emitted frame needs drawing; a borrowed one is already drawn. */
      emit: f.src === undefined && f.tone !== "none",
      tone: f.tone,
      // Measured off the capsules the frame actually owns — their horizontal
      // EXTENT, not the nesting level's nominal width. A row may take only a
      // share of its width (`CapsuleSpec.width`) and a split row's columns sit
      // off-centre, so only the extent gets both the narrow petal and the
      // circle that has to reach around two of them right.
      w: f.w ?? round(
        Math.max(...owned.map((p) => p.xOffset + p.width / 2)) -
          Math.min(...owned.map((p) => p.xOffset - p.width / 2)) +
          framePadX(d) * 2,
      ),
      h: f.h ?? round(top - bottom),
      offsetX: round(
        (Math.max(...owned.map((p) => p.xOffset + p.width / 2)) +
          Math.min(...owned.map((p) => p.xOffset - p.width / 2))) /
          2,
      ),
      // Overlays anchor to their block's TOP edge, so this is the drop from
      // that edge to the frame's centre.
      offsetY: f.offsetY ?? round((top + bottom) / 2 - placements[anchor].top),
      anchor,
    };
  });

  // A `none` frame contributes no overlay — it has already done its work above,
  // in the widths, the air and the rectangles, and its zone is declared with
  // the others below.
  const svgOverlays: SvgOverlayItem[] = frameRects.flatMap((r, fi) =>
    r.tone === "none"
      ? []
      : [
          {
            src: r.src,
            anchorGroupIndex: r.anchor,
            anchorEdge: "top" as const,
            scaleX: r.w,
            scaleY: r.h,
            offsetX: r.offsetX,
            offsetY: r.offsetY,
            // Innermost paints last: each frame paints over the middle of the
            // one below it, and that overpainting is what makes the nesting
            // read.
            renderOrder: 2 + frameDepth[fi],
            customSectionId: `${spec.key}_f${fi}`,
          },
        ],
  );

  // Innermost FIRST — sectionResolver's reverse index is first-wins, so a
  // capsule lands in the tightest frame around it while the outer frames still
  // carry it along through the ancestor index. A zone owns exactly what its
  // frame is DRAWN around, `side` and `items` included: click the bracket on
  // one column of a split row and that column is what lifts, not the row.
  const customSections: CustomSectionDef[] = frames
    .map((f, fi) => ({ f, fi, size: ownedBy(f).length }))
    .sort((a, b) => a.size - b.size)
    .map(({ f, fi, size }) => ({
      id: `${spec.key}_f${fi}`,
      verseIds: ownedBy(f).flatMap((p) => p.verseIds),
      cameraTarget: {
        y: 1.0 + Math.min(size, 9) * 0.035,
        fov: 25 + Math.min(size, 9) * 1.1,
        tilt: -1.4,
      },
    }));

  // ── Text tables ─────────────────────────────────────────────────────────
  // One colorGroup per block, in block order — the alignment BlockRenderer
  // relies on (`colorGroups[i]` addresses the i-th group it draws).
  const colorGroups = (lang: SurahLanguage): ColorGroup[] =>
    placements.map((p) => ({
      verses: p.capsules.map((c, ci) => ({
        number: p.verseIds[ci],
        text: lang === "ar" ? c.ar : lang === "tr" ? c.tr : c.en,
      })),
    }));

  const textFor = (lang: SurahLanguage): SurahDataShape => ({
    bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
    section2: {
      topLabel: "",
      introVerse: { number: 0, text: "" },
      colorGroups: colorGroups(lang),
      outroVerse: { number: 0, text: "" },
      bottomLabel: "",
    },
  });

  const allIds = placements.flatMap((p) => p.verseIds);

  const config: SurahLayoutConfig = {
    id: spec.id,
    title: spec.title,
    heroTitle: "Yâsîn",
    heroSubtitle: spec.heroSubtitle,

    scriptInfo: { title: "36 Yâ-Sîn", sayfa: spec.sayfa, juz: 22, hizb: 44 },
    scriptHighlights: { "pre-start": allIds.slice(0, 2), end: allIds },

    features: {
      hasIntro: false,
      hasElevatedSections: true,
      hasPopUps: false,
      hideVerseNumbers: true,
    },

    dimensions: {
      paperWidth,
      paperHeight,
      // The stack is pinned by `contentStartYOverride` below, so the auto
      // centring this feeds never runs.
      sceneCenterYOffset: 0,
      padding: PADDING,
      scrollPages: 3,
      fixedWidthAcrossLanguages: true,
    },

    specialVerses: {},
    verseOverrides,

    handwrittenNotes: yasinHandwrittenTitle(
      paperWidth,
      spec.title.replace(/^YÂSÎN:\s*/, ""),
    ),

    styling: SHEET_STYLING,

    globalSettings: {
      capsuleHeight: 0.12,
      columnGap: COLUMN_GAP,
      rowGap: ROW_GAP,
      blockGap: ROW_AIR,
      sectionPadX: SECTION_PAD_X,
      blockPadding: BLOCK_PADDING,
      sectionBorderWidth: 0.006,
      tightVersePadding: true,
      // Pins the stack under the top margin, where the frame rectangles above
      // were solved. Auto-centring would drift the moment a sheet's margins
      // are not symmetric — and the title note lives in the top one.
      contentStartYOverride: spec.contentStartY ?? -SHEET_MARGIN_TOP,
    },

    blocks,
    customSections,
    svgOverlays,

    animations: {
      foldSteps: [
        { id: "pre-start", folds: [{ direction: 1, angleFactor: 0 }] },
        { id: "end", folds: [{ direction: 1, angleFactor: 0 }] },
      ],
      computeFoldYPositions: () => [-paperHeight / 2],
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

  return {
    config,
    textData: { ar: textFor("ar"), en: textFor("en"), tr: textFor("tr") },
    // The emitter is only told about frames whose art this kit owns: a `none`
    // frame draws nothing, and a frame with its own `src` is already drawn.
    frames: frameRects.flatMap(({ src, tone, w, h, emit }) =>
      emit && tone !== "none" ? [{ src, tone, w, h }] : [],
    ),
    paperWidth,
    paperHeight,
  };
}

function round(v: number): number {
  return Math.round(v * 10000) / 10000;
}
