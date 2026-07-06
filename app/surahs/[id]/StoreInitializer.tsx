"use client";

/**
 * StoreInitializer (ClientSurahLoader) — dynamically loads heavy Surah configurations.
 *
 * IMPORTANT — Bundle Splitting & Code-Splitting Rule:
 *   Instead of importing all Surahs at the top level and causing a massive bundle size,
 *   we fetch the config and text data for the FIRST paper of the route asynchronously
 *   via `loadSurahPaper(id, 0)`. Additional papers of the same Surah are loaded on
 *   demand by `usePaperStore` when the user navigates with the paper arrows.
 *
 * Pattern: We conditionally render `<SiteLoadingOverlay />` while the fetch is pending.
 * Once the config is retrieved, we synchronously seed all Zustand stores (via the
 * shared `seedStoresForPaper` — the same code path paper switching uses), set
 * `isLoaded` to true, and render `<SurahViewer />`. Because `<SurahViewer />` mounts
 * ONLY AFTER the store has been seeded, there is zero hydration flash and zero
 * layout shift.
 */

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { loadSurahPaper } from "@/app/data/surahDatabase";
import { seedStoresForPaper } from "@/app/stores/storySeeder";
import { usePaperStore } from "@/app/stores/usePaperStore";

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

    // Fetch the first paper's chunk asynchronously
    loadSurahPaper(id, 0).then((paper) => {
      if (!active || !paper) return;

      // Seed all stores synchronously once data is available — the exact same
      // code path usePaperStore.goToPaper uses for in-page paper switching.
      seedStoresForPaper(paper);
      usePaperStore.getState().initForSurah(id);

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
