"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useFoldAnimation } from "./useFoldAnimation";
import { PopUpVerseCard } from "./PopUpVerseCard";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_OUTER_BORDER,
} from "../paper-content/SharedUI";
import {
  layoutMath,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  START_X,
} from "../paper-content/index";
import { PAGE_DEPTH } from "../SinglePaper";

// ============================================================================
// POP-UP MANAGER (The Orchestrator)
// Calculates positions, generates shared 3D geometry once for performance,
// and maps out the individual Verse Cards.
// ============================================================================

interface PopUpManagerProps {
  isFolded: boolean;
}

export function PopUpManager({ isFolded }: PopUpManagerProps) {
  const { s1Top, s1Pad, gap, smallBoxH, innerHalfW } = layoutMath;
  const baseX = START_X + s1Pad;
  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;

  // Global Animation Hook
  const {
    isVisible,
    animationComplete,
    rotLeft,
    rotRight,
    shadowVal,
    zOffset,
    opacity,
  } = useFoldAnimation(isFolded);

  // ==========================================
  // Shared Geometry Settings (Memoized for Performance)
  // ==========================================
  const bw = 0.0055;
  const shrinkX = 0.001;
  const outerW = innerHalfW - shrinkX * 2 + bw * 2;
  const outerH = smallBoxH + bw * 2;
  const outerRadius = smallBoxH / 2 + bw;
  const outerLeft = shrinkX - bw;
  const outerTop = bw;
  const boxRadius = smallBoxH / 2;
  const backfaceColor = "#e8e4d8";

  const sharedShape = useMemo(() => {
    const s = new THREE.Shape();
    const r = outerRadius;
    const w = outerW;
    const h = outerH;
    s.moveTo(r, 0);
    s.lineTo(w - r, 0);
    s.quadraticCurveTo(w, 0, w, -r);
    s.lineTo(w, -(h - r));
    s.quadraticCurveTo(w, -h, w - r, -h);
    s.lineTo(r, -h);
    s.quadraticCurveTo(0, -h, 0, -(h - r));
    s.lineTo(0, -r);
    s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }, [outerW, outerH, outerRadius]);

  const sharedExtrudeSettings = useMemo(
    () => ({
      depth: 0.006,
      bevelEnabled: false,
    }),
    [],
  );

  // ==========================================
  // Positions
  // ==========================================
  const v2WorldX = baseX - PAGE_WIDTH / 2;
  const rowY = s1Top - s1Pad;
  const v2HingeX = v2WorldX + innerHalfW;
  const v1HingeX = baseX + innerHalfW + gap - PAGE_WIDTH / 2;

  if (!isVisible && animationComplete) return null;

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {/* LEFT VERSE (2) */}
      <PopUpVerseCard
        direction="left"
        hingeX={v2HingeX}
        rowY={rowY}
        zBaseOffset={zBaseOffset}
        rotValue={rotLeft}
        shadowVal={shadowVal}
        zOffset={zOffset}
        opacity={opacity}
        innerHalfW={innerHalfW}
        smallBoxH={smallBoxH}
        boxRadius={boxRadius}
        outerW={outerW}
        outerH={outerH}
        outerLeft={outerLeft}
        outerTop={outerTop}
        bw={bw}
        shape={sharedShape}
        extrudeSettings={sharedExtrudeSettings}
        backfaceColor={backfaceColor}
        verse="خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ"
        number={2}
        bg={S1_INNER_BG}
        border={S1_INNER_BORDER}
        circleBorderCol={S1_OUTER_BORDER}
        circleBg={S1_OUTER_BORDER}
        circleTextCol="#ffffff"
      />

      {/* RIGHT VERSE (1) */}
      <PopUpVerseCard
        direction="right"
        hingeX={v1HingeX}
        rowY={rowY}
        zBaseOffset={zBaseOffset}
        rotValue={rotRight}
        shadowVal={shadowVal}
        zOffset={zOffset}
        opacity={opacity}
        innerHalfW={innerHalfW}
        smallBoxH={smallBoxH}
        boxRadius={boxRadius}
        outerW={outerW}
        outerH={outerH}
        outerLeft={outerLeft}
        outerTop={outerTop}
        bw={bw}
        shape={sharedShape}
        extrudeSettings={sharedExtrudeSettings}
        backfaceColor={backfaceColor}
        verse="اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"
        number={1}
        bg={S1_INNER_BG}
        border={S1_INNER_BORDER}
        circleBorderCol={S1_OUTER_BORDER}
        circleBg={S1_OUTER_BORDER}
        circleTextCol="#ffffff"
      />
    </group>
  );
}
