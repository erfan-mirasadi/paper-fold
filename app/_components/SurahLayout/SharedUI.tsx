"use client";

import { Text, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  WHITE_BASE,
  SHADOW_BLACK,
  TEXT_DARK,
  TEXT_LABEL,
  HOLLOW_BORDER_COLOR,
  CIRCLE_BORDER,
  S1_ANA_LABEL_BG,
  S1_ANA_LABEL_TEXT,
  QURAN_FONT,
  LATIN_VERSE_FONT,
  TEXT_SIZES,
  S2_VERSE_NUMBER_TEXT,
  LANGUAGE_TEXT_SCALE,
} from "../data/theme";
export * from "../data/theme";
import {
  CAPSULE_BORDER_WIDTH,
  CIRCLE_BORDER_WIDTH,
  TOP_LABEL_WIDTH,
  VERSE_5_6_19_RADIUS,
  VERSE_TEXT_RIGHT_PADDING,
} from "../data/SurahConfig";
import {
  ANA_AYET_LABEL_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../data/useSurahLanguageStore";
import { cloneTextureAsAspectCover } from "../shared/textureFit";
import { CanvasText } from "../shared/CanvasText";

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
  topOnly?: boolean;
  bottomOnly?: boolean;
  opacity?: number;
  transparent?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  toneMapped?: boolean;
}

interface TexturedMaterialProps {
  url: string;
  w: number;
  h: number;
  useEmissive: boolean;
  depthTest: boolean;
  transparent: boolean;
  opacity: number;
  toneMapped: boolean;
  emissive: string;
  emissiveIntensity: number;
}

