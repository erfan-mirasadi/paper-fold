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
}

// ── Color sequence for outer (non-center) brackets, outermost → innermost ────
// Alak uses 3 non-center brackets: blue → maroon → maroon.
// Any new layout with fewer outer brackets simply uses the first N colors.
const OUTER_BRACKET_COLORS: Array<{ color: string; fillColor: string }> = [
  { color: BLUE_THEME,   fillColor: CAPSULE_BG_6_19 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_7_8_17_18 },
  { color: MAROON_THEME, fillColor: CAPSULE_BG_9_10_15_16 },
];

// ── The center bracket always uses the green theme ────────────────────────────
const CENTER_BRACKET_COLOR = { color: GREEN_THEME, fillColor: CAPSULE_BG_12_14 };

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
    // Bracket 0 (blue) — outermost:
    //   top  = intro-verse top  = v6Y
    //   bot  = outro-verse bot  = v19Y - bigBoxH
    //   inner top = v6Y - bigBoxH      (bottom edge of intro verse)
    //   inner bot = v19Y               (top edge of outro verse)
    //
    // Bracket 1 (maroon):
    //   top  = g1Y - groupPad                            (top of row 1, group 1)
    //   bot  = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 (bottom of row 2, group 3)
    //   inner top = top - smallBoxH2
    //   inner bot = bot + smallBoxH2
    //
    // Bracket 2 (maroon):
    //   top  = g1Y - groupPad - smallBoxH2 - s2Gap      (top of row 2, group 1)
    //   bot  = g3Y - groupPad - smallBoxH2              (top of row 1, group 3)
    //   inner top = top - smallBoxH2
    //   inner bot = bot + smallBoxH2
    //
    // These formulas exactly reproduce the previous hardcoded y6/y8/y10 values.

    const outerTop0 = v6Y;
    const outerBot0 = v19Y - bigBoxH;
    brackets.push({
      outerYTop: outerTop0,
      outerYBot: outerBot0,
      innerYTop: v6Y - bigBoxH,
      innerYBot: v19Y,
      nestLevel: 0,
      isCenter: false,
      ...OUTER_BRACKET_COLORS[0],
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
      ...OUTER_BRACKET_COLORS[1],
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
      ...OUTER_BRACKET_COLORS[2],
    });

    // Inner center bracket (green) — tightly wraps the center group
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
        ...CENTER_BRACKET_COLOR,
      });
    }
  } else {
    // ── Generic topology: 1 outer + 1 inner center ────────────────────────
    
    // Outer bracket dynamically wraps all rows of the first and last group.
    const outerTop = g0.frameY - groupPad;
    const outerBot = gLast.frameY - gLast.frameH + groupPad; // Assumes groupPadBottom is equal to groupPad

    brackets.push({
      outerYTop: outerTop,
      outerYBot: outerBot,
      innerYTop: outerTop - smallBoxH2, // Bracket tip thickness matches verse height
      innerYBot: outerBot + smallBoxH2,
      nestLevel: 0,
      isCenter: false,
      ...OUTER_BRACKET_COLORS[0],
    });

    if (centerGroup) {
      const cTop = centerGroup.frameY - groupPad;
      const cBot = centerGroup.frameY - centerGroup.frameH + groupPad;

      brackets.push({
        outerYTop: cTop,
        outerYBot: cBot,
        innerYTop: cTop - smallBoxH2,
        innerYBot: cBot + smallBoxH2,
        nestLevel: 1,
        isCenter: true,
        ...CENTER_BRACKET_COLOR,
      });
    }
  }

  return brackets;
}

// =============================================================================
// Bezier helper
// =============================================================================
const getSmoothCurvePoints = (
  tipX: number,
  controlX: number,
  yTop: number,
  yBot: number,
) => {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(tipX, yTop, 0),
    new THREE.Vector3(controlX, yTop, 0),
    new THREE.Vector3(controlX, yBot, 0),
    new THREE.Vector3(tipX, yBot, 0),
  );
  return curve.getPoints(50);
};

