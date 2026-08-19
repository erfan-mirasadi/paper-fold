/**
 * YÂSÎN — TEK LEVHA. Every sheet of the surah on ONE piece of paper.
 *
 * This file is only the ARRANGEMENT: which sheet goes where. The sheets
 * themselves live one per ayah range in `./sheets`, and each one can be edited
 * on its own without touching anything here. `./grid` turns the addresses
 * below into world positions, and `paperComposer` translates every sheet onto
 * the one page.
 *
 *      { at: [1, 4], key: "s2027", sheet: S_20_27 }
 *           │   └── columns of COL_UNIT (0.3), counted from the RIGHT edge
 *           └────── row
 *
 * Columns run right to left, like the surah. A sheet's RIGHT edge lands on its
 * column line and the sheet grows leftwards from there, so the sheet that
 * reads first sits at `col: 0` and each one after it has a bigger `col`.
 *
 * TO MOVE A SHEET, change its `col` (or `row`). Nothing else moves — that is
 * the whole point of the grid, and the reason the old row-chain was thrown
 * away. To make one smaller, give it a `scale`. To make everything smaller,
 * give the grid a `scale`.
 *
 * THE COLUMN NUMBERS BELOW are spaced so neighbouring sheets overlap by about
 * 0.26 of a world unit: a sheet carries 0.2 of blank margin on each side, so
 * pages that just touch would leave half a unit of daylight between what is
 * actually drawn. The papers on the study floor overlap; these do too.
 */

import { composePaper } from "../../sheets/paperComposer";
import type {
  ComposableSheet,
  PaperDecoration,
} from "../../sheets/paperComposer";
import { layOutGrid, type GridCell } from "./grid";

import { YASIN_36_CONFIG, YASIN_36_TEXT_DATA } from "./sheets/1-12";
import { YASIN_13_19_CONFIG, YASIN_13_19_TEXT_DATA } from "./sheets/13-19";
import { SHEET as S_20_27 } from "./sheets/20-27";
import { SHEET as S_28_32 } from "./sheets/28-32";
import { SHEET as S_33_40 } from "./sheets/33-40";
import { SHEET as S_41_47 } from "./sheets/41-47";
import { SHEET as S_48_52 } from "./sheets/48-52";
import { SHEET as S_53_68 } from "./sheets/53-68";
import { SHEET as S_69_82 } from "./sheets/69-82";
import { SHEET as S_83 } from "./sheets/83";

/** The two hand-drawn sheets, wrapped the way the generated ones already are. */
const S_1_12: ComposableSheet = {
  config: YASIN_36_CONFIG,
  textData: YASIN_36_TEXT_DATA,
};
const S_13_19: ComposableSheet = {
  config: YASIN_13_19_CONFIG,
  textData: YASIN_13_19_TEXT_DATA,
};

// ---------------------------------------------------------------------------
// The arrangement
// ---------------------------------------------------------------------------

// 37-40 has no sheet of its own: those four ayahs live inside the 33-40
// rosette, under the four petals the handwritten page draws there. The sheet in
// the far-left corner of that row is 41-47 (see the photo it was copied from).
const CELLS: GridCell[] = [
  // Row 0 — the opening, alone and centred across the top of the sheet.
  {
    at: [0, 0],
    align: "center",
    key: "s0112",
    sheet: S_1_12,
    // Keep the opening twelve ayahs proportional, but give the whole sheet
    // a little more presence than the surrounding Yâsîn sheets.
    scale: 1.25,
    // The first capsule sits close to the sheet's top edge. Give this sheet
    // a little extra vertical air so ayah 1 is never cropped during zoom.
    zoom: { padY: 0.14 },
  },

  // Row 1 — the parable of the town and the signs that follow it, right to left.
  { at: [1, 0], key: "s1319", sheet: S_13_19, shiftY: 0.115, shiftX: 0.35 },
  { at: [1, 4], key: "s2027", sheet: S_20_27, shiftX: 0.1, shiftY: 0.028 },
  { at: [1, 8], key: "s3340", sheet: S_33_40, shiftX: -0.45, shiftY: 0.03 },
  { at: [1, 13], key: "s4147", sheet: S_41_47, shiftX: -0.35, shiftY: -0.075 },

  // Row 2 — the one shout and "when is this promise?", side by side: 28-32
  // takes the right half, 48-54 the left, which is the two-sheet band the
  // handwritten page has here.
  {
    at: [2, 0],
    align: "rightHalf",
    key: "s2832",
    sheet: S_28_32,
    shiftX: 0.1,
    shiftY: 0.2,
  },
  {
    at: [2, 0],
    align: "leftHalf",
    key: "s4852",
    sheet: S_48_52,
    shiftX: -0.2,
    shiftY: 0.05,
  },

  // Row 3 — the two big two-column sheets.
  { at: [3, 0], key: "s5368", sheet: S_53_68, shiftY: 0.03, shiftX: 0.15 },
  { at: [3, 9], key: "s6982", sheet: S_69_82, shiftY: 0.04, shiftX: -0.2 },

  // Row 4 — the closing glorification, alone and centred at the foot.
  // It sits 0.12 lower than the rest of the arrangement would put it, because
  // the BODY frame's bottom edge has to pass between it and the 69-82 sheet
  // (see DECOS): those two were 0.066 apart, and a frame rim plus the air on
  // either side of it does not fit in that. `PAPER_BOTTOM_MARGIN` gives the
  // paper the extra length this needs.
  { at: [4, 0], align: "center", key: "s83", sheet: S_83, shiftY: -0.04 },
];

