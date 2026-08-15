import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin83",
  key: "yasin83",
  title: "YÂSÎN: 83",
  heroSubtitle: "suresi 83",
  sayfa: 445,
  paperWidth: 1.3,
  capsuleWidthScale: 2,

  rows: [
    {
      ayah: 83,
      tone: "maroon",
      heightLines: 3,
      arScale: 0.92,
      latScale: 0.82,
      ar: "فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ تُرْجَعُونَ",
      tr: "Her şeyin hükümranlığı elinde olanı tesbih ederim;\nO'na döndürüleceksiniz.",
      en: "Glory to Him in whose hand is the dominion of all things;\nto Him you are returned.",
    },
  ],

  frames: [{ from: 0, to: 0, tone: "outer" }],
};

export const SHEET = buildSheet(SPEC);
