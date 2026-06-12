"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { OverlayButton } from "./OverlayButton";

interface ThemeToggleOverlayProps {
  onToggle?: () => void;
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.7" />
      <path d="M12 3.4v2.3M12 18.3v2.3M3.4 12h2.3M18.3 12h2.3M5.9 5.9l1.7 1.7M16.4 16.4l1.7 1.7M5.9 18.1l1.7-1.7M16.4 7.6l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.8 3.8a8.5 8.5 0 1 0 5.4 13.9 7.8 7.8 0 1 1-5.4-13.9Z" />
    </svg>
  );
}

export function ThemeToggleOverlay({ onToggle }: ThemeToggleOverlayProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        window.dispatchEvent(new Event("themeChange"));
      }
      return next;
    });
    if (onToggle) onToggle();
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      className="pointer-events-auto flex items-center justify-center"
    >
      <OverlayButton
        onClick={handleToggle}
        aria-label={isDarkMode ? "Gunduz moduna gec" : "Gece moduna gec"}
        className="w-14 h-14"
      >
        {isDarkMode ? <MoonIcon /> : <SunIcon />}
      </OverlayButton>
    </motion.div>
  );
}
