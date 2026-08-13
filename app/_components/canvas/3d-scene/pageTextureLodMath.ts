/**
 * pageTextureLodMath — the arithmetic behind `PageTextureLod`, and nothing else.
 *
 * Split out from the driver so the numbers can be read, reasoned about and
 * checked without a GPU, a canvas or a React tree in the way: every function
 * here is plain arithmetic on plain numbers. The driver next door owns the
 * buffers, the frames and the render calls; what SIZE anything should be, and
 * what a given device is asked to pay for, is decided here.
 */

import { Vector4, type Texture } from "three";

import type { CameraFocusRect } from "../../../data/schema";
import type { GpuTier } from "../../../utils/gpuTier";
import { FRAME_FILL } from "../../../utils/sectionZoom";

// ---------------------------------------------------------------------------
// The dials
// ---------------------------------------------------------------------------

/**
 * The first paint, as a PIXEL BUDGET rather than a density — low on purpose,
 * and the same on every device, because the point of it is to arrive fast
 * rather than to be looked at for long. It is replaced within a second.
 *
 * A budget, not a texels-per-unit number, because a composed paper's size is
 * whatever its grid came to: the first version of this fixed the density and
 * silently gave a 5.6-unit-wide paper a 541 x 727 first paint — a quarter of
 * the resolution its own screen could show, for the whole first second. Two
 * megapixels is about a sixteenth of what the old single full-size capture
 * cost, and lands within a hair of what a laptop resolves at rest.
 */
export const FIRST_PASS_PIXELS = 2e6;

/**
 * How much of the screen the paper fills when resting. Only used to work out
 * how many texels the refine pass owes the page — a little generous, so the
 * estimate errs towards sharp.
 */
const REST_FILL = 0.95;

/** Grown from the rectangle the camera will show, so the softer picture underneath
 *  never reaches the edge of the window, and the feather has room to hide in.
 *  The buffer is grown to match (see `detailTextureSize`) — otherwise the extra
 *  margin would be paid for out of the sharpness of the middle. */
export const DETAIL_OVERSCAN = 1.12;

/** Width of the detail's soft edge, as a fraction of the detail rectangle. Must
 *  stay under the margin `DETAIL_OVERSCAN` buys (0.054), or the seam shows. */
const DETAIL_FEATHER = 0.045;

/**
 * Below this much of a gain the refine is not worth running: the page would
 * cost a buffer and a dozen frames to come out barely sharper than the first
 * paint already is. Small screens and weak GPUs land here and skip it — which
 * is the right answer for them, since the zoom detail is where their quality
 * actually comes from.
 */
export const REFINE_WORTH_IT = 1.15;

export interface TierQuality {
  /** Texels per screen pixel for the whole-page refine. */
  refineSuperSample: number;
  /** Ceiling on the refine buffer. Half-float, so a texel is 8 bytes. */
  refineMaxPixels: number;
  /**
   * Texels per screen pixel for the ZOOM. Never below 1 on any tier: a sharp
   * sheet under the reader's eye is the entire point of the ladder, and one
   * screen's worth of texels is no more than a weak GPU already draws every
   * frame — it is the twenty-times-the-screen full-page buffer it cannot do,
   * which is exactly what the two rows above are for.
   */
  detailSuperSample: number;
  detailMaxPixels: number;
  /** Texels one tile may cost — the bill a single frame has to pay. */
  tilePixels: number;
  /** Anisotropy ceiling. A zoomed sheet is seen nearly head-on, so a weak GPU
   *  gives up very little by not paying for the full sixteen taps. */
  maxAnisotropy: number;
}

export const QUALITY: Record<GpuTier, TierQuality> = {
  high: {
    refineSuperSample: 1.25,
    refineMaxPixels: 9e6,
    detailSuperSample: 1.25,
    detailMaxPixels: 11e6,
    tilePixels: 2e6,
    maxAnisotropy: 16,
  },
  medium: {
    refineSuperSample: 1,
    refineMaxPixels: 5e6,
    detailSuperSample: 1.1,
    detailMaxPixels: 7e6,
    tilePixels: 1.2e6,
    maxAnisotropy: 8,
  },
  low: {
    // A weak device gives up the whole-page refine — often entirely, see
    // REFINE_WORTH_IT — and spends what it has on the zoom instead.
    refineSuperSample: 0.85,
    refineMaxPixels: 2.5e6,
    detailSuperSample: 1,
    detailMaxPixels: 5e6,
    // Small tiles: more frames, but no frame that a slow GPU would drop.
    tilePixels: 0.55e6,
    maxAnisotropy: 4,
  },
};

