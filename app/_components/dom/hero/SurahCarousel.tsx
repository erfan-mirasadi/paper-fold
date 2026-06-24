"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export function SurahCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convert children to an array
  const childrenArray = React.Children.toArray(children);
  const originalLength = childrenArray.length;

  // Duplicate items 4 times to ensure enough content for a seamless loop
  const duplicatedChildren = [
    ...childrenArray,
    ...childrenArray,
    ...childrenArray,
    ...childrenArray,
  ];

  const handleInteraction = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1000);
  };

  const scrollLeft = () => {
    handleInteraction();
    if (scrollRef.current) {
      const step = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    handleInteraction();
    if (scrollRef.current) {
      const step = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let currentScroll = scrollRef.current ? scrollRef.current.scrollLeft : 0;

    const animateScroll = () => {
      if (
        originalLength > 0 &&
        scrollRef.current &&
        itemRefs.current[0] &&
        itemRefs.current[originalLength]
      ) {
        // The exact width of one original set of items
        const setWidth =
          itemRefs.current[originalLength]!.offsetLeft -
          itemRefs.current[0]!.offsetLeft;

        currentScroll += 0.5; // Speed of continuous scroll (0.5px per frame = 30px/sec)

        // Sync if user manually scrolled (allow 2px buffer for floats)
        if (Math.abs(scrollRef.current.scrollLeft - currentScroll) > 2) {
          currentScroll = scrollRef.current.scrollLeft;
        } else {
          scrollRef.current.scrollLeft = currentScroll;
        }

        // Seamless infinite loop!
        if (currentScroll >= setWidth) {
          currentScroll -= setWidth;
          scrollRef.current.scrollLeft = currentScroll;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, originalLength]);

  return (
    <div 
      className="w-full max-w-[1200px] relative flex items-center justify-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleInteraction}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={handleInteraction}
    >
      {/* Left Arrow */}
      <motion.button 
        onClick={scrollLeft}
        className="flex absolute left-2 md:left-4 z-20 p-2 md:p-4 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all transform hover:-translate-x-1"
        aria-label="Previous Surahs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-4 md:gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ paddingTop: 'clamp(12px, 2vh, 24px)', paddingBottom: 'clamp(12px, 2vh, 24px)', paddingLeft: 'clamp(40px, 6vw, 96px)', paddingRight: 'clamp(40px, 6vw, 96px)' }}
      >
        {duplicatedChildren.map((child, index) => (
          <div 
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            style={{ minWidth: 'clamp(220px, 22vw, 340px)', width: 'clamp(220px, 22vw, 340px)', maxWidth: '340px' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <motion.button 
        onClick={scrollRight}
        className="flex absolute right-2 md:right-4 z-20 p-2 md:p-4 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all transform hover:translate-x-1"
        aria-label="Next Surahs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.button>
    </div>
  );
}
