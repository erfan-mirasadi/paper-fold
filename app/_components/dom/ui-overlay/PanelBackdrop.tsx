"use client";

import { CSSProperties } from "react";

// ── PanelBackdrop — the soft gradient wash behind a reading panel ───────────
//
// `side` determines the direction:
//   "left"  — gradient pours in from the left edge, fades right  (script sidebar)
//   "right" — gradient pours in from the right edge, fades left  (tafsir panel)
//
// `accent` is the current highlight color, applied directly with no caching.
export function PanelBackdrop({
  accent,
  side = "left",
}: {
  accent?: string | null;
  side?: "left" | "right";
}) {
  return (
    <div
      aria-hidden
      className={`panel-backdrop panel-backdrop--${side}`}
      style={
        {
          "--pb-accent": accent ?? "transparent",
          "--pb-accent-on": accent ? 1 : 0,
        } as CSSProperties
      }
    />
  );
}
