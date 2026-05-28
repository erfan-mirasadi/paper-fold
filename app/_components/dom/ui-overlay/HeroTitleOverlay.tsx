"use client";

import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { AnimatedText } from "./AnimatedText";
import { useMemo } from "react";

export function HeroTitleOverlay({ isDarkMode }: { isDarkMode: boolean }) {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  // Cap at 0.2 so Zustand stops triggering re-renders once it's fully faded out!
  const introProgress = useFoldStore((s) =>
    s.introProgress > 0.2 ? 0.2 : s.introProgress,
  );

  // "page 1" fade out. introProgress goes 0 to 1 during the intro section.
  // We fade this out quickly so it only appears on the initial page load / first scroll.
  const opacity = useMemo(() => {
    return Math.max(1 - introProgress * 5, 0);
  }, [introProgress]);

  if (!isIntroActive || opacity <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-50"
      style={{ opacity, paddingBottom: "15vh" }}
    >
      <div className="relative flex flex-col items-center text-center">
        <AnimatedText
          text="Alak"
          variant="title"
          animationType="flyInBottom"
          cinematic={true}
          style={{
            textShadow: "none",
            WebkitMaskImage:
              "linear-gradient(to right, black 15%, rgba(0, 0, 0, 0.15) 100%)",
            maskImage:
              "linear-gradient(to right, black 15%, rgba(0, 0, 0, 0.15) 100%)",
          }}
          lineGapClass="-mt-4 md:-mt-8"
          className={`font-semibold font-(family-name:--font-poppins) leading-none select-none w-full justify-center ${isDarkMode ? "text-white" : "text-black"} text-[15vw] md:text-[12vw]`}
        />
        <AnimatedText
          text="suresi"
          variant="subtitle"
          animationType="flyInLeft"
          cinematic={true}
          style={{ textShadow: "none" }}
          className={`font-(family-name:--font-dm-serif) italic leading-none select-none w-full justify-center text-5xl md:text-6xl -mt-12 md:-mt-20 mb-4 relative z-10 ${
            isDarkMode ? "text-white/90" : "text-black/90"
          }`}
        />
      </div>
    </div>
  );
}
