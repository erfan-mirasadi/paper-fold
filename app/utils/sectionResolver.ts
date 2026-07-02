import { SurahLayoutConfig } from "../data/schema";

/**
 * Shared verse <-> elevation-section resolver, driven by `config.blocks` +
 * optional `config.customSections`. This module intentionally has no
 * dependency on `useElevatedStore` or `dragEngine` so both can import it
 * without forming a circular import (which previously caused a transient
 * "ReferenceError: getActiveStoryConfig is not defined" during Fast Refresh).
 */

export type SectionId = string;

let SECTION_VERSE_IDS: Record<string, number[]> = {};
let SECTION_PRIORITY: SectionId[] = [];
let VERSE_TO_SECTION_ID: Record<number, SectionId> = {};

export function initSectionResolverForStory(config: SurahLayoutConfig) {
  SECTION_VERSE_IDS = {};
  SECTION_PRIORITY = [];

  if (config.customSections && config.customSections.length > 0) {
    // Custom sections define named elevation zones spanning multiple blocks.
    config.customSections.forEach((cs: any) => {
      SECTION_PRIORITY.push(cs.id);
      SECTION_VERSE_IDS[cs.id] = [...cs.verseIds];
    });
  } else {
    // One elevation zone per block, keyed by block.id — unless the block
    // sets `customSectionId`, in which case its verses merge into that
    // zone instead (e.g. Alak's intro/outro verses merge into their
    // neighboring group's zone without forcing group-drag on the whole
    // section the way a top-level `customSections` entry would).
    (config.blocks ?? []).forEach((block: any) => {
      if (block.type === "spacer" || !block.verseIds?.length) return;
      const zoneId = block.customSectionId ?? block.id;
      if (!SECTION_VERSE_IDS[zoneId]) {
        SECTION_PRIORITY.push(zoneId);
        SECTION_VERSE_IDS[zoneId] = [];
      }
      SECTION_VERSE_IDS[zoneId].push(...block.verseIds);
      // Grid blocks carry their anaAyet as a separate field, not part of
      // `verseIds`.
      if (block.type === "grid" && block.anaAyetId !== undefined) {
        SECTION_VERSE_IDS[zoneId].push(block.anaAyetId);
      }
    });
  }

  // Build the verse -> section reverse index once, shared by dragEngine,
  // boundsHelper and the hitbox/elevation UI layers so they never need to
  // re-derive the traversal logic.
  VERSE_TO_SECTION_ID = {};
  for (const sectionId of SECTION_PRIORITY) {
    for (const vId of SECTION_VERSE_IDS[sectionId]) {
      if (!(vId in VERSE_TO_SECTION_ID)) VERSE_TO_SECTION_ID[vId] = sectionId;
    }
  }
}

/** All elevation section IDs, in priority order. */
export function getSectionPriority(): SectionId[] {
  return [...SECTION_PRIORITY];
}

/** All verse IDs that belong to the given elevation section (block id or custom section id). */
export function getSectionVerseIds(sectionId: SectionId): number[] {
  return SECTION_VERSE_IDS[sectionId] ?? [];
}

/** The elevation section a given verse belongs to. */
export function getSectionIdForVerseId(verseId: number): SectionId | null {
  return VERSE_TO_SECTION_ID[verseId] ?? null;
}

/** Every verse ID covered by any elevation section, flattened. */
export function getAllSectionVerseIds(): number[] {
  return SECTION_PRIORITY.flatMap((sectionId) => SECTION_VERSE_IDS[sectionId]);
}

/**
 * The elevation section id of the Alak-style grid+anaAyet "Section 1" — the
 * section already visible on paper at the intro→story handoff, so it must be
 * excluded from the instant opacity-snap applied to every other section when
 * leaving the intro. Returns null for surahs with no such block (i.e. every
 * surah except Alak).
 */
export function getIntroGridSectionId(
  config: SurahLayoutConfig,
): SectionId | null {
  return config.blocks?.find((b: any) => b.type === "grid")?.id ?? null;
}
