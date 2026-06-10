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

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSurahData } from "@/app/data/surahDatabase";
import { StoreInitializer } from "./StoreInitializer";
import SurahViewer from "./SurahViewer";

// ---------------------------------------------------------------------------
// Dynamic metadata (SEO)
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getSurahData(id);

  if (!entry) {
    return { title: "Not Found | Quran Fold" };
  }

  return {
    title: `${entry.displayName} (${entry.arabicName}) | Quran Fold`,
    description: `Interactive 3D folded-paper visualization of ${entry.displayName} — ${entry.reference}.`,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SurahPage({ params }: PageProps) {
  const { id } = await params;

  // Validate on the server — unknown id → Next.js 404 page.
  // The full entry object (with functions) is NOT passed to any Client Component.
  const entry = getSurahData(id);
  if (!entry) {
    notFound();
  }

  return (
    <>
      {/*
       * Only the primitive string `id` crosses the RSC boundary.
       * StoreInitializer resolves the full config on the client side.
       * It MUST render before SurahViewer so the store is seeded first.
       */}
      <StoreInitializer id={id} />

      {/* Full 3D canvas experience — reads from the already-seeded store */}
      <SurahViewer />
    </>
  );
}
