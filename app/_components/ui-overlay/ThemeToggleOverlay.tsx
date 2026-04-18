"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface ThemeToggleOverlayProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const KNOB_TRAVEL_X = 38;

function SunIcon({ dim = false }: { dim?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ opacity: dim ? 0.48 : 0.96 }}
    >
      <circle cx="12" cy="12" r="3.7" fill="currentColor" opacity="0.14" />
      <circle cx="12" cy="12" r="3.7" />
      <path d="M12 3.4v2.3M12 18.3v2.3M3.4 12h2.3M18.3 12h2.3M5.9 5.9l1.7 1.7M16.4 16.4l1.7 1.7M5.9 18.1l1.7-1.7M16.4 7.6l1.7-1.7" />
    </svg>
  );
}

function MoonIcon({ dim = false }: { dim?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ opacity: dim ? 0.52 : 0.98 }}
    >
      <path
        d="M14.8 3.8a8.5 8.5 0 1 0 5.4 13.9 7.8 7.8 0 1 1-5.4-13.9Z"
        fill="currentColor"
        opacity="0.14"
        stroke="none"
      />
      <path d="M14.8 3.8a8.5 8.5 0 1 0 5.4 13.9 7.8 7.8 0 1 1-5.4-13.9Z" />
    </svg>
  );
}

export function ThemeToggleOverlay({
  isDarkMode,
  onToggle,
}: ThemeToggleOverlayProps) {
  const [pulseKey, setPulseKey] = useState(0);

  const iconColor = isDarkMode ? "rgba(241, 246, 255, 0.95)" : "#0F1218";
  const trackBorder = isDarkMode
    ? "1px solid rgba(255,255,255,0.2)"
    : "1px solid rgba(255,255,255,0.34)";
  const trackBackground = isDarkMode
    ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.2) 0%, rgba(132,144,162,0.1) 45%, rgba(18,22,28,0.7) 100%), linear-gradient(180deg, rgba(20,24,32,0.74) 0%, rgba(9,12,18,0.84) 100%)"
    : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(250,251,253,0.6) 0%, rgba(226,230,236,0.32) 100%)";
  const trackShadow = isDarkMode
    ? "0 12px 30px rgba(4, 7, 12, 0.48), 0 1px 0 rgba(255,255,255,0.16) inset, 0 -1px 0 rgba(255,255,255,0.08) inset"
    : "0 12px 30px rgba(19,22,29,0.16), 0 2px 0 rgba(255,255,255,0.54) inset, 0 -1px 0 rgba(255,255,255,0.24) inset";

  const handleToggle = () => {
    setPulseKey((prev) => prev + 1);
    onToggle();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      style={{
        position: "fixed",
        top: "16px",
        right: "24px",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <motion.button
        type="button"
        aria-label={isDarkMode ? "Gunduz moduna gec" : "Gece moduna gec"}
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          pointerEvents: "auto",
          position: "relative",
          width: "86px",
          height: "44px",
          borderRadius: "14px",
          border: trackBorder,
          background: trackBackground,
          boxShadow: trackShadow,
          backdropFilter: "blur(18px) saturate(130%)",
          WebkitBackdropFilter: "blur(18px) saturate(130%)",
          cursor: "pointer",
          overflow: "hidden",
          padding: "4px",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "center",
          gap: 0,
          color: iconColor,
          outline: "none",
          userSelect: "none",
        }}
      >
        <motion.span
          key={pulseKey}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 0.28, 0], scale: [0.7, 1.08, 1.35] }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: "-16px",
            borderRadius: "999px",
            background: isDarkMode
              ? "radial-gradient(circle, rgba(168,194,255,0.22) 0%, rgba(168,194,255,0) 72%)"
              : "radial-gradient(circle, rgba(255,198,102,0.25) 0%, rgba(255,198,102,0) 72%)",
            pointerEvents: "none",
          }}
        />

        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <SunIcon dim={isDarkMode} />
        </span>

        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <MoonIcon dim={!isDarkMode} />
        </span>

        <motion.span
          aria-hidden="true"
          animate={{
            x: isDarkMode ? KNOB_TRAVEL_X : 0,
          }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            width: "36px",
            height: "36px",
            borderRadius: "11px",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(255,255,255,0.68)",
            background: isDarkMode
              ? "linear-gradient(180deg, rgba(42,52,67,0.94) 0%, rgba(24,31,44,0.94) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(236,240,246,0.84) 100%)",
            boxShadow: isDarkMode
              ? "0 6px 16px rgba(0,0,0,0.42), 0 1px 0 rgba(255,255,255,0.22) inset"
              : "0 6px 14px rgba(35,42,55,0.14), 0 1px 0 rgba(255,255,255,0.72) inset",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            zIndex: 2,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDarkMode ? "moon" : "sun"}
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{ display: "inline-flex" }}
            >
              {isDarkMode ? <MoonIcon /> : <SunIcon />}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
