import { SpringValue } from "@react-spring/three";
import { create } from "zustand";
import { type ElevatedSectionId } from "../stores/useElevatedStore";
import { getSectionIdForVerseId } from "./sectionResolver";

export const DRAG_SPRING_CONFIG = { mass: 1.5, tension: 350, friction: 35 };

const createSpring = () => new SpringValue(0, { config: DRAG_SPRING_CONFIG });

const dynamicSectionsTarget: Record<string, { x: SpringValue<number>; y: SpringValue<number> }> = {};
const dynamicVersesTarget: Record<number, { x: SpringValue<number>; y: SpringValue<number> }> = {};

const dynamicSections = new Proxy(dynamicSectionsTarget, {
  get(target, prop: string) {
    if (typeof prop === "symbol" || prop === "toJSON" || prop === "constructor") return target[prop as any];
    if (prop === "length" || prop === "name") return target[prop as any];
    
    // Some react or internal checks might ask for weird string props, be careful.
    if (Object.prototype.hasOwnProperty.call(target, prop)) {
      return target[prop];
    }

    // Generate on demand
    target[prop] = { x: createSpring(), y: createSpring() };
    return target[prop];
  }
});

const dynamicVerses = new Proxy(dynamicVersesTarget, {
  get(target, prop: string) {
    if (typeof prop === "symbol" || prop === "toJSON" || prop === "constructor") return target[prop as any];
    const num = Number(prop);
    if (isNaN(num)) {
      return target[prop as any];
    }
    
    if (target[num]) {
      return target[num];
    }

    // Generate on demand
    target[num] = { x: createSpring(), y: createSpring() };
    return target[num];
  }
});

export const dragEngine = {
  sections: dynamicSections,
  verses: dynamicVerses,
  // We expose the raw targets if we ever need to iterate over all instantiated springs safely
  _sectionsTarget: dynamicSectionsTarget,
  _versesTarget: dynamicVersesTarget,
};

const draggedVerseIds = new Set<number>();
const draggedSectionIds = new Set<ElevatedSectionId>();

export const useDragState = create<{
  hasDragged: boolean;
  draggedVerseIds: number[];
  draggedSectionIds: ElevatedSectionId[];
  separatedVerseOffsets: Record<number, { x: number; y: number }>;
  markDragged: () => void;
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
  draggedVerseIds: [],
  draggedSectionIds: [],
  separatedVerseOffsets: {},
  markDragged: () =>
    set((state) => (state.hasDragged ? state : { hasDragged: true })),
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
      };
    }),
  reset: () =>
    set({
      hasDragged: false,
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
  // Always re-mark even if already in the Set, to ensure state is fresh.
  // This handles the case where the section was docked and dragged again.
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
  // Remove from Set regardless (handles docked sections being re-dragged back)
  draggedSectionIds.delete(sectionId);
  useDragState.getState().unmarkSectionDragged(sectionId);
}

export function resetAllDrags() {
  Object.values(dragEngine._sectionsTarget).forEach((s) => {
    s.x.start(0);
    s.y.start(0);
  });
  Object.values(dragEngine._versesTarget).forEach((v) => {
    v.x.start(0);
    v.y.start(0);
  });
  draggedVerseIds.clear();
  draggedSectionIds.clear();
  useDragState.getState().reset();
}

/** Helper to resolve verse -> section map.
 *  Delegates to the shared reverse index built by `initElevatedStoreForStory`,
 *  which traverses `config.blocks` + `config.customSections` — including
 *  intro/outro verses attaching to their first/last group. This guarantees a
 *  single source of truth across drag, bounds and hitboxes.
 */
export function getVerseSectionId(verseId: number): ElevatedSectionId | null {
  return getSectionIdForVerseId(verseId);
}

/**
 * Call when switching to a new surah to wipe all stale spring values and
 * drag markers. Prevents leaked SpringValues accumulating across navigations.
 */
export function resetDragEngineForStory() {
  // Stop and zero-out all existing springs
  Object.values(dynamicSectionsTarget).forEach((s) => {
    s.x.stop();
    s.y.stop();
  });
  Object.values(dynamicVersesTarget).forEach((v) => {
    v.x.stop();
    v.y.stop();
  });
  // Clear the proxy backing stores so IDs from the old surah don't linger
  for (const key of Object.keys(dynamicSectionsTarget)) {
    delete dynamicSectionsTarget[key];
  }
  for (const key of Object.keys(dynamicVersesTarget)) {
    delete (dynamicVersesTarget as any)[key];
  }
  draggedVerseIds.clear();
  draggedSectionIds.clear();
  useDragState.getState().reset();
}
