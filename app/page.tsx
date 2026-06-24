import type { Metadata } from "next";
import { getAllSurahs } from "./data/surahDatabase";
import { HomePageClient } from "./_components/dom/HomePageClient";

export const metadata: Metadata = {
  title: "Quran Patterns",
  description:
    "Explore the Quran through immersive 3D visualizations. Each Surah is a layered journey into meaning, structure, and beauty.",
};

export default function MenuPage() {
  const surahs = getAllSurahs().map((surah) => ({
    id: surah.id,
    displayName: surah.displayName,
    arabicName: surah.arabicName,
    reference: surah.reference,
  }));

  return <HomePageClient surahs={surahs} />;
}
