import { useRef, useMemo } from "react";
import { Plane, Vector3, Quaternion } from "three";
import { SpringValue } from "@react-spring/three";
import { ThreeEvent } from "@react-three/fiber";
import {
  markSectionDragged,
  markVerseDragged,
  unmarkVerseDragged,
  unmarkSectionDragged,
  useDragState,
} from "../utils/dragEngine";
import { type ElevatedSectionId } from "../stores/useElevatedStore";
import { useStoryStore } from "../stores/useStoryStore";
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

/**
 * Capture radius of the section magnet, in world units (≈ one capsule height,
 * ~5% of the page). Drop a section frame within this of the slot it came from
 * and it clicks back into place; past it, it stays where it was put.
 *
 * Deliberately a fixed distance rather than a fraction of the section: a zone
 * spanning the whole page would otherwise get a page-sized magnet and could
 * never be moved off its home at all.
 */
export const SECTION_MAGNET_RADIUS = 0.09;

function setBodyCursor(cursor: string) {
  if (typeof document === "undefined") return;
  if (document.body.style.cursor !== cursor) {
    document.body.style.cursor = cursor;
  }
}

/**
 * Ultra-lightweight drag hook for R3F objects (all-sections mode only).
 *
 * Snap-home detection uses ONLY spring displacement values — zero 3D math,
 * zero worldToLocal, zero ray intersection for bounds. 100% reliable.
 *
 * snapMode:
 *  "section" → Snap back if spring displacement is within 60% of the section frame size.
 *              For individual verse drags in all-sections mode.
 *  undefined → No snap (section stays wherever dropped).
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
  /** "section" mode: the dragged verse's own block frame (see `calculateVerseSnapBounds`). */
  sectionBounds?: SectionBounds;
  /**
   * "section" → Snap if |springX| < frameWidth * 0.6 (verse hasn't left its box).
   * "magnet"  → Snap if the drop landed within `SECTION_MAGNET_RADIUS` of home.
   *             Used for whole sections: a band dropped near the slot it came
   *             from clicks back into its parent frame instead of hanging
   *             slightly off it.
   * undefined → No snap; element stays where dropped.
   */
  snapMode?: "section" | "magnet";
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

  return useMemo<DragBindings>(() => {
    if (!enabled) return EMPTY_DRAG_BINDINGS;

    const isDragAllowed = () => {
      if (!useStoryStore.getState().activeConfig.features.hasElevatedSections)
        return false;
      if (useFoldStore.getState().isIntroActive) return false;
      if (useFoldStore.getState().currentOffset < 0.98) return false;
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
      e.stopPropagation();
      s.active = false;
      s.dragMarked = false;

      // ── Snap-home: pure spring value comparison, no coordinate transforms ──
      // springX.get() is the element's displacement from its resting position.
      // This is always valid regardless of camera angle or scene hierarchy.
      let shouldSnapHome = false;

      if (snapMode === "section" && sectionBounds) {
        // Individual verse drag in all-sections mode:
        // springX/Y here is the verse's OWN spring (leadVerseDrag), which is the
        // displacement of this verse RELATIVE to its resting position.
        // (Section drag offsets are handled separately in the position formula.)
        // So we just check: has the verse moved outside its own block's frame?
        const sectionWidth = sectionBounds.maxX - sectionBounds.minX;
        const sectionHeight = sectionBounds.maxY - sectionBounds.minY;
        shouldSnapHome =
          Math.abs(springX.get()) <= sectionWidth * 0.6 &&
          Math.abs(springY.get()) <= sectionHeight * 0.6;
      } else if (snapMode === "magnet") {
        // Whole-section drag: springX/Y is this section's displacement from its
        // resting slot (any enclosing section's offset is added separately in
        // the position formula), so zero really is "back where it belongs".
        shouldSnapHome =
          Math.abs(springX.get()) <= SECTION_MAGNET_RADIUS &&
          Math.abs(springY.get()) <= SECTION_MAGNET_RADIUS;
      }

      if (shouldSnapHome) {
        springX.start(0);
        springY.start(0);
        if (typeof dragVerseId === "number") unmarkVerseDragged(dragVerseId);
        if (dragSectionId) unmarkSectionDragged(dragSectionId);
      }
      // Otherwise the element stays wherever it was dropped (free placement).

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
  ]);
}
