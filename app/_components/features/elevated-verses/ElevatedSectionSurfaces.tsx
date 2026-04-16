"use client";

import { a, to, useSpring, type SpringValue } from "@react-spring/three";
import { RoundedShapeComponent } from "../../SurahLayout/SharedUI";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import {
  S1_OUTER_BG,
  S1_OUTER_BORDER,
  HOLLOW_BORDER_COLOR,
  HOLLOW_BORDER_INNER,
  HOLLOW_CONNECTOR_INNER_BG_1_3,
} from "../../data/theme";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import { useElevatedStore } from "./useElevatedStore";

type SectionSpring = {
  liftZ: SpringValue<number>;
  opacity: SpringValue<number>;
  shadowOpacity: SpringValue<number>;
};

const SECTION_SURFACE = {
  liftHeight: 0.095,
  liftDelayMs: 120,
  shadowOpacity: 0.24,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
};

function useSectionSurfaceSpring(isActive: boolean): SectionSpring {
  const { liftZ, opacity } = useSpring({
    liftZ: isActive ? SECTION_SURFACE.liftHeight : 0,
    opacity: isActive ? 1 : 0,
    from: { liftZ: 0, opacity: 0 },
    delay: isActive ? SECTION_SURFACE.liftDelayMs : 0,
    config: SECTION_SURFACE.spring,
  });

  const { shadowOpacity } = useSpring({
    shadowOpacity: isActive ? SECTION_SURFACE.shadowOpacity : 0,
    from: { shadowOpacity: 0 },
    config: SECTION_SURFACE.spring,
  });

  return { liftZ, opacity, shadowOpacity };
}

interface ElevatedLayerProps {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  color: string;
  spring: SectionSpring;
  zOffset?: number;
  shadow?: boolean;
  shadowStrength?: number;
  shadowInsetZ?: number;
}

function ElevatedLayer({
  x,
  y,
  w,
  h,
  radius,
  color,
  spring,
  zOffset = 0,
  shadow = false,
  shadowStrength = 1,
  shadowInsetZ = -0.00018,
}: ElevatedLayerProps) {
  const baseZ = PAGE_DEPTH / 2 + 0.001 + zOffset;

  return (
    <a.group
      position={[x - PAGE_WIDTH / 2, y, 0]}
      position-z={to(spring.liftZ, (lift) => baseZ + lift)}
    >
      {shadow && (
        <mesh position={[0.008, -0.008, shadowInsetZ]}>
          <RoundedShapeComponent w={w} h={h} radius={radius} />
          <a.meshBasicMaterial
            color="#000000"
            transparent
            depthWrite={false}
            opacity={to(
              [spring.shadowOpacity, spring.opacity],
              (shadowOp, op) => shadowOp * op * shadowStrength,
            )}
          />
        </mesh>
      )}

      <mesh>
        <RoundedShapeComponent w={w} h={h} radius={radius} />
        <a.meshStandardMaterial
          color={color}
          transparent
          opacity={spring.opacity}
          roughness={0.82}
          metalness={0.06}
          envMapIntensity={0.5}
          depthWrite
        />
      </mesh>
    </a.group>
  );
}

