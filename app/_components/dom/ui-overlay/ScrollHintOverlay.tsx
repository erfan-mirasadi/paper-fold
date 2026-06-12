"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { useElevatedStore } from "@/app/stores/useElevatedStore";
import { usePopUpStore } from "@/app/stores/usePopUpStore";

export const ScrollHintOverlay: React.FC = () => {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const currentOffset = useFoldStore((s) => s.currentOffset);
  const isElevated = useElevatedStore((s) => s.isAllSectionsMode || s.phase === "elevated");
  const isPopUpActive = usePopUpStore((s) => s.popUpAllOpen || s.popUpGroups.some(g => g.isOpen));

  // Visible only when intro is finished and we haven't reached the very end of the story
  // We use 0.92 instead of 0.99 because Lenis max scroll sometimes doesn't reach exactly 1.0
  const isFoldStory = !isIntroActive && currentOffset < 0.92 && currentOffset >= 0 && !isElevated && !isPopUpActive;

  const [isVisible, setIsVisible] = useState(false);

  // Periodically show and hide the hint to avoid it being always present
  useEffect(() => {
    if (!isFoldStory) {
      setIsVisible(false);
      return;
    }

    // Show it after a short delay when entering fold story
    const initialTimeout = setTimeout(() => setIsVisible(true), 1000);

    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 4500); // Toggle visibility every 4.5 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isFoldStory]);

  return (
    <AnimatePresence>
      {isVisible && isFoldStory && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none"
        >
          <motion.span
            className="mb-3 opacity-60 font-light font-(family-name:--font-fraunces) tracking-tight text-lg"
            style={{ 
              color: "var(--foreground)",
              textShadow: "0px 2px 10px rgba(0,0,0,0.15)"
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Aşağı kaydır
          </motion.span>

          {/* Elegant animated line pointing down */}
          <div 
            className="relative w-[1px] h-12 overflow-hidden"
            style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full h-full origin-top"
              style={{ backgroundColor: "var(--foreground)" }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ 
                scaleY: [0, 1, 0],
                translateY: ["0%", "0%", "100%"],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
