"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Image from "next/image";

interface TitleOverlayProps {
  isDarkMode?: boolean;
}

export function TitleOverlay({ isDarkMode = false }: TitleOverlayProps) {
  const insetX = "clamp(14px, 2.2vw, 24px)";
  const insetY = "clamp(12px, 2vw, 16px)";
  const buttonH = "clamp(38px, 4.2vw, 44px)";
  const radius = "clamp(12px, 1.4vw, 14px)";
  const fontSize = "clamp(14px, 1.6vw, 17px)";
  const paddingX = "clamp(24px, 3vw, 40px)";

  const theme = useMemo(() => {
    const border = isDarkMode
      ? "1px solid rgba(255,255,255,0.2)"
      : "1px solid rgba(255,255,255,0.34)";
    const background = isDarkMode
      ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.2) 0%, rgba(132,144,162,0.1) 45%, rgba(18,22,28,0.7) 100%), linear-gradient(180deg, rgba(20,24,32,0.74) 0%, rgba(9,12,18,0.84) 100%)"
      : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(250,251,253,0.6) 0%, rgba(226,230,236,0.32) 100%)";
    const shadow = isDarkMode
      ? "0 12px 30px rgba(4, 7, 12, 0.48), 0 1px 0 rgba(255,255,255,0.16) inset, 0 -1px 0 rgba(255,255,255,0.08) inset"
      : "0 12px 30px rgba(19,22,29,0.16), 0 2px 0 rgba(255,255,255,0.54) inset, 0 -1px 0 rgba(255,255,255,0.24) inset";
    const text = isDarkMode ? "rgba(241, 246, 255, 0.95)" : "#0F1218";

    return { border, background, shadow, text };
  }, [isDarkMode]);

  // --- ADJUSTABLE DECORATION SETTINGS ---
  const decoOpacity = 0.3; // Scale 0 to 1
  const decoSize = 36; // Size of the decorative element
  // --------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      style={{
        position: "fixed",
        top: insetY,
        left: insetX,
        zIndex: 100,
        pointerEvents: "auto",
        height: buttonH,
        padding: `0 ${paddingX}`,
        borderRadius: radius,
        border: theme.border,
        background: theme.background,
        boxShadow: theme.shadow,
        backdropFilter: "blur(18px) saturate(130%)",
        WebkitBackdropFilter: "blur(18px) saturate(130%)",
        color: theme.text,
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
      {/* Decorative Corners */}
      <Image
        src="/decorative.svg"
        alt=""
        width={decoSize}
        height={decoSize}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          opacity: decoOpacity,
          pointerEvents: "none",
          filter: isDarkMode ? "invert(1) brightness(1.5)" : "none",
        }}
      />
      <Image
        src="/decorative.svg"
        alt=""
        width={decoSize}
        height={decoSize}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1,
          opacity: decoOpacity,
          pointerEvents: "none",
          transform: "rotate(90deg)",
          filter: isDarkMode ? "invert(1) brightness(1.5)" : "none",
        }}
      />
      <Image
        src="/decorative.svg"
        alt=""
        width={decoSize}
        height={decoSize}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 1,
          opacity: decoOpacity,
          pointerEvents: "none",
          transform: "rotate(-90deg)",
          filter: isDarkMode ? "invert(1) brightness(1.5)" : "none",
        }}
      />
      <Image
        src="/decorative.svg"
        alt=""
        width={decoSize}
        height={decoSize}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          zIndex: 1,
          opacity: decoOpacity,
          pointerEvents: "none",
          transform: "rotate(180deg)",
          filter: isDarkMode ? "invert(1) brightness(1.5)" : "none",
        }}
      />
      ALAK SURESİ
    </motion.div>
  );
}
