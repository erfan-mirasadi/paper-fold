"use client";

import { Text, useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// ============================================================================
// GLOBAL THEME & CONSTANTS 
// Location: app/_components/paper-content/SharedUI.tsx
// Purpose: Centralized repository for all shared UI elements, colors, and styling rules.
// ============================================================================

export const QURAN_FONT = "/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf";

// ----------------------------------------------------------------------------
// 1. BASE COLORS
// ----------------------------------------------------------------------------
export const WHITE_BASE = "#ffffff";
export const SHADOW_BLACK = "#000000";
export const TEXT_DARK = "#1a1a1a";
export const TEXT_LABEL = "#4a423a";

// ----------------------------------------------------------------------------
// 2. BUMP MAP (EXTRUSION) COLORS
// These colors define the 3D depth of elements when generated as a heightmap.
// White = Highest Extrusion, Black = Lowest (Base flat surface)
// ----------------------------------------------------------------------------
export const BUMP_MAX = "#ffffff";
export const BUMP_HIGH = "#e3e3e3";
export const BUMP_MID_HIGH = "#555555";
export const BUMP_MID = "#444444";
export const BUMP_LOWER = "#333333";
export const BUMP_DEEP = "#222222";
export const BUMP_BASE = "#000000";

// ----------------------------------------------------------------------------
// 3. CANVAS & LAYOUT THEME COLORS
// ----------------------------------------------------------------------------
export const BG_COLOR = "#FDF8E4";
export const PAGE_BG_COLOR = "#EBEBDF";
export const HOLLOW_BORDER_COLOR = "#845775"; // Used for Section 2 wrapping borders
export const CIRCLE_BORDER = "#8e8e8e";

// ----------------------------------------------------------------------------
// 4. SECTION 1 COLORS
// ----------------------------------------------------------------------------
export const S1_OUTER_BG = "#F8E3B6";
export const S1_OUTER_BORDER = "#A3822E";
export const S1_INNER_BG = "#fbf1d5";
export const S1_INNER_BORDER = "#e2caae";
export const S1_ANA_BG = "#efbe6c";
export const S1_ANA_BORDER = "#b48238";

export const TAB_BG = "#e5ba71";
export const TAB_BORDER = "#96601b";
export const TAB_TEXT = "#432c10";

// ----------------------------------------------------------------------------
// 5. SECTION 2 COLORS
// ----------------------------------------------------------------------------
export const S2_OUTER_BG = "#F0E2CC";
export const S2_OUTER_BORDER = "#DBC180";
export const MAROON_THEME = "#7D3D62";
export const MAROON_VERSE_BG = "#ebd2dc";
export const GREEN_THEME = "#879A63";
export const GREEN_VERSE_BG = "#eaf2db";
export const BLUE_THEME = "#638f9c";
export const SG_BG = "#845775";
export const SG_BORDER = "#F4ECD8";

// ----------------------------------------------------------------------------
// 6. CAPSULE (VERSE BOX) COLORS
// ----------------------------------------------------------------------------
export const CAPSULE_BG_7_10_15_18 = "#E4D3DE";
export const CAPSULE_BG_12_14 = "#E0E6D0";
export const CAPSULE_BG_6_19 = "#F8F1E6";
export const WHITE_VERSE_BG = "#ffffff";

// ----------------------------------------------------------------------------
// 7. GLOBAL TEXT SIZES
// ----------------------------------------------------------------------------
export const TEXT_SIZES = {
  BISMILLAH: 0.054,
  TOP_LABEL: 0.023,
  ANA_AYET_TAB: 0.016,
  VERSE_NUMBER: 0.024,
  VERSE_TEXT_SMALL: 0.032,
  VERSE_TEXT_BIG: 0.051,
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

interface RoundedShapeProps {
  w: number;
  h: number;
  radius: number;
  topOnly?: boolean;
  bottomOnly?: boolean;
}

/**
 * RoundedShapeComponent
 * Generates custom rounded corner shapes geometrically for ThreeJS geometry.
 */
export function RoundedShapeComponent({
  w,
  h,
  radius,
  topOnly = false,
  bottomOnly = false,
}: RoundedShapeProps) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = Math.min(radius, w / 2, h / 2);

    if (topOnly) {
      const visibleH = h / 2;
      s.moveTo(r, 0);
      s.lineTo(w - r, 0);
      s.quadraticCurveTo(w, 0, w, -r);
      s.lineTo(w, -visibleH);
      s.lineTo(0, -visibleH);
      s.lineTo(0, -r);
      s.quadraticCurveTo(0, 0, r, 0);
    } else if (bottomOnly) {
      const startY = -h / 2;
      s.moveTo(0, startY);
      s.lineTo(w, startY);
      s.lineTo(w, -(h - r));
      s.quadraticCurveTo(w, -h, w - r, -h);
      s.lineTo(r, -h);
      s.quadraticCurveTo(0, -h, 0, -(h - r));
      s.lineTo(0, startY);
    } else {
      s.moveTo(r, 0);
      s.lineTo(w - r, 0);
      s.quadraticCurveTo(w, 0, w, -r);
      s.lineTo(w, -(h - r));
      s.quadraticCurveTo(w, -h, w - r, -h);
      s.lineTo(r, -h);
      s.quadraticCurveTo(0, -h, 0, -(h - r));
      s.lineTo(0, -r);
      s.quadraticCurveTo(0, 0, r, 0);
    }
    return s;
  }, [w, h, radius, topOnly, bottomOnly]);
  return <shapeGeometry args={[shape]} />;
}

