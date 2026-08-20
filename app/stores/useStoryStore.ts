import { create } from "zustand";
import { ALAK_LAYOUT_CONFIG } from "../data/SurahConfig";
import { SurahLayoutConfig } from "../data/schema";
import type { SurahDataShape } from "../data/SurahConfig";
import { type SurahLanguage } from "../hooks/useSurahLanguageStore";

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

/**
 * An empty page, held only until the real one arrives.
 *
 * WHY THIS IS NOT A REAL SURAH ANY MORE. It used to be Alak's three
 * translations, imported straight from `alak96Config`. Every surah is otherwise
 * loaded on demand — `surahDatabase` puts each one behind its own `import()` —
 * but this one default reached into a specific surah's module at the top of a
 * store that the whole canvas imports, so Alak's verse text was pulled into the
 * shared chunk of EVERY page. A reader opening Nisâ downloaded and parsed the
 * text of Alak to reach it.
 *
 * And none of it was ever looked at. `StoreInitializer` awaits the real paper
 * and calls `setActiveStory` before `SurahViewer` mounts, so every consumer of
 * `activeTextData` — all of them inside the canvas — reads the loaded surah and
 * never this. What the default has to do is satisfy the type and survive being
 * read, which an empty page does.
 */
const EMPTY_VERSE = { number: 0, text: "" } as const;

const EMPTY_SURAH_DATA: SurahDataShape = {
  bismillah: "",
  section1: { label: "", gridVerses: [], anaAyet: { ...EMPTY_VERSE } },
  section2: {
    topLabel: "",
    introVerse: { ...EMPTY_VERSE },
    colorGroups: [],
    outroVerse: { ...EMPTY_VERSE },
    bottomLabel: "",
  },
};

const INITIAL_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: EMPTY_SURAH_DATA,
  en: EMPTY_SURAH_DATA,
  tr: EMPTY_SURAH_DATA,
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