/**
 * Zoom for the whole paper. Every sheet AND every gap between them scales by
 * this, so the arrangement above is untouched — the same drawing, bigger.
 * Turn this one number up or down; nothing else has to move.
 */
const SCALE = 1.1;

const { placements, paperWidth, paperHeight } = layOutGrid({
  cells: CELLS,
  gapY: -0.08,
  margin: 0.02,
  scale: SCALE,
});

/**
 * Give the atlas a little more horizontal breathing room without stretching
 * any of the authored sheets. The placements move with the new page centre,
 * so the extra paper is shared evenly by both sides.
 *
 * It went from 1.1 to 1.14 when the frames arrived: the body frame reaches
 * further out than any sheet does, and at 1.1 its rim ran within a rounding
 * error of the paper's right edge.
 */
const PAPER_WIDTH_SCALE = 1.14;
const widerPaperWidth = paperWidth * PAPER_WIDTH_SCALE;

/**
 * Extra paper below the last row. `layOutGrid` ends the page exactly where the
 * bottom row's sheet ends, and ayah 83 was pushed 0.12 further down to make
 * room for the body frame's bottom edge — this keeps the blank margin under it
 * the same as it was before the frames arrived.
 */
const PAPER_BOTTOM_MARGIN = 0.15;
const tallerPaperHeight = paperHeight + PAPER_BOTTOM_MARGIN;
const horizontalExpansion = (widerPaperWidth - paperWidth) / 2;
const centeredPlacements = placements.map((placement) => ({
  ...placement,
  x: placement.x + horizontalExpansion,
}));

/**
 * The atlas camera frames the clicked sheet by its page rectangle. A small
 * upward shift of that rectangle leaves the sheet a little lower in the
 * viewport, which matches the visual balance of the elevated sections.
 * Keep this here so every Yâsîn sheet gets the same correction.
 */
const SECTION_ZOOM_DY = -0.06;

const zoomedPlacements = centeredPlacements.map((placement) => ({
  ...placement,
  zoom: {
    ...placement.zoom,
    dy: (placement.zoom?.dy ?? 0) + SECTION_ZOOM_DY,
  },
}));

