"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SurahCarousel } from "./SurahCarousel";
import { SurahCard, SurahCardData } from "./SurahCard";
import { filterSurahs } from "@/app/utils/surahSearch";

// Placeholder cycles through the three supported scripts while idle
const PLACEHOLDERS = [
  { text: "Sure ara…", lang: "tr", dir: "ltr" as const },
  { text: "Search surahs…", lang: "en", dir: "ltr" as const },
  { text: "…ابحث عن سورة", lang: "ar", dir: "rtl" as const },
];

const NO_RESULTS = {
  tr: "Sonuç bulunamadı",
  en: "No surahs found",
  // ar: "لا توجد نتائج",
};

const GOLD = "#C4963B";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
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

export function HeroSurahExplorer({ surahs }: { surahs: SurahCardData[] }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearching = query.trim().length > 0;
  const results = useMemo(() => filterSurahs(surahs, query), [surahs, query]);

  // Rotate the placeholder only while the field is empty
  useEffect(() => {
    if (query) return;
    const timer = setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length),
      2800,
    );
    return () => clearInterval(timer);
  }, [query]);

  const placeholder = PLACEHOLDERS[placeholderIndex];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
        className="relative z-30 px-6 w-full flex justify-center"
        style={{ marginBottom: "clamp(14px, 2.5vh, 28px)" }}
      >
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative flex items-center gap-3 rounded-full cursor-text backdrop-blur-xl transition-all duration-300"
          style={{
            width: "min(560px, 100%)",
            padding: "clamp(10px, 1.4vh, 14px) clamp(18px, 2vw, 24px)",
            background: isFocused ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.38)",
            border: `1px solid ${
              isFocused ? "rgba(196,150,59,0.65)" : "rgba(255,255,255,0.18)"
            }`,
            boxShadow: isFocused
              ? `0 0 0 4px rgba(196,150,59,0.14), 0 8px 32px rgba(0,0,0,0.35)`
              : "0 4px 24px rgba(0,0,0,0.25)",
          }}
        >
          <span
            className="transition-colors duration-300"
            style={{ color: isFocused ? GOLD : "rgba(255,255,255,0.55)" }}
          >
            <SearchIcon />
          </span>

          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              dir="auto"
              spellCheck={false}
              autoComplete="off"
              aria-label="Search surahs"
              className="w-full bg-transparent outline-none text-white/95"
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
                letterSpacing: "0.01em",
              }}
            />

            {/* Cycling trilingual placeholder */}
            {!query && (
              <div className="absolute inset-0 pointer-events-none flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    lang={placeholder.lang}
                    dir={placeholder.dir}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-white/45 truncate w-full"
                    style={{
                      fontFamily:
                        placeholder.lang === "ar"
                          ? "var(--font-cormorant), serif"
                          : "var(--font-manrope), sans-serif",
                      fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
                      textAlign: placeholder.dir === "rtl" ? "right" : "left",
                    }}
                  >
                    {placeholder.text}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Result count chip */}
          <AnimatePresence>
            {isSearching && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:inline-block whitespace-nowrap rounded-full"
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  padding: "3px 10px",
                  color: GOLD,
                  background: "rgba(196,150,59,0.12)",
                  border: "1px solid rgba(196,150,59,0.3)",
                }}
              >
                {results.length}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Carousel (idle) / Results (searching) ── */}
      <div className="w-full flex justify-center">
        {isSearching ? (
          <div
            className="w-full max-w-[1200px] flex flex-wrap justify-center gap-4 md:gap-6 overflow-y-auto px-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            style={{
              maxHeight: "48vh",
              paddingTop: "clamp(12px, 2vh, 24px)",
              paddingBottom: "clamp(12px, 2vh, 24px)",
            }}
          >
            <AnimatePresence mode="popLayout">
              {results.map((surah, index) => (
                <motion.div
                  key={surah.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className="flex-shrink-0"
                  style={{ width: "clamp(220px, 22vw, 340px)" }}
                >
                  <SurahCard
                    surah={surah}
                    index={index}
                    appearDelay={0}
                    appearDuration={0.35}
                  />
                </motion.div>
              ))}

              {results.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2 py-10 text-center"
                >
                  <span
                    className="text-white/70"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
                    }}
                  >
                    {NO_RESULTS.tr}
                  </span>
                  <span
                    className="text-white/40"
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: "0.85rem",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {NO_RESULTS.en}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <SurahCarousel>
            {surahs.map((surah, index) => (
              <SurahCard key={surah.id} surah={surah} index={index} />
            ))}
          </SurahCarousel>
        )}
      </div>
    </div>
  );
}
