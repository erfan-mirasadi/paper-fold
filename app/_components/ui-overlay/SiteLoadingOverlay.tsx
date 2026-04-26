"use client";

import type { CSSProperties } from "react";

interface SiteLoadingOverlayProps {
  isDarkMode?: boolean;
}

export function SiteLoadingOverlay({
  isDarkMode = false,
}: SiteLoadingOverlayProps) {
  const textColor = isDarkMode ? "rgba(241,246,255,0.96)" : "#0F1218";
  const mutedText = isDarkMode
    ? "rgba(241,246,255,0.56)"
    : "rgba(15,18,24,0.58)";
  const accent = isDarkMode ? "rgba(241,246,255,0.96)" : "#0F1218";
  const glow = isDarkMode ? "rgba(210,228,255,0.55)" : "rgba(35,42,55,0.24)";

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "transparent",
        color: textColor,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        backdropFilter: "blur(16px) saturate(125%)",
        WebkitBackdropFilter: "blur(16px) saturate(125%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="quran-fold-loader"
          style={
            {
              "--loader-accent": accent,
              "--loader-glow": glow,
            } as CSSProperties
          }
        >
          <i />
          <i />
          <i />
          <b />
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.01em",
            textShadow: isDarkMode
              ? "0 1px 18px rgba(210,228,255,0.34)"
              : "0 1px 18px rgba(255,255,255,0.78)",
          }}
        >
          Loading...
        </div>
      </div>

      <style jsx>{`
        .quran-fold-loader {
          position: relative;
          width: 92px;
          height: 92px;
          transform-style: preserve-3d;
          perspective: 520px;
          filter: drop-shadow(0 18px 30px var(--loader-glow));
        }

        .quran-fold-loader i {
          position: absolute;
          inset: 12px;
          border: 1.4px solid transparent;
          border-top-color: var(--loader-accent);
          border-right-color: color-mix(
            in srgb,
            var(--loader-accent) 54%,
            transparent
          );
          border-radius: 999px;
          opacity: 0.92;
          transform-style: preserve-3d;
          --orbit-x: 68deg;
          --orbit-y: 0deg;
          --orbit-start: 0deg;
          animation: quran-fold-orbit 1.45s cubic-bezier(0.55, 0, 0.45, 1)
            infinite;
        }

        .quran-fold-loader i:nth-child(1) {
          --orbit-x: 68deg;
          --orbit-y: 0deg;
          --orbit-start: 0deg;
        }

        .quran-fold-loader i:nth-child(2) {
          inset: 18px;
          opacity: 0.68;
          animation-duration: 1.95s;
          animation-direction: reverse;
          --orbit-x: 62deg;
          --orbit-y: 58deg;
          --orbit-start: 46deg;
        }

        .quran-fold-loader i:nth-child(3) {
          inset: 26px;
          opacity: 0.48;
          animation-duration: 2.35s;
          --orbit-x: 74deg;
          --orbit-y: -50deg;
          --orbit-start: 92deg;
        }

        .quran-fold-loader b {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--loader-accent);
          box-shadow:
            0 0 18px var(--loader-glow),
            0 0 42px var(--loader-glow);
          transform: translate(-50%, -50%);
          animation: quran-fold-core 1.45s ease-in-out infinite;
        }

        @keyframes quran-fold-orbit {
          from {
            transform: rotateX(var(--orbit-x)) rotateY(var(--orbit-y))
              rotateZ(var(--orbit-start));
          }
          to {
            transform: rotateX(var(--orbit-x)) rotateY(var(--orbit-y))
              rotateZ(calc(var(--orbit-start) + 360deg));
          }
        }

        @keyframes quran-fold-core {
          0%,
          100% {
            opacity: 0.48;
            transform: translate(-50%, -50%) scale(0.72);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @supports not (color: color-mix(in srgb, white, transparent)) {
          .quran-fold-loader i {
            border-right-color: rgba(255, 255, 255, 0.38);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .quran-fold-loader i,
          .quran-fold-loader b {
            animation-duration: 3.6s;
          }
        }
      `}</style>
    </div>
  );
}
