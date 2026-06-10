"use client";

/**
 * SurahCard — interactive card linking to a Surah visualization.
 * Must be a Client Component because it uses mouse event handlers.
 *
 * NOTE: Only plain serializable display data is passed as props — the full
 * SurahEntry (which contains functions like computeFoldYPositions) must NOT
 * cross the Server → Client boundary.
 */

import Link from "next/link";
import { useState } from "react";

/** Serializable subset of SurahEntry safe to pass across the RSC boundary */
export interface SurahCardData {
  id: string;
  displayName: string;
  arabicName: string;
  reference: string;
}

// Accent palette — cycles by card index
const ACCENTS = [
  { bg: "rgba(196,150,59,0.08)",  border: "rgba(196,150,59,0.3)",  dot: "#C4963B" },
  { bg: "rgba(94,115,103,0.08)",  border: "rgba(94,115,103,0.3)",  dot: "#5E7367" },
  { bg: "rgba(124,140,176,0.08)", border: "rgba(124,140,176,0.3)", dot: "#7c8cb0" },
];

interface SurahCardProps {
  surah: SurahCardData;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/surahs/${surah.id}`}
      id={`surah-link-${surah.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: "1.1rem",
        padding: "1.6rem 1.75rem",
        background: accent.bg,
        border: `1px solid ${accent.border}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.14)"
          : "0 4px 24px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px) scale(1.015)" : "none",
        transition:
          "transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.28s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient stripe */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${accent.dot}, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Arabic name + status dot */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "0.9rem",
        }}
      >
        <span
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2rem)",
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 500,
            color: "var(--overlay-text)",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
          lang="ar"
          dir="rtl"
        >
          {surah.arabicName}
        </span>

        <span
          aria-hidden="true"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: accent.dot,
            marginTop: "0.35rem",
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${accent.border}`,
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            transform: hovered ? "scale(1.25)" : "scale(1)",
          }}
        />
      </div>

      {/* English name */}
      <p
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "var(--overlay-text)",
          margin: "0 0 0.3rem 0",
          letterSpacing: "-0.01em",
        }}
      >
        {surah.displayName}
      </p>

      {/* Reference */}
      <p
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: "0.78rem",
          fontWeight: 400,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--overlay-text)",
          opacity: 0.5,
          margin: "0 0 1.25rem 0",
        }}
      >
        {surah.reference}
      </p>

      {/* CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: accent.dot,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: "0.8rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transition: "gap 0.25s ease",
        }}
      >
        <span>Open visualization</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
