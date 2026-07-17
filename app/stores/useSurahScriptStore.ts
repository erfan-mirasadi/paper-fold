import { create } from "zustand";

/**
 * Open/close state of the left-hand Quran script sidebar (SurahScriptSidebar).
 *
 * Lives in a store (rather than component state) so it can be driven from
 * outside the component — e.g. auto-collapsing it when the user zooms into
 * an elevated verse/section (see useAutoCollapsePanelsOnElevate).
 */
interface SurahScriptState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useSurahScriptStore = create<SurahScriptState>((set) => ({
  isOpen: true,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
