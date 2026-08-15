"use client";

/**
 * useSectionZoomNav — stepping from the section you are zoomed into to the one
 * beside it, without pulling back out to the whole paper first.
 *
 * WHAT A STEP MOVES BETWEEN. Not sections: FRAMES. A sheet of an atlas hands
 * every zone it owns the same rectangle to zoom to (see `CameraFocusRect`), so
 * the twelve-ayah opening is six sections wearing one frame — stepping through
 * the sections would leave the camera parked in the same place five times in a
 * row while the reader wonders whether the button is broken. Frames are
 * therefore collapsed by the rectangle they name, and each step lands the
 * camera somewhere it visibly was not.
 *
 * ORDER is the order the page lists its sections in, which — on a composed
 * paper — is the order the sheets were laid down in, which is the order the
 * surah is read in. Nothing here re-sorts them: the arrangement already knows
 * what comes next, and a camera that disagreed with it would be the bug.
 *
 * A step elevates the frame's whole sheet (every verse in every one of its
 * sections), not just the zone that happens to lead it, because the reader
 * asked for the sheet by pointing the camera at it.
 */

import { useCallback, useMemo } from "react";
import { useElevatedStore } from "../stores/useElevatedStore";
import { useStoryStore } from "../stores/useStoryStore";
import type { CustomSectionDef } from "../data/schema";

interface ZoomFrame {
  /** The section a step through this frame makes active. */
  leadSectionId: string;
  /** How many verses that section holds — the widest one wins the lead. */
  leadSize: number;
  /** Every verse the frame covers, so a step elevates the whole sheet. */
  verseIds: number[];
  sectionIds: string[];
}

export interface SectionZoomNav {
  /** True while a section zoom is on screen and there is somewhere else to go. */
  isActive: boolean;
  /** Is there a sheet further on in the reading (leftwards, then down)? */
  hasForward: boolean;
  /** Is there one back the way we came? */
  hasBackward: boolean;
  goForward: () => void;
  goBackward: () => void;
  /** 1-based position of the framed sheet, and how many there are. */
  index: number;
  total: number;
}

function buildFrames(sections: CustomSectionDef[] | undefined): ZoomFrame[] {
  const frames: ZoomFrame[] = [];
  const byRect = new Map<string, ZoomFrame>();

  for (const cs of sections ?? []) {
    const f = cs.cameraFocus;
    if (!f) continue;

    const rectKey = `${f.x}|${f.y}|${f.w}|${f.h}`;
    let frame = byRect.get(rectKey);
    if (!frame) {
      frame = { leadSectionId: cs.id, leadSize: 0, verseIds: [], sectionIds: [] };
      byRect.set(rectKey, frame);
      frames.push(frame);
    }

    // The widest zone leads, so a step lands on the sheet as a whole rather
    // than on whichever corner of it happened to be listed first.
    if (cs.verseIds.length > frame.leadSize) {
      frame.leadSectionId = cs.id;
      frame.leadSize = cs.verseIds.length;
    }

    frame.sectionIds.push(cs.id);
    for (const id of cs.verseIds) {
      if (!frame.verseIds.includes(id)) frame.verseIds.push(id);
    }
  }

  return frames;
}

export function useSectionZoomNav(): SectionZoomNav {
  const customSections = useStoryStore((s) => s.activeConfig.customSections);
  const phase = useElevatedStore((s) => s.phase);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const activeSectionId = useElevatedStore((s) => s.activeSectionId);
  const activeVerseIds = useElevatedStore((s) => s.activeVerseIds);

  const frames = useMemo(() => buildFrames(customSections), [customSections]);

  // Which frame is on screen. The active SECTION is the reliable answer, but a
  // click on a lone verse leaves it null, so the verse itself is the fallback —
  // the same order SectionZoomCamera resolves its target in.
  const currentIndex = useMemo(() => {
    if (activeSectionId) {
      const byId = frames.findIndex((f) =>
        f.sectionIds.includes(activeSectionId),
      );
      if (byId >= 0) return byId;
    }
    const verseId = activeVerseIds[0];
    if (verseId === undefined) return -1;
    return frames.findIndex((f) => f.verseIds.includes(verseId));
  }, [frames, activeSectionId, activeVerseIds]);

  const isZoomed = phase === "elevated" && !isAllSectionsMode && currentIndex >= 0;

  const goTo = useCallback(
    (index: number) => {
      const frame = frames[index];
      if (!frame) return;
      useElevatedStore
        .getState()
        .focusSection(frame.verseIds, frame.leadSectionId);
    },
    [frames],
  );

  const goForward = useCallback(
    () => goTo(currentIndex + 1),
    [goTo, currentIndex],
  );
  const goBackward = useCallback(
    () => goTo(currentIndex - 1),
    [goTo, currentIndex],
  );

  return {
    isActive: isZoomed && frames.length > 1,
    hasForward: isZoomed && currentIndex < frames.length - 1,
    hasBackward: isZoomed && currentIndex > 0,
    goForward,
    goBackward,
    index: currentIndex + 1,
    total: frames.length,
  };
}
