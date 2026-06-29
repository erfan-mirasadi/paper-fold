"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "../LenisProvider";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { useStoryStore } from "@/app/stores/useStoryStore";
import { useState } from "react";
import { OverlayButton } from "./OverlayButton";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { resetAllDrags } from "../../../utils/dragEngine";

export function SkipIntroButton() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const lenis = useLenis();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = () => {
    if (!lenis) return;
    setIsSkipping(true);
    useFoldStore.getState().setActiveAmbientMediaId(null);
    useFoldStore.getState().setInstantSkip(true);

    setTimeout(() => {
      const activeConfig = useStoryStore.getState().activeConfig;
      const storyStartPct =
        activeConfig.animations.scrollTimeline?.story.start ?? 60;
      const storyStartOffset = storyStartPct / 100;

      // 🚨 FIX BUG 3b: اضافه کردن 2 پیکسل برای اطمینان صد در صد از رد شدن از مرز ریاضیاتی
      lenis.scrollTo(lenis.limit * storyStartOffset + 2, { immediate: true });

      // 🚨 FIX BUG 3c: فورسِ آنیِ تمام متغیرها (جلوگیری از باگ فریمهای میانی)
      useFoldStore.setState({ 
        isIntroActive: false,
        introHandoffProgress: 1,
        introProgress: 1,
        ambientProgress: 1,
        rawOffset: storyStartOffset,
      });

      // 🚨 دستور مستقیم برای خواباندن تمام سکشنها روی کاغذ زیر پرده سیاه!
      useElevatedStore.getState().restoreAllSections();
      resetAllDrags();

      setTimeout(() => {
        setIsSkipping(false);
        useFoldStore.getState().setInstantSkip(false);
      }, 600);
    }, 350);
  };

  return (
    <>
      <AnimatePresence>
        {isIntroActive && !isSkipping && (
          <OverlayButton
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={handleSkip}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-100 group"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="relative flex items-center justify-center px-12 py-3 rounded-full">
              {/* Glassy Halo Effect (Blurred thick border) */}
              <div 
                className="absolute inset-[-1px] rounded-full border-[3px] border-foreground/20 blur-[3px] transition-all duration-500 group-hover:border-foreground/40 group-hover:blur-[4px]"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                }}
              />

              {/* Crisp Faded Border */}
              <div 
                className="absolute inset-0 rounded-full border border-foreground/40 transition-colors duration-500 group-hover:border-foreground/70"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              />

              {/* High Contrast Text */}
              <span className="relative z-10 text-foreground font-medium font-(family-name:--font-fraunces) tracking-widest text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105">
                Girişi geç
              </span>
            </div>
          </OverlayButton>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSkipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-(--page-bg) z-9999 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
