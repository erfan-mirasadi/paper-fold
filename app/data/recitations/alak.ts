import type { RecitationTranscript } from "./types";

// ---------------------------------------------------------------------------
// ALAK — time-aligned recitations (TIMING ONLY — see ./types.ts).
//
// Keyed so we can add as many as we need (per section / reciter). Each entry
// is a flat, in-reading-order list of time-stamped words that the panel
// aligns onto the surah's authored tafsir text via <SyncedRecitation/>.
//
// The entry that uses them lists them in reading order (see alak96Config's
// "pre-start" step), and the panel plays them as a chain — press play on the
// first and the rest follow in turn. Each one finds its own place in the
// tafsir from its words; add `from` / `to` anchors when you'd rather say
// exactly where a voice belongs (as `vahiy` does below).
//
// If a word here is wrong or missing the displayed tafsir is unaffected —
// only the highlight timing is.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ALAK_BUTUN — "Bütün varlıklar konuşur" bölümü: the opening tafsir of the
// "pre-start" step. Deepgram nova-3 ile hizalanmıştır.
// Ses dosyası: /alak/alak-butun.mp3
// ---------------------------------------------------------------------------

const ALAK_BUTUN: RecitationTranscript = {
  src: "/alak/alak-butun.mp3",
  title: "Bütün Varlıklar Konuşur",
  durationS: 71.08,
  words: [
    { w: "Bütün",                 s: 0,      e: 0.4    },
    { w: "varlıklar",             s: 0.4,    e: 1.12   },
    { w: "konuşur.",              s: 1.12,   e: 1.84   },
    { w: "Canlı",                 s: 2.32,   e: 2.72   },
    { w: "varlıkların",           s: 2.72,   e: 3.68   },
    { w: "vücutlarında",          s: 3.84,   e: 4.56   },
    { w: "görev",                 s: 4.56,   e: 4.88   },
    { w: "yapan",                 s: 4.88,   e: 5.6    },
    { w: "bütün",                 s: 5.68,   e: 6.24   },
    { w: "organlar",              s: 6.24,   e: 7.2    },
    { w: "birbirleriyle",         s: 7.28,   e: 8.08   },
    { w: "etkileşirler,",         s: 8.08,   e: 9.28   },
    { w: "bilgi",                 s: 9.6,    e: 10.16  },
    { w: "alışverişinde",         s: 10.16,  e: 11.04  },
    { w: "bulunurlar.",           s: 11.04,  e: 12     },
    { w: "Beyinde",               s: 12.72,  e: 13.2   },
    { w: "bütün",                 s: 13.2,   e: 13.44  },
    { w: "organlarla",            s: 13.44,  e: 14.08  },
    { w: "iletişim",              s: 14.08,  e: 14.64  },
    { w: "içindedir,",            s: 14.64,  e: 15.12  },
    { w: "özel",                  s: 15.785, e: 16.105 },
    { w: "bir",                   s: 16.105, e: 16.345 },
    { w: "dil",                   s: 16.345, e: 16.585 },
    { w: "ile",                   s: 16.585, e: 17.225 },
    { w: "onlarla",               s: 17.305, e: 17.865 },
    { w: "konuşur.",              s: 17.865, e: 18.585 },
    { w: "Hayvanların",           s: 18.905, e: 19.545 },
    { w: "ve",                    s: 19.545, e: 19.785 },
    { w: "insanların",            s: 19.785, e: 20.345 },
    { w: "vücudu",                s: 20.345, e: 21.145 },
    { w: "sanki",                 s: 21.305, e: 21.625 },
    { w: "medeni",                s: 21.625, e: 22.105 },
    { w: "birer",                 s: 22.105, e: 22.425 },
    { w: "şehir",                 s: 22.425, e: 22.745 },
    { w: "gibidir.",              s: 22.745, e: 23.465 },
    { w: "O",                     s: 23.865, e: 24.105 },
    { w: "vücut",                 s: 24.105, e: 24.425 },
    { w: "şehrinde",              s: 24.425, e: 24.985 },
    { w: "her",                   s: 24.985, e: 25.305 },
    { w: "an",                    s: 25.305, e: 25.545 },
    { w: "sayısız",               s: 25.545, e: 26.105 },
    { w: "telefon,",              s: 26.105, e: 26.825 },
    { w: "faks",                  s: 27.145, e: 28.105 },
    { w: "ve",                    s: 27.95,  e: 28.35  },
    { w: "özel",                  s: 28.35,  e: 28.67  },
    { w: "ulak,",                 s: 28.67,  e: 29.31  },
    { w: "mesaj",                 s: 29.31,  e: 30.03  },
    { w: "taşımakta,",            s: 30.11,  e: 31.07  },
    { w: "bilgi",                 s: 31.39,  e: 31.79  },
    { w: "taşımaktadır.",         s: 31.79,  e: 32.75  },
    { w: "Ayrıca",                s: 33.23,  e: 33.55  },
    { w: "hayvanlar",             s: 33.55,  e: 34.11  },
    { w: "kendi",                 s: 34.11,  e: 34.43  },
    { w: "aralarında",            s: 34.43,  e: 34.99  },
    { w: "iletişim",              s: 34.99,  e: 35.47  },
    { w: "kurarak,",              s: 35.47,  e: 36.27  },
    { w: "kendi",                 s: 36.51,  e: 36.83  },
    { w: "dilleriyle",            s: 36.83,  e: 37.39  },
    { w: "konuşarak,",            s: 37.39,  e: 38.35  },
    { w: "duygularını",           s: 38.67,  e: 39.23  },
    { w: "anlatabilmektedirler.", s: 39.23,  e: 40.43  },
    { w: "Bitkiler",              s: 40.995, e: 41.555 },
    { w: "de",                    s: 41.555, e: 42.195 },
    { w: "renkleriyle",           s: 42.195, e: 43.235 },
    { w: "ve",                    s: 43.475, e: 43.795 },
    { w: "yaydıkları",            s: 43.795, e: 44.355 },
    { w: "kokularla",             s: 44.355, e: 45.315 },
    { w: "böceklere",             s: 45.715, e: 46.515 },
    { w: "mesaj",                 s: 46.515, e: 47.075 },
    { w: "gönderirler.",          s: 47.075, e: 48.115 },
    { w: "Rüzgar",                s: 48.595, e: 48.995 },
    { w: "çiçeklerin",            s: 48.995, e: 49.715 },
    { w: "kokularını,",           s: 49.715, e: 50.435 },
    { w: "mesajlarını",           s: 50.435, e: 50.995 },
    { w: "uzaklara",              s: 50.995, e: 51.555 },
    { w: "taşır,",                s: 51.555, e: 52.275 },
    { w: "onlara",                s: 52.595, e: 52.995 },
    { w: "özel",                  s: 52.995, e: 53.315 },
    { w: "ulak",                  s: 53.315, e: 53.715 },
    { w: "olur.",                 s: 53.715, e: 54.355 },
    { w: "İnsanlara",             s: 54.675, e: 55.155 },
    { w: "gelince",               s: 55.155, e: 55.955 },
    { w: "insanların",            s: 56.44,  e: 57     },
    { w: "konuşması",             s: 57,     e: 57.96  },
    { w: "hayvanların",           s: 58.2,   e: 58.76  },
    { w: "çok",                   s: 58.76,  e: 59.08  },
    { w: "üzerindedir.",          s: 59.08,  e: 59.88  },
    { w: "Çünkü",                 s: 59.88,  e: 60.2   },
    { w: "insanlar",              s: 60.2,   e: 61     },
    { w: "üstün",                 s: 61.32,  e: 61.72  },
    { w: "bir",                   s: 61.72,  e: 61.96  },
    { w: "beyin",                 s: 61.96,  e: 62.36  },
    { w: "ile",                   s: 62.36,  e: 62.6   },
    { w: "donatılmış",            s: 62.6,   e: 63.64  },
    { w: "özel",                  s: 63.96,  e: 64.44  },
    { w: "varlıklardır.",         s: 64.44,  e: 65.64  },
    { w: "Allah",                 s: 66.92,  e: 67.64  },
    { w: "insanlara",             s: 67.96,  e: 68.6   },
    { w: "çeşitli",               s: 68.6,   e: 69.4   },
    { w: "diller",                s: 69.4,   e: 69.88  },
    { w: "öğretmiştir.",          s: 69.88,  e: 70.68  },
  ],
};

