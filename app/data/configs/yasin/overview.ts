/**
 * YÂSÎN — THE PLAN. The shape of the whole surah on one sheet, before a single
 * ayah of it is read: how many ayahs each passage holds, which verse the whole
 * thing turns on, and how the four explanation sections answer each other.
 *
 *        ┌────────── 1. YÂSÎN ──────────┐
 *        │        4 ayet · 6 ayet       │       the opening
 *        ╞══ 12. ayet — ANA AYET ═══════╡       the verse it all turns on
 *        │ 7→8 · 5   │   8→7 · 5        │       1. and 2. açıklama, 20 each
 *        │ 2 · 4→4 · 5│  3 · 6→6        │       3. and 4. açıklama, 15 each
 *        └── 83. ayet — ANA AYETİN İKİZİ ┘      the twin of the main verse
 *
 *   4 + 6 + 1(12.) + 20 + 20 + 15 + 15 + 1(83.) = 83 ayahs.
 *
 * WHY THIS IS NOT A SHEET. Every other page of the surah comes out of `./kit`,
 * whose grammar is a STACK: rows one under the other, frames wrapping runs of
 * rows. That grammar is the reason the sheets are cheap to author, and it is
 * exactly the wrong shape for this page — a diagram is 2D, its boxes sit where
 * the argument puts them (a tag tucked into a panel's top-right corner, a
 * capsule reaching across the gutter), and expressing that as a stack would be
 * a fight with every line.
 *
 * So this page states positions OUTRIGHT: every box below carries its own
 * `x, y, w, h` in page coordinates (x rightwards from the left edge, y downwards
 * from the top as a negative number), and `toBlocks` re-expresses them as the
 * `gapBefore` / `horizontalInset` / `xOffset` chain the block engine actually
 * lays out — the same conversion `paperComposer` does for a composed atlas.
 * TO MOVE SOMETHING, change its numbers in `BOXES`. Nothing else moves.
 *
 * WHAT IS SHARED WITH THE SHEETS, so this reads as the same surah and not as a
 * slide someone pasted in: the ink box (`SHEET_COLORS`), the styling block
 * (`SHEET_STYLING` — rule widths, corner radii, elevated-section radii), and
 * the frame art's construction rule — every SVG under /public/yasin-overview is
 * drawn at the aspect it is displayed at, with the same gold rim gradient the
 * generated sheet frames carry.
 */

import { SHEET_COLORS, SHEET_STYLING, type Tone } from "./kit";
import type { SurahLanguage } from "../../../hooks/useSurahLanguageStore";
import type { ColorGroup, SurahDataShape } from "../../SurahConfig";
import type {
  CustomSectionDef,
  LayoutBlock,
  SurahLayoutConfig,
  SvgOverlayItem,
  VerseOverrideConfig,
  VerseTextHighlight,
} from "../../schema";

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

/** Landscape, at the proportion the study's own diagram is drawn at (~1.47:1). */
const PW = 3.3;
const PH = 2.24;

/** The sheets' own spacing constants — see `./kit`'s calibration table. */
const PADDING = 0.2;
const SECTION_PAD_X = 0.005;
const BLOCK_PADDING = 0.008;
const COLUMN_GAP = 0.02;

const SECTION_INNER_W = PW - PADDING * 2 - SECTION_PAD_X * 2;
const CENTER_X = PW / 2;

// ---------------------------------------------------------------------------
// Declaration
// ---------------------------------------------------------------------------

/**
 * One drawn box, placed outright on the page.
 *
 * `x` is its LEFT edge and `y` its TOP edge, both in page coordinates: x runs
 * 0 → PW rightwards, y runs 0 → −PH downwards. So a box at `{ x: 0.3, y: -0.9,
 * w: 0.52, h: 0.115 }` occupies x 0.30 … 0.82 and y −0.90 … −1.015.
 */
interface Box {
  /** Stable key. Names the block and, through it, the drag zone. */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  tr: string;
  en: string;
  /**
   * THE SIZE, SET BY HAND — the multiplier that REPLACES the language baseline
   * (SharedUI: `textScale = textScaleOverride ?? langScale.verseBig`), in units
   * of the 0.071 big-verse em. The kit's sheets fall back to a fitter when
   * these are absent; there is no fitter here, because every box on this page
   * holds two or three words whose size is a design decision, not an estimate.
   */
  arScale: number;
  /** The same, for the EN/TR text. */
  latScale: number;
  /** Recoloured stretches of the primary-language text — see `VerseOverrideConfig.textHighlights`. */
  hi?: VerseTextHighlight[];
  /** The same for EN and TR. Both languages' phrases go in one list; a phrase
   *  that is not in the language being drawn simply finds nothing. */
  hiLat?: VerseTextHighlight[];
}

