import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin4854",
  key: "yasin4854",
  title: "YÂSÎN: 48-54",
  heroSubtitle: "suresi 48-54",
  noteTitle: "Yâsîn: 48-54",
  sayfa: 443,
  paperWidth: 2.1,

  rows: [
    {
      ayah: 48,
      tone: "white",
      ar: "وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ",
      tr: "“Doğru söylüyorsanız, bu vaat ne zaman?” diyorlar.",
      en: "They say, “When is this promise, if you are truthful?”",
    },
    {
      ayah: 49,
      tone: "maroon",
      ar: "مَا يَنظُرُونَ إِلَّا صَيْحَةً وَاحِدَةً تَأْخُذُهُمْ وَهُمْ يَخِصِّمُونَ",
      tr: "Onlar tek bir sesten başkasını beklemiyorlar; o ses onları çekişip dururken yakalayacak.",
      en: "They await but one shout, which will seize them as they argue.",
    },
    {
      ayah: 50,
      tone: "maroon",
      ar: "فَلَا يَسْتَطِيعُونَ تَوْصِيَةً وَلَا إِلَىٰ أَهْلِهِمْ يَرْجِعُونَ",
      tr: "Ne bir vasiyette bulunabilirler, ne de ailelerine dönebilirler.",
      en: "They will not be able to leave a will, nor return to their people.",
    },
    {
      ayah: 51,
      tone: "lav",
      ar: "وَنُفِخَ فِي الصُّورِ فَإِذَا هُم مِّنَ الْأَجْدَاثِ إِلَىٰ رَبِّهِمْ يَنسِلُونَ",
      tr: "Sûr'a üflenir; bir de bakarsın kabirlerinden Rablerine koşuyorlar.",
      en: "The trumpet is blown, and at once they hasten from the graves to their Lord.",
    },
    {
      ayah: 52,
      tone: "lav",
      ar: "قَالُوا يَا وَيْلَنَا مَن بَعَثَنَا مِن مَّرْقَدِنَا هَٰذَا مَا وَعَدَ الرَّحْمَٰنُ وَصَدَقَ الْمُرْسَلُونَ",
      tr: "“Eyvah! Bizi yattığımız yerden kim kaldırdı?” derler. “İşte Rahmân'ın vaadi; elçiler doğru söylemiş.”",
      en: "They say, “Woe to us! Who raised us from our resting place?” “This is what the Merciful promised; the messengers told the truth.”",
    },
    {
      ayah: 53,
      tone: "white",
      ar: "إِن كَانَتْ إِلَّا صَيْحَةً وَاحِدَةً فَإِذَا هُمْ جَمِيعٌ لَّدَيْنَا مُحْضَرُونَ",
      tr: "Sadece tek bir ses olur; hepsi birden huzurumuzda hazır edilirler.",
      en: "It is but one shout, and at once they are all brought before Us.",
    },
    {
      ayah: 54,
      tone: "green",
      ar: "فَالْيَوْمَ لَا تُظْلَمُ نَفْسٌ شَيْئًا وَلَا تُجْزَوْنَ إِلَّا مَا كُنتُمْ تَعْمَلُونَ",
      tr: "O gün hiç kimseye zerre kadar haksızlık edilmez; size ancak yaptıklarınızın karşılığı verilir.",
      en: "Today no soul is wronged in the least, and you are repaid only for what you did.",
    },
  ],

  frames: [
    { from: 0, to: 6, tone: "outer" },
    { from: 0, to: 2, tone: "rose", label: "Soru\n(48-50. ayet)", labelSide: "right" },
    { from: 3, to: 5, tone: "band", label: "Sûr\n(51-53. ayet)", labelSide: "left" },
  ],
};

// ---------------------------------------------------------------------------
// 55-68 — the Garden, and the court of the guilty. The first of the two BIG
// sheets, and the first laid out in two columns throughout: on a page this
// long the ayahs pair off, and the handwritten sheet reads them across before
// it reads them down.

export const SHEET = buildSheet(SPEC);
