"use client";

import { motion } from "framer-motion";
import { useStoryStore } from "@/app/stores/useStoryStore";

import { OverlayButton } from "./OverlayButton";

export function TitleOverlay() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const rawTitle = activeConfig.title || "";
  // Sentence case: only the very first letter is uppercase, rest is lowercase
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

  const insetX = "clamp(14px, 2.2vw, 24px)";
  const insetY = "clamp(12px, 2vw, 16px)";
  const buttonH = "clamp(44px, 5vw, 52px)";
  const paddingX = "clamp(24px, 3vw, 40px)";
  const fontSize = "clamp(18px, 2.4vw, 28px)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      className="fixed z-100 pointer-events-auto"
      style={{
        top: insetY,
        left: insetX,
      }}
    >
      <OverlayButton
        className="font-light font-(family-name:--font-fraunces) tracking-tight cursor-default"
        style={{
          height: buttonH,
          padding: `0 ${paddingX}`,
          fontSize,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </OverlayButton>
    </motion.div>
  );
}
