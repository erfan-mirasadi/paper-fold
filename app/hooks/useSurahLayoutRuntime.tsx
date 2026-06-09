"use client";

import { useMemo } from "react";
import {
  useSurahLanguageStore,
  type SurahLanguage,
} from "./useSurahLanguageStore";
import {
  BASE_PAGE_WIDTH,
  PAGE_HEIGHT,
  buildSurahTransforms,
  createLayoutMath,
  SCENE_CENTER_Y_OFFSET,
} from "../data/SurahConfig";
import { useStoryStore } from "../stores/useStoryStore";

export function getPageWidthForLanguage(language: SurahLanguage) {
  return BASE_PAGE_WIDTH + (language === "en" || language === "tr" ? 0.3 : 0);
}

export function useSurahLayoutRuntime() {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const activeConfig = useStoryStore((s) => s.activeConfig);

  const pageWidth = useMemo(
    () => getPageWidthForLanguage(activeLanguage),
    [activeLanguage],
  );

  const layout = useMemo(() => createLayoutMath(activeConfig, pageWidth), [activeConfig, pageWidth]);
  const transforms = useMemo(
    () => buildSurahTransforms(layout, layout.START_X, activeConfig),
    [layout, activeConfig],
  );
  const foldYPositions = useMemo(
    () => activeConfig.animations.computeFoldYPositions(layout),
    [layout, activeConfig],
  );
  const foldSteps = activeConfig.animations.foldSteps;
  const scrollPages = activeConfig.dimensions.scrollPages;

  const SCENE_CENTER_Y = PAGE_HEIGHT / 2 + SCENE_CENTER_Y_OFFSET;

  return {
    activeLanguage,
    PAGE_WIDTH: pageWidth,
    PAGE_HEIGHT,
    SCENE_CENTER_Y,
    PW: layout.PW,
    START_X: layout.START_X,
    layoutMath: layout,
    SURAH_TRANSFORMS: transforms,
    FOLD_Y_POSITIONS: foldYPositions,
    foldSteps,
    scrollPages,
    config: activeConfig,
  };
}
