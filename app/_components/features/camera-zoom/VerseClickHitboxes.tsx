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
import { MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_DATA,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import { useCameraStore } from "./useCameraStore";

// Reusable objects to avoid allocations on every click/render
const _worldPos = new Vector3();
const hitBoxMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const hitBoxGeom = new PlaneGeometry(1, 1);

interface VerseHitbox {
  id: number;
  cx: number;
  cy: number;
  cz: number;
  w: number;
  h: number;
}

function buildHitboxes(): VerseHitbox[] {
  const hitboxes: VerseHitbox[] = [];
  const zFront = PAGE_DEPTH / 2 + 0.003;

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

  const anaAyet = s1.anaAyet;
  hitboxes.push({
    id: SURAH_DATA.section1.anaAyet.number,
    cx: anaAyet.x + anaAyet.w / 2 - PAGE_WIDTH / 2,
    cy: anaAyet.y - anaAyet.h / 2,
    cz: zFront,
    w: anaAyet.w,
    h: anaAyet.h,
  });

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

const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  if (useCameraStore.getState().phase === "idle") {
    document.body.style.cursor = "pointer";
  }
};

const handlePointerOut = () => {
  if (useCameraStore.getState().phase === "idle") {
    document.body.style.cursor = "grab";
  }
};

const handleClick = (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  if (e.delta > 2) return;
  if (useCameraStore.getState().phase !== "idle") return;

  _worldPos.set(0, 0, 0);
  const worldPos = e.object.getWorldPosition(_worldPos);

  const id = e.object.userData.id;
  if (typeof id === "number") {
    useCameraStore.getState().focusOnVerse(id, {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    });
  }
};

export function VerseClickHitboxes() {
  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {HITBOXES.map((hb) => (
        <mesh
          key={`hitbox-${hb.id}`}
          position={[hb.cx, hb.cy, hb.cz]}
          scale={[hb.w, hb.h, 1]}
          userData={{ id: hb.id }}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          geometry={hitBoxGeom}
          material={hitBoxMaterial}
        />
      ))}
    </group>
  );
}
