"use client";

import { Line } from "@react-three/drei";
import { useMemo, useRef, useEffect, Fragment } from "react";
import * as THREE from "three";
import {
  ORANGE_THEME,
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
  /** Whether the curves should be symmetrical (default) or both bow to the 'left' or 'right'. */
  curveSide?: "symmetrical" | "left" | "right";
  /** If true, draws additional curves on the inner edges of the columns (in the center gap). */
  drawInnerCurves?: boolean;
  innerCurvesBowGap?: number;
  innerCurvesInnerBowGap?: number;
  /**
   * Controls how far apart the outer and inner curve lines are where they
   * touch the capsule (in world units). Smaller = lines closer together (thinner bracket tip).
   * Defaults to the layout's `smallBoxH2` value.
   */
  tipThickness?: number;
}

interface BracketSpec extends CurveConfig {
  outerYTop: number;
  outerYBot: number;
  innerYTop: number;
  innerYBot: number;
  nestLevel: number;
  isCenter: boolean;
  leftColLeftTop?: number;
  leftColRightTop?: number;
  leftColLeftBot?: number;
  leftColRightBot?: number;
  rightColLeftTop?: number;
  rightColRightTop?: number;
  rightColLeftBot?: number;
  rightColRightBot?: number;
  /** Inherited from CurveConfig */
  curveSide?: "symmetrical" | "left" | "right";
  topAnchorXOffset?: number;
  bottomAnchorXOffset?: number;
  topAnchorYOffset?: number;
  bottomAnchorYOffset?: number;
}

