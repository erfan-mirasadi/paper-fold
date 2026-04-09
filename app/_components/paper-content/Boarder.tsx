"use client";

import { UiRect } from "./SharedUI";

interface MainCardProps {
  PW: number;
  PAGE_HEIGHT: number;
  isBumpMap?: boolean; // Added bump map prop
}

export function Boarder({ PW, PAGE_HEIGHT, isBumpMap = false }: MainCardProps) {
  const ORIGINAL_CARD_PAD_X = 0.028;
  const ORIGINAL_CARD_PAD_TOP = 0.029;
  const ORIGINAL_CARD_PAD_BOTTOM = 0.029;

  // New dimension constants to match user request
  const FRAME_PAD = 0.02; // Thick white border
  const HALO_PAD = 0.001; // Gap for shadow/glow effect

  // New Rich Color Constants
  const INNER_CARD_COLOR = "#EBEBDF"; // Rich, warm off-white (Inner fill)
  const FRAME_COLOR = "#ffffff"; // Pure clean white frame
  const HALO_COLOR = "#ADADAD"; // Subtle, slightly warm black halo

  // Derived dimensions for nested layers, based on existing card dimensions
  const INNER_FILL_W = PW - ORIGINAL_CARD_PAD_X * 2;
  const INNER_FILL_H =
    PAGE_HEIGHT - ORIGINAL_CARD_PAD_TOP - ORIGINAL_CARD_PAD_BOTTOM;
  const INNER_FILL_X = ORIGINAL_CARD_PAD_X;
  const INNER_FILL_Y = -ORIGINAL_CARD_PAD_TOP;

  const FRAME_W = INNER_FILL_W + FRAME_PAD * 2;
  const FRAME_H = INNER_FILL_H + FRAME_PAD * 2;
  const FRAME_X = INNER_FILL_X - FRAME_PAD;
  const FRAME_Y = INNER_FILL_Y + FRAME_PAD;

  const HALO_W = FRAME_W + HALO_PAD * 2;
  const HALO_H = FRAME_H + HALO_PAD * 2;
  const HALO_X = FRAME_X - HALO_PAD;
  const HALO_Y = FRAME_Y + HALO_PAD;

  // Consistent radius list for rounded corners across layers
  const FRAME_RADIUS = 0.06; // Large radius list for main frame and fill. Use defaults.

  return (
    <group position={[0, 0, -0.01]}>
      {/* 2. Outer Halo Layer - Invisible in Bump Map */}
      <UiRect
        x={HALO_X}
        y={HALO_Y}
        z={-0.01}
        w={HALO_W}
        h={HALO_H}
        radius={FRAME_RADIUS + 0.02}
        color={HALO_COLOR}
        shadow
        material-opacity={0.1}
        isBumpMap={isBumpMap}
        bumpColor="#000000" // Halo creates no physical height
      />
      {/* 3. Main Thick White Frame Layer - Highly Extruded */}
      <UiRect
        x={FRAME_X}
        y={FRAME_Y}
        z={0}
        w={FRAME_W}
        h={FRAME_H}
        radius={FRAME_RADIUS}
        color={FRAME_COLOR}
        isBumpMap={isBumpMap}
        bumpColor="#ffffff" // Max height
      />
      {/* 4. Inner Rich Card Fill Layer - Slightly lower than the frame */}
      <UiRect
        x={INNER_FILL_X}
        y={INNER_FILL_Y}
        z={0.01}
        w={INNER_FILL_W}
        h={INNER_FILL_H}
        radius={FRAME_RADIUS - 0.002}
        color={INNER_CARD_COLOR}
        isBumpMap={isBumpMap}
        bumpColor="#111111" // Just slightly above the black background base
      />
    </group>
  );
}
