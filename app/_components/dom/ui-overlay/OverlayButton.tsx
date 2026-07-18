"use client";

import { motion, useMotionValue, useMotionTemplate, HTMLMotionProps } from "framer-motion";
import { ReactNode, forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface OverlayButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode;
  isActive?: boolean;
}

export const OverlayButton = forwardRef<HTMLButtonElement, OverlayButtonProps>(
  (
    {
      children,
      isActive,
      className,
      disabled,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
      if (onPointerMove) onPointerMove(e);
    };

    const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      if (onPointerEnter) onPointerEnter(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      if (onPointerLeave) onPointerLeave(e);
    };

    const maskImage = useMotionTemplate`radial-gradient(35px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

    const showTopLayer = isActive || isHovered;

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={twMerge(
          "relative flex items-center justify-center outline-none cursor-pointer pointer-events-auto select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        whileHover={{ scale: 1.1 }}
        {...props}
      >
        {/* Layer 1: Dimmed Base */}
        <div className="opacity-100 dark:opacity-40 transition-opacity duration-300 flex flex-col items-center justify-center w-full h-full">
          {children}
        </div>

        {/* Layer 2: Fully Illuminated (Spotlight or Active) */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: showTopLayer ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={
            isActive
              ? undefined
              : {
                  WebkitMaskImage: maskImage,
                  maskImage: maskImage,
                }
          }
        >
          {children}
        </motion.div>
      </motion.button>
    );
  }
);

OverlayButton.displayName = "OverlayButton";
