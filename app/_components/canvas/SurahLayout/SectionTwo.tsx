"use client";
import { TopLabel, VerseBox, UiRect } from "./SharedUI";
import { SideCurves } from "./SideCurves";
// import { HollowConnector } from "./HollowConnector";
import { VerseGroup } from "./VerseGroup";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  // S2_OUTER_BORDER,
  // S2_OUTER_BG,
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
  S2_FRAME_BG_COLOR,
  S2_FRAME_IMAGE,
} from "../../../data/theme";
import type { SectionTwoData, LayoutConfig } from "../../../data/SurahConfig";
import { SectionTransforms, GroupTransforms } from "../../../data/schema";
import { S2_LABEL_WIDTH, S2_LABEL_Y_OFFSET } from "../../../data/SurahConfig";
import { useStoryStore } from "../../../stores/useStoryStore";

interface SectionTwoProps {
  data: SectionTwoData;
  transforms: SectionTransforms;
  layout: LayoutConfig;
  startX: number;
  PW: number;
  isFolded?: boolean;
}

export const S2_TOP_SOLID_SCALE_X = 0.9;
export const S2_TOP_SOLID_SCALE_Y = 0.9;
export const S2_TOP_SOLID_X_OFFSET = 0;
export const S2_TOP_SOLID_Y_OFFSET = 0.003;

export const S2_TOP_IMAGE_SCALE_X = 1.05;
export const S2_TOP_IMAGE_SCALE_Y = 1.15;
export const S2_TOP_IMAGE_X_OFFSET = 0;
export const S2_TOP_IMAGE_Y_OFFSET = 0.025;

export const S2_BOTTOM_SOLID_SCALE_X = 0.9;
export const S2_BOTTOM_SOLID_SCALE_Y = 0.9;
export const S2_BOTTOM_SOLID_X_OFFSET = 0;
export const S2_BOTTOM_SOLID_Y_OFFSET = -0.003;

export const S2_BOTTOM_IMAGE_SCALE_X = 1.05;
export const S2_BOTTOM_IMAGE_SCALE_Y = -1.15;
export const S2_BOTTOM_IMAGE_X_OFFSET = 0;
export const S2_BOTTOM_IMAGE_Y_OFFSET = -0.025;