// ---------------------------------------------------------------------------
// ALAK_VAHIY — "Allah'ın Konuşması: Vahiy" bölümü (pre-start adımındaki
// altyazı bloğu). Deepgram nova-3 modeli ile hizalanmıştır.
// Ses dosyası: /alak/alak-vahiy.mp3
//
// Pinned to its own subtitle with `from` — automatic placement lands here too,
// but saying it outright keeps the voice on its section no matter how the
// tafsir above is re-worded. Swap the anchor to move it (see RecitationAnchor:
// "kicker" | "title" | a paragraph index | { subtitle } | { startsWith }).
// ---------------------------------------------------------------------------

const ALAK_VAHIY: RecitationTranscript = {
  src: "/alak/alak-vahiy.mp3",
  title: 'Allah\'ın Konuşması: "Vahiy"',
  durationS: 41.64,
  from: { subtitle: 'ALLAH’IN KONUŞMASI: "VAHİY"' },
  words: [
    { w: "Allah'ın",         s: 0.08,   e: 0.64   },
    { w: "Konuşması,",       s: 0.64,   e: 1.60   },
    { w: "vahiy,",           s: 2.32,   e: 3.12   },
    { w: "bütün",            s: 4.00,   e: 4.48   },
    { w: "canlıları",        s: 4.48,   e: 5.20   },
    { w: "kendilerine",      s: 5.20,   e: 5.68   },
    { w: "mahsus",           s: 5.68,   e: 6.08   },
    { w: "bir",              s: 6.08,   e: 6.40   },
    { w: "dil",              s: 6.40,   e: 6.64   },
    { w: "ile",              s: 6.64,   e: 6.88   },
    { w: "konuşturan",       s: 6.88,   e: 7.60   },
    { w: "Allah",            s: 7.60,   e: 8.16   },
    { w: "elbette",          s: 8.40,   e: 8.80   },
    { w: "kendisi",          s: 8.80,   e: 9.20   },
    { w: "de",               s: 9.20,   e: 9.36   },
    { w: "konuşmayı",        s: 9.36,   e: 9.84   },
    { w: "bilir.",           s: 9.84,   e: 10.56  },
    { w: "Hiç",              s: 10.72,  e: 11.04  },
    { w: "yaratan",          s: 11.04,  e: 11.52  },
    { w: "bilmez",           s: 11.52,  e: 11.92  },
    { w: "mi?",              s: 11.92,  e: 12.56  },
    { w: "Konuşmayı",        s: 12.72,  e: 13.28  },
    { w: "bilen",            s: 13.28,  e: 13.60  },
    { w: "elbette",          s: 13.60,  e: 14.08  },
    { w: "konuşur",          s: 14.08,  e: 14.48  },
    { w: "ve",               s: 14.48,  e: 14.80  },
    { w: "konuşmuştur.",     s: 14.80,  e: 15.44  },
    { w: "Onun",             s: 16.315, e: 16.715 },
    { w: "konuşması",        s: 16.715, e: 17.355 },
    { w: "vahiy",            s: 17.355, e: 17.755 },
    { w: "ve",               s: 17.755, e: 17.995 },
    { w: "ilham",            s: 17.995, e: 18.475 },
    { w: "şeklindedir.",     s: 18.475, e: 19.435 },
    { w: "İşte",             s: 20.235, e: 20.475 },
    { w: "yüce",             s: 20.475, e: 20.795 },
    { w: "yaratıcı",         s: 20.795, e: 21.275 },
    { w: "peygamberlerine",  s: 21.275, e: 22.155 },
    { w: "vahiy",            s: 22.155, e: 22.555 },
    { w: "yoluyla",          s: 22.555, e: 23.035 },
    { w: "hitap",            s: 23.035, e: 23.355 },
    { w: "etmiştir.",        s: 23.355, e: 24.155 },
    { w: "İnsanlar",         s: 24.715, e: 25.275 },
    { w: "içinde",           s: 25.275, e: 25.835 },
    { w: "yaradılışça",      s: 25.835, e: 26.635 },
    { w: "en",               s: 26.635, e: 26.955 },
    { w: "ileri,",           s: 26.955, e: 27.675 },
    { w: "ahlakça",          s: 27.995, e: 28.555 },
    { w: "en",               s: 28.555, e: 28.715 },
    { w: "mükemmel",         s: 28.715, e: 29.275 },
    { w: "olan",             s: 29.275, e: 29.835 },
    { w: "Hazreti",          s: 30.08,  e: 30.40  },
    { w: "Muhammed",         s: 30.40,  e: 30.88  },
    { w: "Aleyhisselam",     s: 30.88,  e: 31.52  },
    { w: "ile",              s: 31.52,  e: 31.84  },
    { w: "de",               s: 31.84,  e: 32.00  },
    { w: "vahiy",            s: 32.00,  e: 32.48  },
    { w: "yoluyla",          s: 32.48,  e: 33.20  },
    { w: "ve",               s: 33.20,  e: 33.84  },
    { w: "alemlerin",        s: 33.84,  e: 34.64  },
    { w: "Rabbi",            s: 34.64,  e: 35.12  },
    { w: "sıfatıyla",        s: 35.12,  e: 35.84  },
    { w: "konuşmuştur.",     s: 35.84,  e: 36.80  },
    { w: "Konuşmuş",         s: 37.12,  e: 37.84  },
    { w: "ve",               s: 37.84,  e: 38.16  },
    { w: "bütün",            s: 38.16,  e: 38.64  },
    { w: "insanlığa",        s: 38.64,  e: 39.52  },
    { w: "onunla",           s: 39.84,  e: 40.16  },
    { w: "mesaj",            s: 40.16,  e: 40.64  },
    { w: "göndermiştir.",    s: 40.64,  e: 41.36  },
  ],
};

/** All Alak recitations, keyed by section. Add more entries as needed — the
 *  tafsir entry decides which ones it carries, and in what order. */
export const ALAK_RECITATIONS: Record<string, RecitationTranscript> = {
  butun: ALAK_BUTUN,
  vahiy: ALAK_VAHIY,
};
