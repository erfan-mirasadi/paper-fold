"use client";

import { Line } from "@react-three/drei";
import { useMemo, useRef, useEffect, Fragment } from "react";
import * as THREE from "three";
import {
  BLUE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
  CAPSULE_BG_6_19,
} from "../../../data/theme";
import { useStoryStore } from "../../../stores/useStoryStore";
import { usePopUpStore } from "../../../stores/usePopUpStore";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFrame } from "@react-three/fiber";
import type { LayoutConfig } from "../../../data/SurahConfig";
import type { GroupTransforms } from "../../../data/schema";

export const CURVE_GAP = 0.1;
export const CURVE_INWARD_OFFSET = 0.015;
export const CURVE_DEEP_OFFSET_OUTER = 0.025;
export const CURVE_DEEP_OFFSET_INNER = 0.028;
export const DEFAULT_VERSE_BORDER_WIDTH = 0.004;

export const INNER_CURVE_GAP = 0.095;
export const INNER_CURVE_INWARD_OFFSET = 0.009;

export const CURVE_OUTER_LINE_WIDTH = 2;
export const CURVE_INNER_LINE_WIDTH = 2;

export interface CurveConfig {
  color: string;
  fillColor: string;
  bowGap?: number;
  innerBowGap?: number;
  inwardOffset?: number;
}

interface BracketSpec extends CurveConfig {
  outerYTop: number;
  outerYBot: number;
  innerYTop: number;
  innerYBot: number;
  nestLevel: number;
  isCenter: boolean;
  leftEdgeTop?: number;
  rightEdgeTop?: number;
  leftEdgeBot?: number;
  rightEdgeBot?: number;
}

const FALLBACK_OUTER_COLORS: CurveConfig[] = [
  { color: BLUE_THEME, fillColor: CAPSULE_BG_6_19 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_7_8_17_18 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_9_10_15_16 },
];
const FALLBACK_CENTER_COLOR: CurveConfig = {
  color: GREEN_THEME,
  fillColor: CAPSULE_BG_12_14,
};

