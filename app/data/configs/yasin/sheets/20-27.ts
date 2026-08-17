import { buildSheet, SHEET_FRAME_SVGS, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin2027",
  key: "yasin2027",
  title: "YÂSÎN: 20-27",
  heroSubtitle: "suresi 20-27",
  sayfa: 441,
  contentStartY: -0.246,
  capsuleWidthScale: 1.05,

  // ── THE LINK ACROSS THE PAGE ───────────────────────────────────────────
  // Every other bracket in this surah joins two ayahs inside ONE frame. This
  // one does the opposite: it runs from the man's arrival (20 · 21, the top
  // section) to what is said to him at the end (26 · 27, the bottom section),
  // straight past the four capsules of his speech in between. It is anchored on
  // ayah 21 and ayah 26 — the inner edge of each section — so the bow's whole
  // body lies in the gap between them and passes the split row on the way.
  //
  // Same treatment as the 1-12 sheet's ring: nisa36Config's twisted arrow, one
  // side only, tip as tall as the capsules, rule in world units.
  //
  // `pair` is BLOCK indices, and a SPLIT ROW emits its RIGHT column first:
  //   20→0  21→1  22→2  23→3  24→4  25→5  26→6  27→7
  // Add a row and these all move; print them, do not count them.
  curveColors: [
    {
      pair: [1, 6], // ayah 21 ▸ ayah 26, section to section
      color: "#B0504D",
      fillColor: "#F6EDE8",
      curveSide: "left",
      // It bows out to x ≈ 0.06 from a capsule edge at 0.293 — far wider than
      // any bracket on the ring sheets, because this one has the whole left
      // margin of the page to itself and has to read as spanning the sheet
      // rather than hugging a group.
      bowGap: 0.31,
      innerBowGap: 0.29,
      inwardOffset: 0,
      tipThickness: 0.127, // == both capsules' own height
      topAnchorYOffset: 0.07,
      bottomAnchorYOffset: -0.065,
      topAnchorXOffset: 0.052,
      bottomAnchorXOffset: 0.14,
      lineWidthWorld: 0.0038,
      opacity: 0.55,
      shape: "arrow",
      arrowHeadLength: 0.09,
      arrowHeadWidth: 0.085,
      twist: true,
      twistT: 0.6,
    },
    // The CENTER colour — see SheetSpec.curveColors. It MU2ST stay transparent
    // here: the four capsules of the split row are narrow enough that their
    // `horizontalInset` comes out positive, so each one is `isPushedIn` and
    // would take a bracket of its own.
    { color: "transparent", fillColor: "transparent" },
  ],

  rows: [
    {
      ayah: 20,
      tone: "white",
      width: 1.15,
      heightLines: 1.5,
      gapAfter: 0.008,
      arScale: 0.67,
      latScale: 0.59,
      ar: "وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَىٰ قَالَ يَا قَوْمِ اتَّبِعُوا الْمُرْسَلِينَ",
      tr: "Şehrin öbür ucundan bir adam koşarak geldi: “Ey kavmim, gönderilen elçilere uyun.”",
      en: "A man came running from the far end of the city: “O my people, follow the messengers.”",
    },
    {
      ayah: 21,
      tone: "white",
      width: 1.15,
      heightLines: 1.5,
      gapAfter: 0.01,
      arScale: 0.82,
      latScale: 0.45,
      ar: "اتَّبِعُوا مَن لَّا يَسْأَلُكُمْ أَجْرًا وَهُم مُّهْتَدُونَ",
      tr: "“Sizden bir ücret istemeyenlere uyun; onlar doğru yol üzeredir.”",
      en: "“Follow those who ask no wage of you; they are rightly guided.”",
    },
    {
      // The right column reads first — it is the man's reason
      inwardShift: -0.03,
      gapAfter: -0.01,
      offsetY: 0.02,
      right: [
        {
          ayah: 22,
          tone: "cream",
          width: 1.15,
          heightLines: 3.25,
          arScale: 0.7,
          latScale: 0.28,
          ar: "وَمَا لِيَ لَا أَعْبُدُ الَّذِي\nفَطَرَنِي وَإِلَيْهِ تُرْجَعُونَ",
          tr: "“Beni yaratana niçin kulluk etmeyeyim?\nO'na döndürüleceksiniz.”",
          en: "“Why should I not worship the One who made me?\nTo Him you return.”",
        },
        {
          ayah: 23,
          tone: "lav",
          width: 1.15,
          heightLines: 3.25,
          arScale: 0.6,
          latScale: 0.21,
          ar: "أَأَتَّخِذُ مِن دُونِهِ آلِهَةً إِن\nيُرِدْنِ الرَّحْمَٰنُ بِضُرٍّ لَّا تُغْنِ\nعَنِّي شَفَاعَتُهُمْ شَيْئًا وَلَا يُنقِذُونِ",
          tr: "“O'ndan başka ilah mı edineyim? Rahmân bana zarar dilese\nşefaatleri işe yaramaz, beni kurtaramazlar.”",
          en: "“Shall I take gods besides Him? If the Merciful wills me harm\ntheir pleading avails nothing, nor can they save me.”",
        },
      ],
      left: [
        {
          ayah: 24,
          tone: "cream",
          width: 1.15,
          heightLines: 3.25,
          arScale: 0.71,
          latScale: 0.42,
          ar: "إِنِّي إِذًا\nلَّفِي ضَلَالٍ مُّبِينٍ",
          tr: "“İşte o zaman\napaçık bir sapkınlıkta olurum.”",
          en: "“Then I would be\nin clear error.”",
        },
        {
          ayah: 25,
          tone: "lav",
          width: 1.15,
          heightLines: 3.25,
          arScale: 0.72,
          latScale: 0.63,
          ar: "إِنِّي آمَنتُ\nبِرَبِّكُمْ فَاسْمَعُونِ",
          tr: "“Ben Rabbinize inandım;\nbeni dinleyin.”",
          en: "“I have believed in your\nLord, so hear me.”",
        },
      ],
    },
    {
      ayah: 26,
      tone: "white",
      width: 1.15,
      heightLines: 1.5,
      gapAfter: 0.008,
      arScale: 0.87,
      latScale: 0.65,
      ar: "قِيلَ ادْخُلِ الْجَنَّةَ قَالَ يَا لَيْتَ قَوْمِي يَعْلَمُونَ",
      tr: "“Cennete gir” denildi. “Keşke kavmim bilseydi” dedi:",
      en: "It was said: “Enter the Garden.” He said: “Would that my people knew”",
    },
    {
      ayah: 27,
      tone: "white",
      width: 1.15,
      heightLines: 1.5,
      arScale: 0.89,
      latScale: 0.65,
      ar: "بِمَا غَفَرَ لِي رَبِّي وَجَعَلَنِي مِنَ الْمُكْرَمِينَ",
      tr: "“Rabbimin beni bağışladığını ve ikram edilenlerden kıldığını.”",
      en: "“how my Lord forgave me and made me one of the honoured.”",
    },
  ],

  frames: [
    {
      from: 0,
      to: 4,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      w: 1.1,
      h: 1.47,
      offsetY: -0.63,
    },
    {
      from: 0,
      to: 1,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      w: 1.05,
      offsetY: -0.12,
    },
    {
      from: 2,
      to: 2,
      tone: "band",
      w: 1.01,
    },
    {
      from: 3,
      to: 4,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      w: 1.05,
      offsetY: -0.12,
    },
  ],
};

