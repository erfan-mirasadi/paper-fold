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

  // Keep label/icon color fixed while the glass surface adapts to theme.
  const accentColor = "#0F1218";
  const textColor = "#0F1218";
  const glassBackground = isDarkMode
    ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.2) 0%, rgba(132,144,162,0.1) 45%, rgba(18,22,28,0.7) 100%), linear-gradient(180deg, rgba(20,24,32,0.74) 0%, rgba(9,12,18,0.84) 100%)"
    : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(250,251,253,0.6) 0%, rgba(226,230,236,0.32) 100%)";
  const glassBorder = isDarkMode
    ? "1px solid rgba(255,255,255,0.2)"
    : "1px solid rgba(255,255,255,0.34)";
  const glassShadow = isDarkMode
    ? "0 12px 30px rgba(4, 7, 12, 0.48), 0 1px 0 rgba(255,255,255,0.16) inset, 0 -1px 0 rgba(255,255,255,0.08) inset"
    : "0 12px 30px rgba(19,22,29,0.16), 0 2px 0 rgba(255,255,255,0.54) inset, 0 -1px 0 rgba(255,255,255,0.24) inset";
  const glassHoverBackground = isDarkMode
    ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.3) 0%, rgba(160,174,195,0.16) 45%, rgba(23,29,40,0.82) 100%), linear-gradient(180deg, rgba(33,40,52,0.82) 0%, rgba(15,20,29,0.92) 100%)"
    : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.16) 100%), linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(235,240,247,0.42) 100%)";
  const glassHoverBorderColor = isDarkMode
    ? "rgba(255,255,255,0.28)"
    : "rgba(255,255,255,0.52)";
  const glassHoverShadow = isDarkMode
    ? "0 14px 32px rgba(3,5,9,0.5), 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(255,255,255,0.1) inset"
    : "0 12px 28px rgba(35,42,55,0.16), 0 1px 0 rgba(255,255,255,0.72) inset";

  const iconUnfold = (
    <svg
      width="24"
      height="16"
      viewBox="0 0 28 18"
      fill="none"
      stroke="currentColor"
      style={{ color: accentColor }}
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4 13.6 13.8 10l10.2 3.6-10.2 3.1Z"
        fill="currentColor"
        opacity="0.2"
        stroke="none"
      />
      <path d="M4 13.6V6.8L13.8 3.2v6.8" />
      <path d="M24 13.6V6.8L13.8 3.2" />
      <path d="M4 13.6 13.8 10 24 13.6" />
      <path d="M13.8 3.2 24 6.8" opacity="0.78" />
    </svg>
  );

  const iconFold = (
    <svg
      width="24"
      height="16"
      viewBox="0 0 28 18"
      fill="none"
      stroke="currentColor"
      style={{ color: accentColor }}
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4 13.7 9.7 8.7 14 12l4.3-3.3 5.7 5-5.7 2-4.3-2.1-4.3 2.1Z"
        fill="currentColor"
        opacity="0.2"
        stroke="none"
      />
      <path d="M4 13.7V7.6l5.7-4.1 4.3 3.2 4.3-3.2 5.7 4.1v6.1" />
      <path d="M4 13.7 9.7 8.7 14 12l4.3-3.3 5.7 5" />
      <path d="M9.7 3.5v5.2M18.3 3.5v5.2" opacity="0.78" />
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
        glassBg={glassBackground}
        glassBorder={glassBorder}
        glassShadow={glassShadow}
        glassHoverBg={glassHoverBackground}
        glassHoverBorderColor={glassHoverBorderColor}
        glassHoverShadow={glassHoverShadow}
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
  glassShadow: string;
  glassHoverBg: string;
  glassHoverBorderColor: string;
  glassHoverShadow: string;
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
  glassShadow,
  glassHoverBg,
  glassHoverBorderColor,
  glassHoverShadow,
  variants,
}: NavButtonProps) {
  return (
    <motion.button
      variants={variants}
      whileHover={{
        background: glassHoverBg,
        borderColor: glassHoverBorderColor,
        boxShadow: glassHoverShadow,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        position: "relative",
        background: glassBg,
        border: glassBorder,
        backdropFilter: "blur(18px) saturate(130%)",
        WebkitBackdropFilter: "blur(18px) saturate(130%)",
        color: textColor,
        cursor: "pointer",
        height: "52px",
        minWidth: "72px",
        padding: "4px 8px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        boxShadow: glassShadow,
        overflow: "hidden",
        outline: "none",
        transition:
          "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease",
      }}
    >
      {/* Animated Background Polish */}
      <motion.div
        variants={{ hover: { x: "100%" }, tap: { x: "100%" } }}
        initial={{ x: "-100%" }}
        transition={{ duration: 0.6, ease: "circOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDarkMode
            ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)"
            : "linear-gradient(90deg, transparent, rgba(0,0,0,0.02), transparent)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <span
        style={{
          display: "flex",
          color: accentColor,
          filter: isDarkMode
            ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))"
            : "none",
          zIndex: 1,
          pointerEvents: "none",
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
          transition: "width 200ms ease, left 200ms ease",
        }}
      />
    </motion.button>
  );
}
