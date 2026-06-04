"use client";

import { motion } from "framer-motion";

export function TitleOverlay() {
  const insetX = "clamp(14px, 2.2vw, 24px)";
  const insetY = "clamp(12px, 2vw, 16px)";
  const buttonH = "clamp(38px, 4.2vw, 44px)";
  const radius = "clamp(12px, 1.4vw, 14px)";
  const fontSize = "clamp(14px, 1.6vw, 22px)";
  const paddingX = "clamp(24px, 3vw, 40px)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      className="overlay-panel"
      style={{
        position: "fixed",
        top: insetY,
        left: insetX,
        zIndex: 100,
        pointerEvents: "auto",
        height: buttonH,
        padding: `0 ${paddingX}`,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 800,
        letterSpacing: "0.03em",
        userSelect: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      ALAK SURESİ
    </motion.div>
  );
}
