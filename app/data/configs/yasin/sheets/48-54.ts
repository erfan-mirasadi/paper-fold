import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 48-54 — "when is this promise?", and the answer, copied off the handwritten
// sheet.
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
//     │      54  ──  53                      │   one shout · and no one wronged
//     ╰─────────────────────────────────────╯
//
// Right reads first, as everywhere in this family, so a row reads 49 · 50 and
// the page reads straight down the pairs.
//
// ONE AYAH IS ONE CAPSULE here, so every capsule prints its own number. They
// are whole ayahs in half a row, so each is broken to THREE LINES by hand —
// all six of them, even where two would fit, because a capsule is fitted to its
// own text and a short ayah on two lines would set half again as large as the
// long one bridged to it. `tr` and `en` are broken to the same count as `ar`,
// which is what sets the capsule's height.
// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin4854",
  key: "yasin4854",
  title: "YÂSÎN: 48-54",
  heroSubtitle: "suresi 48-54",
  noteTitle: "Yâsîn: 48-54",
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
          ar: "مَا يَنظُرُونَ إِلَّا\nصَيْحَةً وَاحِدَةً تَأْخُذُهُمْ\nوَهُمْ يَخِصِّمُونَ",
          tr: "Tek bir sesten başkasını\nbeklemiyorlar; o ses onları\nçekişirken yakalar.",
          en: "They await but one shout,\nwhich will seize them\nas they are still arguing.",
        },
        {
          ayah: 50,
          tone: "white",
          ar: "فَلَا يَسْتَطِيعُونَ\nتَوْصِيَةً وَلَا إِلَىٰ\nأَهْلِهِمْ يَرْجِعُونَ",
          tr: "Ne bir vasiyette\nbulunabilirler, ne de\nailelerine dönebilirler.",
          en: "They can leave no will,\nnor return to their\nown people.",
        },
      ],
    },

    // ── The trumpet: what it raises, and what they say when it does ───────
    {
      pair: [
        {
          ayah: 51,
          tone: "white",
          ar: "وَنُفِخَ فِي الصُّورِ فَإِذَا\nهُم مِّنَ الْأَجْدَاثِ\nإِلَىٰ رَبِّهِمْ يَنسِلُونَ",
          tr: "Sûr'a üflenir; bir de\nbakarsın kabirlerinden\nRablerine koşuyorlar.",
          en: "The trumpet is blown, and\nat once they hasten from\nthe graves to their Lord.",
        },
        {
          ayah: 52,
          tone: "white",
          ar: "قَالُوا يَا وَيْلَنَا مَن بَعَثَنَا\nمِن مَّرْقَدِنَا هَٰذَا مَا وَعَدَ\nالرَّحْمَٰنُ وَصَدَقَ الْمُرْسَلُونَ",
          tr: "“Eyvah! Bizi yattığımız\nyerden kim kaldırdı?” —\nRahmân'ın vaadi, doğruymuş.",
          en: "“Woe to us! Who raised us\nfrom our resting place?”\nThe Merciful's promise, true.",
        },
      ],
    },

    // ── The whole of it in one shout, and the verdict that follows ────────
    {
      pair: [
        {
          ayah: 53,
          tone: "white",
          ar: "إِن كَانَتْ إِلَّا\nصَيْحَةً وَاحِدَةً فَإِذَا هُمْ\nجَمِيعٌ لَّدَيْنَا مُحْضَرُونَ",
          tr: "Sadece tek bir ses olur;\nhepsi birden huzurumuzda\nhazır edilirler.",
          en: "It is but one shout, and\nat once they are all\nbrought before Us.",
        },
        {
          ayah: 54,
          tone: "white",
          ar: "فَالْيَوْمَ لَا تُظْلَمُ نَفْسٌ شَيْئًا\nوَلَا تُجْزَوْنَ إِلَّا\nمَا كُنتُمْ تَعْمَلُونَ",
          tr: "O gün hiç kimseye zerre\nkadar haksızlık edilmez;\nancak yaptığınız verilir.",
          en: "Today no soul is wronged\nin the least; you are repaid\nonly for what you did.",
        },
      ],
    },
  ],

  frames: [
    { from: 0, to: 3, tone: "outer" },
    // The arc over the question, and the frame around everything that answers
    // it — the two enclosures the sheet is drawn with.
    { from: 0, to: 0, tone: "rose", label: "Soru\n(48. ayet)", labelSide: "right" },
    {
      from: 1,
      to: 3,
      tone: "band",
      label: "Cevap\n(49-54. ayet)",
      labelSide: "left",
    },
  ],
};

export const SHEET = buildSheet(SPEC);
