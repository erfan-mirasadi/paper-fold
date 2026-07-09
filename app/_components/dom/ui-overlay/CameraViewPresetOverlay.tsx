"use client";

import { motion, useMotionValue, useTransform, useMotionValueEvent, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCameraStore } from "../../../stores/useCameraStore";
import { useCameraViewStore } from "../../../stores/useCameraViewStore";

const KNOB_STEP = 24; // ~10% of the -120..120 range per key press

export function CameraViewPresetOverlay() {
  const zoomPhase = useCameraStore((s) => s.phase);
  const isLocked = zoomPhase !== "idle";
  const [isHovered, setIsHovered] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);

  // Knob X position: -120 to 120 (for a 240px wide track)
  const x = useMotionValue(0);

  // Parabola math: M 0 10 Q 120 70 240 10
  // t goes from 0 to 1 as x goes from -120 to 120
  const y = useTransform(x, (xVal) => {
    const t = (xVal + 120) / 240;
    const clampedT = Math.max(0, Math.min(1, t));
    const rawY = -120 * clampedT * clampedT + 120 * clampedT + 10;
    return rawY - 8; // subtract half knob height (16px) to center it
  });

  useMotionValueEvent(x, "change", (latestX) => {
    const normalized = latestX / 120;
    useCameraViewStore.getState().setContinuousOffset(normalized);
    // Imperative DOM update (not React state) so assistive tech announces the
    // live value without re-rendering on every drag/animation frame.
    knobRef.current?.setAttribute("aria-valuenow", normalized.toFixed(2));
  });

  // When the app initializes or resets to default, we reset the slider to center.
  useEffect(() => {
    if (useCameraViewStore.getState().continuousOffset === null) {
      x.set(0);
    }
  }, [x]);

  const handleDragEnd = () => {
    const currentX = x.get();
    // Magnetic snap to center if released within 15px
    if (Math.abs(currentX) < 15) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
    setIsHovered(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    const clamp = (v: number) => Math.max(-120, Math.min(120, v));
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      animate(x, clamp(x.get() - KNOB_STEP), { type: "spring", stiffness: 400, damping: 30 });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      animate(x, clamp(x.get() + KNOB_STEP), { type: "spring", stiffness: 400, damping: 30 });
    } else if (e.key === "Home") {
      e.preventDefault();
      animate(x, -120, { type: "spring", stiffness: 400, damping: 30 });
    } else if (e.key === "End") {
      e.preventDefault();
      animate(x, 120, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  return (
    <div
      className="fixed left-[calc(var(--safe-left)+16px)] md:left-[calc(var(--safe-left)+24px)] bottom-[calc(var(--safe-bottom)+24px)] md:bottom-[calc(var(--safe-bottom)+32px)] z-999993 w-[240px] h-[60px] text-foreground"
      onPointerEnter={() => !isLocked && setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{ opacity: isLocked ? 0.4 : 1, transition: "opacity 0.3s" }}
    >
      {/* SVG Curved Track */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 240 60"
      >
        <path
          d="M 0 10 Q 120 70 240 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.3"
        />
        {/* Preset tick dots */}
        <circle cx="0" cy="10" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="120" cy="40" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="240" cy="10" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Draggable Knob */}
      <motion.div
        ref={knobRef}
        style={{ x, y }}
        drag={isLocked ? false : "x"}
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Camera view angle"
        aria-orientation="horizontal"
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={0}
        tabIndex={isLocked ? -1 : 0}
        className="absolute top-0 left-1/2 -ml-[8px] w-4 h-4 rounded-full bg-foreground cursor-grab active:cursor-grabbing pointer-events-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
      />

      {/* Animated Hand Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
        className="absolute top-[56px] left-1/2 -ml-[12px] pointer-events-none"
      >
        <motion.svg
          animate={isHovered ? { x: [-8, 8, -8] } : { x: 0 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          width="24" height="24" viewBox="0 0 512 512" fill="currentColor"
          className="opacity-70"
        >
          <g transform="translate(1 1)">
            <path d="M417.254,178.2c-9.387,0-18.773,3.413-25.6,8.533V178.2c0-23.893-18.773-42.667-42.667-42.667
              c-9.387,0-18.773,3.413-25.6,8.533c0-23.893-18.773-42.667-42.667-42.667c-9.387,0-18.773,3.413-25.6,8.533V41.667
              C255.121,17.773,236.347-1,212.454-1s-42.667,18.773-42.667,42.667v193.707c-18.773-32.427-62.293-48.64-95.573-36.693
              c-4.267,0.853-7.68,3.413-11.947,5.973c-12.8,8.533-11.947,19.627-11.947,23.04c-0.853,5.12,0,5.973,11.947,19.627
              c14.507,17.067,46.08,52.907,65.707,88.747c1.707,1.707,24.747,39.253,50.347,67.413v22.187c0,46.933,38.4,85.333,85.333,85.333
              h85.333c36.693,0,75.093-30.72,83.627-66.56c2.56-10.24,5.12-17.92,8.533-21.333c8.533-10.24,18.773-34.133,18.773-65.707V220.867
              C459.921,196.973,441.147,178.2,417.254,178.2z M349.841,493.933h-85.333c-37.547,0-68.267-30.72-68.267-68.267v-6.767
              c2.875,2.339,5.76,4.61,8.533,6.767c3.413,3.413,7.68,6.827,11.947,10.24c1.707,0.853,3.413,1.707,5.12,1.707
              c2.56,0,5.12-0.853,6.827-3.413c3.413-3.413,2.56-8.533-0.853-11.947c-4.267-3.413-8.533-6.827-12.8-10.24
              c-7.494-5.829-14.983-11.664-21.684-18.285c-25.475-26.456-49.996-66.195-49.996-66.195
              c-20.48-36.693-52.907-73.387-68.267-91.307c-2.56-3.413-5.973-7.68-7.68-9.387c0-2.56,0-4.267,5.973-7.68
              c3.413-1.707,5.973-3.413,8.533-4.267c22.187-7.68,58.88,2.56,75.093,30.72l13.191,19.786c0.109,0.523,0.26,1.041,0.462,1.547
              l8.533,17.067c1.707,3.413,10.24,5.12,11.093,3.413c3.413-1.707,5.12-6.827,3.413-11.093l-6.02-12.039
              c0.028-0.253,0.046-0.507,0.046-0.761V41.667c0-14.507,11.093-25.6,25.6-25.6s25.6,11.093,25.6,25.6V178.2c0,0,0,0.001,0,0.001
              V283.16c0,5.12,3.413,8.533,8.533,8.533s8.533-3.413,8.533-8.533V178.2v-34.133c0-14.507,11.093-25.6,25.6-25.6
              s25.6,11.093,25.6,25.6V178.2v96.427c0,5.12,3.413,8.533,8.533,8.533s8.533-3.413,8.533-8.533V178.2
              c0-14.507,11.093-25.6,25.6-25.6c14.507,0,25.6,11.093,25.6,25.6v42.667v62.293c0,5.12,3.413,8.533,8.533,8.533
              s8.533-3.413,8.533-8.533v-62.293c0-14.507,11.093-25.6,25.6-25.6c14.507,0,25.6,11.093,25.6,25.6V357.4
              c0,15.106-2.777,27.428-6.161,36.621c-1.015,0.932-1.826,2.12-2.372,3.485c-4.267,12.8-16.213,17.067-37.547,23.04
              c-4.267,0.853-6.827,5.973-5.973,10.24c1.707,3.413,5.12,5.973,8.533,5.973c0.853,0,1.707,0,1.707,0.853
              c5.648-1.521,11.128-3.098,16.289-4.954c-0.659,2.39-1.258,4.895-1.782,7.514C410.427,469.187,378.854,493.933,349.841,493.933z" />
          </g>
        </motion.svg>
      </motion.div>
    </div>
  );
}