export function ElevatedSectionSurfaces() {
  const activeSectionIds = useElevatedStore((s) => s.activeSectionIds);
  const s1Spring = useSectionSurfaceSpring(activeSectionIds.includes("s1"));
  const s2TopSpring = useSectionSurfaceSpring(
    activeSectionIds.includes("s2_top"),
  );
  const s2BottomSpring = useSectionSurfaceSpring(
    activeSectionIds.includes("s2_bottom"),
  );

  const s1 = SURAH_TRANSFORMS.s1;
  const s2 = SURAH_TRANSFORMS.s2;

  const bw = s2.borderWidth;
  const innerBorderInset = bw * 0.7;

  const buildConnectorLayers = (
    yTop: number,
    height: number,
    position: "top" | "bottom",
  ) => {
    const outerX = s2.connectorX - bw;
    const outerW = s2.connectorW + bw * 2;
    const outerH = height + bw * 3;
    const outerY = position === "top" ? yTop + bw * 2 : yTop + bw;

    const middleX = outerX + innerBorderInset;
    const middleY = outerY - innerBorderInset;
    const middleW = outerW - innerBorderInset * 2;
    const middleH = outerH - innerBorderInset * 2;

    return {
      outer: {
        x: outerX,
        y: outerY,
        w: outerW,
        h: outerH,
        radius: 0.025,
      },
      middle: {
        x: middleX,
        y: middleY,
        w: middleW,
        h: middleH,
        radius: 0.023,
      },
      fill: {
        x: s2.connectorX,
        y: yTop,
        w: s2.connectorW,
        h: height,
        radius: 0.022,
      },
    };
  };

  const topConnector = buildConnectorLayers(
    s2.topConnectorY,
    s2.topConnectorH,
    "top",
  );

  const bottomConnector = buildConnectorLayers(
    s2.bottomConnectorY,
    s2.bottomConnectorH,
    "bottom",
  );

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {/* Section 1 outer background stack */}
      <ElevatedLayer
        x={s1.frameX}
        y={s1.frameY}
        w={s1.frameW}
        h={s1.frameH}
        radius={0.02}
        color={S1_OUTER_BORDER}
        spring={s1Spring}
      />
      <ElevatedLayer
        x={s1.frameX + 0.003}
        y={s1.frameY - 0.003}
        w={s1.frameW - 0.006}
        h={s1.frameH - 0.006}
        radius={0.017}
        color={S1_OUTER_BG}
        spring={s1Spring}
        zOffset={0.001}
        shadow
        shadowStrength={0.95}
      />

      {/* Section 2 top 5-verse connector background stack */}
      <ElevatedLayer
        x={topConnector.outer.x}
        y={topConnector.outer.y}
        w={topConnector.outer.w}
        h={topConnector.outer.h}
        radius={topConnector.outer.radius}
        color={HOLLOW_BORDER_COLOR}
        spring={s2TopSpring}
      />
      <ElevatedLayer
        x={topConnector.middle.x}
        y={topConnector.middle.y}
        w={topConnector.middle.w}
        h={topConnector.middle.h}
        radius={topConnector.middle.radius}
        color={HOLLOW_BORDER_INNER}
        spring={s2TopSpring}
        zOffset={0.0006}
        shadow
        shadowStrength={0.8}
      />
      <ElevatedLayer
        x={topConnector.fill.x}
        y={topConnector.fill.y}
        w={topConnector.fill.w}
        h={topConnector.fill.h}
        radius={topConnector.fill.radius}
        color={HOLLOW_CONNECTOR_INNER_BG_1_3}
        spring={s2TopSpring}
        zOffset={0.0012}
        shadow
        shadowStrength={0.65}
      />

      {/* Section 2 bottom 5-verse connector background stack */}
      <ElevatedLayer
        x={bottomConnector.outer.x}
        y={bottomConnector.outer.y}
        w={bottomConnector.outer.w}
        h={bottomConnector.outer.h}
        radius={bottomConnector.outer.radius}
        color={HOLLOW_BORDER_COLOR}
        spring={s2BottomSpring}
      />
      <ElevatedLayer
        x={bottomConnector.middle.x}
        y={bottomConnector.middle.y}
        w={bottomConnector.middle.w}
        h={bottomConnector.middle.h}
        radius={bottomConnector.middle.radius}
        color={HOLLOW_BORDER_INNER}
        spring={s2BottomSpring}
        zOffset={0.0006}
        shadow
        shadowStrength={0.8}
      />
      <ElevatedLayer
        x={bottomConnector.fill.x}
        y={bottomConnector.fill.y}
        w={bottomConnector.fill.w}
        h={bottomConnector.fill.h}
        radius={bottomConnector.fill.radius}
        color={HOLLOW_CONNECTOR_INNER_BG_1_3}
        spring={s2BottomSpring}
        zOffset={0.0012}
        shadow
        shadowStrength={0.65}
      />
    </group>
  );
}
