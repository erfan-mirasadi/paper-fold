"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTransition, useState } from "react";
import {
  SURAH_LANGUAGE_ORDER,
  type SurahLanguage,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { OverlayButton } from "./OverlayButton";

const LABEL_BY_LANGUAGE: Record<SurahLanguage, string> = {
  ar: "AR",
  en: "EN",
  tr: "TR",
};

export function LanguageSwitchOverlay() {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const setLanguage = useSurahLanguageStore((s) => s.setLanguage);
  const [isPending, startTransition] = useTransition();
  const [isPreparing, setIsPreparing] = useState(false);

  const isLoading = isPreparing || isPending;

  const nextLanguage = () => {
    if (isLoading) return;
    setIsPreparing(true);

    // Give the browser time to paint the loading state and blur before the heavy transition freezes the thread
    setTimeout(() => {
      const currentIndex = SURAH_LANGUAGE_ORDER.indexOf(activeLanguage);
      const nextIndex = (currentIndex + 1) % SURAH_LANGUAGE_ORDER.length;
      
      startTransition(() => {
        setLanguage(SURAH_LANGUAGE_ORDER[nextIndex]);
      });
      setIsPreparing(false);
    }, 150);
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 -z-10 bg-black/10 backdrop-blur-[3px] dark:bg-black/30 dark:backdrop-blur-sm"
            style={{ pointerEvents: "auto" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
        className="pointer-events-auto flex items-center justify-center"
      >
        <OverlayButton
          onClick={nextLanguage}
          aria-label="Dil degistir"
          className="w-14 h-14 flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-foreground"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </motion.svg>
              </motion.div>
            ) : (
              <motion.span
                key={activeLanguage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {LABEL_BY_LANGUAGE[activeLanguage]}
              </motion.span>
            )}
          </AnimatePresence>
        </OverlayButton>
      </motion.div>
    </>
  );
}
