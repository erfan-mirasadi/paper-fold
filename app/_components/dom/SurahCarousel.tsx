"use client";

import { useRef, useState, useEffect } from "react";
import { SurahCard, type SurahCardData } from "./SurahCard";

export function SurahCarousel({ surahs }: { surahs: SurahCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: -clientWidth, behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    handleInteraction();
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 3500); // Slightly longer since it moves more items
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div 
      className="w-full max-w-[1200px] relative flex items-center justify-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleInteraction}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={handleInteraction}
    >
      {/* Left Arrow */}
      <button 
        onClick={scrollLeft}
        className="flex absolute left-2 md:left-4 z-20 p-2 md:p-4 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all transform hover:-translate-x-1"
        aria-label="Previous Surahs"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory py-6 px-14 md:px-24 scroll-pl-14 md:scroll-pl-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {surahs.map((surah, index) => (
          <div key={surah.id} className="min-w-[260px] md:min-w-[340px] w-[75vw] max-w-[340px] snap-start flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]">
            <SurahCard surah={surah} index={index} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button 
        onClick={scrollRight}
        className="flex absolute right-2 md:right-4 z-20 p-2 md:p-4 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all transform hover:translate-x-1"
        aria-label="Next Surahs"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
