/**
 * app/page.tsx — Main Menu (Server Component)
 *
 * Clean, premium index listing all available interactive Surah visualizations.
 * SurahCard is a Client Component to support hover interactivity.
 */

import type { Metadata } from "next";
import { getAllSurahs } from "./data/surahDatabase";
import { SurahCard, type SurahCardData } from "./_components/dom/SurahCard";

export const metadata: Metadata = {
  title: "Quran Patterns",
  description:
    "Explore the Quran through immersive 3D visualizations. Each Surah is a layered journey into meaning, structure, and beauty.",
};

export default function MenuPage() {
  const surahs = getAllSurahs();

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "var(--page-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient background glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(196,150,59,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Header ── */}
      <header
        style={{ textAlign: "center", marginBottom: "3.5rem", zIndex: 1 }}
      >
        <p
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
            letterSpacing: "0.35em",
            color: "var(--overlay-text)",
            opacity: 0.45,
            marginBottom: "0.75rem",
          }}
          aria-hidden="true"
        >
          ﷽
        </p>

        <h1
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "var(--overlay-text)",
            margin: 0,
          }}
        >
          Quran Patterns
        </h1>
      </header>

      {/* ── Surah card grid ── */}
      <nav
        aria-label="Available Surahs"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "1.25rem",
          width: "100%",
          maxWidth: "780px",
          zIndex: 1,
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
    </main>
  );
}
