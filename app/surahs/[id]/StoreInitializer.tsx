"use client";

/**
 * StoreInitializer (ClientSurahLoader) — dynamically loads heavy Surah configurations.
 *
 * IMPORTANT — Bundle Splitting & Code-Splitting Rule:
 *   Instead of importing all Surahs at the top level and causing a massive bundle size,
 *   we fetch the config and text data for the specific route asynchronously via
 *   `getSurahDataAsync(id)`.
 *
 * Pattern: We conditionally render `<SiteLoadingOverlay />` while the fetch is pending.
 * Once the config is retrieved, we synchronously seed all Zustand stores, set `isLoaded`
 * to true, and render `<SurahViewer />`. Because `<SurahViewer />` mounts ONLY AFTER
 * the store has been seeded, there is zero hydration flash and zero layout shift.
 */

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useStoryStore } from "@/app/stores/useStoryStore";
import { getSurahDataAsync } from "@/app/data/surahDatabase";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { initElevatedStoreForStory } from "@/app/stores/useElevatedStore";
import { useCameraStore } from "@/app/stores/useCameraStore";
import { useCameraViewStore } from "@/app/stores/useCameraViewStore";
import { useTafsirStore } from "@/app/stores/useTafsirStore";
import { usePopUpStore, initPopUpStoreForStory } from "@/app/stores/usePopUpStore";
import { cleanupIntroAnimations } from "@/app/hooks/useIntroSectionAnimation";

import { SiteLoadingOverlay } from "@/app/_components/dom/ui-overlay/SiteLoadingOverlay";
import SurahViewer from "./SurahViewer";

interface StoreInitializerProps {
  /** The Surah route id */
  id: string;
}

export function StoreInitializer({ id }: StoreInitializerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentId, setCurrentId] = useState(id);

  // If the user navigates to a new Surah, immediately revert to the loading state
  if (id !== currentId) {
    setCurrentId(id);
    setIsLoaded(false);
  }

  useEffect(() => {
    let active = true;

    // Fetch the chunk asynchronously
    getSurahDataAsync(id).then((entry) => {
      if (!active || !entry) return;

      // Seed all stores synchronously once data is available
      cleanupIntroAnimations();
      useStoryStore.getState().setActiveStory(entry.config, entry.textData);
      useFoldStore.getState().resetForStory(entry.config);
      initElevatedStoreForStory(entry.config);

      useCameraStore.setState({ activeVerseId: null, cameraTarget: null, phase: "idle" });
      useCameraViewStore.setState({ requestedView: null, selectedView: "default", continuousOffset: null });
      useTafsirStore.setState({ tafsirActiveId: null, tafsirAnchorPos: { x: -9999, y: -9999 } });
      usePopUpStore.getState().reset();
      initPopUpStoreForStory(entry.config);

      // Unblock the rendering of SurahViewer
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <AnimatePresence>
        {!isLoaded && <SiteLoadingOverlay key="surah-chunk-loader" />}
      </AnimatePresence>

      {/* Full 3D canvas experience — only mounts once store is fully seeded */}
      {isLoaded && <SurahViewer />}
    </>
  );
}
