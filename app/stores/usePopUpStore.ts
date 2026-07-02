import { create } from "zustand";
import { getActiveStoryConfig } from "./useStoryStore";

export type PopUpGroup = {
  id: string;
  verseIds: number[];
  isOpen: boolean;
  hasEverOpened: boolean;
};

export type MiddleHorizontalColumn = "left" | "right";

let INITIAL_POPUP_GROUPS: PopUpGroup[] = [];
let DYNAMIC_MIDDLE_GROUP_ID = "g_11_12_13_14";

export function initPopUpStoreForStory(config: any) {
  const pairings = config.specialVerses?.versePairings || {};
  const middleFolds = config.specialVerses?.middleFoldVerses || { left: [], right: [] };
  const middleVerseIds = [...middleFolds.left, ...middleFolds.right].sort((a, b) => a - b);
  DYNAMIC_MIDDLE_GROUP_ID = middleVerseIds.length > 0 ? `g_${middleVerseIds.join("_")}` : "g_11_12_13_14";

  // Collect all verse IDs from the config's blocks.
  const allVerseIds: number[] = (config.blocks ?? []).flatMap((b: any) => [
    ...(b.verseIds ?? []),
    // Grid blocks (Alak) carry their anaAyet as a separate field, not part
    // of `verseIds`.
    ...(b.type === "grid" && b.anaAyetId !== undefined ? [b.anaAyetId] : []),
  ]);

  const uniqueVerses = Array.from(new Set(allVerseIds as number[])).sort((a, b) => a - b);
  const groups: PopUpGroup[] = [];
  const processed = new Set<number>();

  // ─── Detect anaAyet↔introVerse boundary ────────────────────────────────
  // These two verses fold together in popups (like old g_5_6) but are NOT
  // drag-paired — they only share a popup group.
  let anaAyetId: number | null = null;
  let introVerseId: number | null = null;
  let outroVerseId: number | null = null;
  for (const b of config.blocks ?? []) {
    if (b.type === "grid" && b.anaAyetId !== undefined) anaAyetId = b.anaAyetId;
    if (b.introOutroRole === "intro") introVerseId = b.verseIds?.[0] ?? null;
    if (b.introOutroRole === "outro") outroVerseId = b.verseIds?.[0] ?? null;
  }
  // Build the anaAyet+introVerse popup pair (e.g. [5,6])
  const bridgeGroupIds: number[] = [];
  if (anaAyetId !== null && introVerseId !== null) {
    bridgeGroupIds.push(anaAyetId, introVerseId);
  }

  for (const v of uniqueVerses) {
    if (processed.has(v)) continue;

    // 1. Middle fold group (e.g. g_11_12_13_14)
    if (middleVerseIds.includes(v)) {
      groups.push({
        id: DYNAMIC_MIDDLE_GROUP_ID,
        verseIds: [...middleVerseIds],
        isOpen: false,
        hasEverOpened: false,
      });
      middleVerseIds.forEach(id => processed.add(id));
      continue;
    }

    // 2. anaAyet+introVerse bridge group (e.g. g_5_6)
    if (bridgeGroupIds.includes(v)) {
      const sorted = [...bridgeGroupIds].sort((a, b) => a - b);
      groups.push({
        id: `g_${sorted.join("_")}`,
        verseIds: sorted,
        isOpen: false,
        hasEverOpened: false,
      });
      bridgeGroupIds.forEach(id => processed.add(id));
      continue;
    }

    // 3. Skip solo outroVerse — old code didn't include it in popup groups
    if (v === outroVerseId) {
      processed.add(v);
      continue;
    }

    // 4. Verse pairing (drag pairs that also fold together)
    const paired = pairings[v];
    if (paired !== undefined && !processed.has(paired)) {
      groups.push({
        id: `g_${Math.min(v, paired)}_${Math.max(v, paired)}`,
        verseIds: [v, paired],
        isOpen: false,
        hasEverOpened: false,
      });
      processed.add(v);
      processed.add(paired);
    } else {
      // 5. Solo verse
      groups.push({
        id: `g_${v}`,
        verseIds: [v],
        isOpen: false,
        hasEverOpened: false,
      });
      processed.add(v);
    }
  }
  
  INITIAL_POPUP_GROUPS = groups;
  usePopUpStore.setState({ 
    popUpGroups: INITIAL_POPUP_GROUPS,
    unlockedGroupIds: getUnlockedPopUpGroups(0)
  });
}