interface UiRectProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  h: number;
  radius?: number;
  color: string;
  shadow?: boolean;
  depthTest?: boolean;
  renderOrder?: number;
  isBumpMap?: boolean;
  bumpColor?: string;
  topOnly?: boolean;
  bottomOnly?: boolean;
}

/**
 * UiRect
 * A universal rectangular layout block capable of generating shadows and managing 3D depth.
 */
export const UiRect = ({
  x,
  y,
  z = 0,
  w,
  h,
  radius = 0,
  color,
  shadow = false,
  depthTest = false,
  renderOrder,
  isBumpMap = false,
  bumpColor = BUMP_MAX, // Default to highest bump
  topOnly = false,
  bottomOnly = false,
}: UiRectProps) => {
  const finalColor = isBumpMap ? bumpColor : color;

  return (
    <group position={[x, y, z]}>
      {/* Shadow Layer */}
      {shadow && !isBumpMap && (
        <mesh position={[0.008, -0.008, -0.001]} renderOrder={renderOrder}>
          <RoundedShapeComponent
            w={w}
            h={h}
            radius={radius}
            topOnly={topOnly}
            bottomOnly={bottomOnly}
          />
          <meshBasicMaterial
            color={SHADOW_BLACK}
            transparent
            opacity={renderOrder != null ? 0.32 : 0.12}
            depthTest={depthTest}
          />
        </mesh>
      )}
      {/* Main Box Layer */}
      <mesh renderOrder={renderOrder}>
        <RoundedShapeComponent
          w={w}
          h={h}
          radius={radius}
          topOnly={topOnly}
          bottomOnly={bottomOnly}
        />
        <meshBasicMaterial
          color={finalColor}
          depthTest={depthTest}
          transparent={renderOrder != null && !isBumpMap}
          opacity={renderOrder != null && !isBumpMap ? 0.999 : 1}
        />
      </mesh>
    </group>
  );
};

interface TopLabelProps {
  x: number;
  y: number;
  z?: number;
  text: string;
  animateOnScroll?: boolean;
  isBumpMap?: boolean;
  partialBorder?: boolean;
  borderColor?: string;
  bottomBorder?: boolean;
  noBorder?: boolean;
}

