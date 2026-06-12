"use client";

import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { AnimatedText } from "./AnimatedText";
import { useMemo } from "react";
import { useStoryStore } from "@/app/stores/useStoryStore";

export function HeroTitleOverlay() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const activeConfig = useStoryStore((s) => s.activeConfig);
  
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
      style={{ opacity, paddingBottom: "40vh" }}
    >
      <div className="relative flex flex-col items-center text-center">
        {activeConfig.heroTitle && (
          <AnimatedText
            text={activeConfig.heroTitle}
            variant="title"
            animationType="flyInBottom"
            cinematic={true}
            style={{ textShadow: "none" }}
            className={`font-light font-(family-name:--font-fraunces) tracking-tight leading-[0.9] select-none w-full justify-center text-[19vw] md:text-[14vw] hero-title-text`}
          />
        )}
        {activeConfig.heroSubtitle && (
          <AnimatedText
            text={activeConfig.heroSubtitle}
            variant="subtitle"
            animationType="flyInBottom"
            cinematic={true}
            style={{ textShadow: "none" }}
            className={`font-light font-(family-name:--font-fraunces) tracking-tight leading-[0.9] select-none w-full justify-center text-[11vw] md:text-[8vw] -mt-[9vw] md:-mt-[8vw] mb-4 relative z-10 hero-title-text`}
          />
        )}
      </div>
    </div>
  );
}
