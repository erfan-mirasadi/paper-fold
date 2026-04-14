"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useCameraStore } from "./useCameraStore";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_DATA,
  SURAH_TRANSFORMS,
  type ElementTransform,
} from "../../data/SurahConfig";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import { Shared3DTracker } from "../../shared/3DTracker";

// ============================================================================
// CONFIGURABLE CONSTANTS FOR NEON ANIMATION
// ============================================================================
export const NEON_CONFIG = {
  // Appearance
  lineColor: "#00ffff", // Bright neon blue/cyan outline
  glowColor: "#0088ff", // Darker blue for soft glow outer
  strokeWidth: 5, // Thickness of the neon border

  // Screen-space placement
  screenYOffsetPx: 5, // Push all verse neon overlays slightly downward

  // Animation timing
  animationDuration: 1.5, // Total seconds the draw animation takes
  fadeDelay: 50, // Percentage point where fade-out begins
};

// ============================================================================
// GEOMETRY CONSTANTS (Must match VerseBox in SharedUI.tsx)
// ============================================================================
const OVERLAY_ELEMENT_ID = "verse-neon-overlay";
const GLOW_PATH_ID = "verse-neon-path-glow";
const CORE_PATH_ID = "verse-neon-path-core";

const PAGE_ROTATION_X = -Math.PI / 4;
const VERSE_BOX_SHRINK_X = 0.001;
const DEFAULT_BORDER_WIDTH = 0.0055;
const GROUP_BORDER_WIDTH = 0.009;
const NON_PILL_RADIUS = 0.05;
const ARC_SEGMENTS_PER_CORNER = 9;
const MIN_OVERLAY_SIZE_PX = 2;
const Z_FRONT = PAGE_DEPTH / 2 + 0.003;

type Point3 = [number, number, number];

interface VerseNeonShape {
  id: number;
  cx: number;
  cy: number;
  cz: number;
  perimeter: Point3[];
}

