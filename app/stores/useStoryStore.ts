import { create } from "zustand";
import { ALAK_LAYOUT_CONFIG } from "../data/SurahConfig";
import { SurahLayoutConfig } from "../data/schema";
import type { SurahDataShape } from "../data/SurahConfig";
import { type SurahLanguage } from "../hooks/useSurahLanguageStore";
import {
  ALAK_TEXT_AR,
  ALAK_TEXT_EN,
  ALAK_TEXT_TR,
} from "../data/configs/alak96Config";

interface StoryState {
  activeConfig: SurahLayoutConfig;
  activeTextData: Record<SurahLanguage, SurahDataShape>;
  /**
   * Bumps on every setActiveStory. The 3D scene is PERSISTENT across paper
   * switches — only content buffers (RenderTextures) and config-bound
   * subtrees key on this revision to rebuild in place, which is far cheaper
   * than remounting the scene.
   */
  storyRevision: number;
  setActiveStory: (config: SurahLayoutConfig, textData: Record<SurahLanguage, SurahDataShape>) => void;
}

const INITIAL_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: ALAK_TEXT_AR,
  en: ALAK_TEXT_EN,
  tr: ALAK_TEXT_TR,
};

export const useStoryStore = create<StoryState>((set) => ({
  activeConfig: ALAK_LAYOUT_CONFIG,
  activeTextData: INITIAL_TEXT_DATA,
  storyRevision: 0,
  setActiveStory: (config, textData) => {
    // Clean up drag engine state before switching stories to prevent
    // stale SpringValues and drag markers from leaking across surah navigations.
    // Lazy import avoids a circular dependency (dragEngine → useStoryStore → dragEngine).
    import("../utils/dragEngine").then(({ resetDragEngineForStory }) => {
      resetDragEngineForStory();
    });
    set((state) => ({
      activeConfig: config,
      activeTextData: textData,
      storyRevision: state.storyRevision + 1,
    }));
  },
}));

export const getActiveStoryConfig = () => useStoryStore.getState().activeConfig;
export const getActiveStoryTextData = () => useStoryStore.getState().activeTextData;
