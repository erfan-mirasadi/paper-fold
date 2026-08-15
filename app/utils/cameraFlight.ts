/**
 * cameraFlight — the path a camera takes from one framed rectangle to another.
 *
 * THE PROBLEM. Easing straight at the new spot is what a zoom-in wants and what
 * a STEP between two zoomed sheets cannot have. Zoomed in, the whole window is
 * one sheet; sliding sideways at that magnification drags a wall of ink past the
 * reader at a speed nothing on it can be read at, and lands them somewhere with
 * no memory of how the two places relate. The move carries no information: it is
 * a smear with a sheet at each end.
 *
 * THE ANSWER, the one Prezi, Google Earth and d3.zoom all converge on, is to
 * pull BACK while travelling and come down again on arrival. Mid-flight the
 * reader sees both sheets and the space between them, so the step SHOWS the
 * layout instead of hiding it — and the ink is far enough away that its motion
 * is a drift rather than a blur.
 *
 * HOW FAR BACK, exactly, is the part worth not guessing at. Van Wijk & Nuij
 * ("Smooth and Efficient Zooming and Panning", InfoVis 2003) solved for the path
 * that holds the APPARENT motion — how fast things slide across the retina —
 * constant for the whole flight, and found the family of optimal paths has a
 * single free parameter: ρ, how much the viewer is willing to zoom out to save
 * travel. Everything else falls out of the two endpoints. Two sheets side by
 * side get a small arc; a jump across the atlas gets a big one; neither is a
 * number anybody had to tune, and no pair of frames can be the one that feels
 * wrong.
 *
 * The implementation below is the same closed form d3-interpolate-zoom uses,
 * with the pure-zoom degenerate case split out (the general formula divides by
 * the travel distance).
 *
 * WHAT THE NUMBERS MEAN. `width` is how wide a slice of the WORLD the view
 * spans at the plane being looked at — not a camera distance, not a scale
 * factor. That is the quantity van Wijk's arithmetic is written in, and the two
 * units have to agree because the formulas add them together: a caller working
 * in camera distance must convert (`2 * distance * tan(fov/2) * aspect`) before
 * it gets here.
 */

/**
 * How much zooming out the flight will spend to save travel.
 *
 * Van Wijk's own user studies put the sweet spot near √2, and it is what d3
 * ships. Two sheets a sheet's width apart pull back about 40% at the midpoint —
 * enough to see where you are going, not so much that the sheets become stamps.
 * Lower it towards 1 for a flatter, more literal pan; raise it past 1.8 and the
 * step starts to feel like a trip to orbit and back.
 */
export const FLIGHT_RHO = Math.SQRT2;

/**
 * Seconds per unit of path length. The path length is already in van Wijk's
 * perceptual units — it counts how much APPARENT motion the flight contains,
 * not how many world units it crosses — so a fixed rate here is what makes a
 * neighbouring step brisk and a cross-atlas jump take its time, without either
 * being timed by hand.
 */
const SECONDS_PER_UNIT = 0.62;

/** Floor and ceiling, so a nudge is not instant and a haul is not a journey. */
const MIN_SECONDS = 0.55;
const MAX_SECONDS = 1.3;

export interface FlightSample {
  /** How far along the straight line between the two focus points, 0…1. */
  travel: number;
  /** How wide a slice of the world the view spans, in world units. */
  width: number;
}

export interface FlightPath {
  /**
   * Length of the path in ρ-units — van Wijk's measure of how much apparent
   * motion the flight contains. 0 when the two views are the same view.
   */
  length: number;
  /** The view at `s` ∈ [0, length]. Writes into `out` and returns it. */
  sample(s: number, out: FlightSample): FlightSample;
}

/** Below this fraction of the view's own width, a move is not a move. */
const STILL = 1e-5;

/** Already there. Length 0 is the caller's signal that there is nothing to fly. */
function stillPath(width: number): FlightPath {
  return {
    length: 0,
    sample(_s, out) {
      out.travel = 1;
      out.width = width;
      return out;
    },
  };
}

/**
 * Plan the flight between two views of the same plane: `distance` world units
 * apart, seen `fromWidth` and `toWidth` wide.
 *
 * Cheap enough to re-plan every frame, which is what a caller should do when
 * the destination can move under it (a page that is still sliding into place, a
 * window being resized): the endpoints are re-read, the path is re-solved, and
 * the flight stays continuous because both are continuous.
 */
export function planFlight(
  distance: number,
  fromWidth: number,
  toWidth: number,
  rho: number = FLIGHT_RHO,
): FlightPath {
  if (!(fromWidth > 0) || !(toWidth > 0)) return stillPath(toWidth);

  // Pure zoom: no line to travel along, so the general form (which divides by
  // the travel distance) has nothing to say and the answer is the plain
  // exponential — which is also what "constant apparent motion" means when the
  // only motion is scale.
  if (!(distance > STILL * fromWidth)) {
    const growth = Math.log(toWidth / fromWidth);
    const length = Math.abs(growth) / rho;
    if (!(length > 0)) return stillPath(toWidth);
    const direction = Math.sign(growth);
    return {
      length,
      sample(s, out) {
        out.travel = Math.min(1, Math.max(0, s / length));
        out.width = fromWidth * Math.exp(rho * s * direction);
        return out;
      },
    };
  }

  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const d2 = distance * distance;
  const w0 = fromWidth;
  const w1 = toWidth;

  // b is where each endpoint sits on the optimal path's hyperbola; r is that
  // point expressed as an arc length along it, so the flight is a straight walk
  // from r0 to r1 and its length is the difference.
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * distance);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * distance);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const length = (r1 - r0) / rho;

  // Endpoints close enough to round into each other, or a caller that handed us
  // a NaN. Neither is a flight.
  if (!Number.isFinite(length) || length <= 0) return stillPath(toWidth);

  const coshR0 = Math.cosh(r0);
  const sinhR0 = Math.sinh(r0);
  const travelScale = w0 / (rho2 * distance);

  return {
    length,
    sample(s, out) {
      const at = rho * s + r0;
      out.travel = travelScale * (coshR0 * Math.tanh(at) - sinhR0);
      out.width = (w0 * coshR0) / Math.cosh(at);
      return out;
    },
  };
}

/** How long a path of this length should take, in seconds. */
export function flightDuration(length: number): number {
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, length * SECONDS_PER_UNIT));
}

/**
 * Smoothstep over the flight's own clock.
 *
 * Van Wijk's path is built to be walked at a CONSTANT rate — that is what makes
 * the apparent motion constant — so easing it is, strictly, a small betrayal of
 * the result. It is worth it at the two ends only: a camera that starts and
 * stops at full speed reads as a cut, and the reader feels the jolt long before
 * they would ever notice the middle running a few percent fast.
 */
export function easeFlight(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
