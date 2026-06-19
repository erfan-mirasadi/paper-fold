"use client";

import { useRef } from "react";
import { SurahCard, type SurahCardData } from "./SurahCard";

export function SurahCarousel({ surahs }: { surahs: SurahCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-16 relative flex items-center justify-center">
      {/* Left Arrow */}
      <button 
        onClick={scrollLeft}
        className="hidden md:flex absolute left-0 z-20 p-4 bg-black/20 hover:bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all transform hover:-translate-x-1"
        aria-label="Previous Surahs"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory py-6 px-4 md:px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {surahs.map((surah, index) => (
          <div key={surah.id} className="min-w-[280px] md:min-w-[340px] w-[85vw] max-w-[340px] snap-center flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]">
            <SurahCard surah={surah} index={index} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button 
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 z-20 p-4 bg-black/20 hover:bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all transform hover:translate-x-1"
        aria-label="Next Surahs"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