export function SectionTwo({
  data,
  transforms,
  layout,
  startX,
  PW,
}: SectionTwoProps) {
  const t = transforms as Required<SectionTransforms>;
  const edgeVerseBorderWidth = t.borderWidth;

  // ── Config-driven intro/outro verse colours ──────────────────────────────
  const config = useStoryStore((state) => state.activeConfig);
  const introVerseNum = data.introVerse?.number ?? 6;
  const outroVerseNum = data.outroVerse?.number ?? 19;
  const introOverride = config.verseOverrides?.[introVerseNum];
  const outroOverride = config.verseOverrides?.[outroVerseNum];
  // Fallback: s2IntroOutroBg for background, maroonTheme for border.
  const introBg = introOverride?.bg ?? config.styling.colors.s2IntroOutroBg;
  const introBorder =
    introOverride?.border ?? config.styling.colors.maroonTheme;
  const outroBg = outroOverride?.bg ?? config.styling.colors.s2IntroOutroBg;
  const outroBorder =
    outroOverride?.border ?? config.styling.colors.maroonTheme;

  // useTexture must always be called (React hook rules), but the mesh that
  // uses it is only mounted when hasFrames is true — no wasted render cost.
  const texture = useTexture(S2_FRAME_IMAGE, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  // ── Conditional rendering guards — derived from data/transforms, NOT config.id ──
  // The buildSurahTransforms engine only writes topConnectorY/H when hasIntro===true.
  const hasFrames =
    t.topConnectorY !== undefined &&
    t.topConnectorH !== undefined &&
    t.bottomConnectorY !== undefined &&
    t.bottomConnectorH !== undefined;

  // Intro/outro verse exists when the transform object contains the field
  // AND the verse has a meaningful (non-zero) number.
  const hasIntroVerse =
    transforms.introVerse !== undefined && (data.introVerse?.number ?? 0) > 0;
  const hasOutroVerse =
    transforms.outroVerse !== undefined && (data.outroVerse?.number ?? 0) > 0;

  // Only render section labels if there is something to say.
  const hasTopLabel = !!data.topLabel;
  const hasBottomLabel = !!data.bottomLabel;

  // Pass to SideCurves — it needs to know the group geometry and intro context.
  const groups = transforms.groups ?? [];

  return (
    <group>
      {/* ─── TOP BLOCK BACKGROUND (Section 2) ──────────────────────────── */}
      {hasFrames && (
        <>
          {/* Yellow solid background */}
          <mesh
            position={[
              t.connectorX + t.connectorW / 2 + S2_TOP_SOLID_X_OFFSET,
              t.topConnectorY - t.topConnectorH / 2 + S2_TOP_SOLID_Y_OFFSET,
              -0.001,
            ]}
            scale={[S2_TOP_SOLID_SCALE_X, S2_TOP_SOLID_SCALE_Y, 1]}
            renderOrder={1}
          >
            <planeGeometry args={[t.connectorW, t.topConnectorH]} />
            <meshBasicMaterial
              color={S2_FRAME_BG_COLOR}
              toneMapped={false}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>

          {/* Stretched main-frame image as background */}
          <mesh
            position={[
              t.connectorX + t.connectorW / 2 + S2_TOP_IMAGE_X_OFFSET,
              t.topConnectorY - t.topConnectorH / 2 + S2_TOP_IMAGE_Y_OFFSET,
              0,
            ]}
            scale={[S2_TOP_IMAGE_SCALE_X, S2_TOP_IMAGE_SCALE_Y, 1]}
            renderOrder={2}
          >
            <planeGeometry args={[t.connectorW, t.topConnectorH]} />
            <meshBasicMaterial
              map={texture}
              transparent
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          {/* ─── BOTTOM BLOCK BACKGROUND (Section 4) ─────────────────────── */}
          {/* Yellow solid background */}
          <mesh
            position={[
              t.connectorX + t.connectorW / 2 + S2_BOTTOM_SOLID_X_OFFSET,
              t.bottomConnectorY -
                t.bottomConnectorH / 2 +
                S2_BOTTOM_SOLID_Y_OFFSET,
              -0.001,
            ]}
            scale={[S2_BOTTOM_SOLID_SCALE_X, S2_BOTTOM_SOLID_SCALE_Y, 1]}
            renderOrder={1}
          >
            <planeGeometry args={[t.connectorW, t.bottomConnectorH]} />
            <meshBasicMaterial
              color={S2_FRAME_BG_COLOR}
              toneMapped={false}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>

          {/* Stretched main-frame image as background */}
          <mesh
            position={[
              t.connectorX + t.connectorW / 2 + S2_BOTTOM_IMAGE_X_OFFSET,
              t.bottomConnectorY -
                t.bottomConnectorH / 2 +
                S2_BOTTOM_IMAGE_Y_OFFSET,
              0,
            ]}
            scale={[S2_BOTTOM_IMAGE_SCALE_X, S2_BOTTOM_IMAGE_SCALE_Y, 1]}
            renderOrder={2}
          >
            <planeGeometry args={[t.connectorW, t.bottomConnectorH]} />
            <meshBasicMaterial
              map={texture}
              transparent
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}

      {/* ─── DYNAMIC BACKGROUND (from config) ────────────────────────────── */}
      {layout.s2BackgroundTexture && (
        <DynamicBackground
          url={layout.s2BackgroundTexture}
          layout={layout}
          startX={startX}
        />
      )}

      {/* ─── AYAT AL KURSI PAPER COLORED BACKGROUNDS ───────────── */}
      {config.styling.colors.sectionBackgrounds && (
        <group position={[startX, 0, -0.0005]}>
          {groups.map((gt, i) => {
            const bgColors = config.styling.colors.sectionBackgrounds;
            const color = bgColors![i] || bgColors![0]; // fallback

            const isFirst = i === 0;
            const isLast = i === groups.length - 1;
            const gtBottom = gt.frameY - gt.frameH;

            const padYOuter = 0.02; // Reduced from 0.05 to prevent sticking out vertically

            const yTop = isFirst
              ? gt.frameY + padYOuter
              : (groups[i - 1].frameY - groups[i - 1].frameH + gt.frameY) / 2;

            const yBot = isLast
              ? gtBottom - padYOuter
              : (gtBottom + groups[i + 1].frameY) / 2;

            const padX = 0.035; // reduced from 0.08 to make it wider on both sides
            const w = layout.sectionW - padX * 2;
            const h = yTop - yBot;

            return (
              <UiRect
                key={`sec-bg-${i}`}
                x={padX}
                y={yTop}
                w={w}
                h={h}
                radius={0.06}
                color={color}
                depthTest={false}
              />
            );
          })}
        </group>
      )}

      {/* ─── INTRO VERSE (verse 6 for Alak) ─────────────────────────────── */}
      {hasIntroVerse && (
        <VerseBox
          x={transforms.introVerse!.x}
          y={transforms.introVerse!.y}
          z={transforms.introVerse!.z}
          w={transforms.introVerse!.w}
          h={transforms.introVerse!.h}
          verse={data.introVerse.text}
          number={data.introVerse.number}
          bg={introBg}
          border={introBorder}
          circleBorderCol={introOverride?.circleBorderCol ?? introBorder}
          circleBg={introOverride?.circleBg ?? introBg}
          circleTextCol={introOverride?.circleTextCol ?? introBorder}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
          textColor={introOverride?.textColor}
        />
      )}

      {/* ─── VERSE GROUPS — mapped from pre-computed group transforms ─────── */}
      {data.colorGroups.map((group, index) => (
        <VerseGroup
          key={index}
          group={group}
          groupTransform={t.groups[index]}
          groupIndex={index}
          layout={layout}
        />
      ))}

      {/* ─── OUTRO VERSE (verse 19 for Alak) ────────────────────────────── */}
      {hasOutroVerse && (
        <VerseBox
          x={transforms.outroVerse!.x}
          y={transforms.outroVerse!.y}
          z={transforms.outroVerse!.z}
          w={transforms.outroVerse!.w}
          h={transforms.outroVerse!.h}
          verse={data.outroVerse.text}
          number={data.outroVerse.number}
          bg={outroBg}
          border={outroBorder}
          circleBorderCol={outroOverride?.circleBorderCol ?? outroBorder}
          circleBg={outroOverride?.circleBg ?? outroBg}
          circleTextCol={outroOverride?.circleTextCol ?? outroBorder}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
          textColor={outroOverride?.textColor}
        />
      )}

      {/* ─── SIDE CURVES ─────────────────────────────────────────────────── */}
      <SideCurves
        layout={layout}
        startX={startX}
        borderWidth={edgeVerseBorderWidth}
        groups={groups}
        hasIntroOutro={layout.hasIntroOutro}
      />

      {/* ─── SVG OVERLAYS (config-driven, per-surah) ─────────────────────── */}
      <SvgOverlays startX={startX} layout={layout} groups={groups} />


      {/* ─── SECTION LABELS ──────────────────────────────────────────────── */}
      {/*
        IMPORTANT NOTE ON SYMMETRY:
        The Top and Bottom labels of Section 2 are perfectly symmetrical (mirrored).
        Therefore, any vertical offset applied to the top label to push it outward (UP, +)
        must be inverted (DOWN, -) for the bottom label.
      */}
      {hasTopLabel && (
        <TopLabel
          x={PW / 2}
          y={t.topLabelPinY + S2_LABEL_Y_OFFSET}
          z={0.004}
          text={data.topLabel}
          labelWidth={S2_LABEL_WIDTH}
          partialBorder={true}
          bgColor={S2_TOP_LABEL_BG}
          borderColor={S2_TOP_LABEL_BORDER}
          renderOrder={100}
        />
      )}
      {hasBottomLabel && (
        <TopLabel
          x={PW / 2}
          y={t.bottomLabelPinY - S2_LABEL_Y_OFFSET}
          z={0.004}
          text={data.bottomLabel}
          labelWidth={S2_LABEL_WIDTH}
          partialBorder={true}
          bottomBorder={true}
          bgColor={S2_TOP_LABEL_BG}
          borderColor={S2_TOP_LABEL_BORDER}
          renderOrder={100}
        />
      )}
    </group>
  );
}

// ─── HELPER COMPONENT FOR DYNAMIC BACKGROUND ───────────────────────────────
function DynamicBackground({
  url,
  layout,
  startX,
}: {
  url: string;
  layout: LayoutConfig;
  startX: number;
}) {
  const tex = useTexture(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <mesh
      position={[
        startX + layout.sectionW / 2,
        layout.s2Top - layout.s2H / 2,
        -0.001,
      ]}
      scale={[
        (layout as any).s2BackgroundScaleX ?? 1,
        (layout as any).s2BackgroundScaleY ?? 1,
        1,
      ]}
      renderOrder={1}
    >
      <planeGeometry args={[layout.sectionW, layout.s2H]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ─── GENERIC SVG OVERLAY COMPONENT ──────────────────────────────────────────
// Reads config.svgOverlays and renders each item anchored to its group.
// Supports any surah — just define svgOverlays[] in the SurahLayoutConfig.

function SingleSvgOverlay({
  src,
  posX,
  posY,
  scaleX,
  scaleY,
  rotationZ,
  renderOrder,
}: {
  src: string;
  posX: number;
  posY: number;
  scaleX: number;
  scaleY: number;
  rotationZ: number;
  renderOrder: number;
}) {
  const tex = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  return (
    <mesh
      position={[posX, posY, -0.0001]}
      scale={[scaleX, scaleY, 1]}
      rotation={[0, 0, rotationZ]}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function SvgOverlays({
  startX,
  layout,
  groups,
}: {
  startX: number;
  layout: LayoutConfig;
  groups: GroupTransforms[];
}) {
  const config = useStoryStore((state) => state.activeConfig);
  const overlays = config.svgOverlays;

  if (!overlays || overlays.length === 0) return null;

  const centerX = startX + layout.sectionW / 2;

  return (
    <group>
      {overlays.map((item, i) => {
        // Resolve Y anchor
        let anchorY = layout.s2Top - layout.s2H / 2; // fallback: section center
        const g = groups[item.anchorGroupIndex ?? -1];
        if (g) {
          const edge = item.anchorEdge ?? "center";
          if (edge === "top") anchorY = g.frameY;
          else if (edge === "bottom") anchorY = g.frameY - g.frameH;
          else anchorY = g.frameY - g.frameH / 2; // center
        }

        return (
          <SingleSvgOverlay
            key={i}
            src={item.src}
            posX={centerX + (item.offsetX ?? 0)}
            posY={anchorY + (item.offsetY ?? 0)}
            scaleX={item.scaleX ?? 1}
            scaleY={item.scaleY ?? 1}
            rotationZ={item.rotationZ ?? 0}
            renderOrder={item.renderOrder ?? 3}
          />
        );
      })}
    </group>
  );
}
