"use client";

// ============================================================================
// HOLLOW CONNECTOR
// Location: SurahLayout/components/HollowConnector.tsx
// Purpose: Renders the decorative framed border boxes that visually "connect"
//          the intro/outro verses to the main VerseGroup cluster rows inside
//          Section 2. Top connector bridges down, bottom bridges up.
//          All positional math is derived from the passed `layout` prop.
// ============================================================================

import { UiRect } from "./SharedUI";
import {
  HOLLOW_BORDER_COLOR,
  S2_OUTER_BG,
  BUMP_MAX,
  BUMP_LOWER,
} from "../core/theme";

interface HollowConnectorProps {
  position: "top" | "bottom";
  boxX: number;
  boxW: number;
  yTop: number;
  yBottom: number;
  height: number;
  borderWidth: number;
  isBumpMap?: boolean;
}

export function HollowConnector({
  boxX,
  boxW,
  yTop,
  yBottom: _yBottom,
  height,
  borderWidth: bw,
  isBumpMap = false,
}: HollowConnectorProps) {
  return (
    <>
      {/* Outer border layer — slightly larger to create a framed effect */}
      <UiRect
        x={boxX - bw}
        y={yTop + bw * 2}
        z={0.0015}
        w={boxW + bw * 2}
        h={height + bw * 3}
        radius={0.025}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      {/* Inner fill layer — matches Section 2 background to create hollow look */}
      <UiRect
        x={boxX}
        y={yTop}
        z={0.002}
        w={boxW}
        h={height}
        radius={0.022}
        color={S2_OUTER_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
      />
    </>
  );
}
