"use client";

import {
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";


// ── ExpandableEntry — a whole tafsir entry's body, shipped folded ───────────────
//
// Wraps everything below an entry's kicker/title (paragraphs, subtitles,
// capsule groups, images, audio). The first CRISP_LINES lines of body text
// read normally; the next FOLD_LINES lines are a live preview that tips
// backwards into the page (rotateX under perspective, ink fading toward the
// crease) — the paper-fold language of the rest of the app, applied to text.
// Bringing the pointer near the fold lifts it a little, like a finger
// slipping under a page corner, and wakes a magnetic "devamını oku" hint
// that leans toward the cursor. Clicking anywhere on the fold presses it
// flat while the hidden words write themselves in with the panel's
// word-by-word ink animation (`fp-write-in` in globals.css).
//
// `children` is the real, full body. `preview` is a second render of the
// text flow used inside the fold window; because it re-renders the same flow
// from the top (shifted up by the crisp height), its line wrapping — and
// even its per-word entrance delays — match the crisp copy exactly.
//
// Entries whose body would unfold by less than about a line render plain —
// no fold, no hint. Everything tunable lives in the constants below.

// How much stays readable while folded.
const CRISP_LINES = 4; // fully-inked body lines
const FOLD_LINES = 5; // fading preview lines below the crisp region
const MIN_HIDDEN_LINES = 1; // don't fold for less reveal than this

// No 3D angle — the fold window is a flat continuation that fades out.
// A bottom-weighted gradient mask does the fade instead of perspective.

// The rewrite ("keeps being written") reveal on expand.
const EXPAND_DURATION_S = 1.1;
const REWRITE_BASE_DELAY = 0.18; // s before the first hidden word re-inks
const REWRITE_STAGGER = 0.014; // s between words…
const REWRITE_MAX_SPAN = 2.4; // …capped so huge entries stay brisk

const GOLD = "#C4963B";
// Flat gradient mask — fades the preview lines from readable at top to
// fully transparent at the bottom edge of the fold window.
const FOLD_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.52) 35%, rgba(0,0,0,0.32) 65%, rgba(0,0,0,0.14) 88%, transparent 100%)";

interface FoldMetrics {
  /** Top of the body text to the bottom of line CRISP_LINES, in px. */
  crispHeight: number;
  /** Height of the receding preview window, in px. */
  foldHeight: number;
  /** Whether the body is long enough to be worth folding at all. */
  overflowing: boolean;
}

