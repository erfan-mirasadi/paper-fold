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
  S2Transforms,
} from "../../../data/SurahConfig";
interface SectionTwoProps {
  data: SectionTwoData;
  transforms: S2Transforms;
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
  const t = transforms;
  const edgeVerseBorderWidth = t.borderWidth;

  const texture = useTexture(S2_FRAME_IMAGE, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <group>
      {/* ─── SECTION OUTER FRAME ─────────────────────────────────────────── */}
      {/* ─── TOP BLOCK BACKGROUND (Section 2) ──────────────────────────── */}
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
      </>

      {/* ─── TOP HOLLOW CONNECTOR (Replaced by Image Background) ───────── */}
      {/* <HollowConnector
        position="top"
        boxX={t.connectorX}
        boxW={t.connectorW}
        yTop={t.topConnectorY}
        yBottom={t.topConnectorY - t.topConnectorH}
        height={t.topConnectorH}
        borderWidth={t.borderWidth}
      /> */}

      {/* ─── BOTTOM BLOCK BACKGROUND (Section 4) ───────────────────────── */}
      <>
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

      {/* ─── BOTTOM HOLLOW CONNECTOR (Replaced by Image Background) ────── */}
      {/* <HollowConnector
        position="bottom"
        boxX={t.connectorX}
        boxW={t.connectorW}
        yTop={t.bottomConnectorY}
        yBottom={t.bottomConnectorY - t.bottomConnectorH}
        height={t.bottomConnectorH}
        borderWidth={t.borderWidth}
      /> */}

      {/* ─── INTRO VERSE (verse 6) ───────────────────────────────────────── */}
      <VerseBox
        x={t.introVerse.x}
        y={t.introVerse.y}
        z={t.introVerse.z}
        w={t.introVerse.w}
        h={t.introVerse.h}
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

      {/* ─── VERSE GROUPS — mapped from pre-computed group transforms ─────── */}
      {data.colorGroups.map((group, index) => (
        <VerseGroup
          key={index}
          group={group}
          groupTransform={t.groups[index]}
          groupIndex={index}
        />
      ))}

      {/* ─── OUTRO VERSE (verse 19) ──────────────────────────────────────── */}
      <VerseBox
        x={t.outroVerse.x}
        y={t.outroVerse.y}
        z={t.outroVerse.z}
        w={t.outroVerse.w}
        h={t.outroVerse.h}
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

      {/* ─── SIDE CURVES (still read raw layout math) ────────────────────── */}
      <SideCurves
        layout={layout}
        startX={startX}
        borderWidth={edgeVerseBorderWidth}
      />

      {/* ─── SECTION LABELS ──────────────────────────────────────────────── */}
      <TopLabel
        x={PW / 2}
        y={t.topLabelPinY}
        z={0.004}
        text={data.topLabel}
        partialBorder={true}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        renderOrder={100}
      />
      <TopLabel
        x={PW / 2}
        y={t.bottomLabelPinY}
        z={0.004}
        text={data.bottomLabel}
        partialBorder={true}
        bottomBorder={true}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        renderOrder={100}
      />
    </group>
  );
}
