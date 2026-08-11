"use client";

/**
 * PageSpaceAnchor — an empty object sitting exactly where the page's own
 * coordinates do, so anything OUTSIDE the paper subtree can turn a spot on the
 * page into a spot in the world by reading one matrix.
 *
 * SectionZoomCamera is what needs this. It runs beside the scene rather than
 * inside it, and the page it has to aim at is several nested transforms deep —
 * the 45° tilt, the look-around spin, the scene's scale, the slide a paper
 * switch is in the middle of — any of which can be moving while the camera
 * flies. Reading them off this object's world matrix means the camera can never
 * disagree with where the page actually is, and nothing has to remember to tell
 * it when one of those transforms changes.
 *
 * Mount it as a sibling of the verse and section layers, under the same slide
 * group, so it travels with them.
 */

import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";
import { getPageWidthForLanguage } from "../../../hooks/useSurahLayoutRuntime";

export const PAGE_SPACE_ANCHOR = "page-space-anchor";

export function PageSpaceAnchor() {
  const dimensions = useStoryStore((state) => state.activeConfig.dimensions);
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  // The same two numbers every page-space layer applies (ElevatedSectionSurfaces,
  // VerseClickHitboxes): the page is drawn rightwards and downwards from its
  // top-left corner, and sits centred on the scene.
  const pageWidth = getPageWidthForLanguage(
    activeLanguage,
    dimensions.paperWidth,
    dimensions.fixedWidthAcrossLanguages,
  );
  const sceneCenterY =
    dimensions.paperHeight / 2 + dimensions.sceneCenterYOffset;

  return (
    <group name={PAGE_SPACE_ANCHOR} position={[-pageWidth / 2, sceneCenterY, 0]} />
  );
}
