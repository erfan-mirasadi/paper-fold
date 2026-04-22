import { SpringValue } from "@react-spring/three";
import { create } from "zustand";
import { type ElevatedSectionId } from "../useElevatedStore";

export const DRAG_SPRING_CONFIG = { mass: 1.5, tension: 350, friction: 35 };

const createSpring = () => new SpringValue(0, { config: DRAG_SPRING_CONFIG });

export const dragEngine = {
  sections: {
    s1: { x: createSpring(), y: createSpring() },
    s2_top: { x: createSpring(), y: createSpring() },
    s2_bottom: { x: createSpring(), y: createSpring() },
    s2_center: { x: createSpring(), y: createSpring() },
  } as Record<
    ElevatedSectionId,
    { x: SpringValue<number>; y: SpringValue<number> }
  >,
  verses: Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [
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
  markVerseDragged: (verseId: number, offset?: { x: number; y: number }) => void;
  markSectionDragged: (sectionId: ElevatedSectionId) => void;
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
  if (verseId >= 1 && verseId <= 5) return "s1";
  if (verseId >= 6 && verseId <= 10) return "s2_top";
  if (verseId >= 11 && verseId <= 14) return "s2_center";
  if (verseId >= 15 && verseId <= 19) return "s2_bottom";
  return null;
}
