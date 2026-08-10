import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 53-68 — the shout, the Garden, the guilty, and the fire. Fifteen ayahs on one
// sheet, copied off the handwritten page.
//
// THE PAGE IS THREE BLOCKS, and the middle one is where its whole argument is:
// the people of the Garden on the RIGHT, the guilty on the LEFT, side by side,
// so the two are read against each other.
//
//   ╭──────────────────────── the shout (53-54) ───────────────────────╮
//   │  53                                                              │
//   │  54                                                              │
//   ╰──────────────────────────────────────────────────────────────────╯
//   ╭──── the guilty (59-62) ────╮ ╭──── the Garden (55-58) ─────────╮
//   │  59                        │ │       56  ──  55                │
//   │  60                        │ │                                 │
//   │  61                        │ │       58  ──  57                │
//   │  62                        │ │                                 │
//   ╰───────────────────────────╯ ╰─────────────────────────────────╯
//   ╭──────────────────────── the fire (63-68) ────────────────────────╮
//   │       64  ──  63                                                 │
//   │  ╭──────────────────── 65 ─────────────────────────────────────╮ │
//   │  │  66                                                         │ │
//   │  │  67 · 68                                                    │ │
//   ╰──╰─────────────────────────────────────────────────────────────╯─╯
//
// TWO SHAPES OF GROUP, and they mean different things. Capsules SIDE BY SIDE
// are one moment said twice — 55 with 56, 57 with 58, 63 with 64 — and the
// connector bar between them says so. Capsules STACKED are a sequence: the
// guilty are told to stand apart (59), reminded of the covenant (60-61), and
// then charged with it (62), one after the other.
//
// THE TWO HALVES OF THAT BAND ARE THE SAME BOX. A whole-column frame takes the
// row's own band, so they cannot come out different heights — but a box the
// same size as its twin and half as full is worse than no twin at all, so the
// two are filled to match as well: FOUR single-line bars on the left against
// TWO rows of four-line capsules on the right, which stack to the same height.
// Every capsule in a column is the height of every other one in it. Change a
// line count on either side and the empty half comes straight back.
// ---------------------------------------------------------------------------

/**
 * Air each of the three blocks keeps around itself — well under the nesting
 * level's own 0.047. THREE frame edges meet at each band boundary (one block
 * ending, the two halves of the middle band starting), so the gap between two
 * blocks is three times this plus a row's air; at the default the blocks drift
 * apart and the sheet reads as three pages rather than one.
 */
const BLOCK_PAD = 0.025;

