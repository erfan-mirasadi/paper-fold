import { MeshStandardMaterial, Vector3 } from "three";

/**
 * vellumSurface.ts — the paper itself, COMPUTED rather than photographed.
 *
 * WHY THERE IS NO IMAGE HERE. Every paper texture this project has used was a
 * photograph stretched over the page: 683 x 1024 for the diffuse, 3440 x 2430
 * for the grunge frame. On one sheet that is fine. On the composed atlas it is
 * not — the page is seven world units wide, the photograph has no grain left at
 * that size, and a section zoom magnifies the BLUR rather than the paper.
 * `SurahFeatures.flatPaperSurface` was the surrender: drop the photograph, keep
 * a flat colour, accept that the page is a coloured card.
 *
 * A procedural surface has no such size. It is a function of the page
 * coordinate, evaluated once per SCREEN pixel by the paper's own fragment
 * shader — so the grain is drawn at whatever resolution the reader is actually
 * looking at it, and a hundredfold zoom is a hundredfold finer sample of the
 * same function, not a hundredfold magnification of a picture. There is no
 * native size to outgrow, and nothing to download.
 *
 * ── WHAT THIS IS A MODEL OF, AND HOW THE NUMBERS WERE GOT ───────────────────
 *
 * NOT of vellum in the abstract — of THE REFERENCE SHEET, measured. An earlier
 * version of this file modelled the anatomy instead: hair follicles in the
 * triplets calf hair grows in, dermal veins, flecks of leftover pigment. All of
 * it is true of real vellum and all of it was wrong here, because it put
 * discrete ROUND features on the page and the eye reads a small dark circle on
 * paper as damage. The verdict on it was that the page looked defective.
 *
 * So the reference was measured instead — a Laplacian pyramid over its
 * luminance, band by band, as a fraction of the sheet's own mean:
 *
 *      cycles across the sheet   1600   400   100    25   12.5    6.3    3.1
 *      rms                      0.46% 0.50% 0.49% 0.50%  0.63%  0.86%  1.07%
 *      everything below 3 cycles ......................................  1.35%
 *
 * Three things fall out of that table, and they are the whole design:
 *
 *   1. THE SPECTRUM IS FLAT. Half a percent per octave, from the coarsest
 *      cloud to the finest grain, across nine doublings. That is pink noise —
 *      equal energy per octave — and it is why the sheet reads as a material
 *      rather than as a pattern: there is no scale at which it has a
 *      characteristic size, so there is nothing for the eye to catch on. It is
 *      also why a photograph fails at the wrong magnification and this does
 *      not: the statistics are the same at every scale, so ANY scale is
 *      correct.
 *
 *   2. IT IS FAINT. Two percent rms, total, over everything. The fifth and
 *      ninety-fifth luminance percentiles of the reference are 220 and 243 out
 *      of 255, and most of even that is the edge toning. The fastest way to
 *      make this look like a filter instead of a material is to turn it up.
 *
 *   3. IT IS NOT SYMMETRIC — this is the subtle one. The detail's skewness is
 *      -2.2, and the tails are 3.8% dark against 0.9% light. Clean vellum sits
 *      near the TOP of its range and the variation is almost entirely
 *      DARKENING: the sheet is bright, and things have happened to it. That is
 *      what a symmetric noise field can never reproduce however carefully it is
 *      tuned, and it is exactly the quality of "marks a real sheet has picked
 *      up" — so it is modelled as one, in `VELLUM.markThreshold` below.
 *
 * ── BAND LIMITING, WHICH IS THE WHOLE TRICK ─────────────────────────────────
 *
 * A procedural texture that simply evaluates noise is WORSE than a photograph,
 * not better: at page-wide zoom every layer finer than the screen aliases into
 * crawling static. The octave chain here is therefore anchored to the pixel
 * footprint (`fwidth` of the page coordinate) rather than written down. Its
 * finest octave always sits just under the half-cycle-per-pixel limit where
 * sampling theory says detail turns into noise, and the whole chain slides up
 * as the reader comes closer.
 *
 * That is what makes the promise true at 100x. The detail is not stored at some
 * resolution and magnified; it is GENERATED at the size it is needed, with the
 * same measured statistics at every scale. There is no last step.
 *
 * @see `usePaperMasking`, which splices this into the paper's fragment shader,
 *      and `VELLUM_INK_GLSL` below for what the ink does when it lands on it.
 */

/**
 * THE LOOK, in one object — the DEFAULTS every dial starts at.
 *
 * These are no longer compiled into the shader as literals. `VELLUM_DIALS`
 * below turns each of them into a uniform, so they can be dragged live in the
 * dev panel and this object is where a session's findings get written back to.
 * It remains the source of truth: it is what the app ships with and what
 * `resetVellumUniforms` returns to.
 *
 * The colour figures are measured off the reference as averages over 12 x 12
 * blocks, so no single mark can move them:
 *
 *      centre  #fcf0d7      mid-edge  #f5e1bd      corner  #eacfa1
 *      mean    #f9eacb      darkest mark  #bb915f
 *
 * The corner is 0.955 / 0.900 / 0.820 of the centre — not merely darker but
 * markedly warmer, blue falling twice as fast as red. Every darkening on this
 * sheet works that way, which is why `markTint` and `edgeTint` are colours and
 * not scalars: paper does not go grey as it ages, it goes brown.
 */
