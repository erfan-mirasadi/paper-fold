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
  animationType?: "flyInBottom" | "flyInTop" | "fadeIn";
  // Time between each word animating
  staggerDelay?: number;
  // Prevents text from wrapping to multiple lines
  noWrap?: boolean;
  // Custom styles
  style?: React.CSSProperties;
  // Custom classes for the word spans
  spanClassName?: string;
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
  style,
  spanClassName,
}) => {
  // Split text into an array of words for individual animation
  const words = text.split(" ");

  // Base typography styles matching the ORYZO references
  const variantStyles = {
    title:
      "text-6xl md:text-8xl font-bold tracking-tighter uppercase font-serif",
    subtitle: "text-3xl md:text-5xl font-semibold tracking-tight font-serif",
    body: "text-lg md:text-xl font-normal leading-relaxed font-sans",
    caption:
      "text-sm md:text-base font-medium uppercase tracking-widest font-sans",
  };

  // Glow effect styles
  // The intense glow requires a heavy text-shadow, typically layered for a natural bloom
  const glowStyles = glow
    ? {
        textShadow:
          "0 0 20px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.6), 0 0 100px rgba(255, 255, 255, 0.4)",
      }
    : {};

  // Container variants to handle the staggering of children (words)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1 * i,
      },
    }),
  };

  // Determine the starting Y position based on animationType
  const getInitialY = () => {
    if (animationType === "flyInTop") return -40;
    if (animationType === "flyInBottom") return 40;
    return 0; // fadeIn
  };

  // Child variants for individual words
  const childVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: getInitialY(),
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  // Convert the dynamically chosen Tag to a motion component
  // We use type assertion here to satisfy TypeScript for dynamic motion tags
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      variants={containerVariants}
      // whileInView triggers the animation every time the element enters the viewport
      // viewport={{ once: false, amount: 0.2 }} ensures it fades out when leaving and fades in when returning
      whileInView="visible"
      initial="hidden"
      viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
      className={cn(
        "flex",
        noWrap ? "flex-nowrap whitespace-nowrap" : "flex-wrap",
        variantStyles[variant],
        className,
      )}
      style={{ ...glowStyles, ...style }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={childVariants}
          key={index}
          className={cn("mr-[0.25em] inline-block", spanClassName)}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
};
