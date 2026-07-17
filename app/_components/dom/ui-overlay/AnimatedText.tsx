"use client";

import {
  CSSProperties,
  FC,
  ReactNode,
  JSX,
  useEffect,
  useRef,
  useState,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AnimatedTextProps {
  text: string;
  // Controls the HTML tag rendered
  as?: keyof JSX.IntrinsicElements;
  // Custom Tailwind classes
  className?: string;
  // Enables the intense glowing effect seen on "it's wearable"
  glow?: boolean;
  // Predetermined typography styles
  variant?: "title" | "subtitle" | "body" | "caption";
  // Direction of the entrance animation
  animationType?:
    | "flyInBottom"
    | "flyInTop"
    | "fadeIn"
    | "flyInLeft"
    | "movieCredits";
  // Time between each word animating
  staggerDelay?: number;
  // Prevents text from wrapping to multiple lines
  noWrap?: boolean;
  // Enables a heavy, cinematic word-by-word animation (non-spring)
  cinematic?: boolean;
  // Custom styles
  style?: CSSProperties;
  // Custom classes for the word spans
  spanClassName?: string;
  // Controls how the text is split for animation
  splitLevel?: "char" | "word" | "none";
  // Animate only on the first viewport entry and then stay visible —
  // prevents the "text keeps re-loading" feel inside scrollable panels
  once?: boolean;
  // Entrance blur radius in px; defaults to 12 for cinematic/movieCredits.
  // Set 0 on small body text: the blur is invisible there but very costly.
  blurPx?: number;
  // Per-word duration override in seconds
  durationS?: number;
  // rootMargin for the in-view trigger (default matches the old framer margin)
  inViewMargin?: string;
}

// The entrance itself lives in globals.css (`at-child-in` / `at-credits-in`)
// as plain CSS animations: the browser runs them off the main thread and drops
// every filter/transform/layer once they finish, instead of keeping one
// JS-driven motion component (plus a permanent will-change GPU layer) alive
// per character.
export const AnimatedText: FC<AnimatedTextProps> = ({
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
  splitLevel = "char",
  once = false,
  blurPx,
  durationS,
  inViewMargin = "-10% 0px -10% 0px",
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  // Same trigger semantics as the previous framer-motion version:
  // whileInView with viewport {once, margin}.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: inViewMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, inViewMargin]);

  // Base typography styles matching the ORYZO references
  const variantStyles = {
    title: "text-6xl md:text-8xl font-bold tracking-tighter font-serif",
    subtitle: "text-3xl md:text-5xl font-semibold tracking-tight font-serif",
    body: "text-lg md:text-xl font-normal leading-relaxed font-sans",
    caption: "text-sm md:text-base font-medium tracking-widest font-sans",
  };

  // Glow effect styles
  const glowStyles = glow
    ? {
        textShadow:
          "0 4px 12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(255, 255, 255, 0.5)",
      }
    : {
        textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
      };

  // Timing — identical numbers to the old framer-motion variants.
  const isCredits = animationType === "movieCredits";
  const blurred = cinematic || isCredits;
  const blur = blurPx ?? (blurred ? 12 : 0);
  const duration = durationS ?? (isCredits ? 1.5 : cinematic ? 1.2 : 0.7);
  // The 0.7s ease-out approximates the old critically damped spring
  // (stiffness 100, damping 20); cinematic keeps the exact bezier.
  const ease = blurred
    ? "cubic-bezier(0.16, 1, 0.3, 1)"
    : "cubic-bezier(0.22, 1, 0.36, 1)";
  const delayChildren = isCredits ? 0.2 : cinematic ? 0.05 : 0.1;
  const stagger = cinematic && !isCredits ? staggerDelay * 1.5 : staggerDelay;

  const initialY = isCredits
    ? 130
    : animationType === "flyInTop"
      ? -40
      : animationType === "flyInBottom"
        ? 40
        : 0;
  const initialX = animationType === "flyInLeft" ? -40 : 0;

  // Each animated span only carries its own stagger delay; the shared
  // animation vars (offset, blur, duration…) are inherited from the container.
  let spanIndex = 0;
  const animatedSpan = (key: string, content: ReactNode, zIndex: number) => (
    <span
      key={key}
      className={cn("at-child inline-block relative", spanClassName)}
      style={
        {
          zIndex,
          "--at-delay": `${delayChildren + spanIndex++ * stagger}s`,
        } as CSSProperties
      }
    >
      {content}
    </span>
  );

  // Split text by \n to handle manual line breaks
  const lines = text.split("\n");
  const renderElements: ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (splitLevel === "none") {
      renderElements.push(
        <span
          key={`line-${lineIndex}`}
          className={cn(
            "at-child inline-block relative whitespace-nowrap",
            spanClassName,
          )}
          style={
            {
              zIndex: 1000 - lineIndex,
              "--at-delay": `${delayChildren + spanIndex++ * stagger}s`,
            } as CSSProperties
          }
        >
          {line}
        </span>,
      );
    } else {
      // Split each line into words
      const words = line.split(" ");
      words.forEach((word, wordIndex) => {
        let wordContent: ReactNode;
        if (splitLevel === "word") {
          wordContent = animatedSpan(
            `word-anim-${lineIndex}-${wordIndex}`,
            word,
            1000,
          );
        } else {
          wordContent = word
            .split("")
            .map((char, charIndex) =>
              animatedSpan(
                `${lineIndex}-${wordIndex}-${charIndex}`,
                char,
                1000 - charIndex,
              ),
            );
        }

        renderElements.push(
          <span
            key={`word-${lineIndex}-${wordIndex}`}
            className="inline-block whitespace-nowrap relative"
            style={{ zIndex: 1000 - wordIndex }}
          >
            {wordContent}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>,
        );
      });
    }

    // Add a line break element if it's not the last line
    if (lineIndex < lines.length - 1) {
      renderElements.push(<br key={`br-${lineIndex}`} />);
    }
  });

  const TagEl = Tag as "h2";

  return (
    <TagEl
      ref={containerRef as never}
      style={
        {
          "--at-x": `${initialX}px`,
          "--at-y": `${initialY}px`,
          "--at-rx": isCredits ? "60deg" : "0deg",
          "--at-blur": `${blur}px`,
          "--at-dur": `${duration}s`,
          "--at-ease": ease,
          ...glowStyles,
          ...style,
        } as CSSProperties
      }
      className={cn(
        "at-container text-center", // Default to text-center since it's most common, can be overridden
        isCredits && "at-credits",
        inView && "at-visible",
        noWrap ? "whitespace-nowrap" : "",
        variantStyles[variant],
        className,
      )}
    >
      {renderElements}
    </TagEl>
  );
};
