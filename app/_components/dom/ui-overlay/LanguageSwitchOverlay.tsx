"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTransition, useState, useRef, useEffect } from "react";
import {
  SURAH_LANGUAGE_ORDER,
  type SurahLanguage,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { OverlayButton } from "./OverlayButton";

const LABEL_BY_LANGUAGE: Record<SurahLanguage, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
};

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

export function LanguageSwitchOverlay() {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const setLanguage = useSurahLanguageStore((s) => s.setLanguage);
  const [isPending, startTransition] = useTransition();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLoading = isPreparing || isPending;

  const handleLanguageSelect = (lang: SurahLanguage) => {
    if (isLoading || lang === activeLanguage) return;
    setIsPreparing(true);
    setIsHovered(false);

    // Give the browser time to paint the loading state and blur before the heavy transition freezes the thread
    setTimeout(() => {
      startTransition(() => {
        setLanguage(lang);
      });
      setIsPreparing(false);
    }, 150);
  };

  const nextLanguage = () => {
    if (isLoading) return;
    setIsPreparing(true);
    setIsHovered(false);

    setTimeout(() => {
      const currentIndex = SURAH_LANGUAGE_ORDER.indexOf(activeLanguage);
      const nextIndex = (currentIndex + 1) % SURAH_LANGUAGE_ORDER.length;

      startTransition(() => {
        setLanguage(SURAH_LANGUAGE_ORDER[nextIndex]);
      });
      setIsPreparing(false);
    }, 150);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300); // slight delay before hiding the menu
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-md dark:bg-black/40 dark:backdrop-blur-lg"
            style={{ pointerEvents: "auto" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
        className="pointer-events-auto relative w-14 h-14 flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <OverlayButton className="w-14 h-14 flex items-center justify-center text-foreground">
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </motion.svg>
              </OverlayButton>
            </motion.div>
          ) : !isHovered ? (
            <motion.div
              key="globe-btn"
              initial={{
                opacity: 0,
                scale: 0.5,
                rotate: -90,
                filter: "blur(4px)",
              }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 100, damping: 22, mass: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <OverlayButton
                onClick={nextLanguage}
                aria-label="Dil degistir"
                className="w-14 h-14 flex items-center justify-center text-foreground transition-transform duration-500 hover:scale-105"
              >
                <GlobeIcon />
              </OverlayButton>
            </motion.div>
          ) : (
            <motion.div
              key="language-list"
              className="absolute right-0 flex items-center whitespace-nowrap"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
                hidden: {
                  transition: { staggerChildren: 0.06, staggerDirection: -1 },
                },
              }}
            >
              {SURAH_LANGUAGE_ORDER.map((lang) => {
                const isActive = activeLanguage === lang;
                return (
                  <motion.div
                    key={lang}
                    variants={{
                      hidden: {
                        opacity: 0,
                        x: 15,
                        scale: 0.9,
                        filter: "blur(4px)",
                      },
                      visible: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      },
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 22, mass: 1 }}
                  >
                    <OverlayButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLanguageSelect(lang);
                      }}
                      className={`h-14 px-3 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`text-[13px] tracking-wide transition-all ${isActive ? "font-bold" : "font-medium"}`}
                      >
                        {LABEL_BY_LANGUAGE[lang]}
                      </span>
                    </OverlayButton>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
