import { create } from "zustand";
import { getActiveStoryConfig } from "./useStoryStore";
import { SurahLayoutConfig } from "../data/schema";
import { resetAllDrags } from "../utils/dragEngine";
import {
  initSectionResolverForStory,
  getSectionPriority,
  getSectionVerseIds,
  getAllSectionVerseIds,
} from "../utils/sectionResolver";

export type ElevatedPhase = "idle" | "elevated";
export type ElevatedSectionId = string;

/** Elevated interactions unlock only after user scroll reaches this offset. */
export const ELEVATED_SCROLL_UNLOCK_THRESHOLD = 0.9;
/** Delay used to sync base section reappearance with elevated return animation. */
export const ELEVATED_RETURN_SYNC_MS = 480;

let SECTION_PRIORITY: string[] = [];
let ALL_ELEVATED_VERSE_IDS: number[] = [];

export function initElevatedStoreForStory(config: SurahLayoutConfig<any>) {
  // Block/customSection traversal lives in the shared resolver so
  // dragEngine/boundsHelper/hitboxes/elevated-surfaces stay in sync with
  // this store without importing it directly (avoids a circular import
  // between this store and dragEngine).
  initSectionResolverForStory(config);
  SECTION_PRIORITY = getSectionPriority();
  ALL_ELEVATED_VERSE_IDS = getAllSectionVerseIds();

  // Reset store if it's already created
  if (useElevatedStore) {
    useElevatedStore.setState({
      activeVerseId: null,
      activeVerseIds: [],
      activeSectionId: null,
      activeSectionIds: [],
      isAllSectionsMode: false,
      hasEverElevated: false,
      phase: "idle",
      unlockedVerseIds: ALL_ELEVATED_VERSE_IDS,
    });
  }
}

function normalizeVerseIds(verseIds: number[]): number[] {
  return Array.from(new Set(verseIds)).sort((a, b) => a - b);
}

function hasWholeSection(
  verseSet: Set<number>,
  sectionId: ElevatedSectionId,
): boolean {
  return getSectionVerseIds(sectionId).every((id) => verseSet.has(id));
}

function resolveSectionIds(verseIds: number[]): ElevatedSectionId[] {
  if (verseIds.length === 0) return [];
  const verseSet = new Set(verseIds);

  return SECTION_PRIORITY.filter((sectionId) =>
    hasWholeSection(verseSet, sectionId),
  );
}

function pickActiveSectionId(
  sectionIds: ElevatedSectionId[],
  preferredSectionId?: ElevatedSectionId | null,
  previousSectionId?: ElevatedSectionId | null,
): ElevatedSectionId | null {
  if (preferredSectionId && sectionIds.includes(preferredSectionId)) {
    return preferredSectionId;
  }

  if (previousSectionId && sectionIds.includes(previousSectionId)) {
    return previousSectionId;
  }

  return sectionIds[0] ?? null;
}

function hasAllSections(sectionIds: ElevatedSectionId[]): boolean {
  return SECTION_PRIORITY.every((sectionId) => sectionIds.includes(sectionId));
}

interface ElevatedStoreState {
  activeVerseId: number | null;
  activeVerseIds: number[];
  activeSectionId: ElevatedSectionId | null;
  activeSectionIds: ElevatedSectionId[];
  isAllSectionsMode: boolean;
  hasEverElevated: boolean;
  phase: ElevatedPhase;
  unlockedVerseIds: number[];
  syncScrollOffset: (offset: number) => void;
  elevateVerse: (verseId: number) => void;
  elevateVerses: (verseIds: number[], sectionId?: ElevatedSectionId) => void;
  showAllSections: () => void;
  /** Like showAllSections but bypasses the scroll-unlock check.
   *  Used by the intro sequence where scroll is at 0. */
  forceShowAllSections: () => void;
  restoreAllSections: () => void;
  dismiss: () => void;
}

function getUnlockedElevatedVerses(offset: number): number[] {
  // Return all verses immediately so they can be clicked for zooming
  // even when the paper is folded.
  return ALL_ELEVATED_VERSE_IDS;
}

