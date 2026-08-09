import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 33-36 — the dead earth, drawn as a ROSETTE, copied off the handwritten sheet.
//
// FOUR LENSES INSIDE ONE CIRCLE. Each ayah gets its own lens (a mandorla, two
// arcs meeting at a point); the four sit top, right, left and bottom inside one
// big circle:
//
//              ╭─────────── circle ───────────╮
//              │      ╭──────  33  ──────╮     │   the earth revived
//              │  ╭──  35  ──╮ ╭──  34  ──╮    │   the fruit · the gardens
//              │      ╰──────  36  ──────╯     │   all the pairs
//              ╰──────────────────────────────╯
//
// AND EVERY LENS IS BUILT THE SAME WAY: a line across the top, TWO CAPSULES
// BRIDGED BY A CONNECTOR through the middle, and a line across the bottom. The
// pair is the widest part of the lens, which is what makes the shape read as a
// lens rather than a stack — the phrase that splits in two sits where the
// mandorla is widest.
//
// THE TOP AND BOTTOM LINES ARE HALF-OVALS — the Tevbe:24 ayah model, arching
// UP at the top of a petal and DOWN at the bottom, so a petal tapers the way
// its lens does instead of ending on two flat bars. Only those four pairs of
// capsules are domed; the bridged pair through the middle stays a rectangle,
// because that is the widest line of the lens and has nothing to taper into.
//
// Only the LAST fragment of an ayah carries its number, as on the sheet.
// ---------------------------------------------------------------------------

/**
 * All four petals come out the SAME size. The middle row splits its width in
 * two, so the top and bottom rows take half of theirs — then every lens is one
 * column wide and the rosette is regular, four equal petals around a centre.
 */
const PETAL = 0.5;

const SPEC: SheetSpec = {
  id: "yasin3336",
  key: "yasin3336",
  title: "YÂSÎN: 33-36",
  heroSubtitle: "suresi 33-36",
  noteTitle: "Yâsîn: 33-36",
  sayfa: 442,
  paperWidth: 2.3,

  rows: [
    // ── Lens 1 (top) — ayah 33 ───────────────────────────────────────────
    {
      ayah: 33,
      noNumber: true,
      tone: "green",
      shape: "dome-up",
      width: PETAL,
      ar: "وَآيَةٌ لَّهُمُ الْأَرْضُ الْمَيْتَةُ",
      tr: "Ölü toprak onlar için bir delildir:",
      en: "The dead earth is a sign for them:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          ar: "أَحْيَيْنَاهَا",
          tr: "onu dirilttik,",
          en: "We revived it,",
        },
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          ar: "وَأَخْرَجْنَا مِنْهَا حَبًّا",
          tr: "ondan taneler çıkardık,",
          en: "and brought grain from it,",
        },
      ],
    },
    {
      ayah: 33,
      tone: "green",
      shape: "dome-down",
      width: PETAL,
      ar: "فَمِنْهُ يَأْكُلُونَ",
      tr: "ondan yiyorlar.",
      en: "and of it they eat.",
    },

    // ── Lenses 2 and 3 (right · left) — ayahs 34 and 35 ──────────────────
    {
      ratio: 0.5,
      right: [
        {
          ayah: 34,
          noNumber: true,
          tone: "green",
          shape: "dome-up",
          ar: "وَجَعَلْنَا فِيهَا جَنَّاتٍ",
          tr: "Orada bahçeler var ettik,",
          en: "In it We made gardens,",
        },
        {
          pair: [
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              ar: "مِّن نَّخِيلٍ",
              tr: "hurmadan",
              en: "of palm",
            },
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              ar: "وَأَعْنَابٍ",
              tr: "ve üzümden",
              en: "and vine",
            },
          ],
        },
        {
          ayah: 34,
          tone: "green",
          shape: "dome-down",
          ar: "وَفَجَّرْنَا فِيهَا مِنَ الْعُيُونِ",
          tr: "içinden pınarlar fışkırttık.",
          en: "and made springs gush forth.",
        },
      ],
      left: [
        {
          ayah: 35,
          noNumber: true,
          tone: "green",
          shape: "dome-up",
          ar: "لِيَأْكُلُوا مِن ثَمَرِهِ",
          tr: "Ürününden yesinler diye —",
          en: "That they may eat its fruit —",
        },
        {
          pair: [
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              ar: "وَمَا عَمِلَتْهُ",
              tr: "oysa onu yapan",
              en: "yet it was not made",
            },
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              ar: "أَيْدِيهِمْ",
              tr: "elleri değil.",
              en: "by their hands.",
            },
          ],
        },
        {
          ayah: 35,
          tone: "maroon",
          shape: "dome-down",
          ar: "أَفَلَا يَشْكُرُونَ",
          tr: "Hâlâ şükretmezler mi?",
          en: "Will they not give thanks?",
        },
      ],
    },

    // ── Lens 4 (bottom) — ayah 36 ────────────────────────────────────────
    {
      ayah: 36,
      noNumber: true,
      tone: "green",
      shape: "dome-up",
      width: PETAL,
      ar: "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا",
      tr: "Bütün çiftleri yaratanı tesbih ederim:",
      en: "Glory to Him who created all the pairs:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          ar: "مِمَّا تُنبِتُ الْأَرْضُ",
          tr: "toprağın bitirdiklerinden,",
          en: "of what the earth grows,",
        },
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          ar: "وَمِنْ أَنفُسِهِمْ",
          tr: "kendi canlarından,",
          en: "of themselves,",
        },
      ],
    },
    {
      ayah: 36,
      tone: "green",
      shape: "dome-down",
      width: PETAL,
      ar: "وَمِمَّا لَا يَعْلَمُونَ",
      tr: "ve bilmediklerinden.",
      en: "and of what they do not know.",
    },
  ],

  frames: [
    // The circle that holds the whole rosette.
    { from: 0, to: 6, tone: "circle", label: "Toprak\n(33-36. ayet)", labelSide: "left" },
    // One lens per ayah. The middle row's two lenses take a side each.
    { from: 0, to: 2, tone: "lens" },
    { from: 3, to: 3, tone: "lens", side: "right" },
    { from: 3, to: 3, tone: "lens", side: "left" },
    { from: 4, to: 6, tone: "lens" },
  ],
};

export const SHEET = buildSheet(SPEC);
