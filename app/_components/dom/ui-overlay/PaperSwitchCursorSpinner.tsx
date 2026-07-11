"use client";

/**
 * PaperSwitchCursorSpinner — the loading indicator for paper switches.
 *
 * CSS `cursor: wait`/`progress` is unreliable cross-platform — macOS Chrome/
 * Safari has no native "busy" cursor icon to map it to, so it silently has
 * no visible effect at all on that platform. Instead, this renders a small
 * spinning ring that tracks the real mouse position, sitting just beside the
 * normal arrow — the simplest possible "default device loading" look,
 * working identically on every OS.
 */

import { useEffect, useRef } from "react";
import { usePaperStore } from "../../../stores/usePaperStore";

export function PaperSwitchCursorSpinner() {
  // Hide the spinner the moment the incoming page is visually on screen
  // (newPaperRevealed) — the switch may still be mechanically "in flight"
  // while the outgoing sheet finishes gliding off, but nothing is loading
  // anymore and a spinner over an arrived page reads as a stall.
  const showSpinner = usePaperStore(
    (s) => s.isSwitching && !s.newPaperRevealed,
  );
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSpinner) return;

    const onMove = (e: PointerEvent) => {
      const el = elRef.current;
      if (!el) return;
      el.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [showSpinner]);

  if (!showSpinner) return null;

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        pointerEvents: "none",
        zIndex: 999999,
        willChange: "transform",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "2px solid rgba(120,120,120,0.35)",
          borderTopColor: "rgba(60,60,60,0.85)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          animation: "paper-switch-spinner-rotate 0.7s linear infinite",
        }}
      />
      <style>{`
        @keyframes paper-switch-spinner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
