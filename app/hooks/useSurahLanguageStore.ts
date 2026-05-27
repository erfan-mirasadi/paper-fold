"use client";

import { create } from "zustand";
import {
  SURAH_DATA_ARABIC,
  SURAH_DATA_ENGLISH,
  SURAH_DATA_TURKISH,
  type SurahDataShape,
} from "../data/surahData";

export type SurahLanguage = "ar" | "en" | "tr";

export const SURAH_LANGUAGE_ORDER: readonly SurahLanguage[] = [
  "ar",
  "en",
  "tr",
];

export const SURAH_DATA_BY_LANGUAGE: Record<SurahLanguage, SurahDataShape> = {
  ar: SURAH_DATA_ARABIC,
  en: SURAH_DATA_ENGLISH,
  tr: SURAH_DATA_TURKISH,
};

export const ANA_AYET_LABEL_BY_LANGUAGE: Record<SurahLanguage, string> = {
  ar: "Ana Ayet",
  en: "Ana Ayet",
  tr: "Ana Ayet",
};

interface SurahLanguageState {
  activeLanguage: SurahLanguage;
  setLanguage: (language: SurahLanguage) => void;
  cycleLanguage: () => void;
}

export const useSurahLanguageStore = create<SurahLanguageState>((set, get) => ({
  activeLanguage: "ar",
  setLanguage: (language) => set({ activeLanguage: language }),
  cycleLanguage: () => {
    const current = get().activeLanguage;
    const currentIndex = SURAH_LANGUAGE_ORDER.indexOf(current);
    const nextIndex = (currentIndex + 1) % SURAH_LANGUAGE_ORDER.length;
    set({ activeLanguage: SURAH_LANGUAGE_ORDER[nextIndex] });
  },
}));
