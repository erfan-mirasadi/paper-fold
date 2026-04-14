import { create } from "zustand";

export type PopUpGroup = {
  id: string;
  verseIds: number[];
  isOpen: boolean;
  hasEverOpened: boolean;
};

const INITIAL_POPUP_GROUPS: PopUpGroup[] = [
  { id: "g_1_2", verseIds: [1, 2], isOpen: false, hasEverOpened: false },
  { id: "g_3_4", verseIds: [3, 4], isOpen: false, hasEverOpened: false },
  { id: "g_7_8", verseIds: [7, 8], isOpen: false, hasEverOpened: false },
  { id: "g_9_10", verseIds: [9, 10], isOpen: false, hasEverOpened: false },
  { id: "g_11_12_13_14", verseIds: [11, 12, 13, 14], isOpen: false, hasEverOpened: false },
  { id: "g_15_16", verseIds: [15, 16], isOpen: false, hasEverOpened: false },
  { id: "g_17_18", verseIds: [17, 18], isOpen: false, hasEverOpened: false },
];

interface PopUpStoreState {
  popUpGroups: PopUpGroup[];
  popUpAllOpen: boolean;
  popUpScrollThresholdReached: boolean;
  togglePopUpGroup: (id: string) => void;
  toggleAllPopUps: () => void;
  setPopUpScrollThresholdReached: (reached: boolean) => void;
}

export const usePopUpStore = create<PopUpStoreState>((set) => ({
  popUpGroups: INITIAL_POPUP_GROUPS,
  popUpAllOpen: false,
  popUpScrollThresholdReached: false,

  togglePopUpGroup: (id) => set((state) => {
    let anyClosed = false;
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
    };
  }),

  toggleAllPopUps: () => set((state) => {
    const newAllOpen = !state.popUpAllOpen;
    const newGroups = state.popUpGroups.map((g) => ({
      ...g,
      isOpen: newAllOpen,
      hasEverOpened: g.hasEverOpened || newAllOpen,
    }));
    return {
      popUpAllOpen: newAllOpen,
      popUpGroups: newGroups,
    };
  }),

  setPopUpScrollThresholdReached: (reached) => set((state) => {
    if (state.popUpScrollThresholdReached === reached) return state;
    return { popUpScrollThresholdReached: reached };
  }),
}));
