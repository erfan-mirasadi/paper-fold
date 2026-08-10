import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 69-82 — not poetry, the cattle, and the bones brought back. Copied off the
// handwritten page, which lays it out as one band over two columns of six:
//
//   ╭─────────────── not poetry (69-70) ───────────────╮
//   │  69                                              │
//   │  70                                              │
//   ╰──────────────────────────────────────────────────╯
//   ╭──── the bones (77-82) ────╮ ╭──── the cattle (71-76) ────╮
//   │  77                       │ │  71                        │
//   │  78                       │ │      73  ──  72            │
//   │      80  ──  79           │ │      75  ──  74            │
//   │  81                       │ │  76                        │
//   │  82                       │ │                            │
//   ╰───────────────────────────╯ ╰────────────────────────────╯
//
// SIX AYAHS TO A COLUMN, as the sheet counts them in its own margin. The two
// columns are the two answers: what was made for them (the cattle they own and
// cannot make), and what will be made of them (the bones He raises). Right
// reads first.
//
// A BRIDGED PAIR is one moment said twice — 72 with 73, 74 with 75, 79 with 80
// — and the connector bar between them says so; everything else stands on its
// own line.
//
// THE BOX IS THE SAME AS 53-68's. This sheet and that one sit side by side in
// the atlas, so they are drawn to one size: 2.310 x 1.897. Width comes free
// (same `paperWidth`, same nesting), height is what `BLOCK_PAD` is tuned for —
// see it below, and re-check it against the emitter if the text here changes.
// ---------------------------------------------------------------------------

/**
 * Air each block keeps around itself. It is not a taste setting: it is the one
 * number that makes this sheet's outer frame exactly as tall as 53-68's, so the
 * two read as a pair on the big paper. THREE frame edges meet where the top
 * block ends and the two columns begin, so the sheet's height moves three times
 * as fast as this does. `npm run emit:frames` prints the height it lands on.
 */
const BLOCK_PAD = 0.0483;

