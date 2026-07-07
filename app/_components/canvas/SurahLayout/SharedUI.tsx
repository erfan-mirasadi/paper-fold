"use client";
import { a } from "@react-spring/three";

import { useTexture } from "@react-three/drei";
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
  LATIN_LABEL_FONT,
  TEXT_SIZES,
  LANGUAGE_TEXT_SCALE,
  S1_ANA_LABEL_BORDER,
} from "../../../data/theme";
export * from "../../../data/theme";
import {
  CAPSULE_BORDER_WIDTH,
  CIRCLE_BORDER_WIDTH,
  TOP_LABEL_WIDTH,
  VERSE_5_6_19_RADIUS,
  VERSE_TEXT_RIGHT_PADDING,
  SMALL_TEXT_SHIFT,
  BIG_VERSE_VERTICAL_SHIFT,
  SMALL_VERSE_VERTICAL_SHIFT,
  OPPOSITE_VERSE_CONNECTOR,
} from "../../../data/SurahConfig";
import {
  ANA_AYET_LABEL_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { cloneTextureAsAspectCover } from "../../../utils/textureFit";
import { CanvasText } from "../shared/CanvasText";
import { useStoryStore } from "../../../stores/useStoryStore";

// ROUNDED SHAPE GEOMETRY
interface RoundedShapeProps {
  w: number;
  h: number;
  radius: number;
  topOnly?: boolean;
  bottomOnly?: boolean;
  xMultiplier?: number;
}
export function RoundedShapeComponent({
  w,
  h,
  radius,
  topOnly = false,
  bottomOnly = false,
  xMultiplier = 1,
}: RoundedShapeProps) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = Math.min(radius, w / 2, h / 2);

    const rx = Math.min(r * xMultiplier, w / 2);

    if (topOnly) {
      const visibleH = h / 2;
      s.moveTo(rx, 0);
      s.lineTo(w - rx, 0);
      s.quadraticCurveTo(w, 0, w, -r);
      s.lineTo(w, -visibleH);
      s.lineTo(0, -visibleH);
      s.lineTo(0, -r);
      s.quadraticCurveTo(0, 0, rx, 0);
    } else if (bottomOnly) {
      const startY = -h / 2;
      s.moveTo(0, startY);
      s.lineTo(w, startY);
      s.lineTo(w, -(h - r));
      s.quadraticCurveTo(w, -h, w - rx, -h);
      s.lineTo(rx, -h);
      s.quadraticCurveTo(0, -h, 0, -(h - r));
      s.lineTo(0, startY);
    } else {
      s.moveTo(rx, 0);
      s.lineTo(w - rx, 0);
      s.quadraticCurveTo(w, 0, w, -r);
      s.lineTo(w, -(h - r));
      s.quadraticCurveTo(w, -h, w - rx, -h);
      s.lineTo(rx, -h);
      s.quadraticCurveTo(0, -h, 0, -(h - r));
      s.lineTo(0, -r);
      s.quadraticCurveTo(0, 0, rx, 0);
    }
    return s;
  }, [w, h, radius, topOnly, bottomOnly, xMultiplier]);
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
  opacity?: any;
  transparent?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  toneMapped?: boolean;
  xMultiplier?: number;
}

interface TexturedMaterialProps {
  url: string;
  w: number;
  h: number;
  useEmissive: boolean;
  depthTest: boolean;
  transparent: boolean;
  opacity: any;
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
      <a.meshStandardMaterial
        map={fittedTexture as any}
        color="#ffffff"
        depthTest={depthTest}
        depthWrite={false}
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
    <a.meshBasicMaterial
      map={fittedTexture as any}
      color="#ffffff"
      depthTest={depthTest}
      depthWrite={false}
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
  xMultiplier = 1,
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
            xMultiplier={xMultiplier}
          />
          <a.meshBasicMaterial
            color={SHADOW_BLACK}
            transparent
            opacity={opacity !== undefined ? opacity : 0.32}
            depthTest={depthTest}
            depthWrite={false}
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
          xMultiplier={xMultiplier}
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
          <a.meshStandardMaterial
            color={finalColor}
            depthTest={depthTest}
            depthWrite={false}
            transparent={resolvedTransparent}
            opacity={resolvedOpacity}
            emissive={emissive || "#000000"}
            emissiveIntensity={emissiveIntensity ?? 1}
            roughness={0.55}
            metalness={0.15}
            toneMapped={toneMapped ?? false}
          />
        ) : (
          <a.meshBasicMaterial
            color={finalColor}
            depthTest={depthTest}
            depthWrite={false}
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
  labelHeight?: number;
  partialBorder?: boolean;
  borderColor?: string;
  bottomBorder?: boolean;
  noBorder?: boolean;
  bgColor?: string;
  renderOrder?: number;
  depthTest?: boolean;
  fontSizeOverride?: number;
  shadow?: boolean;
  textOffsetY?: number;
  textScaleOverride?: number;
  textColor?: string;
  xMultiplier?: number;
  isSimpleText?: boolean;
}

