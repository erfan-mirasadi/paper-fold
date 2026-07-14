"use client";

// Left-side surah script sidebar — flowing Arabic text of the active surah, with
// a fixed top bar (menu icon + Quranpatterns wordmark + panel toggle) and
// the surah title + SAYFA/JUZ/HIZB info above the text.
//
// Fully config-driven (works for every surah):
//   - Verses are collected from the active AR text data and sorted into
//     reading order.
//   - When `config.scriptInfo.singleAyahNumber` is set, all verse chunks are
//     fragments of ONE real ayah (Nisa 36, Ayat al-Kursi, Ahzab 35) — the
//     text flows as one piece with a single trailing ayah number.
//     Otherwise every ayah carries its own trailing number.
//   - Bismillah is prepended for every surah EXCEPT those where it is
//     already part of the verse content (Fatiha — `hideBismillah3D`).
//
// The sidebar collapses via the panel toggle; when closed, only the menu
// icon + wordmark stay (the menu icon reopens it). OPEN by default for the
// initial site launch.
//
// Only large screens (lg+, ~1024px and up) are the real target — the paper's
// on-screen position/size is what this has to stay clear of, and vw-based
// sizing is what keeps it lined up as the window gets wider on those screens.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useStoryStore,
  getActiveStoryConfig,
} from "@/app/stores/useStoryStore";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import type { SurahDataShape, Verse } from "@/app/data/SurahConfig";

const GOLD = "#C4963B";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** "#RRGGBB" (or "#RGB") → rgba() string with the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Flatten every verse of the AR text data (section1 grid + anaAyet,
 * section2 intro + colorGroups + outro) into reading order.
 */
function collectAyahs(data: SurahDataShape): Verse[] {
  const all: Verse[] = [
    ...data.section1.gridVerses,
    data.section1.anaAyet,
    data.section2.introVerse,
    ...data.section2.colorGroups.flatMap((g) => g.verses),
    data.section2.outroVerse,
  ];
  const seen = new Set<number>();
  return all
    .filter((v) => {
      if (!v.text || v.number <= 0 || seen.has(v.number)) return false;
      seen.add(v.number);
      return true;
    })
    .sort((a, b) => a.number - b.number)
    .map((v) => ({ ...v, text: v.text.replace(/\s*\n\s*/g, " ") }));
}

/**
 * One script chunk with a fold-story highlight border.
 *
 * Mirrors the paper capsule of the same verse: pill by default, rounded
 * rectangle when the verse has `isPill: false`, colored with the verse's own
 * capsule border color. The border is always laid out (transparent when
 * inactive) so toggling a highlight never reflows the text — it just fades
 * in/out with a soft glow.
 */
function HighlightChunk({
  active,
  isPill,
  color,
  solo,
  children,
}: {
  active: boolean;
  isPill: boolean;
  color: string;
  /**
   * `solo` = numbered-surah mode: the chunk (text + its number badge) renders
   * as ONE unbreakable capsule (inline-block), so the badge can never wrap
   * out of the border into its own fragment. Single-ayah mode leaves this
   * off and keeps the flowing inline text with per-line cloned borders.
   */
  solo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        borderRadius: isPill ? "2em" : "0.4em",
        border: `1.5px solid ${active ? color : "transparent"}`,
        boxShadow: active
          ? `0 0 0.45em ${withAlpha(color, 0.3)}`
          : "0 0 0em rgba(0, 0, 0, 0)",
        backgroundColor: active ? withAlpha(color, 0.08) : "transparent",
        padding: "0.06em 0.35em",
        transition:
          "border-color 0.55s ease, box-shadow 0.55s ease, background-color 0.55s ease",
        ...(solo
          ? {
              display: "inline-block",
              maxWidth: "100%",
              margin: "0.12em 0",
            }
          : {
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
            }),
      }}
    >
      {children}
    </span>
  );
}

/** Inline ayah-number badge — Latin digits inside a thin gold circle. */
function AyahNumber({ n }: { n: number }) {
  return (
    <span
      className="w-[1.75em] h-[1.75em] text-[0.62em]"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 8px",
        border: `1px solid ${GOLD}`,
        borderRadius: "50%",
        color: GOLD,
        lineHeight: 1,
        verticalAlign: "middle",
        fontFamily: "var(--font-sans)",
        direction: "ltr",
      }}
    >
      {n}
    </span>
  );
}