export const VELLUM = {
  // ── the octave chain ──────────────────────────────────────────────────────
  /**
   * The three octaves that never move — the sheet's own broad unevenness, in
   * cycles across the page width. Fixed because they are the only thing left
   * once the reader is close enough that every other octave has slid past them,
   * and a page with no large-scale variation at all looks laminated.
   */
  baseCycles: 1.0,
  /**
   * Where the SLIDING chain's finest octave sits, in cycles per screen pixel.
   * Just under the half-cycle Nyquist limit, so it is the finest thing the
   * display can carry without shimmering — and it moves with the zoom, which is
   * the entire point of the file.
   */
  topPerPixel: 0.35,
  /**
   * The lowest the sliding chain may start, in cycles across the page. It only
   * binds when the page is viewed whole; past that the chain floats up with the
   * zoom and this is ignored.
   */
  minCycles: 1.0,
  /**
   * A gentle stretch along the sheet, so the grain has a direction. Measured:
   * the reference's fine detail still correlates at 0.10 eight pixels along its
   * long axis and at 0.00 across it. Faint, but it is the difference between a
   * sheet that was made and a field of noise — and it must stay faint, since at
   * 1.3 it measured back at 0.21, twice the reference, and started to read as
   * brushing.
   */
  stretch: 1.15,

  /**
   * THE KNEE — how much louder the three fixed octaves are than the flat chain
   * above them.
   *
   * The reference's spectrum is not a straight line, and the shape of the bend
   * is the sheet's character. Measured, in rms per band:
   *
   *      cycles   1600   800   400   200   100    50    25   12.5   6.3   3.1
   *      rms     0.46% 0.35% 0.50% 0.53% 0.49% 0.46% 0.50% 0.63% 0.86% 1.07%
   *
   * FLAT at about half a percent from twenty-five cycles all the way up to
   * sixteen hundred — nowhere in that range does the sheet have a characteristic
   * size, which is exactly why it reads as a material — and then a KNEE, rising
   * to nearly three times that below ten cycles. That rise is the weather on the
   * sheet: where it lay against the frame, where it was handled, where it dried
   * slowest. Without it the paper is an even fizz; with it, it has regions.
   *
   * So the chain above the knee is flat, and these are the three below it.
   *
   * THEY MUST STAY SMALL. Read literally off the table the ratios are 2.8, 2.2
   * and 1.8, and at those values the sheet came out with a single enormous
   * stain across one half of it and nothing on the other — because most of what
   * the pyramid counts at three cycles is the EDGE TONING, a smooth gradient
   * this file already draws separately, and adding it a second time as noise
   * buys a blob rather than weather. What is left over for the noise to carry
   * is the modest rise below.
   */
  knee: [2.2, 1.9, 1.6] as const,

  // ── the fit ───────────────────────────────────────────────────────────────
  /**
   * How much of the normalised noise field becomes plain cloudiness.
   *
   * SMALL, BECAUSE THE BRIGHT SIDE HAS NOWHERE TO GO. This is the symmetric
   * half of the surface — the half that can push a pixel UP — and vellum is a
   * very bright material: the page sits near the top of its range, so a
   * symmetric swing wide enough to see is a swing wide enough to clip. Measured
   * at an earlier, larger value, a QUARTER of the bare sheet came back with red
   * pinned at 255, which flattens the highlights into a single tone and is
   * exactly what "I cannot see any texture" looks like from the inside.
   *
   * The measurement says the same thing independently: the reference's light
   * tail is only +0.70% at p95 and +0.88% at p99, against a dark tail of
   * -3.8%. Clean vellum is bright and the variation is nearly all DARKENING —
   * so the visible contrast belongs in `markAmp` below, which only ever
   * subtracts, and this stays small enough to leave the highlights room.
   */
  tone: 0.012,
  /**
   * THE MARKS — the "zadegi" a real sheet has picked up, and the reason the
   * dark tail is four times the light one.
   *
   * Only the part of the field BELOW `-markThreshold` becomes a mark, raised to
   * `markPower` so the deep ones fall away fast and the shallow ones stay
   * shallow.
   *
   * DRIVEN BY THE CHAIN'S UPPER HALF, NOT THE WHOLE OF IT, and that is the
   * difference between a sheet and a ruin. Fed the full field the nonlinearity
   * finds its deepest values wherever the LOWEST octave happens to dip, and
   * since that octave is one cycle across the page the result is a single stain
   * the size of a hand — which is what the reference conspicuously does not
   * have. Its dark tail is carried by the fine texture: thousands of small
   * wisps spread evenly over the sheet, none of them individually visible as a
   * blemish, together making the whole of the -2.2 skewness.
   *
   * Fitted to the measurement: threshold 0.35 and power 1.6 bring the detail's
   * skewness to -2.4 against the reference's -2.1, which is the number that
   * decides whether a sheet reads as marked or merely as noisy.
   *
   * THIS CARRIES THE VISIBLE CONTRAST, not `tone` — see the note there. It only
   * ever darkens, so it can be turned up until the paper reads at arm's length
   * without ever costing a highlight.
   */
  markThreshold: 0.35,
  markPower: 1.6,
  markAmp: 0.048,
  /**
   * A mark is a brown, never a grey — and the ratio is measured, not chosen.
   * The reference's darkest twentieth against its lightest comes out
   * 0.936 / 0.868 / 0.754, so blue falls three times as fast as red. Taken
   * relative to red, that is this.
   */
  markTint: [1, 0.927, 0.806] as const,
  /**
   * How fast a mark reaches its full colour. Set so the deepest marks actually
   * arrive at `markTint` rather than asymptotically approaching it: measured
   * back off a render, the sheet's own dark-to-light ratio lands at
   * 0.94 / 0.87 / 0.76 against the reference's 0.936 / 0.868 / 0.754.
   */
  markTintGain: 26.0,

  /**
   * THE DIAL TO TURN. Scales the whole surface — cloudiness, marks and all —
   * around the page colour, without touching the fit's shape.
   *
   * 1.0 IS THE REFERENCE — `tone` and `markAmp` are solved against the
   * measurement, so this is the only dial that can be turned without breaking
   * the fit's shape, and the only one that should be.
   *
   * It ships at 2.2, which is louder than the sheet it was measured from, and
   * deliberately. The reference is a flat scan looked at one-to-one; this is a
   * lit surface lying at forty degrees, seen through a render target, at a
   * distance where the whole page is on screen at once. At a literal 1.0 the
   * paper is *correct* and very nearly invisible — which is a texture nobody
   * asked for. 2.2 is where it reads as a material at reading distance and
   * still does not read as a filter close up.
   */
  intensity: 0.45,

  // ── the edge ──────────────────────────────────────────────────────────────
  /** The corner's measured ratio to the centre. */
  edgeTint: [0.955, 0.9, 0.82] as const,
  /**
   * Where the toning starts and reaches full, in half-diagonals.
   *
   * Solved off the three measured samples, not chosen: the mid-edge is 6% down
   * on the centre and the corner 13%, so the ramp has to be about HALF spent by
   * the time it reaches the middle of a side. Starting it earlier drags the
   * whole page down and reads as a photographic vignette rather than as a sheet
   * that dried hardest where it was pegged.
   */
  edgeStart: 0.55,
  edgeEnd: 1.36,

  // ── what the surface does NOT touch ───────────────────────────────────────
  /**
   * How much of the surface shows through what is DRAWN on the page — the
   * script, the capsules, the section panels.
   *
   * ZERO, and deliberately. Artwork on a sheet of vellum is opaque body colour
   * sitting on top of it, not a wash sitting in it, and every attempt to let
   * the paper through it put marks on the capsules that read as dirt. The
   * surface belongs to the paper; the page belongs to whoever drew it.
   *
   * The one thing that does cross the line is the INK, below, and it crosses in
   * the other direction: not paper laid over a stroke, but a stroke behaving
   * like a stroke.
   */
  contentShowThrough: 0.76,
  /**
   * How "bare paper" is told from "something is drawn here", as linear colour
   * distance from the page colour: below `coverDead` the pixel is paper and
   * takes the whole surface, above `coverFull` it is artwork and takes none.
   *
   * The dead zone is the important half — see the note at the call site. Bare
   * paper should land at exactly zero, and when a stale constant elsewhere made
   * it land at 0.09 instead, a gain with no dead zone erased the surface from
   * the entire sheet silently. The gap between the two is still narrow enough
   * that the palest capsule on the page counts as drawn.
   */
  coverDead: 0.02,
  coverFull: 0.07,

  // ── ink ───────────────────────────────────────────────────────────────────
  /**
   * Edge pooling — the "coffee ring", and the most recognisable thing about ink
   * on skin. Vellum is sized and nearly non-absorbent, so a stroke does not
   * wick outwards; it dries from the middle out and carries its pigment to the
   * rim, leaving every stroke darker at its boundary than in its middle.
   *
   * This is the ink effect worth having: it is a clean line, it follows the
   * letterform, and it is what separates a written stroke from a printed one.
   */
  inkPool: 0.0,
  /** The rim's width, in page widths. A physical width, so it grows with zoom. */
  inkPoolWidth: 0.0008,
  /**
   * How much of the finest grain a stroke takes on — granulation, the ink
   * sitting unevenly in the surface it was dragged across. Deliberately small:
   * driven from the finest octaves only, so it is a texture within the stroke
   * and never a mark on top of it.
   */
  inkGrain: 0.01,
  /**
   * How far a thinly-laid stroke drifts towards its warm sepia. Iron gall is
   * brown-black, and where it is thin it is simply brown. Multiplying is what
   * makes this safe: a solid mark is left alone, since nothing times anything
   * is still nothing, and only the thin places — a hairline, the shoulder of a
   * letter — take the colour, which is where a real pen shows it.
   */
  inkSepia: 0.0,
  /** How much darker a solid stroke is made. The ink's contrast dial. */
  inkDepth: 0.08,
  sepiaTint: [1.0, 0.88, 0.7] as const,

  // ── the four the panel adds, which have no counterpart in the measurement ──
  /**
   * BARE PAPER'S OWN COLOUR, as the shader paints it.
   *
   * The render target is still cleared to `VELLUM_PAGE_COLOR` and `SurahLayout`
   * still paints its plane that colour — that pair is what the shader MEASURES
   * against to tell paper from artwork, and it has to stay fixed for that test
   * to mean anything. This is separate: what bare paper is repainted as once it
   * has been recognised. Which is what makes the paper's colour a slider
   * instead of a rebuild.
   *
   * LINEAR, not sRGB — it is multiplied into a linear pipeline. This is
   * #e6d9bd converted; writing the sRGB triple straight in overshoots by about
   * a stop and clips the red. The panel's colour picker does the conversion in
   * both directions, so what you pick there is what you get.
   */
  paper: [0.745, 0.701, 0.61] as const,
  /**
   * A multiplier on every frequency in the octave chain at once — bigger number,
   * finer grain. One dial instead of the four separate frequencies it scales,
   * because "make the texture smaller" is the only thing anyone actually wants
   * from them.
   */
  grain: 12.0,
  /**
   * THE VIGNETTE, which replaces the measured edge toning with something that
   * can be aimed. The reference's own corner-to-centre ratio is still the
   * default colour, but where it starts, how soft it is and whether it runs
   * square to the sheet or round from the middle are now yours.
   *
   * `vignetteShape` blends the two distances it could be measured by: 0 is the
   * box distance, which follows the sheet's own rectangle, and 1 is the radial
   * one, which is a circle from the centre.
   */
  vignette: 0.46,
  vignetteTint: [0, 0, 0] as const,
  vignetteSize: 0.92,
  vignetteSoftness: 0.6,
  vignetteShape: 1.0,

  /**
   * FIBRES — how heavily the threads read. See `vlFibres`.
   *
   * `fibreCells` is their spacing across the page and `fibreDensity` the
   * fraction of cells holding one, so between them they set HOW MANY there are;
   * this dial sets how much of each you see. The other two stay fixed, because
   * "more fibres" and "darker fibres" are the same request and one slider
   * should answer it.
   */
  fibres: 0.1,
  fibreCells: 130.0,
  fibreDensity: 0.16,

  /**
   * THE CREASES — see `vlCreases`. `crease` is how hard the fold is pressed and
   * `creaseWidth` how broad the ridge is, in page units.
   *
   * There is no "wander" dial, and the measurement is why. A fold in paper is
   * very nearly STRAIGHT — see `vlCreases` for the numbers — so the control was
   * offering a fault rather than a property, and the only useful setting for it
   * was zero. What the reference actually has instead is a finely jittered
   * EDGE, which is not a taste and is now simply built in.
   */
  crease: 0.16,
  creaseWidth: 0.0025,
  /**
   * THE DETAIL, every figure measured off the reference normal map.
   *
   *   creaseJitter   the rough edge, as a fraction of the ridge's half-width.
   *                  Measured 1.07px of stray against 6.17px of half-width.
   *   creaseJitterScale  how fine that roughness is, in cycles across the sheet.
   *                  The reference's stray peaks at a two-pixel period.
   *   creaseDrift    the one slow term the measurement supports — the residual
   *                  below 256px, under half a pixel end to end.
   *   creaseUneven   how far the fold weakens where it is weakest. The
   *                  reference runs at 0.945 of peak and dips to 0.53.
   *   creaseUnevenScale  how often it does. Measured: 46 separate weak
   *                  stretches across 1024px, averaging 2.7px each — short
   *                  flecks, not long soft sections, which is why this is high.
   *   creaseBalance  the lit flank against the shaded one. A fold is not
   *                  symmetric: measured 106.9 bright against 113.7 dark.
   */
  creaseJitter: 0.25,
  creaseJitterScale: 340.0,
  creaseDrift: 0.37,
  creaseUneven: 0.0,
  creaseUnevenScale: 400.0,
  creaseBalance: 0.99,
} as const;