function computeBrackets(
  groups: GroupTransforms[],
  layout: LayoutConfig,
  hasIntroOutro: boolean,
  outerColors: CurveConfig[] = FALLBACK_OUTER_COLORS,
  centerColor: CurveConfig = FALLBACK_CENTER_COLOR,
): BracketSpec[] {
  if (groups.length === 0) return [];

  const getEdges = (group?: GroupTransforms) => {
    if (!group || !group.verses) return {};
    const arr = Object.values(group.verses).sort((a, b) => a.x - b.x);
    if (arr.length === 0) return {};
    return {
      left: arr[0].x,
      right: arr[arr.length - 1].x + arr[arr.length - 1].w,
    };
  };

  const { v6Y, v19Y, bigBoxH, groupPad, smallBoxH2, s2Gap, g1Y, g3Y } = layout;
  const centerGroup = groups.find((g) => g.isCenter && g.isPushedIn);
  const brackets: BracketSpec[] = [];

  if (hasIntroOutro) {
    const outerTop0 = v6Y;
    const outerBot0 = v19Y - bigBoxH;
    brackets.push({
      outerYTop: outerTop0,
      outerYBot: outerBot0,
      innerYTop: v6Y - bigBoxH,
      innerYBot: v19Y,
      nestLevel: 0,
      isCenter: false,
      ...(outerColors[0] ?? FALLBACK_OUTER_COLORS[0]),
    });

    const outerTop1 = g1Y - groupPad;
    const outerBot1 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;
    brackets.push({
      outerYTop: outerTop1,
      outerYBot: outerBot1,
      innerYTop: outerTop1 - smallBoxH2,
      innerYBot: outerBot1 + smallBoxH2,
      nestLevel: 1,
      isCenter: false,
      ...(outerColors[1] ?? FALLBACK_OUTER_COLORS[1]),
    });

    const outerTop2 = g1Y - groupPad - smallBoxH2 - s2Gap;
    const outerBot2 = g3Y - groupPad - smallBoxH2;
    brackets.push({
      outerYTop: outerTop2,
      outerYBot: outerBot2,
      innerYTop: outerTop2 - smallBoxH2,
      innerYBot: outerBot2 + smallBoxH2,
      nestLevel: 2,
      isCenter: false,
      ...(outerColors[2] ?? FALLBACK_OUTER_COLORS[2]),
    });

    if (centerGroup) {
      const cTop = centerGroup.frameY - groupPad;
      const cBot =
        centerGroup.frameY - groupPad - smallBoxH2 - s2Gap - smallBoxH2;
      brackets.push({
        outerYTop: cTop,
        outerYBot: cBot,
        innerYTop: cTop - smallBoxH2,
        innerYBot: cBot + smallBoxH2,
        nestLevel: 3,
        isCenter: true,
        ...centerColor,
      });
    }
  } else {
    const lastIdx = groups.length - 1;
    const outerPairs = Math.min(
      outerColors.length,
      Math.floor(groups.length / 2),
    );

    for (let i = 0; i < outerPairs; i++) {
      const gTop = groups[i];
      const gBot = groups[lastIdx - i];
      if (!gTop || !gBot) continue;

      const pad = layout.curvePad ?? groupPad;
      const tipThickness = smallBoxH2;
      const topEdges = getEdges(gTop);
      const botEdges = getEdges(gBot);

      brackets.push({
        outerYTop: gTop.frameY - pad,
        outerYBot: gBot.frameY - gBot.frameH + pad,
        innerYTop: gTop.frameY - pad - tipThickness,
        innerYBot: gBot.frameY - gBot.frameH + pad + tipThickness,
        nestLevel: i,
        isCenter: false,
        leftEdgeTop: topEdges.left,
        rightEdgeTop: topEdges.right,
        leftEdgeBot: botEdges.left,
        rightEdgeBot: botEdges.right,
        ...outerColors[i],
      });
    }

    if (centerGroup) {
      const pad = groupPad;
      const centerEdges = getEdges(centerGroup);
      brackets.push({
        outerYTop: centerGroup.frameY - pad,
        outerYBot: centerGroup.frameY - centerGroup.frameH + pad,
        innerYTop: centerGroup.frameY - pad - smallBoxH2,
        innerYBot: centerGroup.frameY - centerGroup.frameH + pad + smallBoxH2,
        nestLevel: outerPairs,
        isCenter: true,
        leftEdgeTop: centerEdges.left,
        rightEdgeTop: centerEdges.right,
        leftEdgeBot: centerEdges.left,
        rightEdgeBot: centerEdges.right,
        ...centerColor,
      });
    }
  }

  return brackets;
}