/** A frame, an arrow or a wing: art laid on the page at a stated rectangle. */
interface Deco {
  /** Path under /public. */
  src: string;
  /** Left edge, top edge, and the size the art is stretched to. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Mirror horizontally — how one wing file serves both ends of a ribbon. */
  flip?: boolean;
  /** Higher paints later. Frames sit under the arrows that cross them. */
  order?: number;
}

/** A drag / elevation zone: the boxes that lift together, and what it frames. */
interface Zone {
  id: string;
  boxes: string[];
  /** The patch of page its zoom must show. Defaults to the boxes' own extent. */
  focus?: { x: number; y: number; w: number; h: number };
}

// ---------------------------------------------------------------------------
// THE DIAGRAM
//
// Read it top to bottom: the title, the opening's two runs boxed together, the
// main verse on its ribbon, the four explanation panels in two bands, and the
// closing verse. Every number is a world unit on the 3.30 x 2.24 page.
// ---------------------------------------------------------------------------

/** The two bands of panels. Both panels of a band share a top and a height. */
const BAND_20 = { top: -0.815, h: 0.485 };
const BAND_15 = { top: -1.375, h: 0.555 };
/** The left panel's left edge, the right panel's right edge, and their width. */
const PANEL_L = 0.24;
const PANEL_R = 3.06;
const PANEL_W = 1.31;

