"use client";

import { motion } from "framer-motion";
import { useTransition } from "react";
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

  const nextLanguage = () => {
    const currentIndex = SURAH_LANGUAGE_ORDER.indexOf(activeLanguage);
    const nextIndex = (currentIndex + 1) % SURAH_LANGUAGE_ORDER.length;
    startTransition(() => {
      setLanguage(SURAH_LANGUAGE_ORDER[nextIndex]);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      className="pointer-events-auto flex items-center justify-center"
    >
      <OverlayButton
        onClick={nextLanguage}
        aria-label="Dil degistir"
        className="w-14 h-14 flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-[var(--foreground)]"
      >
        <span
          className="transition-opacity duration-150"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {LABEL_BY_LANGUAGE[activeLanguage]}
        </span>
      </OverlayButton>
    </motion.div>
  );
}
