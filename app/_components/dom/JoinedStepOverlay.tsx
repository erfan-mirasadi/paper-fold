import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";

interface JoinedStepOverlayProps {
  isDarkMode: boolean;
}

export default function JoinedStepOverlay({ isDarkMode }: JoinedStepOverlayProps) {
  const introProgress = useFoldStore((s) => s.introProgress);
  const introHandoffProgress = useFoldStore((s) => s.introHandoffProgress);

  // Strictly trigger only when the sections have fully met at the center
  const isJoinedStep = introProgress >= 0.99 && introHandoffProgress < 0.05;

  return (
    <AnimatePresence>
      {isJoinedStep && (
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 pointer-events-none z-[80] p-4"
        >
          {/* The Apple-style Glowing Frame (Monochrome Bezel) */}
          {isDarkMode ? (
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px 0px rgba(255,255,255,0), inset 0 0 0px 0px rgba(255,255,255,0)",
                  "0 0 65px 3px rgba(255,255,255,0.22), inset 0 0 30px 0px rgba(255,255,255,0.1)",
                  "0 0 0px 0px rgba(255,255,255,0), inset 0 0 0px 0px rgba(255,255,255,0)",
                ],
                borderColor: [
                  "rgba(255,255,255,0.1)",
                  "rgba(255,255,255,0.5)",
                  "rgba(255,255,255,0.1)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ filter: "blur(1.2px)" }}
              className="w-full h-full border-[1.5px] rounded-[3.5rem] pointer-events-none"
            />
          ) : (
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px 0px rgba(0,0,0,0), inset 0 0 0px 0px rgba(0,0,0,0)",
                  "0 0 50px 6px rgba(0,0,0,0.18), inset 0 0 25px 0px rgba(0,0,0,0.1)",
                  "0 0 0px 0px rgba(0,0,0,0), inset 0 0 0px 0px rgba(0,0,0,0)",
                ],
                borderColor: [
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.8)",
                  "rgba(0,0,0,0.2)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ filter: "blur(1.2px)" }}
              className="w-full h-full border-[2.5px] rounded-[3.5rem] pointer-events-none"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
