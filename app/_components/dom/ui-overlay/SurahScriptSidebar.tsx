"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  useStoryStore,
  getActiveStoryConfig,
} from "@/app/stores/useStoryStore";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import type { SurahDataShape, Verse } from "@/app/data/SurahConfig";
import { OverlayButton } from "@/app/_components/dom/ui-overlay/OverlayButton";

const GOLD = "#C4963B";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** "#RRGGBB" (or "#RGB") → rgba() string with the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
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
  // Colored sweep layer (slides in from right when active)
  const sweepColor = color.startsWith("#") ? withAlpha(color, 0.22) : color;
  // Warm text glow when active
  const glow = color.startsWith("#") ? withAlpha(color, 0.55) : "transparent";

  return (
    <span
      style={{
        color: "inherit",
        // Subtle always-visible capsule base
        backgroundColor: "rgba(255,255,255,0.045)",
        // Color sweep (right → left)
        backgroundImage: `linear-gradient(to left, ${sweepColor}, ${sweepColor})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        backgroundSize: active ? "100% 100%" : "0% 100%",
        borderRadius: isPill ? "999px" : "5px",
        padding: "0.08em 0",
        transition: [
          "background-size 1.15s cubic-bezier(0.16, 1, 0.3, 1)",
          "text-shadow 0.9s ease",
          "filter 0.9s ease",
        ].join(", "),
        textShadow: active
          ? `0 0 18px ${glow}, 0 0 6px ${withAlpha(color, 0.3)}`
          : "none",
        filter: active ? "brightness(1.15)" : "brightness(1)",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        ...(solo
          ? {
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }
          : {}),
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
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

// ── Sidebar toggle — single button that physically moves between slots ──
function SidebarToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <MotionConfig transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
      <OverlayButton
        layoutId="sidebar-toggle"
        layout
        onClick={onToggle}
        aria-label={isOpen ? "Collapse surah panel" : "Expand surah panel"}
        aria-expanded={isOpen}
        className="w-[23px] h-[23px] text-foreground"
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeLinejoin="round"
          overflow="visible"
        >
          {/* Outer frame — always present */}
          <motion.rect x="3" y="4.5" width="18" height="15" rx="2.8" />

          {/* Left divider */}
          <motion.line
            animate={{ opacity: isOpen ? 1 : 0.3 }}
            x1="9.5"
            y1="4.5"
            x2="9.5"
            y2="19.5"
          />

          {/* Chevron — morphs direction */}
          <motion.polyline
            animate={{
              points: isOpen
                ? "7,9.5 4.5,12 7,14.5"
                : "13.5,9.5 16,12 13.5,14.5",
            }}
            points="7,9.5 4.5,12 7,14.5"
            fill="none"
          />

          {/* Subtle content lines (visible when open) */}
          <motion.line
            animate={{ opacity: isOpen ? 0.35 : 0 }}
            x1="12.5"
            y1="9"
            x2="18"
            y2="9"
          />
          <motion.line
            animate={{ opacity: isOpen ? 0.35 : 0 }}
            x1="12.5"
            y1="12"
            x2="17"
            y2="12"
          />
          <motion.line
            animate={{ opacity: isOpen ? 0.35 : 0 }}
            x1="12.5"
            y1="15"
            x2="18"
            y2="15"
          />
        </svg>
      </OverlayButton>
    </MotionConfig>
  );
}

// ── Animated brand — slow crossfade loop: logo ↔ title every ~5 s ───────────
const BRAND_HOLD_MS = 5000; // how long each face stays visible

function AnimatedBrand({ title }: { title?: string }) {
  // showTitle toggles on interval; resets to false when surah changes
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setShowTitle(false);
    if (!title) return;
    const id = setInterval(() => setShowTitle((v) => !v), BRAND_HOLD_MS);
    return () => clearInterval(id);
  }, [title]);

  // Very slow ease — luxurious, not mechanical
  const fade = { duration: 1.6, ease: [0.4, 0, 0.2, 1] as const };

  const containerCls = `relative
    h-[16px] w-[99px]
    lg:h-[clamp(18px,1.5vw,40px)] lg:w-[clamp(112px,9.3vw,248px)]
    [@media(min-width:3000px)]:h-[clamp(40px,1.7vw,56px)]
    [@media(min-width:3000px)]:w-[clamp(248px,10vw,340px)]`;

  return (
    <div className={containerCls}>
      {/* ── Logo — fades out when title takes over ── */}
      <motion.div
        aria-label="Quranpatterns"
        role="img"
        className="absolute inset-0 text-foreground"
        animate={{ opacity: showTitle ? 0 : 1 }}
        transition={fade}
        style={{
          backgroundColor: "currentColor",
          WebkitMask: "url(/Quranpatterns.svg) no-repeat center / contain",
          mask: "url(/Quranpatterns.svg) no-repeat center / contain",
          pointerEvents: "none",
        }}
      />

      {/* ── Title — fades in over the logo ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: showTitle ? 1 : 0 }}
        transition={fade}
        style={{ pointerEvents: "none" }}
      >
        <motion.span
          className="whitespace-nowrap text-foreground text-[16px] lg:text-[clamp(19px,1.7vw,40px)]"
          // On each entrance: letterSpacing settles slowly from wide to tight
          animate={
            showTitle
              ? { letterSpacing: "-0.02em" }
              : { letterSpacing: "0.12em" }
          }
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 300,
          }}
        >
          {title}
        </motion.span>
      </motion.div>
    </div>
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
  // Keep the decorative kashida elongation used by the 3D overlay so it appears wider and elegant.
  const bismillah = arData.bismillah;

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
      {/* ── Top bar — wordmark + single animated sidebar toggle ─────────── */}
      <div
        className="fixed top-[clamp(10px,1.2vw,16px)] left-3 lg:left-5 z-[100]
          pointer-events-auto flex items-center
          gap-8
          lg:gap-[clamp(3.5rem,6.2vw,11rem)]
          [@media(min-width:2000px)]:gap-[clamp(5rem,6.5vw,12rem)]
          [@media(min-width:3000px)]:gap-[clamp(7rem,8vw,18rem)]"
      >
        {/* LEFT slot — button lives here when sidebar is CLOSED */}
        <div className="w-[22px] flex justify-start">
          {!isOpen && (
            <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(true)} />
          )}
        </div>

        {/* Animated brand — alternates between logo and surah title */}
        <AnimatedBrand title={info?.title} />

        {/* RIGHT slot — button lives here when sidebar is OPEN */}
        <div className="w-[22px] flex justify-end">
          {isOpen && (
            <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(false)} />
          )}
        </div>
      </div>

      {/* ── Fold-story divider — thin line below the top bar ─────────────── */}
      <div
        className="fixed left-3 lg:left-5 z-[99] pointer-events-none"
        style={{
          top: "clamp(42px, 4vw, 68px)",
          width: "clamp(140px, 18vw, 320px)",
        }}
      >
        <div
          style={{
            height: "1px",
            background: `linear-gradient(to right, ${withAlpha(GOLD, 0.7)}, ${withAlpha(GOLD, 0.15)} 60%, transparent 100%)`,
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              // Anchor just below the top bar — top is larger to give proper
              // breathing room at 4K where the logo/bar renders bigger.
              top: "clamp(80px, 6.5vw, 260px)",
              bottom: "clamp(20px, 2.5vw, 48px)",
            }}
            className="fixed z-[90] pointer-events-auto
              left-2 w-[160px] flex flex-col
              lg:left-[2vw] lg:w-[22vw]"
          >
            {/* ── Surah title + surah info — commented out (shown in top bar instead) ──
            {info && (
              <div
                className="text-center flex-shrink-0"
                style={{ marginBottom: "clamp(14px, 1.6vw, 24px)" }}
              >
                <div
                  className="text-foreground text-[17px] lg:text-[clamp(22px,1.9vw,48px)]"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                  }}
                >
                  {info.title}
                </div>
                <div
                  className="text-foreground text-[9px] lg:text-[clamp(11px,0.85vw,20px)]"
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
            ── */}

            {/* ── Flowing script text — grows to fill remaining aside height */}
            <div
              ref={scrollRef}
              {...(hasOverflow ? { "data-lenis-prevent": "" } : {})}
              className={`flex-1 min-h-0 overscroll-contain
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                ${hasOverflow ? "overflow-y-auto" : "overflow-visible"}`}
            >
              {showBismillah && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(4px)", y: -5 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                  dir="rtl"
                  className="text-center text-[13px] lg:text-[clamp(13px,1vw,20px)] [@media(min-width:2000px)]:text-[clamp(16px,1.3vw,42px)]"
                  style={{
                    fontFamily: '"QuranFont", serif',
                    color: GOLD,
                    marginBottom: "clamp(10px, 1.2vw, 20px)",
                    textShadow: `0 0 12px ${withAlpha(GOLD, 0.4)}`,
                  }}
                >
                  {bismillah}
                </motion.div>
              )}

              {singleAyahNumber !== undefined ? (
                // ONE real ayah: chunks flow as inline text (no numbers),
                // each chunk individually highlightable. RTL paragraph.
                <p
                  dir="rtl"
                  className="text-[12px] lg:text-[clamp(13px,1vw,20px)] [@media(min-width:2000px)]:text-[clamp(16px,1.25vw,48px)] text-foreground"
                  style={{
                    margin: 0,
                    padding: "0 0.5em",
                    textAlign: "center",
                    fontFamily: '"QuranFont", serif',
                    lineHeight: 2.3,
                    overflowWrap: "break-word",
                    opacity: 0.85,
                  }}
                >
                  {ayahs.map((v) => (
                    <span key={v.number}>
                      <HighlightChunk
                        active={highlighted.has(v.number)}
                        {...chunkAppearance(v.number)}
                      >
                        {v.text}
                      </HighlightChunk>
                      {" "}
                    </span>
                  ))}
                  <AyahNumber n={singleAyahNumber} />
                </p>
              ) : (
                // Full surah: ONE flowing RTL paragraph — verses flow like
                // words, multiple per line when they fit, text within a verse
                // can wrap (box-decoration-break:clone redraws the border on
                // each wrapped line). No solo, no nowrap, no flex.
                <p
                  dir="rtl"
                  className="text-[12px] lg:text-[clamp(13px,1vw,20px)] [@media(min-width:2000px)]:text-[clamp(16px,1.25vw,48px)] text-foreground"
                  style={{
                    margin: 0,
                    padding: "0 0.3em",
                    textAlign: "center",
                    fontFamily: '"QuranFont", serif',
                    lineHeight: 2.6,
                    opacity: 0.85,
                  }}
                >
                  {ayahs.map((v) => {
                    const { isPill, color } = chunkAppearance(v.number);
                    return (
                      <HighlightChunk
                        key={v.number}
                        active={highlighted.has(v.number)}
                        isPill={isPill}
                        color={color}
                      >
                        {v.text}
                        <AyahNumber n={v.number} />
                      </HighlightChunk>
                    );
                  })}
                </p>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
