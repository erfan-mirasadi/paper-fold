"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePaperStore } from "../../../stores/usePaperStore";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { OverlayButton } from "./OverlayButton";

export function PaperPaginationOverlay() {
  const paperCount = usePaperStore((s) => s.paperCount);
  const activePaperIndex = usePaperStore((s) => s.activePaperIndex);
  const isSwitching = usePaperStore((s) => s.isSwitching);
  const goToPaper = usePaperStore((s) => s.goToPaper);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  const isVisible = paperCount > 1 && !isIntroActive && !isAllSectionsMode;

  if (paperCount <= 1) return null;

  return (
    <div className="fixed bottom-[16px] right-[16px] md:bottom-[24px] md:right-[24px] z-50 flex items-center pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center gap-2 pointer-events-auto overlay-panel p-1.5 rounded-full"
          >
            {Array.from({ length: paperCount }).map((_, i) => {
              const isActive = i === activePaperIndex;
              return (
                <OverlayButton
                  key={i}
                  isActive={isActive}
                  disabled={isSwitching}
                  onClick={() => goToPaper(i)}
                  className={`w-10 h-10 rounded-full font-sans font-medium text-sm transition-colors ${
                    isActive 
                      ? "bg-[var(--foreground)] text-[var(--background)]" 
                      : "text-[var(--foreground)]"
                  }`}
                  aria-label={`Go to paper ${i + 1}`}
                >
                  <span className="pointer-events-none">
                    {i + 1}
                  </span>
                </OverlayButton>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
