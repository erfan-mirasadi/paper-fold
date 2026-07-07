"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { OverlayButton } from "./OverlayButton";
import { getAllSurahs, SurahMeta } from "@/app/data/surahDatabase";
import { useSurahLanguageStore } from "@/app/hooks/useSurahLanguageStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SURAH_NAMES: Record<string, { tr: string; en: string }> = {
  fatiha: { tr: "Fâtiha Suresi", en: "Al-Fatihah" },
  alak: { tr: "Alak Suresi", en: "Al-Alaq" },
  ayatalkursi: { tr: "Ayetel Kürsi", en: "Ayat al-Kursi" },
  ahzab35: { tr: "Ahzâb Suresi 35", en: "Al-Ahzab 35" },
  ihlas112: { tr: "İhlas Suresi", en: "Al-Ikhlas" },
  kafirun109: { tr: "Kâfirûn Suresi", en: "Al-Kafirun" },
};

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
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const pathname = usePathname();
  const surahs = getAllSurahs();

  // Only render when we are in a Surah page (e.g. /surahs/[id])
  if (!pathname?.startsWith("/surahs/")) {
    return null;
  }

  const getSurahName = (meta: SurahMeta) => {
    const names = SURAH_NAMES[meta.id];
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
          onClick={() => setIsOpen(true)}
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
                  className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: "none" }}>
                {surahs.map((surah, i) => (
                  <motion.div
                    key={surah.id}
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
