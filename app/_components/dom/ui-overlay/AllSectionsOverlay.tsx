"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import {
  ELEVATED_SCROLL_UNLOCK_THRESHOLD,
  useElevatedStore,
} from "../../../stores/useElevatedStore";
import { resetAllDrags } from "../../../utils/dragEngine";
import { OverlayButton } from "./OverlayButton";

const iconColor = "#000";

function StackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: iconColor }}
      aria-hidden="true"
    >
      <path
        d="M4.2 15.2 12 19.1l7.8-3.9"
        fill="currentColor"
        opacity="0.12"
        stroke="none"
      />
      <path d="M4.2 15.2 12 19.1l7.8-3.9" />
      <path d="M4.2 10.8 12 14.7l7.8-3.9" opacity="0.82" />
      <path d="M4.2 6.5 12 10.4l7.8-3.9L12 2.9 4.2 6.5Z" />
      <path d="M12 10.4v4.3" opacity="0.55" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: iconColor }}
      aria-hidden="true"
    >
      <path d="M5 8v5h5" />
      <path d="M19 16.2A7.5 7.5 0 0 0 6.3 10L5 13" />
      <path d="M7.4 18.4h9.2" opacity="0.5" />
    </svg>
  );
}

export function AllSectionsOverlay() {
  const isPastThreshold = useFoldStore(
    (s) => s.currentOffset >= ELEVATED_SCROLL_UNLOCK_THRESHOLD
  );
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const showAllSections = useElevatedStore((s) => s.showAllSections);
  const restoreAllSections = useElevatedStore((s) => s.restoreAllSections);

  const canShowControl = isAllSectionsMode || isPastThreshold;

  const handleClick = () => {
    if (isAllSectionsMode) {
      restoreAllSections();
      resetAllDrags();
      return;
    }

    showAllSections();
  };

  return (
    <AnimatePresence>
      {canShowControl && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 170, damping: 22 }}
          className="relative pointer-events-auto flex items-center justify-center"
        >
          {/* Glass frame is an absolutely-positioned layer, not padding on
              the flex item — so it never changes this button's footprint,
              meaning it can never add/remove gap between it and the
              NavigationOverlay button below, in either mode. */}
          <div
            aria-hidden="true"
            className={`absolute -inset-1.5 rounded-[24px] transition-opacity duration-300 pointer-events-none ${
              isAllSectionsMode
                ? "opacity-100 bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl"
                : "opacity-0"
            }`}
          />
          <OverlayButton
            aria-label={
              isAllSectionsMode
                ? "Restore paper and sections"
                : "Show all elevated sections"
            }
            onClick={handleClick}
            className="relative w-14 h-14"
          >
            {isAllSectionsMode ? <RestoreIcon /> : <StackIcon />}
          </OverlayButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