const BOXES: Box[] = [
  // ── The title ─────────────────────────────────────────────────────────────
  {
    id: "title",
    x: CENTER_X - 0.25,
    y: -0.1,
    w: 0.5,
    h: 0.11,
    tone: "gold",
    tr: "1. YÂSÎN",
    en: "1. YÂSÎN",
    arScale: 0.95,
    latScale: 1.2,
  },

  // ── The opening: 4 ayahs, then 6 ───────────────────────────────────────────
  {
    id: "open4",
    x: CENTER_X - 0.28,
    y: -0.275,
    w: 0.56,
    h: 0.11,
    tone: "maroon",
    tr: "4 ayet",
    en: "4 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "open6",
    x: CENTER_X - 0.28,
    y: -0.405,
    w: 0.56,
    h: 0.11,
    tone: "cream",
    tr: "6 ayet",
    en: "6 verses",
    arScale: 0.95,
    latScale: 1.1,
  },

  // ── The verse the surah turns on ──────────────────────────────────────────
  {
    id: "ana",
    x: CENTER_X - 0.67,
    y: -0.625,
    w: 1.34,
    h: 0.125,
    tone: "gold",
    // NO PUNCTUATION BETWEEN THE TWO PHRASES. The dash the Turkish uses is a
    // neutral character, and a neutral between two Arabic runs lands wherever
    // the bidi algorithm decides — which here is the far left, not the middle.
    // A copula says the same thing and cannot move: "verse 12 IS the main
    // verse".
    tr: "12. ayet — ANA AYET",
    en: "verse 12 — THE MAIN VERSE",
    arScale: 1.0,
    latScale: 1.05,
    hi: [{ text: "ANA AYET", color: SHEET_COLORS.maroon.ink }],
    hiLat: [
      { text: "ANA AYET", color: SHEET_COLORS.maroon.ink },
      { text: "THE MAIN VERSE", color: SHEET_COLORS.maroon.ink },
    ],
  },

  // ── 1. açıklama bölümü — 7 + 8 + 5 = 20 ───────────────────────────────────
  {
    id: "s1a",
    x: 0.3,
    y: -0.855,
    w: 0.48,
    h: 0.115,
    tone: "lav",
    tr: "7 ayet",
    en: "7 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s1b",
    x: 0.92,
    y: -0.85,
    w: 0.57,
    h: 0.125,
    tone: "lav",
    tr: "8 ayet",
    en: "8 verses",
    arScale: 1.0,
    latScale: 1.15,
  },
  {
    id: "s1c",
    x: 0.44,
    y: -1.05,
    w: 0.55,
    h: 0.115,
    tone: "green",
    tr: "5 ayet",
    en: "5 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s1tag",
    x: 1.07,
    y: -1.075,
    w: 0.4,
    h: 0.16,
    tone: "maroon",
    tr: "1. AÇIKLAMA BÖL.\nTOPLAM 20 AYET",
    en: "1st EXPLANATION\n20 VERSES IN ALL",
    arScale: 0.62,
    latScale: 0.56,
  },

  // ── 2. açıklama bölümü — 8 + 7 + 5 = 20 ───────────────────────────────────
  {
    id: "s2a",
    x: 1.81,
    y: -0.855,
    w: 0.48,
    h: 0.115,
    tone: "lav",
    tr: "8 ayet",
    en: "8 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s2b",
    x: 2.43,
    y: -0.85,
    w: 0.57,
    h: 0.125,
    tone: "lav",
    tr: "7 ayet",
    en: "7 verses",
    arScale: 1.0,
    latScale: 1.15,
  },
  {
    id: "s2tag",
    x: 1.82,
    y: -1.075,
    w: 0.4,
    h: 0.16,
    tone: "maroon",
    tr: "2. AÇIKLAMA BÖL.\nTOPLAM 20 AYET",
    en: "2nd EXPLANATION\n20 VERSES IN ALL",
    arScale: 0.62,
    latScale: 0.56,
  },
  {
    id: "s2c",
    x: 2.3,
    y: -1.05,
    w: 0.55,
    h: 0.115,
    tone: "green",
    tr: "5 ayet",
    en: "5 verses",
    arScale: 0.95,
    latScale: 1.1,
  },

  // ── 3. açıklama bölümü — 2 + 4 + 4 + 5 = 15 ───────────────────────────────
  {
    id: "s3a",
    x: 0.44,
    y: -1.415,
    w: 0.58,
    h: 0.11,
    tone: "green",
    tr: "2 ayet",
    en: "2 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s3b",
    x: 0.27,
    y: -1.585,
    w: 0.48,
    h: 0.115,
    tone: "lav",
    tr: "4 ayet",
    en: "4 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s3c",
    x: 0.89,
    y: -1.575,
    w: 0.58,
    h: 0.125,
    tone: "lav",
    tr: "4 ayet",
    en: "4 verses",
    arScale: 1.0,
    latScale: 1.15,
  },
  {
    id: "s3d",
    x: 0.44,
    y: -1.755,
    w: 0.6,
    h: 0.115,
    tone: "green",
    tr: "5 ayet",
    en: "5 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s3tag",
    x: 1.11,
    y: -1.415,
    w: 0.36,
    h: 0.15,
    tone: "maroon",
    tr: "3. AÇIKLAMA BÖL.\nTOPLAM 15 AYET",
    en: "3rd EXPLANATION\n15 VERSES IN ALL",
    arScale: 0.58,
    latScale: 0.51,
  },

  // ── 4. açıklama bölümü — 3 + 6 + 6 = 15 ───────────────────────────────────
  {
    id: "s4tag",
    x: 1.81,
    y: -1.415,
    w: 0.4,
    h: 0.17,
    tone: "maroon",
    tr: "4. AÇIKLAMA BÖL.\nTOPLAM 15 AYET",
    en: "4th EXPLANATION\n15 VERSES IN ALL",
    arScale: 0.62,
    latScale: 0.56,
  },
  {
    id: "s4a",
    x: 2.28,
    y: -1.415,
    w: 0.58,
    h: 0.11,
    tone: "green",
    tr: "3 ayet",
    en: "3 verses",
    arScale: 0.95,
    latScale: 1.1,
  },
  {
    id: "s4b",
    x: 1.84,
    y: -1.7,
    w: 0.49,
    h: 0.125,
    tone: "lav",
    tr: "6 ayet",
    en: "6 verses",
    arScale: 1.0,
    latScale: 1.15,
  },
  {
    id: "s4c",
    x: 2.47,
    y: -1.705,
    w: 0.54,
    h: 0.115,
    tone: "lav",
    tr: "6 ayet",
    en: "6 verses",
    arScale: 0.95,
    latScale: 1.1,
  },

  // ── The twin of the main verse ────────────────────────────────────────────
  {
    id: "ikiz",
    x: CENTER_X - 0.75,
    y: -2.0,
    w: 1.5,
    h: 0.125,
    tone: "gold",
    tr: "83. ayet — ANA AYETİN İKİZİ",
    en: "verse 83 — TWIN OF THE MAIN VERSE",
    arScale: 1.0,
    latScale: 0.95,
    hi: [{ text: "ANA AYETİN İKİZİ", color: SHEET_COLORS.maroon.ink }],
    hiLat: [
      { text: "ANA AYETİN İKİZİ", color: SHEET_COLORS.maroon.ink },
      { text: "TWIN OF THE MAIN VERSE", color: SHEET_COLORS.maroon.ink },
    ],
  },
];

