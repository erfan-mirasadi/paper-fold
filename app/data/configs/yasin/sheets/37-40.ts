import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin3740",
  key: "yasin3740",
  title: "YÂSÎN: 37-40",
  heroSubtitle: "suresi 37-40",
  noteTitle: "Yâsîn: 37-40",
  sayfa: 442,
  paperWidth: 1.9,

  rows: [
    {
      ayah: 37,
      tone: "lav",
      ar: "وَآيَةٌ لَّهُمُ اللَّيْلُ نَسْلَخُ مِنْهُ النَّهَارَ فَإِذَا هُم مُّظْلِمُونَ",
      tr: "Gece de onlar için bir delildir: ondan gündüzü sıyırırız, karanlıkta kalıverirler.",
      en: "The night is a sign for them: We strip the day from it, and they are in darkness.",
    },
    {
      ayah: 38,
      tone: "cream",
      ar: "وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ",
      tr: "Güneş kendi yörüngesinde akar gider. Bu, Azîz ve Alîm olanın takdiridir.",
      en: "The sun runs to its resting place. That is the decree of the Mighty, the Knowing.",
    },
    {
      ayah: 39,
      tone: "cream",
      ar: "وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ حَتَّىٰ عَادَ كَالْعُرْجُونِ الْقَدِيمِ",
      tr: "Aya da konaklar takdir ettik; sonunda kuru bir hurma dalına döner.",
      en: "For the moon We ordained phases, till it returns like an old palm stalk.",
    },
    {
      ayah: 40,
      tone: "lav",
      ar: "لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ النَّهَارِ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
      tr: "Ne güneş aya yetişebilir, ne gece gündüzü geçebilir. Her biri bir yörüngede yüzer.",
      en: "The sun may not overtake the moon, nor the night outrun the day: each swims in an orbit.",
    },
  ],

  frames: [
    { from: 0, to: 3, tone: "outer" },
    { from: 1, to: 2, tone: "band", label: "Güneş ve Ay\n(38-39. ayet)", labelSide: "right" },
  ],
};

export const SHEET = buildSheet(SPEC);