export function TopLabel({
  x,
  y,
  z = 0,
  text,
  labelWidth = TOP_LABEL_WIDTH,
  labelHeight,
  partialBorder = false,
  borderColor = HOLLOW_BORDER_COLOR,
  bottomBorder = false,
  noBorder = false,
  bgColor = WHITE_BASE,
  renderOrder,
  depthTest = false,
  fontSizeOverride,
  shadow,
  textOffsetY = 0,
  textScaleOverride,
  textColor,
  xMultiplier,
  isSimpleText,
}: TopLabelProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const topLabelScale = LANGUAGE_TEXT_SCALE[activeLanguage].topLabel;
  const labelWidthScale = LANGUAGE_TEXT_SCALE[activeLanguage].labelWidth || 1;

  const w = labelWidth * labelWidthScale;
  const h = labelHeight ?? 0.046;
  const radius = h / 2;

  const groupRef = useRef<THREE.Group>(null);
  const borderThickness = 0.004;

  const isArabicText = /[\u0600-\u06FF]/.test(text);
  const fontToUse = isArabicText ? QURAN_FONT : LATIN_LABEL_FONT;
  const resolvedFontSize =
    (fontSizeOverride ??
      (isArabicText
        ? TEXT_SIZES.TOP_LABEL * topLabelScale * 1.5
        : TEXT_SIZES.TOP_LABEL * topLabelScale)) * (textScaleOverride ?? 1);

  return (
    <group position={[x - w / 2, y + h / 2, z]} ref={groupRef}>
      {!isSimpleText && !noBorder && (
        <UiRect
          x={-borderThickness}
          y={borderThickness}
          z={0}
          w={w + borderThickness * 2}
          h={h + borderThickness * 2}
          radius={radius + borderThickness}
          color={borderColor}
          shadow={shadow !== undefined ? shadow : !partialBorder}
          topOnly={partialBorder && !bottomBorder}
          bottomOnly={partialBorder && bottomBorder}
          renderOrder={renderOrder}
          depthTest={depthTest}
          xMultiplier={xMultiplier ?? 1.5}
        />
      )}
      {!isSimpleText && (
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
          depthTest={depthTest}
          xMultiplier={xMultiplier ?? 1.5}
        />
      )}
      <group position={[w / 2, -h / 2 + textOffsetY, 0.002]}>
        {isSimpleText && shadow !== false && (
          <CanvasText
            text={text}
            font={fontToUse}
            fontSize={resolvedFontSize}
            color="rgba(0,0,0,0.4)"
            width={w}
            height={h}
            textAlign="center"
            fontWeight="bold"
            renderOrder={renderOrder != null ? renderOrder + 1 : undefined}
            depthTest={depthTest}
            position={[0.0025, -0.0025, -0.001]}
          />
        )}
        <CanvasText
          text={text}
          font={fontToUse}
          fontSize={resolvedFontSize}
          color={textColor || TEXT_LABEL}
          width={w}
          height={h}
          textAlign="center"
          fontWeight="bold"
          renderOrder={renderOrder != null ? renderOrder + 2 : undefined}
          depthTest={depthTest}
        />
      </group>
    </group>
  );
}

