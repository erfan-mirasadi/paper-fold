import { create } from "zustand";

export type PopUpGroup = {
  id: string;
  verseIds: number[];
  isOpen: boolean;
  hasEverOpened: boolean;
};

export type MiddleHorizontalColumn = "left" | "right";

const INITIAL_POPUP_GROUPS: PopUpGroup[] = [
  { id: "g_1_2", verseIds: [1, 2], isOpen: false, hasEverOpened: false },
  { id: "g_3_4", verseIds: [3, 4], isOpen: false, hasEverOpened: false },
  { id: "g_7_8", verseIds: [7, 8], isOpen: false, hasEverOpened: false },
  { id: "g_9_10", verseIds: [9, 10], isOpen: false, hasEverOpened: false },
  {
    id: "g_11_12_13_14",
    verseIds: [11, 12, 13, 14],
    isOpen: false,
    hasEverOpened: false,
  },
  { id: "g_15_16", verseIds: [15, 16], isOpen: false, hasEverOpened: false },
  { id: "g_17_18", verseIds: [17, 18], isOpen: false, hasEverOpened: false },
];

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
}

export function getUnlockedPopUpGroups(offset: number): string[] {
  if (offset >= 0.9)
    return [
      "g_1_2",
      "g_3_4",
      "g_7_8",
      "g_9_10",
      "g_11_12_13_14",
      "g_15_16",
      "g_17_18",
    ];
  if (offset >= 0.75) return ["g_1_2", "g_3_4", "g_7_8", "g_9_10"];
  if (offset >= 0.5) return ["g_1_2", "g_3_4", "g_7_8"];
  return ["g_1_2", "g_3_4"];
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
      const isMiddleGroup = id === "g_11_12_13_14";
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
      const middleGroupId = "g_11_12_13_14";
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
      const nextColumn = id === "g_11_12_13_14" ? column : null;
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

      const isMiddleGroup = hoveredGroupId === "g_11_12_13_14";
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
        middleHorizontalFolded: nextUnlocked.includes("g_11_12_13_14")
          ? state.middleHorizontalFolded
          : null,
        hoveredGroupId: nextUnlocked.includes(state.hoveredGroupId ?? "")
          ? state.hoveredGroupId
          : null,
        hoveredMiddleColumn: nextUnlocked.includes("g_11_12_13_14")
          ? state.hoveredMiddleColumn
          : null,
      };
    }),
}));
