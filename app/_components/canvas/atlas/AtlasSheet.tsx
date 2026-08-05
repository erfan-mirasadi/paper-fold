"use client";

/**
 * AtlasSheet — one physical piece of paper on the board.
 *
 * A sheet owns its whole appearance: its paper, its tilt, the capsules drawn
 * on it, and how it answers the pointer. Nothing is shared with its
 * neighbours, so a sheet can be moved, re-inked or re-designed without any
 * other sheet noticing — the property the earlier single-page model could not
 * offer.
 *
 * ── WHY THE CONTENT IS REAL GEOMETRY ────────────────────────────────────────
 *
 * The main reading experience draws a page into an offscreen RenderTexture and
 * projects it onto a folding mesh, because that page bends. Board sheets do
 * not bend, and seven live RenderTextures would be seven offscreen scenes
 * competing for the frame — the one thing the existing paper pipeline is most
 * careful to avoid. So the capsules here are ordinary meshes: cheap, sharp at
 * any zoom, and free of the settle pipeline entirely.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Group, Mesh } from "three";

import type { AtlasSheetSpec } from "../../../data/configs/yasin/sheets";
import { useAtlasStore } from "../../../stores/useAtlasStore";
import { RoundedShapeComponent } from "../SurahLayout/SharedUI";

/** Padding between a sheet's edge and its capsules, as a fraction of size. */
const CONTENT_INSET = 0.12;
/** Gap between capsule rows, as a fraction of a row's height. */
const ROW_GAP_RATIO = 0.22;
/** Gap between columns, as a fraction of a column's width. */
const COLUMN_GAP_RATIO = 0.08;

/** How far a sheet lifts toward the viewer when hovered, world units. */
const HOVER_LIFT = 0.035;
/** How far the focused sheet lifts, world units. */
const FOCUS_LIFT = 0.06;

interface CapsuleLayout {
  verseId: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Places a sheet's capsules in its own local space (origin at the sheet's
 * centre). Pure geometry from the sheet's own numbers, so it re-solves for
 * free whenever a sheet is resized or given more verses.
 */
function layoutCapsules(sheet: AtlasSheetSpec): CapsuleLayout[] {
  const columns = Math.max(1, sheet.columns);
  const rows = Math.ceil(sheet.verseIds.length / columns);

  const innerW = sheet.width * (1 - CONTENT_INSET);
  const innerH = sheet.height * (1 - CONTENT_INSET);

  const columnPitch = innerW / columns;
  const capsuleW = columnPitch * (1 - COLUMN_GAP_RATIO);

  const rowPitch = innerH / rows;
  const capsuleH = rowPitch / (1 + ROW_GAP_RATIO);

  return sheet.verseIds.map((verseId, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);

    return {
      verseId,
      // Local space: left edge of the content box plus half a pitch centres
      // the capsule in its own column/row.
      x: -innerW / 2 + columnPitch * (col + 0.5),
      y: innerH / 2 - rowPitch * (row + 0.5),
      w: capsuleW,
      h: capsuleH,
    };
  });
}

interface AtlasSheetProps {
  sheet: AtlasSheetSpec;
}

export function AtlasSheet({ sheet }: AtlasSheetProps) {
  const groupRef = useRef<Group>(null);
  const capsules = useMemo(() => layoutCapsules(sheet), [sheet]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { focusedSheetId, hoveredSheetId } = useAtlasStore.getState();
    const isFocused = focusedSheetId === sheet.id;
    const isHovered = hoveredSheetId === sheet.id;

    // A sheet lifts toward the viewer when it is the one being looked at or
    // pointed at. Eased rather than set, so the board never snaps.
    const targetZ = isFocused ? FOCUS_LIFT : isHovered ? HOVER_LIFT : 0;
    const ease = 1 - Math.pow(0.001, delta);
    group.position.z += (targetZ - group.position.z) * ease;
  });

  return (
    <group
      ref={groupRef}
      position={[sheet.x, sheet.y, 0]}
      rotation={[0, 0, sheet.rotation]}
      onPointerOver={(e) => {
        e.stopPropagation();
        useAtlasStore.getState().setHovered(sheet.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        const { hoveredSheetId, setHovered } = useAtlasStore.getState();
        if (hoveredSheetId === sheet.id) setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        useAtlasStore.getState().toggleSheet(sheet.id);
      }}
    >
      {/* The paper itself. Also the pointer target: it spans the whole sheet,
          so the blank margins are clickable too — pointing at a page means
          pointing anywhere on it, not only at its writing. */}
      <mesh>
        <planeGeometry args={[sheet.width, sheet.height]} />
        <meshStandardMaterial color={sheet.paper} roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Cut edge, a hair behind the paper so it reads as the sheet's rim. */}
      <mesh position={[0, 0, -0.0008]}>
        <planeGeometry args={[sheet.width + 0.008, sheet.height + 0.008]} />
        <meshBasicMaterial color={sheet.ink} transparent opacity={0.35} />
      </mesh>

      {capsules.map((c) => (
        <group key={c.verseId} position={[c.x, c.y, 0.001]}>
          {/* RoundedShapeComponent draws from its TOP-LEFT corner (+x right,
              -y down) — the convention UiRect relies on. The capsule
              positions solved above are centres, so each shape is shifted by
              half its own size to sit on its centre. */}
          <mesh position={[-c.w / 2, c.h / 2, 0]}>
            <RoundedShapeComponent w={c.w} h={c.h} radius={c.h / 2} />
            <meshBasicMaterial color={sheet.ink} />
          </mesh>
          <mesh position={[-(c.w - 0.006) / 2, (c.h - 0.006) / 2, 0.0004]}>
            <RoundedShapeComponent
              w={c.w - 0.006}
              h={c.h - 0.006}
              radius={(c.h - 0.006) / 2}
            />
            <meshBasicMaterial color={sheet.paper} />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={c.h * 0.42}
            color={sheet.ink}
            anchorX="center"
            anchorY="middle"
          >
            {String(c.verseId)}
          </Text>
        </group>
      ))}
    </group>
  );
}
