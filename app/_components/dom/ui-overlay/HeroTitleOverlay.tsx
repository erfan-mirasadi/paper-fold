"use client";

import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { AnimatedText } from "./AnimatedText";
import { useMemo } from "react";

export function HeroTitleOverlay({ isDarkMode }: { isDarkMode: boolean }) {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const introProgress = useFoldStore((s) => s.introProgress);

  // "page 1" fade out. introProgress goes 0 to 1 during the intro section.
  // We fade this out quickly so it only appears on the initial page load / first scroll.
  const opacity = useMemo(() => {
    return Math.max(1 - introProgress * 5, 0);
  }, [introProgress]);

  if (!isIntroActive || opacity <= 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        paddingBottom: "15vh",
      }}
    >
      {/* "ALAK" - The Powerhouse */}
      <AnimatedText
        text="ALAK"
        variant="title"
        noWrap={true}
        animationType="flyInTop"
        className={`text-[18vw] md:text-[14vw] leading-[0.75] font-sans font-black tracking-[-0.08em] ${
          isDarkMode ? "mix-blend-screen" : "mix-blend-multiply"
        }`}
        spanClassName={`bg-clip-text text-transparent bg-gradient-to-b ${
          isDarkMode
            ? "from-[#ffffff] via-[#f8fafc] to-[#94a3b8]"
            : "from-[#020617] via-[#0f172a] to-[#475569]"
        }`}
        glow={isDarkMode}
      />

      {/* Subtle Divider Line */}
      <div 
        className={`w-[15vw] h-[1px] my-4 md:my-6 transition-colors duration-500 ${
          isDarkMode ? "bg-white/20" : "bg-black/10"
        }`}
      />

      {/* "SURESİ" - The Elegant Echo */}
      <AnimatedText
        text="SURESİ"
        variant="title"
        noWrap={true}
        animationType="flyInBottom"
        className={`text-[6vw] md:text-[4vw] leading-none font-serif font-extralight italic tracking-[0.4em] translate-x-[0.2em] ${
          isDarkMode ? "text-white/60" : "text-black/50"
        }`}
        style={{
          textShadow: isDarkMode 
            ? "0 0 20px rgba(255,255,255,0.1)" 
            : "0 0 20px rgba(0,0,0,0.05)"
        }}
      />
    </div>
  );
}
