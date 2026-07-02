import { BlockSurahTransforms as SurahTransforms } from "../data/SurahConfig";
import { SectionTransforms } from "../data/schema";
import { getActiveStoryConfig } from "../stores/useStoryStore";
import { getSectionVerseIds } from "./sectionResolver";

export type SectionBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const BOUNDS_PAD = 0.06;

export function calculateSectionBounds(
  sectionId: string,
  transforms: SurahTransforms,
  pageWidth: number,
): SectionBounds {
  const config = getActiveStoryConfig();
  const hasCustomSections = !!(
    config.customSections && config.customSections.length > 0
  );

  if (hasCustomSections) {
    // Cross-block custom section — bounds = tight union of its verse
    // transforms (verses can live in different block transforms).
    const verseIds = getSectionVerseIds(sectionId);
    if (verseIds.length === 0) return undefined as any;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    transforms.sections.forEach((sTransform: any) => {
      const verseMaps = [
        sTransform.verses,
        ...((sTransform.groups ?? []) as any[]).map((g) => g.verses),
      ].filter(Boolean);
      verseMaps.forEach((verses) => {
        verseIds.forEach((vId) => {
          const vt = verses[vId];
          if (!vt) return;
          minX = Math.min(minX, vt.x);
          maxX = Math.max(maxX, vt.x + vt.w);
          minY = Math.min(minY, vt.y - vt.h);
          maxY = Math.max(maxY, vt.y);
        });
      });
    });

    if (minX === Infinity) return undefined as any;
    return {
      minX: minX - pageWidth / 2 - BOUNDS_PAD,
      maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
      maxY: maxY + BOUNDS_PAD,
      minY: minY - BOUNDS_PAD,
    };
  }

  // Per-block elevation zone, keyed by block.id (or `customSectionId` when
  // a block merges into a neighboring zone, e.g. Alak's intro/outro) — union
  // of every merged block's own (inset-adjusted) frame.
  const zoneBlocks = (config.blocks ?? [])
    .map((b, idx) => ({ b, idx }))
    .filter(({ b }) => (b.customSectionId ?? b.id) === sectionId);
  if (zoneBlocks.length === 0) return undefined as any;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  zoneBlocks.forEach(({ idx }) => {
    const sTransform = transforms.sections[idx] as
      | Required<SectionTransforms>
      | undefined;
    if (!sTransform) return;
    const group = sTransform.groups?.[0];
    const frameX = group ? group.frameX : sTransform.frameX;
    const frameY = group ? group.frameY : (sTransform.frameY ?? 0);
    const frameW = group ? group.frameW : sTransform.frameW;
    const frameH = group ? group.frameH : (sTransform.frameH ?? 0);
    minX = Math.min(minX, frameX);
    maxX = Math.max(maxX, frameX + frameW);
    minY = Math.min(minY, frameY - frameH);
    maxY = Math.max(maxY, frameY);
  });
  if (minX === Infinity) return undefined as any;

  return {
    minX: minX - pageWidth / 2 - BOUNDS_PAD,
    maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
    maxY: maxY + BOUNDS_PAD,
    minY: minY - BOUNDS_PAD,
  };
}