// ---------------------------------------------------------------------------
// The art
//
// Sizes here are what each SVG is STRETCHED TO, and every file under
// /public/yasin-overview was drawn at exactly that aspect — change a rectangle
// below and the file has to be redrawn, or its rim goes uneven and its corners
// oval. Each file's own header states the aspect it holds.
// ---------------------------------------------------------------------------

/** The wings that turn the ANA AYET capsule into a ribbon, one file mirrored. */
const WING_W = 0.11;
const WING_H = 0.185;
/** How far a wing's base tucks UNDER the capsule, so no seam shows. */
const WING_BITE = 0.025;

const DECOS: Deco[] = [
  // The opening's two boxes: the pair inside one lid, both inside the ground.
  { src: "/yasin-overview/open-outer.svg", x: CENTER_X - 0.58, y: -0.235, w: 1.16, h: 0.33 },
  { src: "/yasin-overview/open-inner.svg", x: CENTER_X - 0.315, y: -0.255, w: 0.63, h: 0.28, order: 4 },

  // The four explanation panels.
  { src: "/yasin-overview/panel-20.svg", x: PANEL_L, y: BAND_20.top, w: PANEL_W, h: BAND_20.h },
  { src: "/yasin-overview/panel-20.svg", x: PANEL_R - PANEL_W, y: BAND_20.top, w: PANEL_W, h: BAND_20.h },
  { src: "/yasin-overview/panel-15.svg", x: PANEL_L, y: BAND_15.top, w: PANEL_W, h: BAND_15.h },
  { src: "/yasin-overview/panel-15.svg", x: PANEL_R - PANEL_W, y: BAND_15.top, w: PANEL_W, h: BAND_15.h },

  // The ribbon's two wings. The right one is the same file, mirrored.
  {
    src: "/yasin-overview/wing.svg",
    x: CENTER_X - 0.67 - WING_W + WING_BITE,
    y: -0.625 + (WING_H - 0.125) / 2,
    w: WING_W,
    h: WING_H,
    order: 4,
  },
  {
    src: "/yasin-overview/wing.svg",
    x: CENTER_X + 0.67 - WING_BITE,
    y: -0.625 + (WING_H - 0.125) / 2,
    w: WING_W,
    h: WING_H,
    flip: true,
    order: 4,
  },

  // The four short arrows inside the panels: one run of ayahs answering the
  // next. Each sits in the gutter its two capsules leave.
  { src: "/yasin-overview/arrow-green.svg", x: 0.795, y: -0.8875, w: 0.13, h: 0.05, order: 6 },
  { src: "/yasin-overview/arrow-green.svg", x: 2.305, y: -0.8875, w: 0.13, h: 0.05, order: 6 },
  { src: "/yasin-overview/arrow-green.svg", x: 0.765, y: -1.6175, w: 0.13, h: 0.05, order: 6 },
  { src: "/yasin-overview/arrow-green.svg", x: 2.345, y: -1.7375, w: 0.13, h: 0.05, order: 6 },

  // The two long arrows across the gutter: one whole section answering the
  // next. They cross both panels' rims, so they paint last.
  { src: "/yasin-overview/arrow-purple.svg", x: CENTER_X - 0.095, y: -1.0025, w: 0.19, h: 0.11, order: 6 },
  { src: "/yasin-overview/arrow-purple.svg", x: CENTER_X - 0.095, y: -1.5975, w: 0.19, h: 0.11, order: 6 },
];

// ---------------------------------------------------------------------------
// The zones — what lifts, and what the camera frames when it does
// ---------------------------------------------------------------------------

/** Air a panel's zoom keeps outside its own rectangle. */
const FOCUS_PAD = 0.06;