function buildRoundedRectPerimeter(
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  radius: number,
): Point3[] {
  const r = Math.min(radius, w / 2, h / 2);
  const left = cx - w / 2;
  const right = cx + w / 2;
  const top = cy + h / 2;
  const bottom = cy - h / 2;

  const points: Point3[] = [];

  const pushPoint = (x: number, y: number) => {
    points.push([x, y, cz]);
  };

  const pushArc = (
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
  ) => {
    for (let i = 1; i <= ARC_SEGMENTS_PER_CORNER; i++) {
      const t = i / ARC_SEGMENTS_PER_CORNER;
      const angle = startAngle + (endAngle - startAngle) * t;
      pushPoint(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
    }
  };

  // Clockwise path around the outer border geometry
  pushPoint(left + r, top);
  pushPoint(right - r, top);
  pushArc(right - r, top - r, Math.PI / 2, 0);

  pushPoint(right, bottom + r);
  pushArc(right - r, bottom + r, 0, -Math.PI / 2);

  pushPoint(left + r, bottom);
  pushArc(left + r, bottom + r, -Math.PI / 2, -Math.PI);

  pushPoint(left, top - r);
  pushArc(left + r, top - r, Math.PI, Math.PI / 2);

  return points;
}

function createNeonShape(
  id: number,
  vt: ElementTransform,
  options: { isPill: boolean; borderWidth?: number },
): VerseNeonShape {
  const borderWidth = options.borderWidth ?? DEFAULT_BORDER_WIDTH;

  const finalX = vt.x + VERSE_BOX_SHRINK_X;
  const finalW = Math.max(vt.w - VERSE_BOX_SHRINK_X * 2, 0.0001);

  const outerW = finalW + borderWidth * 2;
  const outerH = vt.h + borderWidth * 2;
  const baseRadius = options.isPill ? vt.h / 2 : NON_PILL_RADIUS;
  const outerRadius = baseRadius + borderWidth;

  const outerX = finalX - borderWidth;
  const outerTopY = vt.y + borderWidth;

  const cx = outerX + outerW / 2 - PAGE_WIDTH / 2;
  const cy = outerTopY - outerH / 2;

  return {
    id,
    cx,
    cy,
    cz: Z_FRONT,
    perimeter: buildRoundedRectPerimeter(
      cx,
      cy,
      Z_FRONT,
      outerW,
      outerH,
      outerRadius,
    ),
  };
}

function buildNeonShapes(): VerseNeonShape[] {
  const shapes: VerseNeonShape[] = [];

  const s1 = SURAH_TRANSFORMS.s1;
  SURAH_DATA.section1.gridVerses.forEach((v) => {
    const vt = s1.verses[v.number];
    if (vt) {
      shapes.push(createNeonShape(v.number, vt, { isPill: true }));
    }
  });

  shapes.push(
    createNeonShape(SURAH_DATA.section1.anaAyet.number, s1.anaAyet, {
      isPill: false,
    }),
  );

  const s2 = SURAH_TRANSFORMS.s2;
  shapes.push(
    createNeonShape(SURAH_DATA.section2.introVerse.number, s2.introVerse, {
      isPill: false,
    }),
  );

  SURAH_DATA.section2.colorGroups.forEach((group, gIdx) => {
    const gTransform = s2.groups[gIdx];
    group.verses.forEach((v) => {
      const vt = gTransform.verses[v.number];
      if (vt) {
        shapes.push(
          createNeonShape(v.number, vt, {
            isPill: true,
            borderWidth: GROUP_BORDER_WIDTH,
          }),
        );
      }
    });
  });

  shapes.push(
    createNeonShape(SURAH_DATA.section2.outroVerse.number, s2.outroVerse, {
      isPill: false,
    }),
  );

  return shapes;
}

const NEON_SHAPES = buildNeonShapes();
const NEON_SHAPES_BY_ID = new Map<number, VerseNeonShape>(
  NEON_SHAPES.map((shape) => [shape.id, shape]),
);

// ============================================================================
// 1. NEON 3D TRACKER (Inside <Canvas>)
// ============================================================================
export function VerseNeonTracker() {
  const activeVerseId = useCameraStore((s) => s.activeVerseId);
  const phase = useCameraStore((s) => s.phase);

  const { camera, size } = useThree();
  const pageTiltRef = useRef<Group>(null);
  const projectedPoint = useRef(new Vector3());
  const overlayRef = useRef<HTMLElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const lastPathRef = useRef("");

  useEffect(() => {
    overlayRef.current = null;
    glowPathRef.current = null;
    corePathRef.current = null;
    lastPathRef.current = "";
  }, [activeVerseId]);

  if (activeVerseId === null || phase === "idle" || phase === "zooming_out") {
    return null;
  }

  const shape = NEON_SHAPES_BY_ID.get(activeVerseId);
  if (!shape) return null;

  const hideOverlay = (el: HTMLElement | null) => {
    if (!el) return;
    el.style.opacity = "0";
  };

  return (
    <group ref={pageTiltRef} rotation-x={PAGE_ROTATION_X}>
      <Shared3DTracker
        position={[shape.cx, shape.cy + PAGE_HEIGHT / 2, shape.cz]}
        domElementId={OVERLAY_ELEMENT_ID}
        onFrameUpdate={(_, __, isOnScreen, elFromTracker) => {
          const root = pageTiltRef.current;
          if (!root) return;

          const el =
            elFromTracker ??
            overlayRef.current ??
            (document.getElementById(OVERLAY_ELEMENT_ID) as HTMLElement | null);

          if (!el || !isOnScreen) {
            hideOverlay(el);
            return;
          }

          overlayRef.current = el;

          if (!glowPathRef.current || !corePathRef.current) {
            glowPathRef.current = el.querySelector<SVGPathElement>(
              `#${GLOW_PATH_ID}`,
            );
            corePathRef.current = el.querySelector<SVGPathElement>(
              `#${CORE_PATH_ID}`,
            );
          }

          const glowPath = glowPathRef.current;
          const corePath = corePathRef.current;
          if (!glowPath || !corePath) {
            hideOverlay(el);
            return;
          }

          let minX = Number.POSITIVE_INFINITY;
          let maxX = Number.NEGATIVE_INFINITY;
          let minY = Number.POSITIVE_INFINITY;
          let maxY = Number.NEGATIVE_INFINITY;
          let hasVisiblePoint = false;

          // PERFORMANCE OPTIMIZATION 1: First pass to calculate bounds.
          // Avoiding array allocations (e.g. projected.push) prevents Garbage Collection
          // stutters inside the critical 60FPS loop.
          for (let i = 0; i < shape.perimeter.length; i++) {
            const [localX, localY, localZ] = shape.perimeter[i];
            const p = projectedPoint.current.set(
              localX,
              localY + PAGE_HEIGHT / 2,
              localZ,
            );
            root.localToWorld(p);
            p.project(camera);

            if (p.z > -1 && p.z < 1.2) {
              hasVisiblePoint = true;
            }

            const sx = (p.x * 0.5 + 0.5) * size.width;
            const sy = (p.y * -0.5 + 0.5) * size.height;

            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
            if (sy < minY) minY = sy;
            if (sy > maxY) maxY = sy;
          }

          const width = maxX - minX;
          const height = maxY - minY;

          if (
            !hasVisiblePoint ||
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width < MIN_OVERLAY_SIZE_PX ||
            height < MIN_OVERLAY_SIZE_PX
          ) {
            hideOverlay(el);
            return;
          }

          // PERFORMANCE OPTIMIZATION 2: Build the SVG path string directly.
          // Eliminating .map().join() saves massive CPU cycles per frame.
          let pathData = "";
          for (let i = 0; i < shape.perimeter.length; i++) {
            const [localX, localY, localZ] = shape.perimeter[i];
            const p = projectedPoint.current.set(
              localX,
              localY + PAGE_HEIGHT / 2,
              localZ,
            );
            root.localToWorld(p);
            p.project(camera);

            const sx = (p.x * 0.5 + 0.5) * size.width;
            const sy = (p.y * -0.5 + 0.5) * size.height;

            const sxStr = (sx - minX).toFixed(2);
            const syStr = (sy - minY).toFixed(2);

            pathData +=
              i === 0 ? `M ${sxStr} ${syStr}` : ` L ${sxStr} ${syStr}`;
          }
          pathData += " Z";

          if (pathData !== lastPathRef.current) {
            lastPathRef.current = pathData;
            glowPath.setAttribute("d", pathData);
            corePath.setAttribute("d", pathData);
          }

          // eslint-disable-next-line react-hooks/immutability
          el.style.opacity = "1";
          el.style.width = `${width.toFixed(2)}px`;
          el.style.height = `${height.toFixed(2)}px`;
          el.style.transform = `translate3d(${minX.toFixed(1)}px, ${(minY + NEON_CONFIG.screenYOffsetPx).toFixed(1)}px, 0)`;
        }}
      />
    </group>
  );
}

// ============================================================================
// 2. NEON 2D HTML OVERLAY (Outside <Canvas>, like in page.tsx)
// ============================================================================
export function VerseNeonHTMLOverlay() {
  const activeVerseId = useCameraStore((s) => s.activeVerseId);
  const phase = useCameraStore((s) => s.phase);

  if (activeVerseId === null || phase === "zooming_out" || phase === "idle") {
    return null;
  }

  return (
    <div
      id={OVERLAY_ELEMENT_ID}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 100,
        opacity: 0,
        transition: "none",
        willChange: "transform, width, height, opacity",
        width: "0px",
        height: "0px",
      }}
    >
      <svg
        key={`neon-${activeVerseId}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PERFORMANCE OPTIMIZATION 3: 
          Removed the heavy <filter> and <feGaussianBlur> tags.
          Applying SVG filters to an actively animating path causes severe GPU bottlenecking.
          Using CSS filter: drop-shadow achieves the same visual glow with native hardware acceleration. 
        */}
        <path
          id={GLOW_PATH_ID}
          d=""
          fill="none"
          stroke={NEON_CONFIG.lineColor}
          strokeWidth={NEON_CONFIG.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            // Creating a dual-layered drop-shadow to accurately mimic the previous feGaussianBlur + feFlood
            filter: `drop-shadow(0px 0px 6px ${NEON_CONFIG.glowColor}) drop-shadow(0px 0px 10px ${NEON_CONFIG.glowColor})`,
          }}
          pathLength="100"
          className="verse-neon-anim"
        />

        <path
          id={CORE_PATH_ID}
          d=""
          fill="none"
          stroke="#ffffff"
          strokeWidth={NEON_CONFIG.strokeWidth * 0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          className="verse-neon-anim"
        />

        <style>{`
          .verse-neon-anim {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: verseNeonDraw ${NEON_CONFIG.animationDuration}s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }

          @keyframes verseNeonDraw {
            0% { stroke-dashoffset: 100; opacity: 1; }
            ${NEON_CONFIG.fadeDelay}% { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}
