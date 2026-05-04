"use client";

import { motion } from "framer-motion";
import { useFoldStore } from "../../canvas/3d-scene/ScrollManager";
import {
  useDragState,
  resetAllDrags,
} from "../../../utils/dragEngine";
import { useElevatedStore } from "../../../stores/useElevatedStore";

interface NavigationOverlayProps {
  isDarkMode?: boolean;
}

export function NavigationOverlay({
  isDarkMode = false,
}: NavigationOverlayProps) {
  const triggerTransition = useFoldStore((s) => s.triggerTransition);
  const currentOffset = useFoldStore((s) => s.currentOffset);
  const isTransitioning = useFoldStore((s) => s.isTransitioning);
  const hasDragged = useDragState((s) => s.hasDragged);
  const isPaperDocked = useDragState((s) => s.isPaperDocked);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  // Fluid placement/size: match other overlays on the right
  const rightOffset = "clamp(170px, 24vw, 240px)";
  const insetY = "clamp(12px, 2vw, 16px)";
  const stackGap = "clamp(8px, 1.2vw, 10px)";

  // Keep label/icon color fixed while the glass surface adapts to theme.
  const accentColor = isDarkMode ? "rgba(241,246,255,0.96)" : "#0F1218";
  const textColor = accentColor;
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
      width="22"
      height="14"
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
      width="22"
      height="14"
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

  const iconUndo = (
    <svg
      width="22"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: accentColor }}
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  );

  const containerVariants = {
    hidden: { x: 20, opacity: 0 },
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
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  } as const;

  const nextStageId: "end" | "pre-start" =
    currentOffset < 0.5 ? "end" : "pre-start";
  const activeIcon = nextStageId === "end" ? iconUnfold : iconFold;
  const buttonLabel = nextStageId === "end" ? "Aç" : "Kapat";

  const handleSmartTransition = () => {
    if (isTransitioning) return;
    triggerTransition(nextStageId);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: "fixed",
        top: insetY,
        right: rightOffset,
        display: "flex",
        flexDirection: "column",
        gap: stackGap,
        zIndex: 100,
      }}
    >
      {!isPaperDocked && !isAllSectionsMode && (
        <NavButton
          onClick={handleSmartTransition}
          icon={activeIcon}
          label={buttonLabel}
          isDarkMode={isDarkMode}
          isPending={isTransitioning}
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
      )}
      {hasDragged && (
        <NavButton
          onClick={resetAllDrags}
          icon={iconUndo}
          label="Sıfırla"
          isDarkMode={isDarkMode}
          isPending={false}
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
      )}
    </motion.div>
  );
}

interface NavButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  isDarkMode: boolean;
  isPending: boolean;
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
  isPending,
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
  const btnH = "clamp(40px, 4.4vw, 46px)";
  const btnMinW = "clamp(58px, 6.2vw, 66px)";
  const btnPadX = "clamp(6px, 1vw, 7px)";
  const btnPadY = "clamp(2px, 0.6vw, 3px)";
  const btnRadius = "clamp(10px, 1.35vw, 11px)";
  const labelFont = "clamp(9.5px, 1.2vw, 10.5px)";
  const iconScale = "clamp(0.92, 1.1vw, 1)";

  const handleClick = () => {
    if (isPending) return;
    onClick();
  };

  return (
    <motion.button
      type="button"
      variants={variants}
      whileHover={
        isPending
          ? undefined
          : {
              background: glassHoverBg,
              borderColor: glassHoverBorderColor,
              boxShadow: glassHoverShadow,
            }
      }
      whileTap={isPending ? undefined : { scale: 0.98 }}
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      style={{
        position: "relative",
        background: glassBg,
        border: glassBorder,
        backdropFilter: "blur(18px) saturate(130%)",
        WebkitBackdropFilter: "blur(18px) saturate(130%)",
        color: textColor,
        cursor: isPending ? "wait" : "pointer",
        height: btnH,
        minWidth: btnMinW,
        padding: `${btnPadY} ${btnPadX}`,
        borderRadius: btnRadius,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        fontSize: labelFont,
        fontWeight: 600,
        letterSpacing: "0.01em",
        boxShadow: glassShadow,
        overflow: "hidden",
        outline: "none",
        transition:
          "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease",
      }}
    >
      {/* Reflective activity sweep for pending state */}
      <motion.div
        initial={false}
        animate={
          isPending
            ? {
                x: ["-175%", "175%"],
                rotate: [-16, -16],
                opacity: [0, 0.72, 0],
              }
            : { x: "-210%", rotate: -16, opacity: 0 }
        }
        transition={
          isPending
            ? { duration: 0.95, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.2, ease: "easeOut" }
        }
        style={{
          position: "absolute",
          top: "-42%",
          left: "-78%",
          width: "92%",
          height: "190%",
          background: isDarkMode
            ? "linear-gradient(110deg, rgba(255,255,255,0), rgba(236,245,255,0.48), rgba(255,255,255,0))"
            : "linear-gradient(110deg, rgba(255,255,255,0), rgba(255,255,255,0.84), rgba(255,255,255,0))",
          filter: "blur(0.35px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={false}
        animate={
          isPending
            ? {
                x: ["-185%", "185%"],
                rotate: [-16, -16],
                opacity: [0, 0.96, 0],
              }
            : { x: "-220%", rotate: -16, opacity: 0 }
        }
        transition={
          isPending
            ? { duration: 0.95, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.2, ease: "easeOut" }
        }
        style={{
          position: "absolute",
          top: "-46%",
          left: "-80%",
          width: "34%",
          height: "198%",
          background: isDarkMode
            ? "linear-gradient(110deg, rgba(255,255,255,0), rgba(249,252,255,0.9), rgba(255,255,255,0))"
            : "linear-gradient(110deg, rgba(255,255,255,0), rgba(255,255,255,1), rgba(255,255,255,0))",
          filter: "blur(0.2px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={false}
        animate={isPending ? { opacity: [0.04, 0.15, 0.04] } : { opacity: 0 }}
        transition={
          isPending
            ? { duration: 0.95, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.2, ease: "easeOut" }
        }
        style={{
          position: "absolute",
          inset: 0,
          background: isDarkMode
            ? "linear-gradient(180deg, rgba(233,244,255,0.22) 0%, rgba(233,244,255,0) 64%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 64%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <span
        style={{
          display: "flex",
          color: accentColor,
          filter: isDarkMode
            ? "drop-shadow(0 0 8px rgba(226, 239, 255, 0.28))"
            : "none",
          zIndex: 2,
          pointerEvents: "none",
          transform: `scale(${iconScale})`,
        }}
      >
        {icon}
      </span>

      {label && (
        <span
          style={{
            zIndex: 2,
            textShadow: isDarkMode
              ? "0 1px 10px rgba(199, 220, 255, 0.28)"
              : "none",
          }}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
}
