"use client";
import { UiRect } from "./SharedUI";

interface BoarderProps {
  PW: number;
  PAGE_HEIGHT: number;
  isBumpMap?: boolean;
}

export function Boarder({ PW, PAGE_HEIGHT, isBumpMap = false }: BoarderProps) {
  const ORIGINAL_CARD_PAD_X = 0.02;
  const ORIGINAL_CARD_PAD_TOP = 0.02;
  const ORIGINAL_CARD_PAD_BOTTOM = 0.02;

  const FRAME_PAD = 0.02; // White border thickness
  const HALO_PAD = 0.001; // Subtle gap creating the shadow/glow halo

  const INNER_CARD_COLOR = "#EBEBDF"; // Warm off-white inner fill
  const FRAME_COLOR = "#ffffff"; // Pure white frame
  const HALO_COLOR = "#ADADAD"; // Soft grey halo shadow

  // Inner fill dimensions (inside the white frame)
  const INNER_FILL_W = PW - ORIGINAL_CARD_PAD_X * 2;
  const INNER_FILL_H =
    PAGE_HEIGHT - ORIGINAL_CARD_PAD_TOP - ORIGINAL_CARD_PAD_BOTTOM;
  const INNER_FILL_X = ORIGINAL_CARD_PAD_X;
  const INNER_FILL_Y = -ORIGINAL_CARD_PAD_TOP;

  // White frame dimensions
  const FRAME_W = INNER_FILL_W + FRAME_PAD * 2;
  const FRAME_H = INNER_FILL_H + FRAME_PAD * 2;
  const FRAME_X = INNER_FILL_X - FRAME_PAD;
  const FRAME_Y = INNER_FILL_Y + FRAME_PAD;

  // Halo shadow ring dimensions (outermost layer)
  const HALO_W = FRAME_W + HALO_PAD * 2;
  const HALO_H = FRAME_H + HALO_PAD * 2;
  const HALO_X = FRAME_X - HALO_PAD;
  const HALO_Y = FRAME_Y + HALO_PAD;

  const FRAME_RADIUS = 0.06;

  return (
    <group position={[0, 0, -0.01]}>
      {/* Outer halo — invisible on bump map pass (no physical height) */}
      <UiRect
        x={HALO_X}
        y={HALO_Y}
        z={-0.01}
        w={HALO_W}
        h={HALO_H}
        radius={FRAME_RADIUS + 0.02}
        color={HALO_COLOR}
        shadow
        isBumpMap={isBumpMap}
        bumpColor="#000000"
      />
      {/* White frame — max extrusion on bump map */}
      <UiRect
        x={FRAME_X}
        y={FRAME_Y}
        z={0}
        w={FRAME_W}
        h={FRAME_H}
        radius={FRAME_RADIUS}
        color={FRAME_COLOR}
        isBumpMap={isBumpMap}
        bumpColor="#ffffff"
      />
      {/* Inner warm fill — slightly indented from the frame */}
      <UiRect
        x={INNER_FILL_X}
        y={INNER_FILL_Y}
        z={0.01}
        w={INNER_FILL_W}
        h={INNER_FILL_H}
        radius={FRAME_RADIUS - 0.002}
        color={INNER_CARD_COLOR}
        isBumpMap={isBumpMap}
        bumpColor="#111111"
      />
    </group>
  );
}
