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
// Right reads first, as everywhere in this family. Both frames are the
// project's own all-section art — gold rim, panel inside — the two outlines
// inked around these bands on the sheet.
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
          tone: "cream",
          ar: "وَآيَةٌ لَّهُمْ أَنَّا\nحَمَلْنَا ذُرِّيَّتَهُمْ\nفِي الْفُلْكِ الْمَشْحُونِ",
          tr: "Bir delil de şudur:\nzürriyetlerini dolu\ngemide taşıdık.",
          en: "A sign for them:\nWe carried their kin\nin the laden ship.",
        },
        {
          ayah: 42,
          tone: "cream",
          ar: "وَخَلَقْنَا لَهُم\nمِّن مِّثْلِهِ\nمَا يَرْكَبُونَ",
          tr: "Onlar için bindikleri\nbenzerlerini de\nyarattık.",
          en: "And We made for them\nthe like of it,\nto ride upon.",
        },
      ],
    },

    // ── Band 2 — the drowning (43) and the mercy that holds it off (44) ───
    {
      pair: [
        {
          ayah: 43,
          tone: "gold",
          ar: "وَإِن نَّشَأْ نُغْرِقْهُمْ\nفَلَا صَرِيخَ لَهُمْ\nوَلَا هُمْ يُنقَذُونَ",
          tr: "Dilesek onları boğardık;\nne bir imdatları olurdu\nne de kurtarılırlardı.",
          en: "If We willed, We could\ndrown them: no cry\nfor help, and no rescue.",
        },
        {
          ayah: 44,
          tone: "gold",
          ar: "إِلَّا رَحْمَةً\nمِّنَّا وَمَتَاعًا\nإِلَىٰ حِينٍ",
          tr: "Ancak bizden bir\nrahmet, bir vakte\nkadar geçim.",
          en: "Only as a mercy\nfrom Us, and enjoyment\nfor a time.",
        },
      ],
    },

    // ── Band 3 — the warning (45) and the turning away (46) ───────────────
    {
      pair: [
        {
          ayah: 45,
          tone: "blue",
          ar: "وَإِذَا قِيلَ لَهُمُ اتَّقُوا\nمَا بَيْنَ أَيْدِيكُمْ وَمَا\nخَلْفَكُمْ لَعَلَّكُمْ تُرْحَمُونَ",
          tr: "“Önünüzdekinden,\narkanızdakinden sakının,\nmerhamet göresiniz” denince",
          en: "When told, “Beware what\nlies before and behind,\nthat you may find mercy”…",
        },
        {
          ayah: 46,
          tone: "blue",
          ar: "وَمَا تَأْتِيهِم مِّنْ آيَةٍ\nمِّنْ آيَاتِ رَبِّهِمْ\nإِلَّا كَانُوا عَنْهَا مُعْرِضِينَ",
          tr: "Rablerinin ayetlerinden\nkendilerine gelen hiçbiri\nyok ki yüz çevirmesinler.",
          en: "No sign of their Lord's\nsigns comes to them\nbut they turn away.",
        },
      ],
    },

    // ── Band 4 — the retort (47), alone across the whole band ─────────────
    {
      ayah: 47,
      tone: "maroon",
      ar: "وَإِذَا قِيلَ لَهُمْ أَنفِقُوا مِمَّا رَزَقَكُمُ اللَّهُ\nقَالَ الَّذِينَ كَفَرُوا لِلَّذِينَ آمَنُوا\nأَنُطْعِمُ مَن لَّوْ يَشَاءُ اللَّهُ أَطْعَمَهُ\nإِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ مُّبِينٍ",
      tr: "“Allah'ın size verdiğinden infak edin”\ndenildiğinde, inkâr edenler\ninananlara: “Allah dileseydi doyururdu;\nbiz mi doyuralım? Apaçık sapkınlıktasınız.”",
      en: "When told, “Spend of what God gave you,”\nthe disbelievers say to the believers:\n“Shall we feed one whom God could feed?\nYou are in nothing but clear error.”",
    },
  ],

  frames: [
    // The two outlines on the sheet, and nothing else — no rim around the page.
    // `outer` is the project's own all-section art: gold rim, panel inside,
    // drawn at the aspect each of these two is displayed at. They are siblings,
    // not nested, so both are drawn at the same width and every band keeps the
    // same measure.
    { from: 0, to: 1, tone: "outer" },
    { from: 2, to: 3, tone: "outer" },
  ],
};

export const SHEET = buildSheet(SPEC);