// ANA AYET TAB
interface CapsuleLabelProps {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  borderWidth?: number;
  renderOrder?: number;
  depthTest?: boolean;
  customText?: string | Record<string, string>;
  labelScale?: number;
  opacity?: any;
}
export function CapsuleLabel({
  x,
  y,
  w,
  h,
  z,
  borderWidth,
  renderOrder,
  depthTest = false,
  customText,
  labelScale = 1,
  opacity,
}: CapsuleLabelProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);

  let resolvedCustomText: string | undefined;
  if (typeof customText === "object" && customText !== null) {
    resolvedCustomText = customText[activeLanguage] || customText["ar"];
  } else {
    resolvedCustomText = customText;
  }

  const labelText =
    resolvedCustomText ?? ANA_AYET_LABEL_BY_LANGUAGE[activeLanguage];
  const capsuleLabelScale = LANGUAGE_TEXT_SCALE[activeLanguage].capsuleLabel;

  const radius = h / 2;
  const borderThickness = borderWidth ?? 0.004;

  return (
    <group position={[x - w / 2, y + h / 2, z]}>
      <UiRect
        x={-borderThickness}
        y={borderThickness}
        z={0}
        w={w + borderThickness * 2}
        h={h + borderThickness * 2}
        radius={radius + borderThickness}
        color={S1_ANA_LABEL_BORDER}
        shadow={false}
        renderOrder={renderOrder}
        depthTest={depthTest}
        opacity={opacity}
        xMultiplier={1.5}
      />
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={w}
        h={h}
        radius={radius}
        color={S1_ANA_LABEL_BG}
        renderOrder={renderOrder}
        depthTest={depthTest}
        opacity={opacity}
        xMultiplier={1.5}
      />

      <group position={[w / 2, -h / 2, 0.002]}>
        <CanvasText
          text={labelText}
          font={LATIN_LABEL_FONT}
          fontSize={TEXT_SIZES.CAPSULE_LABEL * capsuleLabelScale * labelScale}
          color={S1_ANA_LABEL_TEXT}
          width={w}
          height={h}
          textAlign="center"
          fontWeight="bold"
          renderOrder={renderOrder}
          depthTest={depthTest}
          opacity={opacity}
        />
      </group>
    </group>
  );
}
// VERSE NUMBER BADGE — the small circled number, extracted so it can be
// reused standalone (e.g. one badge shared by two split capsules).
interface VerseNumberBadgeProps {
  x: number;
  y: number;
  z?: number;
  cr: number;
  number: number | string;
  circleBg: string;
  circleBorderCol: string;
  circleTextCol: string;
  opacity?: any;
  renderOrder?: number;
}
export function VerseNumberBadge({
  x,
  y,
  z = 0,
  cr,
  number,
  circleBg,
  circleBorderCol,
  circleTextCol,
  opacity,
  renderOrder,
}: VerseNumberBadgeProps) {
  const zOrder = renderOrder ?? 12;
  return (
    <group position={[x, y, z]}>
      <mesh renderOrder={zOrder}>
        <circleGeometry args={[cr - CIRCLE_BORDER_WIDTH, 48]} />
        <a.meshBasicMaterial
          color={circleBg}
          depthTest={true}
          depthWrite={false}
          transparent
          opacity={opacity ?? 0.999}
        />
      </mesh>
      <mesh position={[0, 0, -0.001]} renderOrder={zOrder}>
        <circleGeometry args={[cr, 48]} />
        <a.meshBasicMaterial
          color={circleBorderCol}
          depthTest={true}
          depthWrite={false}
          transparent
          opacity={opacity ?? 0.999}
        />
      </mesh>
      <group position={[0, 0, 0.002]}>
        <CanvasText
          text={String(number)}
          font={LATIN_LABEL_FONT}
          fontSize={TEXT_SIZES.VERSE_NUMBER}
          color={circleTextCol}
          width={cr * 2}
          height={cr * 2}
          textAlign="center"
          fontWeight="bold"
          depthTest={true}
          opacity={opacity}
          renderOrder={zOrder + 1}
        />
      </group>
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
  textOffsetY?: number;
  textScaleOverride?: number;
  opacity?: any;
  baseRenderOrder?: number;
  hideBackground?: boolean;
  textAlignOverride?: "left" | "center" | "right";
  /** When true, this capsule renders WITHOUT its own number circle — used
   * when a shared VerseNumberBadge is drawn externally for a split verse. */
  hideNumber?: boolean;
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
  textOffsetY = 0,
  textScaleOverride,
  opacity,
  baseRenderOrder,
  hideBackground = false,
  textAlignOverride,
  hideNumber = false,
}: VerseBoxProps) => {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const isArabic = activeLanguage === "ar";
  const langScale = LANGUAGE_TEXT_SCALE[activeLanguage];
  const textScale =
    textScaleOverride ?? (isPill ? langScale.verseSmall : langScale.verseBig);
  const textFont = isArabic ? QURAN_FONT : LATIN_VERSE_FONT;

  const activeStoryConfig = useStoryStore((s) => s.activeConfig);
  const showVerseNumber =
    !hideNumber && !(activeStoryConfig?.features?.hideVerseNumbers ?? false);
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
  const isTightPadding = activeStoryConfig?.globalSettings?.tightVersePadding === true;
  const cx = isPill ? cr + SMALL_PILL_OFFSET : (isTightPadding ? cr + 0.005 : 0.05);

  const isTranslationCenterOverride =
    !isArabic && textAlignOverride === "center";
  const centerTextInCapsule =
    !isPill || !showVerseNumber || isTranslationCenterOverride;

  // For non-Arabic (LTR) pill capsules, shift text away from the verse number.
  const circleEnd = cx + cr;
  const numberSidePadding = showVerseNumber ? circleEnd + (isTightPadding ? 0.005 : 0.012) : (isTightPadding ? 0.005 : 0.012);
  const textPaddingX = isArabic || centerTextInCapsule ? 0 : numberSidePadding;

  const textAlign = isArabic || centerTextInCapsule ? "center" : "left";

  const safeMargin = 0.0;
  // Increase padding for big verses so text stays clear of decorative border SVG swirls
  const EXTRA_BIG_VERSE_PADDING = !isPill && !isArabic && !isTightPadding ? 0.07 : 0;
  const centeredSidePadding = centerTextInCapsule
    ? (showVerseNumber ? numberSidePadding : (isTightPadding ? 0.005 : 0.012)) + EXTRA_BIG_VERSE_PADDING
    : 0;
  const textMaxW = isTightPadding
    ? finalW // remove wrapping limit so user can freely scale text to borders
    : !showVerseNumber
      ? finalW - 0.04
      : (finalW -
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

  // Visual centering adjustments moved to SurahConfig.ts
  const versePosX = !showVerseNumber
    ? finalW / 2
    : isArabic
      ? isPill
        ? textX - SMALL_TEXT_SHIFT
        : textX
      : textX;

  const verticalShift = isArabic
    ? isPill
      ? SMALL_VERSE_VERTICAL_SHIFT
      : BIG_VERSE_VERTICAL_SHIFT
    : 0;

  const zOrder = baseRenderOrder !== undefined ? baseRenderOrder : 10;

  return (
    <group position={[finalX, y, z]}>
      {/* 1. حاشیه (عمیقترین لایه z=0) */}
      <UiRect
        x={-bw}
        y={bw}
        z={0}
        w={finalW + bw * 2}
        h={h + bw * 2}
        radius={rad + bw}
        color={border}
        shadow={shadow}
        depthTest={true}
        opacity={opacity}
        renderOrder={zOrder}
      />
      {/* 2. پسزمینه (1 میلیمتر بالاتر z=0.001) */}
      <UiRect
        x={0}
        y={0}
        z={0.001}
        w={finalW}
        h={h}
        radius={rad}
        color={bg}
        depthTest={true}
        opacity={opacity !== undefined ? opacity : bgOpacity}
        renderOrder={zOrder + 1}
      />

      {/* 3. دایرهها (z=0.002 و z=0.003) */}
      {showVerseNumber && (
        <VerseNumberBadge
          x={cx}
          y={-h / 2}
          z={0.002}
          cr={cr}
          number={number}
          circleBg={circleBg ?? bg}
          circleBorderCol={circleBorderCol ?? border ?? CIRCLE_BORDER}
          circleTextCol={circleTextCol ?? TEXT_DARK}
          opacity={opacity}
          renderOrder={zOrder + 2}
        />
      )}

      {/* 4. متن عربی یا انگلیسی (بالاترین لایه z=0.005) */}
      <group
        position={[
          textAlign === "center" ? versePosX : versePosX + textMaxW / 2,
          -h / 2 + verticalShift + textOffsetY,
          0.005,
        ]}
      >
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
          depthTest={true}
          opacity={opacity}
          renderOrder={zOrder + 4}
        />
      </group>
    </group>
  );
};

// SPLIT VERSE CAPSULES — one verse rendered as TWO capsules (no per-capsule
// number) sharing a single VerseNumberBadge at the RTL "end" (left) edge.
interface SplitVerseCapsulesProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  h: number;
  /** RTL order: [nearNumberText, farFromNumberText]. */
  texts: [string, string];
  number: number | string;
  bg: string;
  border: string;
  circleBorderCol?: string;
  circleBg?: string;
  circleTextCol?: string;
  borderWidth?: number;
  textColor?: string;
  textScaleOverride?: number;
  opacity?: any;
  baseRenderOrder?: number;
}
export const SplitVerseCapsules = ({
  x,
  y,
  z = 0,
  w,
  h,
  texts,
  number,
  bg,
  border,
  circleBorderCol,
  circleBg,
  circleTextCol,
  borderWidth,
  textColor,
  textScaleOverride,
  opacity,
  baseRenderOrder,
}: SplitVerseCapsulesProps) => {
  const zOrder = baseRenderOrder !== undefined ? baseRenderOrder : 10;

  // Mirrors VerseBox's own circle geometry exactly, so the shared badge lines
  // up with where a normal capsule's own number would have sat.
  const cr = Math.min(h * 0.28, 0.021);
  const SMALL_PILL_OFFSET = 0.002;
  const cx = cr + SMALL_PILL_OFFSET;
  const badgeGap = 0.014;
  const capsuleGap = 0.012;

  const badgeZoneW = cx + cr + badgeGap;
  const capsuleW = (w - badgeZoneW - capsuleGap) / 2;

  const nearX = x + badgeZoneW;
  const farX = nearX + capsuleW + capsuleGap;

  // "Hollow connector" backdrop — same rounded-rect halo used behind paired
  // verses (e.g. v3/v4's row connector), sized to span from the shared badge
  // to the far capsule so the whole group reads as one connected unit.
  const connPad = OPPOSITE_VERSE_CONNECTOR;
  const connX = x - connPad.paddingX;
  const connW = farX + capsuleW - x + connPad.paddingX * 2;
  const connY = y + connPad.paddingY;
  const connH = h + connPad.paddingY * 2;

  return (
    <group>
      <UiRect
        x={connX}
        y={connY}
        z={z - 0.001}
        w={connW}
        h={connH}
        radius={connPad.radius}
        color={border}
        renderOrder={zOrder}
      />
      <VerseNumberBadge
        x={x + cx}
        y={y - h / 2}
        z={z + 0.002}
        cr={cr}
        number={number}
        circleBg={circleBg ?? bg}
        circleBorderCol={circleBorderCol ?? border ?? CIRCLE_BORDER}
        circleTextCol={circleTextCol ?? TEXT_DARK}
        opacity={opacity}
        renderOrder={zOrder + 2}
      />
      <VerseBox
        x={nearX}
        y={y}
        z={z}
        w={capsuleW}
        h={h}
        verse={texts[0]}
        number={number}
        bg={bg}
        border={border}
        borderWidth={borderWidth}
        textColor={textColor}
        textScaleOverride={textScaleOverride}
        opacity={opacity}
        baseRenderOrder={baseRenderOrder}
        hideNumber
      />
      <VerseBox
        x={farX}
        y={y}
        z={z}
        w={capsuleW}
        h={h}
        verse={texts[1]}
        number={number}
        bg={bg}
        border={border}
        borderWidth={borderWidth}
        textColor={textColor}
        textScaleOverride={textScaleOverride}
        opacity={opacity}
        baseRenderOrder={baseRenderOrder}
        hideNumber
      />
    </group>
  );
};
