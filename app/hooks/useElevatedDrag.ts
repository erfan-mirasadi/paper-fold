import { useRef, useMemo } from "react";
import { Plane, Vector3, Quaternion } from "three";
import { SpringValue } from "@react-spring/three";
import { ThreeEvent } from "@react-three/fiber";
import {
  markSectionDragged,
  markVerseDragged,
  unmarkVerseDragged,
  unmarkSectionDragged,
  dockElement,
  useDragState,
} from "../utils/dragEngine";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../stores/useElevatedStore";
import { useStoryStore } from "../stores/useStoryStore";
import { useSurahLayoutRuntime } from "./useSurahLayoutRuntime";
import { SectionBounds } from "../utils/boundsHelper";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";

// Module-level reusable math objects (thread-safe in single-threaded JS)
const _hit = new Vector3();
const _delta = new Vector3();
const _normal = new Vector3();
const _quat = new Quaternion();
const _pos = new Vector3();
const _scale = new Vector3();

type PointerCaptureTarget = EventTarget & {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

type DragBindings = {
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerCancel?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
};

const EMPTY_DRAG_BINDINGS: DragBindings = {};

function setBodyCursor(cursor: string) {
  if (typeof document === "undefined") return;
  if (document.body.style.cursor !== cursor) {
    document.body.style.cursor = cursor;
  }
}

/**
 * Ultra-lightweight drag hook for R3F objects.
 *
 * Snap-home detection uses ONLY spring displacement values — zero 3D math,
 * zero worldToLocal, zero ray intersection for bounds. 100% reliable.
 *
 * snapMode:
 *  "page"    → Paper mode drag. Snap back if the element's center (rest + spring) is within the page.
 *              Requires sectionBounds to know the element's original center position.
 *  "section" → Snap back if spring displacement is within 60% of the section frame size.
 *              For individual verse drags (both paper and all-sections mode).
 *  undefined → No snap (stays wherever dropped).
 */
export function useElevatedDrag({
  enabled,
  springX,
  springY,
  dragVerseId,
  dragSectionId,
  sectionBounds,
  snapMode,
}: {
  enabled: boolean;
  springX: SpringValue<number>;
  springY: SpringValue<number>;
  dragVerseId?: number;
  dragSectionId?: ElevatedSectionId;
  /**
   * "page" mode: section's resting bounds (to compute original center).
   * "section" mode: section frame bounds (to compute snap threshold from frame size).
   */
  sectionBounds?: SectionBounds;
  /**
   * "page"    → Snap if section center (rest center + springX) is within the page width.
   * "section" → Snap if |springX| < sectionWidth * 0.6 (verse hasn't left its frame).
   * undefined → No snap; element stays where dropped.
   */
  snapMode?: "page" | "section";
}) {
  const ref = useRef({
    active: false,
    plane: new Plane(),
    startWorld: new Vector3(),
    startSpringX: 0,
    startSpringY: 0,
    invQuat: new Quaternion(),
    dragMarked: false,
  });

  const runtime = useSurahLayoutRuntime();

  return useMemo<DragBindings>(() => {
    if (!enabled) return EMPTY_DRAG_BINDINGS;

    const isDragAllowed = () => {
      if (!useStoryStore.getState().activeConfig.features.hasElevatedSections)
        return false;
      if (useFoldStore.getState().isIntroActive) return false;
      return true;
    };

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
      if (!isDragAllowed()) return;
      e.stopPropagation();
      const s = ref.current;
      const normal = _normal
        .set(0, 0, 1)
        .transformDirection(e.eventObject.matrixWorld);
      s.plane.setFromNormalAndCoplanarPoint(normal, e.point);
      s.startWorld.copy(e.point);
      s.startSpringX = springX.get();
      s.startSpringY = springY.get();
      e.eventObject.matrixWorld.decompose(_pos, _quat, _scale);
      s.invQuat.copy(_quat).invert();
      s.active = true;
      s.dragMarked = false;
      try {
        (e.target as PointerCaptureTarget)?.setPointerCapture?.(e.pointerId);
      } catch {}
      setBodyCursor("grabbing");
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
      const s = ref.current;
      if (!s.active) return;
      e.stopPropagation();
      if (!e.ray.intersectPlane(s.plane, _hit)) return;
      _delta.subVectors(_hit, s.startWorld);
      _delta.applyQuaternion(s.invQuat);

      // Require a minimum movement distance before treating it as a drag
      if (!s.dragMarked && _delta.lengthSq() < 0.0002) return;

      springX.start(s.startSpringX + _delta.x, { immediate: true });
      springY.start(s.startSpringY + _delta.y, { immediate: true });

      if (!s.dragMarked) {
        let didMarkDrag = false;
        if (typeof dragVerseId === "number") {
          markVerseDragged(dragVerseId);
          didMarkDrag = true;
        }
        if (dragSectionId) {
          markSectionDragged(dragSectionId);
          didMarkDrag = true;
        }
        if (!didMarkDrag) {
          useDragState.getState().markDragged();
        }
        s.dragMarked = true;
      }
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
      const s = ref.current;
      const isAllSectionsMode = useElevatedStore.getState().isAllSectionsMode;
      const shouldDockPaper = s.dragMarked && !isAllSectionsMode;
      e.stopPropagation();
      s.active = false;
      s.dragMarked = false;

      // ── Snap-home: pure spring value comparison, no coordinate transforms ──
      // springX.get() is the element's displacement from its resting position.
      // This is always valid regardless of camera angle or scene hierarchy.
      let shouldSnapHome = false;

      if (snapMode === "page") {
        // Section/element drag in paper mode:
        // Check if the element's ACTUAL center (original position + spring displacement)
        // is still within the page. This correctly handles sections not centered on page.
        const halfPage = runtime.PAGE_WIDTH / 2;
        let shouldSnap: boolean;
        if (sectionBounds) {
          // Use the section's original center for an accurate on-page check
          const origCenterX = (sectionBounds.minX + sectionBounds.maxX) / 2;
          shouldSnap = Math.abs(origCenterX + springX.get()) < halfPage;
        } else {
          // Fallback: just check displacement directly
          shouldSnap = Math.abs(springX.get()) < halfPage;
        }
        shouldSnapHome = shouldSnap;
      } else if (snapMode === "section" && sectionBounds) {
        // Individual verse drag in all-sections mode:
        // springX/Y here is the verse's OWN spring (leadVerseDrag), which is the
        // displacement of this verse RELATIVE to its section's resting position.
        // (The section's own spring offset is handled separately in the position formula.)
        // So we just check: has the verse moved outside its section frame?
        const sectionWidth = sectionBounds.maxX - sectionBounds.minX;
        const sectionHeight = sectionBounds.maxY - sectionBounds.minY;
        shouldSnapHome =
          Math.abs(springX.get()) <= sectionWidth * 0.6 &&
          Math.abs(springY.get()) <= sectionHeight * 0.6;
      }

      if (shouldSnapHome) {
        springX.start(0);
        springY.start(0);
        if (typeof dragVerseId === "number") unmarkVerseDragged(dragVerseId);
        if (dragSectionId) unmarkSectionDragged(dragSectionId);
      } else if (shouldDockPaper) {
        // Use dockElement instead of dockPaper: properly cleans draggedSectionIds/Ids
        // so that when user re-drags the docked element back to paper, state is fresh
        // and unmarkSectionDragged will correctly reset hasDragged → camera restores.
        dockElement(dragSectionId, typeof dragVerseId === "number" ? dragVerseId : undefined);
      }

      try {
        (e.target as PointerCaptureTarget)?.releasePointerCapture?.(
          e.pointerId,
        );
      } catch {}
      setBodyCursor("auto");
    };

    return {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        if (!isDragAllowed()) return;
        if (ref.current.active) return;
        e.stopPropagation();
        setBodyCursor("grab");
      },
      onPointerOut: () => {
        if (ref.current.active) return;
        setBodyCursor("auto");
      },
    };
  }, [
    enabled,
    springX,
    springY,
    dragVerseId,
    dragSectionId,
    sectionBounds,
    snapMode,
    runtime,
  ]);
}
