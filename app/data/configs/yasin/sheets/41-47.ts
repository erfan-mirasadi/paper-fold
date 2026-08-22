import { buildSheet, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 41-47 — the laden ship, copied off the handwritten sheet.
//
// THREE BANDS ARE BRIDGED PAIRS, THE LAST IS ONE LONG AYAH. Every band but the
// last is two whole ayahs side by side, joined by the connector bar — the
// second answers the first, and the bar is what says so. Ayah 47 has no answer
// beside it: it is the retort itself, and it runs the whole width of the band.
//
//     ╭──────────── the ship (41-44) ────────────╮
//     │   42 ── 41    the ship, and its like     │
//     │   44 ── 43    drowning, and the mercy    │
//     ╰──────────────────────────────────────────╯
//     ╭──────── turning away (45-47) ────────────╮
//     │   46 ── 45    the warning, and the shrug │
//     │   ───── 47 ─────  "shall WE feed him?"   │
//     ╰──────────────────────────────────────────╯
//
// Right reads first, as everywhere in this family. Both frames keep their
// gold outlines, without a page-wide pink panel behind the bands.
//
// NARROW ON PURPOSE. This sheet sits in the far-left corner of the atlas, and
// its width is what sets the whole paper's width from that column — 1.7 puts
// its left edge exactly on the reach of the widest sheet below it, so it costs
// the paper nothing. That is why every ayah here is broken across lines by
// hand: half a row of a narrow sheet is a tall column, not a long bar, and the
// text has to be written to fit it. `ar` sets the capsule's height (one line's
// worth each), so `tr` and `en` are broken to the SAME number of lines — a
// translation left on one line would be fitted to that one line and set tiny.
// THREE LINES EVERYWHERE in the paired bands, even where two would do: a
// capsule is fitted to its own text, so a short ayah beside a long one on two
// lines comes out half again as large, and the band stops reading as one line
// of the page.
// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin4147",
  key: "yasin4147",
  title: "YÂSÎN: 41-47",
  heroSubtitle: "suresi 41-47",
  sayfa: 443,
  paperWidth: 1.7,

  rows: [
    // ── Band 1 — the ship (41) and the like of it (42) ────────────────────
    {
      pair: [
        {
          ayah: 41,
          tone: "creamAlt",
          heightLines: 3,
          arScale: 0.72,
          latScale: 0.81,
          ar: "وَآيَةٌ لَّهُمْ أَنَّا حَمَلْنَا\nذُرِّيَّتَهُمْ فِي الْفُلْكِ الْمَشْحُونِ",
          tr: "Bir delil de şudur:\nzürriyetlerini dolu gemide taşıdık.",
          en: "A sign for them: We carried\ntheir kin in the laden ship.",
        },
        {
          ayah: 42,
          tone: "creamAlt",
          heightLines: 3,
          arScale: 0.72,
          latScale: 0.75,
          ar: "وَخَلَقْنَا لَهُم مِّن مِّثْلِهِ\nمَا يَرْكَبُونَ",
          tr: "Onlar için bindikleri\nbenzerlerini de yarattık.",
          en: "And We made for them the like of it,\nto ride upon.",
        },
      ],
    },

    // ── Band 2 — the drowning (43) and the mercy that holds it off (44) ───
    {
      pair: [
        {
          ayah: 43,
          tone: "gold",
          heightLines: 3,
          arScale: 0.72,
          latScale: 0.72,
          ar: "وَإِن نَّشَأْ نُغْرِقْهُمْ\nفَلَا صَرِيخَ لَهُمْ وَلَا هُمْ يُنقَذُونَ",
          tr: "Dilesek onları boğardık;\nne bir imdatları olurdu ne de kurtarılırlardı.",
          en: "If We willed, We could drown them:\nno cry for help, and no rescue.",
        },
        {
          ayah: 44,
          tone: "gold",
          heightLines: 3,
          arScale: 0.72,
          latScale: 0.72,
          ar: "إِلَّا رَحْمَةً مِّنَّا وَمَتَاعًا إِلَىٰ حِينٍ",
          tr: "Ancak bizden bir rahmet, bir vakte kadar geçim.",
          en: "Only as a mercy from Us, and enjoyment for a time.",
        },
      ],
    },

    // ── Band 3 — the warning (45) and the turning away (46) ───────────────
    {
      pair: [
        {
          ayah: 45,
          tone: "blue",
          arScale: 0.68,
          latScale: 0.58,
          ar: "وَإِذَا قِيلَ لَهُمُ اتَّقُوا\nمَا بَيْنَ أَيْدِيكُمْ وَمَا\nخَلْفَكُمْ لَعَلَّكُمْ تُرْحَمُونَ",
          tr: "“Önünüzdekinden,\narkanızdakinden sakının,\nmerhamet göresiniz” denince",
          en: "When told, “Beware what\nlies before and behind,\nthat you may find mercy”…",
        },
        {
          ayah: 46,
          tone: "blue",
          arScale: 0.68,
          latScale: 0.58,
          ar: "وَمَا تَأْتِيهِم مِّنْ آيَةٍ\nمِّنْ آيَاتِ رَبِّهِمْ\nإِلَّا كَانُوا عَنْهَا مُعْرِضِينَ",
          tr: "Rablerinin ayetlerinden\nkendilerine gelen hiçbiri\nyok ki yüz çevirmesinler.",
          en: "No sign of their Lord's\nsigns comes to them\nbut they turn away.",
        },
      ],
    },

    // ── Band 4 — the retort (47), alone across the whole band ─────────────
    {
      ayah: 47,
      tone: "white",
      heightLines: 4,
      arScale: 0.75,
      latScale: 0.82,
      ar: "وَإِذَا قِيلَ لَهُمْ أَنفِقُوا مِمَّا رَزَقَكُمُ اللَّهُ\nقَالَ الَّذِينَ كَفَرُوا لِلَّذِينَ آمَنُوا أَنُطْعِمُ مَن\nلَّوْ يَشَاءُ اللَّهُ أَطْعَمَهُ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ مُّبِينٍ",
      tr: "“Allah'ın size verdiğinden infak edin” denildiğinde, inkâr edenler\ninananlara: “Allah dileseydi doyururdu;\nbiz mi doyuralım? Apaçık sapkınlıktasınız.”",
      en: "When told, “Spend of what God gave you,” the disbelievers say to the believers:\n“Shall we feed one whom God could feed?\nYou are in nothing but clear error.”",
    },
  ],

  frames: [
    // One transparent-background outer frame around the complete 41-47
    // section. This sheet-local SVG keeps the change away from other sheets.
    {
      from: 0,
      to: 3,
      tone: "outer",
      src: "/yasin4147/all-section.svg",
      w: 1.1,
      h: 1.41,
    },
    // Keep the two original outer frames around the two bands.
    { from: 0, to: 1, tone: "outer", pad: 0.018 },
    { from: 2, to: 3, tone: "outer", pad: 0.018 },
    // Each band also gets its own inner SVG frame.
    { from: 0, to: 1, tone: "inner" },
    { from: 2, to: 3, tone: "inner" },
  ],
};

export const SHEET = buildSheet(SPEC);
