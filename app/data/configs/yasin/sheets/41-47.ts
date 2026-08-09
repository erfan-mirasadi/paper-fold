import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin4147",
  key: "yasin4147",
  title: "YÂSÎN: 41-47",
  heroSubtitle: "suresi 41-47",
  noteTitle: "Yâsîn: 41-47",
  sayfa: 443,
  paperWidth: 2.7,

  rows: [
    {
      ayah: 41,
      tone: "blue",
      ar: "وَآيَةٌ لَّهُمْ أَنَّا حَمَلْنَا ذُرِّيَّتَهُمْ فِي الْفُلْكِ الْمَشْحُونِ",
      tr: "Onlar için bir delil de şudur: zürriyetlerini dolu gemide taşıdık.",
      en: "A sign for them: We carried their offspring in the laden ship.",
    },
    {
      ayah: 42,
      tone: "blue",
      ar: "وَخَلَقْنَا لَهُم مِّن مِّثْلِهِ مَا يَرْكَبُونَ",
      tr: "Onlar için, bindikleri benzerlerini de yarattık.",
      en: "And We made for them the like of it, to ride upon.",
    },
    {
      ayah: 43,
      tone: "maroon",
      ar: "وَإِن نَّشَأْ نُغْرِقْهُمْ فَلَا صَرِيخَ لَهُمْ وَلَا هُمْ يُنقَذُونَ",
      tr: "Dilesek onları boğardık; ne bir imdatları olurdu ne de kurtarılırlardı.",
      en: "If We willed, We could drown them: no cry for help, and no rescue.",
    },
    {
      ayah: 44,
      tone: "cream",
      ar: "إِلَّا رَحْمَةً مِّنَّا وَمَتَاعًا إِلَىٰ حِينٍ",
      tr: "Ancak bizden bir rahmet ve bir süreye kadar yararlanma olarak.",
      en: "Except as a mercy from Us, and enjoyment for a time.",
    },
    {
      ayah: 45,
      tone: "white",
      ar: "وَإِذَا قِيلَ لَهُمُ اتَّقُوا مَا بَيْنَ أَيْدِيكُمْ وَمَا خَلْفَكُمْ لَعَلَّكُمْ تُرْحَمُونَ",
      tr: "Onlara “önünüzdekinden ve arkanızdakinden sakının, umulur ki merhamet olunursunuz” denildiğinde…",
      en: "When they are told, “Beware of what lies before you and behind you, that you may receive mercy”…",
    },
    {
      ayah: 46,
      tone: "maroon",
      ar: "وَمَا تَأْتِيهِم مِّنْ آيَةٍ مِّنْ آيَاتِ رَبِّهِمْ إِلَّا كَانُوا عَنْهَا مُعْرِضِينَ",
      tr: "Rablerinin ayetlerinden kendilerine gelen hiçbir ayet yoktur ki ondan yüz çevirmiş olmasınlar.",
      en: "No sign of their Lord's signs comes to them but they turn away from it.",
    },
    {
      ayah: 47,
      tone: "white",
      ar: "وَإِذَا قِيلَ لَهُمْ أَنفِقُوا مِمَّا رَزَقَكُمُ اللَّهُ قَالَ الَّذِينَ كَفَرُوا لِلَّذِينَ آمَنُوا أَنُطْعِمُ مَن لَّوْ يَشَاءُ اللَّهُ أَطْعَمَهُ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ مُّبِينٍ",
      tr: "“Allah'ın size verdiğinden infak edin” denildiğinde inkâr edenler inananlara şöyle der: “Allah dileseydi doyururdu; biz mi doyuralım? Siz apaçık bir sapkınlık içindesiniz.”",
      en: "When they are told, “Spend of what God has given you,” the disbelievers say to the believers: “Shall we feed one whom God could have fed? You are in nothing but clear error.”",
    },
  ],

  frames: [
    { from: 0, to: 6, tone: "outer" },
    { from: 0, to: 3, tone: "band", label: "Gemi\n(41-44. ayet)", labelSide: "right" },
    { from: 2, to: 3, tone: "inner", label: "Rahmet\n(43-44. ayet)", labelSide: "left" },
    { from: 4, to: 6, tone: "rose", label: "Yüz çevirme\n(45-47. ayet)", labelSide: "right" },
  ],
};

// ---------------------------------------------------------------------------
// 48-54 — "when is this promise?", and the two blasts that answer it.
//
// They ask for the hour; the sheet gives it to them twice. The first blast
// catches them mid-argument (49-50), the second raises them out of the graves
// (51-53), and ayah 54 stands outside both frames because it is the verdict,
// not the event: no soul is wronged today.

export const SHEET = buildSheet(SPEC);
