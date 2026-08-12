/**
 * sectionZoom — the one answer to "which rectangle does this click frame?".
 *
 * Two very different consumers need it and must never disagree: the camera
 * that flies to the rectangle (`SectionZoomCamera`) and the texture ladder
 * that has to have a sharp picture of that rectangle waiting when the camera
 * arrives (`PageTextureLod`). A second, drifting copy of this lookup would
 * show up as a crisp patch parked next to the sheet the reader actually asked
 * for, so it lives here instead of in either of them.
 */

import type {
  CameraFocusRect,
  CameraTargetConfig,
  SurahLayoutConfig,
} from "../data/schema";

/**
 * How much of the screen the framed rectangle fills, along whichever of its two
 * sides runs out of room first. At 1 its edges touch the edges of the window;
 * below that there is air around it.
 *
 * Not 1, for two reasons. A sheet's rectangle is the page it was drawn on and
 * the ink usually stops short of that — but not always, and a frame SVG drawn
 * out to the very edge would be cropped by the window if the fit were exact.
 * And a sheet read completely alone, with no hint of the ones it sits between,
 * loses the thing an atlas is for.
 */
export const FRAME_FILL = 0.9;

export interface SectionZoomIndex {
  /** Sections that say where the camera should STAND (ordinary one-sheet pages). */
  zoomTargets: Record<string, CameraTargetConfig>;
  /** Sections that say WHAT the camera must SHOW (an atlas of many sheets). */
  zoomFocus: Record<string, CameraFocusRect>;
  getSectionIdForVerse: (verseId: number) => string | null;
}

/** Build both lookups for a config. Cheap, but memoise it per config. */
export function buildSectionZoomIndex(
  config: SurahLayoutConfig,
): SectionZoomIndex {
  const zoomTargets: Record<string, CameraTargetConfig> = {};
  const zoomFocus: Record<string, CameraFocusRect> = {};

  if (config.customSections && config.customSections.length > 0) {
    // Register the custom section camera target (falls back to the first block with one)
    const fallback = config.blocks?.find((b) => b.cameraTarget)?.cameraTarget;
    config.customSections.forEach((cs) => {
      const target = cs.cameraTarget ?? fallback;
      if (target) zoomTargets[cs.id] = target;
      if (cs.cameraFocus) zoomFocus[cs.id] = cs.cameraFocus;
    });
  } else {
    // "perBlock" elevation (Fatiha, Kafirun, Alak): blocks sharing a
    // `customSectionId` (e.g. Alak's intro/outro merging into their
    // neighboring group's zone) register under that zone instead of
    // their own id. Blocks without their own `cameraTarget` reuse the
    // first target found anywhere (matching "Fallback: per-group entries
    // with same target" behavior for Kafirun/Fatiha, where only one block
    // declares a target), instead of never zooming.
    const fallback = config.blocks?.find((b) => b.cameraTarget)?.cameraTarget;
    config.blocks?.forEach((block) => {
      if (block.type === "spacer" || !block.verseIds?.length) return;
      const zoneId = block.customSectionId ?? block.id;
      const target = block.cameraTarget ?? zoomTargets[zoneId] ?? fallback;
      if (target) zoomTargets[zoneId] = target;
    });
  }

  const getSectionIdForVerse = (vid: number): string | null => {
    if (config.customSections && config.customSections.length > 0) {
      for (const cs of config.customSections) {
        if (cs.verseIds.includes(vid)) return cs.id;
      }
    }
    for (const block of config.blocks ?? []) {
      if (block.verseIds?.includes(vid)) return block.customSectionId ?? block.id;
      // Grid blocks (Alak) carry their anaAyet as a separate field, not
      // part of `verseIds`.
      if (block.type === "grid" && block.anaAyetId === vid) {
        return block.customSectionId ?? block.id;
      }
    }
    return null;
  };

  return { zoomTargets, zoomFocus, getSectionIdForVerse };
}
