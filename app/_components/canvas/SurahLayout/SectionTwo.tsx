"use client";
import { TopLabel, VerseBox } from "./SharedUI";
import { SideCurves } from "./SideCurves";
// import { HollowConnector } from "./HollowConnector";
import { VerseGroup } from "./VerseGroup";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  // S2_OUTER_BORDER,
  // S2_OUTER_BG,
  BLUE_THEME,
  CAPSULE_BG_6_19,
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
  S2_FRAME_BG_COLOR,
  S2_FRAME_IMAGE,
} from "../../../data/theme";
import type {
  SectionTwoData,
  LayoutConfig,
} from "../../../data/SurahConfig";
import { SectionTransforms } from "../../../data/schema";
import { S2_LABEL_WIDTH, S2_LABEL_Y_OFFSET } from "../../../data/SurahConfig";

interface SectionTwoProps {
  data: SectionTwoData;
  transforms: SectionTransforms;
  layout: LayoutConfig;
  startX: number;
  PW: number;
  isFolded?: boolean;
}

export const S2_TOP_SOLID_SCALE_X = 1.02;
export const S2_TOP_SOLID_SCALE_Y = 1;
export const S2_TOP_SOLID_X_OFFSET = 0;
export const S2_TOP_SOLID_Y_OFFSET = 0.003;

export const S2_TOP_IMAGE_SCALE_X = 1.05;
export const S2_TOP_IMAGE_SCALE_Y = 1.15;
export const S2_TOP_IMAGE_X_OFFSET = 0;
export const S2_TOP_IMAGE_Y_OFFSET = 0.025;

export const S2_BOTTOM_SOLID_SCALE_X = 1.02;
export const S2_BOTTOM_SOLID_SCALE_Y = 1;
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
          bg={CAPSULE_BG_6_19}
          border={BLUE_THEME}
          circleBorderCol={BLUE_THEME}
          circleBg={CAPSULE_BG_6_19}
          circleTextCol={BLUE_THEME}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
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
          bg={CAPSULE_BG_6_19}
          border={BLUE_THEME}
          circleBorderCol={BLUE_THEME}
          circleBg={CAPSULE_BG_6_19}
          circleTextCol={BLUE_THEME}
          isPill={false}
          borderWidth={edgeVerseBorderWidth}
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
