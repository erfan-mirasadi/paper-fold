import type { Metadata } from "next";
import { getAllSurahs } from "./data/surahDatabase";
import { SurahCard, type SurahCardData } from "./_components/dom/SurahCard";
import { ThemeToggleOverlay } from "./_components/dom/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/dom/ui-overlay/LanguageSwitchOverlay";

export const metadata: Metadata = {
  title: "Quran Patterns",
  description:
    "Explore the Quran through immersive 3D visualizations. Each Surah is a layered journey into meaning, structure, and beauty.",
};

export default function MenuPage() {
  const surahs = getAllSurahs();

  return (
    <main className="w-full min-h-screen bg-[#050907] text-[#ededed] overflow-x-hidden selection:bg-[#5E7367]/30">
      {/* ── Fixed Overlays ── */}
      <div className="fixed top-[clamp(8px,1vw,12px)] right-[16px] md:right-[24px] z-[100] flex flex-row-reverse md:flex-col items-center gap-0 pointer-events-none">
        <ThemeToggleOverlay />
        <LanguageSwitchOverlay />
      </div>



      {/* ── Hero Section ── */}
      <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        
        {/* Darkening Gradient Overlay for text readability & transition to next section */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#050907] via-[#050907]/80 to-transparent z-0 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 flex flex-col items-center mt-[-10vh]">
          <h1 
            style={{ 
              fontFamily: "var(--font-cormorant), serif",
              textShadow: "0 4px 24px rgba(0,0,0,0.5)"
            }}
            className="text-[2.5rem] leading-[1.1] md:text-7xl lg:text-[5.5rem] font-normal tracking-[-0.02em] text-[#EFEFEF] mb-6 max-w-4xl"
          >
            QuranPatterns
          </h1>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 z-10 flex flex-col items-center text-white/50 animate-bounce pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Surah List Section ── */}
      <section className="relative w-full pb-24 pt-8 px-4 md:px-8 flex flex-col items-center bg-[#050907] z-10">
        <div className="w-full max-w-[900px]">
          <header className="text-center mb-16">
            <h2 
              style={{ fontFamily: "var(--font-cormorant), serif" }}
              className="text-[2rem] md:text-[2.75rem] font-medium text-[#EFEFEF] mb-6"
            >
              Keşfetmek İçin<br/>Bir Sure Seçin
            </h2>

          </header>

          <nav
            aria-label="Available Surahs"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "1.5rem",
              width: "100%",
            }}
          >
            {surahs.map((surah, index) => {
              const cardData: SurahCardData = {
                id: surah.id,
                displayName: surah.displayName,
                arabicName: surah.arabicName,
                reference: surah.reference,
              };
              return <SurahCard key={surah.id} surah={cardData} index={index} />;
            })}
          </nav>
        </div>
      </section>
    </main>
  );
}