export function ExpandableEntry({
  children,
  preview,
}: {
  /** The entry's full body — paragraphs, capsules, images, audio. */
  children: ReactNode;
  /** A second render of the text flow, shown inside the fold window. */
  preview: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [metrics, setMetrics] = useState<FoldMetrics | null>(null);
  const [phase, setPhase] = useState<"folded" | "expanding" | "settled">(
    "folded",
  );
  const [targetHeight, setTargetHeight] = useState(0);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Measure the crisp/fold window off the body's first paragraph (its
  // line-height and top margin decide where line 4 ends) and whether the
  // body overflows the folded window. Re-measured when the panel resizes or
  // the handwriting font finishes loading — but never after expanding.
  useLayoutEffect(() => {
    const c = contentRef.current;
    if (!c) return;
    const measure = () => {
      const el = contentRef.current;
      if (phaseRef.current !== "folded" || !el) return;
      let referenceEl = el.querySelector("p.at-container");
      if (!referenceEl) {
        referenceEl = el.firstElementChild;
      }
      if (!referenceEl) {
        setMetrics({ crispHeight: 0, foldHeight: 0, overflowing: false });
        return;
      }
      const cs = getComputedStyle(referenceEl);
      let lineHeight = parseFloat(cs.lineHeight);
      if (!isFinite(lineHeight) || isNaN(lineHeight)) {
        const fontSize = parseFloat(cs.fontSize);
        lineHeight = isFinite(fontSize) ? fontSize * 1.95 : 24;
      }
      const topOffset =
        referenceEl.getBoundingClientRect().top - el.getBoundingClientRect().top;
      const crispHeight = topOffset + CRISP_LINES * lineHeight;
      const foldHeight = FOLD_LINES * lineHeight;
      setMetrics({
        crispHeight,
        foldHeight,
        overflowing:
          el.scrollHeight >
          crispHeight + foldHeight + MIN_HIDDEN_LINES * lineHeight,
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const folded = phase === "folded" && !!metrics?.overflowing;
  const crispHeight = metrics?.crispHeight ?? 0;
  const foldHeight = metrics?.foldHeight ?? 0;

  const expand = () => {
    const c = contentRef.current;
    if (!c || !metrics || phaseRef.current !== "folded") return;
    // Words at or below the crease re-ink with staggered delays; everything
    // above stays put. Measured live so it's always the true wrap. The
    // classes are added imperatively on AnimatedText's spans — React never
    // rewrites an unchanged className, so they stick.
    const spans = c.querySelectorAll<HTMLSpanElement>(".at-child");
    const contentTop = c.getBoundingClientRect().top;
    const hidden: HTMLSpanElement[] = [];
    spans.forEach((s) => {
      if (s.getBoundingClientRect().top - contentTop >= crispHeight - 2)
        hidden.push(s);
    });
    const stagger = hidden.length
      ? Math.min(REWRITE_STAGGER, REWRITE_MAX_SPAN / hidden.length)
      : 0;
    hidden.forEach((s, j) => {
      s.classList.add("fp-rewrite");
      s.style.setProperty("--fp-delay", `${REWRITE_BASE_DELAY + j * stagger}s`);
    });
    // Fully-clipped paragraphs never became at-visible (their observers see
    // zero intersection). Force them visible now so every rewrite delay runs
    // on the click's timeline instead of restarting when the expanding edge
    // reaches each one. Idempotent: React lands on the same class later.
    c.querySelectorAll(".at-container").forEach((el) =>
      el.classList.add("at-visible"),
    );
    setTargetHeight(c.scrollHeight);
    setPhase("expanding");
    // transitionend can be dropped (occluded tab, interrupted transition) —
    // settle regardless so the body never stays clipped.
    window.setTimeout(() => {
      if (phaseRef.current === "expanding") setPhase("settled");
    }, EXPAND_DURATION_S * 1000 + 300);
  };

  return (
    <div className="relative">
      {/* ── The real body — clipped to the crisp lines while folded, then
          grown to its full height on expand while the words below the
          crease re-ink. ──────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        style={{
          maxHeight:
            metrics?.overflowing && phase === "folded"
              ? crispHeight
              : phase === "expanding"
                ? targetHeight
                : undefined,
          overflow:
            metrics?.overflowing && phase !== "settled" ? "hidden" : undefined,
          transition: `max-height ${EXPAND_DURATION_S}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "max-height" && phaseRef.current === "expanding")
            setPhase("settled");
        }}
      >
        {children}
      </div>

      <AnimatePresence>
        {folded && (
          <motion.div
            key="fold"
            className="relative block w-full select-none outline-none"
            style={{
              overflow: "hidden",
              WebkitMaskImage: FOLD_MASK,
              maskImage: FOLD_MASK,
            }}
            initial={{ opacity: 0, height: foldHeight }}
            animate={{
              opacity: 1,
              height: foldHeight,
              transition: {
                opacity: { delay: 0.35, duration: 1.1 },
                height: { duration: 0 },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
            }}
          >
            {/* The continuation — same flow re-rendered, shifted up so
                the lines after the crease show through this window. */}
            <div
              aria-hidden
              className="pointer-events-none"
              style={{ marginTop: -crispHeight }}
            >
              {preview}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Read more button ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {folded && (
          <div
            key="hint"
            className="absolute bottom-[-10px] left-0 z-[5] flex w-full justify-center"
          >
            <motion.button
              onClick={expand}
              role="button"
              aria-label="Devamını oku"
              className="inline-flex items-center whitespace-nowrap cursor-pointer border-none outline-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, filter: "brightness(1) blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "brightness(1) blur(4px)" }}
              whileHover={{ scale: 1.05, filter: "brightness(1.15) blur(0px)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                gap: 8,
                padding: "7px 22px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                fontFamily: "var(--font-inter)",
                color: GOLD,
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                boxShadow: "0 6px 20px color-mix(in srgb, var(--foreground) 8%, transparent)",
              }}
            >
              devamını oku
              <motion.svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <polyline points="2,3 6,7 10,3" />
                <polyline points="2,7 6,11 10,7" opacity="0.4" />
              </motion.svg>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
