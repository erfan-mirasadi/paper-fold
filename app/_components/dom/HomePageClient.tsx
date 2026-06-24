"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SurahCarousel } from "./SurahCarousel";
import { ThemeToggleOverlay } from "./ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./ui-overlay/LanguageSwitchOverlay";
import type { SurahCardData } from "./SurahCard";

export function HomePageClient({ surahs }: { surahs: SurahCardData[] }) {
  return (
    <main className="w-full h-[100dvh] overflow-hidden selection:bg-[#5E7367]/30 flex flex-col relative bg-[#111] text-white">
      {/* ── Fixed Overlays ── */}
      <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-[100] flex flex-row-reverse md:flex-col items-center gap-0">
        <ThemeToggleOverlay />
        <LanguageSwitchOverlay />
      </div>

      {/* ── Background Image (Always visible, Hero section.jpg) ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/Hero section.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Darkening Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
      </div>

      {/* ── Mountains (Slide up from bottom) ── */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-0 pointer-events-none flex items-end justify-center"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <Image
          src="/hero/Mountains.png"
          alt="Mountains Background"
          width={2560}
          height={800}
          priority
          className="w-full h-auto object-contain object-bottom"
        />
        {/* Gradient fade to blend the bottom of mountains if necessary */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-black/80 to-transparent" />
      </motion.div>

      {/* ── Content Container ── */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[15vh] md:pt-[20vh] pb-12">
        {/* Header */}
        <motion.header
          className="text-center mb-16 md:mb-20 flex flex-col items-center px-6"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
            className="text-[2.5rem] leading-[1.1] md:text-6xl lg:text-7xl font-normal tracking-[-0.02em] text-[#F4F1EA] mb-8 md:mb-10"
          >
            QuranPatterns
          </h1>
          <Image
            src="/hero/Logomark.png"
            alt="Logo"
            width={32}
            height={32}
            className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md opacity-80"
          />
        </motion.header>

        {/* Subtitle & Carousel Area */}
        <motion.div
          className="w-full flex flex-col items-center mt-[10vh] md:mt-[15vh]"
          initial={{ filter: "opacity(0%)", y: 40, scale: 0.95 }}
          animate={{ filter: "opacity(100%)", y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-cormorant), serif",
            }}
            className="text-xl md:text-3xl font-medium text-[#D2E1D7] drop-shadow-md mb-8 text-center"
          >
            Keşfetmek İçin Bir Sure Seçin
          </h2>
          <div className="w-full flex justify-center">
            <SurahCarousel surahs={surahs} />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