export const useElevatedStore = create<ElevatedStoreState>((set, get) => ({
  activeVerseId: null,
  activeVerseIds: [],
  activeSectionId: null,
  activeSectionIds: [],
  isAllSectionsMode: false,
  hasEverElevated: false,
  phase: "idle",
  unlockedVerseIds: getUnlockedElevatedVerses(0),

  syncScrollOffset: (offset) => {
    if (get().isAllSectionsMode) return;
    const nextUnlocked = getUnlockedElevatedVerses(offset);
    const { unlockedVerseIds, activeVerseIds, activeSectionId } = get();

    // Check if the unlocked verses changed
    if (nextUnlocked.length !== unlockedVerseIds.length) {
      set({ unlockedVerseIds: nextUnlocked });

      // Identify verses that are active but no longer unlocked
      const newActive = activeVerseIds.filter((id) =>
        nextUnlocked.includes(id),
      );

      if (newActive.length !== activeVerseIds.length) {
        if (newActive.length === 0) {
          set({
            activeVerseId: null,
            activeVerseIds: [],
            activeSectionId: null,
            activeSectionIds: [],
            isAllSectionsMode: false,
            phase: "idle",
          });
        } else {
          const nextSectionIds = resolveSectionIds(newActive);
          set({
            activeVerseId: newActive[0] ?? null,
            activeVerseIds: newActive,
            activeSectionIds: nextSectionIds,
            isAllSectionsMode: false,
            activeSectionId: pickActiveSectionId(
              nextSectionIds,
              null,
              activeSectionId,
            ),
          });
        }
      }
    }
  },

  elevateVerse: (verseId) => {
    const {
      activeVerseIds,
      hasEverElevated,
      activeSectionId,
      unlockedVerseIds,
    } = get();
    if (!unlockedVerseIds.includes(verseId)) return;

    const pairs: Record<number, number> = getActiveStoryConfig().specialVerses?.versePairings || {};

    const partnerId = pairs[verseId];
    const affectedIds =
      partnerId !== undefined && unlockedVerseIds.includes(partnerId)
        ? [verseId, partnerId]
        : [verseId];

    const allPresent = affectedIds.every((id) => activeVerseIds.includes(id));
    const nextIds = normalizeVerseIds(
      allPresent
        ? activeVerseIds.filter((id) => !affectedIds.includes(id))
        : [...activeVerseIds, ...affectedIds],
    );

    const nextSectionIds = resolveSectionIds(nextIds);

    set({
      activeVerseId: nextIds[0] ?? null,
      activeVerseIds: nextIds,
      activeSectionIds: nextSectionIds,
      activeSectionId: pickActiveSectionId(
        nextSectionIds,
        null,
        activeSectionId,
      ),
      phase: nextIds.length > 0 ? "elevated" : "idle",
      hasEverElevated: hasEverElevated || nextIds.length > 0,
    });
  },

  elevateVerses: (verseIds, sectionId) => {
    const {
      activeVerseIds,
      hasEverElevated,
      activeSectionId,
      unlockedVerseIds,
    } = get();

    // Only process verseIds that are unlocked
    const allowedVerseIds = verseIds.filter((id) =>
      unlockedVerseIds.includes(id),
    );
    const normalized = normalizeVerseIds(allowedVerseIds);
    if (normalized.length === 0) {
      set({
        activeVerseId: null,
        activeVerseIds: [],
        activeSectionId: null,
        activeSectionIds: [],
        isAllSectionsMode: false,
        phase: "idle",
      });
      return;
    }

    const currentSet = new Set(activeVerseIds);
    const allSelected = normalized.every((id) => currentSet.has(id));

    const nextIds = allSelected
      ? activeVerseIds.filter((id) => !normalized.includes(id))
      : normalizeVerseIds([...activeVerseIds, ...normalized]);

    const nextSectionIds = resolveSectionIds(nextIds);

    set({
      activeVerseId: nextIds[0] ?? null,
      activeVerseIds: nextIds,
      activeSectionIds: nextSectionIds,
      activeSectionId: pickActiveSectionId(
        nextSectionIds,
        sectionId,
        activeSectionId,
      ),
      phase: nextIds.length > 0 ? "elevated" : "idle",
      hasEverElevated: hasEverElevated || nextIds.length > 0,
    });
  },

  showAllSections: () => {
    const { unlockedVerseIds } = get();
    const canShowAll = ALL_ELEVATED_VERSE_IDS.every((id) =>
      unlockedVerseIds.includes(id),
    );
    if (!canShowAll) return;

    // Reset all drag positions so sections start fresh each time
    resetAllDrags();

    set({
      activeVerseId: ALL_ELEVATED_VERSE_IDS[0],
      activeVerseIds: ALL_ELEVATED_VERSE_IDS,
      activeSectionId: SECTION_PRIORITY[0],
      activeSectionIds: SECTION_PRIORITY,
      isAllSectionsMode: true,
      phase: "elevated",
      hasEverElevated: true,
    });
  },

  forceShowAllSections: () => {
    // Reset all drag positions so sections start fresh each time
    resetAllDrags();

    set({
      activeVerseId: ALL_ELEVATED_VERSE_IDS[0],
      activeVerseIds: ALL_ELEVATED_VERSE_IDS,
      unlockedVerseIds: ALL_ELEVATED_VERSE_IDS,
      activeSectionId: SECTION_PRIORITY[0],
      activeSectionIds: SECTION_PRIORITY,
      isAllSectionsMode: true,
      phase: "elevated",
      hasEverElevated: true,
    });
  },

  restoreAllSections: () => {
    set({
      activeVerseId: null,
      activeVerseIds: [],
      activeSectionId: null,
      activeSectionIds: [],
      isAllSectionsMode: false,
      phase: "idle",
    });
  },

  dismiss: () => {
    if (get().phase === "idle") return;
    set({
      activeVerseId: null,
      activeVerseIds: [],
      activeSectionId: null,
      activeSectionIds: [],
      isAllSectionsMode: false,
      phase: "idle",
    });
  },
}));