/**
 * THE DIALS, as one table — the single thing to edit, and the single thing every
 * other part of this system is generated from.
 *
 * It drives three things that used to be written out three times and drift:
 * the shader's `uniform` declarations, the uniform objects three.js binds, and
 * the sliders in `VellumControls`. Adding a dial here makes it appear in all
 * three; there is nowhere else to remember.
 *
 * THEY ARE UNIFORMS, NOT COMPILED-IN CONSTANTS, and that is the point. Baked
 * into the GLSL, changing any one of them meant a shader recompile, which under
 * this project's dev setup means a full reload and about two minutes before the
 * page is back on screen — an hour to try a dozen values, and no way to compare
 * two of them side by side. As uniforms they are live: drag a slider and the
 * paper changes in the same frame. The cost is twenty-odd uniform reads per
 * fragment, which is nothing next to the twelve noise lookups already there.
 *
 * `min`/`max`/`step` are the slider's range, and they are deliberately narrow
 * enough that every position on the slider is a value worth looking at.
 */
interface VellumDial {
  /** The key in `VELLUM` this dial's default comes from. */
  of: keyof typeof VELLUM;
  kind: "float" | "vec3" | "color";
  label: string;
  group: string;
  min?: number;
  max?: number;
  step?: number;
}

export const VELLUM_DIALS: Record<string, VellumDial> = {
  // ── the paper ─────────────────────────────────────────────────────────────
  VL_PAPER: { of: "paper", kind: "color", label: "Paper colour", group: "Paper" },
  VL_INTENSITY: { of: "intensity", kind: "float", min: 0, max: 3, step: 0.05,
    label: "Texture amount", group: "Paper" },
  VL_MARK_AMP: { of: "markAmp", kind: "float", min: 0, max: 0.12, step: 0.002,
    label: "Blotches", group: "Paper" },
  VL_MARK_TINT: { of: "markTint", kind: "color", label: "Blotch colour", group: "Paper" },
  VL_GRAIN: { of: "grain", kind: "float", min: 0.25, max: 40, step: 0.05,
    label: "Texture size", group: "Paper" },
  VL_FIBRES: { of: "fibres", kind: "float", min: 0, max: 1.5, step: 0.02,
    label: "Fibres", group: "Paper" },
  VL_SHOW_THRU: { of: "contentShowThrough", kind: "float", min: 0, max: 1, step: 0.02,
    label: "Texture on artwork", group: "Paper" },

  // ── the vignette ──────────────────────────────────────────────────────────
  VL_VIG_AMOUNT: { of: "vignette", kind: "float", min: 0, max: 1, step: 0.02,
    label: "Amount", group: "Vignette" },
  VL_VIG_TINT: { of: "vignetteTint", kind: "color", label: "Colour", group: "Vignette" },
  VL_VIG_SIZE: { of: "vignetteSize", kind: "float", min: 0, max: 1.4, step: 0.01,
    label: "Size", group: "Vignette" },
  VL_VIG_SOFT: { of: "vignetteSoftness", kind: "float", min: 0.05, max: 1.5, step: 0.01,
    label: "Softness", group: "Vignette" },
  VL_VIG_SHAPE: { of: "vignetteShape", kind: "float", min: 0, max: 1, step: 0.02,
    label: "Shape: square to round", group: "Vignette" },

  // ── the ink ───────────────────────────────────────────────────────────────
  VL_INK_DEPTH: { of: "inkDepth", kind: "float", min: 0, max: 0.95, step: 0.01,
    label: "Ink depth", group: "Ink" },
  VL_INK_POOL: { of: "inkPool", kind: "float", min: 0, max: 1.5, step: 0.02,
    label: "Edge darkening", group: "Ink" },
  VL_INK_GRAIN: { of: "inkGrain", kind: "float", min: 0, max: 1, step: 0.01,
    label: "Texture in strokes", group: "Ink" },
  VL_INK_SEPIA: { of: "inkSepia", kind: "float", min: 0, max: 1, step: 0.01,
    label: "Warmth", group: "Ink" },

  // ── the folds ─────────────────────────────────────────────────────────────
  VL_CREASE: { of: "crease", kind: "float", min: 0, max: 0.4, step: 0.005,
    label: "Depth", group: "Crease" },
  VL_CREASE_WIDTH: { of: "creaseWidth", kind: "float", min: 0.0005, max: 0.06, step: 0.0005,
    label: "Width", group: "Crease" },
  VL_CREASE_BAL: { of: "creaseBalance", kind: "float", min: 0.4, max: 1.6, step: 0.01,
    label: "Flank balance", group: "Crease" },
  VL_CREASE_JIT: { of: "creaseJitter", kind: "float", min: 0, max: 1.2, step: 0.01,
    label: "Edge roughness", group: "Crease" },
  VL_CREASE_JIT_CYC: { of: "creaseJitterScale", kind: "float", min: 40, max: 2000, step: 10,
    label: "Roughness scale", group: "Crease" },
  VL_CREASE_DRIFT: { of: "creaseDrift", kind: "float", min: 0, max: 1.5, step: 0.01,
    label: "Slow drift", group: "Crease" },
  VL_CREASE_UNEVEN: { of: "creaseUneven", kind: "float", min: 0, max: 1, step: 0.01,
    label: "Unevenness", group: "Crease" },
  VL_CREASE_UNEVEN_CYC: { of: "creaseUnevenScale", kind: "float", min: 2, max: 400, step: 1,
    label: "Unevenness scale", group: "Crease" },
};

