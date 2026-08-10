import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin2027",
  key: "yasin2027",
  title: "YÂSÎN: 20-27",
  heroSubtitle: "suresi 20-27",
  sayfa: 441,
  contentStartY: -0.246,

  rows: [
    {
      ayah: 20,
      tone: "maroon",
      ar: "وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَىٰ قَالَ يَا قَوْمِ اتَّبِعُوا الْمُرْسَلِينَ",
      tr: "Şehrin öbür ucundan bir adam koşarak geldi: “Ey kavmim, gönderilen elçilere uyun.”",
      en: "A man came running from the far end of the city: “O my people, follow the messengers.”",
    },
    {
      ayah: 21,
      tone: "white",
      ar: "اتَّبِعُوا مَن لَّا يَسْأَلُكُمْ أَجْرًا وَهُم مُّهْتَدُونَ",
      tr: "“Sizden bir ücret istemeyenlere uyun; onlar doğru yol üzeredir.”",
      en: "“Follow those who ask no wage of you; they are rightly guided.”",
    },
    {
      // The right column reads first — it is the man's reason
      right: [
        {
          ayah: 22,
          tone: "cream",
          ar: "وَمَا لِيَ لَا أَعْبُدُ الَّذِي فَطَرَنِي\nوَإِلَيْهِ تُرْجَعُونَ",
          tr: "“Beni yaratana niçin kulluk etmeyeyim?\nO'na döndürüleceksiniz.”",
          en: "“Why should I not worship the One who made me?\nTo Him you return.”",
        },
        {
          ayah: 23,
          tone: "cream",
          ar: "أَأَتَّخِذُ مِن دُونِهِ آلِهَةً إِن يُرِدْنِ الرَّحْمَٰنُ بِضُرٍّ\nلَّا تُغْنِ عَنِّي شَفَاعَتُهُمْ شَيْئًا وَلَا يُنقِذُونِ",
          tr: "“O'ndan başka ilah mı edineyim? Rahmân bana zarar dilese\nşefaatleri işe yaramaz, beni kurtaramazlar.”",
          en: "“Shall I take gods besides Him? If the Merciful wills me harm\ntheir pleading avails nothing, nor can they save me.”",
        },
      ],
      left: [
        {
          ayah: 24,
          tone: "lav",
          ar: "إِنِّي إِذًا\nلَّفِي ضَلَالٍ مُّبِينٍ",
          tr: "“İşte o zaman\napaçık bir sapkınlıkta olurum.”",
          en: "“Then I would be\nin clear error.”",
        },
        {
          ayah: 25,
          tone: "lav",
          ar: "إِنِّي آمَنتُ\nبِرَبِّكُمْ فَاسْمَعُونِ",
          tr: "“Ben Rabbinize inandım;\nbeni dinleyin.”",
          en: "“I have believed in your\nLord, so hear me.”",
        },
      ],
    },
    {
      ayah: 26,
      tone: "green",
      ar: "قِيلَ ادْخُلِ الْجَنَّةَ قَالَ يَا لَيْتَ قَوْمِي يَعْلَمُونَ",
      tr: "“Cennete gir” denildi. “Keşke kavmim bilseydi” dedi:",
      en: "It was said: “Enter the Garden.” He said: “Would that my people knew”",
    },
    {
      ayah: 27,
      tone: "green",
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
      src: "/yasin1319/all-section.svg",
      w: 1.06,
      h: 1.41,
      offsetY: -0.572,
    },
    {
      from: 0,
      to: 1,
      tone: "rose",
      label: "Çağrı\n(20-21. ayet)",
      labelSide: "right",
    },
    {
      from: 2,
      to: 2,
      tone: "band",
      label: "Delil\n(22-25. ayet)",
      labelSide: "left",
    },
    {
      from: 3,
      to: 4,
      tone: "rose",
      label: "Karşılık\n(26-27. ayet)",
      labelSide: "right",
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