const FALLBACK_OUTER_COLORS: CurveConfig[] = [
  { color: ORANGE_THEME, fillColor: CAPSULE_BG_6_19 },
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
  verseOverrides?: Record<number, { expandW?: number }>,
): BracketSpec[] {
  if (groups.length === 0) return [];

  const getEdges = (group?: GroupTransforms) => {
    if (!group || !group.verses) return {};
    const arr = Object.values(group.verses).sort((a, b) => a.x - b.x);
    if (arr.length === 0) return {};
    // Find verse IDs for this group's first (leftmost) and last (rightmost) capsules.
    const entries = Object.entries(group.verses) as [string, (typeof arr)[0]][];
    const sortedEntries = entries.sort(([, a], [, b]) => a.x - b.x);
    const leftEntry = sortedEntries[0];
    const rightEntry = sortedEntries[sortedEntries.length - 1];
    const leftExpandW = verseOverrides?.[Number(leftEntry[0])]?.expandW ?? 0;
    const rightExpandW = verseOverrides?.[Number(rightEntry[0])]?.expandW ?? 0;
    return {
      leftColLeft: leftEntry[1].x - leftExpandW,
      leftColRight: leftEntry[1].x + leftEntry[1].w + leftExpandW,
      rightColLeft: rightEntry[1].x - rightExpandW,
      rightColRight: rightEntry[1].x + rightEntry[1].w + rightExpandW,
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
      const tipThickness = outerColors[i]?.tipThickness ?? smallBoxH2;
      const halfTip = tipThickness / 2;
      // Center the two lines symmetrically around the middle of each capsule edge.
      // capsuleCenterTop = top of the top-group capsule's vertical midpoint
      const capsuleCenterTop = gTop.frameY - pad - smallBoxH2 / 2;
      const capsuleCenterBot = gBot.frameY - gBot.frameH + pad + smallBoxH2 / 2;
      const topEdges = getEdges(gTop);
      const botEdges = getEdges(gBot);

      brackets.push({
        outerYTop: capsuleCenterTop + halfTip,
        outerYBot: capsuleCenterBot - halfTip,
        innerYTop: capsuleCenterTop - halfTip,
        innerYBot: capsuleCenterBot + halfTip,
        nestLevel: i,
        isCenter: false,
        leftColLeftTop: topEdges.leftColLeft,
        leftColRightTop: topEdges.leftColRight,
        rightColLeftTop: topEdges.rightColLeft,
        rightColRightTop: topEdges.rightColRight,
        leftColLeftBot: botEdges.leftColLeft,
        leftColRightBot: botEdges.leftColRight,
        rightColLeftBot: botEdges.rightColLeft,
        rightColRightBot: botEdges.rightColRight,
        ...outerColors[i],
      });
    }

    if (centerGroup) {
      const pad = groupPad;
      const centerTipThickness = centerColor?.tipThickness ?? smallBoxH2;
      const centerHalfTip = centerTipThickness / 2;
      const centerCapsuleCenterTop = centerGroup.frameY - pad - smallBoxH2 / 2;
      const centerCapsuleCenterBot =
        centerGroup.frameY - centerGroup.frameH + pad + smallBoxH2 / 2;
      const centerEdges = getEdges(centerGroup);
      brackets.push({
        outerYTop: centerCapsuleCenterTop + centerHalfTip,
        outerYBot: centerCapsuleCenterBot - centerHalfTip,
        innerYTop: centerCapsuleCenterTop - centerHalfTip,
        innerYBot: centerCapsuleCenterBot + centerHalfTip,
        nestLevel: outerPairs,
        isCenter: true,
        leftColLeftTop: centerEdges.leftColLeft,
        leftColRightTop: centerEdges.leftColRight,
        rightColLeftTop: centerEdges.rightColLeft,
        rightColRightTop: centerEdges.rightColRight,
        leftColLeftBot: centerEdges.leftColLeft,
        leftColRightBot: centerEdges.leftColRight,
        rightColLeftBot: centerEdges.rightColLeft,
        rightColRightBot: centerEdges.rightColRight,
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
  const hasLine = color !== "transparent" && color !== "none";

  return (
    <group ref={groupRef} position={[0, 0, 0.0012]}>
      <group position={[0, 0, 0.0012]} renderOrder={5} visible={hasLine}>
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
  const isAllSectionsMode = useElevatedStore(
    (state) => state.isAllSectionsMode,
  );

  const configColors = useStoryStore(
    (state) => state.activeConfig.styling.colors,
  );
  const verseOverrides = useStoryStore(
    (state) => state.activeConfig.verseOverrides,
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

  const activeConfig = useStoryStore((s) => s.activeConfig);
  const s2SectionId = activeConfig.sections.find((s) => s.type === "verticalGroups")?.id;

  const hasActiveS2Section = useElevatedStore((state) => 
    state.activeSectionIds.some((id) =>
      s2SectionId && (id === s2SectionId || id.startsWith(`${s2SectionId}_g`))
    )
  );

  // Build set of section-1 popup group IDs so we can exclude them from hide logic
  const s1GroupIds = useMemo(() => {
    const s1Sec = activeConfig.sections.find((s) => s.type === "gridWithAnaAyet");
    if (!s1Sec) return new Set<string>();
    const s1Verses = [...(s1Sec as any).verses, (s1Sec as any).anaAyet];
    return new Set(
      popUpGroups
        .filter((g) => g.verseIds.every((id) => s1Verses.includes(id)))
        .map((g) => g.id),
    );
  }, [activeConfig, popUpGroups]);

  const shouldHide =
    popUpGroups.some((g) => g.isOpen && !s1GroupIds.has(g.id)) ||
    (!isAllSectionsMode && hasActiveS2Section);

  const borderDelta = borderWidth - DEFAULT_VERSE_BORDER_WIDTH;
  const baseStartX_L = startX + layout.s2Pad - 0.005;
  const baseStartX_R = startX + layout.sectionW - layout.s2Pad + 0.005;

  const brackets = useMemo(
    () =>
      computeBrackets(
        groups,
        layout,
        hasIntroOutro,
        outerColors,
        centerColor,
        verseOverrides,
      ),
    [groups, layout, hasIntroOutro, outerColors, centerColor, verseOverrides],
  );

  const totalLevels = brackets.length;

  return (
    <group position={[0, 0, 0.0025]} renderOrder={5}>
      {brackets.map((b, idx) => {
        const hasLine = b.color !== "transparent" && b.color !== "none";
        const hasFill = b.fillColor !== "transparent" && b.fillColor !== "none";
        if (!hasLine && !hasFill) return null;

        const bowMultiplier = totalLevels - b.nestLevel;
        const nestMultiplier = b.nestLevel + 1;

        const outerBow = b.bowGap ?? CURVE_GAP * bowMultiplier;
        const innerBow = b.innerBowGap ?? INNER_CURVE_GAP * bowMultiplier;
        const inwardOffset = b.inwardOffset ?? CURVE_INWARD_OFFSET;

        const innerInwardOffset = INNER_CURVE_INWARD_OFFSET * nestMultiplier;
        const deepOffsetOuter = CURVE_DEEP_OFFSET_OUTER;
        const deepOffsetInner = CURVE_DEEP_OFFSET_INNER;

        const leftColLeftTop = b.leftColLeftTop ?? baseStartX_L;
        const leftColLeftBot = b.leftColLeftBot ?? baseStartX_L;
        const rightColRightTop = b.rightColRightTop ?? baseStartX_R;
        const rightColRightBot = b.rightColRightBot ?? baseStartX_R;

        // Fallbacks for missing inner edges (e.g. for generic surahs if curveSide is used)
        const leftColRightTop = b.leftColRightTop ?? baseStartX_L + 0.4;
        const leftColRightBot = b.leftColRightBot ?? baseStartX_L + 0.4;
        const rightColLeftTop = b.rightColLeftTop ?? baseStartX_R - 0.4;
        const rightColLeftBot = b.rightColLeftBot ?? baseStartX_R - 0.4;

        const topYOffset = b.topAnchorYOffset || 0;
        const bottomYOffset = b.bottomAnchorYOffset || 0;

        const topDelta = idx === 0 ? borderDelta : 0;
        const botDelta = idx === 0 ? borderDelta : 0;

        const yTopOuter = b.outerYTop + topDelta + topYOffset;
        const yBotOuter = b.outerYBot - botDelta + bottomYOffset;
        const yTopInner = b.innerYTop + topDelta + topYOffset;
        const yBotInner = b.innerYBot - botDelta + bottomYOffset;

        const buildCurve = (
          edgeTop: number,
          edgeBot: number,
          bowDirection: -1 | 1,
          customOuterBow?: number,
          customInnerBow?: number,
        ) => {
          const usedOuterBow = customOuterBow ?? outerBow;
          const usedInnerBow = customInnerBow ?? innerBow;
          const minX = Math.min(edgeTop, edgeBot);
          const maxX = Math.max(edgeTop, edgeBot);
          const ctrlOuter =
            bowDirection === -1 ? minX - usedOuterBow : maxX + usedOuterBow;
          const ctrlInner =
            bowDirection === -1 ? minX - usedInnerBow : maxX + usedInnerBow;

          const sign = bowDirection === -1 ? 1 : -1;
          const tipOuterTop = b.isCenter
            ? edgeTop + sign * deepOffsetOuter
            : edgeTop + sign * inwardOffset;
          const tipOuterBot = b.isCenter
            ? edgeBot + sign * deepOffsetOuter
            : edgeBot + sign * inwardOffset;
          const tipInnerTop = b.isCenter
            ? edgeTop + sign * deepOffsetInner
            : edgeTop + sign * (inwardOffset + innerInwardOffset);
          const tipInnerBot = b.isCenter
            ? edgeBot + sign * deepOffsetInner
            : edgeBot + sign * (inwardOffset + innerInwardOffset);

          const outPts = getSmoothCurvePoints(
            tipOuterTop,
            ctrlOuter,
            tipOuterBot,
            yTopOuter,
            yBotOuter,
          );
          const inPts = getSmoothCurvePoints(
            tipInnerTop,
            ctrlInner,
            tipInnerBot,
            yTopInner,
            yBotInner,
          );
          return { outPts, inPts };
        };

        let curve1AnchorTop, curve1AnchorBot, curve1Bow: -1 | 1;
        let curve2AnchorTop, curve2AnchorBot, curve2Bow: -1 | 1;

        const cSide = b.curveSide || "symmetrical";

        const topAnchorOffset = b.topAnchorXOffset || 0;
        const bottomAnchorOffset = b.bottomAnchorXOffset || 0;

        if (cSide === "symmetrical") {
          curve1AnchorTop = leftColLeftTop - topAnchorOffset;
          curve1AnchorBot = leftColLeftBot - bottomAnchorOffset;
          curve1Bow = -1;

          curve2AnchorTop = rightColRightTop + topAnchorOffset;
          curve2AnchorBot = rightColRightBot + bottomAnchorOffset;
          curve2Bow = 1;
        } else if (cSide === "left") {
          curve1AnchorTop = leftColLeftTop - topAnchorOffset;
          curve1AnchorBot = leftColLeftBot - bottomAnchorOffset;
          curve1Bow = -1;

          curve2AnchorTop = rightColLeftTop - topAnchorOffset;
          curve2AnchorBot = rightColLeftBot - bottomAnchorOffset;
          curve2Bow = -1;
        } else {
          curve1AnchorTop = leftColRightTop + topAnchorOffset;
          curve1AnchorBot = leftColRightBot + bottomAnchorOffset;
          curve1Bow = 1;

          curve2AnchorTop = rightColRightTop + topAnchorOffset;
          curve2AnchorBot = rightColRightBot + bottomAnchorOffset;
          curve2Bow = 1;
        }

        const curve1 = buildCurve(curve1AnchorTop, curve1AnchorBot, curve1Bow);
        const curve2 = buildCurve(curve2AnchorTop, curve2AnchorBot, curve2Bow);

        let innerCurve1, innerCurve2;
        if (b.drawInnerCurves) {
          const iOuterBow = b.innerCurvesBowGap ?? outerBow;
          const iInnerBow = b.innerCurvesInnerBowGap ?? innerBow;
          innerCurve1 = buildCurve(
            leftColRightTop,
            leftColRightBot,
            1,
            iOuterBow,
            iInnerBow,
          );
          innerCurve2 = buildCurve(
            rightColLeftTop,
            rightColLeftBot,
            -1,
            iOuterBow,
            iInnerBow,
          );
        }

        return (
          <Fragment key={idx}>
            <CurveComponent
              outerPoints={curve1.outPts}
              innerPoints={curve1.inPts}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
              lineWidth={configColors.curveLineWidth}
            />
            <CurveComponent
              outerPoints={curve2.outPts}
              innerPoints={curve2.inPts}
              color={b.color}
              fillColor={b.fillColor}
              shouldHide={shouldHide}
              lineWidth={configColors.curveLineWidth}
            />
            {b.drawInnerCurves && innerCurve1 && (
              <CurveComponent
                outerPoints={innerCurve1.outPts}
                innerPoints={innerCurve1.inPts}
                color={b.color}
                fillColor={b.fillColor}
                shouldHide={shouldHide}
                lineWidth={configColors.curveLineWidth}
              />
            )}
            {b.drawInnerCurves && innerCurve2 && (
              <CurveComponent
                outerPoints={innerCurve2.outPts}
                innerPoints={innerCurve2.inPts}
                color={b.color}
                fillColor={b.fillColor}
                shouldHide={shouldHide}
                lineWidth={configColors.curveLineWidth}
              />
            )}
          </Fragment>
        );
      })}
    </group>
  );
};