const SPEC: SheetSpec = {
  id: "yasin5368",
  key: "yasin5368",
  title: "YÂSÎN: 53-68",
  heroSubtitle: "suresi 53-68",
  noteTitle: "Yâsîn: 53-68",
  sayfa: 444,
  // UNCHANGED from the 55-68 sheet this replaces — the atlas addresses this
  // sheet by its right edge, so its width is what puts it where it is.
  paperWidth: 2.9,

  rows: [
    // ── The shout, and the verdict that follows it ────────────────────────
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
      tr: "O gün hiç kimseye zerre kadar haksızlık edilmez; ancak yaptığınız verilir.",
      en: "Today no soul is wronged in the least, and you are repaid only for what you did.",
    },

    // ── The Garden, against the guilty ────────────────────────────────────
    // RIGHT reads first, and it is the Garden: two bridged pairs, each pair one
    // moment said twice. LEFT is the guilty, and it is a stack, because what
    // happens to them happens in order.
    {
      right: [
        {
          pair: [
            {
              ayah: 55,
              tone: "green",
              ar: "إِنَّ أَصْحَابَ\nالْجَنَّةِ الْيَوْمَ\nفِي شُغُلٍ\nفَاكِهُونَ",
              tr: "O gün\ncennetlikler bir\nmeşguliyet içinde\nsevinirler.",
              en: "Today the\npeople of the\nGarden are busy\nin delight.",
            },
            {
              ayah: 56,
              tone: "green",
              ar: "هُمْ وَأَزْوَاجُهُمْ\nفِي ظِلَالٍ\nعَلَى الْأَرَائِكِ\nمُتَّكِئُونَ",
              tr: "Onlar ve eşleri\ngölgeler altında,\ntahtlara\nkurulmuş.",
              en: "They and their\nspouses are in\nshade, reclining\non couches.",
            },
          ],
        },
        {
          pair: [
            {
              ayah: 57,
              tone: "green",
              ar: "لَهُمْ فِيهَا\nفَاكِهَةٌ وَلَهُم\nمَّا\nيَدَّعُونَ",
              tr: "Orada meyveler\nonlarındır;\nistedikleri her\nşey onlarındır.",
              en: "They have fruit\nthere, and\nwhatever they\ncall for.",
            },
            {
              ayah: 58,
              tone: "cream",
              ar: "سَلَامٌ\nقَوْلًا\nمِّن رَّبٍّ\nرَّحِيمٍ",
              tr: "Selâm —\nRahîm olan\nRabden\nbir söz.",
              en: "“Peace” —\na word from\na Merciful\nLord.",
            },
          ],
        },
      ],
      left: [
        {
          ayah: 59,
          tone: "maroon",
          ar: "وَامْتَازُوا الْيَوْمَ أَيُّهَا الْمُجْرِمُونَ",
          tr: "“Ey suçlular, bugün şöyle ayrılın!”",
          en: "“Stand apart today, you guilty ones!”",
        },
        {
          ayah: 60,
          tone: "white",
          ar: "أَلَمْ أَعْهَدْ إِلَيْكُمْ يَا بَنِي آدَمَ أَن لَّا تَعْبُدُوا الشَّيْطَانَ إِنَّهُ لَكُمْ عَدُوٌّ مُّبِينٌ",
          tr: "“Ey Âdemoğulları, şeytana kulluk etmeyin diye size ahit vermedim mi?”",
          en: "“Children of Adam, did I not charge you not to serve Satan?”",
        },
        {
          ayah: 61,
          tone: "cream",
          ar: "وَأَنِ اعْبُدُونِي هَٰذَا صِرَاطٌ مُّسْتَقِيمٌ",
          tr: "“Bana kulluk edin; dosdoğru yol budur.”",
          en: "and that you serve Me? This is a straight path.”",
        },
        {
          ayah: 62,
          tone: "white",
          ar: "وَلَقَدْ أَضَلَّ مِنكُمْ جِبِلًّا كَثِيرًا أَفَلَمْ تَكُونُوا تَعْقِلُونَ",
          tr: "“O sizden birçok nesli saptırdı. Aklınızı kullanmadınız mı?”",
          en: "“He led astray many of you. Did you not use your minds?”",
        },
      ],
    },

    // ── The fire: named, then entered, then sealed ────────────────────────
    {
      pair: [
        {
          ayah: 63,
          tone: "maroon",
          ar: "هَٰذِهِ جَهَنَّمُ الَّتِي كُنتُمْ تُوعَدُونَ",
          tr: "“İşte size vaat edilen cehennem budur.”",
          en: "“This is the Hell you were promised.”",
        },
        {
          ayah: 64,
          tone: "maroon",
          ar: "اصْلَوْهَا الْيَوْمَ بِمَا كُنتُمْ تَكْفُرُونَ",
          tr: "“İnkâr edip durmanıza karşılık bugün girin oraya.”",
          en: "“Burn in it today, for you were disbelieving.”",
        },
      ],
    },
    {
      ayah: 65,
      tone: "lav",
      ar: "الْيَوْمَ نَخْتِمُ عَلَىٰ أَفْوَاهِهِمْ وَتُكَلِّمُنَا أَيْدِيهِمْ وَتَشْهَدُ أَرْجُلُهُم بِمَا كَانُوا يَكْسِبُونَ",
      tr: "Bugün ağızlarını mühürleriz; elleri bizimle konuşur, ayakları kazandıklarına şahitlik eder.",
      en: "Today We seal their mouths; their hands speak to Us, their feet testify to what they earned.",
    },
    {
      ayah: 66,
      tone: "lav",
      ar: "وَلَوْ نَشَاءُ لَطَمَسْنَا عَلَىٰ أَعْيُنِهِمْ فَاسْتَبَقُوا الصِّرَاطَ فَأَنَّىٰ يُبْصِرُونَ",
      tr: "Dilesek gözlerini silerdik; yola koşuşurlardı, ama nasıl göreceklerdi?",
      en: "Had We willed, We would have blotted their eyes; they would race for the path — how then would they see?",
    },
    {
      ayah: 67,
      tone: "white",
      ar: "وَلَوْ نَشَاءُ لَمَسَخْنَاهُمْ عَلَىٰ مَكَانَتِهِمْ فَمَا اسْتَطَاعُوا مُضِيًّا وَلَا يَرْجِعُونَ",
      tr: "Dilesek onları oldukları yerde dondururduk; ne ileri gidebilir ne dönebilirlerdi.",
      en: "Had We willed, We would have fixed them where they stand: unable to go on, unable to return.",
    },
    {
      ayah: 68,
      tone: "white",
      ar: "وَمَن نُّعَمِّرْهُ نُنَكِّسْهُ فِي الْخَلْقِ أَفَلَا يَعْقِلُونَ",
      tr: "Kime uzun ömür verirsek yaratılışını tersine çeviririz. Hâlâ akletmezler mi?",
      en: "Whom We grant long life, We reverse in creation. Will they not use their minds?",
    },
  ],

  frames: [
    { from: 0, to: 7, tone: "outer" },
    {
      from: 0,
      to: 1,
      tone: "rose",
      pad: BLOCK_PAD,
      label: "Sûr\n(53-54. ayet)",
      labelSide: "right",
    },
    // The two halves of the middle band, each bracketed on its own side. They
    // come out as TWINS — same width because the columns split the row evenly,
    // same height because both hold two rows of three-line capsules.
    {
      from: 2,
      to: 2,
      side: "right",
      tone: "band",
      pad: BLOCK_PAD,
      label: "Cennet\n(55-58. ayet)",
      labelSide: "right",
    },
    {
      from: 2,
      to: 2,
      side: "left",
      tone: "rose",
      pad: BLOCK_PAD,
      label: "Ayrılık\n(59-62. ayet)",
      labelSide: "left",
    },
    // The fire, and the sealing of the mouths inside it.
    {
      from: 3,
      to: 7,
      tone: "band",
      pad: BLOCK_PAD,
      label: "Cehennem\n(63-68. ayet)",
      labelSide: "left",
    },
    { from: 4, to: 7, tone: "inner" },
  ],
};

export const SHEET = buildSheet(SPEC);
