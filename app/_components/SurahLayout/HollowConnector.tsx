"use client";
import { UiRect } from "./SharedUI";
import {
  HOLLOW_BORDER_COLOR,
  HOLLOW_CONNECTOR_INNER_BG_1_3,
  BUMP_MAX,
  BUMP_LOWER,
} from "../data/theme";

interface HollowConnectorProps {
  position: "top" | "bottom";
  boxX: number;
  boxW: number;
  yTop: number;
  yBottom: number;
  height: number;
  borderWidth: number;
  isBumpMap?: boolean;
  opacity?: number;
}

export function HollowConnector({
  position,
  boxX,
  boxW,
  yTop,
  height,
  borderWidth: bw,
  isBumpMap = false,
  opacity,
}: HollowConnectorProps) {
  // Bias the outer border so the "extra" framing appears on the
  // connector's primary side: top connectors push the frame upward,
  // bottom connectors bias it downward.
  const outerX = boxX - bw;
  const outerW = boxW + bw * 2;
  const outerH = height + bw * 3;
  const outerY = position === "top" ? yTop + bw * 2 : yTop + bw;

  return (
    <>
      {/* Outer border layer — slightly larger to create a framed effect */}
      <UiRect
        x={outerX}
        y={outerY}
        z={0.0015}
        w={outerW}
        h={outerH}
        radius={0.025}
        color={HOLLOW_BORDER_COLOR}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
        opacity={opacity}
      />
      {/* Inner fill layer — matches Section 2 background to create hollow look */}
      <UiRect
        x={boxX}
        y={yTop}
        z={0.002}
        w={boxW}
        h={height}
        radius={0.022}
        color={HOLLOW_CONNECTOR_INNER_BG_1_3}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
        opacity={opacity}
      />
    </>
  );
}
