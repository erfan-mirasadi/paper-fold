"use client";

import { useFoldStore } from "../canvas/orchestrator/ScrollManager";
import { INTRO_MEDIA_DATA } from "../../data/introMedia";
import { AnimatedText } from "./ui-overlay/AnimatedText";
import { AnimatePresence, motion } from "framer-motion";

// You can adjust these text sizes! The component will automatically pick the right size based on the title's character count.
export const TITLE_SIZES = {
  SHORT: "text-[12vw] md:text-[9vw] leading-[0.9]", // for very short text (<= 15 chars)
  MEDIUM: "text-[10vw] md:text-[7vw] leading-[0.95]", // for medium text (16 - 30 chars)
  LONG: "text-[8vw] md:text-[6vw] leading-[1.05]", // for long text (31 - 50 chars)
  EXTRA_LONG: "text-[6.5vw] md:text-[5vw] leading-[1.1]", // for extremely long text (51+ chars)
};

function getSmartTitleSizeClass(title: string) {
  const len = title.length;
  if (len <= 15) return TITLE_SIZES.SHORT;
  if (len <= 30) return TITLE_SIZES.MEDIUM;
}

// You can adjust the distant black/white shadow position and blur here!
// x: Negative moves shadow left, Positive moves right
// y: Negative moves shadow up, Positive moves down
export const DISTANT_SHADOW = {
  x: -20, // Base X offset
  y: 30, // Base Y offset
  blur: 15, // Blur amount
  opacity: 0.8, // Opacity (0.0 to 1.0)
};

function getDistantShadow(scale: number) {
  return `${DISTANT_SHADOW.x * scale}px ${DISTANT_SHADOW.y * scale}px ${DISTANT_SHADOW.blur}px rgba(0,0,0,${DISTANT_SHADOW.opacity})`;
}

export function IntroBackgroundTextOverlay() {
  const activeAmbientMediaId = useFoldStore((s) => s.activeAmbientMediaId);
  const scrollAmbientMediaId = useFoldStore((s) => s.scrollAmbientMediaId);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  // Direct Zustand selector prevents 60fps tearing while ensuring synchronous React updates
  const isAmbientPhase = useFoldStore(
    (state) =>
      state.ambientProgress >= 0 &&
      state.introHandoffProgress === 0 &&
      (state.ambientProgress > 0 || state.introProgress >= 1),
  );

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
    <div className="pointer-events-none fixed inset-0 flex items-center justify-end pr-6 md:pr-16 lg:pr-24 pb-24 md:pb-40 overflow-hidden z-40">
      <AnimatePresence mode="popLayout">
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
              y: 0,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            className="relative flex flex-col items-center w-[55vw] md:w-[45vw] text-center"
            style={{ willChange: "transform, opacity" }}
          >
            {data.caption && (
              <AnimatedText
                text={toSentenceCase(data.caption)}
                variant="caption"
                animationType="flyInLeft"
                cinematic={true}
                style={{
                  textShadow: `-2px 2px 5px rgba(248,249,250,0.18), -8px 8px 18px rgba(0,0,0,0.55), ${getDistantShadow(0.33)}`,
                }}
                className="tracking-widest text-base md:text-lg font-(family-name:--font-poppins) font-medium w-full justify-center z-10 text-[#A78BFA]"
              />
            )}
            {data.title && (
              <AnimatedText
                text={toSentenceCase(data.title)}
                variant="title"
                animationType="flyInBottom"
                cinematic={true}
                style={{
                  textShadow: `-8px 8px 12px rgba(167,139,250,0.2), -18px 18px 30px rgba(167,139,250,0.12), -30px 30px 50px rgba(0,0,0,0.45), ${getDistantShadow(1)}`,
                }}
                className={`font-light font-(family-name:--font-fraunces) tracking-tight select-none w-full justify-center ${data.titleSize ? data.titleSize : getSmartTitleSizeClass(data.title)} text-black in-[.dark]:text-[#F8F9FA]`}
              />
            )}
            {data.subtitle && (
              <AnimatedText
                text={toLowerCase(data.subtitle) + "."}
                variant="subtitle"
                animationType="flyInBottom"
                cinematic={true}
                style={{
                  textShadow: `-4px 4px 8px rgba(248,249,250,0.18), -12px 12px 24px rgba(0,0,0,0.55), ${getDistantShadow(0.66)}`,
                }}
                className="font-light font-(family-name:--font-fraunces) tracking-tight leading-none select-none w-full justify-center text-[3.5vw] md:text-[2.5vw] -mt-6 md:-mt-10 mb-4 text-black in-[.dark]:text-[#A78BFA]"
              />
            )}
            {data.body && (
              <AnimatedText
                text={toLowerCase(data.body)}
                variant="body"
                animationType="fadeIn"
                cinematic={true}
                style={{
                  textShadow: `-3px 3px 7px rgba(167,139,250,0.18), -9px 9px 20px rgba(0,0,0,0.55), ${getDistantShadow(0.5)}`,
                }}
                className="font-(family-name:--font-dm-serif) italic leading-none select-none w-full justify-center text-lg md:text-xl -mt-2 md:-mt-4 text-black in-[.dark]:text-white/90"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
