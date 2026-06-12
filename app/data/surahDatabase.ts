/**
 * surahDatabase.ts — Mock database / content layer
 *
 * This module is the single source of truth for which Surahs are available.
 * It is intentionally a plain module (no async I/O) so it can be called
 * safely inside Next.js Server Components with zero overhead.
 *
 * Usage (Server Component):
 *   import { getSurahData } from "@/app/data/surahDatabase";
 *   const data = getSurahData(params.id);
 *   if (!data) notFound();
 */

import type { SurahLayoutConfig } from "./schema";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";
import type { SurahDataShape } from "./surahData";

import { ALAK_LAYOUT_CONFIG } from "./SurahConfig";
import {
  SURAH_DATA_ARABIC,
  SURAH_DATA_ENGLISH,
  SURAH_DATA_TURKISH,
} from "./surahData";

import {
  AYAT_AL_KURSI_CONFIG,
  AYAT_AL_KURSI_TEXT_DATA,
} from "./ayatAlKursiConfig";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SurahEntry {
  /** Canonical slug — matches the dynamic route [id] segment */
  id: string;
  /** Human-readable display name (shown in the menu) */
  displayName: string;
  /** Arabic name of the Surah */
  arabicName: string;
  /** Surah / verse reference (e.g. "Bakara 255") */
  reference: string;
  /** Layout & animation config injected into useStoryStore */
  config: SurahLayoutConfig<any>;
  /** Multi-language text data injected into useStoryStore */
  textData: Record<SurahLanguage, SurahDataShape>;
}

// ---------------------------------------------------------------------------
// Registry — add new Surahs here as the project grows
// ---------------------------------------------------------------------------

const SURAH_REGISTRY: ReadonlyArray<SurahEntry> = [
  {
    id: "alak",
    displayName: "Al-Alaq",
    arabicName: "العَلَق",
    reference: "Surah 96",
    config: ALAK_LAYOUT_CONFIG,
    textData: {
      ar: SURAH_DATA_ARABIC,
      en: SURAH_DATA_ENGLISH,
      tr: SURAH_DATA_TURKISH,
    },
  },
  {
    id: "ayatalkursi",
    displayName: "Ayat al-Kursi",
    arabicName: "آيَة الكُرْسِي",
    reference: "Bakara 255",
    config: AYAT_AL_KURSI_CONFIG,
    textData: AYAT_AL_KURSI_TEXT_DATA,
  },
] as const;

// Pre-built lookup map for O(1) access by id
const REGISTRY_MAP = new Map<string, SurahEntry>(
  SURAH_REGISTRY.map((entry) => [entry.id, entry]),
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a single Surah's config and text data by its route id.
 *
 * Returns `null` when the id is unknown — callers should invoke `notFound()`
 * from `next/navigation` in that case.
 */
export function getSurahData(id: string): SurahEntry | null {
  return REGISTRY_MAP.get(id) ?? null;
}

/**
 * Returns the full ordered list of available Surahs (for menu pages, sitemaps, etc.)
 */
export function getAllSurahs(): ReadonlyArray<SurahEntry> {
  return SURAH_REGISTRY;
}