export function SurahScriptSidebar() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const activeTextData = useStoryStore((s) => s.activeTextData);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Fold-story sync: derive the current fold step id from the story scroll
  // offset (0..1 spans the whole foldSteps timeline — same mapping FoldStory
  // uses for the paper). The selector returns a string, so this component
  // only re-renders when the STEP changes, not on every scroll frame.
  const activeStepId = useFoldStore((s) => {
    const steps = getActiveStoryConfig().animations.foldSteps;
    if (steps.length === 0) return null;
    const maxIdx = steps.length - 1;
    return steps[Math.round(clamp01(s.currentOffset) * maxIdx)].id;
  });

  // Only claim the wheel (data-lenis-prevent + inner scroll) when the text
  // actually overflows its box — otherwise wheel events over the script must
  // keep driving the page's fold-story scroll, or the area feels dead/laggy.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, activeConfig.id, activeTextData]);

  const arData = activeTextData.ar;
  const info = activeConfig.scriptInfo;
  const ayahs = collectAyahs(arData);
  if (ayahs.length === 0) return null;

  const singleAyahNumber = info?.singleAyahNumber;
  // Fatiha's bismillah is verse 1 itself — every other surah gets it prepended.
  const showBismillah =
    !activeConfig.features.hideBismillah3D && !!arData.bismillah;
  // Strip the decorative kashida elongation used by the 3D overlay.
  const bismillah = arData.bismillah?.replace(/ـ+/g, "");

  // Verse ids highlighted at the current fold step (config-authored).
  const highlighted = new Set(
    (activeStepId && activeConfig.scriptHighlights?.[activeStepId]) || [],
  );
  // Highlight border mirrors the verse's paper capsule (shape + color).
  const chunkAppearance = (n: number) => {
    const ov = activeConfig.verseOverrides?.[n];
    return { isPill: ov?.isPill !== false, color: ov?.border ?? GOLD };
  };

  return (
    <>
      {/* ── Top bar — menu icon / wordmark / panel toggle, pinned to the
             top-left corner ─────────────────────────────────────────────── */}
      <div
        className="fixed top-[clamp(10px,1.2vw,16px)] left-3 lg:left-5 z-[100]
          pointer-events-auto flex items-center gap-16 lg:gap-18"
      >
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Collapse surah panel" : "Expand surah panel"}
          aria-expanded={isOpen}
          className="w-[22px] flex justify-start text-foreground opacity-70
            hover:opacity-100 transition-opacity duration-300 cursor-pointer select-none"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="15" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        <div
          className="text-center text-foreground text-[13px] lg:text-[clamp(15px,1.15vw,22px)]"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          <span style={{ fontStyle: "italic", fontWeight: 600 }}>Quran</span>
          <span style={{ fontWeight: 400 }}>patterns</span>
        </div>

        {/* Fixed-width slot so the wordmark never shifts when the toggle hides */}
        <div className="w-[22px] flex justify-end">
          <AnimatePresence>
            {isOpen && (
              <motion.button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Collapse surah panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-foreground opacity-70 hover:opacity-100
                  transition-opacity duration-300 cursor-pointer select-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4.5" width="18" height="15" rx="3" />
                  <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="fixed top-[46%] -translate-y-1/2 z-[90] pointer-events-auto
              left-6 w-[150px]
              lg:left-[5vw] lg:w-[16vw]"
          >
            {/* ── Surah title (no border) + surah info ─────────────────── */}
            {info && (
              <div
                className="text-center"
                style={{ marginBottom: "clamp(14px, 1.6vw, 24px)" }}
              >
                <div
                  className="text-foreground text-[15px] lg:text-[clamp(18px,1.5vw,28px)]"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                  }}
                >
                  {info.title}
                </div>
                <div
                  className="text-foreground text-[8px] lg:text-[clamp(9px,0.68vw,13px)]"
                  style={{
                    marginTop: "clamp(4px, 0.5vw, 8px)",
                    opacity: 0.55,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Sayfa {info.sayfa} / Juz {info.juz} / Hizb {info.hizb}
                </div>
              </div>
            )}

            {/* ── Flowing script text ───────────────────────────────────── */}
            <div
              ref={scrollRef}
              {...(hasOverflow ? { "data-lenis-prevent": "" } : {})}
              className={`max-h-[66vh] overscroll-contain
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                ${hasOverflow ? "overflow-y-auto" : "overflow-visible"}`}
            >
              {showBismillah && (
                <div
                  dir="rtl"
                  className="text-center text-[11px] lg:text-[clamp(13px,1.1vw,22px)]"
                  style={{
                    fontFamily: '"QuranFont", serif',
                    color: GOLD,
                    marginBottom: "clamp(8px, 1vw, 16px)",
                  }}
                >
                  {bismillah}
                </div>
              )}

              <p
                dir="rtl"
                className="text-[12px] lg:text-[clamp(16px,1.6vw,30px)] text-foreground"
                style={{
                  margin: 0,
                  // Breathing room so highlight borders (which extend past the
                  // text via their padding) never get cropped at the box edges.
                  padding: "0 0.5em",
                  textAlign: "right",
                  fontFamily: '"QuranFont", serif',
                  lineHeight: 2.3,
                  overflowWrap: "break-word",
                  opacity: 0.85,
                }}
              >
                {singleAyahNumber !== undefined ? (
                  // ONE real ayah: chunks flow as a single text (no numbers),
                  // but each chunk stays individually highlightable by its id.
                  <>
                    {ayahs.map((v) => (
                      <span key={v.number}>
                        <HighlightChunk
                          active={highlighted.has(v.number)}
                          {...chunkAppearance(v.number)}
                        >
                          {v.text}
                        </HighlightChunk>{" "}
                      </span>
                    ))}
                    <AyahNumber n={singleAyahNumber} />
                  </>
                ) : (
                  // Full surah: every ayah carries its own number inside the
                  // highlight capsule, like the capsules on the paper. `solo`
                  // keeps text + number together in ONE unbreakable capsule.
                  ayahs.map((v) => (
                    <span key={v.number}>
                      <HighlightChunk
                        solo
                        active={highlighted.has(v.number)}
                        {...chunkAppearance(v.number)}
                      >
                        {v.text} <AyahNumber n={v.number} />
                      </HighlightChunk>{" "}
                    </span>
                  ))
                )}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