// ---------------------------------------------------------------------------
// Sizing
// ---------------------------------------------------------------------------

export interface TextureSize {
  width: number;
  height: number;
}

/**
 * A buffer for `rectW x rectH` world units at `pxPerUnit`, shrunk uniformly
 * (never squashed) until it fits both the driver's limit and our own budget.
 */
export function fitTextureSize(
  rectW: number,
  rectH: number,
  pxPerUnit: number,
  maxTextureSize: number,
  maxPixels: number,
): TextureSize {
  const density = Math.min(
    pxPerUnit,
    (maxTextureSize - 16) / Math.max(rectW, rectH),
    Math.sqrt(maxPixels / (rectW * rectH)),
  );
  return {
    width: Math.max(64, Math.round(rectW * density)),
    height: Math.max(64, Math.round(rectH * density)),
  };
}

/** The cheap first paint — see `FIRST_PASS_PIXELS`. */
export function firstPassTextureSize(
  pageWidth: number,
  pageHeight: number,
  maxTextureSize: number,
): TextureSize {
  // Infinite density, so the budget itself is what decides the size.
  return fitTextureSize(
    pageWidth,
    pageHeight,
    Infinity,
    maxTextureSize,
    FIRST_PASS_PIXELS,
  );
}

/**
 * The whole page at the resolution the resting view actually shows it at — or
 * null when that would not be enough sharper than the first paint to be worth
 * the buffer. A small screen or a weak GPU lands on null and skips the pass
 * entirely, which is right for them: their quality comes from the zoom.
 */
export function refineTextureSize(
  pageWidth: number,
  pageHeight: number,
  screenW: number,
  screenH: number,
  quality: TierQuality,
  maxTextureSize: number,
): TextureSize | null {
  // Fitting the page on screen: whichever side runs out of room sets the scale.
  const pxPerUnit =
    Math.min(screenH / pageHeight, screenW / pageWidth) *
    REST_FILL *
    quality.refineSuperSample;
  const size = fitTextureSize(
    pageWidth,
    pageHeight,
    pxPerUnit,
    maxTextureSize,
    quality.refineMaxPixels,
  );
  // Measured against the first paint the page will already be showing, so the
  // question is always "is this enough BETTER than what is on screen".
  const first = firstPassTextureSize(pageWidth, pageHeight, maxTextureSize);
  return size.width / first.width >= REFINE_WORTH_IT ? size : null;
}

/**
 * The buffer a zoom gets: the window, at this tier's texels per screen pixel,
 * PLUS the overscan `detailRect` covers.
 *
 * The overscan has to be in here. The buffer is stretched over a rectangle 12%
 * wider than the screen shows, so a buffer sized to the screen alone would land
 * the reader at 0.89 of their own display's resolution — paying for the margin
 * out of the sharpness of the thing they zoomed in to read. With it, `1` in
 * `detailSuperSample` means exactly one texel per screen pixel, which is what
 * the tier table says it means.
 */
export function detailTextureSize(
  screenW: number,
  screenH: number,
  dpr: number,
  quality: TierQuality,
  maxTextureSize: number,
): TextureSize {
  return fitTextureSize(
    screenW,
    screenH,
    dpr * quality.detailSuperSample * DETAIL_OVERSCAN,
    maxTextureSize,
    quality.detailMaxPixels,
  );
}