// ---------------------------------------------------------------------------
// 28-32 — one shout, and the regret over the servants.
//
// The handwritten sheet draws this one as an ONION, not a stack: three
// stadium-ended ovals inside one another, the way 7 … 11 are drawn on the
// 1-12 sheet. The shape is the argument again — 28 and 32 answer each other
// (no army was sent down / all of them are brought before Us), 29 and 31
// answer each other (one shout, and they were still / how many generations
// before them), and 30 sits alone at the centre: "alas for the servants".
//
//   ╭─────────────── 28 … 32 ───────────────╮
//   │  ┌─────────────── 28 ──────────────┐   │  no army came down
//   │ ╭──────────── 29 … 31 ───────────╮     │
//   │ │  ┌──────────── 29 ───────────┐  │    │  one shout — and they were still
//   │ │ ╭──────── 30 · 31 ────────╮   │      │
//   │ │ │  ┌────── 30 ─────┐      │   │      │  alas for the servants
//   │ │ │  └───── 31 ─────┘       │   │      │  how many generations before
//   │ │ ╰─────────────────────────╯   │      │
//   │ ╰────────────────────────────────╯     │
//   │  └─────────────── 32 ─────────────┘    │  all are brought before Us
//   ╰────────────────────────────────────────╯

export const SHEET = buildSheet(SPEC);
