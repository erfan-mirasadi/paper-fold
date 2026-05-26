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

  if (!isIntroActive) return null;

  const effectiveActiveId = activeAmbientMediaId || loopedAmbientMediaId;
  const data = effectiveActiveId
    ? INTRO_MEDIA_DATA[effectiveActiveId]?.backgroundText
    : null;

  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-end p-12 md:p-24 md:pt-32 overflow-hidden">
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            key={effectiveActiveId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center w-[65vw] text-center translate-x-8"
            style={{
              // Use drop-shadow instead of background so it perfectly outlines the text
              // without creating any blocky frames or large radial circles.
              filter: isDarkMode
                ? "drop-shadow(0 4px 24px rgba(0,0,0,0.8)) drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
                : "drop-shadow(0 4px 24px rgba(255,255,255,0.8)) drop-shadow(0 2px 8px rgba(255,255,255,0.6))",
            }}
          >
            {data.caption && (
              <AnimatedText
                text={data.caption}
                variant="caption"
                animationType="flyInLeft"
                className={`mb-4 tracking-widest text-lg md:text-xl w-full justify-center ${
                  isDarkMode ? "text-[#db5001]" : "text-[#b24000]"
                }`}
              />
            )}
            {data.title && (
              <AnimatedText
                text={data.title}
                variant="title"
                animationType="flyInBottom"
                glow={true}
                className={`tracking-[0.05em] text-[12vw] md:text-[9vw] mb-6 font-bold leading-none select-none w-full justify-center ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              />
            )}
            {data.subtitle && (
              <AnimatedText
                text={data.subtitle}
                variant="subtitle"
                animationType="flyInLeft"
                className={`mb-4 w-full text-4xl md:text-5xl justify-center ${
                  isDarkMode ? "text-white" : "text-black"
                } font-light italic`}
              />
            )}
            {data.body && (
              <AnimatedText
                text={data.body}
                variant="body"
                animationType="fadeIn"
                className={`${
                  isDarkMode ? "text-zinc-300" : "text-zinc-600"
                } text-2xl md:text-3xl mt-4 w-full justify-center`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
