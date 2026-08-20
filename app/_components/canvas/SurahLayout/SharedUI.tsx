"use client";
import { a } from "@react-spring/three";

import { useTexture } from "@react-three/drei";
import { useContext, useMemo, useRef } from "react";
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
  resolveVerseTextScaleMultiplier,
} from "../../../data/SurahConfig";
import {
  ANA_AYET_LABEL_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { cloneTextureAsAspectCover } from "../../../utils/textureFit";
import {
  CanvasText,
  PageTextDensityContext,
  PageZoomDensityContext,
} from "../shared/CanvasText";
import { useStoryStore } from "../../../stores/useStoryStore";
import type { AyahBadgeLayout, VerseTextHighlight } from "../../../data/schema";

// ROUNDED SHAPE GEOMETRY
/**
 * Builds a half-oval / dome THREE.Shape (flat side + a true elliptical arc).
 *
 *  dome "up"   → flat BOTTOM, elliptical arch bulging UP    (verse 8)
 *  dome "down" → flat TOP,    elliptical arch bulging DOWN  (verses 4 & 7)
 *
 * The arc springs straight off the flat edge's corners (i.e. it meets the
 * rectangle's connecting edge), so it reads as an oval, not a boxed-in
 * rounded rectangle.
 *
 * `sideRatio` (0–0.9) = the fraction of the height that stays a straight
 * vertical wall before the arc begins. Smaller ⇒ a taller, rounder dome;
 * larger ⇒ a flatter, shallower dome. This is the tunable "dome amount".
 *
 * Drawn in shape space: top edge at y = 0, bottom edge at y = -h.
 */
export function buildDomeShape(
  w: number,
  h: number,
  dome: "up" | "down",
  sideRatio: number,
): THREE.Shape {
  const s = new THREE.Shape();
  const wall = Math.max(0, Math.min(0.9, sideRatio)) * h; // straight wall
  const archH = h - wall; // vertical radius of the elliptical arc
  if (dome === "up") {
    // flat bottom → up the walls → elliptical arch over the top
    s.moveTo(0, -h);
    s.lineTo(w, -h);
    s.lineTo(w, -archH);
    s.absellipse(w / 2, -archH, w / 2, archH, 0, Math.PI, false);
    s.lineTo(0, -h);
  } else {
    // flat top → down the walls → elliptical arch bulging out the bottom
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, -wall);
    s.absellipse(w / 2, -wall, w / 2, archH, 0, -Math.PI, true);
    s.lineTo(0, 0);
  }
  return s;
}

interface RoundedShapeProps {
  w: number;
  h: number;
  radius: number;
  topOnly?: boolean;
  bottomOnly?: boolean;
  xMultiplier?: number;
  /**
   * When set, ignore the rounded-rect logic and build a half-oval / dome:
   *  'up'   → flat bottom, arched top.
   *  'down' → flat top, arched bottom.
   */
  dome?: "up" | "down";
  /** Straight-wall fraction (0–1) before the arch begins. Defaults to 0.35. */
  domeSideRatio?: number;
}
/**
 * Rounded-rect geometries, shared between every capsule that happens to be the
 * same size.
 *
 * A page is built out of a few shapes repeated a great many times: a verse
 * capsule, a label, a badge. Each one used to triangulate its own outline
 * (`ShapeGeometry` runs earcut) and upload its own buffer — an atlas page came
 * to hundreds of them, nearly all duplicates of a handful of distinct
 * rectangles. The triangulation is paid at mount, which is exactly the moment
 * a page is already slow: first load, and every paper switch.
 *
 * NOT AN LRU, deliberately. Evicting would mean disposing a geometry that
 * meshes still on screen are drawing from, and the reward for getting that
 * wrong is an invisible page. Instead the cache simply stops taking new entries
 * once it is full, and callers past that point get their own geometry with the
 * ordinary R3F lifetime. The set of distinct sizes a layout produces is small
 * and does not grow with reading, so the cap is a guard rather than a limit.
 */
const MAX_CACHED_SHAPES = 256;
const shapeGeometryCache = new Map<string, THREE.ShapeGeometry>();

/** Rounded so that sizes differing below a texel share one geometry. */
const q = (n: number) => Math.round(n * 10000) / 10000;

