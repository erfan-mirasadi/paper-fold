"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useFoldStore,
  getRawOffsetForStory,
} from "@/app/_components/canvas/orchestrator/ScrollManager";
import { useElevatedStore } from "@/app/stores/useElevatedStore";
import { usePopUpStore } from "@/app/stores/usePopUpStore";
import { usePaperStore } from "@/app/stores/usePaperStore";
import { useSurahLayoutRuntime } from "@/app/hooks/useSurahLayoutRuntime";
import { useLenis } from "@/app/_components/dom/LenisProvider";
import { foldSliderTrack } from "@/app/_components/canvas/3d-scene/foldSliderTrack";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** Pixel gap from the paper's real edge to the track, measured outward. */
const EDGE_GAP = 22;
/** Track length as a fraction of the paper's full edge — a compact scrubber. */
const TRACK_FRACTION = 0.4;
/**
 * Time constant (seconds) for how the fold trails the drag. Larger = smoother
 * / laggier; smaller = snappier. The paper eases toward the pointer target
 * instead of jumping 1:1, so dragging feels fluid rather than abrupt.
 */
const DRAG_SMOOTH_TAU = 0.09;

/** Neutral ink shade at a given opacity — flips with the light/dark theme. */
const ink = (a: number) =>
  `color-mix(in srgb, var(--foreground) ${a}%, transparent)`;

/**
 * FoldSliderOverlay — a compact vertical scrubber pinned just outside the
 * paper's right edge.
 *
 * The paper's live edge (endpoints + tilt) is read every frame from
 * foldSliderTrack, projected by FoldSliderTracker inside the canvas, so the
 * scrubber always hugs the right edge and follows any camera-preset rotation.
 * It renders only a short centered segment of that edge. The handle's position
 * along the segment mirrors the fold progress (useFoldStore.currentOffset), and
 * dragging it drives that same scroll-backed progress — so fold-by-slider and
 * fold-by-scroll are one unified story. Palette is pure ink (no accent color),
 * so it sits quietly inside the manuscript aesthetic in both themes.
 */
