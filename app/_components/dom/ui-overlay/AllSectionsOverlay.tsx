"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import {
  ELEVATED_SCROLL_UNLOCK_THRESHOLD,
  useElevatedStore,
} from "../../../stores/useElevatedStore";
import { resetAllDrags } from "../../../utils/dragEngine";
import { OverlayButton } from "./OverlayButton";

function StackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8v5h5" />
      <path d="M19 16.2A7.5 7.5 0 0 0 6.3 10L5 13" />
      <path d="M7.4 18.4h9.2" opacity="0.5" />
    </svg>
  );
}

export function AllSectionsOverlay() {
  const [isPastThreshold, setIsPastThreshold] = useState(
    () => useFoldStore.getState().currentOffset >= ELEVATED_SCROLL_UNLOCK_THRESHOLD
  );

  useEffect(() => {
    return useFoldStore.subscribe((state) => {
      const past = state.currentOffset >= ELEVATED_SCROLL_UNLOCK_THRESHOLD;
      setIsPastThreshold((prev) => (prev !== past ? past : prev));
    });
  }, []);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const showAllSections = useElevatedStore((s) => s.showAllSections);
  const restoreAllSections = useElevatedStore((s) => s.restoreAllSections);

  // Fluid placement/size: mobile + XL remain familiar; mid-sizes tighten up.
  const rightOffset = "clamp(250px, 35vw, 340px)";
  const buttonW = "clamp(46px, 5.4vw, 54px)";
  const buttonH = "clamp(38px, 4.2vw, 44px)";
  const radius = "clamp(12px, 1.4vw, 14px)";

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
          style={{
            position: "fixed",
            top: "16px",
            right: rightOffset,
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <OverlayButton
            key={isAllSectionsMode ? "restore" : "show-all"}
            aria-label={
              isAllSectionsMode
                ? "Restore paper and sections"
                : "Show all elevated sections"
            }
            onClick={handleClick}
            onPointerDown={(e) => e.preventDefault()}
            width={buttonW}
            height={buttonH}
            borderRadius={radius}
            icon={isAllSectionsMode ? <RestoreIcon /> : <StackIcon />}
          >
            <motion.span
              aria-hidden="true"
              animate={{
                opacity: isAllSectionsMode ? [0.14, 0.3, 0.14] : 0.16,
              }}
              transition={{
                duration: 1.4,
                ease: "easeInOut",
                repeat: isAllSectionsMode ? Infinity : 0,
              }}
              style={{
                position: "absolute",
                inset: "-18px",
                background: "var(--overlay-glow)",
                pointerEvents: "none",
              }}
            />
          </OverlayButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
