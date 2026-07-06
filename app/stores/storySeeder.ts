/**
 * storySeeder — the single code path that prepares every Zustand store for a
 * freshly activated paper (initial route load AND in-page paper switching).
 *
 * Keeping this in one place guarantees that arrow navigation between papers
 * behaves exactly like a fresh page load: fold story starts from the
 * beginning, no elevated/pop-up/camera state leaks across papers.
 */

import { useStoryStore } from "./useStoryStore";
import { initElevatedStoreForStory } from "./useElevatedStore";
import { useCameraStore } from "./useCameraStore";
import { useCameraViewStore } from "./useCameraViewStore";
import { useTafsirStore } from "./useTafsirStore";
import { usePopUpStore, initPopUpStoreForStory } from "./usePopUpStore";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import { cleanupIntroAnimations } from "../hooks/useIntroSectionAnimation";
import type { SurahPaper } from "../data/surahDatabase";

export interface SeedStoresOptions {
  /**
   * Keep the user's camera view selection (bottom-left preset controls)
   * across in-page paper switches. Route-level loads always reset to the
   * default view. The freshly mounted camera is re-aimed at the preserved
   * view by usePaperStore.completeSwitch once the new scene is live.
   */
  preserveCameraView?: boolean;
}

export function seedStoresForPaper(
  paper: SurahPaper,
  options: SeedStoresOptions = {},
): void {
  const { config, textData } = paper;

  cleanupIntroAnimations();
  useStoryStore.getState().setActiveStory(config, textData);
  useFoldStore.getState().resetForStory(config);
  initElevatedStoreForStory(config);

  useCameraStore.setState({
    activeVerseId: null,
    cameraTarget: null,
    phase: "idle",
  });
  if (!options.preserveCameraView) {
    useCameraViewStore.setState({
      requestedView: null,
      selectedView: "default",
      continuousOffset: null,
    });
  }
  useTafsirStore.setState({
    tafsirActiveId: null,
    tafsirAnchorPos: { x: -9999, y: -9999 },
  });
  usePopUpStore.getState().reset();
  initPopUpStoreForStory(config);
}
