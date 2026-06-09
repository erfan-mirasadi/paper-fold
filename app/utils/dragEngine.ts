import { SpringValue } from "@react-spring/three";
import { create } from "zustand";
import { type ElevatedSectionId } from "../stores/useElevatedStore";
import { getActiveStoryConfig } from "../stores/useStoryStore";
import { GridSectionConfig, VerticalGroupsSectionConfig } from "../data/schema";

export const DRAG_SPRING_CONFIG = { mass: 1.5, tension: 350, friction: 35 };

const createSpring = () => new SpringValue(0, { config: DRAG_SPRING_CONFIG });

const dynamicSections: Record<string, { x: SpringValue<number>; y: SpringValue<number> }> = {};
let maxVerseId = 0;

getActiveStoryConfig().sections.forEach((sec) => {
  if (sec.type === "gridWithAnaAyet") {
    dynamicSections[sec.id] = { x: createSpring(), y: createSpring() };
    const g = sec as GridSectionConfig;
    maxVerseId = Math.max(maxVerseId, ...g.verses, g.anaAyet);
  } else if (sec.type === "verticalGroups") {
    dynamicSections[`${sec.id}_top`] = { x: createSpring(), y: createSpring() };
    dynamicSections[`${sec.id}_center`] = { x: createSpring(), y: createSpring() };
    dynamicSections[`${sec.id}_bottom`] = { x: createSpring(), y: createSpring() };
    const v = sec as VerticalGroupsSectionConfig;
    if (v.introVerse) maxVerseId = Math.max(maxVerseId, v.introVerse);
    if (v.outroVerse) maxVerseId = Math.max(maxVerseId, v.outroVerse);
    v.groups.forEach(g => {
      maxVerseId = Math.max(maxVerseId, ...g.verseIds);
    });
  }
});

export const dragEngine = {
  sections: dynamicSections,
  verses: Object.fromEntries(
    Array.from({ length: maxVerseId }, (_, i) => [
      i + 1,
      { x: createSpring(), y: createSpring() },
    ]),
  ) as Record<number, { x: SpringValue<number>; y: SpringValue<number> }>,
};

const draggedVerseIds = new Set<number>();
const draggedSectionIds = new Set<ElevatedSectionId>();

export const useDragState = create<{
  hasDragged: boolean;
  isPaperDocked: boolean;
  draggedVerseIds: number[];
  draggedSectionIds: ElevatedSectionId[];
  separatedVerseOffsets: Record<number, { x: number; y: number }>;
  markDragged: () => void;
  dockPaper: () => void;
  markVerseDragged: (
    verseId: number,
    offset?: { x: number; y: number },
  ) => void;
  markSectionDragged: (sectionId: ElevatedSectionId) => void;
  unmarkVerseDragged: (verseId: number) => void;
  unmarkSectionDragged: (sectionId: ElevatedSectionId) => void;
  reset: () => void;
}>((set) => ({
  hasDragged: false,
  isPaperDocked: false,
  draggedVerseIds: [],
  draggedSectionIds: [],
  separatedVerseOffsets: {},
  markDragged: () =>
    set((state) => (state.hasDragged ? state : { hasDragged: true })),
  dockPaper: () =>
    set((state) => (state.isPaperDocked ? state : { isPaperDocked: true })),
  markVerseDragged: (verseId, offset) =>
    set((state) => {
      if (state.draggedVerseIds.includes(verseId)) return state;
      const newOffsets = offset
        ? { ...state.separatedVerseOffsets, [verseId]: offset }
        : state.separatedVerseOffsets;
      return {
        draggedVerseIds: [...state.draggedVerseIds, verseId],
        separatedVerseOffsets: newOffsets,
        hasDragged: true,
      };
    }),
  markSectionDragged: (sectionId) =>
    set((state) => {
      if (state.draggedSectionIds.includes(sectionId)) return state;
      return {
        draggedSectionIds: [...state.draggedSectionIds, sectionId],
        hasDragged: true,
      };
    }),
  unmarkVerseDragged: (verseId) =>
    set((state) => {
      const newDraggedVerseIds = state.draggedVerseIds.filter(
        (id) => id !== verseId,
      );
      const isAnyDragged =
        newDraggedVerseIds.length > 0 || state.draggedSectionIds.length > 0;
      return {
        draggedVerseIds: newDraggedVerseIds,
        hasDragged: isAnyDragged ? state.hasDragged : false,
        isPaperDocked: isAnyDragged ? state.isPaperDocked : false,
      };
    }),
  unmarkSectionDragged: (sectionId) =>
    set((state) => {
      const newDraggedSectionIds = state.draggedSectionIds.filter(
        (id) => id !== sectionId,
      );
      const isAnyDragged =
        state.draggedVerseIds.length > 0 || newDraggedSectionIds.length > 0;
      return {
        draggedSectionIds: newDraggedSectionIds,
        hasDragged: isAnyDragged ? state.hasDragged : false,
        isPaperDocked: isAnyDragged ? state.isPaperDocked : false,
      };
    }),
  reset: () =>
    set({
      hasDragged: false,
      isPaperDocked: false,
      draggedVerseIds: [],
      draggedSectionIds: [],
      separatedVerseOffsets: {},
    }),
}));