interface PopUpStoreState {
  popUpGroups: PopUpGroup[];
  popUpAllOpen: boolean;
  unlockedGroupIds: string[];
  middleHorizontalFolded: MiddleHorizontalColumn | null;
  hoveredGroupId: string | null;
  hoveredMiddleColumn: MiddleHorizontalColumn | null;
  togglePopUpGroup: (id: string) => void;
  toggleAllPopUps: () => void;
  toggleMiddleHorizontalFold: () => void;
  setHoveredGroupId: (
    id: string | null,
    column?: MiddleHorizontalColumn | null,
  ) => void;
  handleHoverScroll: (direction: "down" | "up") => void;
  syncScrollOffset: (offset: number) => void;
  reset: () => void;
}

export function getUnlockedPopUpGroups(offset: number): string[] {
  const total = INITIAL_POPUP_GROUPS.length;
  if (total === 0) return [];
  if (offset >= 0.9) return INITIAL_POPUP_GROUPS.map(g => g.id);
  if (offset >= 0.75) return INITIAL_POPUP_GROUPS.slice(0, Math.ceil(total * 0.75)).map(g => g.id);
  if (offset >= 0.5) return INITIAL_POPUP_GROUPS.slice(0, Math.ceil(total * 0.5)).map(g => g.id);
  return INITIAL_POPUP_GROUPS.slice(0, Math.ceil(total * 0.3)).map(g => g.id);
}

