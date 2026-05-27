"use client";

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
  const loopedAmbientMediaId = useFoldStore((s) => s.loopedAmbientMediaId);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const introProgress = useFoldStore((s) => s.introProgress);
  const introHandoffProgress = useFoldStore((s) => s.introHandoffProgress);

  // Strictly trigger only when the sections have fully met at the center (Page 2)
  const isJoinedStep = introProgress >= 0.99 && introHandoffProgress < 0.05;

  if (!isIntroActive || !isJoinedStep) return null;

  const effectiveActiveId = activeAmbientMediaId || loopedAmbientMediaId;
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
    <div className="pointer-events-none fixed inset-0 flex items-start justify-end p-12 md:p-24 md:pt-32 overflow-hidden z-[40]">
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            key={effectiveActiveId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center w-[65vw] text-center translate-x-16 md:translate-x-20"
          >
            {data.caption && (
              <AnimatedText
                text={toSentenceCase(data.caption)}
                variant="caption"
                animationType="flyInLeft"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`mb-4 tracking-widest text-lg md:text-xl font-[family-name:var(--font-poppins)] font-medium w-full justify-center ${
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
                className={`font-semibold font-[family-name:var(--font-poppins)] leading-[1] select-none w-full justify-center ${isDarkMode ? "text-white" : "text-black"} ${data.titleSize ? data.titleSize : "text-[9vw] md:text-[7vw]"}`}
              />
            )}
            {data.subtitle && (
              <AnimatedText
                text={toLowerCase(data.subtitle)}
                variant="subtitle"
                animationType="flyInLeft"
                cinematic={true}
                style={{ textShadow: "none" }}
                className={`font-[family-name:var(--font-dm-serif)] italic leading-[1] select-none w-full justify-center text-4xl md:text-5xl -mt-2 md:-mt-4 mb-4 ${
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
                className={`font-[family-name:var(--font-dm-serif)] italic leading-[1] select-none w-full justify-center text-2xl md:text-3xl -mt-2 md:-mt-4 ${
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
