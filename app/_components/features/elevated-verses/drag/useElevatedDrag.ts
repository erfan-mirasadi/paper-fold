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
} from "./dragEngine";
import { useElevatedStore, type ElevatedSectionId } from "../useElevatedStore";
import { PAGE_WIDTH, PAGE_HEIGHT } from "../../../data/SurahConfig";

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
 * Computes deltas in the local coordinate space of the paper surface so that
 * all consumers (surfaces, labels, verses) get consistent offsets from the
 * same SpringValue instances.
 *
 * KEY DESIGN DECISIONS:
 * ─ We snapshot the parent inverse quaternion at pointerDown and reuse it for
 *   the entire gesture. Rotation never changes during a drag so this is safe
 *   and avoids a feedback loop (the parent's world matrix includes the spring
 *   offsets, which move during drag — re-reading it would corrupt the delta).
 * ─ We intersect a world-space plane aligned with the object's surface normal
 *   rather than an axis-aligned plane, so the paper's -π/4 X tilt works.
 * ─ All spring updates use immediate:true for zero-latency tracking.
 */
export function useElevatedDrag({
  enabled,
  springX,
  springY,
  dragVerseId,
  dragSectionId,
}: {
  enabled: boolean;
  springX: SpringValue<number>;
  springY: SpringValue<number>;
  dragVerseId?: number;
  dragSectionId?: ElevatedSectionId;
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

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const s = ref.current;

      // Compute the surface normal in world space from the eventObject's Z-axis
      const normal = _normal
        .set(0, 0, 1)
        .transformDirection(e.eventObject.matrixWorld);
      s.plane.setFromNormalAndCoplanarPoint(normal, e.point);
      s.startWorld.copy(e.point);
      s.startSpringX = springX.get();
      s.startSpringY = springY.get();

      // Snapshot the parent's rotation so we can convert world→local deltas.
      // We read from a STABLE ancestor — walk up to the first non-animated group.
      // In practice the rotation chain is identical for all paper children, so
      // using eventObject.matrixWorld is fine (the rotation part is constant).
      e.eventObject.matrixWorld.decompose(_pos, _quat, _scale);
      s.invQuat.copy(_quat).invert();

      s.active = true;
      s.dragMarked = false;

      // Pointer capture for reliable move/up tracking
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

      // World-space delta from start to current
      _delta.subVectors(_hit, s.startWorld);

      // Rotate the delta into the object's local coordinate frame
      _delta.applyQuaternion(s.invQuat);

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

      let isInsidePaper = false;
      if (!isAllSectionsMode && e.ray.intersectPlane(s.plane, _hit)) {
        // e.eventObject is the dragged item's top group (a.group), its parent is the paper root coordinate system group.
        const paperRoot = e.eventObject.parent;

        if (paperRoot) {
          const localHit = paperRoot.worldToLocal(_hit.clone());
          if (
            localHit.x >= -PAGE_WIDTH / 2 &&
            localHit.x <= PAGE_WIDTH / 2 &&
            localHit.y <= 0 &&
            localHit.y >= -PAGE_HEIGHT
          ) {
            isInsidePaper = true;
          }
        }
      }

      if (isInsidePaper) {
        springX.start(0);
        springY.start(0);

        // Remove from dragged state so it perfectly re-attaches and can be dragged again
        if (typeof dragVerseId === "number") {
          unmarkVerseDragged(dragVerseId);
        }
        if (dragSectionId) {
          unmarkSectionDragged(dragSectionId);
        }
      } else {
        if (shouldDockPaper) {
          useDragState.getState().dockPaper();
        }
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
        if (ref.current.active) return;
        e.stopPropagation();
        setBodyCursor("grab");
      },
      onPointerOut: () => {
        if (ref.current.active) return;
        setBodyCursor("auto");
      },
    };
  }, [enabled, springX, springY, dragVerseId, dragSectionId]);
}
