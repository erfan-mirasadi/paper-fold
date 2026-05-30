"use client";

import { useState, useEffect } from "react";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";
import { INTRO_MEDIA_DATA } from "../../data/introMedia";
import { AnimatedText } from "./ui-overlay/AnimatedText";
import { AnimatePresence, motion } from "framer-motion";

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
    return s.ambientProgress >= 0 && s.introHandoffProgress === 0 && (s.ambientProgress > 0 || s.introProgress >= 1);
  });

  useEffect(() => {
    return useFoldStore.subscribe((state) => {
      const ambient = state.ambientProgress >= 0 && state.introHandoffProgress === 0 && (state.ambientProgress > 0 || state.introProgress >= 1);
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
    <div className="pointer-events-none fixed inset-0 flex items-start justify-end p-12 md:p-24 md:pt-32 overflow-hidden z-40">
      <AnimatePresence mode="wait">
        {isIntroActive && isAmbientPhase && data && (
          <motion.div
            key={effectiveActiveId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 1.05, y: -20, transition: { duration: 0.2, ease: "easeOut" } }}
            className="relative flex flex-col items-center w-[65vw] text-center translate-x-16 md:translate-x-20"
          >
            {data.caption && (
              <AnimatedText
                text={toSentenceCase(data.caption)}
                variant="caption"
                animationType="flyInLeft"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`mb-4 tracking-widest text-lg md:text-xl font-(family-name:--font-poppins) font-medium w-full justify-center ${
                  isDarkMode ? "text-white/50" : "text-black/50"
                }`}
              />
            )}
            {data.title && (
              <AnimatedText
                text={toSentenceCase(data.title)}
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
                className={`font-semibold font-(family-name:--font-poppins) leading-none select-none w-full justify-center ${isDarkMode ? "text-white" : "text-black"} ${data.titleSize ? data.titleSize : "text-[9vw] md:text-[7vw]"}`}
              />
            )}
            {data.subtitle && (
              <AnimatedText
                text={toLowerCase(data.subtitle)}
                variant="subtitle"
                animationType="flyInLeft"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`font-(family-name:--font-dm-serif) italic leading-none select-none w-full justify-center text-4xl md:text-5xl -mt-2 md:-mt-4 mb-4 ${
                  isDarkMode ? "text-white/90" : "text-black/90"
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
