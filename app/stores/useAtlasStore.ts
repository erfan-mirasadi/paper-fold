"use client";

/**
 * useAtlasStore — which sheet of the board the reader is looking at.
 *
 * The board has exactly two states and the camera is the only thing that
 * distinguishes them: pulled back far enough to frame every sheet at once, or
 * moved in on ONE sheet. Nothing about the sheets themselves changes between
 * the two, which is why this store holds an id and nothing else — no phase
 * machine, no transition flags, no per-sheet state to keep in sync.
 *
 * The camera controller reads `focusedSheetId` every frame and eases toward
 * whatever it finds, so a change here is a request, never a jump: clicking a
 * second sheet mid-flight simply re-aims the same continuous motion instead of
 * queueing behind the first.
 */

import { create } from "zustand";

interface AtlasState {
  /** Sheet the camera is on, or null for the whole-board view. */
  focusedSheetId: string | null;
  /** Sheet under the pointer — drives hover lift and the cursor. */
  hoveredSheetId: string | null;

  focusSheet: (id: string) => void;
  /** Pull back to the whole board. */
  clearFocus: () => void;
  /** Click behaviour: focus a sheet, or pull back if it is already focused. */
  toggleSheet: (id: string) => void;
  setHovered: (id: string | null) => void;
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  focusedSheetId: null,
  hoveredSheetId: null,

  focusSheet: (id) => set({ focusedSheetId: id }),
  clearFocus: () => set({ focusedSheetId: null }),

  toggleSheet: (id) =>
    set({ focusedSheetId: get().focusedSheetId === id ? null : id }),

  setHovered: (id) => set({ hoveredSheetId: id }),
}));