export const FoldSliderOverlay: React.FC = () => {
  const runtime = useSurahLayoutRuntime();
  const foldSteps = runtime.foldSteps;
  const stepCount = foldSteps.length;
  const hasFolds = stepCount > 1;

  const lenis = useLenis();

  // ── Mount gate (low-frequency booleans only — never per frame) ──────────
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isElevated = useElevatedStore(
    (s) => s.isAllSectionsMode || s.phase === "elevated",
  );
  const isPopUpActive = usePopUpStore(
    (s) => s.popUpAllOpen || s.popUpGroups.some((g) => g.isOpen),
  );
  const isPaperSwitching = usePaperStore(
    (s) => s.isSwitching && !s.newPaperRevealed,
  );

  const [isPageScrollable, setIsPageScrollable] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsPageScrollable(document.body.scrollHeight > window.innerHeight + 1);
    check();
    window.addEventListener("resize", check);
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", check);
      ro.disconnect();
    };
  }, []);

  const isActive =
    hasFolds &&
    !isIntroActive &&
    !isElevated &&
    !isPopUpActive &&
    !isPaperSwitching &&
    isPageScrollable;

  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // Live endpoints of the SHORT centered track segment (viewport px), kept in
  // sync by the rAF loop so drag math and rendering agree exactly.
  const segRef = useRef({ x0: 0, y0: 0, x1: 0, y1: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ── Drive the fold from a target story offset ───────────────────────────
  const applyProgress = useCallback(
    (progress: number) => {
      const clamped = clamp01(progress);
      useFoldStore.getState().setCurrentOffset(clamped);
      if (lenis) {
        const raw = getRawOffsetForStory(clamped, runtime.config);
        const limit = Math.max(lenis.limit, 0);
        if (limit > 0) {
          lenis.scrollTo(raw * limit, { immediate: true, force: true });
        }
      }
    },
    [lenis, runtime.config],
  );

  const progressFromPointer = useCallback((clientX: number, clientY: number) => {
    const s = segRef.current;
    const ax = s.x1 - s.x0;
    const ay = s.y1 - s.y0;
    const len2 = ax * ax + ay * ay;
    if (len2 < 1) return 0;
    const px = clientX - s.x0;
    const py = clientY - s.y0;
    return clamp01((px * ax + py * ay) / len2);
  }, []);

  // ── Magnetic snapping to fold steps ──────────────────────────────────────
  // Steps sit at i/(stepCount-1). During drag the raw progress is pulled onto
  // a step once inside its magnet radius, so the handle clicks into each fold
  // stage instead of floating freely between them.
  const stepInterval = stepCount > 1 ? 1 / (stepCount - 1) : 1;
  const snapRafRef = useRef(0);
  // Drag-smoothing state: the fold eases toward dragTarget instead of the
  // pointer driving it 1:1.
  const dragTargetRef = useRef(0);
  const smoothedRef = useRef(0);
  const dragRafRef = useRef(0);
  const lastTsRef = useRef(0);

  const nearestStep = useCallback(
    (raw: number) => clamp01(Math.round(raw / stepInterval) * stepInterval),
    [stepInterval],
  );

  const magnetize = useCallback(
    (raw: number) => {
      const stepVal = nearestStep(raw);
      // Pull radius = 38% of a step interval on each side.
      return Math.abs(raw - stepVal) < stepInterval * 0.38 ? stepVal : raw;
    },
    [nearestStep, stepInterval],
  );

  const cancelSnap = useCallback(() => {
    if (snapRafRef.current) {
      cancelAnimationFrame(snapRafRef.current);
      snapRafRef.current = 0;
    }
  }, []);

  const cancelDragSmoothing = useCallback(() => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = 0;
    }
  }, []);

  // While dragging, ease the fold toward the pointer target with time-based
  // damping (frame-rate independent) so the paper trails the drag smoothly.
  const runDragSmoothing = useCallback(() => {
    if (dragRafRef.current) return;
    lastTsRef.current = performance.now();
    const loop = (now: number) => {
      if (!draggingRef.current) {
        dragRafRef.current = 0;
        return;
      }
      let dt = (now - lastTsRef.current) / 1000;
      lastTsRef.current = now;
      if (dt > 0.05) dt = 0.05; // clamp after tab throttling
      const a = 1 - Math.exp(-dt / DRAG_SMOOTH_TAU);
      smoothedRef.current +=
        (dragTargetRef.current - smoothedRef.current) * a;
      applyProgress(smoothedRef.current);
      dragRafRef.current = requestAnimationFrame(loop);
    };
    dragRafRef.current = requestAnimationFrame(loop);
  }, [applyProgress]);

  // On release, ease exactly onto the nearest step (never rest between).
  const snapToNearest = useCallback(() => {
    cancelSnap();
    const start = useFoldStore.getState().currentOffset;
    const target = nearestStep(start);
    if (Math.abs(target - start) < 0.0004) {
      applyProgress(target);
      return;
    }
    const t0 = performance.now();
    const dur = 200;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      applyProgress(start + (target - start) * easeOut(t));
      snapRafRef.current = t < 1 ? requestAnimationFrame(step) : 0;
    };
    snapRafRef.current = requestAnimationFrame(step);
  }, [applyProgress, cancelSnap, nearestStep]);

  // Drag via window listeners (not pointer capture) so it keeps working across
  // the canvas and never gets stuck.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      // Only steer the target; the smoothing loop moves the fold.
      dragTargetRef.current = magnetize(progressFromPointer(e.clientX, e.clientY));
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      cancelDragSmoothing();
      snapToNearest();
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [progressFromPointer, magnetize, snapToNearest, cancelDragSmoothing]);

  useEffect(
    () => () => {
      cancelSnap();
      cancelDragSmoothing();
    },
    [cancelSnap, cancelDragSmoothing],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      cancelSnap();
      draggingRef.current = true;
      setIsDragging(true);
      document.body.style.cursor = "grabbing";
      // Start easing from where the fold currently sits toward the press point.
      smoothedRef.current = useFoldStore.getState().currentOffset;
      dragTargetRef.current = magnetize(
        progressFromPointer(e.clientX, e.clientY),
      );
      runDragSmoothing();
    },
    [progressFromPointer, magnetize, cancelSnap, runDragSmoothing],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 1 / Math.max(stepCount - 1, 1);
      const current = useFoldStore.getState().currentOffset;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        applyProgress(current + step);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        applyProgress(current - step);
      } else if (e.key === "Home") {
        e.preventDefault();
        applyProgress(0);
      } else if (e.key === "End") {
        e.preventDefault();
        applyProgress(1);
      }
    },
    [applyProgress, stepCount],
  );

  // ── Per-frame layout: pin the short track + handle to the live paper edge ─
  useEffect(() => {
    if (!isActive) return;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const track = trackRef.current;
      const handle = handleRef.current;
      const fill = fillRef.current;
      if (!track || !handle) return;

      const t = foldSliderTrack;
      const ex = t.bottomX - t.topX;
      const ey = t.bottomY - t.topY;
      const edgeLen = Math.hypot(ex, ey);

      if (!t.hasData || !t.onScreen || edgeLen < 8) {
        track.style.opacity = "0";
        handle.style.opacity = "0";
        handle.style.pointerEvents = "none";
        return;
      }

      const ux = ex / edgeLen;
      const uy = ey / edgeLen;
      // Outward normal (to the right of the top→bottom edge).
      const nx = uy;
      const ny = -ux;

      // Short centered segment of the edge.
      const segLen = edgeLen * TRACK_FRACTION;
      const midX = (t.topX + t.bottomX) / 2 + nx * EDGE_GAP;
      const midY = (t.topY + t.bottomY) / 2 + ny * EDGE_GAP;
      const x0 = midX - ux * segLen * 0.5;
      const y0 = midY - uy * segLen * 0.5;
      const x1 = midX + ux * segLen * 0.5;
      const y1 = midY + uy * segLen * 0.5;
      segRef.current.x0 = x0;
      segRef.current.y0 = y0;
      segRef.current.x1 = x1;
      segRef.current.y1 = y1;

      const angle = (Math.atan2(ey, ex) * 180) / Math.PI;
      track.style.width = `${segLen}px`;
      track.style.transform = `translate(${x0}px, ${y0}px) rotate(${angle}deg)`;
      track.style.opacity = "1";

      const progress = clamp01(useFoldStore.getState().currentOffset);
      if (fill) fill.style.width = `${progress * 100}%`;

      const hx = x0 + ux * segLen * progress;
      const hy = y0 + uy * segLen * progress;
      handle.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
      handle.style.opacity = "1";
      handle.style.pointerEvents = "auto";
      handle.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isActive]);

  if (!isActive) return null;

  const active = isDragging || isHovered;

  return (
    <>
      {/* Short track — a centered segment of the paper's right edge. */}
      <div
        ref={trackRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: 2,
          transformOrigin: "0 0",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 999990,
          transition: "opacity 0.5s ease",
          willChange: "transform, width, opacity",
        }}
      >
        {/* Base line */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: 1.5,
            borderRadius: 2,
            background: ink(16),
          }}
        />
        {/* Traveled portion */}
        <div
          ref={fillRef}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "0%",
            transform: "translateY(-50%)",
            height: 1.5,
            borderRadius: 2,
            background: ink(42),
          }}
        />
        {/* Fold-step notches */}
        {Array.from({ length: stepCount }).map((_, i) => {
          const pct = stepCount > 1 ? (i / (stepCount - 1)) * 100 : 0;
          return (
            <span
              key={foldSteps[i]?.id ?? i}
              style={{
                position: "absolute",
                left: `${pct}%`,
                top: "50%",
                width: 3,
                height: 3,
                marginLeft: -1.5,
                transform: "translateY(-50%)",
                borderRadius: "50%",
                background: ink(30),
              }}
            />
          );
        })}
      </div>

      {/* Handle — a compact ink knob with a fold crease; stays upright. */}
      <div
        ref={handleRef}
        role="slider"
        aria-label="Fold and unfold the page"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 999991,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          transition: "opacity 0.5s ease",
          willChange: "transform, opacity",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: ink(6),
            border: `1px solid ${ink(active ? 58 : 34)}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.14)",
            transform: active ? "scale(1.18)" : "scale(1)",
            transition:
              "transform 0.16s ease, border-color 0.16s ease",
          }}
        >
          {/* Fold crease — a single thin line the page pivots on. */}
          <span
            style={{
              width: 7,
              height: 1.5,
              borderRadius: 1,
              background: ink(active ? 72 : 46),
            }}
          />
        </div>
      </div>
    </>
  );
};
