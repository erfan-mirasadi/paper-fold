"use client";

/**
 * PaperArrowsOverlay — standard prev/next arrows for multi-paper Surah pages.
 *
 * Renders nothing on single-paper Surahs. Follows standard pager semantics:
 * the left arrow is absent on the first paper and the right arrow is absent
 * on the last one. ArrowLeft/ArrowRight keys mirror the buttons.
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePaperStore } from "../../../stores/usePaperStore";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { OverlayButton } from "./OverlayButton";

const arrowStroke = "var(--foreground)";

const iconChevronLeft = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: arrowStroke }}
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const iconChevronRight = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: arrowStroke }}
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export function PaperArrowsOverlay() {
  const paperCount = usePaperStore((s) => s.paperCount);
  const activePaperIndex = usePaperStore((s) => s.activePaperIndex);
  const isSwitching = usePaperStore((s) => s.isSwitching);
  const goToNextPaper = usePaperStore((s) => s.goToNextPaper);
  const goToPreviousPaper = usePaperStore((s) => s.goToPreviousPaper);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  const hasPrevious = activePaperIndex > 0;
  const hasNext = activePaperIndex < paperCount - 1;
  const isVisible = paperCount > 1 && !isIntroActive && !isAllSectionsMode;

  // Standard keyboard navigation. Scroll keys (up/down/space/…) are already
  // owned by the scroll system; left/right are free.
  useEffect(() => {
    if (!isVisible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") goToNextPaper();
      else if (e.key === "ArrowLeft") goToPreviousPaper();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, goToNextPaper, goToPreviousPaper]);

  if (paperCount <= 1) return null;

  return (
    <>
      <div className="fixed inset-y-0 left-2 md:left-5 z-50 flex items-center pointer-events-none">
        <AnimatePresence>
          {isVisible && hasPrevious && (
            <PaperArrow
              key="paper-arrow-prev"
              direction="prev"
              onClick={goToPreviousPaper}
              disabled={isSwitching}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="fixed inset-y-0 right-2 md:right-5 z-50 flex items-center pointer-events-none">
        <AnimatePresence>
          {isVisible && hasNext && (
            <PaperArrow
              key="paper-arrow-next"
              direction="next"
              onClick={goToNextPaper}
              disabled={isSwitching}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

interface PaperArrowProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}

function PaperArrow({ direction, onClick, disabled }: PaperArrowProps) {
  const isPrev = direction === "prev";

  return (
    <motion.div
      initial={{ opacity: 0, x: isPrev ? -14 : 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isPrev ? -14 : 14 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pointer-events-auto"
    >
      <OverlayButton
        onClick={onClick}
        disabled={disabled}
        aria-label={isPrev ? "Önceki sayfa" : "Sonraki sayfa"}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full"
      >
        <span className="flex items-center justify-center pointer-events-none">
          {isPrev ? iconChevronLeft : iconChevronRight}
        </span>
      </OverlayButton>
    </motion.div>
  );
}
