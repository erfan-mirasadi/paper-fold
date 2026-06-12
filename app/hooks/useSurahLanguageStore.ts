"use client";

import { create } from "zustand";


export type SurahLanguage = "ar" | "en" | "tr";

export const SURAH_LANGUAGE_ORDER: readonly SurahLanguage[] = [
  "ar",
  "en",
  "tr",
];


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
