import {
  GridSectionConfig,
  VerticalGroupsSectionConfig,
  SurahLayoutConfig,
} from "../data/schema";

/**
 * Shared verse <-> elevation-section resolver, engine-agnostic (new block
 * engine via `config.blocks` + `config.customSections`, or the legacy
 * `config.sections` tree). This module intentionally has no dependency on
 * `useElevatedStore` or `dragEngine` so both can import it without forming
 * a circular import (which previously caused a transient
 * "ReferenceError: getActiveStoryConfig is not defined" during Fast Refresh).
 */

export type SectionId = string;

let SECTION_VERSE_IDS: Record<string, number[]> = {};
let SECTION_PRIORITY: SectionId[] = [];
let VERSE_TO_SECTION_ID: Record<number, SectionId> = {};

export function initSectionResolverForStory(config: SurahLayoutConfig<any>) {
  SECTION_VERSE_IDS = {};
  SECTION_PRIORITY = [];

  // ── NEW: block-based configs use config.blocks + config.customSections ──
  if (config.blocks && config.blocks.length > 0) {
    if (config.customSections && config.customSections.length > 0) {
      // Custom sections define named elevation zones spanning multiple blocks.
      config.customSections.forEach((cs: any) => {
        SECTION_PRIORITY.push(cs.id);
        SECTION_VERSE_IDS[cs.id] = [...cs.verseIds];
      });
    } else {
      // One elevation zone per block, keyed by block.id.
      config.blocks.forEach((block: any) => {
        if (block.type === "spacer" || !block.verseIds?.length) return;
        SECTION_PRIORITY.push(block.id);
        SECTION_VERSE_IDS[block.id] = [...block.verseIds];
      });
    }
  } else {
    // ── LEGACY: sections-based configs ───────────────────────────────────────
    config.sections?.forEach((section: any) => {
      if (section.type === "gridWithAnaAyet") {
        const s1 = section as GridSectionConfig;
        const id = s1.id;
        SECTION_PRIORITY.push(id);
        SECTION_VERSE_IDS[id] = [...s1.verses, s1.anaAyet];
      } else if (section.type === "verticalGroups") {
        const s2 = section as VerticalGroupsSectionConfig;

        if (s2.customSections && s2.customSections.length > 0) {
          // ─── CUSTOM SECTIONS: Each custom section defines its own verse list ─
          s2.customSections.forEach((cs) => {
            SECTION_PRIORITY.push(cs.id);
            SECTION_VERSE_IDS[cs.id] = [...cs.verseIds];
          });
        } else if (s2.groupElevation === "unified") {
          // ─── UNIFIED: All groups share one section ID ─────────────────────
          const sectionId = s2.id;
          SECTION_PRIORITY.push(sectionId);
          const allVerseIds: number[] = [];
          if (s2.introVerse) allVerseIds.push(s2.introVerse);
          s2.groups.forEach((g) => allVerseIds.push(...g.verseIds));
          if (s2.outroVerse) allVerseIds.push(s2.outroVerse);
          SECTION_VERSE_IDS[sectionId] = allVerseIds;
        } else {
          // ─── PER-GROUP: Each group gets its own _g{idx} section ID ────────
          s2.groups.forEach((g, gIdx) => {
            const groupId = `${s2.id}_g${gIdx}`;
            SECTION_PRIORITY.push(groupId);
            SECTION_VERSE_IDS[groupId] = [...g.verseIds];
          });

          // Intro verse belongs to the first group; outro to the last.
          if (s2.introVerse) {
            SECTION_VERSE_IDS[`${s2.id}_g0`].unshift(s2.introVerse);
          }
          if (s2.outroVerse) {
            const lastIdx = s2.groups.length - 1;
            SECTION_VERSE_IDS[`${s2.id}_g${lastIdx}`].push(s2.outroVerse);
          }
        }
      }
    });
  }

  // Build the verse -> section reverse index once, shared by dragEngine,
  // boundsHelper and the hitbox/elevation UI layers so they never need to
  // re-derive engine-specific (blocks vs legacy sections) traversal logic.
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

/** All verse IDs that belong to the given elevation section (block id, legacy group id, or custom section id). */
export function getSectionVerseIds(sectionId: SectionId): number[] {
  return SECTION_VERSE_IDS[sectionId] ?? [];
}

/** The elevation section a given verse belongs to, regardless of engine (blocks vs legacy sections). */
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
 * leaving the intro. Returns null for surahs with no such section (engine-
 * agnostic: works for both `config.blocks` with a `'grid'` block and the
 * legacy `config.sections` with a `gridWithAnaAyet` section).
 */
export function getIntroGridSectionId(
  config: SurahLayoutConfig<any>,
): SectionId | null {
  if (config.blocks && config.blocks.length > 0) {
    return config.blocks.find((b: any) => b.type === "grid")?.id ?? null;
  }
  return (
    config.sections?.find((s: any) => s.type === "gridWithAnaAyet")?.id ??
    null
  );
}
