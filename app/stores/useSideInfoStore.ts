import { create } from "zustand";

/**
 * Open/close state of the right-hand tafsir panel (SideInfoPanel).
 *
 * Lives in a store (rather than component state) so
 * useAutoCollapsePanelsOnElevate can read/close/restore it from outside the
 * panel's component tree.
 */
interface SideInfoState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useSideInfoStore = create<SideInfoState>((set) => ({
  isOpen: true,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