// ---------------------------------------------------------------------------
// THE FOUR FRAMES
//
// The surah, once ayah 12 has been read, is an argument in three moves, and the
// paper says so with four rectangles: one around the whole body of it, and one
// around each move inside that.
//
//   ┌─ BODY ────────────────────────────────────────────────────────────┐
//   │  ┌── 2. AÇIKLAMA ───────────┐   ┌── 1. AÇIKLAMA ───────────────┐  │
//   │  │  41-47 · 33-40           │   │  20-27 · 13-19               │  │
//   │  │        48-52             │   │        28-32                 │  │
//   │  └──────────────────────────┘   └──────────────────────────────┘  │
//   │  ┌── 3. + 4. AÇIKLAMA ─────────────────────────────────────────┐  │
//   │  │            69-82                    53-68                   │  │
//   │  └─────────────────────────────────────────────────────────────┘  │
//   └───────────────────────────────────────────────────────────────────┘
//
// Right to left, like the surah: 13 … 32 is twenty ayahs, 33 … 52 is the other
// twenty, and 53 … 82 is the two fifteens the plan page keeps apart but the
// atlas draws as one band. The MAIN VERSE (12) and its TWIN (83) are the only
// two things on the paper left outside — that is the claim, and it is why the
// body frame's edges are worth the trouble they cost.
//
// The natural centre of each frame is solved from `DRAWN` below — the extent
// each sheet's art actually covers, which is NOT its page rectangle. Its final
// size and position are then taken from the single edit-friendly settings block
// below. Changing a width grows/shrinks a frame equally from both sides.
//
// MOVING A SHEET INVALIDATES `DRAWN`. Change a `shiftX` / `shiftY` above and
// its row has to be re-measured. Ordinary visual tuning of these four borders,
// however, only needs the settings block below.
// ---------------------------------------------------------------------------

interface AtlasFrameSetting {
  /** SVG file under /public. */
  src: string;
  /** Final frame size. Width/height grow from the frame's centre. */
  width: number;
  height: number;
  /** Fine position adjustments. Positive X = right; positive Y = up. */
  moveX: number;
  moveY: number;
  order: number;
}

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ EDIT THE FOUR LARGE ATLAS BORDERS HERE                              │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * `width`  makes a border wider/narrower from both sides.
 * `height` makes it taller/shorter from top and bottom.
 * `moveX`  moves the whole border left (-) or right (+).
 * `moveY`  moves the whole border down (-) or up (+).
 *
 * All numbers are world units. Usually change them in steps of 0.05 or 0.10.
 */
const ATLAS_FRAME_SETTINGS = {
  // Top-right red border — ayahs 13 … 32
  acik1: {
    src: "/yasin-atlas/acik-1.svg",
    width: 3.25,
    height: 3,
    moveX: -0.04,
    moveY: -0.03,
    order: 2,
  },

  // Top-left red border — ayahs 33 … 52
  acik2: {
    src: "/yasin-atlas/acik-1.svg",
    width: 3.25,
    height: 3,
    moveX: -0.02,
    moveY: -0.03,
    order: 2,
  },

  // Bottom green border — ayahs 53 … 82
  acik34: {
    src: "/yasin-atlas/acik-34.svg",
    width: 6.65,
    height: 2.4884,
    moveX: -0.12,
    moveY: -0.03,
    order: 2,
  },

  // Gold border around all three borders above
  body: {
    src: "/yasin-atlas/body.svg",
    width: 6.8815,
    height: 5.73,
    moveX: -0.03,
    moveY: -0.03,
    order: 1,
  },
} satisfies Record<"acik1" | "acik2" | "acik34" | "body", AtlasFrameSetting>;

/** A drawn extent, as `{ left, right, top, bottom }` in paper coordinates. */
interface Extent {
  l: number;
  r: number;
  t: number;
  b: number;
}

const round = (v: number) => Math.round(v * 10000) / 10000;

/** The smallest extent holding all of these. */
const union = (...es: Extent[]): Extent => ({
  l: Math.min(...es.map((e) => e.l)),
  r: Math.max(...es.map((e) => e.r)),
  t: Math.max(...es.map((e) => e.t)),
  b: Math.min(...es.map((e) => e.b)),
});

/**
 * Centres one of the edit-friendly frame sizes above on its own fixed content
 * extent. Every frame starts from a raw DRAWN extent, so changing one frame's
 * size or movement can never move any of the other three.
 */
const frame = (setting: AtlasFrameSetting, e: Extent): PaperDecoration => {
  const centerX = (e.l + e.r) / 2 + horizontalExpansion;
  const centerY = (e.t + e.b) / 2;

  return {
    src: setting.src,
    x: round(centerX - setting.width / 2 + setting.moveX),
    y: round(centerY + setting.height / 2 + setting.moveY),
    w: setting.width,
    h: setting.height,
    order: setting.order,
  };
};

