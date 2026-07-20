/**
 * foldSliderTrack — a module-level bridge between the R3F render loop and the
 * DOM fold slider.
 *
 * The paper lives inside a transformed group hierarchy (scene tilt, scale,
 * intro→paper focus animation), so its on-screen right edge cannot be derived
 * from the raw page dimensions alone. FoldSliderTracker parks two invisible
 * markers at the paper's top-right and bottom-right corners — INSIDE that same
 * group, so they inherit every transform — and projects them to viewport
 * pixels each frame, writing the result here.
 *
 * The DOM overlay reads these values in its own rAF loop and mutates styles
 * imperatively, so tracking the folding paper never triggers a React re-render.
 */
export interface FoldSliderTrackState {
  /** Viewport-pixel position of the paper's top-right corner. */
  topX: number;
  topY: number;
  /** Viewport-pixel position of the paper's bottom-right corner. */
  bottomX: number;
  bottomY: number;
  /** Both corners are within the frustum / roughly on screen. */
  onScreen: boolean;
  /** At least one frame has written real values. */
  hasData: boolean;
}

export const foldSliderTrack: FoldSliderTrackState = {
  topX: 0,
  topY: 0,
  bottomX: 0,
  bottomY: 0,
  onScreen: false,
  hasData: false,
};
