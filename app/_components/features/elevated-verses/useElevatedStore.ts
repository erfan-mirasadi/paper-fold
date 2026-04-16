import { create } from "zustand";

// -------------------------------------------------------------------
// ELEVATED VERSE STORE
// -------------------------------------------------------------------
// Tracks which verse is currently "elevated" (lifted off the paper).
//
// State machine:
//   idle     → no verse elevated, clicking a verse triggers elevate
//   elevated → one verse is lifted, clicking same verse or
//              background triggers dismiss
// -------------------------------------------------------------------

export type ElevatedPhase = "idle" | "elevated";

interface ElevatedStoreState {
  /** Currently elevated verse id, or null when idle. */
  activeVerseId: number | null;

  /** Whether any verse has ever been elevated (for lazy mount). */
  hasEverElevated: boolean;

  /** Current lifecycle phase. */
  phase: ElevatedPhase;

  /** Elevate a verse (toggle off if same verse). */
  elevateVerse: (verseId: number) => void;

  /** Dismiss the currently elevated verse. */
  dismiss: () => void;
}

export const useElevatedStore = create<ElevatedStoreState>((set, get) => ({
  activeVerseId: null,
  hasEverElevated: false,
  phase: "idle",

  elevateVerse: (verseId) => {
    const current = get().activeVerseId;
    if (current === verseId) {
      // Toggle off — same verse clicked again
      set({ activeVerseId: null, phase: "idle" });
    } else {
      // Elevate new verse (previous one will animate down via spring)
      set({ activeVerseId: verseId, phase: "elevated", hasEverElevated: true });
    }
  },

  dismiss: () => {
    if (get().phase === "idle") return;
    set({ activeVerseId: null, phase: "idle" });
  },
}));
