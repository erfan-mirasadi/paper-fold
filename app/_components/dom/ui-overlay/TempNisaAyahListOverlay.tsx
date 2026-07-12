"use client";

// TEMPORARY overlay — plain-text Arabic ayah list, left side, Nisa 36 only.
// Safe to delete: self-contained, not imported anywhere except SurahViewer.tsx.

import { useStoryStore } from "@/app/stores/useStoryStore";

export function TempNisaAyahListOverlay() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const activeTextData = useStoryStore((s) => s.activeTextData);

  if (activeConfig.id !== "nisa36") return null;

  const verses = activeTextData.ar.section2.colorGroups
    .flatMap((group) => group.verses)
    .filter((v) => v.text)
    .sort((a, b) => a.number - b.number);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 16,
        transform: "translateY(-50%)",
        zIndex: 90,
        width: 260,
        maxHeight: "80vh",
        overflowY: "auto",
        padding: 16,
        background: "rgba(255,255,255,0.94)",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        pointerEvents: "auto",
      }}
    >
      {verses.map((v) => (
        <div
          key={v.number}
          dir="rtl"
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: "#222",
            textAlign: "right",
            marginBottom: 12,
          }}
        >
          {v.text}
          <span style={{ fontSize: 12, color: "#999", marginInlineStart: 6 }}>
            ({v.number})
          </span>
        </div>
      ))}
    </div>
  );
}