/**
 * TopLabel
 * Top curved tags that label sections.
 */
export function TopLabel({
  x,
  y,
  z = 0,
  text,
  animateOnScroll = false,
  isBumpMap = false,
  partialBorder = false,
  borderColor = HOLLOW_BORDER_COLOR, 
  bottomBorder = false,
  noBorder = false,
}: TopLabelProps) {
  const w = 0.4;
  const h = 0.046;
  const radius = h / 2;

  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    // Scroll animation logic completely disabled for BumpMap to preserve structure
    if (animateOnScroll && scroll && groupRef.current && !isBumpMap) {
      let targetOpacity = 0;
      if (scroll.offset > 0.8) {
        targetOpacity = Math.min((scroll.offset - 0.8) / 0.15, 1);
      }

      groupRef.current.traverse((child: THREE.Object3D) => {
        const node = child as THREE.Object3D & {
          isMesh?: boolean;
          text?: string;
          material?: THREE.Material & {
            color?: THREE.Color;
            fillOpacity?: number;
            opacity?: number;
            transparent?: boolean;
          };
        };

        if (node.isMesh || node.text !== undefined) {
          const mat = node.material;
          node.visible = targetOpacity > 0;

          if (mat && targetOpacity > 0) {
            const isBlackShadow =
              mat.color &&
              mat.color.getHexString &&
              mat.color.getHexString() === "000000";

            if (node.text !== undefined || mat.fillOpacity !== undefined) {
              mat.fillOpacity = targetOpacity;
              mat.opacity = targetOpacity;
            } else {
              if (!isBlackShadow) {
                mat.transparent = targetOpacity < 1;
                mat.opacity = targetOpacity;
              } else {
                mat.transparent = true;
                mat.opacity = targetOpacity * 0.12;
              }
            }
          }
        }
      });
    }
  });

  const borderThickness = 0.004;

  return (
    <group position={[x - w / 2, y + h / 2, z]} ref={groupRef}>
      {!noBorder && (
        <UiRect
          x={-borderThickness}
          y={borderThickness}
          z={0}
          w={w + borderThickness * 2}
          h={h + borderThickness * 2}
          radius={radius + borderThickness}
          color={borderColor}
          shadow={!partialBorder}
          isBumpMap={isBumpMap}
          bumpColor={BUMP_MAX}
          topOnly={partialBorder && !bottomBorder}
          bottomOnly={partialBorder && bottomBorder}
        />
      )}
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={w}
        h={h}
        radius={radius}
        color={WHITE_BASE}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
        topOnly={false}
      />
      <Text
        position={[w / 2, -h / 2, 0.002]}
        fontSize={TEXT_SIZES.TOP_LABEL}
        color={isBumpMap ? BUMP_MAX : TEXT_LABEL}
        anchorX="center"
        anchorY="middle"
        fontStyle="normal"
        fontWeight="bold"
        material-depthTest={false}
      >
        {text}
      </Text>
    </group>
  );
}

interface AnaAyetTabProps {
  x: number;
  y: number;
  z: number;
  isBumpMap?: boolean;
}

/**
 * AnaAyetTab
 * Custom tab marking the focal point verse for Section 1.
 */
export function AnaAyetTab({ x, y, z, isBumpMap = false }: AnaAyetTabProps) {
  return (
    <group position={[x, y, z]}>
      <UiRect
        x={0}
        y={0}
        z={0}
        w={0.09}
        h={0.045}
        radius={0.008}
        color={TAB_BORDER}
        shadow
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX} 
      />
      <UiRect
        x={0.003}
        y={-0.003}
        z={0.001}
        w={0.084}
        h={0.039}
        radius={0.006}
        color={TAB_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MID_HIGH}
      />
      <Text
        position={[0.045, -0.0225, 0.002]}
        fontSize={TEXT_SIZES.ANA_AYET_TAB}
        color={isBumpMap ? BUMP_MAX : TAB_TEXT}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-depthTest={false}
        font={QURAN_FONT}
      >
        Ana Ayet
      </Text>
    </group>
  );
}

