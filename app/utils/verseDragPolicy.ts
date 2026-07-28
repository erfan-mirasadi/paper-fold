/**
 * Who moves when a verse capsule is dragged.
 *
 * Kept free of React/three imports so the rules can be reasoned about (and
 * exercised) on their own — `VerseController` only wires the result into
 * springs.
 *
 * The model, which every surah now follows:
 *   · grabbing a capsule moves that verse (or the row it is declared to travel
 *     with) and nothing else;
 *   · grabbing a section — its frame, plate or label — moves the whole zone,
 *     verses included.
 */

import { getSectionIdForVerseId } from "./sectionResolver";

/**
 * Drag behavior is a per-block property, found by verse membership —
 * independent of which elevation section id the verse resolves to (a
 * cross-block customSection can span verses from several blocks). Grid blocks
 * (Alak) don't carry `dragBehavior`/`isCenter`, so a lookup miss for the
 * anaAyet (not part of `verseIds`) resolves to `undefined`, exactly what a grid
 * block would return anyway.
 */
export function findVerseBlock(config: any, verseId: number) {
  return config.blocks?.find((b: any) => b.verseIds?.includes(verseId));
}

function wantsGroupDrag(block: any): boolean {
  if (!block) return false;
  if (block.dragBehavior === "individual") return false;
  return block.dragBehavior === "group" || !!block.isCenter;
}

/**
 * The verse whose spring this verse rides on. Verses sharing a lead spring move
 * as one rigid piece while still being independent of their section.
 *
 * Two things merge verses: an explicit `versePairings` entry (a fold pair), and
 * a block that asks for group drag — its whole row travels together. The lead
 * is the lowest id in the merged set so every member resolves to the same one.
 *
 * Merging never crosses an elevation zone. Ahzab's fold pairs are left/right
 * mirrors that sit in *different* columns, so a shared spring there would drag
 * a capsule out of the column it is supposed to stay attached to — and the pair
 * could not follow either column's frame afterwards. Verses that don't share a
 * zone therefore drag on their own.
 */
export function getLeadVerseId(configId: number, config: any): number {
  const ownZone = getSectionIdForVerseId(configId);
  const sharesZone = (other: number) =>
    getSectionIdForVerseId(other) === ownZone;

  const pairedVerseId = config.specialVerses?.versePairings?.[configId];
  if (pairedVerseId && sharesZone(pairedVerseId)) {
    return Math.min(configId, pairedVerseId);
  }

  const block = findVerseBlock(config, configId);
  if (wantsGroupDrag(block) && block.verseIds?.length > 1) {
    const mates = (block.verseIds as number[]).filter(sharesZone);
    if (mates.length > 1) return Math.min(...mates);
  }
  return configId;
}

/**
 * Does grabbing a capsule drag its whole elevation section (frame, background
 * and every other verse in it), or only the verse/row itself?
 *
 * Only when the block asks for group drag AND the section covers exactly that
 * block's verses — then the frame the user sees around the capsule really is
 * the thing being moved (Alak's centre section). When a cross-block
 * `customSections` zone spans far more than the block (Imran's `sec_all`,
 * Tevbe's single 12-verse zone), grabbing one capsule must never drag the rest
 * of the page with it; the block's verses share a lead spring instead, and the
 * section still moves as a unit when dragged by its own frame or label.
 */
export function shouldUseGroupDrag(
  config: any,
  leadVerseId: number,
  sectionVerseIds: number[],
): boolean {
  const block = findVerseBlock(config, leadVerseId);
  if (!wantsGroupDrag(block)) return false;
  const blockVerseIds: number[] = block.verseIds ?? [];
  return (
    sectionVerseIds.length === blockVerseIds.length &&
    blockVerseIds.every((id) => sectionVerseIds.includes(id))
  );
}
