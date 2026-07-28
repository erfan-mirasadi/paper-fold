import { BlockSurahTransforms as SurahTransforms } from "../data/SurahConfig";
import { SectionTransforms } from "../data/schema";
import { getActiveStoryConfig } from "../stores/useStoryStore";

export type SectionBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const BOUNDS_PAD = 0.06;

/**
 * Snap-home bounds for a verse (or verse row) dragged on its own: the frame of
 * the BLOCK it lives in — never its elevation section.
 *
 * `useElevatedDrag` snaps a verse back when it hasn't travelled past ~60% of
 * these bounds, i.e. "it never really left its box". With per-block elevation
 * zones (Alak) the section frame *is* the block's box, so the two agree. With a
 * cross-block `customSections` zone the section is one to two orders of
 * magnitude bigger than the capsule being dragged — Tevbe declares a single
 * zone over all 12 verses, Imran's `sec_all` spans 1…9 — so the snap radius
 * grows to roughly a full page and every individual drag springs straight back
 * home. Measuring against the block keeps the rule identical everywhere.
 */
export function calculateVerseSnapBounds(
  verseId: number,
  transforms: SurahTransforms,
  pageWidth: number,
): SectionBounds | undefined {
  const config = getActiveStoryConfig();
  const blockIdx = (config.blocks ?? []).findIndex(
    (b: any) => b.verseIds?.includes(verseId) || b.anaAyetId === verseId,
  );
  if (blockIdx < 0) return undefined;

  const sTransform = transforms.sections[blockIdx] as
    | Required<SectionTransforms>
    | undefined;
  if (!sTransform) return undefined;

  const group = sTransform.groups?.[0];
  const frameX = group ? group.frameX : sTransform.frameX;
  const frameY = group ? group.frameY : (sTransform.frameY ?? 0);
  const frameW = group ? group.frameW : sTransform.frameW;
  const frameH = group ? group.frameH : (sTransform.frameH ?? 0);
  if (frameW === undefined || frameH === undefined) return undefined;

  return {
    minX: frameX - pageWidth / 2 - BOUNDS_PAD,
    maxX: frameX + frameW - pageWidth / 2 + BOUNDS_PAD,
    maxY: frameY + BOUNDS_PAD,
    minY: frameY - frameH - BOUNDS_PAD,
  };
}
