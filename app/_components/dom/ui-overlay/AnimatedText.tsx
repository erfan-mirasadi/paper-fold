"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AnimatedTextProps {
  text: string;
  // Controls the HTML tag rendered
  as?: keyof React.JSX.IntrinsicElements;
  // Custom Tailwind classes
  className?: string;
  // Enables the intense glowing effect seen on "it's wearable"
  glow?: boolean;
  // Predetermined typography styles
  variant?: "title" | "subtitle" | "body" | "caption";
  // Direction of the entrance animation
  animationType?: "flyInBottom" | "flyInTop" | "fadeIn" | "flyInLeft";
  // Time between each word animating
  staggerDelay?: number;
  // Prevents text from wrapping to multiple lines
  noWrap?: boolean;
  // Enables a heavy, cinematic word-by-word animation (non-spring)
  cinematic?: boolean;
  // Custom styles
  style?: React.CSSProperties;
  // Custom classes for the word spans
  spanClassName?: string;
  // Custom class for line break spans to control vertical spacing between lines
  lineGapClass?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as: Tag = "h2",
  className,
  glow = false,
  variant = "title",
  animationType = "flyInBottom",
  staggerDelay = 0.05,
  noWrap = false,
  cinematic = false,
  style,
  spanClassName,
  lineGapClass,
}) => {
  // Base typography styles matching the ORYZO references
  const variantStyles = {
    title: "text-6xl md:text-8xl font-bold tracking-tighter font-serif",
    subtitle: "text-3xl md:text-5xl font-semibold tracking-tight font-serif",
    body: "text-lg md:text-xl font-normal leading-relaxed font-sans",
    caption: "text-sm md:text-base font-medium tracking-widest font-sans",
  };

  // Glow effect styles
  // Optimized text-shadow for better performance (less GPU lag) and much better contrast
  const glowStyles = glow
    ? {
        textShadow:
          "0 4px 12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(255, 255, 255, 0.5)",
      }
    : {
        textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
      };

  // Container variants to handle the staggering of children (words)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: cinematic ? staggerDelay * 1.5 : staggerDelay,
        delayChildren: cinematic ? 0.2 * i : 0.1 * i,
      },
    }),
  };

  // Determine the starting Y position based on animationType
  const getInitialY = () => {
    if (animationType === "flyInTop") return -40;
    if (animationType === "flyInBottom") return 40;
    return 0; // fadeIn, flyInLeft
  };

  // Determine the starting X position based on animationType
  const getInitialX = () => {
    if (animationType === "flyInLeft") return -40;
    return 0;
  };

  // Child variants for individual words
  const childVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: cinematic ? "blur(0px)" : undefined,
      transition: cinematic
        ? {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1], // cinematic smooth ease
          }
        : {
            type: "spring",
            damping: 20,
            stiffness: 100,
          },
    },
    hidden: {
      opacity: 0,
      y: getInitialY(),
      x: getInitialX(),
      filter: cinematic ? "blur(8px)" : undefined,
      transition: cinematic
        ? {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }
        : {
            type: "spring",
            damping: 20,
            stiffness: 100,
          },
    },
  };

  // Convert the dynamically chosen Tag to a motion component
  // We use type assertion here to satisfy TypeScript for dynamic motion tags
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  // Split text by \n to handle manual line breaks
  const lines = text.split("\n");
  const renderElements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    // Split each line into words
    const words = line.split(" ");
    words.forEach((word, wordIndex) => {
      const chars = word.split("");
      const wordElements = chars.map((char, charIndex) => (
        <motion.span
          key={`${lineIndex}-${wordIndex}-${charIndex}`}
          variants={childVariants}
          className={cn("inline-block", spanClassName)}
        >
          {char}
        </motion.span>
      ));

      renderElements.push(
        <span
          key={`word-${lineIndex}-${wordIndex}`}
          className={cn(
            "inline-block whitespace-nowrap",
            lineIndex > 0 ? lineGapClass : "", // Apply negative margin directly to the word wrapper on subsequent lines
          )}
        >
          {wordElements}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>,
      );
    });

    // Add a line break element if it's not the last line
    if (lineIndex < lines.length - 1) {
      renderElements.push(
        <span key={`br-${lineIndex}`} className="basis-full h-0" />,
      );
    }
  });

  return (
    <MotionTag
      variants={containerVariants}
      whileInView="visible"
      initial="hidden"
      viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
      style={{ ...glowStyles, ...style }}
      className={cn(
        "flex",
        noWrap ? "flex-nowrap whitespace-nowrap" : "flex-wrap",
        variantStyles[variant],
        className,
      )}
    >
      {renderElements}
    </MotionTag>
  );
};
