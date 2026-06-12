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
        className="font-light font-(family-name:--font-fraunces) tracking-tight cursor-default group"
        style={{
          height: buttonH,
          whiteSpace: "nowrap",
        }}
      >
          <div 
          className="relative flex items-center justify-center w-full h-full overflow-visible"
          style={{ padding: `0 ${paddingX}` }}
        >
          {/* Inner accent Border */}
          <div className="absolute inset-[5px] border-[0.5px] border-[#BE9E63]/50 rounded-[1px] transition-colors duration-500 group-hover:border-[#BE9E63]/80" />

          {/* Corner Ornaments (Diamond shaped) */}
          <div className="absolute top-[-3px] left-[-3px] w-2 h-2 bg-[#BE9E63] rotate-45 transition-transform duration-500 group-hover:scale-125 shadow-[0_0_8px_rgba(190,158,99,0.5)]" />
          <div className="absolute top-[-3px] right-[-3px] w-2 h-2 bg-[#BE9E63] rotate-45 transition-transform duration-500 group-hover:scale-125 shadow-[0_0_8px_rgba(190,158,99,0.5)]" />
          <div className="absolute bottom-[-3px] left-[-3px] w-2 h-2 bg-[#BE9E63] rotate-45 transition-transform duration-500 group-hover:scale-125 shadow-[0_0_8px_rgba(190,158,99,0.5)]" />
          <div className="absolute bottom-[-3px] right-[-3px] w-2 h-2 bg-[#BE9E63] rotate-45 transition-transform duration-500 group-hover:scale-125 shadow-[0_0_8px_rgba(190,158,99,0.5)]" />

          {/* Decorative side lines */}
          <div className="absolute top-1/2 left-[-1px] w-[2px] h-4 bg-[#BE9E63] -translate-y-1/2 transition-all duration-500 group-hover:h-6 group-hover:bg-[#BE9E63]" />
          <div className="absolute top-1/2 right-[-1px] w-[2px] h-4 bg-[#BE9E63] -translate-y-1/2 transition-all duration-500 group-hover:h-6 group-hover:bg-[#BE9E63]" />

          {/* Main Outer Border */}
          <div className="absolute inset-0 border border-[#BE9E63]/80 rounded-sm transition-colors duration-500 group-hover:border-[#BE9E63]" />

          <span 
            className="relative z-10 text-foreground drop-shadow-md transition-colors duration-500 scale-110"
            style={{ fontSize }}
          >
            {title}
          </span>
        </div>
      </OverlayButton>
    </motion.div>
  );
}