const ZONES: Zone[] = [
  { id: "title", boxes: ["title"] },
  {
    id: "open",
    boxes: ["open4", "open6"],
    focus: { x: CENTER_X - 0.58, y: -0.235, w: 1.16, h: 0.33 },
  },
  { id: "ana", boxes: ["ana"] },
  {
    id: "s1",
    boxes: ["s1a", "s1b", "s1c", "s1tag"],
    focus: { x: PANEL_L, y: BAND_20.top, w: PANEL_W, h: BAND_20.h },
  },
  {
    id: "s2",
    boxes: ["s2a", "s2b", "s2tag", "s2c"],
    focus: { x: PANEL_R - PANEL_W, y: BAND_20.top, w: PANEL_W, h: BAND_20.h },
  },
  {
    id: "s3",
    boxes: ["s3a", "s3b", "s3c", "s3d", "s3tag"],
    focus: { x: PANEL_L, y: BAND_15.top, w: PANEL_W, h: BAND_15.h },
  },
  {
    id: "s4",
    boxes: ["s4tag", "s4a", "s4b", "s4c"],
    focus: { x: PANEL_R - PANEL_W, y: BAND_15.top, w: PANEL_W, h: BAND_15.h },
  },
  { id: "ikiz", boxes: ["ikiz"] },
];

// ---------------------------------------------------------------------------
// Solving — absolute rectangles → the block engine's own vocabulary
// ---------------------------------------------------------------------------

const round = (v: number) => Math.round(v * 10000) / 10000;

/** Verse id per box, allocated in declaration order (which is reading order). */
const idOf = new Map(BOXES.map((b, i) => [b.id, i + 1]));

/**
 * The block frame's top edge for a box. A block reserves `blockPadding` above
 * and below its capsule row (`contentY = frameY − blockPadding`, see
 * `createBlockLayoutMath`), so a capsule asked to sit at `y` needs its frame
 * one padding higher.
 */
const frameTopOf = (b: Box) => b.y + BLOCK_PADDING;

/** Pins the stack where `BOXES` says it starts, instead of auto-centring it. */
const CONTENT_START_Y = frameTopOf(BOXES[0]);

const blocks: LayoutBlock[] = BOXES.map((b, i) => {
  // Invert the engine's one-column width: it always reserves TWO columns and
  // centres one of them, so `colW = (blockInnerW − 2·pad − columnGap) / 2`.
  const blockInnerW = b.w * 2 + BLOCK_PADDING * 2 + COLUMN_GAP;
  const prev = BOXES[i - 1];
  return {
    id: `ov_${b.id}`,
    type: "group",
    verseIds: [idOf.get(b.id)!],
    columns: 1,
    capsuleHeight: b.h,
    horizontalInset: round((SECTION_INNER_W - blockInnerW) / 2),
    // A block's centre is `pageCentre + xOffset`, whatever its inset.
    xOffset: round(b.x + b.w / 2 - CENTER_X),
    isCenter: true,
    dragBehavior: "individual",
    hideRowConnectors: true,
    // The chain: how far from the previous block's bottom edge to this one's
    // top. Negative wherever the diagram steps back UP the page — which is
    // every time it starts a new column of a panel.
    ...(prev
      ? {
          gapBefore: round(
            frameTopOf(prev) - (prev.h + BLOCK_PADDING * 2) - frameTopOf(b),
          ),
        }
      : {}),
  };
});

const verseOverrides: Record<number, VerseOverrideConfig> = {};
for (const b of BOXES) {
  const tone = SHEET_COLORS[b.tone];
  verseOverrides[idOf.get(b.id)!] = {
    bg: tone.bg,
    border: tone.border,
    textColor: tone.ink,
    // Every capsule of this surah is a rounded rectangle, never a pill —
    // SharedUI picks the verse font off this flag, and a mixed page would be
    // set in two sizes almost 2x apart.
    isPill: false,
    textScaleOverride: b.arScale,
    translationTextScaleOverride: b.latScale,
    ...(b.hi ? { textHighlights: b.hi } : {}),
    ...(b.hiLat ? { translationTextHighlights: b.hiLat } : {}),
  };
}

const svgOverlays: SvgOverlayItem[] = DECOS.map((d) => ({
  src: d.src,
  // Everything anchors to the FIRST block's top edge, which
  // `contentStartYOverride` pins to a known Y — so an overlay's offsets are
  // just its own rectangle, restated from the page's centre line.
  anchorGroupIndex: 0,
  anchorEdge: "top",
  scaleX: d.flip ? -d.w : d.w,
  scaleY: d.h,
  offsetX: round(d.x + d.w / 2 - CENTER_X),
  offsetY: round(d.y - d.h / 2 - CONTENT_START_Y),
  renderOrder: d.order ?? 3,
}));

