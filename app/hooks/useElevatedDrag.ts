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
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../stores/useElevatedStore";
import { PAGE_WIDTH, PAGE_HEIGHT } from "../data/SurahConfig";
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
 */
export function useElevatedDrag({
  enabled,
  springX,
  springY,
  dragVerseId,
  dragSectionId,
  sectionBounds,
  sectionSpringX,
  sectionSpringY,
}: {
  enabled: boolean;
  springX: SpringValue<number>;
  springY: SpringValue<number>;
  dragVerseId?: number;
  dragSectionId?: ElevatedSectionId;
  sectionBounds?: SectionBounds;
  sectionSpringX?: SpringValue<number>;
  sectionSpringY?: SpringValue<number>;
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
    // Completely disable drag during the intro sequence
    if (useFoldStore.getState().isIntroActive) return EMPTY_DRAG_BINDINGS;
    if (!enabled) return EMPTY_DRAG_BINDINGS;

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
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

      let shouldSnapHome = false;
      if (e.ray.intersectPlane(s.plane, _hit)) {
        const surfacesRoot = e.eventObject.parent;
        if (surfacesRoot) {
          const localHit = surfacesRoot.worldToLocal(_hit.clone());
          if (sectionBounds) {
            const sx = sectionSpringX ? sectionSpringX.get() : 0;
            const sy = sectionSpringY ? sectionSpringY.get() : 0;
            shouldSnapHome =
              localHit.x >= sectionBounds.minX + sx &&
              localHit.x <= sectionBounds.maxX + sx &&
              localHit.y >= sectionBounds.minY + sy &&
              localHit.y <= sectionBounds.maxY + sy;
          } else if (!isAllSectionsMode) {
            shouldSnapHome =
              localHit.x >= -PAGE_WIDTH / 2 &&
              localHit.x <= PAGE_WIDTH / 2 &&
              localHit.y <= 0 &&
              localHit.y >= -PAGE_HEIGHT;
          }
        }
      }

      if (shouldSnapHome) {
        springX.start(0);
        springY.start(0);
        if (typeof dragVerseId === "number") unmarkVerseDragged(dragVerseId);
        if (dragSectionId) unmarkSectionDragged(dragSectionId);
      } else if (shouldDockPaper) {
        useDragState.getState().dockPaper();
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
  }, [
    enabled,
    springX,
    springY,
    dragVerseId,
    dragSectionId,
    sectionBounds,
    sectionSpringX,
    sectionSpringY,
  ]);
}