interface VerseBoxProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  h: number;
  verse: string;
  number: number | string;
  bg: string;
  border: string;
  circleBorderCol?: string;
  circleBg?: string;
  circleTextCol?: string;
  isPill?: boolean;
  borderWidth?: number;
  isBumpMap?: boolean;
}

/**
 * VerseBox
 * Modular box renderer holding Verse Text, Numbers and managing all inner layouts.
 */
export const VerseBox = ({
  x,
  y,
  z = 0,
  w,
  h,
  verse,
  number,
  bg,
  border,
  circleBorderCol,
  circleBg,
  circleTextCol,
  isPill = true,
  borderWidth,
  isBumpMap = false,
}: VerseBoxProps) => {
  const shrinkX = 0.001; 
  const finalX = x + shrinkX;
  const finalW = w - shrinkX * 2;

  const bw = borderWidth ?? 0.0055; 
  const rad = isPill ? h / 2 : 0.05;
  const cr = Math.min(h * 0.46, 0.035);
  const SMALL_PILL_OFFSET = 0.002; 
  const cx = isPill ? cr + SMALL_PILL_OFFSET : 0.05;

  const safeMargin = 0.0;
  const textMaxW = finalW - safeMargin * 2;
  const textX = safeMargin + textMaxW / 2;

  const SMALL_TEXT_SHIFT = -0.02;
  const versePosX = isPill ? textX - SMALL_TEXT_SHIFT : textX;

  return (
    <group position={[finalX, y, z]}>
      {/* Outer Border Component Base Level */}
      <UiRect
        x={-bw}
        y={bw}
        z={0}
        w={finalW + bw * 2}
        h={h + bw * 2}
        radius={rad + bw}
        color={border}
        shadow
        renderOrder={10}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      {/* Inner Highlight Layer */}
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={finalW}
        h={h}
        radius={rad}
        color={bg}
        renderOrder={11}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
      />

      <group position={[cx, -h / 2, 0.002]}>
        {/* Circle Background */}
        <mesh renderOrder={12}>
          <circleGeometry args={[cr - 0.002, 48]} />
          <meshBasicMaterial
            color={isBumpMap ? BUMP_DEEP : circleBg || WHITE_BASE}
            depthTest={false}
            transparent={!isBumpMap}
            opacity={0.999}
          />
        </mesh>
        {/* Circle Border Line */}
        <mesh position={[0, 0, -0.001]} renderOrder={12}>
          <circleGeometry args={[cr, 48]} />
          <meshBasicMaterial
            color={isBumpMap ? BUMP_MAX : circleBorderCol || CIRCLE_BORDER}
            depthTest={false}
            transparent={!isBumpMap}
            opacity={0.999}
          />
        </mesh>
        {/* Number Text Layer */}
        <Text
          position={[0, 0, 0.001]}
          fontSize={TEXT_SIZES.VERSE_NUMBER}
          color={isBumpMap ? BUMP_MAX : circleTextCol || TEXT_DARK}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material-depthTest={false}
          renderOrder={13}
        >
          {String(number)}
        </Text>
      </group>

      {/* Main Verse Content Layer */}
      <Text
        position={[versePosX, -h / 2, 0.002]}
        fontSize={isPill ? TEXT_SIZES.VERSE_TEXT_SMALL : TEXT_SIZES.VERSE_TEXT_BIG}
        color={isBumpMap ? BUMP_MAX : TEXT_DARK} 
        anchorX="center"
        anchorY="middle"
        maxWidth={textMaxW}
        textAlign="center"
        material-depthTest={false}
        font={QURAN_FONT}
        direction="rtl"
        renderOrder={13}
      >
        {verse}
      </Text>
    </group>
  );
};