function getCachedShapeGeometry(
  key: string,
  build: () => THREE.Shape,
): THREE.ShapeGeometry | null {
  const hit = shapeGeometryCache.get(key);
  if (hit) return hit;
  if (shapeGeometryCache.size >= MAX_CACHED_SHAPES) return null;

  const geometry = new THREE.ShapeGeometry(build());
  shapeGeometryCache.set(key, geometry);
  return geometry;
}

export function RoundedShapeComponent({
  w,
  h,
  radius,
  topOnly = false,
  bottomOnly = false,
  xMultiplier = 1,
  dome,
  domeSideRatio = 0.2,
}: RoundedShapeProps) {
  const buildShape = useMemo(() => {
    const make = () => {
    if (dome) {
      return buildDomeShape(w, h, dome, domeSideRatio);
    }
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
    };
    return make;
  }, [w, h, radius, topOnly, bottomOnly, xMultiplier, dome, domeSideRatio]);

  const cacheKey = `${q(w)}|${q(h)}|${q(radius)}|${topOnly ? 1 : 0}|${
    bottomOnly ? 1 : 0
  }|${q(xMultiplier)}|${dome ?? "-"}|${q(domeSideRatio)}`;

  const shared = useMemo(
    () => getCachedShapeGeometry(cacheKey, buildShape),
    [cacheKey, buildShape],
  );

  // Shared entry: handed over as a prop-style primitive, which R3F treats as
  // externally owned and never disposes. Past the cap, fall back to the
  // original per-instance geometry and its ordinary R3F lifetime.
  if (shared) return <primitive object={shared} attach="geometry" />;
  return <shapeGeometry args={[buildShape()]} />;
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
  dome?: "up" | "down";
  domeSideRatio?: number;
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
  dome,
  domeSideRatio,
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
            dome={dome}
            domeSideRatio={domeSideRatio}
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
          dome={dome}
          domeSideRatio={domeSideRatio}
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
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const isFixed = activeConfig?.dimensions?.fixedWidthAcrossLanguages === true;
  const topLabelScale = isFixed
    ? 1
    : LANGUAGE_TEXT_SCALE[activeLanguage].topLabel;
  const labelWidthScale = isFixed
    ? 1
    : LANGUAGE_TEXT_SCALE[activeLanguage].labelWidth || 1;

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
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const isFixed = activeConfig?.dimensions?.fixedWidthAcrossLanguages === true;
  const capsuleLabelScale = isFixed
    ? 1
    : LANGUAGE_TEXT_SCALE[activeLanguage].capsuleLabel;

  let resolvedCustomText: string | undefined;
  if (typeof customText === "object" && customText !== null) {
    resolvedCustomText = customText[activeLanguage] || customText["ar"];
  } else {
    resolvedCustomText = customText;
  }

  const labelText =
    resolvedCustomText ?? ANA_AYET_LABEL_BY_LANGUAGE[activeLanguage];

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
  /** Draws the numeral alone, without the two circle discs behind it. */
  hideCircle?: boolean;
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
  hideCircle = false,
}: VerseNumberBadgeProps) {
  const zOrder = renderOrder ?? 12;
  return (
    <group position={[x, y, z]}>
      {!hideCircle && (
        <>
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
        </>
      )}
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
  /** EN/TR text color, replacing `textColor` there — see
   * `VerseOverrideConfig.translationTextColor`. */
  translationTextColor?: string;
  /** Substrings of `verse` drawn in their own color — see
   * `VerseOverrideConfig.textHighlights`. */
  textHighlights?: VerseTextHighlight[];
  /** The EN/TR set, replacing `textHighlights` there — see
   * `VerseOverrideConfig.translationTextHighlights`. */
  translationTextHighlights?: VerseTextHighlight[];
  /** 0 avoids capturing invisible text inside finite-frame RenderTextures. */
  textOffsetY?: number;
  textScaleOverride?: number;
  /**
   * The ARABIC verse/chunk id this capsule renders — the `verseOverrides` /
   * `blocks[].verseIds` key, which is NOT always the number on the badge (a
   * translation can reorder the page, and `displayNumber` can rename it).
   * Only used to look up the per-language text trim
   * (`globalSettings.languageTextScale`); pass it from wherever the lookup id
   * is already resolved.
   */
  verseId?: number;
  opacity?: any;
  baseRenderOrder?: number;
  hideBackground?: boolean;
  textAlignOverride?: "left" | "center" | "right";
  /** When true, this capsule renders WITHOUT its own number circle — used
   * when a shared VerseNumberBadge is drawn externally for a split verse. */
  hideNumber?: boolean;
  /** When true, shows the number badge even if `features.hideVerseNumbers`
   * is globally true — see `VerseOverrideConfig.showNumber`. */
  forceShowNumber?: boolean;
  /** Inner padding, every language — see `VerseOverrideConfig.versePadding`. */
  versePadding?: number;
  /** The EN/TR padding, replacing `versePadding` there — see
   * `VerseOverrideConfig.translationPadding`. */
  translationPadding?: number;
  /** Stacks the page's single ayah number under the chunk counter — see
   * `VerseOverrideConfig.showAyahNumber`. */
  showAyahNumber?: boolean;
  /** Optional separate bg for the stacked ayah number badge (e.g. "24"). Falls back to circleBg. */
  ayahBadgeBg?: string;
  /** Optional separate border color for the stacked ayah number badge (e.g. "24"). Falls back to circleBorderCol. */
  ayahBadgeBorderCol?: string;
  /** Optional separate text color for the stacked ayah number badge (e.g. "24"). Falls back to circleTextCol. */
  ayahBadgeTextCol?: string;
  /** Stacked badge only — where the two numbers sit in the capsule. See
   * `VerseOverrideConfig.ayahBadgeLayout`. */
  ayahBadgeLayout?: AyahBadgeLayout;
  /** Stacked badge only — the EN/TR layout, merged over `ayahBadgeLayout`. See
   * `VerseOverrideConfig.translationAyahBadgeLayout`. */
  translationAyahBadgeLayout?: AyahBadgeLayout;
  /** Renders the capsule as a half-oval / dome — 'up' (domed top) or 'down' (domed bottom). */
  domeDir?: "up" | "down";
  /** Straight-wall fraction for the dome (0–1). Defaults to 0.35. */
  domeSideRatio?: number;
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
  translationTextColor,
  textHighlights,
  translationTextHighlights,
  textOffsetY = 0,
  textScaleOverride,
  verseId,
  opacity,
  baseRenderOrder,
  hideBackground = false,
  textAlignOverride,
  hideNumber = false,
  forceShowNumber = false,
  versePadding,
  translationPadding,
  showAyahNumber = false,
  ayahBadgeBg,
  ayahBadgeBorderCol,
  ayahBadgeTextCol,
  ayahBadgeLayout,
  translationAyahBadgeLayout,
  domeDir,
  domeSideRatio,
}: VerseBoxProps) => {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const isArabic = activeLanguage === "ar";
  const activeStoryConfig = useStoryStore((s) => s.activeConfig);
  const isFixed =
    activeStoryConfig?.dimensions?.fixedWidthAcrossLanguages === true;
  const langScale = LANGUAGE_TEXT_SCALE[activeLanguage];
  // The per-language trim rides ON TOP of whatever size won here — the shared
  // baseline, the surah's `verseTextScale`, or this verse's own override — so
  // a translation can be brought down to fit without touching the Arabic.
  const langTrim = resolveVerseTextScaleMultiplier(
    activeStoryConfig,
    activeLanguage,
    verseId ?? (typeof number === "number" ? number : undefined),
  );
  const textScale =
    (textScaleOverride ?? (isPill ? langScale.verseSmall : langScale.verseBig)) *
    langTrim;
  const textFont = isArabic ? QURAN_FONT : LATIN_VERSE_FONT;

  // TEXT INK — Arabic reads `textColor`; the translations read it too unless
  // they were given their own. The highlights ride on top of whichever won,
  // recoloring named substrings of this capsule's text (the reference pages
  // print e.g. one word of a phrase in red, the rest in black).
  const resolvedTextColor =
    (isArabic ? textColor : (translationTextColor ?? textColor)) ?? TEXT_DARK;
  const resolvedHighlights = isArabic
    ? textHighlights
    : (translationTextHighlights ?? textHighlights);

  const showVerseNumber =
    forceShowNumber ||
    (!hideNumber && !(activeStoryConfig?.features?.hideVerseNumbers ?? false));
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
  const isTightPadding =
    activeStoryConfig?.globalSettings?.tightVersePadding === true;
  const cx = isPill
    ? cr + SMALL_PILL_OFFSET
    : isTightPadding
      ? cr + 0.005
      : 0.05;

  // DOME CAPSULES — the number never sits on a side wall (the arch eats it).
  // It is horizontally centred and pinned to the FLAT edge, i.e. the edge
  // opposite the dome: 'dome-down' (flat top) → top, 'dome-up' → bottom.
  // Sits right up against the flat edge — the circle only clears the border.
  const domeBadgeInset = Math.min(cr + bw, h / 2);
  const baseBadgeX = domeDir ? finalW / 2 : cx;
  const baseBadgeY = domeDir
    ? domeDir === "down"
      ? -domeBadgeInset
      : -(h - domeBadgeInset)
    : -h / 2;

  // SINGLE-AYAH PAGES — the badge slot can carry two numbers stacked: the real
  // mushaf ayah number keeps the normal badge design in the normal spot, and
  // the chunk counter rides above it as a bare numeral. Only a page that
  // declares `singleAyahNumber` has a second number to show.
  const singleAyahNumber = activeStoryConfig?.scriptInfo?.singleAyahNumber;
  const stackedAyahNumber =
    showAyahNumber && singleAyahNumber !== undefined
      ? singleAyahNumber
      : undefined;
  const isStacked = stackedAyahNumber !== undefined;

  // Two numbers need more room than one, so the stack — and only the stack —
  // can be walked off that shared spot by `ayahBadgeLayout`: the marker and the
  // counter each carry their own offset, measured from the slot each would take
  // by default, so a roomy capsule can drop the marker beside the text and
  // leave the counter in the corner (see nisa23Config's chunk 14). Translations
  // read their own layout on top — the same capsule holds a short Arabic phrase
  // and a wrapped translation, so the room beside the badge is never the same.
  const badgeLayout = isArabic
    ? (ayahBadgeLayout ?? {})
    : { ...ayahBadgeLayout, ...translationAyahBadgeLayout };
  const badgeOffsetX = isStacked ? (badgeLayout.offsetX ?? 0) : 0;
  const badgeOffsetY = isStacked ? (badgeLayout.offsetY ?? 0) : 0;
  const badgeX = baseBadgeX + badgeOffsetX;
  const badgeY = baseBadgeY + badgeOffsetY;
  // The counter falls back to the marker's own offsets, i.e. it rides directly
  // above it. A dome-down capsule already pins its badge to the top edge, so
  // the counter stacks downward there; everywhere else it stacks upward.
  const counterStackX = baseBadgeX + (badgeLayout.counterOffsetX ?? badgeOffsetX);
  const counterStackY =
    baseBadgeY +
    (domeDir === "down" ? -1 : 1) * cr * 2 +
    (badgeLayout.counterOffsetY ?? badgeOffsetY);

  const isTranslationCenterOverride =
    !isArabic && textAlignOverride === "center";
  const isTranslationLeftOverride = !isArabic && textAlignOverride === "left";
  const centerTextInCapsule =
    (!isPill || !showVerseNumber || isTranslationCenterOverride) &&
    !isTranslationLeftOverride;

  // For non-Arabic (LTR) pill capsules, shift text away from the verse number.
  const circleEnd = cx + cr;
  const numberSidePadding = showVerseNumber
    ? circleEnd + (isTightPadding ? 0.005 : 0.012)
    : isTightPadding
      ? 0.005
      : 0.012;
  const textPaddingX = isArabic || centerTextInCapsule ? 0 : numberSidePadding;

  const textAlign = isArabic || centerTextInCapsule ? "center" : "left";

  const safeMargin = 0.0;
  // THE PADDING THE CONFIG ASKED FOR, per side. Arabic reads `versePadding`;
  // the translations read it too unless they were given their own — the same
  // split as `textColor` / `translationTextColor` above.
  const explicitPadding = isArabic
    ? versePadding
    : (translationPadding ?? versePadding);
  // Increase padding for big verses so text stays clear of decorative border SVG swirls
  const defaultExtraPadding =
    !isPill && !isArabic && !isTightPadding ? 0.07 : 0;
  const EXTRA_BIG_VERSE_PADDING = explicitPadding ?? defaultExtraPadding;
  const centeredSidePadding = centerTextInCapsule
    ? (showVerseNumber ? numberSidePadding : isTightPadding ? 0.005 : 0.012) +
      EXTRA_BIG_VERSE_PADDING
    : 0;
  const textMaxW = isTightPadding
    ? // A tight page drops the wrapping limit so the text can be scaled right up
      // to the border — but an EXPLICIT padding is the one thing it still obeys,
      // otherwise a per-capsule padding would be silently ignored on every page
      // that opted into tightness (which is every generated Yâsîn sheet).
      finalW - (explicitPadding ?? 0) * 2
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

  // How finely this capsule's text is worth rasterising: set by the zoom of the
  // SHEET it is printed on, not by the tightest zoom anywhere on the paper.
  // Null on every ordinary surah, which has no sheets to tell apart — see
  // `PageZoomDensityContext`.
  const resolveTextDensity = useContext(PageZoomDensityContext);
  const textDensity = resolveTextDensity
    ? resolveTextDensity(x + w / 2, y - h / 2)
    : null;

  const capsule = (
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
        dome={domeDir}
        domeSideRatio={domeSideRatio}
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
        dome={domeDir}
        domeSideRatio={domeSideRatio}
      />

      {/* 3. دایرهها (z=0.002 و z=0.003) */}
      {showVerseNumber && (
        <>
          <VerseNumberBadge
            x={badgeX}
            y={badgeY}
            z={0.002}
            cr={cr}
            number={stackedAyahNumber ?? number}
            circleBg={ayahBadgeBg ?? circleBg ?? bg}
            circleBorderCol={
              ayahBadgeBorderCol ?? circleBorderCol ?? border ?? CIRCLE_BORDER
            }
            circleTextCol={ayahBadgeTextCol ?? circleTextCol ?? TEXT_DARK}
            opacity={opacity}
            renderOrder={zOrder + 2}
          />
          {isStacked && (
            <VerseNumberBadge
              x={counterStackX}
              y={counterStackY}
              z={0.002}
              cr={cr}
              number={number}
              hideCircle
              circleBg={circleBg ?? bg}
              circleBorderCol={circleBorderCol ?? border ?? CIRCLE_BORDER}
              circleTextCol={circleTextCol ?? TEXT_DARK}
              opacity={opacity}
              renderOrder={zOrder + 2}
            />
          )}
        </>
      )}

      {/* 4. متن عربی یا انگلیسی (بالاترین لایه z=0.005) */}
      <group
        position={[
          textAlign === "center" ? versePosX : versePosX + textMaxW / 2,
          // Text stays at the exact vertical centre of the capsule; on domes the
          // number badge moves off-centre to the flat edge instead (see badgeY).
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
          color={resolvedTextColor}
          highlights={resolvedHighlights}
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

  if (textDensity === null) return capsule;
  return (
    <PageTextDensityContext.Provider value={textDensity}>
      {capsule}
    </PageTextDensityContext.Provider>
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
  translationTextColor?: string;
  textHighlights?: VerseTextHighlight[];
  translationTextHighlights?: VerseTextHighlight[];
  textScaleOverride?: number;
  /** Arabic verse/chunk id — see `VerseBoxProps.verseId`. */
  verseId?: number;
  opacity?: any;
  baseRenderOrder?: number;
  versePadding?: number;
  translationPadding?: number;
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
  translationTextColor,
  textHighlights,
  translationTextHighlights,
  textScaleOverride,
  verseId,
  opacity,
  baseRenderOrder,
  versePadding,
  translationPadding,
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
        translationTextColor={translationTextColor}
        textHighlights={textHighlights}
        translationTextHighlights={translationTextHighlights}
        textScaleOverride={textScaleOverride}
        verseId={verseId}
        opacity={opacity}
        baseRenderOrder={baseRenderOrder}
        hideNumber
        versePadding={versePadding}
        translationPadding={translationPadding}
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
        translationTextColor={translationTextColor}
        textHighlights={textHighlights}
        translationTextHighlights={translationTextHighlights}
        textScaleOverride={textScaleOverride}
        verseId={verseId}
        opacity={opacity}
        baseRenderOrder={baseRenderOrder}
        hideNumber
        versePadding={versePadding}
        translationPadding={translationPadding}
      />
    </group>
  );
};
