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

export const CURVE_GAP = 0.1; // Bow step between nesting levels (outer)
export const CURVE_INWARD_OFFSET = 0.015; // How far the bracket tip pokes inward
export const CURVE_DEEP_OFFSET_OUTER = 0.025; // Deeper tip for the center bracket
export const CURVE_DEEP_OFFSET_INNER = 0.028; // Deeper inner tip for center bracket
export const DEFAULT_VERSE_BORDER_WIDTH = 0.004; // Matches VerseBox default border width

export const INNER_CURVE_GAP = 0.095; // Bow step for inner curves
export const INNER_CURVE_INWARD_OFFSET = 0.009; // Inner tip penetration

// ── Line width constants
export const CURVE_OUTER_LINE_WIDTH = 2;
export const CURVE_INNER_LINE_WIDTH = 2;

// ── Bracket descriptor produced by the topology engine ───────────────────────
interface BracketSpec {
  /** Y of the bracket's outermost top edge (outer curve tip at top) */
  outerYTop: number;
  /** Y of the bracket's outermost bottom edge (outer curve tip at bottom) */
  outerYBot: number;
  /** Y of the bracket's inner top edge (inner curve tip at top) */
  innerYTop: number;
  /** Y of the bracket's inner bottom edge (inner curve tip at bottom) */
  innerYBot: number;
  /** 0 = outermost, increasing inward — determines bow depth */
  nestLevel: number;
  /** Is this the innermost center bracket? Drives deep-penetration tip offsets. */
  isCenter: boolean;
  color: string;
  fillColor: string;
  shrinkTop?: number;
  shrinkBot?: number;
  rightColXOffset?: number;
}

// ── Static fallbacks — used when the config provides no curveColors ───────────
// These replicate the previous Alak hardcoded values and keep other surahs
// visually correct even before they define their own curveColors.
const FALLBACK_OUTER_COLORS: Array<{ color: string; fillColor: string }> = [
  { color: BLUE_THEME,   fillColor: CAPSULE_BG_6_19 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_7_8_17_18 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_9_10_15_16 },
];
const FALLBACK_CENTER_COLOR = { color: GREEN_THEME, fillColor: CAPSULE_BG_12_14 };

