"use client";

/**
 * AtlasThread — the string tying the sheets together in reading order.
 *
 * The board's whole argument is that these seven pieces of paper are ONE
 * document read in one sequence. Their positions cannot say that: the eye is
 * free to jump anywhere on a floor. The thread is what states the order, so it
 * is drawn from `THREAD_ORDER` and from nothing else — re-ordering the reading
 * re-routes the string with no other edit.
 *
 * Each segment sags between its two anchors the way a real string does under
 * its own weight, which is also what keeps the line legible: a straight
 * segment between two sheets on the same row would disappear into their edges.
 */

import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";

import {
  threadAnchor,
  threadSegments,
} from "../../../data/configs/yasin/sheets";

/** Thread thickness, world units. */
const THREAD_RADIUS = 0.006;
/** How far a segment sags below the straight line between its anchors. */
const SAG_RATIO = 0.16;
/**
 * Sits behind the sheets (which are at z ≥ 0) so the string passes UNDER the
 * paper at each end and appears tied to it rather than laid across it.
 */
const THREAD_Z = -0.01;

export function AtlasThread() {
  const curves = useMemo(() => {
    return threadSegments().map(({ from, to }) => {
      const [ax, ay] = threadAnchor(from, to);
      const [bx, by] = threadAnchor(to, from);

      const midX = (ax + bx) / 2;
      const midY = (ay + by) / 2;

      const span = Math.hypot(bx - ax, by - ay);
      // The sag is perpendicular-ish: pulling the midpoint down reads as
      // gravity regardless of whether the segment runs across or downward.
      const sag = span * SAG_RATIO;

      const curve = new CatmullRomCurve3([
        new Vector3(ax, ay, THREAD_Z),
        new Vector3(midX, midY - sag, THREAD_Z),
        new Vector3(bx, by, THREAD_Z),
      ]);

      return { key: `${from.id}->${to.id}`, curve };
    });
  }, []);

  return (
    <group>
      {curves.map(({ key, curve }) => (
        <mesh key={key}>
          <tubeGeometry args={[curve, 48, THREAD_RADIUS, 6, false]} />
          <meshStandardMaterial color="#8a7a63" roughness={0.9} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}
