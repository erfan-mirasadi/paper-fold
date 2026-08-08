/**
 * app/surahs/[id]/page.tsx — Dynamic Surah Route (Server Component)
 *
 * Only the plain string `id` is passed to StoreInitializer — no functions
 * cross the Server → Client boundary. The client resolves the full config
 * (which contains non-serializable functions) from the module registry itself.
 *
 * Rendering order (critical for zero hydration mismatches):
 *   1. getSurahData() runs on the server to validate the id and generate metadata.
 *   2. <StoreInitializer id={id}> hydrates first on the client and synchronously
 *      seeds useStoryStore via a useRef guard — no React state update, no re-render.
 *   3. <SurahViewer> renders after StoreInitializer in the same React tree,
 *      so the store already holds the correct config when the canvas boots.
 */

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSurahMeta, resolveLegacySurahId } from "@/app/data/surahDatabase";
import { StoreInitializer } from "./StoreInitializer";

// ---------------------------------------------------------------------------
// Dynamic metadata (SEO)
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  // Retired ids (e.g. fatiha1..3, now papers of "fatiha") resolve to their target.
  const meta = getSurahMeta(resolveLegacySurahId(id) ?? id);

  if (!meta) {
    return { title: "Not Found" };
  }

  // Plain strings here — the root layout's "%s | Quran Patterns" template
  // appends the site name automatically, so it must not be repeated here.
  const title = `${meta.displayName} (${meta.arabicName})`;
  const description = `Interactive 3D folded-paper visualization of ${meta.displayName} — ${meta.reference}.`;
  const ogImage = "/hero/Hero%20section.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SurahPage({ params }: PageProps) {
  const { id } = await params;

  // Old standalone routes (fatiha1..3) now live as papers inside "fatiha" —
  // keep existing links and bookmarks working.
  const legacyTarget = resolveLegacySurahId(id);
  if (legacyTarget) {
    redirect(`/surahs/${legacyTarget}`);
  }

  // Validate on the server — unknown id → Next.js 404 page.
  // We use the lightweight metadata registry.
  const meta = getSurahMeta(id);
  if (!meta) {
    notFound();
  }

  return (
    <>
      {/*
       * StoreInitializer dynamically imports the huge Surah config on the client,
       * preventing all Surahs from being bundled into the initial page load.
       * It shows the SiteLoadingOverlay while fetching the chunk,
       * and then seamlessly renders the SurahViewer once the store is seeded.
       */}
      <StoreInitializer id={id} />
    </>
  );
}