const glslFloat = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const glslVec3 = (c: readonly number[]) => `vec3(${c.map(glslFloat).join(", ")})`;

/**
 * The values that are NOT dials, compiled in as literals.
 *
 * These are the fitted ones — solved against the reference's own pyramid and
 * meaningless to drag: the octave chain's frequencies and weights, the mark
 * nonlinearity's shape, the threshold that tells paper from artwork. Exposing
 * them bought a panel nobody could read and a dozen ways to make the sheet look
 * wrong. What is left on the panel is what a person can judge by looking.
 */
const vellumFixedConsts = `
const float VL_TONE           = ${glslFloat(VELLUM.tone)};
const float VL_MARK_TH        = ${glslFloat(VELLUM.markThreshold)};
const float VL_MARK_POW       = ${glslFloat(VELLUM.markPower)};
const float VL_MARK_TINT_GAIN = ${glslFloat(VELLUM.markTintGain)};
const vec3  VL_KNEE           = ${glslVec3(VELLUM.knee)};
const float VL_BASE_CYC       = ${glslFloat(VELLUM.baseCycles)};
const float VL_TOP_PER_PX     = ${glslFloat(VELLUM.topPerPixel)};
const float VL_STRETCH        = ${glslFloat(VELLUM.stretch)};
const float VL_COVER_DEAD     = ${glslFloat(VELLUM.coverDead)};
const float VL_COVER_FULL     = ${glslFloat(VELLUM.coverFull)};
const float VL_INK_POOL_W     = ${glslFloat(VELLUM.inkPoolWidth)};
const vec3  VL_SEPIA_TINT     = ${glslVec3(VELLUM.sepiaTint)};
const float VL_FIB_CELLS      = ${glslFloat(VELLUM.fibreCells)};
const float VL_FIB_DENSITY    = ${glslFloat(VELLUM.fibreDensity)};
/** How many creases the shader is built to carry. */
#define VL_CREASE_MAX 8

`;

/**
 * The paper's MATERIAL — not part of the surface at all.
 *
 * These are `MeshStandardMaterial` properties, and they are on the panel
 * because the page is a LIT 3D OBJECT: how it takes the light is half of how
 * the paper feels, and no amount of turning the surface reaches it. Roughness
 * decides whether the sheet is matte parchment or something with a sheen;
 * reflection is how much of the room's HDR it picks up; brightness is the
 * material's own neutral colour, which is the exposure dial
 * (`VELLUM_LIGHT_SCALE`) that keeps the page off the clipping point.
 *
 * They are applied by WRITING TO THE MATERIAL rather than to a uniform, so they
 * carry a property name instead of a shader name.
 */
export const VELLUM_MATERIAL_DIALS = {
  roughness: { min: 0.3, max: 1, step: 0.01, label: "Roughness", group: "Material" },
  envMapIntensity: { min: 0, max: 2, step: 0.02, label: "Reflection", group: "Material" },
  brightness: { min: 0.2, max: 1, step: 0.01, label: "Brightness", group: "Material" },
} as const;

export type VellumMaterialDial = keyof typeof VELLUM_MATERIAL_DIALS;

export const VELLUM_MATERIAL_DEFAULTS: Record<VellumMaterialDial, number> = {
  roughness: 0.3,
  envMapIntensity: 0.98,
  brightness: 0.61,
};

/**
 * The live paper material, set by `PaperMaterial` once it exists.
 *
 * The same singleton pattern as `VELLUM_UNIFORMS`, for the same reason: the dev
 * panel is DOM, mounted outside the Canvas, and has to reach the one material
 * the page is drawn with without any of it becoming React state.
 */
export const VELLUM_MATERIAL: { current: MeshStandardMaterial | null } = {
  current: null,
};

export function applyVellumMaterial(prop: VellumMaterialDial, value: number): void {
  const m = VELLUM_MATERIAL.current;
  if (!m) return;
  // `brightness` is the material's neutral colour — see VELLUM_LIGHT_SCALE.
  if (prop === "brightness") m.color.setScalar(value);
  else m[prop] = value;
  m.needsUpdate = true;
}

export function readVellumMaterial(prop: VellumMaterialDial): number {
  const m = VELLUM_MATERIAL.current;
  if (!m) return VELLUM_MATERIAL_DEFAULTS[prop];
  return prop === "brightness" ? m.color.r : m[prop];
}

/** The uniform declarations the shader needs, generated from the table. */
const vellumUniformDecls = Object.entries(VELLUM_DIALS)
  .map(
    ([name, dial]) =>
      `uniform ${dial.kind === "float" ? "float" : "vec3 "} ${name};`,
  )
  .join("\n");

/**
 * THE LIVE VALUES — one module-level object, mutated in place.
 *
 * A singleton rather than React state, following `paperBowAmount` in
 * `SinglePaper`: there is only ever one paper material, these are global taste
 * settings rather than component state, and writing to `.value` has to be able
 * to happen without re-rendering the scene that is being measured. The dev
 * panel writes here; `usePaperMasking` hands the same objects to three.
 */
export const VELLUM_UNIFORMS: Record<string, { value: number | Vector3 }> =
  Object.fromEntries(
    Object.entries(VELLUM_DIALS).map(([name, dial]) => {
      const v = VELLUM[dial.of] as number | readonly number[];
      return [
        name,
        {
          value: typeof v === "number" ? v : new Vector3(v[0], v[1], v[2]),
        },
      ];
    }),
  );

/** Put every dial back to the value written in `VELLUM`. */
export function resetVellumUniforms(): void {
  for (const [name, dial] of Object.entries(VELLUM_DIALS)) {
    const v = VELLUM[dial.of] as number | readonly number[];
    const u = VELLUM_UNIFORMS[name];
    if (typeof v === "number") u.value = v;
    else (u.value as Vector3).set(v[0], v[1], v[2]);
  }
}

