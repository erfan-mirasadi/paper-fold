/**
 * grid — where each Yâsîn sheet sits on the one big paper.
 *
 * WHY THIS EXISTS. The first version of this placed the sheets as a CHAIN:
 * row after row, each row's Y derived from the height of the row above it, and
 * each sheet's X derived from the width of its neighbour. Every number
 * depended on every other number, so nudging one sheet moved five, and no
 * small correction ever landed where it was aimed.
 *
 * A grid fixes that by giving every sheet an ADDRESS instead of a neighbour:
 *
 *     { at: [1, 4], sheet: SHEET_20_27 }
 *          │   └── columns, counted in COL_UNIT steps from the paper's RIGHT
 *          └────── row index
 *
 * Columns run right to left because the surah does: column 0 is the rightmost
 * slot, so 13-19 sits at `[1, 0]` and the sheets that follow it march leftwards
 * with a bigger `col`. A sheet's RIGHT edge lands on its column line, and the
 * sheet grows leftwards from there — which is also how you read it.
 *
 * WHAT MOVES WHEN YOU EDIT. Changing a sheet's `col` moves that sheet and
 * nothing else, ever. Changing its `row` moves that sheet to another band.
 * Only one thing still ripples: a row is as tall as its tallest sheet, so
 * making that one sheet taller pushes the rows below it down — which is what
 * rows are for, and it is the single dependency left in the layout.
 *
 * SCALE. Any cell may be drawn smaller or larger than it was authored
 * (`scale`), and so may the whole paper (`GridSpec.scale`). The scale rides all
 * the way through `composePaper`, which multiplies every world quantity the
 * sheet owns — capsule heights, gaps, insets, text sizes, frame SVGs, notes —
 * so a scaled sheet is the same drawing, smaller. See `SheetPlacement.scale`.
 */

import type {
  ComposableSheet,
  SheetPlacement,
  SheetZoomTuning,
} from "../../sheets/paperComposer";

/**
 * The column step, in world units. Sheets snap to multiples of it, so `col`
 * reads as "how many steps in from the right edge". Small enough (a fifth of a
 * sheet) that any sheet can be nudged where it is wanted, big enough that the
 * numbers in `index.ts` stay short.
 */
export const COL_UNIT = 0.3;

/**
 * Where a sheet sits across the paper when a column address is the wrong tool:
 * "centred on the page", "centred in the left half", "centred in the right
 * half". A cell that declares one ignores its `col`, and — since it is placed
 * INSIDE a span the paper already has — it never widens the paper.
 */
export type GridAlign = "center" | "leftHalf" | "rightHalf";

export interface GridCell {
  /** `[row, col]` — col counts COL_UNIT steps leftwards from the right margin. */
  at: [number, number];
  /** Centre this sheet on the page, or on one half of it, instead of on `col`. */
  align?: GridAlign;
  /** Namespaces every id this sheet contributes to the composed paper. */
  key: string;
  sheet: ComposableSheet;
  /** Draw this sheet smaller (or larger) than it was authored. Default 1. */
  scale?: number;
  /** Nudge the sheet horizontally inside the existing paper. Negative is left. */
  shiftX?: number;
  /** Nudge the sheet vertically inside the existing paper. Positive is up. */
  shiftY?: number;
  /**
   * Trims or loosens what the camera frames when this sheet is clicked. The
   * sheet's own rectangle is the default — see `SheetZoomTuning`.
   */
  zoom?: SheetZoomTuning;
}

export interface GridSpec {
  cells: GridCell[];
  /** Air between rows. Negative: sheets carry their own top/bottom margins. */
  gapY: number;
  /** Paper margin on every side. */
  margin: number;
  /**
   * Scales the WHOLE composition at once — every sheet, and the spacing
   * between them. A true zoom: the arrangement is identical, only bigger, and
   * nothing moves relative to anything else. Default 1.
   */
  scale?: number;
}

export interface GridLayout {
  placements: SheetPlacement[];
  paperWidth: number;
  paperHeight: number;
}

/**
 * Solves a grid into the absolute placements `composePaper` wants, and the
 * paper that holds them. The paper is exactly as big as its contents: its
 * width comes from the leftmost sheet's left edge, its height from the last
 * row's bottom.
 */
export function layOutGrid(spec: GridSpec): GridLayout {
  const paperScale = spec.scale ?? 1;
  const cells = spec.cells.map((c) => {
    const s = (c.scale ?? 1) * paperScale;
    return {
      ...c,
      s,
      w: c.sheet.config.dimensions.paperWidth * s,
      h: c.sheet.config.dimensions.paperHeight * s,
    };
  });

  // EVERY spacing scales with the sheets. This is what makes `scale` a zoom:
  // if the column step, the row gap and the margin stayed at their authored
  // size while the sheets grew, the arrangement would be reshuffled rather
  // than enlarged.
  const margin = spec.margin * paperScale;
  const gapY = spec.gapY * paperScale;
  const colStep = COL_UNIT * paperScale;

  // ── Rows: each is as tall as its tallest sheet, stacked downwards ───────
  const rowIndices = [...new Set(cells.map((c) => c.at[0]))].sort((a, b) => a - b);
  const rowTop = new Map<number, number>();
  let y = -margin;
  for (const r of rowIndices) {
    rowTop.set(r, y);
    const tallest = Math.max(...cells.filter((c) => c.at[0] === r).map((c) => c.h));
    y -= tallest + gapY;
  }
  const contentBottom = y + gapY; // the last row's bottom edge

  // ── Columns: a sheet's RIGHT edge sits on its column line ───────────────
  // The paper's own right margin is column 0, so the widest reach to the LEFT
  // over all cells is what sets the paper's width. Centred cells are placed
  // inside a span the paper already has, so they are left out of that.
  const addressed = cells.filter((c) => !c.align);
  const reach = Math.max(
    ...(addressed.length ? addressed : cells).map(
      (c) => c.at[1] * colStep + c.w,
    ),
  );
  const paperWidth = margin * 2 + reach;
  const paperHeight = -contentBottom + margin;

  /** The span a centred cell is centred ON. */
  const spanOf = (align: GridAlign): [number, number] =>
    align === "leftHalf"
      ? [margin, paperWidth / 2]
      : align === "rightHalf"
        ? [paperWidth / 2, paperWidth - margin]
        : [margin, paperWidth - margin];

  const placements: SheetPlacement[] = cells.map((c) => {
    let x: number;
    if (c.align) {
      const [from, to] = spanOf(c.align);
      x = (from + to) / 2 - c.w / 2;
    } else {
      x = paperWidth - margin - c.at[1] * colStep - c.w;
    }
    x += c.shiftX ?? 0;
    return {
      key: c.key,
      sheet: c.sheet,
      x,
      y: rowTop.get(c.at[0])! + (c.shiftY ?? 0),
      scale: c.s === 1 ? undefined : c.s,
      zoom: c.zoom,
    };
  });

  return { placements, paperWidth, paperHeight };
}

/**
 * The column a sheet must sit at for its right edge to clear the sheet in the
 * column before it — i.e. "put this one immediately to the left of that one".
 * Rounds outwards to a whole column so the result is still a grid address you
 * can read and nudge, rather than a derived number.
 */
export function nextCol(
  prevCol: number,
  prevSheet: ComposableSheet,
  gapX = 0,
  scale = 1,
): number {
  const w = prevSheet.config.dimensions.paperWidth * scale;
  return prevCol + Math.ceil((w + gapX) / COL_UNIT);
}
