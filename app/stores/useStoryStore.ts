import { create } from "zustand";
import { ALAK_LAYOUT_CONFIG } from "../data/SurahConfig";
import { SurahLayoutConfig } from "../data/schema";
import { type SurahLanguage } from "../hooks/useSurahLanguageStore";
import {
  type SurahDataShape,
  SURAH_DATA_ARABIC,
  SURAH_DATA_ENGLISH,
  SURAH_DATA_TURKISH,
} from "../data/surahData";

interface StoryState {
  activeConfig: SurahLayoutConfig;
  activeTextData: Record<SurahLanguage, SurahDataShape>;
  setActiveStory: (config: SurahLayoutConfig, textData: Record<SurahLanguage, SurahDataShape>) => void;
}

const INITIAL_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: SURAH_DATA_ARABIC,
  en: SURAH_DATA_ENGLISH,
  tr: SURAH_DATA_TURKISH,
};

export const useStoryStore = create<StoryState>((set) => ({
  activeConfig: ALAK_LAYOUT_CONFIG,
  activeTextData: INITIAL_TEXT_DATA,
  setActiveStory: (config, textData) => {
    // Clean up drag engine state before switching stories to prevent
    // stale SpringValues and drag markers from leaking across surah navigations.
    // Lazy import avoids a circular dependency (dragEngine → useStoryStore → dragEngine).
    import("../utils/dragEngine").then(({ resetDragEngineForStory }) => {
      resetDragEngineForStory();
    });
    set({ activeConfig: config, activeTextData: textData });
  },
}));

export const getActiveStoryConfig = () => useStoryStore.getState().activeConfig;
export const getActiveStoryTextData = () => useStoryStore.getState().activeTextData;
