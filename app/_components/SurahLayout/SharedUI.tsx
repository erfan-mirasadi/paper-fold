"use client";

import { Text, useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  WHITE_BASE,
  SHADOW_BLACK,
  TEXT_DARK,
  TEXT_LABEL,
  BUMP_MAX,
  BUMP_MID_HIGH,
  BUMP_LOWER,
  HOLLOW_BORDER_COLOR,
  CIRCLE_BORDER,
  S1_ANA_LABEL_BG,
  S1_ANA_LABEL_TEXT,
  QURAN_FONT,
  TEXT_SIZES,
  S2_VERSE_NUMBER_TEXT,
} from "../data/theme";
export * from "../data/theme";
import {
  CAPSULE_BORDER_WIDTH,
  CIRCLE_BORDER_WIDTH,
  TOP_LABEL_WIDTH,
  VERSE_5_6_19_RADIUS,
} from "../data/SurahConfig";

// ROUNDED SHAPE GEOMETRY
interface RoundedShapeProps {
  w: number;
  h: number;
  radius: number;
  topOnly?: boolean;
  bottomOnly?: boolean;
}
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
  opacity?: number;
  transparent?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  toneMapped?: boolean;
}
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
  bumpColor = BUMP_MAX,
  topOnly = false,
  bottomOnly = false,
  opacity,
  transparent,
  emissive,
  emissiveIntensity,
  toneMapped,
}: UiRectProps) => {
  const finalColor = isBumpMap ? bumpColor : color;
  const resolvedTransparent =
    transparent ??
    (opacity !== undefined || (renderOrder != null && !isBumpMap));
  const resolvedOpacity =
    opacity ?? (renderOrder != null && !isBumpMap ? 0.999 : 1);
  const useEmissiveMaterial = Boolean(emissive) && !isBumpMap;

  return (
    <group position={[x, y, z]}>
      {/* Drop shadow layer — skipped in bump map passes */}
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
      {/* Main box layer */}
      <mesh renderOrder={renderOrder}>
        <RoundedShapeComponent
          w={w}
          h={h}
          radius={radius}
          topOnly={topOnly}
          bottomOnly={bottomOnly}
        />
        {useEmissiveMaterial ? (
          <meshStandardMaterial
            color={finalColor}
            depthTest={depthTest}
            transparent={resolvedTransparent}
            opacity={resolvedOpacity}
            emissive={emissive || "#000000"}
            emissiveIntensity={emissiveIntensity ?? 1}
            roughness={0.55}
            metalness={0.15}
            toneMapped={toneMapped ?? false}
          />
        ) : (
          <meshBasicMaterial
            color={finalColor}
            depthTest={depthTest}
            transparent={resolvedTransparent}
            opacity={resolvedOpacity}
            toneMapped={toneMapped}
          />
        )}
      </mesh>
    </group>
  );
};

// TOP LABEL
interface TopLabelProps {
  x: number;
  y: number;
  z?: number;
  text: string;
  labelWidth?: number;
  animateOnScroll?: boolean;
  scrollStart?: number;
  scrollRange?: number;
  isBumpMap?: boolean;
  partialBorder?: boolean;
  borderColor?: string;
  bottomBorder?: boolean;
  noBorder?: boolean;
  bgColor?: string;
  renderOrder?: number;
}

export function TopLabel({
  x,
  y,
  z = 0,
  text,
  labelWidth = TOP_LABEL_WIDTH,
  animateOnScroll = false,
  scrollStart = 0.4,
  scrollRange = 0.15,
  isBumpMap = false,
  partialBorder = false,
  borderColor = HOLLOW_BORDER_COLOR,
  bottomBorder = false,
  noBorder = false,
  bgColor = WHITE_BASE,
  renderOrder,
}: TopLabelProps) {
  const w = labelWidth;
  const h = 0.046;
  const radius = h / 2;

  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    // Scroll animation is completely disabled for bump map passes
    if (animateOnScroll && scroll && groupRef.current && !isBumpMap) {
      let targetOpacity = 0;
      if (scroll.offset > scrollStart) {
        targetOpacity = Math.min(
          (scroll.offset - scrollStart) / scrollRange,
          1,
        );
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
          renderOrder={renderOrder}
        />
      )}
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={w}
        h={h}
        radius={radius}
        color={bgColor}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_LOWER}
        topOnly={false}
        renderOrder={renderOrder != null ? renderOrder + 1 : undefined}
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
        renderOrder={renderOrder != null ? renderOrder + 2 : undefined}
      >
        {text}
      </Text>
    </group>
  );
}

