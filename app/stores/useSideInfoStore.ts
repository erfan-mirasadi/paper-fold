import { create } from "zustand";

/**
 * Open/close state of the right-hand tafsir panel (SideInfoPanel).
 *
 * Lives in a store (rather than component state) because the toggle button
 * sits in the top-right overlay button row — a different subtree from the
 * panel itself.
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