/**
 * The rectangle a zoom to `rect` will actually SHOW, in page space.
 *
 * `SectionZoomCamera` pushes the camera back until `rect` fills `FRAME_FILL` of
 * whichever axis runs out of room first; the window's own aspect then decides
 * how much MORE than the rectangle comes with it. The page scale cancels out of
 * that arithmetic completely, so this needs nothing from the live scene — which
 * is what lets the pass start on the click rather than after the flight.
 *
 * Left unclamped by the page's edges on purpose: a sheet in a corner frames air
 * beyond the paper, the buffer keeps the window's aspect either way, and UVs
 * outside the page are never sampled.
 */
export function detailRect(rect: CameraFocusRect, aspect: number): CameraFocusRect {
  const viewH = Math.max(rect.h, rect.w / aspect) / FRAME_FILL;
  const w = viewH * aspect * DETAIL_OVERSCAN;
  const h = viewH * DETAIL_OVERSCAN;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y - rect.h / 2;
  return { x: cx - w / 2, y: cy + h / 2, w, h };
}


/**
 * Margin on top of the ceiling below — small, and small ON PURPOSE.
 *
 * The instinct is to be generous here, but generosity costs sharpness as well
 * as memory. A texture denser than the pixels sampling it is not read at level
 * zero; the GPU blends down the mip chain, so ink drawn at 1.5x the screen's
 * rate arrives BLURRIER than ink drawn at exactly its rate. Matching it is both
 * the lightest and the sharpest thing to do.
 *
 * That only holds if the ceiling is a real ceiling, and here it is: the camera
 * cannot be zoomed by hand on these pages (`DynamicControls` enables zoom only
 * during an intro, which a composed paper does not have), the section framing
 * is exact rather than eased-past, and the page is seen head-on rather than
 * foreshortened (`solveFraming`). The 15% is for rounding, not for surprises.
 */
export const TEXT_DENSITY_HEADROOM = 1.15;

/**
 * The finest the page is EVER drawn, in texels per world unit.
 *
 * This is the ceiling on how sharply anything inside the page — above all the
 * text — can be worth rasterising. The page is only ever seen THROUGH its own
 * texture, so ink drawn finer than this is rasterised, uploaded, mipmapped and
 * then sampled away: paid for in full, never seen.
 *
 * The answer is the zoom detail (stage 3), since that is the sharpest stage,
 * and specifically the SMALLEST rectangle any zoom frames — a small sheet is
 * magnified more, so it sets the ceiling for the whole page. Returns 0 when the
 * page has no zoom rectangles at all, which is the caller's signal that it has
 * nothing better than its own default to go on.
 */
export function maxPageTexelsPerUnit(
  focusRects: CameraFocusRect[],
  screenW: number,
  screenH: number,
  dpr: number,
  quality: TierQuality,
  maxTextureSize: number,
): number {
  if (focusRects.length === 0) return 0;

  const detail = detailTextureSize(screenW, screenH, dpr, quality, maxTextureSize);
  const aspect = detail.width / detail.height;

  let finest = 0;
  for (const rect of focusRects) {
    finest = Math.max(finest, detail.width / detailRect(rect, aspect).w);
  }
  return finest;
}

/** Tiles for a buffer, kept squarish so no tile is a sliver. */
export function planTiles(
  size: TextureSize,
  tilePixels: number,
): { cols: number; rows: number } {
  const count = Math.max(1, Math.ceil((size.width * size.height) / tilePixels));
  if (count === 1) return { cols: 1, rows: 1 };
  const rows = Math.max(
    1,
    Math.round(Math.sqrt((count * size.height) / size.width)),
  );
  return { cols: Math.max(1, Math.ceil(count / rows)), rows };
}


// ---------------------------------------------------------------------------
// The uniforms the paper shader composites the detail through
// ---------------------------------------------------------------------------

export interface PageDetailUniforms {
  uDetailMap: { value: Texture | null };
  /** The detail's rectangle in the page's UV space: x, y, w, h. */
  uDetailRect: { value: Vector4 };
  uDetailStrength: { value: number };
  uDetailFeather: { value: number };
}

export function createPageDetailUniforms(): PageDetailUniforms {
  return {
    uDetailMap: { value: null },
    uDetailRect: { value: new Vector4(0, 0, 1, 1) },
    uDetailStrength: { value: 0 },
    uDetailFeather: { value: DETAIL_FEATHER },
  };
}

