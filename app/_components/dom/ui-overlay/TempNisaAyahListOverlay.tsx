"use client";

// TEMPORARY overlay — flowing Mushaf-style Arabic text, left side, Nisa 36 only.
// Safe to delete: self-contained, not imported anywhere except SurahViewer.tsx.
//
// Only large screens (lg+, ~1024px and up) are the real target — the paper's
// on-screen position/size is what this has to stay clear of, and vw-based
// sizing (not fixed breakpoint jumps) is what keeps it lined up as the
// window gets wider on those screens.

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
      className="fixed top-[46%] -translate-y-1/2 z-[90] pointer-events-auto
        left-6 w-[150px]
        lg:left-[5vw] lg:w-[16vw]"
    >
      {surahLabel && (
        <div
          dir="rtl"
          className="text-center text-[10px] lg:text-[clamp(13px,1vw,20px)]"
          style={{
            fontFamily: '"QuranFont", serif',
            color: "#C4963B",
            letterSpacing: 1,
            marginBottom: 18,
          }}
        >
          {surahLabel}
        </div>
      )}

      <p
        dir="rtl"
        className="text-[12px] lg:text-[clamp(16px,1.6vw,30px)]"
        style={{
          margin: 0,
          textAlign: "right",
          fontFamily: '"QuranFont", serif',
          lineHeight: 2.3,
          color: "#333333",
          overflowWrap: "break-word",
        }}
      >
        {fullAyahText}{" "}
        <span
          className="w-[1.5em] h-[1.5em] text-[0.5em]"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 8px",
            border: "1px solid #C4963B",
            borderRadius: "50%",
            color: "#C4963B",
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
