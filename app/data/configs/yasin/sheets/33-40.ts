import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 33-40 — the earth and the sky, drawn as a ROSETTE inside one circle.
//
// 33-36 IS THE ROSETTE PROPER, copied off the handwritten sheet: each of those
// four ayahs gets its own petal. 37-40 — the night, the sun, the moon, and
// everything in orbit — are a FIFTH PETAL, built the same way, holding four
// whole ayahs instead of one ayah's four fragments:
//
//              ╭─────────── circle ───────────╮
//              │      ╭──────  33  ──────╮     │   the earth revived
//              │  ╭──  35  ──╮ ╭──  34  ──╮    │   the fruit · the gardens
//              │      ╰──────  36  ──────╯     │   all the pairs
//              │      ╭──────  37  ──────╮     │   the night
//              │      │   39  ──  38     │     │   the moon · the sun
//              │      ╰──────  40  ──────╯     │   all of it in orbit
//              ╰──────────────────────────────╯
//
// A 33-36 PETAL IS BUILT THE SAME WAY EVERY TIME: a line across the top, TWO
// CAPSULES BRIDGED BY A CONNECTOR through the middle, and a line across the
// bottom. The pair is the widest part, which is what makes the group read as a
// lens rather than a stack — the phrase that splits in two sits where the
// mandorla would be widest. There, ONE AYAH IS THREE CAPSULES and only the LAST
// fragment carries the number, as on the sheet.
//
// IN THE SKY PETAL ONE AYAH IS ONE CAPSULE, so every one of them carries its
// own number. They are long, so their text is broken across lines by hand, and
// `tr` and `en` are broken to the same count as `ar` — `ar` is what sets the
// capsule's height, and a translation left on one line would be fitted to that
// one line and set tiny.
// ---------------------------------------------------------------------------

/**
 * All four petals come out the SAME size. The middle row splits its width in
 * two, so the top and bottom rows take half of theirs — then every lens is one
 * column wide and the rosette is regular, four equal petals around a centre.
 */
const PETAL = 0.5;

/**
 * Air each petal keeps around itself — the gap that separates 33 from the
 * 34 · 35 band, and that band from 36. THIS is the number that moves the top
 * and bottom petals towards the centre of the rosette: turn it down and they
 * close in, up and they spread. Three petal frames meet at each of the two
 * boundaries, so the gap there is three times this.
 */
const PETAL_PAD = 0.01;

