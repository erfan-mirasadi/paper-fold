/**
 * YASIN — the seven sheets
 * ============================================================================
 *
 * The reference photograph is not one page. It is seven separate pieces of
 * paper lying apart from each other on a floor, and a reader's eye travels
 * between them in an order the paper itself does not state. So this file
 * describes exactly that and nothing else: seven sheets, where each one sits,
 * and the order a thread runs through them.
 *
 * ── WHY THIS REPLACED THE EARLIER "ONE PAGE" MODEL ──────────────────────────
 *
 * The first attempt drew the board as ONE page whose blocks merely LOOKED like
 * separate sheets. It failed for a structural reason worth recording: a single
 * page has one fold rig, one texture and one set of margins, so the sheets
 * could never drift apart, never carry their own rotation, and never be folded
 * or lifted without dragging their neighbours along. Everything the board is
 * FOR was the thing that model made impossible.
 *
 * Here a sheet is a first-class object with its own position, its own tilt and
 * its own contents. Nothing is shared, so nothing has to be untangled later.
 *
 * ── COORDINATES ─────────────────────────────────────────────────────────────
 *
 * World units, board centre at the origin, +x right and +y up — the same
 * convention as the scene the board is mounted in. Sizes and positions are
 * traced from the photograph and then opened up, because on the floor the
 * pieces touch and overlap, and on screen they need daylight between them for
 * the thread to read.
 */

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface AtlasSheetSpec {
  /** Stable id — used by the camera, the thread and click targeting. */
  id: string;
  /** Shown while the sheets carry placeholders instead of artwork. */
  label: string;

  /** Centre of the sheet, world units. */
  x: number;
  y: number;
  /** Sheet size, world units. */
  width: number;
  height: number;
  /**
   * Tilt in radians. Every sheet has one: paper dropped on a floor never
   * lands square, and a board of perfectly aligned rectangles reads as a
   * diagram rather than as documents.
   */
  rotation: number;

  /** Verse/chunk ids this sheet carries, in its own reading order. */
  verseIds: number[];
  /** Capsule columns within the sheet. */
  columns: number;

  /** The pen this sheet is drawn in, taken from the photograph. */
  ink: string;
  /** The paper it is cut from — they are visibly not the same white. */
  paper: string;
}

// ---------------------------------------------------------------------------
// THE SHEETS
// ---------------------------------------------------------------------------

/**
 * Laid out to match the photograph's arrangement:
 *
 *                     ┌ crown ┐
 *      ┌ west ┐  ┌ rings ┐        ┌──  east  ──┐
 *      ┌───  mid  ───┐
 *      ┌── base-west ──┐   ┌── base-east ──┐
 *
 * Declaration order is NOT reading order — see `THREAD_ORDER`, which is the
 * only place the sequence is stated.
 */
export const SHEETS: readonly AtlasSheetSpec[] = [
  {
    id: "crown",
    label: "1–12",
    x: 0.0,
    y: 1.0,
    width: 0.6,
    height: 0.55,
    rotation: 0.01,
    verseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    columns: 1,
    ink: "#1f6f4a",
    paper: "#fbfaf6",
  },
  {
    id: "west",
    label: "13–18",
    x: -1.15,
    y: 0.42,
    width: 0.62,
    height: 0.42,
    rotation: -0.018,
    verseIds: [13, 14, 15, 16, 17, 18],
    columns: 1,
    ink: "#1c1c1c",
    paper: "#f7f5f1",
  },
  {
    id: "rings",
    label: "19–24",
    x: -0.42,
    y: 0.42,
    width: 0.6,
    height: 0.5,
    rotation: 0.014,
    verseIds: [19, 20, 21, 22, 23, 24],
    columns: 1,
    ink: "#2563a8",
    paper: "#fbfaf7",
  },
  {
    id: "east",
    label: "25–36",
    x: 0.95,
    y: 0.28,
    width: 1.2,
    height: 0.88,
    rotation: -0.008,
    verseIds: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    columns: 2,
    ink: "#b8322f",
    paper: "#faf7f0",
  },
  {
    id: "mid",
    label: "37–41",
    x: -0.78,
    y: -0.18,
    width: 1.28,
    height: 0.44,
    rotation: 0.02,
    verseIds: [37, 38, 39, 40, 41],
    columns: 1,
    ink: "#3b6fb0",
    paper: "#ffffff",
  },
  {
    id: "base-west",
    label: "42–55",
    x: -0.75,
    y: -0.95,
    width: 1.3,
    height: 0.82,
    rotation: 0.006,
    verseIds: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    columns: 2,
    ink: "#b8322f",
    paper: "#f9f6ee",
  },
  {
    id: "base-east",
    label: "56–69",
    x: 0.8,
    y: -0.95,
    width: 1.3,
    height: 0.82,
    rotation: -0.012,
    verseIds: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    columns: 2,
    ink: "#b8322f",
    paper: "#f9f6ee",
  },
];

// ---------------------------------------------------------------------------
// THE THREAD
// ---------------------------------------------------------------------------

/**
 * The order the thread runs through the sheets — the reading path, which the
 * geometry alone cannot express.
 *
 * From the crown at the top it drops to the sheet below and to the RIGHT, then
 * crosses back leftward across that band, then down through the middle sheet
 * and along the base pair. Reordering the reading is a matter of reordering
 * this one array; every anchor point is derived from it.
 */
export const THREAD_ORDER: readonly string[] = [
  "crown",
  "east",
  "rings",
  "west",
  "mid",
  "base-west",
  "base-east",
];

/** Sheets keyed by id, for the thread and the camera. */
export const SHEET_BY_ID: ReadonlyMap<string, AtlasSheetSpec> = new Map(
  SHEETS.map((s) => [s.id, s]),
);

/** Consecutive pairs the thread must join, resolved from `THREAD_ORDER`. */
export function threadSegments(): { from: AtlasSheetSpec; to: AtlasSheetSpec }[] {
  const segments: { from: AtlasSheetSpec; to: AtlasSheetSpec }[] = [];

  for (let i = 0; i < THREAD_ORDER.length - 1; i++) {
    const from = SHEET_BY_ID.get(THREAD_ORDER[i]);
    const to = SHEET_BY_ID.get(THREAD_ORDER[i + 1]);
    if (from && to) segments.push({ from, to });
  }

  return segments;
}

/**
 * Where the thread leaves a sheet on its way to another.
 *
 * The anchor sits on the sheet's own edge, on the side facing its partner, so
 * the thread appears tied to the paper rather than crossing over it. Which
 * edge is chosen by whichever axis separates the two sheets more — the same
 * judgement made by eye when running a string between two pages on a floor.
 */
export function threadAnchor(
  sheet: AtlasSheetSpec,
  toward: AtlasSheetSpec,
): [number, number] {
  const dx = toward.x - sheet.x;
  const dy = toward.y - sheet.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return [sheet.x + Math.sign(dx) * (sheet.width / 2), sheet.y];
  }

  return [sheet.x, sheet.y + Math.sign(dy) * (sheet.height / 2)];
}

// ---------------------------------------------------------------------------
// BOARD EXTENT
// ---------------------------------------------------------------------------

/**
 * The rectangle every sheet fits inside — what the camera frames when it pulls
 * back to the whole board. Derived rather than written down so moving a sheet
 * cannot leave a stale number behind.
 */
export function boardBounds(): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const s of SHEETS) {
    minX = Math.min(minX, s.x - s.width / 2);
    maxX = Math.max(maxX, s.x + s.width / 2);
    minY = Math.min(minY, s.y - s.height / 2);
    maxY = Math.max(maxY, s.y + s.height / 2);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}