// =============================================================================
// computeBrackets — Generic topological bracket generator
//
// Strategy
// ─────────
// Given the ordered GroupTransforms array and the layout math object:
//
// 1. Locate the "center" group (isPushedIn && isCenter). It receives an inner
//    bracket that wraps it tightly using its own frameY / frameH.
//
// 2. For hasIntroOutro === true (Alak-like layouts):
//    Outer bracket span comes from the intro-verse top (v6Y) → outro-verse
//    bottom (v19Y - bigBoxH), with two additional intermediate brackets derived
//    by the Alak row-offset math (matching the old hardcoded y8/y10/y18/y16).
//    This yields exactly 3 outer brackets + 1 inner = 4 total (Alak's structure).
//
// 3. For hasIntroOutro === false (Ayat al-Kursi):
//    ONE outer bracket sweeping from group[0].frameY → group[last].frameY - groupH.
//    ONE inner bracket for the center group.
//    Total: 2.
//
// The nestLevel field drives the bow depth for both outer and inner control
// points. Level 0 = tightest bow, increasing outward with each additional level.
// =============================================================================
function computeBrackets(
  groups: GroupTransforms[],
  layout: LayoutConfig,
  hasIntroOutro: boolean,
  outerColors: Array<{ color: string; fillColor: string }> = FALLBACK_OUTER_COLORS,
  centerColor: { color: string; fillColor: string } = FALLBACK_CENTER_COLOR,
  rawGroups: import("../../../data/schema").VerseBlockConfig[] = [],
): BracketSpec[] {
  if (groups.length === 0) return [];

  const {
    v6Y, v19Y, bigBoxH,
    groupPad, smallBoxH2, s2Gap,
    g1Y, g3Y, groupH,
  } = layout;

  const centerGroup = groups.find((g) => g.isCenter && g.isPushedIn);
  const g0 = groups[0];
  const gLast = groups[groups.length - 1];



  const brackets: BracketSpec[] = [];

    if (hasIntroOutro) {
    // ── Alak topology: exactly 3 outer brackets + 1 inner center ─────────
    //
    // Bracket 0 (index 0 from curveColors) — outermost:
    //   top  = intro-verse top  = v6Y
    //   bot  = outro-verse bot  = v19Y - bigBoxH
    //   inner top = v6Y - bigBoxH      (bottom edge of intro verse)
    //   inner bot = v19Y               (top edge of outro verse)
    //
    // Bracket 1 (index 1):
    //   top  = g1Y - groupPad                            (top of row 1, group 1)
    //   bot  = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 (bottom of row 2, group 3)
    const outerTop0 = v6Y;
    const outerBot0 = v19Y - bigBoxH;
    brackets.push({
      outerYTop: outerTop0,
      outerYBot: outerBot0,
      innerYTop: v6Y - bigBoxH,
      innerYBot: v19Y,
      nestLevel: 0,
      isCenter: false,
      shrinkTop: 0,
      shrinkBot: 0,
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
      shrinkTop: 0,
      shrinkBot: 0,
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
      shrinkTop: 0,
      shrinkBot: 0,
      ...(outerColors[2] ?? FALLBACK_OUTER_COLORS[2]),
    });

    if (centerGroup) {
      const cTop = centerGroup.frameY - groupPad;
      const cBot = centerGroup.frameY - groupPad - smallBoxH2 - s2Gap - smallBoxH2;
      brackets.push({
        outerYTop: cTop,
        outerYBot: cBot,
        innerYTop: cTop - smallBoxH2,
        innerYBot: cBot + smallBoxH2,
        nestLevel: 3,
        isCenter: true,
        shrinkTop: 0,
        shrinkBot: 0,
        ...centerColor,
      });
    }
  } else {
    const lastIdx = groups.length - 1;
    const outerPairs = Math.min(outerColors.length, Math.floor(groups.length / 2));
    
    for (let i = 0; i < outerPairs; i++) {
      const gTop = groups[i];
      const gBot = groups[lastIdx - i];
      
      if (!gTop || !gBot) continue;

      const pad = layout.curvePad ?? groupPad;

      const outerTop = gTop.frameY - pad;
      const outerBot = gBot.frameY - gBot.frameH + pad;

      const tipThickness = layout.curveTipThickness ?? smallBoxH2;
      
      const rawTop = rawGroups[i];
      const rawBot = rawGroups[lastIdx - i];

      const shrinkTop = gTop.isCenter ? layout.g2Shrink : (rawTop?.customShrink || 0);
      const shrinkBot = gBot.isCenter ? layout.g2Shrink : (rawBot?.customShrink || 0);

      brackets.push({
        outerYTop: outerTop,
        outerYBot: outerBot,
        innerYTop: outerTop - tipThickness, 
        innerYBot: outerBot + tipThickness,
        nestLevel: i,
        isCenter: false,
        shrinkTop,
        shrinkBot,
        rightColXOffset: gTop.rightColXOffset,
        ...outerColors[i],
      });
    }

    if (centerGroup) {
      const pad = layout.curvePad ?? groupPad;
      const cTop = centerGroup.frameY - pad;
      const cBot = centerGroup.frameY - centerGroup.frameH + pad;
      const tipThickness = layout.curveTipThickness ?? smallBoxH2;
      const shrinkCenter = centerGroup.isCenter ? layout.g2Shrink : 0;

      brackets.push({
        outerYTop: cTop,
        outerYBot: cBot,
        innerYTop: cTop - tipThickness,
        innerYBot: cBot + tipThickness,
        nestLevel: outerPairs,
        isCenter: true,
        shrinkTop: shrinkCenter,
        shrinkBot: shrinkCenter,
        rightColXOffset: centerGroup.rightColXOffset,
        ...centerColor,
      });
    }
  }

  return brackets;
}

// =============================================================================
// Bezier helper
// =============================================================================
const getSmoothCurvePoints = (
  tipXTop: number,
  controlXTop: number,
  tipXBot: number,
  controlXBot: number,
  yTop: number,
  yBot: number,
) => {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(tipXTop, yTop, 0),
    new THREE.Vector3(controlXTop, yTop, 0),
    new THREE.Vector3(controlXBot, yBot, 0),
    new THREE.Vector3(tipXBot, yBot, 0),
  );
  return curve.getPoints(50);
};

