import type { Metadata } from "next";
import Image from "next/image";
import { getAllSurahs } from "./data/surahDatabase";
import { ThemeToggleOverlay } from "./_components/dom/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/dom/ui-overlay/LanguageSwitchOverlay";
import { AnimatedMountains, AnimatedHeader, AnimatedCarouselSection } from "./_components/dom/hero/HeroAnimations";
import { SurahCarousel } from "./_components/dom/hero/SurahCarousel";
import { SurahCard } from "./_components/dom/hero/SurahCard";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s | Quran Patterns" template so
  // the homepage doesn't render as "Quran Patterns | Quran Patterns".
  title: { absolute: "Quran Patterns — Explore the Quran in 3D" },
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
      <AnimatedMountains />

      {/* ── Content Container ── */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start" style={{ paddingTop: 'clamp(40px, 12vh, 160px)', paddingBottom: 'clamp(16px, 3vh, 48px)' }}>
        {/* Header */}
        <AnimatedHeader />

        {/* Subtitle & Carousel Area */}
        <AnimatedCarouselSection title="Keşfetmek İçin Bir Sure Seçin">
          <div className="w-full flex justify-center">
            <SurahCarousel>
              {surahs.map((surah, index) => (
                <SurahCard key={surah.id} surah={surah} index={index} />
              ))}
            </SurahCarousel>
          </div>
        </AnimatedCarouselSection>
      </div>
    </main>
  );
}
