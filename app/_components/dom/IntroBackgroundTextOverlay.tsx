"use client";

import { useState, useEffect } from "react";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";
import { INTRO_MEDIA_DATA } from "../../data/introMedia";
import { AnimatedText } from "./ui-overlay/AnimatedText";
import { AnimatePresence, motion } from "framer-motion";

// You can adjust these text sizes! The component will automatically pick the right size based on the title's character count.
export const TITLE_SIZES = {
  SHORT: "text-[16vw] md:text-[12vw] leading-[0.9]",       // for very short text (<= 15 chars)
  MEDIUM: "text-[14vw] md:text-[10vw] leading-[0.95]",     // for medium text (16 - 30 chars)
  LONG: "text-[11vw] md:text-[8.5vw] leading-[1.05]",      // for long text (31 - 50 chars)
  EXTRA_LONG: "text-[9vw] md:text-[7vw] leading-[1.1]",    // for extremely long text (51+ chars)
};

function getSmartTitleSizeClass(title: string) {
  const len = title.length;
  if (len <= 15) return TITLE_SIZES.SHORT;
  if (len <= 30) return TITLE_SIZES.MEDIUM;
  if (len <= 50) return TITLE_SIZES.LONG;
  return TITLE_SIZES.EXTRA_LONG;
}

export function IntroBackgroundTextOverlay({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) {
  const activeAmbientMediaId = useFoldStore((s) => s.activeAmbientMediaId);
  const scrollAmbientMediaId = useFoldStore((s) => s.scrollAmbientMediaId);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  // Localized discrete state to shield from 60fps scroll renders
  const [isAmbientPhase, setIsAmbientPhase] = useState(() => {
    const s = useFoldStore.getState();
    return (
      s.ambientProgress >= 0 &&
      s.introHandoffProgress === 0 &&
      (s.ambientProgress > 0 || s.introProgress >= 1)
    );
  });

  useEffect(() => {
    return useFoldStore.subscribe((state) => {
      const ambient =
        state.ambientProgress >= 0 &&
        state.introHandoffProgress === 0 &&
        (state.ambientProgress > 0 || state.introProgress >= 1);
      setIsAmbientPhase(ambient);
    });
  }, []);

  // We don't return null early, otherwise AnimatePresence cannot play the exit animation!

  const effectiveActiveId = activeAmbientMediaId || scrollAmbientMediaId;
  const data = effectiveActiveId
    ? INTRO_MEDIA_DATA[effectiveActiveId]?.backgroundText
    : null;

  const toSentenceCase = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const toLowerCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase();
  };

  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-end pr-6 md:pr-16 lg:pr-24 overflow-hidden z-40">
      <AnimatePresence mode="wait">
        {isIntroActive && isAmbientPhase && data && (
          <motion.div
            key={effectiveActiveId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              scale: 1.05,
              y: -20,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            className="relative flex flex-col items-center w-[55vw] md:w-[45vw] text-center"
          >
            {data.caption && (
              <AnimatedText
                text={toSentenceCase(data.caption)}
                variant="caption"
                animationType="flyInLeft"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`tracking-widest text-lg md:text-xl font-(family-name:--font-poppins) font-medium w-full justify-center z-10 ${
                  isDarkMode
                    ? "text-[#A78BFA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    : "text-[#7C3AED] drop-shadow-sm"
                }`}
              />
            )}
            {data.title && (
              <AnimatedText
                text={toSentenceCase(data.title)}
                variant="title"
                animationType="flyInBottom"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`font-light font-(family-name:--font-fraunces) tracking-tight select-none w-full justify-center ${data.titleSize ? data.titleSize : getSmartTitleSizeClass(data.title)} ${isDarkMode ? "text-[#F8F9FA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" : "text-zinc-900 drop-shadow-sm"}`}
              />
            )}
            {data.subtitle && (
              <AnimatedText
                text={toLowerCase(data.subtitle) + "."}
                variant="subtitle"
                animationType="flyInBottom"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`font-light font-(family-name:--font-fraunces) tracking-tight leading-none select-none w-full justify-center text-[5vw] md:text-[3.5vw] -mt-6 md:-mt-10 mb-4 ${
                  isDarkMode
                    ? "text-[#A78BFA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    : "text-[#7C3AED] drop-shadow-sm"
                }`}
              />
            )}
            {data.body && (
              <AnimatedText
                text={toLowerCase(data.body)}
                variant="body"
                animationType="fadeIn"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`font-(family-name:--font-dm-serif) italic leading-none select-none w-full justify-center text-2xl md:text-3xl -mt-2 md:-mt-4 ${
                  isDarkMode ? "text-white/90" : "text-black/90"
                }`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
