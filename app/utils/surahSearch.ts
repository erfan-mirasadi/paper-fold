import type { SurahMeta } from "@/app/data/surahDatabase";

// ---------------------------------------------------------------------------
// Localized surah names — single source of truth for menus & search.
// ---------------------------------------------------------------------------

export const SURAH_LOCAL_NAMES: Record<string, { tr: string; en: string }> = {
  fatiha: { tr: "Fâtiha Suresi", en: "Al-Fatihah" },
  alak: { tr: "Alak Suresi", en: "Al-Alaq" },
  ayatalkursi: { tr: "Ayetel Kürsi", en: "Ayat al-Kursi" },
  ahzab35: { tr: "Ahzâb Suresi 35", en: "Al-Ahzab 35" },
  nisa36: { tr: "Nisâ Suresi 36", en: "An-Nisa 36" },
  ihlas112: { tr: "İhlas Suresi", en: "Al-Ikhlas" },
  kafirun109: { tr: "Kâfirûn Suresi", en: "Al-Kafirun" },
};

// ---------------------------------------------------------------------------
// Text normalization — makes matching insensitive to script quirks so users
// can type without harakat, Turkish accents, hyphens or spaces:
//   "fatiha"  → matches "Al-Fâtiha", "الفاتحة"
//   "kursi"   → matches "Ayetel Kürsi", "آيَة الكُرْسِي"
//   "96"      → matches "العَلَق ٩٦"
// ---------------------------------------------------------------------------

// Harakat, superscript alef, Quranic annotation marks
const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
// Latin combining accents left behind by NFKD (â û ü ö ç ş ğ, and the
// combining dot that lowercasing "İ" produces)
const LATIN_COMBINING_MARKS = /[\u0300-\u036f]/g;

export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    // Arabic-Indic & extended (Persian) digits → ASCII
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(ARABIC_MARKS, "")
    .replace(/ـ/g, "") // tatweel
    .replace(/[أإآٱ]/g, "ا") // أ إ آ ٱ → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ئ/g, "ي") // ئ → ي
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ة/g, "ه") // ة → ه
    .replace(/ء/g, "") // ء
    .normalize("NFKD")
    .replace(LATIN_COMBINING_MARKS, "")
    .replace(/ı/g, "i") // dotless ı → i
    // Drop everything that isn't a letter or digit (spaces, hyphens, ')
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

type SearchableSurah = Pick<
  SurahMeta,
  "id" | "displayName" | "arabicName" | "reference"
>;

// Normalized haystacks are cached per surah id — metas are static.
const fieldCache = new Map<string, string[]>();

function getSearchFields(meta: SearchableSurah): string[] {
  let fields = fieldCache.get(meta.id);
  if (!fields) {
    const names = SURAH_LOCAL_NAMES[meta.id];
    fields = [
      meta.id,
      meta.displayName,
      meta.arabicName,
      meta.reference,
      names?.tr ?? "",
      names?.en ?? "",
    ]
      .filter(Boolean)
      .map(normalizeSearchText);
    fieldCache.set(meta.id, fields);
  }
  return fields;
}

/**
 * Live-filter a surah list. Every whitespace-separated token of the query
 * must match at least one field (English, Turkish or Arabic name, reference,
 * or route id). An empty/blank query returns the full list.
 */
export function filterSurahs<T extends SearchableSurah>(
  surahs: ReadonlyArray<T>,
  query: string,
): T[] {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map(normalizeSearchText)
    .filter(Boolean);

  if (tokens.length === 0) return [...surahs];

  return surahs.filter((surah) => {
    const fields = getSearchFields(surah);
    return tokens.every((token) => fields.some((f) => f.includes(token)));
  });
}
