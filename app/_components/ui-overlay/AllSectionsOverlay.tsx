"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useFoldStore } from "../3d-scene/ScrollManager";
import {
  ELEVATED_SCROLL_UNLOCK_THRESHOLD,
  useElevatedStore,
} from "../features/elevated-verses/useElevatedStore";
import { resetAllDrags } from "../features/elevated-verses/drag/dragEngine";

interface AllSectionsOverlayProps {
  isDarkMode: boolean;
}

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

export function AllSectionsOverlay({ isDarkMode }: AllSectionsOverlayProps) {
  const currentOffset = useFoldStore((s) => s.currentOffset);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const showAllSections = useElevatedStore((s) => s.showAllSections);
  const restoreAllSections = useElevatedStore((s) => s.restoreAllSections);

  const canShowControl =
    isAllSectionsMode || currentOffset >= ELEVATED_SCROLL_UNLOCK_THRESHOLD;

  const buttonTheme = useMemo(() => {
    const border = isDarkMode
      ? "1px solid rgba(255,255,255,0.2)"
      : "1px solid rgba(255,255,255,0.34)";
    const background = isDarkMode
      ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.2) 0%, rgba(132,144,162,0.1) 45%, rgba(18,22,28,0.7) 100%), linear-gradient(180deg, rgba(20,24,32,0.74) 0%, rgba(9,12,18,0.84) 100%)"
      : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(250,251,253,0.6) 0%, rgba(226,230,236,0.32) 100%)";
    const hoverBackground = isDarkMode
      ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.3) 0%, rgba(160,174,195,0.16) 45%, rgba(23,29,40,0.82) 100%), linear-gradient(180deg, rgba(33,40,52,0.82) 0%, rgba(15,20,29,0.92) 100%)"
      : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.16) 100%), linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(235,240,247,0.42) 100%)";
    const shadow = isDarkMode
      ? "0 12px 30px rgba(4, 7, 12, 0.48), 0 1px 0 rgba(255,255,255,0.16) inset, 0 -1px 0 rgba(255,255,255,0.08) inset"
      : "0 12px 30px rgba(19,22,29,0.16), 0 2px 0 rgba(255,255,255,0.54) inset, 0 -1px 0 rgba(255,255,255,0.24) inset";
    const hoverShadow = isDarkMode
      ? "0 14px 32px rgba(3,5,9,0.5), 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(255,255,255,0.1) inset"
      : "0 12px 28px rgba(35,42,55,0.16), 0 1px 0 rgba(255,255,255,0.72) inset";
    const text = isDarkMode ? "rgba(241, 246, 255, 0.95)" : "#0F1218";
    const glow = isDarkMode
      ? "radial-gradient(circle, rgba(168,194,255,0.22) 0%, rgba(168,194,255,0) 72%)"
      : "radial-gradient(circle, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0) 72%)";

    return { border, background, hoverBackground, shadow, hoverShadow, text, glow };
  }, [isDarkMode]);

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
            right: "214px",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <motion.button
            key={isAllSectionsMode ? "restore" : "show-all"}
            type="button"
            aria-label={
              isAllSectionsMode
                ? "Restore paper and sections"
                : "Show all elevated sections"
            }
            onClick={handleClick}
            whileHover={{
              scale: 1.02,
              background: buttonTheme.hoverBackground,
              boxShadow: buttonTheme.hoverShadow,
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              pointerEvents: "auto",
              position: "relative",
              width: "54px",
              height: "44px",
              borderRadius: "14px",
              border: buttonTheme.border,
              background: buttonTheme.background,
              boxShadow: buttonTheme.shadow,
              backdropFilter: "blur(18px) saturate(130%)",
              WebkitBackdropFilter: "blur(18px) saturate(130%)",
              color: buttonTheme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              outline: "none",
              userSelect: "none",
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={{ opacity: isAllSectionsMode ? [0.14, 0.3, 0.14] : 0.16 }}
              transition={{
                duration: 1.4,
                ease: "easeInOut",
                repeat: isAllSectionsMode ? Infinity : 0,
              }}
              style={{
                position: "absolute",
                inset: "-18px",
                background: buttonTheme.glow,
                pointerEvents: "none",
              }}
            />
            <motion.span
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "inline-flex",
                position: "relative",
                zIndex: 1,
                filter: isDarkMode
                  ? "drop-shadow(0 0 8px rgba(226, 239, 255, 0.28))"
                  : "none",
              }}
            >
              {isAllSectionsMode ? <RestoreIcon /> : <StackIcon />}
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