const getSmoothCurvePoints = (
  tipXTop: number,
  controlX: number,
  tipXBot: number,
  yTop: number,
  yBot: number,
) => {
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(tipXTop, yTop, 0),
    new THREE.Vector3(controlX, yTop, 0),
    new THREE.Vector3(controlX, yBot, 0),
    new THREE.Vector3(tipXBot, yBot, 0),
  ).getPoints(50);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CurveComponent = ({
  outerPoints,
  innerPoints,
  color,
  fillColor,
  shouldHide,
  lineWidth,
}: any) => {
  const fillShape = useMemo(() => {
    const s = new THREE.Shape();
    if (outerPoints.length > 0 && innerPoints.length > 0) {
      s.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < outerPoints.length; i++) {
        s.lineTo(outerPoints[i].x, outerPoints[i].y);
      }
      const lastInner = innerPoints[innerPoints.length - 1];
      s.lineTo(lastInner.x, lastInner.y);
      for (let i = innerPoints.length - 2; i >= 0; i--) {
        s.lineTo(innerPoints[i].x, innerPoints[i].y);
      }
      s.lineTo(outerPoints[0].x, outerPoints[0].y);
    }
    return s;
  }, [outerPoints, innerPoints]);

  const groupRef = useRef<THREE.Group>(null);
  const fillMatRef = useRef<THREE.MeshBasicMaterial>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const line1Ref = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const line2Ref = useRef<any>(null);

  const isAnim = useRef(false);
  const opRef = useRef(1);

  useEffect(() => {
    isAnim.current = true;
    if (!shouldHide && groupRef.current) groupRef.current.visible = true;
  }, [shouldHide]);

  useFrame((_, delta) => {
    if (!isAnim.current) return;
    const target = shouldHide ? 0 : 1;
    opRef.current = THREE.MathUtils.damp(opRef.current, target, 4, delta);
    const go = opRef.current;

    if (fillMatRef.current) fillMatRef.current.opacity = 0.999 * go;
    if (line1Ref.current?.material) line1Ref.current.material.opacity = go;
    if (line2Ref.current?.material) line2Ref.current.material.opacity = go;

    if (Math.abs(go - target) < 0.01) {
      isAnim.current = false;
      if (shouldHide && groupRef.current) groupRef.current.visible = false;
    }
  });

  const hasFill = fillColor !== "transparent" && fillColor !== "none";

  return (
    <group ref={groupRef} position={[0, 0, 0.0012]}>
      <group position={[0, 0, 0.0012]} renderOrder={5}>
        <Line
          ref={line1Ref}
          points={outerPoints}
          color={color}
          lineWidth={lineWidth ?? CURVE_OUTER_LINE_WIDTH}
          transparent
          renderOrder={5}
        />
        <Line
          ref={line2Ref}
          points={innerPoints}
          color={color}
          lineWidth={lineWidth ?? CURVE_INNER_LINE_WIDTH}
          transparent
          renderOrder={5}
        />
      </group>
      <mesh renderOrder={4} visible={hasFill}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          ref={fillMatRef}
          color={hasFill ? fillColor : "#ffffff"}
          transparent
          opacity={0.999}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SideCurves = ({
  layout,
  startX,
  borderWidth = DEFAULT_VERSE_BORDER_WIDTH,
  groups,
  hasIntroOutro,
}: any) => {
  const popUpGroups = usePopUpStore((state) => state.popUpGroups);
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const isAllSectionsMode = useElevatedStore(
    (state) => state.isAllSectionsMode,
  );

  const configColors = useStoryStore(
    (state) => state.activeConfig.styling.colors,
  );
  const configCurveColors = configColors.curveColors as
    | CurveConfig[]
    | undefined;

  const outerColors = configCurveColors
    ? configCurveColors.slice(0, -1)
    : FALLBACK_OUTER_COLORS;
  const centerColor = configCurveColors
    ? (configCurveColors[configCurveColors.length - 1] ?? FALLBACK_CENTER_COLOR)
    : FALLBACK_CENTER_COLOR;

  const shouldHide =
    popUpGroups.some((g) => g.isOpen && g.id !== "g_1_2" && g.id !== "g_3_4") ||
    (!isAllSectionsMode &&
      (activeSectionIds.includes("s2_top") ||
        activeSectionIds.includes("s2_center") ||
        activeSectionIds.includes("s2_bottom")));

  const borderDelta = borderWidth - DEFAULT_VERSE_BORDER_WIDTH;
  const baseStartX_L = startX + layout.s2Pad - 0.005;
  const baseStartX_R = startX + layout.sectionW - layout.s2Pad + 0.005;

  const brackets = useMemo(
    () =>
      computeBrackets(groups, layout, hasIntroOutro, outerColors, centerColor),
    [groups, layout, hasIntroOutro, outerColors, centerColor],
  );

  const totalLevels = brackets.length;

  return (
    <group position={[0, 0, 0.0025]} renderOrder={5}>
      {brackets.map((b, idx) => {
        if (b.color === "transparent" || b.color === "none") return null;

        const bowMultiplier = totalLevels - b.nestLevel;
        const nestMultiplier = b.nestLevel + 1;

        const outerBow = b.bowGap ?? CURVE_GAP * bowMultiplier;
        const innerBow = b.innerBowGap ?? INNER_CURVE_GAP * bowMultiplier;
        const inwardOffset = b.inwardOffset ?? CURVE_INWARD_OFFSET;

        const innerInwardOffset = INNER_CURVE_INWARD_OFFSET * nestMultiplier;
        const deepOffsetOuter = CURVE_DEEP_OFFSET_OUTER;
        const deepOffsetInner = CURVE_DEEP_OFFSET_INNER;

        const leftEdgeTop = b.leftEdgeTop ?? baseStartX_L;
        const leftEdgeBot = b.leftEdgeBot ?? baseStartX_L;
        const rightEdgeTop = b.rightEdgeTop ?? baseStartX_R;
        const rightEdgeBot = b.rightEdgeBot ?? baseStartX_R;

        const minLeftX = Math.min(leftEdgeTop, leftEdgeBot);
        const maxRightX = Math.max(rightEdgeTop, rightEdgeBot);

        const outerCtrl_L = minLeftX - outerBow;
        const innerCtrl_L = minLeftX - innerBow;

        const outerCtrl_R = maxRightX + outerBow;
        const innerCtrl_R = maxRightX + innerBow;

        const outerTipTop_L = b.isCenter
          ? leftEdgeTop + deepOffsetOuter
          : leftEdgeTop + inwardOffset;
        const outerTipBot_L = b.isCenter
          ? leftEdgeBot + deepOffsetOuter
          : leftEdgeBot + inwardOffset;
        const innerTipTop_L = b.isCenter
          ? leftEdgeTop + deepOffsetInner
          : leftEdgeTop + inwardOffset + innerInwardOffset;
        const innerTipBot_L = b.isCenter
          ? leftEdgeBot + deepOffsetInner
          : leftEdgeBot + inwardOffset + innerInwardOffset;

        const outerTipTop_R = b.isCenter
          ? rightEdgeTop - deepOffsetOuter
          : rightEdgeTop - inwardOffset;
        const outerTipBot_R = b.isCenter
          ? rightEdgeBot - deepOffsetOuter
          : rightEdgeBot - inwardOffset;
        const innerTipTop_R = b.isCenter
          ? rightEdgeTop - deepOffsetInner
          : rightEdgeTop - inwardOffset - innerInwardOffset;
        const innerTipBot_R = b.isCenter
          ? rightEdgeBot - deepOffsetInner
          : rightEdgeBot - inwardOffset - innerInwardOffset;

        const topDelta = idx === 0 ? borderDelta : 0;
        const botDelta = idx === 0 ? borderDelta : 0;

        const yTopOuter = b.outerYTop + topDelta;
        const yBotOuter = b.outerYBot - botDelta;
        const yTopInner = b.innerYTop + topDelta;
        const yBotInner = b.innerYBot - botDelta;

        const lOutPts = getSmoothCurvePoints(
          outerTipTop_L,
          outerCtrl_L,
          outerTipBot_L,
          yTopOuter,
          yBotOuter,
        );
        const lInPts = getSmoothCurvePoints(
          innerTipTop_L,
          innerCtrl_L,
          innerTipBot_L,
          yTopInner,
          yBotInner,
        );

        const rOutPts = getSmoothCurvePoints(
          outerTipTop_R,
          outerCtrl_R,
          outerTipBot_R,
          yTopOuter,
          yBotOuter,
        );
        const rInPts = getSmoothCurvePoints(
          innerTipTop_R,
          innerCtrl_R,
          innerTipBot_R,
          yTopInner,
          yBotInner,
        );

        return (
          <Fragment key={idx}>
            <CurveComponent
              outerPoints={lOutPts}
              innerPoints={lInPts}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
              lineWidth={configColors.curveLineWidth}
            />
            <CurveComponent
              outerPoints={rOutPts}
              innerPoints={rInPts}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
              lineWidth={configColors.curveLineWidth}
            />
          </Fragment>
        );
      })}
    </group>
  );
};
