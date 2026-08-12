/**
 * paperAssets — warm a paper's image assets BEFORE its content ever mounts.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT ABOUT DOWNLOAD SPEED. Every sheet on a
 * page reaches for its own artwork through its own `useTexture` call, and each
 * one of those SUSPENDS the first time its URL is asked for. React answers a
 * suspension by throwing the subtree away and rendering it again once the
 * promise settles — so a page whose art is requested from twenty-eight
 * different places does not wait once, it waits twenty-eight times, and it
 * re-renders every sheet, capsule and glyph it owns on each of them. On the
 * Yâsîn atlas that measured at 19.7 SECONDS between the content swap and the
 * page committing, against 33 ms to actually fetch all twenty-eight files (39
 * KB, all of them). The wait was never the bytes. It was the re-renders.
 *
 * Priming drei's loader cache collapses that: every URL starts loading at the
 * same moment, so by the time the content mounts the suspensions either never
 * happen or all resolve together, and the tree renders ONCE. Same page, same
 * bytes, one pass instead of twenty-eight.
 *
 * The URLs are found by walking the config rather than by listing them per
 * schema field, because artwork paths live in a dozen different shapes
 * (`svgOverlays`, block backgrounds, frame images, handwritten notes, verse
 * ornaments…) and a walk cannot fall behind a config that grows a new one.
 */

import { useTexture } from "@react-three/drei";

import type { SurahLayoutConfig } from "../data/schema";

/** A public-folder image path — the only strings worth handing a texture loader. */
const ASSET_URL = /^\/[^\s"']+\.(svg|png|webp|jpe?g|avif)$/i;

/** Configs already warmed, so repeated visits cost nothing. */
const warmed = new WeakSet<SurahLayoutConfig>();

/** Every image path reachable from `config`, in first-seen order. */
export function collectPaperAssetUrls(config: SurahLayoutConfig): string[] {
  const found = new Set<string>();
  const seen = new WeakSet<object>();

  const walk = (value: unknown): void => {
    if (typeof value === "string") {
      if (ASSET_URL.test(value)) found.add(value);
      return;
    }
    if (value === null || typeof value !== "object") return;
    // Configs share sub-objects freely (one styling block reused by ten
    // sheets); without this the walk would re-descend the same tree repeatedly.
    if (seen.has(value)) return;
    seen.add(value);
    for (const key in value as Record<string, unknown>) {
      walk((value as Record<string, unknown>)[key]);
    }
  };

  walk(config);
  return [...found];
}

/**
 * Start every one of `config`'s textures loading now, into the same cache
 * `useTexture` reads from.
 *
 * Deliberately fire-and-forget: the point is that the requests are all IN
 * FLIGHT before the content mounts, not that they have finished. A suspension
 * on an already-pending promise costs one retry for the whole tree; twenty-eight
 * suspensions on twenty-eight promises that each START on their own retry cost
 * twenty-eight. Nothing here needs to be awaited to get that.
 */
export function preloadPaperAssets(config: SurahLayoutConfig): void {
  if (warmed.has(config)) return;
  warmed.add(config);

  const urls = collectPaperAssetUrls(config);
  if (urls.length === 0) return;

  try {
    // drei's preload is variadic-or-array and swallows its own failures; a
    // missing file must never take a paper switch down with it.
    useTexture.preload(urls);
  } catch {
    warmed.delete(config);
  }
}
