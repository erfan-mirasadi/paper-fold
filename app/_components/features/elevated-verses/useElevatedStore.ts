import { create } from "zustand";
export type ElevatedPhase = "idle" | "elevated";
export type ElevatedSectionId = "s1" | "s2_top" | "s2_bottom" | "s2_center";

/** Elevated interactions unlock only after user scroll reaches this offset. */
export const ELEVATED_SCROLL_UNLOCK_THRESHOLD = 0.9;
/** Delay used to sync base section reappearance with elevated return animation. */
export const ELEVATED_RETURN_SYNC_MS = 480;

const SECTION_VERSE_IDS: Record<ElevatedSectionId, number[]> = {
  s1: [1, 2, 3, 4, 5],
  s2_top: [6, 7, 8, 9, 10],
  s2_bottom: [15, 16, 17, 18, 19],
  s2_center: [11, 12, 13, 14],
};

const SECTION_PRIORITY: ElevatedSectionId[] = [
  "s1",
  "s2_top",
  "s2_center",
  "s2_bottom",
];

function normalizeVerseIds(verseIds: number[]): number[] {
  return Array.from(new Set(verseIds)).sort((a, b) => a - b);
}

function hasWholeSection(
  verseSet: Set<number>,
  sectionId: ElevatedSectionId,
): boolean {
  return SECTION_VERSE_IDS[sectionId].every((id) => verseSet.has(id));
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

interface ElevatedStoreState {
  activeVerseId: number | null;
  activeVerseIds: number[];
  activeSectionId: ElevatedSectionId | null;
  activeSectionIds: ElevatedSectionId[];
  hasEverElevated: boolean;
  phase: ElevatedPhase;
  isEnabledByScroll: boolean;
  setEnabledByScroll: (enabled: boolean) => void;
  elevateVerse: (verseId: number) => void;
  elevateVerses: (verseIds: number[], sectionId?: ElevatedSectionId) => void;
  dismiss: () => void;
}

export const useElevatedStore = create<ElevatedStoreState>((set, get) => ({
  activeVerseId: null,
  activeVerseIds: [],
  activeSectionId: null,
  activeSectionIds: [],
  hasEverElevated: false,
  phase: "idle",
  isEnabledByScroll: false,

  setEnabledByScroll: (enabled) => {
    const { isEnabledByScroll } = get();
    if (isEnabledByScroll === enabled) return;

    if (!enabled) {
      set({
        isEnabledByScroll: false,
        activeVerseId: null,
        activeVerseIds: [],
        activeSectionId: null,
        activeSectionIds: [],
        phase: "idle",
      });
      return;
    }

    set({ isEnabledByScroll: true });
  },

  elevateVerse: (verseId) => {
    if (!get().isEnabledByScroll) return;

    const { activeVerseIds, hasEverElevated, activeSectionId } = get();
    const hasVerse = activeVerseIds.includes(verseId);
    const nextIds = normalizeVerseIds(
      hasVerse
        ? activeVerseIds.filter((id) => id !== verseId)
        : [...activeVerseIds, verseId],
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
    if (!get().isEnabledByScroll) return;

    const normalized = normalizeVerseIds(verseIds);
    if (normalized.length === 0) {
      set({
        activeVerseId: null,
        activeVerseIds: [],
        activeSectionId: null,
        activeSectionIds: [],
        phase: "idle",
      });
      return;
    }

    const { activeVerseIds, hasEverElevated, activeSectionId } = get();
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

  dismiss: () => {
    if (get().phase === "idle") return;
    set({
      activeVerseId: null,
      activeVerseIds: [],
      activeSectionId: null,
      activeSectionIds: [],
      phase: "idle",
    });
  },
}));
