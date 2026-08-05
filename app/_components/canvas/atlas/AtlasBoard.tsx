"use client";

/**
 * AtlasBoard — the seven sheets, the thread between them, and the camera.
 *
 * Deliberately thin. Everything that could be data lives in
 * `data/configs/yasin/sheets.ts`, so this file states only the composition:
 * a backdrop the sheets lie on, the thread beneath them, and the sheets on
 * top. Adding, moving or re-inking a sheet never touches this file.
 */

import { AtlasCamera } from "./AtlasCamera";
import { AtlasSheet } from "./AtlasSheet";
import { AtlasThread } from "./AtlasThread";
import { SHEETS, boardBounds } from "../../../data/configs/yasin/sheets";
import { useAtlasStore } from "../../../stores/useAtlasStore";

/** How far past the sheets the backdrop extends, world units. */
const BACKDROP_BLEED = 2.5;

export function AtlasBoard() {
  const bounds = boardBounds();

  return (
    <group>
      <AtlasCamera />

      {/* The surface the sheets lie on. It is also the "click away to pull
          back" target: a click that reaches the backdrop is a click that
          missed every sheet, which is exactly the gesture for leaving a
          sheet — no close button required. */}
      <mesh
        position={[bounds.centerX, bounds.centerY, -0.05]}
        onClick={(e) => {
          e.stopPropagation();
          useAtlasStore.getState().clearFocus();
        }}
      >
        <planeGeometry
          args={[
            bounds.width + BACKDROP_BLEED,
            bounds.height + BACKDROP_BLEED,
          ]}
        />
        <meshStandardMaterial color="#191919" roughness={1} metalness={0} />
      </mesh>

      <AtlasThread />

      {SHEETS.map((sheet) => (
        <AtlasSheet key={sheet.id} sheet={sheet} />
      ))}
    </group>
  );
}