const SPEC: SheetSpec = {
  id: "yasin3340",
  key: "yasin3340",
  title: "YÂSÎN: 33-40",
  heroSubtitle: "suresi 33-40",
  sayfa: 442,
  paperWidth: 2.3,
  capsuleWidthScale: 0.7,
  capsuleHeightScale: 0.7,

  rows: [
    // ── Lens 1 (top) — ayah 33 ───────────────────────────────────────────
    {
      ayah: 33,
      noNumber: true,
      tone: "green",
      width: PETAL,
      arScale: 0.61,
      latScale: 0.55,
      ar: "وَآيَةٌ لَّهُمُ الْأَرْضُ الْمَيْتَةُ",
      tr: "Ölü toprak onlar için bir delildir:",
      en: "The dead earth is a sign for them:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.62,
          ar: "أَحْيَيْنَاهَا",
          tr: "onu dirilttik,",
          en: "We revived it,",
        },
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.44,
          ar: "وَأَخْرَجْنَا مِنْهَا حَبًّا",
          tr: "ondan taneler çıkardık,",
          en: "and brought grain from it,",
        },
      ],
    },
    {
      ayah: 33,
      tone: "green",
      width: PETAL,
      arScale: 0.56,
      latScale: 0.89,
      ar: "فَمِنْهُ يَأْكُلُونَ",
      tr: "ondan yiyorlar.",
      en: "and of it they eat.",
    },

    // ── Lenses 2 and 3 (right · left) — ayahs 34 and 35 ──────────────────
    {
      ratio: 0.5,
      right: [
        {
          ayah: 34,
          noNumber: true,
          tone: "green",
          arScale: 0.69,
          latScale: 0.66,
          ar: "وَجَعَلْنَا فِيهَا جَنَّاتٍ",
          tr: "Orada bahçeler var ettik,",
          en: "In it We made gardens,",
        },
        {
          pair: [
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              arScale: 0.51,
              latScale: 0.73,
              ar: "مِّن نَّخِيلٍ",
              tr: "hurmadan",
              en: "of palm",
            },
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              arScale: 0.57,
              latScale: 0.63,
              ar: "وَأَعْنَابٍ",
              tr: "ve üzümden",
              en: "and vine",
            },
          ],
        },
        {
          ayah: 34,
          tone: "green",
          arScale: 0.69,
          latScale: 0.58,
          ar: "وَفَجَّرْنَا فِيهَا مِنَ الْعُيُونِ",
          tr: "içinden pınarlar fışkırttık.",
          en: "and made springs gush forth.",
        },
      ],
      left: [
        {
          ayah: 35,
          noNumber: true,
          tone: "green",
          arScale: 0.56,
          latScale: 0.58,
          ar: "لِيَأْكُلُوا مِن ثَمَرِهِ",
          tr: "Ürününden yesinler diye —",
          en: "That they may eat its fruit —",
        },
        {
          pair: [
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              arScale: 0.76,
              latScale: 0.44,
              ar: "وَمَا عَمِلَتْهُ",
              tr: "oysa onu yapan",
              en: "yet it was not made",
            },
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              arScale: 0.6,
              latScale: 0.5,
              ar: "أَيْدِيهِمْ",
              tr: "elleri değil.",
              en: "by their hands.",
            },
          ],
        },
        {
          ayah: 35,
          tone: "green",
          arScale: 0.6,
          latScale: 0.64,
          ar: "أَفَلَا يَشْكُرُونَ",
          tr: "Hâlâ şükretmezler mi?",
          en: "Will they not give thanks?",
        },
      ],
    },

    // ── Lens 4 — ayah 36 ────────────────────────────────────────────────
    {
      ayah: 36,
      noNumber: true,
      tone: "green",
      width: PETAL,
      arScale: 0.59,
      latScale: 0.49,
      ar: "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا",
      tr: "Bütün çiftleri yaratanı tesbih ederim:",
      en: "Glory to Him who created all the pairs:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          arScale: 0.61,
          latScale: 0.44,
          ar: "مِمَّا تُنبِتُ الْأَرْضُ",
          tr: "toprağın bitirdiklerinden,",
          en: "of what the earth grows,",
        },
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.46,
          ar: "وَمِنْ أَنفُسِهِمْ",
          tr: "kendi canlarından,",
          en: "of themselves,",
        },
      ],
    },
    {
      ayah: 36,
      tone: "green",
      width: PETAL,
      arScale: 0.72,
      latScale: 0.59,
      ar: "وَمِمَّا لَا يَعْلَمُونَ",
      tr: "ve bilmediklerinden.",
      en: "and of what they do not know.",
    },
    // ── Lens 5 (bottom) — the sky, 37-40 ────────────────────────────────
    //
    // Same three lines as every petal on this page: one across the top, a
    // BRIDGED PAIR through the middle, one across the bottom. The only
    // difference is what a capsule holds — a whole ayah here, a fragment in the
    // petals around it — so every one of these four prints its own number, and
    // its two middle capsules carry four lines where the others carry one.
    {
      ayah: 37,
      tone: "lav",
      width: PETAL,
      arScale: 0.5,
      latScale: 0.5,
      ar: "وَآيَةٌ لَّهُمُ اللَّيْلُ نَسْلَخُ مِنْهُ\nالنَّهَارَ فَإِذَا هُم مُّظْلِمُونَ",
      tr: "Gece de bir delildir: ondan gündüzü\nsıyırırız, karanlıkta kalıverirler.",
      en: "The night is a sign: We strip the day\nfrom it, and they are in darkness.",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 38,
          tone: "blue",
          arScale: 0.42,
          latScale: 0.41,
          ar: "وَالشَّمْسُ تَجْرِي\nلِمُسْتَقَرٍّ لَّهَا\nذَٰلِكَ تَقْدِيرُ\nالْعَزِيزِ الْعَلِيمِ",
          tr: "Güneş kendi\nyörüngesinde akar;\nbu, Azîz ve\nAlîm'in takdiridir.",
          en: "The sun runs to\nits resting place:\nthe decree of the\nMighty, the Knowing.",
        },
        {
          ayah: 39,
          tone: "blue",
          arScale: 0.43,
          latScale: 0.4,
          ar: "وَالْقَمَرَ قَدَّرْنَاهُ\nمَنَازِلَ حَتَّىٰ\nعَادَ كَالْعُرْجُونِ\nالْقَدِيمِ",
          tr: "Aya da konaklar\ntakdir ettik; sonunda\nkuru bir hurma\ndalına döner.",
          en: "For the moon We\nordained phases,\ntill it returns like\nan old palm stalk.",
        },
      ],
    },
    {
      ayah: 40,
      tone: "lav",
      width: PETAL,
      arScale: 0.44,
      latScale: 0.49,
      ar: "لَا الشَّمْسُ يَنبَغِي لَهَا أَن\nتُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ\nالنَّهَارِ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
      tr: "Ne güneş aya yetişebilir,\nne gece gündüzü geçebilir;\nher biri bir yörüngede yüzer.",
      en: "The sun may not overtake the moon,\nnor the night outrun the day:\neach swims in an orbit.",
    },
  ],

  frames: [
    // The circle that holds the whole rosette — the only frame that is DRAWN.
    {
      from: 0,
      to: 9,
      tone: "circle",
      label: "Toprak ve gök\n(33-40. ayet)",
      labelSide: "left",
    },
    // One petal per ayah, `none` rather than `lens`: the mandorla outline is
    // gone, but the grouping it stood for is not. Each petal still gets its own
    // width, its own air from the petals around it, and its own drag zone and
    // camera target.
    // `pad` well under the nesting level's own: three of these frames meet at
    // each band boundary (one ending, two starting side by side), and without a
    // rim between them there is nothing there for the default air to clear.
    { from: 0, to: 2, tone: "none", pad: PETAL_PAD },
    { from: 3, to: 3, tone: "none", side: "right", pad: PETAL_PAD },
    { from: 3, to: 3, tone: "none", side: "left", pad: PETAL_PAD },
    { from: 4, to: 6, tone: "none", pad: PETAL_PAD },
    { from: 7, to: 9, tone: "none", pad: PETAL_PAD },
  ],
};

export const SHEET = buildSheet(SPEC);
