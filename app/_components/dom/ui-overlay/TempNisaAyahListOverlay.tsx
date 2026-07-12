"use client";

// TEMPORARY overlay — flowing Mushaf-style Arabic text, left side, Nisa 36 only.
// Safe to delete: self-contained, not imported anywhere except SurahViewer.tsx.

import { Fragment } from "react";
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

  const verses = activeTextData.ar.section2.colorGroups
    .flatMap((group) => group.verses)
    .filter((v) => v.text)
    .sort((a, b) => a.number - b.number);

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
        background: "#FAF7F2",
        border: "1px solid rgba(196,150,59,0.4)",
        borderRadius: 18,
        boxShadow: "0 10px 34px rgba(0,0,0,0.2)",
        padding: "22px 24px",
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
            paddingBottom: 10,
            borderBottom: "1px solid rgba(196,150,59,0.3)",
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
        {verses.map((v) => (
          <Fragment key={v.number}>
            {v.text}
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
              {toArabicNumber(v.number)}
            </span>{" "}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
