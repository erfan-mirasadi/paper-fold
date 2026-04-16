"use client";

import { motion } from "framer-motion";
import { useFoldStore } from "../3d-scene/ScrollManager";

interface NavigationOverlayProps {
  isDarkMode?: boolean;
}

export function NavigationOverlay({
  isDarkMode = false,
}: NavigationOverlayProps) {
  const triggerTransition = useFoldStore((s) => s.triggerTransition);
  const currentOffset = useFoldStore((s) => s.currentOffset);

  // Design Tokens
  const accentColor = "#D4AF37"; // Gold/Brass accent for a premium feel
  const textColor = isDarkMode ? "#ffffff" : "#1a1a1a";
  const glassBg = isDarkMode
    ? "rgba(20, 20, 25, 0.7)"
    : "rgba(255, 255, 255, 0.7)";
  const glassBorder = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.05)";

  const iconUnfold = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );

  const iconFold = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M20 12H12l3-3m0 6l-3-3" />
    </svg>
  );

  const containerVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  } as const;

  const nextStageId: "end" | "pre-start" =
    currentOffset < 0.5 ? "end" : "pre-start";
  const activeIcon = nextStageId === "end" ? iconUnfold : iconFold;
  const buttonLabel = nextStageId === "end" ? "Aç" : "Kapat";

  const handleSmartTransition = () => {
    triggerTransition(nextStageId);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: "fixed",
        top: "16px", // Positioned below the camera reset button
        left: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 100,
      }}
    >
      <NavButton
        onClick={handleSmartTransition}
        icon={activeIcon}
        label={buttonLabel}
        isDarkMode={isDarkMode}
        accentColor={accentColor}
        textColor={textColor}
        glassBg={glassBg}
        glassBorder={glassBorder}
        variants={itemVariants}
      />
    </motion.div>
  );
}

interface NavButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  isDarkMode: boolean;
  accentColor: string;
  textColor: string;
  glassBg: string;
  glassBorder: string;
  variants: import("framer-motion").Variants;
}

function NavButton({
  onClick,
  icon,
  label,
  isDarkMode,
  accentColor,
  textColor,
  glassBg,
  glassBorder,
  variants,
}: NavButtonProps) {
  return (
    <motion.button
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{
        position: "relative",
        background: glassBg,
        border: `1px solid ${glassBorder}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: textColor,
        cursor: "pointer",
        padding: "10px 18px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.02em",
        boxShadow: isDarkMode
          ? "0 4px 20px rgba(0,0,0,0.4)"
          : "0 4px 15px rgba(0,0,0,0.08)",
        overflow: "hidden",
        outline: "none",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Animated Background Polish */}
      <motion.div
        variants={{
          hover: { x: "100%" },
          tap: { x: "100%" },
        }}
        initial={{ x: "-100%" }}
        transition={{ duration: 0.6, ease: "circOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}, transparent)`,
          zIndex: 0,
        }}
      />

      <span
        style={{
          display: "flex",
          color: accentColor,
          filter: isDarkMode
            ? "drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))"
            : "none",
          zIndex: 1,
        }}
      >
        {icon}
      </span>

      {label && <span style={{ zIndex: 1 }}>{label}</span>}

      <motion.div
        variants={{
          hover: { width: "100%", left: 0 },
          tap: { width: "100%", left: 0 },
        }}
        initial={{ width: "0%", left: "0%" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          height: "2px",
          background: accentColor,
          zIndex: 1,
        }}
      />
    </motion.button>
  );
}
