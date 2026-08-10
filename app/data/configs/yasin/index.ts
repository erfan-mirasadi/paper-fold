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
import type { ComposableSheet } from "../../sheets/paperComposer";
import { layOutGrid, type GridCell } from "./grid";

import { YASIN_36_CONFIG, YASIN_36_TEXT_DATA } from "./sheets/1-12";
import { YASIN_13_19_CONFIG, YASIN_13_19_TEXT_DATA } from "./sheets/13-19";
import { SHEET as S_20_27 } from "./sheets/20-27";
import { SHEET as S_28_32 } from "./sheets/28-32";
import { SHEET as S_33_40 } from "./sheets/33-40";
import { SHEET as S_41_47 } from "./sheets/41-47";
import { SHEET as S_48_54 } from "./sheets/48-54";
import { SHEET as S_55_68 } from "./sheets/55-68";
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
  { at: [1, 0], key: "s1319", sheet: S_13_19 },
  { at: [1, 4], key: "s2027", sheet: S_20_27 },
  { at: [1, 8], key: "s3340", sheet: S_33_40 },
  { at: [1, 13], key: "s4147", sheet: S_41_47 },

  // Row 2 — the one shout and "when is this promise?", side by side: 28-32
  // takes the right half, 48-54 the left, which is the two-sheet band the
  // handwritten page has here.
  { at: [2, 0], align: "rightHalf", key: "s2832", sheet: S_28_32 },
  { at: [2, 0], align: "leftHalf", key: "s4854", sheet: S_48_54 },

  // Row 3 — the two big two-column sheets.
  { at: [3, 0], key: "s5568", sheet: S_55_68 },
  { at: [3, 9], key: "s6982", sheet: S_69_82 },

  // Row 4 — the closing glorification, alone and centred at the foot.
  { at: [4, 0], align: "center", key: "s83", sheet: S_83 },
];

/**
 * Zoom for the whole paper. Every sheet AND every gap between them scales by
 * this, so the arrangement above is untouched — the same drawing, bigger.
 * Turn this one number up or down; nothing else has to move.
 */
const SCALE = 1;

const { placements, paperWidth, paperHeight } = layOutGrid({
  cells: CELLS,
  gapY: -0.08,
  margin: 0.02,
  scale: SCALE,
});

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
