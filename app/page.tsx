import type { Metadata } from "next";
import { getAllSurahs } from "./data/surahDatabase";
import { ThemeToggleOverlay } from "./_components/dom/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/dom/ui-overlay/LanguageSwitchOverlay";
import { SurahCarousel } from "./_components/dom/SurahCarousel";

export const metadata: Metadata = {
  title: "Quran Patterns",
  description:
    "Explore the Quran through immersive 3D visualizations. Each Surah is a layered journey into meaning, structure, and beauty.",
};

export default function MenuPage() {
  const surahs = getAllSurahs().map((surah) => ({
    id: surah.id,
    displayName: surah.displayName,
    arabicName: surah.arabicName,
    reference: surah.reference,
  }));

  return (
    <main
      className="w-full h-[100dvh] overflow-hidden selection:bg-[#5E7367]/30 flex flex-col relative transition-colors duration-700"
      style={{ backgroundColor: "var(--home-bg)", color: "var(--home-text)" }}
    >
      {/* ── Fixed Overlays ── */}
      <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-[100] flex flex-row-reverse md:flex-col items-center gap-0 pointer-events-none">
        <ThemeToggleOverlay />
        <LanguageSwitchOverlay />
      </div>

      {/* ── Background Elements ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat transition-all duration-1000"
        style={{
          opacity: "var(--home-hero-opacity)",
          filter: "var(--home-hero-filter)",
          mixBlendMode: "var(--home-hero-blend)" as any,
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundPosition: "center bottom",
          transform: "scale(1.25) translateY(-10%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />

      {/* Light Mode Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: "var(--home-light-glow-opacity, 0)",
          background: "radial-gradient(circle at 50% -20%, rgba(210, 225, 215, 0.8) 0%, rgba(250, 249, 246, 0) 70%)"
        }}
      />

      {/* Darkening Gradient Overlay for readability */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: "rgba(0,0,0,var(--home-dark-overlay))" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[30vh] z-0 pointer-events-none transition-colors duration-700"
        style={{ backgroundImage: "linear-gradient(to top, var(--home-gradient-start), transparent)" }}
      />

      {/* ── Content Container ── */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-16 md:pt-32 pb-0">
        {/* Header */}
        <header className="text-center mb-6 flex flex-col items-center px-6">
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              color: "var(--home-title)",
              textShadow: "var(--home-shadow)",
            }}
            className="text-[2.5rem] leading-[1.1] md:text-6xl lg:text-7xl font-normal tracking-[-0.02em] mb-12 md:mb-24 transition-all duration-700"
          >
            QuranPatterns
          </h1>
          <h2
            style={{
              fontFamily: "var(--font-cormorant), serif",
              color: "var(--home-subtitle)",
            }}
            className="text-xl md:text-[2rem] font-medium transition-colors duration-700"
          >
            Keşfetmek İçin Bir Sure Seçin
          </h2>
        </header>

        {/* Carousel Area */}
        <SurahCarousel surahs={surahs} />
      </div>
    </main>
  );
}
