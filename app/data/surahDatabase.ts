import type { SurahLayoutConfig } from "./schema";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";
import type { SurahDataShape } from "./SurahConfig";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SurahMeta {
  /** Canonical slug — matches the dynamic route [id] segment */
  id: string;
  /** Human-readable display name (shown in the menu) */
  displayName: string;
  /** Arabic name of the Surah */
  arabicName: string;
  /** Surah / verse reference (e.g. "Bakara 255") */
  reference: string;
}

/**
 * One physical paper inside a Surah page.
 *
 * A Surah route can present several papers (each with its own exclusive
 * layout, folding, elevated sections, pop-ups, …). Exactly ONE paper is ever
 * live on the GPU at a time — the rest exist only as cached config data.
 */
export interface SurahPaper {
  /** Layout & animation config injected into useStoryStore */
  config: SurahLayoutConfig;
  /** Multi-language text data injected into useStoryStore */
  textData: Record<SurahLanguage, SurahDataShape>;
}

// ---------------------------------------------------------------------------
// Registry — add new Surahs here as the project grows
// ---------------------------------------------------------------------------

const SURAH_META_REGISTRY: ReadonlyArray<SurahMeta> = [
  {
    id: "fatiha",
    displayName: "Al-Fatiha 1",
    arabicName: "الفاتحة ١",
    reference: "Al-Fatiha 1",
  },
  {
    id: "alak",
    displayName: "Al-Alak 96",
    arabicName: "العَلَق ٩٦",
    reference: "Al-Alak 96",
  },
  {
    id: "ayatalkursi",
    displayName: "Ayat al-Kursi",
    arabicName: "آيَة الكُرْسِي",
    reference: "Al-Bakara 255",
  },
  {
    id: "ahzab35",
    displayName: "Al-Ahzab 35",
    arabicName: "الأحزاب ٣٥",
    reference: "Al-Ahzab 35",
  },
  {
    id: "nisa36",
    displayName: "An-Nisa 36",
    arabicName: "النساء ٣٦",
    reference: "An-Nisa 36",
  },
  {
    id: "ihlas112",
    displayName: "Al-Ikhlas 112",
    arabicName: "الإخلاص ١١٢",
    reference: "Al-Ikhlas 112",
  },
  {
    id: "kafirun109",
    displayName: "Al-Kafirun 109",
    arabicName: "الكافرون ١٠٩",
    reference: "Al-Kafirun 109",
  },
] as const;

/**
 * Old route ids that used to be standalone Surah pages and now live as papers
 * inside a multi-paper Surah. `app/surahs/[id]/page.tsx` redirects them so
 * existing links and bookmarks keep working.
 */
const LEGACY_SURAH_ALIASES: Readonly<Record<string, string>> = {
  fatiha1: "fatiha",
  fatiha2: "fatiha",
};

// Pre-built lookup map for O(1) access by id
const META_REGISTRY_MAP = new Map<string, SurahMeta>(
  SURAH_META_REGISTRY.map((meta) => [meta.id, meta]),
);

// ---------------------------------------------------------------------------
// Paper loaders — one dynamic-import loader per paper, per Surah.
//
// Bundle-splitting rule: every config stays in its own chunk. A paper's chunk
// is fetched only when that paper is actually opened (or idle-prefetched as a
// neighbor by usePaperStore). Config data is plain JS (a few KB) — the heavy
// cost of a paper is its GPU textures, which are owned by the live scene, not
// by this module.
// ---------------------------------------------------------------------------

type PaperLoader = () => Promise<SurahPaper>;

const SURAH_PAPER_LOADERS: Readonly<
  Record<string, ReadonlyArray<PaperLoader>>
> = {
  fatiha: [
    () =>
      import("./configs/fatiha/fatihaLandscapeConfig").then((m) => ({
        config: m.FATIHA_LANDSCAPE_CONFIG,
        textData: m.FATIHA_LANDSCAPE_TEXT_DATA,
      })),
    () =>
      import("./configs/fatiha/fatiha2Config").then((m) => ({
        config: m.FATIHA_2_CONFIG,
        textData: m.FATIHA_2_TEXT_DATA,
      })),
    () =>
      import("./configs/fatiha/fatiha1Config").then((m) => ({
        config: m.FATIHA_1_CONFIG,
        textData: m.FATIHA_1_TEXT_DATA,
      })),
  ],
  alak: [
    () =>
      import("./configs/alak96Config").then((m) => ({
        config: m.ALAK_LAYOUT_CONFIG,
        textData: m.ALAK_TEXT_DATA,
      })),
  ],
  ayatalkursi: [
    () =>
      import("./configs/ayatAlKursiConfig").then((m) => ({
        config: m.AYAT_AL_KURSI_CONFIG,
        textData: m.AYAT_AL_KURSI_TEXT_DATA,
      })),
  ],
  ahzab35: [
    () =>
      import("./configs/ahzab35Config").then((m) => ({
        config: m.AHZAB_35_CONFIG,
        textData: m.AHZAB_35_TEXT_DATA,
      })),
  ],
  nisa36: [
    () =>
      import("./configs/nisa36Config").then((m) => ({
        config: m.NISA_36_CONFIG,
        textData: m.NISA_36_TEXT_DATA,
      })),
  ],
  ihlas112: [
    () =>
      import("./configs/ihlas112Config").then((m) => ({
        config: m.IHLAS_112_CONFIG,
        textData: m.IHLAS_112_TEXT_DATA,
      })),
  ],
  kafirun109: [
    () =>
      import("./configs/kafirun109Config").then((m) => ({
        config: m.KAFIRUN_109_CONFIG,
        textData: m.KAFIRUN_109_TEXT_DATA,
      })),
  ],
};

// Memoized in-flight/settled promises. Keeping resolved configs cached makes
// arrow navigation (and back/forward between papers) instant after the first
// visit, at a negligible memory cost — this cache never touches GPU memory.
const paperPromiseCache = new Map<string, Promise<SurahPaper>>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a single Surah's lightweight metadata by its route id.
 * Safe to call synchronously on the server or client for routing/SEO.
 */
export function getSurahMeta(id: string): SurahMeta | null {
  return META_REGISTRY_MAP.get(id) ?? null;
}

/**
 * Returns the full ordered list of available Surahs (for menu pages, sitemaps, etc.)
 */
export function getAllSurahs(): ReadonlyArray<SurahMeta> {
  return SURAH_META_REGISTRY;
}

/** Resolve a retired route id to its canonical Surah id, or null. */
export function resolveLegacySurahId(id: string): string | null {
  return LEGACY_SURAH_ALIASES[id] ?? null;
}

/** How many papers a Surah page presents (0 for unknown ids). */
export function getSurahPaperCount(id: string): number {
  return SURAH_PAPER_LOADERS[id]?.length ?? 0;
}

/**
 * Asynchronously fetch the heavy config and text data for one paper of a Surah.
 * Results are memoized; a failed fetch is evicted so it can be retried.
 */
export function loadSurahPaper(
  id: string,
  paperIndex: number,
): Promise<SurahPaper | null> {
  const loader = SURAH_PAPER_LOADERS[id]?.[paperIndex];
  if (!loader) return Promise.resolve(null);

  const cacheKey = `${id}:${paperIndex}`;
  let promise = paperPromiseCache.get(cacheKey);
  if (!promise) {
    promise = loader();
    promise.catch(() => paperPromiseCache.delete(cacheKey));
    paperPromiseCache.set(cacheKey, promise);
  }
  return promise;
}
