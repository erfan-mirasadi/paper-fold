"use client";

// ============================================================================
// VERSE CLICK HITBOXES
// ============================================================================
// Renders invisible planes over each verse capsule on the paper surface.
// When clicked, they write the verse's 3D world position into the camera
// store, triggering the CameraManager to zoom in.
//
// These meshes sit at the same Z as the paper front-face, are fully
// transparent, but have `pointer-events` so R3F's raycaster picks them up.
// ============================================================================

import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_DATA,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import { useCameraStore } from "./useCameraStore";

// Reusable vector to avoid allocations on every click
const _worldPos = new Vector3();

// Build a flat list of every clickable verse with its world-space box.
interface VerseHitbox {
  id: number;
  /** Center X in paper-local space (parent group is already offset by PAGE_HEIGHT/2 on Y) */
  cx: number;
  cy: number;
  cz: number;
  w: number;
  h: number;
}

function buildHitboxes(): VerseHitbox[] {
  const hitboxes: VerseHitbox[] = [];
  const zFront = PAGE_DEPTH / 2 + 0.003;

  // ── Section 1 grid verses (1-4) ───────────────────────────────────────
  const s1 = SURAH_TRANSFORMS.s1;
  SURAH_DATA.section1.gridVerses.forEach((v) => {
    const vt = s1.verses[v.number];
    if (!vt) return;
    hitboxes.push({
      id: v.number,
      cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
      cy: vt.y - vt.h / 2,
      cz: zFront,
      w: vt.w,
      h: vt.h,
    });
  });

  // ── Section 1 AnaAyet (verse 5) ───────────────────────────────────────
  const anaAyet = s1.anaAyet;
  hitboxes.push({
    id: SURAH_DATA.section1.anaAyet.number,
    cx: anaAyet.x + anaAyet.w / 2 - PAGE_WIDTH / 2,
    cy: anaAyet.y - anaAyet.h / 2,
    cz: zFront,
    w: anaAyet.w,
    h: anaAyet.h,
  });

  // ── Section 2 intro verse (6) ─────────────────────────────────────────
  const s2 = SURAH_TRANSFORMS.s2;
  const intro = s2.introVerse;
  hitboxes.push({
    id: SURAH_DATA.section2.introVerse.number,
    cx: intro.x + intro.w / 2 - PAGE_WIDTH / 2,
    cy: intro.y - intro.h / 2,
    cz: zFront,
    w: intro.w,
    h: intro.h,
  });

  // ── Section 2 group verses (7-18) ─────────────────────────────────────
  SURAH_DATA.section2.colorGroups.forEach((group, gIdx) => {
    const gTransform = s2.groups[gIdx];
    group.verses.forEach((v) => {
      const vt = gTransform.verses[v.number];
      if (!vt) return;
      hitboxes.push({
        id: v.number,
        cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
        cy: vt.y - vt.h / 2,
        cz: zFront,
        w: vt.w,
        h: vt.h,
      });
    });
  });

  // ── Section 2 outro verse (19) ────────────────────────────────────────
  const outro = s2.outroVerse;
  hitboxes.push({
    id: SURAH_DATA.section2.outroVerse.number,
    cx: outro.x + outro.w / 2 - PAGE_WIDTH / 2,
    cy: outro.y - outro.h / 2,
    cz: zFront,
    w: outro.w,
    h: outro.h,
  });

  return hitboxes;
}

const HITBOXES = buildHitboxes();

export function VerseClickHitboxes() {
  const focusOnVerse = useCameraStore((s) => s.focusOnVerse);
  const phase = useCameraStore((s) => s.phase);

  const handleClick = (hb: VerseHitbox, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    if (e.delta > 2) return;

    if (useCameraStore.getState().phase !== "idle") return;

    _worldPos.set(0, 0, 0);
    const worldPos = e.object.getWorldPosition(_worldPos);

    focusOnVerse(hb.id, {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    });
  };

  const isIdle = phase === "idle";

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {HITBOXES.map((hb) => (
        <mesh
          key={`hitbox-${hb.id}`}
          position={[hb.cx, hb.cy, hb.cz]}
          onClick={(e) => handleClick(hb, e)}
          onPointerOver={() => {
            if (isIdle) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            if (isIdle) document.body.style.cursor = "grab";
          }}
        >
          <planeGeometry args={[hb.w, hb.h]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
