"use client";

/**
 * SectionZoomArrowsOverlay — move from the section you are zoomed into to the
 * one beside it, without backing out to the whole paper and clicking again.
 *
 * WHICH SIDE IS WHICH. The surah runs right to left across the paper, so the
 * sheet that comes NEXT is the one further LEFT — and the button that takes you
 * there sits on the left edge, pointing left. A reader who wants what comes
 * next reaches towards where it actually is; the arrow is the direction the
 * camera will travel, not a page-number's idea of forward. The one exception is
 * the end of a row, where "further left" wraps back to the right of the row
 * below — the same jump the eye makes reading.
 *
 * Only atlas pages ever show these: a page whose sections do not name a
 * rectangle to frame has one zoom for the whole surah and nothing to step
 * between (see `useSectionZoomNav`).
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { useSectionZoomNav } from "../../../hooks/useSectionZoomNav";

/**
 * These arrows sit ON the zoomed sheet, over paper that is nearly white in
 * light mode and nearly black in dark, so unlike the ambient chrome elsewhere
 * on the page they cannot be a bare glyph waiting to be hovered — half the time
 * they would be invisible against what is behind them. Each one is a solid
 * disc of the page's own background with a ring around it, which reads at a
 * glance on either paper and in either theme.
 */
const BUTTON_BASE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--background) 82%, transparent)",
  border: "1px solid color-mix(in srgb, var(--foreground) 24%, transparent)",
  color: "var(--foreground)",
  boxShadow:
    "0 8px 24px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 0 0 1px color-mix(in srgb, var(--background) 60%, transparent)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const BUTTON_HOVER = {
  scale: 1.08,
  background: "color-mix(in srgb, var(--background) 96%, transparent)",
  borderColor: "color-mix(in srgb, var(--foreground) 55%, transparent)",
};

function Chevron({ pointing }: { pointing: "left" | "right" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={pointing === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export function SectionZoomArrowsOverlay() {
  const { isActive, hasForward, hasBackward, goForward, goBackward } =
    useSectionZoomNav();
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const isVisible = isActive && !isIntroActive;

  // The same two keys the paper pager uses, which stands down while a section
  // is framed (see PaperArrowsOverlay) — so they always drive whichever of the
  // two is on screen, and never both.
  useEffect(() => {
    if (!isVisible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") goForward();
      else if (e.key === "ArrowRight") goBackward();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, goForward, goBackward]);

  return (
    <>
      <div className="fixed inset-y-0 left-2 md:left-5 z-50 flex items-center pointer-events-none">
        <AnimatePresence>
          {isVisible && hasForward && (
            <SectionArrow
              key="section-arrow-forward"
              side="left"
              onClick={goForward}
              label="Sonraki bölüm"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="fixed inset-y-0 right-2 md:right-5 z-50 flex items-center pointer-events-none">
        <AnimatePresence>
          {isVisible && hasBackward && (
            <SectionArrow
              key="section-arrow-backward"
              side="right"
              onClick={goBackward}
              label="Önceki bölüm"
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

interface SectionArrowProps {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}

function SectionArrow({ side, onClick, label }: SectionArrowProps) {
  const isLeft = side === "left";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      initial={{ opacity: 0, x: isLeft ? -14 : 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isLeft ? -14 : 14 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={BUTTON_HOVER}
      whileTap={{ scale: 0.94 }}
      style={BUTTON_BASE}
      className="pointer-events-auto flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full outline-none cursor-pointer select-none"
    >
      <span className="flex items-center justify-center pointer-events-none">
        <Chevron pointing={isLeft ? "left" : "right"} />
      </span>
    </motion.button>
  );
}
