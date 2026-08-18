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
 * WHERE THIS DEPARTS FROM VAN WIJK, and why. His path is optimal for a reader
 * who wants to GET there; a reader stepping through an atlas one sheet at a
 * time is being shown something, and the optimal path is too efficient to show
 * it. Two amendments, both of them deliberate losses of efficiency:
 *
 *   · A FLOOR under the arc (`FLIGHT_APEX`). The optimal pull-back is sized
 *     from the distance travelled, so two sheets that touch get almost none of
 *     one — correct, and it still lands like a shove sideways rather than a
 *     move between two places. The floor says every flight climbs far enough to
 *     put the neighbourhood on screen, near or far, so the step always answers
 *     "where was I, and where am I now?". A long jump already climbs past the
 *     floor under its own arithmetic and is left exactly as van Wijk had it.
 *
 *   · A DWELL at the top (`APEX_DWELL`). The apex is the one moment of the
 *     flight that carries the information, and at a constant rate it is gone
 *     before it registers. Slowing through the middle buys the reader a beat to
 *     read the layout at the cost of a middle that is no longer perceptually
 *     uniform — which is the trade the whole amendment is.
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
 * ships. It is left at his number: the drama of the step is `FLIGHT_APEX`'s job
 * now, and raising both would compound into a trip to orbit. What ρ still
 * decides is the shape — how the climb and the descent are distributed along
 * the travel — and that is the part his studies actually measured.
 */
export const FLIGHT_RHO = Math.SQRT2;

/**
 * ── THE THREE DIALS ───────────────────────────────────────────────────────
 * How high the flight climbs, how long it takes, and how much of that time it
 * spends at the top. Everything else in this file is arithmetic.
 */

/**
 * The floor under the arc: at its highest point the flight sees at least this
 * many times the width of the wider of the two framed sheets.
 *
 * At 1 there is no floor and the flight is van Wijk's, untouched — an arc only
 * where the distance earns one. At 3.2 a step between two touching sheets still
 * pulls back until three sheets' worth of paper is on screen, which is the
 * point: the reader watches their sheet shrink into the atlas, sees the one
 * they are heading for, and comes down on it. Past ~5 the sheets are stamps at
 * the top of the arc and the step reads as a dismissal followed by a new click.
 */
export const FLIGHT_APEX = 3.2;

/**
 * How much the flight slows as it passes its highest point. 0 walks the path at
 * van Wijk's constant rate; 0.5 crosses the apex at half speed, and pays for it
 * with a brisker climb and descent either side.
 *
 * Kept below 1 by definition — at 1 the camera would stop dead at the top, and
 * above it the path would run backwards through its own middle.
 */
const APEX_DWELL = 0.45;

/**
 * Seconds per unit of apparent motion. The measure is van Wijk's — it counts
 * how much motion the flight puts on the retina, not how many world units it
 * crosses — so one rate here prices a neighbouring step and a cross-atlas jump
 * alike, and the climb bought by `FLIGHT_APEX` pays for its own time instead of
 * being crammed into the duration the flat version had.
 */
const SECONDS_PER_UNIT = 1.15;

/** Floor and ceiling, so a nudge is not instant and a haul is not a journey. */
const MIN_SECONDS = 1.5;
const MAX_SECONDS = 4;

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
  /**
   * What the flight is PRICED by: `length` plus the extra climb and descent
   * `FLIGHT_APEX` added on top of it, in the same units. The two are separate
   * because `length` is also the domain `sample` is walked over, and stretching
   * that would move the path rather than the clock.
   */
  motion: number;
  /** The view at `s` ∈ [0, length]. Writes into `out` and returns it. */
  sample(s: number, out: FlightSample): FlightSample;
}

/** Below this fraction of the view's own width, a move is not a move. */
const STILL = 1e-5;

/** Already there. Length 0 is the caller's signal that there is nothing to fly. */
function stillPath(width: number): FlightPath {
  return {
    length: 0,
    motion: 0,
    sample(_s, out) {
      out.travel = 1;
      out.width = width;
      return out;
    },
  };
}

/**
 * The extra pull-back, as a bump that is 0 at both ends and 1 in the middle.
 *
 * sin² and not sin, because sin leaves the ground at full tilt: the flight
 * would jump backwards on its first frame and slam into its destination on its
 * last. This one starts and ends at rest, so the climb is something the reader
 * watches begin rather than something that has already happened.
 */
function apexBump(u: number): number {
  const s = Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
  return s * s;
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
  //
  // `FLIGHT_APEX` stays out of this branch. Its whole argument is about showing
  // the reader the ground between two places, and there is no ground here: two
  // frames on the same centre would rocket out and drop back onto the spot they
  // never left.
  if (!(distance > STILL * fromWidth)) {
    const growth = Math.log(toWidth / fromWidth);
    const length = Math.abs(growth) / rho;
    if (!(length > 0)) return stillPath(toWidth);
    const direction = Math.sign(growth);
    return {
      length,
      motion: length,
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

  // The top of van Wijk's own arc. Width is w0·cosh(r0)/cosh(r) along the walk
  // from r0 to r1, so it peaks where cosh does not: at r = 0, if the walk passes
  // through it. A walk that does not — one view already contains the other — is
  // a climb or a descent the whole way, and its highest point is an end of it.
  const naturalApex =
    r0 < 0 && r1 > 0 ? w0 * coshR0 : Math.max(w0, w1);

  // What the floor asks for, over what the path gives for free. Zero on any
  // flight long enough to have earned its own arc, which is what leaves the
  // long jumps untouched.
  const lift = Math.max(
    0,
    (FLIGHT_APEX * Math.max(w0, w1)) / naturalApex - 1,
  );

  // Climbing a further factor of (1 + lift) and coming back down is that much
  // more motion on the retina, in the same ρ-units the rest of the path is
  // measured in — so the clock below sees it and the flight is given the time
  // to fly it.
  const motion = length + (2 * Math.log(1 + lift)) / rho;

  return {
    length,
    motion,
    sample(s, out) {
      const at = rho * s + r0;
      out.travel = travelScale * (coshR0 * Math.tanh(at) - sinhR0);
      out.width =
        ((w0 * coshR0) / Math.cosh(at)) * (1 + lift * apexBump(s / length));
      return out;
    },
  };
}

/** How long a flight should take, in seconds. */
export function flightDuration(path: FlightPath): number {
  return Math.min(
    MAX_SECONDS,
    Math.max(MIN_SECONDS, path.motion * SECONDS_PER_UNIT),
  );
}

/**
 * The flight's own clock: smoothstep, with a slow patch through the middle.
 *
 * SMOOTHSTEP, because van Wijk's path is built to be walked at a CONSTANT rate
 * and a camera that starts and stops at full speed reads as a cut. The reader
 * feels that jolt long before they would ever notice the middle running a few
 * percent off.
 *
 * THE SLOW PATCH is `APEX_DWELL`, and it is the same bargain made louder. The
 * middle of the path is the top of the arc — the one moment the step is worth
 * taking, when both sheets and the paper between them are on screen — and at a
 * uniform rate it passes too quickly to be read. Sagging the clock there holds
 * the wide view for a beat and spends the time on the climb and the descent
 * either side, which are the parts with nothing to look at.
 *
 * Written as a sine ripple on top of the smoothstep, so it stays monotonic (its
 * slope is `1 + APEX_DWELL·cos 2πs`, positive for any dwell under 1) and still
 * arrives at rest at both ends.
 */
export function easeFlight(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  const s = x * x * (3 - 2 * x);
  return s + (APEX_DWELL / (2 * Math.PI)) * Math.sin(2 * Math.PI * s);
}
