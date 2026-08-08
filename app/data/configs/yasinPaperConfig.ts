/**
 * YÂSÎN — TEK LEVHA. Every Yâsîn sheet laid out on ONE piece of paper, the way
 * the study's sheets are laid out on the floor in the reference photograph.
 *
 *        ┌──────────────────── 5.00 ────────────────────┐
 *        │                                              │
 *        │                 ╔═══════════╗                │   1-12  (yasin36)
 *        │   (room for     ║   1 – 12  ║                │
 *        │    the sheets   ╚═══════════╝                │
 *        │    still to           ╔═══════════╗          │   13-19 (yasin1319)
 *        │    come)              ║  13 – 19  ║          │
 *        │                       ╚═══════════╝          │
 *        └──────────────────────────────────────────────┘
 *
 * The two sheets are NOT re-authored here. `yasin36Config` and
 * `yasin1319Config` are imported exactly as the standalone routes
 * (/surahs/yasin36, /surahs/yasin1319) use them, and `composePaper` translates
 * each one onto this bigger page — same capsule sizes, same frames, same
 * notes, same colours. Adding the next sheet is one more entry in `SHEETS`.
 *
 * PLACEMENT. `x` / `y` pin a sheet's own page rectangle (1.54 × 1.78 for both
 * of these) by its top-left corner, in this paper's coordinates: x runs right
 * from 0, y runs DOWN from 0. So the numbers below read as
 * "1-12 starts a hair below the top edge, a little right of centre; 13-19
 * starts where 1-12 ends, pushed further right, into the corner".
 *
 * GROWING THE PAPER. The empty left half is deliberate — it is where 20-32,
 * 33-… go, right to left, the way the surah reads. When they arrive, widen
 * `PAPER_WIDTH` and raise `CAMERA_DISTANCE_SCALE` with it; nothing else here
 * has to move, because each sheet's placement is absolute.
 */

import { composePaper } from "../sheets/paperComposer";
import { YASIN_36_CONFIG, YASIN_36_TEXT_DATA } from "./yasin36Config";
import { YASIN_13_19_CONFIG, YASIN_13_19_TEXT_DATA } from "./yasin1319Config";

// ── PAPER ──────────────────────────────────────────────────────────────────
// Landscape, and roomy: two sheets are on it today, and the surah has another
// five or six pages to give it.
const PAPER_WIDTH = 5.0;
const PAPER_HEIGHT = 3.8;

// The camera is otherwise fixed at the distance that frames a 1.54-wide sheet
// (see cameraConfig). 2.5 rather than the "same framing" 3.25 = 5.0 / 1.54,
// so the paper fills the screen instead of floating in the middle of it.
const CAMERA_DISTANCE_SCALE = 2.5;

// Both sheets are authored on the same 1.54 × 1.78 page. 1-12 is centred on
// the paper's width; 13-19 hangs off its bottom edge, one sheet-height down
// and pushed right, into the corner.
const SHEET_W = 1.54;
const SHEET_H = 1.78;

// x of a sheet whose own page sits dead centre across the paper's width.
const CENTERED_X = (PAPER_WIDTH - SHEET_W) / 2;

export const { config: YASIN_PAPER_CONFIG, textData: YASIN_PAPER_TEXT_DATA } =
  composePaper({
    id: "yasin",
    title: "YÂSÎN — TEK LEVHA",
    heroTitle: "Yâsîn",
    heroSubtitle: "tek levha",

    paperWidth: PAPER_WIDTH,
    paperHeight: PAPER_HEIGHT,
    cameraDistanceScale: CAMERA_DISTANCE_SCALE,

    scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },

    sheets: [
      {
        key: "y1",
        sheet: { config: YASIN_36_CONFIG, textData: YASIN_36_TEXT_DATA },
        x: CENTERED_X,
        y: -0.02,
      },
      {
        key: "y2",
        sheet: { config: YASIN_13_19_CONFIG, textData: YASIN_13_19_TEXT_DATA },
        x: 3.3,
        y: -0.02 - SHEET_H,
      },
    ],
  });
