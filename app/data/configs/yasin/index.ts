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
 * away. To make every section bigger, turn up `SECTION_SCALE`; to change the
 * page they sit on, `PAPER_WIDTH` / `PAPER_HEIGHT`. The two are independent
 * now, which they were not before, and the note on `PAPER_WIDTH` says why that
 * mattered so much.
 *
 * THE COLUMN NUMBERS BELOW are spaced so neighbouring sheets overlap by about
 * 0.26 of a world unit: a sheet carries 0.2 of blank margin on each side, so
 * pages that just touch would leave half a unit of daylight between what is
 * actually drawn. The papers on the study floor overlap; these do too.
 */

import { composePaper } from "../../sheets/paperComposer";
import type { ComposableSheet } from "../../sheets/paperComposer";
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
  { at: [0, 0], align: "center", key: "s0112", sheet: S_1_12 },

  // Row 1 — the parable of the town and the signs that follow it, right to left.
  { at: [1, 0], key: "s1319", sheet: S_13_19, shiftY: 2.085 },
  { at: [1, 4], key: "s2027", sheet: S_20_27, shiftY: 1.9, shiftX: -0.3 },
  { at: [1, 8], key: "s3340", sheet: S_33_40, shiftX: -2.3, shiftY: 1.95 },
  { at: [1, 13], key: "s4147", sheet: S_41_47, shiftX: -2.5, shiftY: 1.9 },

  // Row 2 — the one shout and "when is this promise?", side by side: 28-32
  // takes the right half, 48-54 the left, which is the two-sheet band the
  // handwritten page has here.
  {
    at: [2, 0],
    align: "rightHalf",
    key: "s2832",
    sheet: S_28_32,
    shiftY: 2.3,
    shiftX: 0,
  },
  {
    at: [2, 0],
    align: "leftHalf",
    key: "s4852",
    sheet: S_48_52,
    shiftY: 1.85,
    shiftX: 0,
  },

  // Row 3 — the two big two-column sheets.
  { at: [3, 0], key: "s5368", sheet: S_53_68, shiftY: 2.1, shiftX: -0.7 },
  { at: [3, 9], key: "s6982", sheet: S_69_82, shiftY: 2.1, shiftX: -1.65 },

  // Row 4 — the closing glorification, alone and centred at the foot.
  { at: [4, 0], align: "center", key: "s83", sheet: S_83, shiftY: 2.19 },
];

/**
 * THE PAPER. Its own size, in world units, and nothing the sheets do changes
 * it — that is the entire point of stating it here rather than letting it be
 * measured off the contents.
 *
 * It used to be measured, and that is what made every attempt to enlarge a
 * section fail: the paper grew with the section, the camera frames the paper,
 * so the camera backed off by exactly as much as the section had gained and
 * the picture never moved. Worse in the two lopsided cases — one cell scaled
 * alone made the paper TALLER only, so the page came out smaller; and every
 * cell scaled while the column grid stood still made it taller far faster than
 * wider, so the page came out narrower too.
 *
 * These two numbers are the composition as it was measured at SECTION_SCALE
 * 1.5 with a unit and a half of blank width on the left. Change them to change
 * the page; the sections will not drag them around any more.
 */
const PAPER_WIDTH = 12.5;
const PAPER_HEIGHT = 11.36;

/**
 * EVERY SECTION, drawn this many times bigger — uniformly, in every direction,
 * ON a paper that now holds still. The column step and the row gaps grow with
 * the sheets, so the arrangement itself is untouched: the same drawing, bigger
 * on the same page. Every world quantity a sheet owns follows (capsule heights,
 * insets, text sizes, frame SVGs, notes — see `SheetPlacement.scale`).
 *
 * 1.5 is the size the composition already had. Above that the sections gain on
 * the paper and grow on screen with it — 2.25 is where they are half again as
 * big as the page first showed them.
 *
 * WHERE THE ROOM IS. At 1.5 the sheets already reach the bottom edge, and all
 * the slack on this page is in the WIDTH: about 2 units spare now, and up to
 * 17.3 of width before the camera stops framing by height and the paper starts
 * costing zoom. So growing them runs off the FOOT of the page first, and the
 * way back on is sideways — raise a `col`, pull a row up into the space beside
 * the one above it.
 */
const SECTION_SCALE = 1.8;

/**
 * How much of the screen the paper fills, 0 → 1. This is the knob that makes
 * the PAPER look bigger or smaller — SECTION_SCALE is the one that makes the
 * sections bigger on it.
 *
 * 1 means the paper's height exactly fills the viewport; lower leaves air
 * around it.
 */
const FILL = 0.92;

const { placements, paperWidth, paperHeight } = layOutGrid({
  cells: CELLS,
  gapY: -0.08,
  margin: 0.02,
  paperWidth: PAPER_WIDTH,
  paperHeight: PAPER_HEIGHT,
  scale: SECTION_SCALE,
});

/**
 * How far the camera sits back, as a multiple of the distance the app's fixed
 * camera uses for one 1.54 x 1.78 sheet (see cameraConfig).
 *
 * The page lies flat and is viewed from about 44 degrees up, so its height
 * foreshortens to ~0.71 of itself, and the camera shows ~1.93 world units of
 * height per unit of distance-scale. Height therefore sets the number on a
 * portrait paper — `h · 0.71 / 1.93` ≈ `h · 0.368` fills the screen exactly —
 * and width only takes over once the paper is more than ~1.52x wider than tall.
 *
 * Only the resting view uses this. A section zoom frames the clicked sheet's
 * own world rectangle (`cameraFocus`) and is unaffected by any of it.
 */
const CAMERA_DISTANCE_SCALE =
  Math.max(paperWidth / 3.38, paperHeight * 0.45) / FILL;

export const { config: YASIN_PAPER_CONFIG, textData: YASIN_PAPER_TEXT_DATA } =
  composePaper({
    id: "yasin",
    title: "YÂSÎN — TEK LEVHA",
    heroTitle: "Yâsîn",
    heroSubtitle: "tek levha",

    paperWidth,
    paperHeight,
    cameraDistanceScale: CAMERA_DISTANCE_SCALE,

    scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },

    sheets: placements,
  });