/**
 * The current dial values, printed as the `VELLUM` block to paste back into
 * this file — so a session spent on the sliders ends as source, not as a
 * number written on a napkin.
 */
/**
 * A fingerprint of the SOURCE defaults — every dial and every material value.
 *
 * WHY THE PANEL NEEDS ONE. It remembers a session in localStorage and restores
 * it on load, which is what stops an afternoon of tuning evaporating on a
 * refresh. But it also means a stored session outranks the file FOREVER: paste
 * a new set of defaults into `VELLUM`, reload, and the page still shows the old
 * ones, with nothing on screen to say why. "I sent you the numbers and they
 * were not applied" is what that looks like from the outside, and the numbers
 * were applied — they were just being overruled by the browser.
 *
 * So the stored session carries this fingerprint. When the file's defaults
 * change the fingerprint changes with them, the stored session is recognised as
 * older than the source, and the source wins. Editing the file is once again
 * the way to change what the page shows.
 */
export function vellumDefaultsSignature(): string {
  const dials = Object.values(VELLUM_DIALS).map((d) => {
    const v = VELLUM[d.of] as number | readonly number[];
    return typeof v === "number" ? String(v) : v.join(",");
  });
  return [...dials, ...Object.values(VELLUM_MATERIAL_DEFAULTS)].join("|");
}

export function vellumUniformsAsSource(): string {
  const num = (n: number) => String(Math.round(n * 10000) / 10000);

  const dials = Object.entries(VELLUM_DIALS).map(([name, dial]) => {
    const u = VELLUM_UNIFORMS[name].value;
    const text =
      typeof u === "number"
        ? num(u)
        : `[${[u.x, u.y, u.z].map((n) => Math.round(n * 1000) / 1000).join(", ")}] as const`;
    return `  ${dial.of}: ${text},`;
  });

  // The material dials live on the material rather than in the uniform table,
  // and they were LEFT OUT of this until it was noticed: three sliders that
  // could be tuned all afternoon and then vanished the moment they were copied,
  // so the paste that came back was always missing the surface's own feel. They
  // land in a different object, so they get their own block.
  const material = Object.keys(VELLUM_MATERIAL_DIALS).map(
    (prop) => `  ${prop}: ${num(readVellumMaterial(prop as VellumMaterialDial))},`,
  );

  return [
    "// paste into VELLUM in vellumSurface.ts",
    ...dials,
    "",
    "// paste into VELLUM_MATERIAL_DEFAULTS in vellumSurface.ts",
    ...material,
  ].join("\n");
}

/**
 * The surface function, as a GLSL chunk to be pasted above `main()`.
 *
 * Everything is prefixed `vl` so nothing can collide with a three.js chunk, and
 * the octave chain is UNROLLED: indexing anything by a running loop variable is
 * the case weak GLSL ES drivers handle worst, and several answer it by
 * unrolling it themselves, badly.
 *
 * `VL_OCTAVES` is injected by the caller from the GPU tier. It buys DISTANCE,
 * not appearance — since the chain is anchored at its finest end, dropping
 * octaves removes the coarsest ones the reader is currently looking through,
 * and the sheet keeps its grain either way.
 */