// =============================================================================
// CurvePair — renders one nested bracket (outer line + inner line + fill mesh)
// =============================================================================
const CurvePair = ({
  outerYTop,
  outerYBot,
  outerControlXTop,
  outerControlXBot,
  outerTipXTop,
  outerTipXBot,
  innerYTop,
  innerYBot,
  innerControlXTop,
  innerControlXBot,
  innerTipXTop,
  innerTipXBot,
  color,
  fillColor,
  shouldHide = false,
  lineWidth,
}: {
  outerYTop: number;
  outerYBot: number;
  outerControlXTop: number;
  outerControlXBot: number;
  outerTipXTop: number;
  outerTipXBot: number;
  innerYTop: number;
  innerYBot: number;
  innerControlXTop: number;
  innerControlXBot: number;
  innerTipXTop: number;
  innerTipXBot: number;
  color: string;
  fillColor?: string;
  shouldHide?: boolean;
  lineWidth?: number;
}) => {
  const outerPoints = useMemo(
    () => getSmoothCurvePoints(outerTipXTop, outerControlXTop, outerTipXBot, outerControlXBot, outerYTop, outerYBot),
    [outerTipXTop, outerControlXTop, outerTipXBot, outerControlXBot, outerYTop, outerYBot],
  );

  const innerPoints = useMemo(
    () => getSmoothCurvePoints(innerTipXTop, innerControlXTop, innerTipXBot, innerControlXBot, innerYTop, innerYBot),
    [innerTipXTop, innerControlXTop, innerTipXBot, innerControlXBot, innerYTop, innerYBot],
  );

  // Build the fill shape from the exact same sample points as the lines.
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
  const fillMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef1 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef2 = useRef<any>(null);

  const globalOpacityRef = useRef(1);
  const isAnimating = useRef(false);

  useEffect(() => {
    isAnimating.current = true;
    if (!shouldHide && groupRef.current) {
      groupRef.current.visible = true;
    }
  }, [shouldHide]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    const targetOp = shouldHide ? 0 : 1;
    globalOpacityRef.current = THREE.MathUtils.damp(
      globalOpacityRef.current,
      targetOp,
      4,
      delta,
    );
    const go = globalOpacityRef.current;

    if (fillMaterialRef.current) {
      fillMaterialRef.current.opacity = 0.999 * go;
    }
    if (lineRef1.current?.material) {
      lineRef1.current.material.opacity = go;
    }
    if (lineRef2.current?.material) {
      lineRef2.current.material.opacity = go;
    }

    if (Math.abs(go - targetOp) < 0.01) {
      isAnimating.current = false;
      if (shouldHide && groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  });

  const activeColor = color;
  const activeFillColor = fillColor ?? color;

  return (
    <group ref={groupRef} position={[0, 0, 0.0012]}>
      <group position={[0, 0, 0.0012]} renderOrder={5}>
        <Line
          ref={lineRef1}
          points={outerPoints}
          color={activeColor}
          lineWidth={lineWidth ?? CURVE_OUTER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
        <Line
          ref={lineRef2}
          points={innerPoints}
          color={activeColor}
          lineWidth={lineWidth ?? CURVE_INNER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
      </group>
      <mesh renderOrder={4} visible={activeFillColor !== "transparent" && activeFillColor !== "none"}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          ref={fillMaterialRef}
          color={activeFillColor !== "transparent" && activeFillColor !== "none" ? activeFillColor : "#ffffff"}
          transparent
          opacity={0.999}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// =============================================================================
// SideCurves — the smart, data-driven curve renderer
// =============================================================================

interface SideCurvesProps {
  layout: LayoutConfig;
  startX: number;
  borderWidth?: number;
  groups: GroupTransforms[];
  hasIntroOutro: boolean;
}

export const SideCurves = ({
  layout,
  startX,
  borderWidth = DEFAULT_VERSE_BORDER_WIDTH,
  groups,
  hasIntroOutro,
}: SideCurvesProps) => {
  const popUpGroups = usePopUpStore((state) => state.popUpGroups);
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const isAllSectionsMode = useElevatedStore((state) => state.isAllSectionsMode);

  const configColors = useStoryStore((state) => state.activeConfig.styling.colors);
  const configCurveColors = configColors.curveColors;

  const outerColors: Array<{ color: string; fillColor: string }> = configCurveColors
    ? configCurveColors.slice(0, -1)
    : FALLBACK_OUTER_COLORS;
  const centerColor: { color: string; fillColor: string } = configCurveColors
    ? (configCurveColors[configCurveColors.length - 1] ?? FALLBACK_CENTER_COLOR)
    : FALLBACK_CENTER_COLOR;

  const hideFromPopUps = popUpGroups.some(
    (g) => g.isOpen && g.id !== "g_1_2" && g.id !== "g_3_4",
  );

  const hideFromSectionElevate =
    !isAllSectionsMode &&
    (activeSectionIds.includes("s2_top") ||
      activeSectionIds.includes("s2_center") ||
      activeSectionIds.includes("s2_bottom"));

  const shouldHide = hideFromPopUps || hideFromSectionElevate;

  const { s2Pad, sectionW } = layout;
  const borderDelta = borderWidth - DEFAULT_VERSE_BORDER_WIDTH;
  const baseStartX_L = startX + s2Pad - 0.005;
  const baseStartX_R = startX + sectionW - s2Pad + 0.005;

  const activeConfig = useStoryStore((state) => state.activeConfig);
  const vertSection = activeConfig?.sections?.find((s) => s.type === "verticalGroups") as import("../../../data/schema").VerticalGroupsSectionConfig | undefined;
  const rawGroups = vertSection?.groups ?? [];

  const brackets = useMemo(
    () => computeBrackets(groups, layout, hasIntroOutro, outerColors, centerColor, rawGroups as any),
    [groups, layout, hasIntroOutro, outerColors, centerColor, rawGroups],
  );

  const totalLevels = brackets.length;

  return (
    <group position={[0, 0, 0.0025]} renderOrder={5}>
      {brackets.map((b, idx) => {
        const bowMultiplier = totalLevels - b.nestLevel;

        const shiftX = b.isCenter ? -(layout.centerCurveXOffset || 0) : (layout.outerCurveXOffset || 0);
        const startX_L = baseStartX_L + shiftX;
        const startX_R = baseStartX_R - shiftX;
        
        const shrinkTop = b.shrinkTop || 0;
        const shrinkBot = b.shrinkBot || 0;

        const innerInwardOffset = layout.curveInnerInwardOffset ?? INNER_CURVE_INWARD_OFFSET;
        const innerCurveGap = CURVE_GAP + (layout.innerCurveGapDiff ?? (INNER_CURVE_GAP - CURVE_GAP));

        const inwardOffset = layout.curveInwardOffset ?? CURVE_INWARD_OFFSET;
        const deepOffsetOuter = layout.curveDeepOffsetOuter ?? CURVE_DEEP_OFFSET_OUTER;
        const deepOffsetInner = layout.curveDeepOffsetInner ?? CURVE_DEEP_OFFSET_INNER;

        const tipXTop_L = startX_L + inwardOffset + shrinkTop;
        const tipXTop_R = startX_R - inwardOffset - shrinkTop;
        const tipXBot_L = startX_L + inwardOffset + shrinkBot;
        const tipXBot_R = startX_R - inwardOffset - shrinkBot;

        const deepTipXTop_L = startX_L + deepOffsetOuter + shrinkTop;
        const deepTipXTop_R = startX_R - deepOffsetOuter - shrinkTop;
        const deepTipXBot_L = startX_L + deepOffsetOuter + shrinkBot;
        const deepTipXBot_R = startX_R - deepOffsetOuter - shrinkBot;

        const deepInnerTipXTop_L = startX_L + deepOffsetInner + shrinkTop;
        const deepInnerTipXTop_R = startX_R - deepOffsetInner - shrinkTop;
        const deepInnerTipXBot_L = startX_L + deepOffsetInner + shrinkBot;
        const deepInnerTipXBot_R = startX_R - deepOffsetInner - shrinkBot;

        const outerControlTop_L = startX_L - CURVE_GAP * bowMultiplier + shrinkTop * 0.5;
        const outerControlTop_R = startX_R + CURVE_GAP * bowMultiplier - shrinkTop * 0.5;
        const outerControlBot_L = startX_L - CURVE_GAP * bowMultiplier + shrinkBot * 0.5;
        const outerControlBot_R = startX_R + CURVE_GAP * bowMultiplier - shrinkBot * 0.5;

        const innerControlTop_L = startX_L - innerCurveGap * bowMultiplier + shrinkTop * 0.5;
        const innerControlTop_R = startX_R + innerCurveGap * bowMultiplier - shrinkTop * 0.5;
        const innerControlBot_L = startX_L - innerCurveGap * bowMultiplier + shrinkBot * 0.5;
        const innerControlBot_R = startX_R + innerCurveGap * bowMultiplier - shrinkBot * 0.5;

        const outerTipTop_L = b.isCenter ? deepTipXTop_L : tipXTop_L;
        const outerTipTop_R = b.isCenter ? deepTipXTop_R : tipXTop_R;
        const outerTipBot_L = b.isCenter ? deepTipXBot_L : tipXBot_L;
        const outerTipBot_R = b.isCenter ? deepTipXBot_R : tipXBot_R;

        const innerTipTop_L = b.isCenter ? deepInnerTipXTop_L : tipXTop_L + innerInwardOffset;
        const innerTipTop_R = b.isCenter ? deepInnerTipXTop_R : tipXTop_R - innerInwardOffset;
        const innerTipBot_L = b.isCenter ? deepInnerTipXBot_L : tipXBot_L + innerInwardOffset;
        const innerTipBot_R = b.isCenter ? deepInnerTipXBot_R : tipXBot_R - innerInwardOffset;

        const topDelta  = idx === 0 ? borderDelta : 0;
        const botDelta  = idx === 0 ? borderDelta : 0;

        const anchoredLeft = layout.rightCurveAnchorsLeft?.includes(b.nestLevel);
        const rightOffsetForLeftAnchor = layout.groupInnerHalfW + layout.s2Gap;
        const anchorLeftStartX = startX_L + rightOffsetForLeftAnchor + (b.rightColXOffset || 0);

        const tipXTop_R_AL = anchorLeftStartX + inwardOffset;
        const tipXBot_R_AL = anchorLeftStartX + inwardOffset;
        const deepTipXTop_R_AL = anchorLeftStartX + deepOffsetOuter;
        const deepTipXBot_R_AL = anchorLeftStartX + deepOffsetOuter;
        const deepInnerTipXTop_R_AL = anchorLeftStartX + deepOffsetInner;
        const deepInnerTipXBot_R_AL = anchorLeftStartX + deepOffsetInner;

        const outerControlTop_R_AL = anchorLeftStartX - CURVE_GAP * bowMultiplier;
        const outerControlBot_R_AL = anchorLeftStartX - CURVE_GAP * bowMultiplier;
        const innerControlTop_R_AL = anchorLeftStartX - innerCurveGap * bowMultiplier;
        const innerControlBot_R_AL = anchorLeftStartX - innerCurveGap * bowMultiplier;

        const outerTipTop_R_AL = b.isCenter ? deepTipXTop_R_AL : tipXTop_R_AL;
        const outerTipBot_R_AL = b.isCenter ? deepTipXBot_R_AL : tipXBot_R_AL;
        const innerTipTop_R_AL = b.isCenter ? deepInnerTipXTop_R_AL : tipXTop_R_AL + innerInwardOffset;
        const innerTipBot_R_AL = b.isCenter ? deepInnerTipXBot_R_AL : tipXBot_R_AL + innerInwardOffset;

        return (
          <Fragment key={idx}>
            <CurvePair
              key={`L-${idx}`}
              outerYTop={b.outerYTop + topDelta}
              outerYBot={b.outerYBot - botDelta}
              outerControlXTop={outerControlTop_L}
              outerControlXBot={outerControlBot_L}
              outerTipXTop={outerTipTop_L}
              outerTipXBot={outerTipBot_L}
              innerYTop={b.innerYTop + topDelta}
              innerYBot={b.innerYBot - botDelta}
              innerControlXTop={innerControlTop_L}
              innerControlXBot={innerControlBot_L}
              innerTipXTop={innerTipTop_L}
              innerTipXBot={innerTipBot_L}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
              lineWidth={configColors.curveLineWidth}
            />
            <CurvePair
              key={`R-${idx}`}
              outerYTop={b.outerYTop + topDelta}
              outerYBot={b.outerYBot - botDelta}
              outerControlXTop={anchoredLeft ? outerControlTop_R_AL : outerControlTop_R}
              outerControlXBot={anchoredLeft ? outerControlBot_R_AL : outerControlBot_R}
              outerTipXTop={anchoredLeft ? outerTipTop_R_AL : outerTipTop_R}
              outerTipXBot={anchoredLeft ? outerTipBot_R_AL : outerTipBot_R}
              innerYTop={b.innerYTop + topDelta}
              innerYBot={b.innerYBot - botDelta}
              innerControlXTop={anchoredLeft ? innerControlTop_R_AL : innerControlTop_R}
              innerControlXBot={anchoredLeft ? innerControlBot_R_AL : innerControlBot_R}
              innerTipXTop={anchoredLeft ? innerTipTop_R_AL : innerTipTop_R}
              innerTipXBot={anchoredLeft ? innerTipBot_R_AL : innerTipBot_R}
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
