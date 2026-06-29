import type { SurahLayoutConfig } from "./schema";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";
import type { SurahDataShape } from "./surahData";

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

export interface SurahEntry extends SurahMeta {
  /** Layout & animation config injected into useStoryStore */
  config: SurahLayoutConfig<any>;
  /** Multi-language text data injected into useStoryStore */
  textData: Record<SurahLanguage, SurahDataShape>;
}

// ---------------------------------------------------------------------------
// Registry — add new Surahs here as the project grows
// ---------------------------------------------------------------------------

const SURAH_META_REGISTRY: ReadonlyArray<SurahMeta> = [
  {
    id: "alak",
    displayName: "Al-Alak",
    arabicName: "العَلَق",
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
    displayName: "Al-Ahzab",
    arabicName: "الأحزاب",
    reference: "Al-Ahzab 35",
  },
  {
    id: "ihlas112",
    displayName: "Al-Ikhlas",
    arabicName: "الإخلاص",
    reference: "Al-Ikhlas 112",
  },
  {
    id: "kafirun109",
    displayName: "Al-Kafirun",
    arabicName: "الكافرون",
    reference: "Al-Kafirun 109",
  },
] as const;

// Pre-built lookup map for O(1) access by id
const META_REGISTRY_MAP = new Map<string, SurahMeta>(
  SURAH_META_REGISTRY.map((meta) => [meta.id, meta]),
);

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

/**
 * Asynchronously fetch the heavy config and text data for a specific Surah.
 * Uses dynamic imports to code-split the data per route, preventing giant bundle sizes.
 */
export async function getSurahDataAsync(id: string): Promise<SurahEntry | null> {
  const meta = getSurahMeta(id);
  if (!meta) return null;

  switch (id) {
    case "alak": {
      const [configModule, dataModule] = await Promise.all([
        import("./alak96Config"),
        import("./surahData")
      ]);
      return {
        ...meta,
        config: configModule.ALAK_LAYOUT_CONFIG,
        textData: dataModule.ALAK_TEXT_DATA,
      };
    }
    case "ayatalkursi": {
      const module = await import("./ayatAlKursiConfig");
      return {
        ...meta,
        config: module.AYAT_AL_KURSI_CONFIG,
        textData: module.AYAT_AL_KURSI_TEXT_DATA,
      };
    }
    case "ahzab35": {
      const module = await import("./ahzab35Config");
      return {
        ...meta,
        config: module.AHZAB_35_CONFIG,
        textData: module.AHZAB_35_TEXT_DATA,
      };
    }
    case "ihlas112": {
      const module = await import("./ihlas112Config");
      return {
        ...meta,
        config: module.IHLAS_112_CONFIG,
        textData: module.IHLAS_112_TEXT_DATA,
      };
    }
    case "kafirun109": {
      const module = await import("./kafirun109Config");
      return {
        ...meta,
        config: module.KAFIRUN_109_CONFIG,
        textData: module.KAFIRUN_109_TEXT_DATA,
      };
    }
    default:
      return null;
  }
}