export function markVerseDragged(verseId: number) {
  if (draggedVerseIds.has(verseId)) return;
  draggedVerseIds.add(verseId);

  const sectionId = getVerseSectionId(verseId);
  let offset = undefined;
  if (sectionId) {
    const sDrag = dragEngine.sections[sectionId];
    if (sDrag) {
      offset = { x: sDrag.x.get(), y: sDrag.y.get() };
    }
  }

  useDragState.getState().markVerseDragged(verseId, offset);
}

export function markSectionDragged(sectionId: ElevatedSectionId) {
  if (draggedSectionIds.has(sectionId)) return;
  draggedSectionIds.add(sectionId);
  useDragState.getState().markSectionDragged(sectionId);
}

export function isVerseDragLocked(verseId: number): boolean {
  return draggedVerseIds.has(verseId);
}

export function isSectionDragLocked(sectionId: ElevatedSectionId): boolean {
  return draggedSectionIds.has(sectionId);
}

export function unmarkVerseDragged(verseId: number) {
  if (!draggedVerseIds.has(verseId)) return;
  draggedVerseIds.delete(verseId);
  useDragState.getState().unmarkVerseDragged(verseId);
}

export function unmarkSectionDragged(sectionId: ElevatedSectionId) {
  if (!draggedSectionIds.has(sectionId)) return;
  draggedSectionIds.delete(sectionId);
  useDragState.getState().unmarkSectionDragged(sectionId);
}

export function resetAllDrags() {
  Object.values(dragEngine.sections).forEach((s) => {
    s.x.start(0);
    s.y.start(0);
  });
  Object.values(dragEngine.verses).forEach((v) => {
    v.x.start(0);
    v.y.start(0);
  });
  draggedVerseIds.clear();
  draggedSectionIds.clear();
  useDragState.getState().reset();
}

/** Helper to resolve verse -> section map */
export function getVerseSectionId(verseId: number): ElevatedSectionId | null {
  for (const sec of getActiveStoryConfig().sections) {
    if (sec.type === "gridWithAnaAyet") {
      const g = sec as GridSectionConfig;
      if (g.verses.includes(verseId) || g.anaAyet === verseId) return g.id;
    } else if (sec.type === "verticalGroups") {
      const v = sec as VerticalGroupsSectionConfig;
      if (v.introVerse === verseId || (v.groups[0] && v.groups[0].verseIds.includes(verseId))) return `${v.id}_top`;
      if (v.groups[1] && v.groups[1].verseIds.includes(verseId)) return `${v.id}_center`;
      if (v.outroVerse === verseId || (v.groups[2] && v.groups[2].verseIds.includes(verseId))) return `${v.id}_bottom`;
    }
  }
  return null;
}