// ANA AYET TAB
interface AnaAyetTabProps {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  isBumpMap?: boolean;
}
export function AnaAyetTab({
  x,
  y,
  w,
  h,
  z,
  isBumpMap = false,
}: AnaAyetTabProps) {
  const radius = h / 2;

  return (
    <group position={[x - w / 2, y + h / 2, z]}>
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={w}
        h={h}
        radius={radius}
        color={S1_ANA_LABEL_BG}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MID_HIGH}
      />

      <Text
        position={[w / 2, -h / 2, 0.002]}
        fontSize={TEXT_SIZES.TOP_LABEL}
        color={isBumpMap ? BUMP_MAX : S1_ANA_LABEL_TEXT}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-depthTest={false}
      >
        Ana Ayet
      </Text>
    </group>
  );
}
// VERSE BOX
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
  shadow?: boolean;
  isBumpMap?: boolean;
  bgOpacity?: number;
  textColor?: string;
}
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
  shadow = true,
  isBumpMap = false,
  bgOpacity = 1,
  textColor,
}: VerseBoxProps) => {
  const shrinkX = 0.001;
  const finalX = x + shrinkX;
  const finalW = w - shrinkX * 2;

  // Single border width for ALL capsules — tunable from SurahConfig.ts
  const bw = borderWidth ?? CAPSULE_BORDER_WIDTH;
  const rad = isPill ? h / 2 : VERSE_5_6_19_RADIUS;
  const cr = Math.min(h * 0.28, 0.021);
  const SMALL_PILL_OFFSET = 0.002;
  const cx = isPill ? cr + SMALL_PILL_OFFSET : 0.05;

  const safeMargin = 0.0;
  const textMaxW = finalW - safeMargin * 2;
  const textX = safeMargin + textMaxW / 2;

  const SMALL_TEXT_SHIFT = -0.01;
  const versePosX = isPill ? textX - SMALL_TEXT_SHIFT : textX;

  return (
    <group position={[finalX, y, z]}>
      {/* Outer border */}
      <UiRect
        x={-bw}
        y={bw}
        z={0}
        w={finalW + bw * 2}
        h={h + bw * 2}
        radius={rad + bw}
        color={border}
        shadow={shadow}
        renderOrder={10}
        isBumpMap={isBumpMap}
        bumpColor={BUMP_MAX}
      />
      {/* Inner fill */}
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
        opacity={bgOpacity}
      />

      {/* Verse number circle */}
      <group position={[cx, -h / 2, 0.002]}>
        <mesh renderOrder={12}>
          <circleGeometry args={[cr - CIRCLE_BORDER_WIDTH, 48]} />
          <meshBasicMaterial
            color={isBumpMap ? "#222222" : (circleBg ?? bg)}
            depthTest={false}
            transparent={!isBumpMap}
            opacity={0.999}
          />
        </mesh>
        <mesh position={[0, 0, -0.001]} renderOrder={12}>
          <circleGeometry args={[cr, 48]} />
          <meshBasicMaterial
            color={
              isBumpMap
                ? BUMP_MAX
                : (circleBorderCol ?? border ?? CIRCLE_BORDER)
            }
            depthTest={false}
            transparent={!isBumpMap}
            opacity={0.999}
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={TEXT_SIZES.VERSE_NUMBER}
          color={isBumpMap ? BUMP_MAX : S2_VERSE_NUMBER_TEXT}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material-depthTest={false}
          renderOrder={13}
        >
          {String(number)}
        </Text>
      </group>

      {/* Arabic verse text */}
      <Text
        position={[versePosX, -h / 2, 0.002]}
        fontSize={
          isPill ? TEXT_SIZES.VERSE_TEXT_SMALL : TEXT_SIZES.VERSE_TEXT_BIG
        }
        color={isBumpMap ? BUMP_MAX : textColor || TEXT_DARK}
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