// =============================================================================
// CurvePair — renders one nested bracket (outer line + inner line + fill mesh)
// =============================================================================
const CurvePair = ({
  outerYTop,
  outerYBot,
  outerControlX,
  outerTipX,
  innerYTop,
  innerYBot,
  innerControlX,
  innerTipX,
  color,
  fillColor,
  shouldHide = false,
}: {
  outerYTop: number;
  outerYBot: number;
  outerControlX: number;
  outerTipX: number;
  innerYTop: number;
  innerYBot: number;
  innerControlX: number;
  innerTipX: number;
  color: string;
  fillColor?: string;
  shouldHide?: boolean;
}) => {
  const outerPoints = useMemo(
    () => getSmoothCurvePoints(outerTipX, outerControlX, outerYTop, outerYBot),
    [outerTipX, outerControlX, outerYTop, outerYBot],
  );

  const innerPoints = useMemo(
    () => getSmoothCurvePoints(innerTipX, innerControlX, innerYTop, innerYBot),
    [innerTipX, innerControlX, innerYTop, innerYBot],
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
          lineWidth={CURVE_OUTER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
        <Line
          ref={lineRef2}
          points={innerPoints}
          color={activeColor}
          lineWidth={CURVE_INNER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
      </group>
      <mesh renderOrder={4}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          ref={fillMaterialRef}
          color={activeFillColor}
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
  /** Pre-computed group transforms from SectionTwo (already sliced per-side) */
  groups: GroupTransforms[];
  /** Whether this layout has intro/outro verses (drives bracket topology) */
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

  // Hide curves whenever any inner popup group (not 1–2 or 3–4) is open.
  const hideFromPopUps = popUpGroups.some(
    (g) => g.isOpen && g.id !== "g_1_2" && g.id !== "g_3_4",
  );

  // Also hide curves during section-level elevation for Section 2 hollow blocks.
  const hideFromSectionElevate =
    !isAllSectionsMode &&
    (activeSectionIds.includes("s2_top") ||
      activeSectionIds.includes("s2_center") ||
      activeSectionIds.includes("s2_bottom"));

  const shouldHide = hideFromPopUps || hideFromSectionElevate;

  const { s2Pad, sectionW } = layout;

  // ── Border delta (only the delta from VerseBox default, not the full width) ─
  const borderDelta = borderWidth - DEFAULT_VERSE_BORDER_WIDTH;

  // ── Reference edges (flush with the section box sides) ───────────────────
  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;

  // ── Standard bracket tips ────────────────────────────────────────────────
  const tipX_L = startX_L + CURVE_INWARD_OFFSET;
  const tipX_R = startX_R - CURVE_INWARD_OFFSET;

  // ── Deep-penetration tips for the center bracket ─────────────────────────
  const deepTipX_L = startX_L + CURVE_DEEP_OFFSET_OUTER;
  const deepTipX_R = startX_R - CURVE_DEEP_OFFSET_OUTER;
  const deepInnerTipX_L = startX_L + CURVE_DEEP_OFFSET_INNER;
  const deepInnerTipX_R = startX_R - CURVE_DEEP_OFFSET_INNER;

  // ── Compute brackets from group topology ─────────────────────────────────
  const brackets = useMemo(
    () => computeBrackets(groups, layout, hasIntroOutro),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, layout, hasIntroOutro],
  );

  // ── Build control and tip X arrays dynamically ───────────────────────────
  // The number of brackets determines how many bow steps to spread.
  // Outermost bracket (nestLevel 0) gets the maximum bow; each subsequent
  // level steps one CURVE_GAP / INNER_CURVE_GAP closer to the page edge.
  //
  // For Alak (4 brackets): outermost bow = 4×CURVE_GAP — matches old control1.
  // For Ayat al-Kursi (2 brackets): outermost bow = 2×CURVE_GAP.
  const totalLevels = brackets.length;

  // ── Render both sides via a single .map() over the brackets array ─────────
  // We render left-side and right-side pairs together inside the loop to keep
  // the key structure simple and avoid duplication.

  return (
    <group position={[0, 0, 0.0025]} renderOrder={5}>
      {brackets.map((b, idx) => {
        // Bow depth: outermost bracket gets the deepest bow.
        // nestLevel 0 (outermost) → totalLevels bow steps away from edge.
        // nestLevel N → (totalLevels - N) bow steps.
        const bowMultiplier = totalLevels - b.nestLevel;

        const outerControl_L = startX_L - CURVE_GAP * bowMultiplier;
        const outerControl_R = startX_R + CURVE_GAP * bowMultiplier;
        const innerControl_L = startX_L - INNER_CURVE_GAP * bowMultiplier;
        const innerControl_R = startX_R + INNER_CURVE_GAP * bowMultiplier;

        // Center brackets get deeper-penetration tips; others get standard tips.
        const outerTip_L = b.isCenter ? deepTipX_L : tipX_L;
        const outerTip_R = b.isCenter ? deepTipX_R : tipX_R;
        const innerTip_L = b.isCenter ? deepInnerTipX_L : tipX_L + INNER_CURVE_INWARD_OFFSET;
        const innerTip_R = b.isCenter ? deepInnerTipX_R : tipX_R - INNER_CURVE_INWARD_OFFSET;

        // Apply border delta only to the outermost bracket (bracket 0) whose
        // edges are flush with the intro/outro verse borders.
        const topDelta  = idx === 0 ? borderDelta : 0;
        const botDelta  = idx === 0 ? borderDelta : 0;

        return (
          <Fragment key={idx}>
            {/* LEFT side */}
            <CurvePair
              key={`L-${idx}`}
              outerYTop={b.outerYTop + topDelta}
              outerYBot={b.outerYBot - botDelta}
              outerControlX={outerControl_L}
              outerTipX={outerTip_L}
              innerYTop={b.innerYTop + topDelta}
              innerYBot={b.innerYBot - botDelta}
              innerControlX={innerControl_L}
              innerTipX={innerTip_L}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
            />
            {/* RIGHT side */}
            <CurvePair
              key={`R-${idx}`}
              outerYTop={b.outerYTop + topDelta}
              outerYBot={b.outerYBot - botDelta}
              outerControlX={outerControl_R}
              outerTipX={outerTip_R}
              innerYTop={b.innerYTop + topDelta}
              innerYBot={b.innerYBot - botDelta}
              innerControlX={innerControl_R}
              innerTipX={innerTip_R}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
            />
          </Fragment>
        );
      })}
    </group>
  );
};
