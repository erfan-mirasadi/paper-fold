import { buildSheet, SHEET_FRAME_SVGS, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 48-52 — "when is this promise?", and the answer, copied off the handwritten
// sheet. (53 and 54 finish the passage, but the page draws them at the head of
// the next sheet — see ./53-68.)
//
// ONE QUESTION OVER A GRID OF ANSWERS. The question runs the full width of the
// page on its own, under its own arc; everything under it is the answer, laid
// out TWO ACROSS AND THREE DOWN inside one frame, each ayah bridged to the one
// beside it:
//
//     ╭──────────────── 48 ─────────────────╮   when is this promise?
//     ╭─────────────────────────────────────╮
//     │      50  ──  49                     │   the shout · no will, no return
//     │      52  ──  51                      │   the trumpet · woe to us
//     ╰─────────────────────────────────────╯
//
// Right reads first, as everywhere in this family, so a row reads 49 · 50 and
// the page reads straight down the pairs.
//
// ONE AYAH IS ONE CAPSULE here, so every capsule prints its own number. They
// are whole ayahs in half a row, so each is broken to THREE LINES by hand —
// all four of them, even where two would fit, because a capsule is fitted to
// its own text and a short ayah on two lines would set half again as large as
// the long one bridged to it. `tr` and `en` are broken to the same count as `ar`,
// which is what sets the capsule's height.
// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin4852",
  key: "yasin4852",
  title: "YÂSÎN: 48-52",
  heroSubtitle: "suresi 48-52",
  sayfa: 443,
  // UNCHANGED from the sheet this replaces. The atlas centres this one in the
  // left half of its row (`align: "leftHalf"`), so its width is what puts it
  // where it is on the big paper — change it and the sheet moves.
  paperWidth: 2.1,

  rows: [
    // ── The question, alone across the top ────────────────────────────────
    {
      ayah: 48,
      tone: "maroon",
      arScale: 0.89,
      latScale: 0.9,
      ar: "وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ",
      tr: "“Doğru söylüyorsanız, bu vaat ne zaman?” diyorlar.",
      en: "They say, “When is this promise, if you are truthful?”",
    },

    // ── The first blast: what it catches, and what it takes away ──────────
    {
      pair: [
        {
          ayah: 49,
          tone: "white",
          heightLines: 3,
          arScale: 0.64,
          latScale: 0.81,
          ar: "مَا يَنظُرُونَ إِلَّا صَيْحَةً\nوَاحِدَةً تَأْخُذُهُمْ وَهُمْ يَخِصِّمُونَ",
          tr: "Tek bir sesten başkasını beklemiyorlar;\no ses onları çekişirken yakalar.",
          en: "They await but one shout,\nwhich will seize them as they are still arguing.",
        },
        {
          ayah: 50,
          tone: "white",
          heightLines: 3,
          arScale: 0.68,
          latScale: 0.82,
          ar: "فَلَا يَسْتَطِيعُونَ تَوْصِيَةً\nوَلَا إِلَىٰ أَهْلِهِمْ يَرْجِعُونَ",
          tr: "Ne bir vasiyette bulunabilirler,\nne de ailelerine dönebilirler.",
          en: "They can leave no will,\nnor return to their own people.",
        },
      ],
    },

    // ── The trumpet: what it raises, and what they say when it does ───────
    {
      pair: [
        {
          ayah: 51,
          tone: "white",
          heightLines: 3,
          arScale: 0.68,
          latScale: 0.81,
          ar: "وَنُفِخَ فِي الصُّورِ فَإِذَا هُم مِّنَ\nالْأَجْدَاثِ إِلَىٰ رَبِّهِمْ يَنسِلُونَ",
          tr: "Sûr'a üflenir; bir de bakarsın\nkabirlerinden Rablerine koşuyorlar.",
          en: "The trumpet is blown, and at once they\nhasten from the graves to their Lord.",
        },
        {
          ayah: 52,
          tone: "white",
          heightLines: 3,
          arScale: 0.69,
          latScale: 0.75,
          ar: "قَالُوا يَا وَيْلَنَا مَن بَعَثَنَا مِن مَّرْقَدِنَا\nهَٰذَا مَا وَعَدَ الرَّحْمَٰنُ وَصَدَقَ الْمُرْسَلُونَ",
          tr: "“Eyvah! Bizi yattığımız yerden kim kaldırdı?” —\nRahmân'ın vaadi, doğruymuş.",
          en: "“Woe to us! Who raised us from our resting place?”\nThe Merciful's promise, true.",
        },
      ],
    },

  ],

  frames: [
    {
      from: 0,
      to: 2,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      pad: 0,
      w: 1.58,
      h: 0.97,
    },
    // The arc over the question, and the frame around everything that answers
    // it — the two enclosures the sheet is drawn with.
    { from: 0, to: 0, tone: "rose" },
    {
      from: 1,
      to: 2,
      tone: "band",
    },
  ],
};

export const SHEET = buildSheet(SPEC);