export const usePopUpStore = create<PopUpStoreState>((set) => ({
  popUpGroups: INITIAL_POPUP_GROUPS,
  popUpAllOpen: false,
  unlockedGroupIds: getUnlockedPopUpGroups(0),
  middleHorizontalFolded: null,
  hoveredGroupId: null,
  hoveredMiddleColumn: null,

  togglePopUpGroup: (id) =>
    set((state) => {
      if (!state.unlockedGroupIds.includes(id)) return state;

      let anyClosed = false;
      const isMiddleGroup = id === DYNAMIC_MIDDLE_GROUP_ID;
      const newGroups = state.popUpGroups.map((g) => {
        if (g.id === id) {
          const newState = !g.isOpen;
          if (!newState) anyClosed = true;
          return {
            ...g,
            isOpen: newState,
            hasEverOpened: g.hasEverOpened || newState,
          };
        }
        if (!g.isOpen) anyClosed = true;
        return g;
      });

      return {
        popUpGroups: newGroups,
        popUpAllOpen: !anyClosed,
        middleHorizontalFolded:
          isMiddleGroup && newGroups.find((g) => g.id === id)?.isOpen
            ? null
            : state.middleHorizontalFolded,
      };
    }),

  toggleAllPopUps: () =>
    set((state) => {
      const newAllOpen = !state.popUpAllOpen;
      const newGroups = state.popUpGroups.map((g) => ({
        ...g,
        isOpen: state.unlockedGroupIds.includes(g.id) ? newAllOpen : false,
        hasEverOpened: state.unlockedGroupIds.includes(g.id)
          ? g.hasEverOpened || newAllOpen
          : g.hasEverOpened,
      }));
      return {
        popUpAllOpen: newAllOpen,
        popUpGroups: newGroups,
        middleHorizontalFolded: null,
      };
    }),

  toggleMiddleHorizontalFold: () =>
    set((state) => {
      const middleGroupId = DYNAMIC_MIDDLE_GROUP_ID;
      const nextHorizontalFolded = state.middleHorizontalFolded
        ? null
        : (state.hoveredMiddleColumn ?? "left");
      const newGroups = state.popUpGroups.map((g) => {
        if (g.id !== middleGroupId) return g;
        return {
          ...g,
          isOpen: nextHorizontalFolded ? false : g.isOpen,
        };
      });

      const popUpAllOpen = newGroups.every(
        (g) => !state.unlockedGroupIds.includes(g.id) || g.isOpen,
      );

      return {
        middleHorizontalFolded: nextHorizontalFolded,
        popUpGroups: newGroups,
        popUpAllOpen,
      };
    }),

  setHoveredGroupId: (id, column = null) =>
    set((state) => {
      const nextColumn = id === DYNAMIC_MIDDLE_GROUP_ID ? column : null;
      if (
        state.hoveredGroupId === id &&
        state.hoveredMiddleColumn === nextColumn
      ) {
        return state;
      }

      if (state.hoveredGroupId === id) {
        return {
          hoveredMiddleColumn: nextColumn,
        };
      }

      return {
        hoveredGroupId: id,
        hoveredMiddleColumn: nextColumn,
        // Cancel current folding interaction and reset to default state.
        popUpGroups: state.popUpGroups.map((g) => ({
          ...g,
          isOpen: false,
        })),
        popUpAllOpen: false,
        middleHorizontalFolded: null,
      };
    }),

  handleHoverScroll: (direction) =>
    set((state) => {
      const hoveredGroupId = state.hoveredGroupId;
      if (!hoveredGroupId) return state;
      if (!state.unlockedGroupIds.includes(hoveredGroupId)) return state;

      const isMiddleGroup = hoveredGroupId === DYNAMIC_MIDDLE_GROUP_ID;
      const nextMiddleHorizontalFolded =
        isMiddleGroup && direction === "up" ? state.hoveredMiddleColumn : null;

      if (isMiddleGroup && direction === "up" && !state.hoveredMiddleColumn) {
        return state;
      }

      let changed = false;
      const nextGroups = state.popUpGroups.map((g) => {
        if (g.id !== hoveredGroupId) {
          if (!g.isOpen) return g;
          changed = true;
          return { ...g, isOpen: false };
        }

        const nextIsOpen = direction === "down";

        if (g.isOpen === nextIsOpen) return g;
        changed = true;
        return {
          ...g,
          isOpen: nextIsOpen,
          hasEverOpened: g.hasEverOpened || nextIsOpen,
        };
      });

      if (
        !changed &&
        nextMiddleHorizontalFolded === state.middleHorizontalFolded
      ) {
        return state;
      }

      return {
        popUpGroups: nextGroups,
        popUpAllOpen: false,
        middleHorizontalFolded: nextMiddleHorizontalFolded,
      };
    }),

  syncScrollOffset: (offset) =>
    set((state) => {
      const nextUnlocked = getUnlockedPopUpGroups(offset);

      // If unlocked list hasn't changed, do nothing
      if (
        nextUnlocked.length === state.unlockedGroupIds.length &&
        nextUnlocked.every((id) => state.unlockedGroupIds.includes(id))
      ) {
        return state;
      }

      // Close any groups that are no longer unlocked
      let anyOpen = false;
      const newGroups = state.popUpGroups.map((g) => {
        const isUnlocked = nextUnlocked.includes(g.id);
        const isOpen = isUnlocked ? g.isOpen : false;
        if (isOpen) anyOpen = true;
        return {
          ...g,
          isOpen,
        };
      });

      return {
        unlockedGroupIds: nextUnlocked,
        popUpGroups: newGroups,
        popUpAllOpen: anyOpen,
        middleHorizontalFolded: nextUnlocked.includes(DYNAMIC_MIDDLE_GROUP_ID)
          ? state.middleHorizontalFolded
          : null,
        hoveredGroupId: nextUnlocked.includes(state.hoveredGroupId ?? "")
          ? state.hoveredGroupId
          : null,
        hoveredMiddleColumn: nextUnlocked.includes(DYNAMIC_MIDDLE_GROUP_ID)
          ? state.hoveredMiddleColumn
          : null,
      };
    }),

  reset: () =>
    set({
      popUpGroups: INITIAL_POPUP_GROUPS,
      popUpAllOpen: false,
      unlockedGroupIds: getUnlockedPopUpGroups(0),
      middleHorizontalFolded: null,
      hoveredGroupId: null,
      hoveredMiddleColumn: null,
    }),
}));