/**
 * What each sheet actually paints — see the table above. `l` and `r` are in the
 * GRID's own coordinates, the ones `layOutGrid` hands back, so that widening
 * the paper moves the frames with the sheets instead of leaving them behind:
 * `frame` adds `horizontalExpansion` the same way `centeredPlacements` does.
 */
const DRAWN: Record<string, Extent> = {
  s1319: { l: 5.0965, r: 6.2735, t: -2.7927, b: -4.4097 },
  s2027: { l: 3.41, r: 4.62, t: -2.8155, b: -4.4325 },
  s2832: { l: 4.059, r: 5.225, t: -4.5179, b: -5.6729 },
  s3340: { l: 1.64, r: 2.85, t: -2.788, b: -4.4105 },
  s4147: { l: 0.002, r: 1.212, t: -2.8145, b: -4.3655 },
  s4852: { l: 0.671, r: 2.453, t: -4.6658, b: -5.6888 },
  s5368: { l: 3.1515, r: 6.0225, t: -5.845, b: -8.155 },
  s6982: { l: 0.429, r: 2.805, t: -5.8749, b: -8.2234 },
};

// Each frame owns one immutable anchor extent. In particular, BODY_EXTENT is
// made from the sheets themselves—not from the three already-tuned borders—so
// moving an inner border does not pull the outer border along with it.
const ACIK_1_EXTENT = union(DRAWN.s1319, DRAWN.s2027, DRAWN.s2832);
const ACIK_2_EXTENT = union(DRAWN.s3340, DRAWN.s4147, DRAWN.s4852);
const ACIK_34_EXTENT = union(DRAWN.s5368, DRAWN.s6982);
const BODY_EXTENT = union(ACIK_1_EXTENT, ACIK_2_EXTENT, ACIK_34_EXTENT);

/** 1. açıklama — ayahs 13 … 32, on the right, where the reading starts. */
const ACIK_1 = frame(ATLAS_FRAME_SETTINGS.acik1, ACIK_1_EXTENT);
/** 2. açıklama — ayahs 33 … 52, the answering twenty, on the left. */
const ACIK_2 = frame(ATLAS_FRAME_SETTINGS.acik2, ACIK_2_EXTENT);
/** 3. and 4. açıklama — ayahs 53 … 82, fifteen and fifteen, in one band. */
const ACIK_34 = frame(ATLAS_FRAME_SETTINGS.acik34, ACIK_34_EXTENT);

const DECOS: PaperDecoration[] = [
  // The body is independently positioned and painted under everything.
  frame(ATLAS_FRAME_SETTINGS.body, BODY_EXTENT),
  ACIK_1,
  ACIK_2,
  ACIK_34,
];

/**
 * How much of the screen the paper fills, 0 → 1. This is the knob that makes
 * the paper look bigger or smaller — NOT `SCALE`, which grows the paper and
 * the camera together and so changes nothing you can see.
 *
 * 1 means the paper's height exactly fills the viewport; lower leaves air
 * around it.
 */
const FILL = 0.92;

/**
 * How far the camera sits back, as a multiple of the distance the app's fixed
 * camera uses for one 1.54 x 1.78 sheet (see cameraConfig).
 *
 * The page lies flat and is viewed from about 44 degrees up, so its height
 * foreshortens to ~0.71 of itself, and the camera shows ~1.93 world units of
 * height per unit of distance-scale. Height therefore sets the number on a
 * portrait paper — `h · 0.71 / 1.93` ≈ `h · 0.368` fills the screen exactly —
 * and width only takes over if the paper is wider than it is tall.
 */
const CAMERA_DISTANCE_SCALE =
  Math.max(widerPaperWidth / 3.38, tallerPaperHeight * 0.45) / FILL;

export const { config: YASIN_PAPER_CONFIG, textData: YASIN_PAPER_TEXT_DATA } =
  composePaper({
    id: "yasin",
    title: "YÂSÎN — TEK LEVHA",
    heroTitle: "Yâsîn",
    heroSubtitle: "tek levha",

    paperWidth: widerPaperWidth,
    paperHeight: tallerPaperHeight,
    sceneCenterYOffset: -0.15,
    cameraDistanceScale: CAMERA_DISTANCE_SCALE,
    hideBismillah3D: false,
    bismillah3DScale: 2.8,

    scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },

    sheets: zoomedPlacements,
    decorations: DECOS,
  });
