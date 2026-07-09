"use client";

import { useEffect } from "react";

/**
 * Only fires when the ROOT layout itself throws — it replaces <html>/<body>
 * entirely, so it can't rely on globals.css tokens (that stylesheet may not
 * even be mounted) and uses inline, hardcoded styles instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "24px",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.5,
            margin: 0,
          }}
        >
          Critical Error
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 300, margin: 0, maxWidth: 480 }}>
          Quran Patterns failed to load
        </h1>
        <p style={{ maxWidth: 420, fontSize: 14, opacity: 0.7, margin: 0 }}>
          Something went badly wrong while loading the app. Reloading usually fixes this.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(237,237,237,0.3)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 500,
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