function TexturedMaterial({
  url,
  w,
  h,
  useEmissive,
  depthTest,
  transparent,
  opacity,
  toneMapped,
  emissive,
  emissiveIntensity,
}: TexturedMaterialProps) {
  const texture = useTexture(url, (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
  });
  const fittedTexture = useMemo(
    () =>
      cloneTextureAsAspectCover(texture, w, h, undefined, {
        offset: { y: -0.05 },
      }),
    [texture, w, h],
  );

  if (useEmissive) {
    return (
      <meshStandardMaterial
        map={fittedTexture}
        color="#ffffff"
        depthTest={depthTest}
        transparent={transparent}
        opacity={opacity}
        toneMapped={toneMapped}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.55}
        metalness={0.15}
      />
    );
  }

  return (
    <meshBasicMaterial
      map={fittedTexture}
      color="#ffffff"
      depthTest={depthTest}
      transparent={transparent}
      opacity={opacity}
      toneMapped={toneMapped}
    />
  );
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
  topOnly = false,
  bottomOnly = false,
  opacity,
  transparent,
  emissive,
  emissiveIntensity,
  toneMapped,
}: UiRectProps) => {
  const finalColor = color;
  const resolvedTransparent =
    transparent ?? (opacity !== undefined || renderOrder != null);
  const resolvedOpacity = opacity ?? (renderOrder != null ? 0.999 : 1);
  const useEmissiveMaterial = Boolean(emissive);
  const isImage =
    typeof finalColor === "string" && /\.(jpe?g|png|webp)$/i.test(finalColor);

  return (
    <group position={[x, y, z]}>
      {shadow && (
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
        {isImage ? (
          <TexturedMaterial
            url={finalColor}
            w={w}
            h={h}
            useEmissive={useEmissiveMaterial}
            depthTest={depthTest}
            transparent={resolvedTransparent}
            opacity={resolvedOpacity}
            toneMapped={toneMapped ?? false}
            emissive={emissive || "#000000"}
            emissiveIntensity={emissiveIntensity ?? 1}
          />
        ) : useEmissiveMaterial ? (
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
  partialBorder = false,
  borderColor = HOLLOW_BORDER_COLOR,
  bottomBorder = false,
  noBorder = false,
  bgColor = WHITE_BASE,
  renderOrder,
}: TopLabelProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const topLabelScale = LANGUAGE_TEXT_SCALE[activeLanguage].topLabel;

  const w = labelWidth;
  const h = 0.046;
  const radius = h / 2;

  const groupRef = useRef<THREE.Group>(null);
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
        topOnly={false}
        renderOrder={renderOrder != null ? renderOrder + 1 : undefined}
      />
      {activeLanguage === "ar" ? (
        <group position={[w / 2, -h / 2, 0.002]}>
          <CanvasText
            text={text}
            font={QURAN_FONT}
            fontSize={TEXT_SIZES.TOP_LABEL * topLabelScale}
            color={TEXT_LABEL}
            textAlign="center"
            width={w}
            height={h}
          />
        </group>
      ) : (
        <Text
          position={[w / 2, -h / 2, 0.002]}
          fontSize={TEXT_SIZES.TOP_LABEL * topLabelScale}
          color={TEXT_LABEL}
          anchorX="center"
          anchorY="middle"
          fontStyle="normal"
          fontWeight="bold"
          material-depthTest={false}
          renderOrder={renderOrder != null ? renderOrder + 2 : undefined}
          sdfGlyphSize={128}
        >
          {text}
        </Text>
      )}
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
}
export function AnaAyetTab({ x, y, w, h, z }: AnaAyetTabProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const labelText = ANA_AYET_LABEL_BY_LANGUAGE[activeLanguage];
  const topLabelScale = LANGUAGE_TEXT_SCALE[activeLanguage].topLabel;

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
      />

      {activeLanguage === "ar" ? (
        <group position={[w / 2, -h / 2, 0.002]}>
          <CanvasText
            text={labelText}
            font={QURAN_FONT}
            fontSize={TEXT_SIZES.TOP_LABEL * topLabelScale}
            color={S1_ANA_LABEL_TEXT}
            textAlign="center"
            width={w}
            height={h}
          />
        </group>
      ) : (
        <Text
          position={[w / 2, -h / 2, 0.002]}
          fontSize={TEXT_SIZES.TOP_LABEL * topLabelScale}
          color={S1_ANA_LABEL_TEXT}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material-depthTest={false}
          sdfGlyphSize={128}
        >
          {labelText}
        </Text>
      )}
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
  bgOpacity?: number;
  textColor?: string;
  /** 0 avoids capturing invisible text inside finite-frame RenderTextures. */
  verseTextEnterDurationMs?: number;
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
  bgOpacity = 1,
  textColor,
  verseTextEnterDurationMs = 0,
}: VerseBoxProps) => {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const isArabic = activeLanguage === "ar";
  const langScale = LANGUAGE_TEXT_SCALE[activeLanguage];
  const textScale = isPill ? langScale.verseSmall : langScale.verseBig;
  const textDirection = isArabic ? "rtl" : "ltr";
  const textFont = isArabic ? QURAN_FONT : LATIN_VERSE_FONT;
  const showVerseNumber = true;
  const textLineHeight = isArabic ? 1.2 : 1.06;
  const nonArabicTextTighten = 1;

  const shrinkX = 0.001;
  const finalX = x + shrinkX;
  const finalW = w - shrinkX * 2;

  // Single border width for ALL capsules — tunable from SurahConfig.ts
  const bw = borderWidth ?? CAPSULE_BORDER_WIDTH;
  const rad = isPill ? h / 2 : VERSE_5_6_19_RADIUS;
  const cr = Math.min(h * 0.28, 0.021);
  const SMALL_PILL_OFFSET = 0.002;
  const cx = isPill ? cr + SMALL_PILL_OFFSET : 0.05;

  const centerTextInCapsule = !isPill;

  // For non-Arabic (LTR) pill capsules, shift text away from the verse number.
  const circleEnd = cx + cr;
  const numberSidePadding = showVerseNumber ? circleEnd + 0.012 : 0.012;
  const textPaddingX = isArabic || centerTextInCapsule ? 0 : numberSidePadding;

  const textAlign = isArabic || centerTextInCapsule ? "center" : "left";
  const textAnchorX = isArabic || centerTextInCapsule ? "center" : "left";

  const safeMargin = 0.0;
  const centeredSidePadding = centerTextInCapsule ? numberSidePadding : 0;
  const textMaxW =
    (finalW -
      safeMargin * 2 -
      centeredSidePadding * 2 -
      textPaddingX -
      (isArabic ? textPaddingX : VERSE_TEXT_RIGHT_PADDING)) *
    nonArabicTextTighten;
  const textX = centerTextInCapsule
    ? finalW / 2
    : isArabic
      ? safeMargin + textMaxW / 2
      : safeMargin + textPaddingX;

  const SMALL_TEXT_SHIFT = -0.01;
  const versePosX = isArabic
    ? isPill
      ? textX - SMALL_TEXT_SHIFT
      : textX
    : textX;

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
        opacity={bgOpacity}
      />

      {/* Verse number circle (Arabic only) */}
      {showVerseNumber && (
        <group position={[cx, -h / 2, 0.002]}>
          <mesh renderOrder={12}>
            <circleGeometry args={[cr - CIRCLE_BORDER_WIDTH, 48]} />
            <meshBasicMaterial
              color={circleBg ?? bg}
              depthTest={false}
              transparent={true}
              opacity={0.999}
            />
          </mesh>
          <mesh position={[0, 0, -0.001]} renderOrder={12}>
            <circleGeometry args={[cr, 48]} />
            <meshBasicMaterial
              color={circleBorderCol ?? border ?? CIRCLE_BORDER}
              depthTest={false}
              transparent={true}
              opacity={0.999}
            />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={TEXT_SIZES.VERSE_NUMBER}
            color={circleTextCol ?? S2_VERSE_NUMBER_TEXT}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            material-depthTest={false}
            renderOrder={13}
            sdfGlyphSize={128}
          >
            {String(number)}
          </Text>
        </group>
      )}

      {isArabic ? (
        <group position={[versePosX, -h / 2, 0.002]}>
          <CanvasText
            text={verse}
            font={textFont}
            fontSize={
              (isPill ? TEXT_SIZES.VERSE_TEXT_SMALL : TEXT_SIZES.VERSE_TEXT_BIG) *
              textScale
            }
            color={textColor || TEXT_DARK}
            maxWidth={textMaxW}
            lineHeight={textLineHeight}
            textAlign={textAlign}
            width={textMaxW}
            height={h}
          />
        </group>
      ) : (
        <Text
          position={[versePosX, -h / 2, 0.002]}
          fontSize={
            (isPill ? TEXT_SIZES.VERSE_TEXT_SMALL : TEXT_SIZES.VERSE_TEXT_BIG) *
            textScale
          }
          color={textColor || TEXT_DARK}
          anchorX={textAnchorX}
          anchorY="middle"
          maxWidth={textMaxW}
          lineHeight={textLineHeight}
          textAlign={textAlign}
          font={textFont}
          direction={textDirection}
          renderOrder={14}
          material-depthTest={false}
          material-transparent={true}
          sdfGlyphSize={128}
        >
          {verse}
        </Text>
      )}
    </group>
  );
};
