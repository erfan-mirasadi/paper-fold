"use client";

/**
 * The tafsir panel's copy, in the language the reader has selected.
 *
 * A config keeps its default (Turkish) panel in `sideInfo` and every other
 * language's panel in `sideInfoTranslations`, keyed by language id — each
 * surah defines its translations at the bottom of its own config file (e.g.
 * `ALAK_SIDE_INFO_EN` at the end of alak96Config.ts) and wires them in right
 * after, once the object exists:
 *
 *   sideInfoTranslations: {},         // ← declared on the config...
 *   …
 *   const ALAK_SIDE_INFO_EN = { … };  // ← …filled in once this is defined
 *   ALAK_LAYOUT_CONFIG.sideInfoTranslations = { en: ALAK_SIDE_INFO_EN };
 *
 * Languages absent from `sideInfoTranslations` fall back to `sideInfo` (that
 * is what Arabic does today — the prose has no Arabic edition yet).
 *
 * A translation MAY instead be a `() => import(...)` loader if a future
 * surah's tafsir gets heavy enough to warrant its own chunk — `resolve()`
 * below accepts either — but nothing in this project needs that yet, so
 * every translation today is a plain inline object.
 *
 * The switcher calls `prefetchSideInfoContent` while it is already showing its
 * loading state; for an inline translation this resolves immediately, and for
 * a loader it starts the fetch early, so by the time the language actually
 * flips `useSideInfoContent` returns synchronously. `use()` is the safety net
 * for the rare case a loader hasn't settled yet (a language changed from
 * somewhere else) — the panel suspends for that one render instead of
 * flashing the previous language's text.
 */

import { use } from "react";
import type { SurahLayoutConfig, SurahSideInfoConfig } from "@/app/data/schema";
import {
  useSurahLanguageStore,
  type SurahLanguage,
} from "@/app/hooks/useSurahLanguageStore";

/**
 * Resolved translations, keyed `${config.id}:${language}`. Entries start as the
 * in-flight promise and are replaced by the value itself once it settles, so a
 * cache hit costs nothing and never suspends. A rejected load is evicted so the
 * next render can retry rather than being stuck on a failed chunk.
 */
const cache = new Map<
  string,
  SurahSideInfoConfig | Promise<SurahSideInfoConfig>
>();

const cacheKey = (configId: string, language: SurahLanguage) =>
  `${configId}:${language}`;

/**
 * What this config says about `language`: the panel content itself when it is
 * already available (inline, cached, or the default fallback), or the promise
 * that will produce it.
 */
function resolve(
  config: SurahLayoutConfig,
  language: SurahLanguage,
): SurahSideInfoConfig | Promise<SurahSideInfoConfig> | null {
  const translation = config.sideInfoTranslations?.[language];
  // No translation for this language → the authored default panel.
  if (!translation) return config.sideInfo ?? null;
  // Authored inline (small entry sets don't need their own chunk).
  if (typeof translation !== "function") return translation;

  const key = cacheKey(config.id, language);
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = translation().then((loaded) => {
    cache.set(key, loaded);
    return loaded;
  });
  promise.catch(() => cache.delete(key));
  cache.set(key, promise);
  return promise;
}

/**
 * Warm the chunk for one language ahead of the switch. Safe to call as often as
 * you like — repeat calls hit the cache. Never rejects: a translation that
 * fails to load just leaves the panel on its default language.
 */
export function prefetchSideInfoContent(
  config: SurahLayoutConfig,
  language: SurahLanguage,
): Promise<void> {
  const resolved = resolve(config, language);
  return resolved instanceof Promise
    ? resolved.then(
        () => undefined,
        () => undefined,
      )
    : Promise.resolve();
}

/** The tafsir panel content for the active language, or null when the surah has none. */
export function useSideInfoContent(
  config: SurahLayoutConfig,
): SurahSideInfoConfig | null {
  const language = useSurahLanguageStore((s) => s.activeLanguage);
  const resolved = resolve(config, language);
  // `use` may be called conditionally — that is exactly what it is for.
  return resolved instanceof Promise ? use(resolved) : resolved;
}
