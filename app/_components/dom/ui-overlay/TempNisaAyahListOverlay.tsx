"use client";

// TEMPORARY overlay — flowing Mushaf-style Arabic text, left side, Nisa 36 only.
// Safe to delete: self-contained, not imported anywhere except SurahViewer.tsx.

import { useStoryStore } from "@/app/stores/useStoryStore";

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const toArabicNumber = (n: number) =>
  String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[+d])
    .join("");

export function TempNisaAyahListOverlay() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const activeTextData = useStoryStore((s) => s.activeTextData);

  if (activeConfig.id !== "nisa36") return null;

  // All chunks here (verses 1-12) are fragments of the SAME single ayah —
  // An-Nisa 36. There is only one real ayah number, shown once at the end.
  const fullAyahText = activeTextData.ar.section2.colorGroups
    .flatMap((group) => group.verses)
    .filter((v) => v.text)
    .sort((a, b) => a.number - b.number)
    .map((v) => v.text)
    .join(" ");

  const surahLabel = activeTextData.ar.section1.label;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 24,
        transform: "translateY(-50%)",
        zIndex: 90,
        width: 320,
        maxHeight: "82vh",
        overflowY: "auto",
        pointerEvents: "auto",
      }}
    >
      {surahLabel && (
        <div
          dir="rtl"
          style={{
            textAlign: "center",
            fontFamily: '"QuranFont", serif',
            fontSize: 15,
            color: "#C4963B",
            letterSpacing: 1,
            marginBottom: 14,
          }}
        >
          {surahLabel}
        </div>
      )}

      <p
        dir="rtl"
        style={{
          margin: 0,
          textAlign: "right",
          fontFamily: '"QuranFont", serif',
          fontSize: 21,
          lineHeight: 2.3,
          color: "#333333",
        }}
      >
        {fullAyahText}{" "}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            margin: "0 6px",
            border: "1px solid #C4963B",
            borderRadius: "50%",
            color: "#C4963B",
            fontSize: 11,
            lineHeight: 1,
            verticalAlign: "middle",
          }}
        >
          {toArabicNumber(36)}
        </span>
      </p>
    </div>
  );
}
