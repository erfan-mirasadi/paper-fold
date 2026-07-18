"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { OverlayButton } from "./OverlayButton";
import { getAllSurahs, SurahMeta } from "@/app/data/surahDatabase";
import {
  useSurahLanguageStore,
  SurahLanguage,
} from "@/app/hooks/useSurahLanguageStore";
import { SURAH_LOCAL_NAMES, filterSurahs } from "@/app/utils/surahSearch";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Placeholder stays Turkish regardless of active language — Arabic script in
// the input hint reads as a data-entry prompt, not a label, inside this menu.
const SEARCH_PLACEHOLDER = "Sure ara…";

const NO_RESULTS: Record<SurahLanguage, string> = {
  tr: "Sonuç bulunamadı",
  en: "No surahs found",
  ar: "Sonuç bulunamadı",
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SurahMenuOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const pathname = usePathname();
  const surahs = getAllSurahs();

  const sortedSurahs = useMemo(
    () =>
      [...surahs].sort((a, b) =>
        a.arabicName.localeCompare(b.arabicName, "ar"),
      ),
    [surahs],
  );

  const visibleSurahs = useMemo(
    () => filterSurahs(sortedSurahs, query),
    [sortedSurahs, query],
  );

  // Only render when we are in a Surah page (e.g. /surahs/[id])
  if (!pathname?.startsWith("/surahs/")) {
    return null;
  }

  const openMenu = () => {
    setQuery("");
    setIsOpen(true);
  };

  const getSurahName = (meta: SurahMeta) => {
    const names = SURAH_LOCAL_NAMES[meta.id];
    if (!names) return meta.displayName;
    if (activeLanguage === "en") return names.en;
    return names.tr;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
        className="pointer-events-auto flex items-center justify-center"
      >
        <OverlayButton
          onClick={openMenu}
          aria-label="Menu"
          className="w-14 h-14"
        >
          <MenuIcon />
        </OverlayButton>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[90%] max-w-md max-h-[80vh] overflow-hidden rounded-[32px] bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/10">
                <h2 className="text-xl font-medium tracking-wide">
                  {activeLanguage === "en" ? "Surahs" : "Sureler"}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all hover:scale-110"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>
              {/* Search field */}
              <div className="px-4 pt-4">
                <div className="group/search flex items-center gap-3 rounded-full px-4 py-2.5 bg-white/30 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all duration-300 focus-within:border-[#C4963B]/60 focus-within:shadow-[0_0_0_4px_rgba(196,150,59,0.12)] focus-within:bg-white/50 dark:focus-within:bg-black/40">
                  <span className="opacity-50 group-focus-within/search:opacity-100 group-focus-within/search:text-[#C4963B] transition-all duration-300">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={SEARCH_PLACEHOLDER}
                    dir="auto"
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Search surahs"
                    className="flex-1 min-w-0 bg-transparent outline-none text-[15px] placeholder:opacity-50 placeholder:text-current"
                  />
                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/25 transition-all hover:scale-110"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div
                className="overflow-y-auto p-4 space-y-2"
                style={{ scrollbarWidth: "none" }}
              >
                {visibleSurahs.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 text-[15px] opacity-50"
                    dir="auto"
                  >
                    {NO_RESULTS[activeLanguage]}
                  </motion.p>
                )}
                {visibleSurahs.map((surah, i) => (
                  <motion.div
                    key={surah.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/surahs/${surah.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 rounded-2xl bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[17px] font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                          {getSurahName(surah)}
                        </span>
                        <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity font-serif">
                          {surah.arabicName}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
