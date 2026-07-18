"use client";

import {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ── FoldedEntry — a whole tafsir entry's body, shipped folded ───────────────
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
const FOLD_LINES = 5; // receding preview lines (ends mid-line on purpose)
const MIN_HIDDEN_LINES = 1; // don't fold for less reveal than this

// The fold's geometry. Negative rotateX with a top origin tips the bottom
// edge away from the reader, into the page. The shallow angle keeps the
// preview lines separated enough to count 4-5 of them; the tight perspective
// still draws the trapezoid — each line projects visibly narrower than the
// one above, converging toward the crease.
const FOLD_ANGLE = -35;
const FOLD_ANGLE_NEAR = -20; // the fold lifts when the cursor comes close
const FOLD_PERSPECTIVE = 150;

// The magnetic hint.
const MAGNET_RADIUS = 180; // px — cursor distance where the pull begins
const MAGNET_REACH = 0.8; // how far toward the cursor the hint leans

// The rewrite ("keeps being written") reveal on expand.
const EXPAND_DURATION_S = 1.1;
const REWRITE_BASE_DELAY = 0.18; // s before the first hidden word re-inks
const REWRITE_STAGGER = 0.014; // s between words…
const REWRITE_MAX_SPAN = 2.4; // …capped so huge entries stay brisk

const GOLD = "#C4963B";
// Painted in the fold's own (pre-transform) space, so the fade rides the
// receding plane itself: strongest ink at the crease, gone by the last line.
// Kept bright deep into the window so all 4-5 preview lines stay readable
// before the final dissolve.
const FOLD_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.52) 35%, rgba(0,0,0,0.32) 65%, rgba(0,0,0,0.14) 88%, transparent 100%)";

const smoothstep = (t: number) => t * t * (3 - 2 * t);

interface FoldMetrics {
  /** Top of the body text to the bottom of line CRISP_LINES, in px. */
  crispHeight: number;
  /** Height of the receding preview window, in px. */
  foldHeight: number;
  /** Whether the body is long enough to be worth folding at all. */
  overflowing: boolean;
}

export function FoldedEntry({
  children,
  preview,
}: {
  /** The entry's full body — paragraphs, capsules, images, audio. */
  children: ReactNode;
  /** A second render of the text flow, shown inside the fold window. */
  preview: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const [metrics, setMetrics] = useState<FoldMetrics | null>(null);
  const [phase, setPhase] = useState<"folded" | "expanding" | "settled">(
    "folded",
  );
  const [targetHeight, setTargetHeight] = useState(0);
  const [near, setNear] = useState(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // The magnetic hint's offset from its rest point, springed for the
  // rubber-band feel.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const hintX = useSpring(mx, { stiffness: 260, damping: 22, mass: 0.7 });
  const hintY = useSpring(my, { stiffness: 260, damping: 22, mass: 0.7 });

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
      const firstP = el.querySelector("p.at-container");
      if (!firstP) {
        setMetrics({ crispHeight: 0, foldHeight: 0, overflowing: false });
        return;
      }
      const cs = getComputedStyle(firstP);
      let lineHeight = parseFloat(cs.lineHeight);
      if (!isFinite(lineHeight)) lineHeight = parseFloat(cs.fontSize) * 1.95;
      const topOffset =
        firstP.getBoundingClientRect().top - el.getBoundingClientRect().top;
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
    setNear(false);
    mx.set(0);
    my.set(0);
    // transitionend can be dropped (occluded tab, interrupted transition) —
    // settle regardless so the body never stays clipped.
    window.setTimeout(() => {
      if (phaseRef.current === "expanding") setPhase("settled");
    }, EXPAND_DURATION_S * 1000 + 300);
  };

  // Magnet — track the pointer over the whole entry body; the hint rests at
  // the anchor (an untransformed zero-size point, so its rect is the true
  // rest position) and leans toward the cursor within MAGNET_RADIUS.
  const onPointerMove = (e: React.MouseEvent) => {
    const anchor = anchorRef.current;
    if (!anchor || phaseRef.current !== "folded") return;
    const rect = anchor.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    const d = Math.hypot(dx, dy);
    if (d < MAGNET_RADIUS) {
      const pull = MAGNET_REACH * smoothstep(1 - d / MAGNET_RADIUS);
      mx.set(dx * pull);
      my.set(dy * pull);
      setNear(true);
    } else {
      mx.set(0);
      my.set(0);
      setNear(false);
    }
  };
  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
    setNear(false);
  };

  return (
    <div
      className="relative"
      onMouseMove={folded ? onPointerMove : undefined}
      onMouseLeave={folded ? onPointerLeave : undefined}
    >
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
            role="button"
            tabIndex={0}
            aria-label="Devamını oku"
            aria-expanded={false}
            onClick={expand}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                expand();
              }
            }}
            className="relative block w-full cursor-pointer select-none outline-none"
            style={{
              transformPerspective: FOLD_PERSPECTIVE,
              transformOrigin: "50% 0%",
              overflow: "hidden",
              WebkitMaskImage: FOLD_MASK,
              maskImage: FOLD_MASK,
            }}
            initial={{ opacity: 0, height: foldHeight, rotateX: FOLD_ANGLE }}
            animate={{
              opacity: 1,
              height: foldHeight,
              rotateX: near ? FOLD_ANGLE_NEAR : FOLD_ANGLE,
              transition: {
                opacity: { delay: 0.35, duration: 1.1 },
                rotateX: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                height: { duration: 0 },
              },
            }}
            exit={{
              // Pressed flat and dissolved while the real words write in
              // underneath — the unfold moment.
              opacity: 0,
              height: 0,
              rotateX: 0,
              transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
            }}
          >
            {/* The continuation — the same flow re-rendered, shifted up so
                the lines after the crease show through this window. Purely
                visual; even its word delays mirror the crisp copy. */}
            <div
              aria-hidden
              className="pointer-events-none"
              style={{ marginTop: -crispHeight }}
            >
              {preview}
            </div>
            {/* Crease shadow right under the last crisp line. */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{
                height: 14,
                background:
                  "linear-gradient(to bottom, rgba(60, 45, 20, 0.08), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Magnetic hint — rests over the fold, invisible until the cursor
          comes near, then leans toward it. Pointer events stay off so the
          fold below keeps the click. ─────────────────────────────────── */}
      <AnimatePresence>
        {folded && (
          <div
            key="hint"
            ref={anchorRef}
            className="pointer-events-none absolute z-[5]"
            style={{ left: "50%", top: crispHeight + foldHeight * 0.32 }}
          >
            <motion.div
              style={{ x: hintX, y: hintY }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: near ? 1 : 0,
                scale: near ? 1 : 0.86,
                filter: near ? "blur(0px)" : "blur(4px)",
              }}
              exit={{ opacity: 0, scale: 0.86, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span
                className="inline-flex -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap italic"
                style={{
                  gap: 7,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background:
                    "color-mix(in srgb, var(--background) 82%, transparent)",
                  backdropFilter: "blur(2.5px)",
                  WebkitBackdropFilter: "blur(2.5px)",
                  fontFamily: "var(--font-inter)",
                  color: GOLD,
                  fontSize: "clamp(10px, 0.72vw, 15px)",
                  letterSpacing: "0.06em",
                }}
              >
                <svg
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1.5,1.5 5,4.5 8.5,1.5" />
                  <polyline points="1.5,6 5,9 8.5,6" opacity="0.45" />
                </svg>
                devamını oku
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