const SPEC: SheetSpec = {
  id: "yasin6982",
  key: "yasin6982",
  title: "YÂSÎN: 69-82",
  heroSubtitle: "suresi 69-82",
  sayfa: 445,
  // UNCHANGED — the atlas addresses this sheet by its right edge, so its width
  // is what puts it where it is.
  paperWidth: 2.9,

  rows: [
    // ── Not poetry: a reminder, and a warning ─────────────────────────────
    {
      ayah: 69,
      tone: "gold",
      ar: "وَمَا عَلَّمْنَاهُ الشِّعْرَ\nوَمَا يَنبَغِي لَهُ إِنْ هُوَ\nإِلَّا ذِكْرٌ وَقُرْآنٌ مُّبِينٌ",
      tr: "Ona şiir öğretmedik,\nona yaraşmaz da. O ancak\nbir öğüt, apaçık bir Kur'an.",
      en: "We did not teach him poetry,\nnor would it suit him. It is only\na reminder, and a clear Qur'an —",
    },
    {
      ayah: 70,
      tone: "gold",
      ar: "لِّيُنذِرَ مَن كَانَ حَيًّا\nوَيَحِقَّ الْقَوْلُ\nعَلَى الْكَافِرِينَ",
      tr: "Diri olanı uyarsın\nve inkâr edenler üzerine\no söz hak olsun diye.",
      en: "to warn whoever is alive,\nand so that the word\ncomes due against the disbelievers.",
    },

    // ── What was made for them, against what will be made of them ─────────
    {
      right: [
        {
          ayah: 71,
          tone: "lav",
          ar: "أَوَلَمْ يَرَوْا أَنَّا\nخَلَقْنَا لَهُم مِّمَّا\nعَمِلَتْ أَيْدِينَا أَنْعَامًا\nفَهُمْ لَهَا\nمَالِكُونَ",
          tr: "Görmediler mi ki\nellerimizin yaptıklarından\nonlara davarlar yarattık;\nşimdi onlara\nsahip oluyorlar.",
          en: "Do they not see that We\nmade for them, of what\nOur hands have made,\ncattle — and so\nthey own them?",
        },
        {
          pair: [
            {
              ayah: 72,
              tone: "green",
              ar: "وَذَلَّلْنَاهَا لَهُمْ\nفَمِنْهَا رَكُوبُهُمْ\nوَمِنْهَا\nيَأْكُلُونَ",
              tr: "Onları kendilerine\nboyun eğdirdik; kimine\nbinerler, kiminden\nde yerler.",
              en: "We tamed them for\nthem: some they ride,\nand of some\nthey eat.",
            },
            {
              ayah: 73,
              tone: "green",
              ar: "وَلَهُمْ فِيهَا\nمَنَافِعُ وَمَشَارِبُ\nأَفَلَا\nيَشْكُرُونَ",
              tr: "Onlarda başka\nyararlar ve içecekler\nde var. Hâlâ\nşükretmezler mi?",
              en: "In them are other\nuses, and drink.\nWill they not\ngive thanks?",
            },
          ],
        },
        {
          pair: [
            {
              ayah: 74,
              tone: "blue",
              ar: "وَاتَّخَذُوا مِن دُونِ\nاللَّهِ آلِهَةً\nلَّعَلَّهُمْ\nيُنصَرُونَ",
              tr: "Allah'tan başka\ntanrılar edindiler —\nbelki yardım\ngörürler diye.",
              en: "They took gods\nbesides God, hoping\nthat they might\nbe helped.",
            },
            {
              ayah: 75,
              tone: "blue",
              ar: "لَا يَسْتَطِيعُونَ\nنَصْرَهُمْ وَهُمْ\nلَهُمْ جُندٌ\nمُّحْضَرُونَ",
              tr: "Onlara yardım\nedemezler; oysa\nkendileri onlar için\nhazır bir ordudur.",
              en: "They cannot help\nthem; yet they are\nan army brought\nup for them.",
            },
          ],
        },
        {
          ayah: 76,
          tone: "green",
          ar: "فَلَا يَحْزُنكَ\nقَوْلُهُمْ إِنَّا نَعْلَمُ\nمَا يُسِرُّونَ\nوَمَا\nيُعْلِنُونَ",
          tr: "Onların sözü seni\nüzmesin. Gizlediklerini\nde açığa\nvurduklarını da\nbiliyoruz.",
          en: "So let their words\nnot grieve you. We know\nwhat they hide\nand what\nthey declare.",
        },
      ],
      left: [
        {
          ayah: 77,
          tone: "blue",
          ar: "أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا\nخَلَقْنَاهُ مِن نُّطْفَةٍ\nفَإِذَا هُوَ خَصِيمٌ مُّبِينٌ",
          tr: "İnsan görmedi mi ki\nonu bir damla sudan yarattık —\nşimdi apaçık bir hasım kesildi.",
          en: "Does man not see that We\nmade him from a drop —\nand now he openly disputes?",
        },
        {
          ayah: 78,
          tone: "green",
          ar: "وَضَرَبَ لَنَا مَثَلًا\nوَنَسِيَ خَلْقَهُ قَالَ مَن\nيُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ",
          tr: "Kendi yaratılışını unutup\nbize bir örnek getirdi: “Çürümüş\nkemikleri kim diriltecek?” dedi.",
          en: "He makes a comparison for Us\nand forgets his own making:\n“Who revives bones once rotted?”",
        },
        {
          pair: [
            {
              ayah: 79,
              tone: "blue",
              ar: "قُلْ يُحْيِيهَا الَّذِي\nأَنشَأَهَا أَوَّلَ مَرَّةٍ\nوَهُوَ بِكُلِّ\nخَلْقٍ عَلِيمٌ",
              tr: "De ki: “Onları ilk\ndefa yaratan diriltir;\nO her yaratmayı\nbilendir.”",
              en: "Say: “He who made\nthem the first time\nrevives them; He knows\nevery making.”",
            },
            {
              ayah: 80,
              tone: "blue",
              ar: "الَّذِي جَعَلَ لَكُم\nمِّنَ الشَّجَرِ الْأَخْضَرِ\nنَارًا فَإِذَا أَنتُم\nمِّنْهُ تُوقِدُونَ",
              tr: "O ki size yeşil\nağaçtan ateş çıkardı —\nişte siz ondan\nyakıp duruyorsunuz.",
              en: "He who made for you\nfire out of the green\ntree — and from it\nyou kindle.",
            },
          ],
        },
        {
          ayah: 81,
          tone: "blue",
          ar: "أَوَلَيْسَ الَّذِي خَلَقَ السَّمَاوَاتِ\nوَالْأَرْضَ بِقَادِرٍ عَلَىٰ أَن يَخْلُقَ\nمِثْلَهُم بَلَىٰ وَهُوَ الْخَلَّاقُ الْعَلِيمُ",
          tr: "Gökleri ve yeri yaratan,\nonların benzerini yaratmaya gücü\nyetmez mi? Elbette — O Hallâk, Alîm.",
          en: "Is He who made the heavens\nand the earth not able to make\ntheir like? He is the Maker, the Knowing.",
        },
        {
          ayah: 82,
          tone: "gold",
          ar: "إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا\nأَن يَقُولَ لَهُ\nكُن فَيَكُونُ",
          tr: "Bir şeyi dilediğinde\nO'nun buyruğu, ona\n“Ol” demektir — o da olur.",
          en: "His command, when He wills\na thing, is only to say\nto it “Be” — and it is.",
        },
      ],
    },
  ],

  frames: [
    { from: 0, to: 2, tone: "outer" },
    {
      from: 0,
      to: 1,
      tone: "rose",
      pad: BLOCK_PAD,
      label: "Şiir değil\n(69-70. ayet)",
      labelSide: "right",
    },
    // The two columns of six. Both are drawn the same, as on the sheet, and a
    // one-column frame takes the row's own band, so they come out one size.
    {
      from: 2,
      to: 2,
      side: "right",
      tone: "band",
      pad: BLOCK_PAD,
      label: "Nimetler\n(71-76. ayet)",
      labelSide: "right",
    },
    {
      from: 2,
      to: 2,
      side: "left",
      tone: "band",
      pad: BLOCK_PAD,
      label: "Diriliş\n(77-82. ayet)",
      labelSide: "left",
    },
  ],
};

export const SHEET = buildSheet(SPEC);
