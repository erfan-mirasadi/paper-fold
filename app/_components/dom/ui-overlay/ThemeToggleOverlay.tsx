"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface ThemeToggleOverlayProps {
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
  onToggle,
}: ThemeToggleOverlayProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const handleToggle = () => {
    setPulseKey((prev) => prev + 1);
    setIsDarkMode((prev) => !prev);
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
        right: "16px",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <motion.button
        type="button"
        aria-label={isDarkMode ? "Gunduz moduna gec" : "Gece moduna gec"}
        onClick={handleToggle}
        onPointerDown={(e) => e.preventDefault()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="overlay-btn"
        style={{
          position: "relative",
          width: "86px",
          height: "44px",
          borderRadius: "14px",
          overflow: "hidden",
          padding: "4px",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "center",
          gap: 0,
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
            background: "var(--overlay-glow)",
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
            border: "var(--overlay-knob-border)",
            background: "var(--overlay-knob-bg)",
            boxShadow: "var(--overlay-knob-shadow)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--overlay-text)",
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
