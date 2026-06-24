"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface SurahCardData {
  id: string;
  displayName: string;
  arabicName: string;
  reference: string;
}

// Accent palette — cycles by card index
const ACCENTS = [
  {
    bg: "rgba(196,150,59,0.08)",
    border: "rgba(196,150,59,0.3)",
    dot: "#C4963B",
  },
  {
    bg: "rgba(94,115,103,0.08)",
    border: "rgba(94,115,103,0.3)",
    dot: "#5E7367",
  },
  {
    bg: "rgba(124,140,176,0.08)",
    border: "rgba(124,140,176,0.3)",
    dot: "#7c8cb0",
  },
];

const MotionLink = motion.create(Link);

interface SurahCardProps {
  surah: SurahCardData;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <MotionLink
      href={`/surahs/${surah.id}`}
      id={`surah-link-${surah.id}`}
      className="group block relative overflow-hidden transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:scale-[1.015] shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
      initial={{ opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
      style={{
        textDecoration: "none",
        borderRadius: "1.1rem",
        padding: "1.6rem 1.75rem",
        background: accent.bg,
        border: `1px solid ${accent.border}`,
        cursor: "pointer",
      }}
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
          className="transition-transform duration-[250ms] ease-out group-hover:scale-125"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: accent.dot,
            marginTop: "0.35rem",
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${accent.border}`,
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
        className="flex items-center gap-2 font-semibold tracking-[0.08em] uppercase transition-all duration-[250ms] ease-in-out group-hover:gap-3"
        style={{
          color: accent.dot,
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: "0.8rem",
        }}
      >
        <span>Open</span>
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
    </MotionLink>
  );
}