const customSections: CustomSectionDef[] = ZONES.map((z) => {
  const boxes = z.boxes.map((id) => BOXES.find((b) => b.id === id)!);
  const focus = z.focus ?? {
    x: Math.min(...boxes.map((b) => b.x)),
    y: Math.max(...boxes.map((b) => b.y)),
    w:
      Math.max(...boxes.map((b) => b.x + b.w)) -
      Math.min(...boxes.map((b) => b.x)),
    h:
      Math.max(...boxes.map((b) => b.y)) -
      Math.min(...boxes.map((b) => b.y - b.h)),
  };
  return {
    id: `ov_${z.id}`,
    verseIds: z.boxes.map((id) => idOf.get(id)!),
    cameraFocus: {
      x: focus.x - FOCUS_PAD,
      y: focus.y + FOCUS_PAD,
      w: focus.w + FOCUS_PAD * 2,
      h: focus.h + FOCUS_PAD * 2,
    },
  };
});

// ---------------------------------------------------------------------------
// Text tables — one colorGroup per block, in block order
// ---------------------------------------------------------------------------

const colorGroups = (lang: SurahLanguage): ColorGroup[] =>
  BOXES.map((b) => ({
    verses: [
      {
        number: idOf.get(b.id)!,
        // This overview has no Arabic copy: Arabic and Turkish both use TR.
        text: lang === "en" ? b.en : b.tr,
      },
    ],
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

// ---------------------------------------------------------------------------
// The config
// ---------------------------------------------------------------------------

/**
 * How much of the screen the page fills, 0 → 1, and how far back the camera
 * must sit for it. Same solve as the atlas (see ./index): the page lies flat
 * under a ~44° camera, so its height foreshortens to ~0.71 and the camera shows
 * ~1.93 world units of height per unit of distance-scale.
 */
const FILL = 0.92;
const CAMERA_DISTANCE_SCALE = Math.max(PW / 3.38, PH * 0.45) / FILL;

const ALL_IDS = BOXES.map((b) => idOf.get(b.id)!);

export const YASIN_OVERVIEW_CONFIG: SurahLayoutConfig = {
  id: "yasinoverview",
  title: "YÂSÎN — SÛRENİN PLANI",
  heroTitle: "Yâsîn",
  heroSubtitle: "sûrenin planı",

  scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },
  scriptHighlights: { "pre-start": ALL_IDS.slice(0, 3), end: ALL_IDS },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    // No box on this page is an ayah, so none of them carries an ayah number.
    hideVerseNumbers: true,
    hideBismillah3D: true,
  },

  dimensions: {
    paperWidth: PW,
    paperHeight: PH,
    // The stack is pinned by `contentStartYOverride`, so the auto-centring this
    // feeds never runs.
    sceneCenterYOffset: 0,
    padding: PADDING,
    scrollPages: 3,
    // Load-bearing: every `xOffset` above was solved against this exact page
    // width, so the page must not widen when a translation is selected.
    fixedWidthAcrossLanguages: true,
    cameraDistanceScale: CAMERA_DISTANCE_SCALE,
  },

  styling: SHEET_STYLING,
  specialVerses: {},
  verseOverrides,

  globalSettings: {
    capsuleHeight: 0.11,
    columnGap: COLUMN_GAP,
    rowGap: 0.014,
    blockGap: 0.012,
    sectionPadX: SECTION_PAD_X,
    blockPadding: BLOCK_PADDING,
    sectionBorderWidth: 0.006,
    tightVersePadding: true,
    contentStartYOverride: CONTENT_START_Y,
  },

  blocks,
  customSections,
  svgOverlays,

  animations: {
    // Flat: a plan is a map to read, not a sheet to fold. The line still exists
    // so every consumer of `FOLD_Y_POSITIONS` has one to hold.
    foldSteps: [
      { id: "pre-start", folds: [{ direction: 1, angleFactor: 0 }] },
      { id: "end", folds: [{ direction: 1, angleFactor: 0 }] },
    ],
    computeFoldYPositions: () => [-PH / 2],
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

export const YASIN_OVERVIEW_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: textFor("ar"),
  en: textFor("en"),
  tr: textFor("tr"),
};