export const VELLUM_SURFACE_GLSL = `
${vellumFixedConsts}
${vellumUniformDecls}

/**
 * Dave Hoskins' hash12, and the constants matter.
 *
 * Sine-free: a sin()-based hash returns different last bits on different
 * drivers, and the sheet would not be the same sheet on two machines. The first
 * version of this file used the three-component constants from his hash33 by
 * mistake, which is NOT a uniform hash — measured over 360k lattice points it
 * came back with a mean of 0.384 and a histogram falling monotonically from 17%
 * in the lowest bin to 4% in the highest. Noise built on it is biased dark and
 * clumps, which is half of why the first attempt looked like damage. These
 * constants measure flat: mean 0.4999, chi-square 7 against uniform, and they
 * hold at coordinates in the tens of thousands, which is where a deep zoom puts
 * them.
 */
float vlHash(vec2 p) {
  vec3 q = fract(vec3(p.x * 0.1031, p.y * 0.11369, p.x * 0.13787));
  q += dot(q, q.yzx + 19.19);
  return fract((q.x + q.y) * q.z);
}

/** Two independent randoms per cell, for the fibres. */
vec2 vlHash2(vec2 p) {
  return vec2(vlHash(p), vlHash(p + 71.53));
}

/** Value noise, zero mean, variance 0.184. */
float vlValue(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(vlHash(i),                  vlHash(i + vec2(1.0, 0.0)), u.x),
    mix(vlHash(i + vec2(0.0, 1.0)), vlHash(i + vec2(1.0, 1.0)), u.x),
    u.y) * 2.0 - 1.0;
}

/**
 * How much of a feature at cyc cycles across the page survives at this zoom,
 * given px page-widths per screen pixel. Faded out before it reaches half a
 * cycle per pixel, which is where sampling theory says detail becomes static.
 *
 * The octave ladder no longer needs this — its crossfaded window does the same
 * job by construction. The FIBRES do: they are objects at a fixed size on the
 * sheet, so once the page is small enough on screen they have to be faded out
 * rather than point-sampled into a shimmer.
 */
float vlBand(float cyc, float px) {
  return 1.0 - smoothstep(0.26, 0.62, cyc * px);
}


/**
 * The pink field, weighted to the reference's own spectrum.
 *
 * THREE OCTAVES ARE FIXED AND NINE SLIDE. The sliding ones are positioned from
 * the pixel footprint so the finest of them always lands just under what the
 * screen can resolve — which kills the aliasing at page-wide zoom and supplies
 * fresh detail at every step closer, from the same generator and with the same
 * statistics. The three fixed ones are the sheet's broadest unevenness, kept
 * because the sliding chain has left them far behind by the time the reader is
 * close, and a page with no large-scale variation at all looks laminated.
 *
 * Every octave is weighted by its ACTUAL frequency rather than by its place in
 * the chain — see \`VELLUM.tilt\` for why that is what keeps the paper from
 * gaining contrast as the reader comes closer.
 *
 * The offsets keep the octaves off a shared lattice; without them the corners
 * of every cell line up and the field acquires a faint plaid that is invisible
 * until it is pointed out and impossible to ignore afterwards.
 *
 * Returned with unit variance, so \`VELLUM\`'s figures read as fractions of the
 * page's brightness.
 */
/**
 * A FIXED LADDER, with a moving window over it.
 *
 * THIS IS THE FIX FOR THE TEXTURE SWIMMING UNDER A ZOOM, and the bug was in the
 * design rather than in any number. The chain used to be positioned from the
 * pixel footprint directly — c = top / span — so every octave's frequency
 * changed CONTINUOUSLY as the reader came closer. The statistics held perfectly
 * and the paper still measured the same at every distance, but the pattern
 * slid and re-formed under the reader, which is the one thing a sheet of paper
 * cannot do. Nothing in the panel could have fixed that; it was the anchoring.
 *
 * So the frequencies are nailed to integer rungs — octave k is always
 * VL_BASE_CYC * 2^k, at every zoom, forever. A given rung is a fixed function
 * of position on the page: once drawn, it never moves again. What the zoom
 * changes is only WHICH rungs are in the window.
 *
 * The window's edges crossfade, so even the arrival of a new rung is not an
 * event. kTop is fractional; its whole part picks the window and its fraction
 * weights the two ends — the newest rung fades in from nothing as the reader
 * approaches, the oldest fades out. When kTop crosses an integer the window
 * shifts by one, and at that instant the newest rung's weight is zero and the
 * oldest's is one, so the two arrangements are identical. Nothing pops and
 * nothing slides.
 */
void vlPink(vec2 p, float px, out float n, out float nFine) {
  // VL_GRAIN scales every frequency at once — the one dial that stands in for
  // the whole chain. Scaling the COORDINATE rather than each frequency keeps
  // the band-limiting honest: the footprint is scaled with it, so a finer grain
  // still fades out exactly where the screen stops resolving it.
  p *= VL_GRAIN;
  px *= VL_GRAIN;

  // The three below the knee, at the sheet's own broadest scales. Fixed
  // frequencies, so these never moved and still do not.
  float s = vlValue(p * VL_BASE_CYC)               * VL_KNEE.x
          + vlValue(p * VL_BASE_CYC * 2.0 + 17.3)  * VL_KNEE.y
          + vlValue(p * VL_BASE_CYC * 4.0 + 29.1)  * VL_KNEE.z;

  // Which rung sits at the limit of what this screen resolves, as a fractional
  // octave above the base.
  float kTop = log2(max(VL_TOP_PER_PX / max(px * VL_BASE_CYC, 1e-7), 1.0));
  float kEnd = floor(kTop);
  float frac = kTop - kEnd;

  // The window's bottom rung, snapped to the ladder. exp2 of an integer is
  // exact, so the frequencies are exactly the ladder's and not near it.
  float c = VL_BASE_CYC * exp2(max(kEnd - float(VL_SLIDE - 1), 0.0));

  // Each rung is turned a little against the last. Value noise lives on a
  // square lattice and exact doubling would stack every lattice on the one
  // below it — the offsets alone leave a faint plaid that is invisible until
  // it is pointed out and impossible to ignore afterwards.
  const mat2 R = mat2(0.8090, -0.5878, 0.5878, 0.8090);
  vec2 q = p * vec2(1.0, 1.0 / VL_STRETCH);

  // Coarse end: tone only — see VELLUM.markThreshold for what happens when the
  // marks are allowed to read from down here. The first rung carries the
  // window's fade-out.
  float w = 1.0 - frac;
  float coarse = 0.0;
  coarse += vlValue(q * c +  34.6) * w;  c *= 2.0;  q = R * q;  w = 1.0;
  #if VL_SLIDE >= 7
    coarse += vlValue(q * c +  51.9);  c *= 2.0;  q = R * q;
    coarse += vlValue(q * c +  69.2);  c *= 2.0;  q = R * q;
  #endif
  #if VL_SLIDE >= 9
    coarse += vlValue(q * c +  86.5);  c *= 2.0;  q = R * q;
    coarse += vlValue(q * c + 103.8);  c *= 2.0;  q = R * q;
  #endif
  s += coarse;

  // Fine end: carries the marks as well as its share of the tone. The last
  // rung carries the window's fade-in.
  float f = vlValue(q * c + 121.1);  c *= 2.0;  q = R * q;
  f += vlValue(q * c + 138.4);  c *= 2.0;  q = R * q;
  f += vlValue(q * c + 155.7);  c *= 2.0;  q = R * q;
  f += vlValue(q * c + 173.0) * frac;

  n = (s + f) / VL_PINK_NORM;
  nFine = f / VL_FINE_NORM;
}

/**
 * FIBRES — short threads of pulp lying where the sheet dried, and the thing
 * that separates handmade paper from a noise field.
 *
 * The reference sheets are covered in them: little dark slivers a millimetre or
 * two long, at every angle, sparse enough to count. No amount of cloudy mottle
 * reproduces that, because a fibre is an OBJECT and mottle is a field.
 *
 * WHY THEY ARE SEGMENTS AND NOT DOTS. An earlier version of this file drew
 * round follicles and the verdict was immediate and correct: a small dark
 * circle on paper reads as damage. A fibre reads as material for three reasons
 * — it is elongated, its angle is arbitrary, and no two are the same length or
 * weight. All three come free from the distance to a randomly placed SEGMENT.
 *
 * The cell grid is at a FIXED frequency in page coordinates, so every fibre has
 * a permanent position on the sheet and none of them move when the reader comes
 * closer — the same discipline the octave ladder now follows. Zooming in makes
 * a fibre bigger, which is exactly what a real one does.
 */
float vlFibres(vec2 p, float cells, float px, float density, float len) {
  // WHAT THIS LAYER IS WORTH ON AVERAGE, and why the number is here at all.
  //
  // A fibre finer than a pixel cannot be drawn — that is Nyquist, not a choice.
  // But fading it to NOTHING is a second, avoidable mistake: these are dark
  // objects, so losing them does not merely smooth the sheet, it LIGHTENS it.
  // Tune the paper zoomed in and then pull back, and the tone lifts and the
  // grain evaporates — which is exactly the complaint.
  //
  // So when the threads stop being resolvable they hand over their average
  // darkening instead of disappearing. That is all a mip level ever is: the
  // mean of what you can no longer see. Solved rather than guessed — a capsule
  // of mean length 1.6·len and mean radius 0.18·len covers 0.6845·len² of its
  // cell, one cell in density holds one, and the weight averages 0.65.
  float mean = density * len * len * 0.445;

  float band = vlBand(cells * 2.5, px);
  if (band <= 0.003) return mean;

  vec2 g = p * cells;
  vec2 cell = floor(g);
  float k = vlHash(cell + 5.3);
  if (k > density) return mean * (1.0 - band);   // an empty cell still averages

  vec2 f = fract(g);
  vec2 h = vlHash2(cell * 1.7 + 11.0);
  vec2 m = vlHash2(cell + 2.9);

  // A segment: arbitrary angle, varied length, placed anywhere in the cell.
  float ang = h.x * 3.14159265;
  vec2 halfSeg = vec2(cos(ang), sin(ang)) * len * (0.35 + 0.9 * h.y);
  vec2 a = 0.25 + 0.5 * m - halfSeg;

  vec2 pa = f - a;
  vec2 ba = halfSeg * 2.0;
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * t);

  // Thickness and weight both vary, so no two threads read alike.
  float w = len * (0.10 + 0.16 * m.x);
  float aa = max(px * cells, 1e-5);
  float drawn = (1.0 - smoothstep(w - aa, w + aa, d)) * (0.3 + 0.7 * h.x);

  // Drawn while it can be seen, averaged once it cannot, and a smooth handover
  // in between — so the sheet's tone never moves with the zoom.
  return mix(mean, drawn, band);
}

/**
 * CREASES — where the sheet was folded, and still shows it.
 *
 * Modelled on public/paper-material/crease-normal-1.png, which is what the folding
 * papers use: a strip that is flat blue almost everywhere with one wandering
 * ridge through it, never straight for more than a centimetre and never the
 * same strength twice along its length. Reproducing it as geometry rather than
 * as that image is what lets it run at the atlas's size without stretching, and
 * what lets it sit between EVERY row instead of only where a band mesh was
 * placed.
 *
 * A RIDGE IS NOT A LINE, and drawing it as one is the whole difference between
 * a fold and a rule ruled on paper. A fold catches the light on the flank
 * turned towards it and shades the flank turned away, so what the eye is given
 * is a bright edge immediately beside a dark one, with nothing at the crest
 * itself. That is the derivative of a bell curve, which is used here directly:
 * smooth everywhere, zero at the centre, equal and opposite either side, and —
 * because it integrates to nothing — it changes the sheet's tone not at all.
 *
 * Three things stop it reading as drawn on:
 *   · the centre WANDERS, on two scales, so it is never straight;
 *   · the strength VARIES along the length, so parts of the fold have almost
 *     opened out and parts have not;
 *   · both wander and strength are functions of position on the page, so the
 *     crease is in the same place at every zoom, like everything else here.
 */
float vlCreases(vec2 uv, vec2 aspect, float px) {
  float acc = 0.0;
  float w = max(VL_CREASE_WIDTH, px * 1.5);   // never thinner than a pixel

  for (int i = 0; i < VL_CREASE_MAX; i++) {
    if (float(i) >= uCreaseCount) break;

    float seed = float(i) * 37.0;
    float x = uv.x * aspect.x;

    // THE EDGE, not a meander. Measured off the reference: the centre's
    // deviation is 1.07px in a 33px strip and its energy is spread almost flat
    // across every scale, with the MOST at the two-pixel end. So what is
    // actually there is a straight line with a rough edge, and it is built from
    // two fine octaves at a fraction of the ridge's own width.
    float jitter = (vlValue(vec2(x * VL_CREASE_JIT_CYC + seed, seed))
                  + vlValue(vec2(x * VL_CREASE_JIT_CYC * 2.3 + seed, seed + 9.0)) * 0.5)
                 * w * VL_CREASE_JIT;

    // ...and the one slow term the measurement does support: the residual below
    // 256px, a drift of under half a pixel across the whole sheet.
    float drift = vlValue(vec2(x * 0.8 + seed, seed + 4.0)) * w * VL_CREASE_DRIFT;

    float d = (uv.y - uCreaseY[i]) * aspect.y + jitter + drift;

    // Pressed nearly all the way along, with occasional weak spots — measured
    // at mean 0.945 of peak, and dipping to 0.53 at its weakest. A cubed noise
    // keeps it near full and lets it fall away rarely, which is that shape.
    float weak = vlValue(vec2(x * VL_CREASE_UNEVEN_CYC + seed, seed + 21.0)) * 0.5 + 0.5;
    float strength = 1.0 - VL_CREASE_UNEVEN * weak * weak * weak;

    // The bell's derivative, normalised so its peak is 1.
    float t = d / w;
    float ridge = -2.332 * t * exp(-t * t);

    // The two flanks are NOT equal — one faces the light and one turns away.
    // Measured on the reference at 106.9 bright against 113.7 dark. Scaling one
    // side keeps the profile continuous, since it passes through zero at the
    // crest where the scaling would otherwise show.
    ridge *= ridge > 0.0 ? VL_CREASE_BAL : 1.0;

    acc += ridge * strength;
  }

  // Gone before the ridge is thinner than the screen can hold, and harmless
  // when it goes: this term averages to zero, so losing it costs no tone.
  return acc * vlBand(1.0 / max(w, 1e-5), px);
}

/**
 * The whole surface at one point: what to multiply the page colour by.
 *
 * @param uv     the page, 0..1
 * @param aspect (1, height/width) — the noise has to be isotropic ON THE PAGE,
 *               not in UV, or the grain stretches with the paper
 * @param fine   the sheet's fine texture on its own, for the ink to be granular
 *               against. Free: the chain has already computed it.
 */
vec3 vlSurface(vec2 uv, vec2 aspect, out float fine) {
  vec2 p = uv * aspect;
  float px = max(fwidth(p.x), fwidth(p.y));

  float n, nFine;
  vlPink(p, px, n, nFine);
  fine = nFine;

  // The clean half: cloudiness, symmetric, faint.
  float tone = n * VL_TONE;

  // The marks. Only the field's lower tail becomes one, so most of the sheet is
  // untouched paper and what is touched is touched softly — see
  // VELLUM.markThreshold for why the asymmetry is the whole point.
  float mark = pow(max(0.0, -nFine - VL_MARK_TH), VL_MARK_POW) * VL_MARK_AMP;

  // Two fibre grids at fixed frequencies: one the reader sees with the whole
  // page on screen, one that only becomes legible on the way in. Both are
  // permanent features of the sheet, not detail invented by the zoom.
  float fib = vlFibres(p, VL_FIB_CELLS, px, VL_FIB_DENSITY, 0.30)
            + vlFibres(p * 1.7 + 43.0, VL_FIB_CELLS * 3.1, px * 3.1,
                       VL_FIB_DENSITY * 0.8, 0.26) * 0.75;

  float lum = 1.0 + (tone - mark) * VL_INTENSITY - fib * VL_FIBRES;

  // Nothing on this sheet goes grey as it darkens; it goes brown.
  vec3 surface = mix(
      vec3(1.0),
      VL_MARK_TINT,
      clamp((mark * VL_INTENSITY * VL_MARK_TINT_GAIN) + fib * VL_FIBRES * 3.0,
            0.0, 1.0)) * lum;

  // THE VIGNETTE.
  //
  // Two ways of asking how far from the middle a pixel is, blended by
  // VL_VIG_SHAPE: the BOX distance, which follows the sheet's own rectangle and
  // darkens the four sides evenly, and the RADIAL one, which is a circle from
  // the centre and reaches the corners hardest. Everything between is available
  // and most of it looks like something.
  //
  // Pushed off true by the noise field itself, so the darkening follows the
  // skin rather than the rectangle it was cut into — a vignette that traces the
  // frame exactly is the one thing that reads as a filter.
  vec2 e = abs(uv - 0.5) * 2.0;
  float d = mix(max(e.x, e.y), length(e), VL_VIG_SHAPE) + n * 0.08;
  float v = smoothstep(VL_VIG_SIZE, VL_VIG_SIZE + VL_VIG_SOFT, d) * VL_VIG_AMOUNT;
  surface *= mix(vec3(1.0), VL_VIG_TINT, v);

  // The folds, last: they are relief on the finished sheet rather than
  // something mixed into its colour, so they lighten and darken whatever the
  // paper turned out to be.
  surface *= 1.0 + vlCreases(uv, aspect, px) * VL_CREASE;

  return surface;
}
`;

