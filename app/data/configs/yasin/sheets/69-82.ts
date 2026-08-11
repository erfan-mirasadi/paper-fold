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
  capsuleWidthScale: 0.88,

  rows: [
    // ── Not poetry: a reminder, and a warning ─────────────────────────────
    {
      ayah: 69,
      tone: "gold",
      heightLines: 3,
      arScale: 0.9,
      latScale: 0.81,
      // The air the text keeps off this capsule's own rule, per side. Turn it
      // up to push the text in, negative to let it out past the border; see
      // `CapsuleSpec.arPad`, and `capsuleArPad` / `AR_PAD` for the sheet-wide
      // and surah-wide versions of the same number.
      arPad: 0.001,
      latPad: 0.01,
      ar: "وَمَا عَلَّمْنَاهُ الشِّعْرَ  يَنبَغِي لَهُ إِنْ ذِكْرٌ وَقُرْآنٌ مُّبِينٌ",
      tr: "Ona şiir öğretmedik,\nona yaraşmaz da. O ancak\nbir öğüt, apaçık bir Kur'an.",
      en: "We did not teach him poetry,\nnor would it suit him. It is only\na reminder, and a clear Qur'an —",
    },
    {
      ayah: 70,
      tone: "gold",
      heightLines: 3,
      arScale: 0.9,
      latScale: 0.82,
      ar: "لِّيُنذِرَ مَن كَانَ حَيًّا الْقَوْلُ الْكَافِرِينَ",
      tr: "Diri olanı uyarsın\nve inkâr edenler üzerine\no söz hak olsun diye.",
      en: "to warn whoever is alive,\nand so that the word\ncomes due against the disbelievers.",
    },

    // ── What was made for them, against what will be made of them ─────────
    {
      right: [
        {
          ayah: 71,
          tone: "lav",
          heightLines: 5,
          arScale: 0.75,
          latScale: 0.72,
          ar: "أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُم مِّمَّا\nعَمِلَتْ أَيْدِينَا أَنْعَامًا فَهُمْ لَهَا مَالِكُونَ",
          tr: "Görmediler mi ki ellerimizin yaptıklarından onlara\ndavarlar yarattık; şimdi onlara sahip oluyorlar.",
          en: "Do they not see that We made for them, of what\nOur hands have made, cattle — and so they own them?",
        },
        {
          pair: [
            {
              ayah: 72,
              tone: "green",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.62,
              ar: "وَذَلَّلْنَاهَا لَهُمْ\nفَمِنْهَا رَكُوبُهُمْ\nوَمِنْهَا يَأْكُلُونَ",
              tr: "Onları kendilerine boyun\neğdirdik; kimine binerler,\nkiminden de yerler.",
              en: "We tamed them for\nthem: some they ride,\nand of some they eat.",
            },
            {
              ayah: 73,
              tone: "green",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.7,
              ar: "وَلَهُمْ فِيهَا\nمَنَافِعُ وَمَشَارِبُ\nأَفَلَا يَشْكُرُونَ",
              tr: "Onlarda başka yararlar\nve içecekler de var.\nHâlâ şükretmezler mi?",
              en: "In them are other\nuses, and drink. Will\nthey not give thanks?",
            },
          ],
        },
        {
          pair: [
            {
              ayah: 74,
              tone: "blue",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.7,
              ar: "وَاتَّخَذُوا مِن\nدُونِ اللَّهِ آلِهَةً\nلَّعَلَّهُمْ يُنصَرُونَ",
              tr: "Allah'tan başka tanrılar\nedindiler — belki\nyardım görürler diye.",
              en: "They took gods besides\nGod, hoping that\nthey might be helped.",
            },
            {
              ayah: 75,
              tone: "blue",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.75,
              ar: "لَا يَسْتَطِيعُونَ\nنَصْرَهُمْ وَهُمْ لَهُمْ\nجُندٌ مُّحْضَرُونَ",
              tr: "Onlara yardım edemezler;\noysa kendileri onlar\niçin hazır bir ordudur.",
              en: "They cannot help them;\nyet they are an army\nbrought up for them.",
            },
          ],
        },
        {
          ayah: 76,
          tone: "green",
          heightLines: 5,
          arScale: 0.75,
          latScale: 0.72,
          ar: "فَلَا يَحْزُنكَ قَوْلُهُمْ إِنَّا\nنَعْلَمُ مَا يُسِرُّونَ وَمَا يُعْلِنُونَ",
          tr: "Onların sözü seni üzmesin. Gizlediklerini\nde açığa vurduklarını da biliyoruz.",
          en: "So let their words not grieve you.\nWe know what they hide and what they declare.",
        },
      ],
      left: [
        {
          ayah: 77,
          tone: "blue",
          heightLines: 3,
          arScale: 0.75,
          latScale: 0.76,
          ar: "أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا خَلَقْنَاهُ\nمِن نُّطْفَةٍ فَإِذَا هُوَ خَصِيمٌ مُّبِينٌ",
          tr: "İnsan görmedi mi ki onu bir damla sudan\nyarattık — şimdi apaçık bir hasım kesildi.",
          en: "Does man not see that We made him from\na drop — and now he openly disputes?",
        },
        {
          ayah: 78,
          tone: "green",
          heightLines: 3,
          arScale: 0.72,
          latScale: 0.82,
          ar: "وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ\nقَالَ مَن يُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ",
          tr: "Kendi yaratılışını unutup bize bir örnek getirdi:\n“Çürümüş kemikleri kim diriltecek?” dedi.",
          en: "He makes a comparison for Us and forgets his\nown making: “Who revives bones once rotted?”",
        },
        {
          pair: [
            {
              ayah: 79,
              tone: "blue",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.68,
              ar: "قُلْ يُحْيِيهَا الَّذِي\nأَنشَأَهَا أَوَّلَ مَرَّةٍ\nوَهُوَ بِكُلِّ خَلْقٍ عَلِيمٌ",
              tr: "De ki: “Onları ilk defa\nyaratan diriltir; O her\nyaratmayı bilendir.”",
              en: "Say: “He who made them the\nfirst time revives them;\nHe knows every making.”",
            },
            {
              ayah: 80,
              tone: "blue",
              heightLines: 4,
              arScale: 0.7,
              latScale: 0.64,
              ar: "الَّذِي جَعَلَ لَكُم مِّنَ\nالشَّجَرِ الْأَخْضَرِ نَارًا\nفَإِذَا أَنتُم مِّنْهُ تُوقِدُونَ",
              tr: "O ki size yeşil ağaçtan\nateş çıkardı — işte siz\nondan yakıp duruyorsunuz.",
              en: "He who made for you fire\nout of the green tree —\nand from it you kindle.",
            },
          ],
        },
        {
          ayah: 81,
          tone: "blue",
          heightLines: 3,
          arScale: 0.75,
          latScale: 0.75,
          ar: "أَوَلَيْسَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِقَادِرٍ\nعَلَىٰ أَن يَخْلُقَ مِثْلَهُم بَلَىٰ وَهُوَ الْخَلَّاقُ الْعَلِيمُ",
          tr: "Gökleri ve yeri yaratan, onların benzerini\nyaratmaya gücü yetmez mi? Elbette — O Hallâk, Alîm.",
          en: "Is He who made the heavens and the earth not able\nto make their like? He is the Maker, the Knowing.",
        },
        {
          ayah: 82,
          tone: "gold",
          heightLines: 3,
          arScale: 0.75,
          latScale: 0.75,
          ar: "إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا\nأَن يَقُولَ لَهُ كُن فَيَكُونُ",
          tr: "Bir şeyi dilediğinde O'nun buyruğu,\nona “Ol” demektir — o da olur.",
          en: "His command, when He wills a thing,\nis only to say to it “Be” — and it is.",
        },
      ],
    },
  ],

  frames: [
    {
      from: 0,
      to: 2,
      tone: "outer",
      src: "/yasin1319/all-section.svg",
      pad: 0,
      w: 2.16,
      h: 2.06,
    },
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
