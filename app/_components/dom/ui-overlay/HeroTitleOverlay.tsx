"use client";

import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { AnimatedText } from "./AnimatedText";
import { useMemo } from "react";

export function HeroTitleOverlay() {
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
      style={{ opacity, paddingBottom: "35vh" }}
    >
      <div className="relative flex flex-col items-center text-center">
        <AnimatedText
          text="Alak"
          variant="title"
          animationType="flyInBottom"
          cinematic={true}
          style={{ textShadow: "none" }}
          className={`font-light font-(family-name:--font-fraunces) tracking-tight leading-[0.9] select-none w-full justify-center text-[16vw] md:text-[12vw] text-[#F8F9FA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
        />
        <AnimatedText
          text="suresi"
          variant="subtitle"
          animationType="flyInBottom"
          cinematic={true}
          style={{ textShadow: "none" }}
          className={`font-light font-(family-name:--font-fraunces) tracking-tight leading-[0.9] select-none w-full justify-center text-[9vw] md:text-[6vw] -mt-16 md:-mt-28 mb-4 relative z-10 text-[#A78BFA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
        />
      </div>
    </div>
  );
}