/**
 * What the INK does when it meets that surface — and the one call site the
 * paper's fragment shader needs.
 *
 * Vellum is not blotting paper. It is sized and nearly non-absorbent, so ink
 * does not wick into it and a hairline stays a hairline however long it sits —
 * which is why the great manuscript hands were written on skin, and why
 * blurring text has never once looked like calligraphy. What ink does instead
 * is dry ON the surface, and it leaves three marks doing it: it POOLS at the
 * rim of every stroke as the water leaves, it GRANULATES against the grain it
 * was dragged over, and where it is thin it shows the brown of iron gall
 * instead of black.
 *
 * All three are derived from the page that is ALREADY drawn — no second pass,
 * no separate ink buffer. `map_fragment` has just left `diffuseColor` as
 * (material colour x page), so dividing the material colour back out recovers
 * what the page itself put at this pixel, and how far that is below bare paper
 * is how much ink is on it.
 *
 * WHAT IS DELIBERATELY LEFT ALONE. Anything with a hue of its own — a
 * rubricated heading, the coloured capsules the whole reading depends on — is
 * body colour, not ink, so the sepia is weighted off by chroma and those keep
 * their exact colour. And the PAPER does not cross this line at all: see
 * `VELLUM.contentShowThrough`.
 */
export const VELLUM_INK_GLSL = `
const vec3 VL_LUMA = vec3(0.2126, 0.7152, 0.0722);

/** How dark a mark is, against the bare paper it was made on. 0 is paper, 1 solid. */
float vlInk(vec3 pageCol, float bareLum) {
  return clamp(1.0 - dot(pageCol, VL_LUMA) / max(bareLum, 1e-4), 0.0, 1.0);
}

/**
 * Lay the page onto the paper, and the ink into it.
 *
 * @param matColor  the material's own colour (three's \`diffuse\`), so the page
 *                  can be recovered out of \`diffuseColor\`
 * @param pageBase  the colour the page is CLEARED to — bare paper, before any
 *                  of this
 * @param surface   returned, so a lifted section can reveal the same sheet the
 *                  rest of the page is made of
 */
void vlApply(
  inout vec4 diffuseColor,
  vec3 matColor,
  vec2 mapUv,
  vec2 aspect,
  vec3 pageBase,
  out vec3 surface
) {
  float fine;
  surface = vlSurface(mapUv, aspect, fine);

  vec3 page = diffuseColor.rgb / max(matColor, vec3(1e-4));
  float bareLum = dot(pageBase, VL_LUMA);
  float ink = vlInk(page, bareLum);

  // Bare paper takes the whole surface; anything drawn takes none of it.
  //
  // A DEAD ZONE BEFORE THE RAMP, and it is not a nicety. Bare paper is supposed
  // to match pageBase exactly, and when it did not — one hard-coded colour in
  // SurahLayout, see pageBackgroundColor — this read every pixel of the sheet
  // as "drawn on" and multiplied the entire surface out. The page stayed flat
  // and there was nothing on screen to say why. Starting the ramp a little
  // above zero means an exact match is not load-bearing: a small disagreement
  // costs nothing, and only a real mark still reads as one.
  float covered = smoothstep(VL_COVER_DEAD, VL_COVER_FULL, distance(page, pageBase));

  // THE PAPER'S COLOUR. Bare paper is repainted as VL_PAPER; anything drawn is
  // left exactly as it was authored. pageBase stays the fixed reference the
  // test above is made against — it is what the buffer was cleared to — so
  // moving this colour cannot move the line between paper and artwork.
  diffuseColor.rgb = mix(matColor * VL_PAPER, diffuseColor.rgb, covered);

  // How much of the paper shows through what is drawn on it — and it is
  // weighted by (1 - ink), which is the whole answer to "no texture on the
  // script, a little on the capsules".
  //
  // The shader can already tell them apart without being told: a capsule is a
  // PALE fill, so its ink reads near zero and it takes its share of the paper;
  // the script is dark, its ink reads near one, and the share falls to nothing.
  // One weight, no masks, and it follows the artwork wherever it moves.
  float showThru = VL_SHOW_THRU * (1.0 - ink);
  diffuseColor.rgb *= mix(surface, vec3(1.0), covered * (1.0 - showThru));

  if (ink < 0.02) return;

  // DEPTH — the ink's own contrast, and the first thing to reach for when the
  // script looks weak. Zero on bare paper and full on a solid stroke, so it
  // deepens the writing without touching the sheet it is on. The reference
  // sheets are faint because the ink was thinned; there is no reason the page
  // has to be.
  diffuseColor.rgb *= 1.0 - ink * VL_INK_DEPTH;

  // Granulation, from the finest octave only. Ships at zero: on the script it
  // reads as texture ON the text rather than as ink, which is the one place
  // texture is not wanted at all.
  diffuseColor.rgb *= 1.0 - fine * VL_INK_GRAIN * ink;

  // Pooling, measured against the page at a FIXED width in page units rather
  // than in pixels — the ring belongs to the ink, so it has to widen with the
  // zoom exactly as the stroke it sits on does. One screen pixel is the floor,
  // below which there is nothing left to measure.
  float px = max(fwidth(mapUv.x), fwidth(mapUv.y));
  float w = max(VL_INK_POOL_W, px);
  vec2 o = vec2(w, w / max(aspect.y, 1e-4));
  float ring = 0.25 * (
      vlInk(texture2D(map, mapUv + vec2(o.x, 0.0)).rgb, bareLum)
    + vlInk(texture2D(map, mapUv - vec2(o.x, 0.0)).rgb, bareLum)
    + vlInk(texture2D(map, mapUv + vec2(0.0, o.y)).rgb, bareLum)
    + vlInk(texture2D(map, mapUv - vec2(0.0, o.y)).rgb, bareLum));
  diffuseColor.rgb *= 1.0 - clamp(ink - ring, 0.0, 1.0) * VL_INK_POOL;

  // The sepia — thin places only, neutral marks only.
  float mx = max(max(page.r, page.g), page.b);
  float mn = min(min(page.r, page.g), page.b);
  float chroma = clamp((mx - mn) / max(mx, 1e-4) * 4.0, 0.0, 1.0);
  diffuseColor.rgb *= mix(vec3(1.0), VL_SEPIA_TINT, ink * VL_INK_SEPIA * (1.0 - chroma));
}
`;

