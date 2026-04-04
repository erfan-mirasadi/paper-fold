"use client";

import { UiRect } from "./SharedUI";

interface MainCardProps {
  PW: number;
  PAGE_HEIGHT: number;
}

export function Boarder({ PW, PAGE_HEIGHT }: MainCardProps) {
  // Card UI Layout Math - (Re-derived from original for nested approach)
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
      {/* 2. Outer Halo Layer (The soft inner/outer black glow) */}
      <UiRect
        x={HALO_X}
        y={HALO_Y}
        z={-0.01} // Lowest depth for the halo to show behind frame
        w={HALO_W}
        h={HALO_H}
        radius={FRAME_RADIUS + 0.02} // Sightly larger radius for soft shadow
        color={HALO_COLOR}
        shadow // Keep the shadow property for outer depth
        material-opacity={0.1} // Key for soft halo effect
      />
      {/* 3. Main Thick White Frame Layer */}
      <UiRect
        x={FRAME_X}
        y={FRAME_Y}
        z={0} // Middle depth
        w={FRAME_W}
        h={FRAME_H}
        radius={FRAME_RADIUS}
        color={FRAME_COLOR}
      />
      {/* 4. Inner Rich Card Fill Layer (for Content) */}
      <UiRect
        x={INNER_FILL_X}
        y={INNER_FILL_Y}
        z={0.01} // Top depth of card structure
        w={INNER_FILL_W}
        h={INNER_FILL_H}
        radius={FRAME_RADIUS - 0.002} // Sightly smaller for tight fit
        color={INNER_CARD_COLOR}
      />
    </group>
  );
}
