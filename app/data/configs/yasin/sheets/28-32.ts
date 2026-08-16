import { buildSheet, SHEET_FRAME_SVGS, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin2832",
  key: "yasin2832",
  title: "YÂSÎN: 28-32",
  heroSubtitle: "suresi 28-32",
  sayfa: 442,

  rows: [
    {
      ayah: 28,
      gapAfter: 0.05,
      arScale: 0.71,
      latScale: 0.61,
      tone: "cream",
      ar: "وَمَا أَنزَلْنَا عَلَىٰ قَوْمِهِ مِن بَعْدِهِ\nمِن جُندٍ مِّنَ السَّمَاءِ وَمَا كُنَّا مُنزِلِينَ",
      tr: "Ondan sonra kavminin üzerine\ngökten bir ordu indirmedik; indirecek de değildik.",
      en: "After him We sent down no army from heaven\nagainst his people, nor were We to send one.",
    },
    {
      ayah: 29,
      arScale: 0.7,
      latScale: 0.78,
      tone: "green",
      ar: "إِن كَانَتْ إِلَّا صَيْحَةً وَاحِدَةً\nفَإِذَا هُمْ خَامِدُونَ",
      tr: "Sadece korkunç bir ses oldu;\nbir de baktılar, sönüp gitmişler.",
      en: "It was but one shout —\nand at once they were extinguished.",
    },
    {
      ayah: 30,
      arScale: 0.73,
      latScale: 0.63,
      tone: "white",
      ar: "يَا حَسْرَةً عَلَى الْعِبَادِ\nمَا يَأْتِيهِم مِّن رَّسُولٍ إِلَّا كَانُوا بِهِ يَسْتَهْزِئُونَ",
      tr: "Yazık şu kullara!\nKendilerine gelen her elçiyle mutlaka alay ettiler.",
      en: "Alas for the servants!\nNo messenger came to them but they mocked him.",
    },
    {
      ayah: 31,
      arScale: 0.71,
      latScale: 0.41,
      tone: "white",
      ar: "أَلَمْ يَرَوْا كَمْ أَهْلَكْنَا قَبْلَهُم مِّنَ الْقُرُونِ\nأَنَّهُمْ إِلَيْهِمْ لَا يَرْجِعُونَ",
      tr: "Görmediler mi, onlardan önce nice nesilleri helâk ettik;\nartık onlara dönmüyorlar.",
      en: "Have they not seen how many generations We destroyed before them,\nnone of whom return to them?",
    },
    {
      ayah: 32,
      arScale: 0.79,
      latScale: 0.65,
      tone: "green",
      ar: "وَإِن كُلٌّ لَّمَّا جَمِيعٌ لَّدَيْنَا مُحْضَرُونَ",
      tr: "Hepsi de toplanıp huzurumuza getirileceklerdir.",
      en: "And all of them will be brought before Us together.",
    },
  ],

  frames: [
    // The page-wide enclosure uses the pale overall frame; the 29-32 group
    // uses the surah's shared pink inner frame.
    {
      from: 0,
      to: 4,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      offsetY: -0.47,
      h: 1.05,
    },
    {
      from: 1,
      to: 4,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: 0.015,
      w: 0.9,
      h: 0.82,
      offsetY: -0.298,
    },
  ],
};

// ---------------------------------------------------------------------------
// 33-36 — the dead earth. Copied off the handwritten sheet, which does NOT
// stack these four ayahs: it breaks each one into its phrases and lays the
// phrases inside an ONION of ovals, so the page reads as one round growing
// thing — earth, seed, fruit, and then the pairs of everything.
//
// A long phrase takes a whole row; two short ones sit beside each other. Only
// the LAST fragment of an ayah carries its number, exactly as on the sheet.

export const SHEET = buildSheet(SPEC);
