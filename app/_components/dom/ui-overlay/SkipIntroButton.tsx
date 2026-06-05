"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "../LenisProvider";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { useState } from "react";

export function SkipIntroButton() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const rawOffset = useFoldStore((s) => s.rawOffset);
  const lenis = useLenis();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = () => {
    if (!lenis) return;
    setIsSkipping(true);
    useFoldStore.getState().setActiveAmbientMediaId(null);
    useFoldStore.getState().setInstantSkip(true);

    // Wait for the long fade out to complete before doing the messy jump
    setTimeout(() => {
      // Jump to the START of the story (60% of max scroll)
      const storyStartOffset = 0.6;
      lenis.scrollTo(lenis.limit * storyStartOffset, { immediate: true });

      // Wait slightly after jumping before lifting the curtain
      setTimeout(() => {
        setIsSkipping(false);
        useFoldStore.getState().setInstantSkip(false);
      }, 600);
    }, 350);
  };

  // 0.15 represents the end of the intro band (page 1) in ScrollManager's SCROLL_TIMELINE
  const isPage1 = rawOffset < 0.15;

  return (
    <>
      <AnimatePresence>
        {isIntroActive && !isSkipping && isPage1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={handleSkip}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] text-white/50 hover:text-white transition-colors duration-500 tracking-[0.25em] uppercase text-xs font-light px-8 py-4 cursor-pointer pointer-events-auto"
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Girişi Geç
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSkipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-[var(--page-bg)] z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
