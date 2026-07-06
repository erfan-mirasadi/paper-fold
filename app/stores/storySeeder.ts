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

export function seedStoresForPaper(paper: SurahPaper): void {
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
  useCameraViewStore.setState({
    requestedView: null,
    selectedView: "default",
    continuousOffset: null,
  });
  useTafsirStore.setState({
    tafsirActiveId: null,
    tafsirAnchorPos: { x: -9999, y: -9999 },
  });
  usePopUpStore.getState().reset();
  initPopUpStoreForStory(config);
}
