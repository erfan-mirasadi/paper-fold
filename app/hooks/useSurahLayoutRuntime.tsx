"use client";

import { useMemo } from "react";
import {
  useSurahLanguageStore,
  type SurahLanguage,
} from "./useSurahLanguageStore";
import {
  buildSurahTransforms,
  createLayoutMath,
  createBlockLayoutMath,
  buildBlockTransforms,
} from "../data/SurahConfig";
import { useStoryStore } from "../stores/useStoryStore";

export function getPageWidthForLanguage(language: SurahLanguage, basePageWidth: number, configId?: string) {
  if (configId === "ahzab35" || configId === "kafirun109") {
    return basePageWidth;
  }
  return basePageWidth + (language === "en" || language === "tr" ? 0.3 : 0);
}

export function useSurahLayoutRuntime() {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const activeConfig = useStoryStore((s) => s.activeConfig);

  const pageWidth = useMemo(
    () => getPageWidthForLanguage(activeLanguage, activeConfig.dimensions.paperWidth, activeConfig.id),
    [activeLanguage, activeConfig.dimensions.paperWidth, activeConfig.id],
  );

  // Dual-path engine: new block engine when config.blocks is defined,
  // legacy engine for unconverted configs.
  const isBlockConfig = !!(activeConfig.blocks && activeConfig.blocks.length > 0);

  const layout = useMemo(() => {
    if (isBlockConfig) return createBlockLayoutMath(activeConfig, pageWidth);
    return createLayoutMath(activeConfig, pageWidth);
  }, [activeConfig, pageWidth, isBlockConfig]);

  const transforms = useMemo(() => {
    if (isBlockConfig) return buildBlockTransforms(layout as any, layout.START_X, activeConfig);
    return buildSurahTransforms(layout as any, layout.START_X, activeConfig);
  }, [layout, activeConfig, isBlockConfig]);
  const foldYPositions = useMemo(
    () => activeConfig.animations.computeFoldYPositions(layout),
    [layout, activeConfig],
  );
  const foldSteps = activeConfig.animations.foldSteps;
  const scrollPages = activeConfig.dimensions.scrollPages;

  const SCENE_CENTER_Y = activeConfig.dimensions.paperHeight / 2 + activeConfig.dimensions.sceneCenterYOffset;

  return useMemo(() => ({
    activeLanguage,
    PAGE_WIDTH: pageWidth,
    PAGE_HEIGHT: activeConfig.dimensions.paperHeight,
    SCENE_CENTER_Y,
    PW: layout.PW,
    START_X: layout.START_X,
    layoutMath: layout,
    SURAH_TRANSFORMS: transforms,
    FOLD_Y_POSITIONS: foldYPositions,
    foldSteps,
    scrollPages,
    config: activeConfig,
  }), [
    activeLanguage,
    pageWidth,
    activeConfig,
    SCENE_CENTER_Y,
    layout,
    transforms,
    foldYPositions,
    foldSteps,
    scrollPages
  ]);
}