/**
 * Everything above, in the order it has to be declared, ready to be spliced in
 * immediately before `main()`.
 *
 * BEFORE `main()` AND NOT AT THE TOP OF THE FILE, which is where the paper's
 * other uniforms go: `vlApply` reads three's own `map` sampler for the ink
 * pooling, and that is declared by `map_pars_fragment` partway down the shader.
 * Anything placed above it names a uniform that does not exist yet, and the
 * page comes back black — with a compile error on some drivers and silently on
 * the rest.
 */
/**
 * How many octaves each tier can afford, and the two figures that follow from
 * the count.
 *
 * There is no `span` any more: the ladder is ABSOLUTE — octave k is always
 * `VL_BASE_CYC * 2^k` — so how far it reaches is decided by the window's width
 * (`VL_SLIDE`) rather than by a stored figure. See `vlPink`.
 *
 * `norm` is the standard deviation of that exact chain, measured over 60k
 * samples of this exact noise at these exact frequencies and weights. Dividing
 * by it hands the fit a field of unit variance, so every figure in `VELLUM`
 * reads as a fraction of the page's brightness whatever the tier.
 *
 * IT IS ALSO THE PROOF THAT THE ZOOM CLAIM IS TRUE. Measured at page-wide, at
 * ten times and at a hundred times, the twelve-octave chain comes back 1.622,
 * 1.617 and 1.626, and its fine half 0.861, 0.857 and 0.855 — the same sheet,
 * to a fifth of a percent, however close the reader gets. That is what a flat spectrum buys and what no photograph can
 * do: there is no magnification at which this surface is being stretched,
 * because at every magnification it is being generated.
 */
const VELLUM_CHAINS = {
  8: { norm: 1.727, fineNorm: 0.858 },
  10: { norm: 1.825, fineNorm: 0.856 },
  12: { norm: 1.919, fineNorm: 0.855 },
} as const;

export type VellumOctaves = keyof typeof VELLUM_CHAINS;

/**
 * Everything above, in the order it has to be declared, ready to be spliced in
 * immediately before `main()`.
 *
 * BEFORE `main()` AND NOT AT THE TOP OF THE FILE, which is where the paper's
 * other uniforms go: `vlApply` reads three's own `map` sampler for the ink
 * pooling, and that is declared by `map_pars_fragment` partway down the shader.
 * Anything placed above it names a uniform that does not exist yet, and the
 * page comes back black — with a compile error on some drivers and silently on
 * the rest.
 */
export function vellumGlsl(octaves: VellumOctaves): string {
  const chain = VELLUM_CHAINS[octaves];
  return `
#define VL_OCTAVES ${octaves}
#define VL_SLIDE ${octaves - 3}
const float VL_PINK_NORM  = ${chain.norm.toFixed(4)};
const float VL_FINE_NORM  = ${chain.fineNorm.toFixed(4)};
${VELLUM_SURFACE_GLSL}
${VELLUM_INK_GLSL}
`;
}

export function vellumOctavesForTier(
  tier: "high" | "medium" | "low",
): VellumOctaves {
  return tier === "high" ? 12 : tier === "medium" ? 10 : 8;
}
