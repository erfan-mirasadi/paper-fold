"use client";

/**
 * StoreInitializer — synchronously seeds useStoryStore before any canvas render.
 *
 * IMPORTANT — RSC boundary rule:
 *   Functions (like computeFoldYPositions) cannot be serialized across the
 *   Server → Client boundary. We therefore accept only the plain string `id`
 *   as a prop, and resolve the full config + textData entirely on the CLIENT
 *   by calling getSurahData(id) from the client-side module registry.
 *   This keeps all function references inside the client bundle.
 *
 * Pattern: useRef guard executed during the first render pass (before return).
 * This guarantees that by the time SurahViewer reads useStoryStore, the correct
 * config is already in place — zero hydration flash, zero re-renders.
 *
 * This component renders null and is purely side-effectful.
 */

import { useRef } from "react";
import { useStoryStore } from "@/app/stores/useStoryStore";
import { getSurahData } from "@/app/data/surahDatabase";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { initElevatedStoreForStory } from "@/app/stores/useElevatedStore";
import { useCameraStore } from "@/app/stores/useCameraStore";
import { useCameraViewStore } from "@/app/stores/useCameraViewStore";
import { useTafsirStore } from "@/app/stores/useTafsirStore";
import { usePopUpStore, initPopUpStoreForStory } from "@/app/stores/usePopUpStore";

interface StoreInitializerProps {
  /** The Surah route id — the ONLY prop that crosses the RSC boundary. */
  id: string;
}

export function StoreInitializer({ id }: StoreInitializerProps): null {
  const initialized = useRef(false);
  
  // 🚨 FIX BUG 2: خواندن ID فعلی از استور برای مچگیری از HMR
  const currentStoreId = useStoryStore.getState().activeConfig?.id;

  // اگر دفعه اول است، یا HMR باعث شده استور ریست شود و آیدیها فرق کنند:
  if (!initialized.current || currentStoreId !== id) {
    // Look up the full config (including function references) on the CLIENT side.
    // getSurahData is a pure synchronous lookup — safe to call during render.
    const entry = getSurahData(id);

    if (entry) {
      // Synchronous Zustand mutation during render — intentional pattern.
      // Using getState().action() avoids triggering a React state update,
      // which would cause "Cannot update a component while rendering" warnings.
      useStoryStore.getState().setActiveStory(entry.config, entry.textData);
      useFoldStore.getState().resetForStory(entry.config);
      initElevatedStoreForStory(entry.config);

      useCameraStore.setState({ activeVerseId: null, cameraTarget: null, phase: "idle" });
      useCameraViewStore.setState({ requestedView: null, selectedView: "default", continuousOffset: null });
      useTafsirStore.setState({ tafsirActiveId: null, tafsirAnchorPos: { x: -9999, y: -9999 } });
      usePopUpStore.getState().reset();
      initPopUpStoreForStory(entry.config);
    }

    initialized.current = true;
  }

  return null;
}
