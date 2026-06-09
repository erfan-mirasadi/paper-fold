import { create } from "zustand";
import { ALAK_LAYOUT_CONFIG } from "../data/SurahConfig";
import { SurahLayoutConfig } from "../data/schema";

interface StoryState {
  activeConfig: SurahLayoutConfig<any>;
  setActiveConfig: (config: SurahLayoutConfig<any>) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  activeConfig: ALAK_LAYOUT_CONFIG,
  setActiveConfig: (config) => set({ activeConfig: config }),
}));

export const getActiveStoryConfig = () => useStoryStore.getState().activeConfig;
