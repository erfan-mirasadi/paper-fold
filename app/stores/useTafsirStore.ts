import { create } from "zustand";

interface TafsirStoreState {
  tafsirActiveId: number | null;
  tafsirAnchorPos: { x: number; y: number };
  setTafsirActiveId: (id: number | null) => void;
  setTafsirAnchorPos: (x: number, y: number) => void;
}

export const useTafsirStore = create<TafsirStoreState>((set) => ({
  tafsirActiveId: null,
  tafsirAnchorPos: { x: -9999, y: -9999 },
  
  setTafsirActiveId: (id) => set((state) => {
    if (state.tafsirActiveId === id) return state;
    return { tafsirActiveId: id };
  }),

  setTafsirAnchorPos: (x, y) => set((state) => {
    if (Math.abs(state.tafsirAnchorPos.x - x) < 0.5 && Math.abs(state.tafsirAnchorPos.y - y) < 0.5) {
      return state;
    }
    return { tafsirAnchorPos: { x, y } };
  }),
}));
