"use client";
import { Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const QURAN_FONT = "/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf";
export const BG_COLOR = "#fefbf2";
export const S1_OUTER_BG = "#fbe09e";
export const S1_OUTER_BORDER = "#ddb364";
export const S1_INNER_BG = "#fbf1d5";
export const S1_INNER_BORDER = "#e2caae";
export const S1_ANA_BG = "#efbe6c";
export const S1_ANA_BORDER = "#b48238";

export const S2_OUTER_BG = "#F0E5C0";
export const S2_OUTER_BORDER = "#E3B678";

export const MAROON_THEME = "#8f4265";
export const MAROON_VERSE_BG = "#ebd2dc";
export const GREEN_THEME = "#92a265";
export const GREEN_VERSE_BG = "#eaf2db";
export const BLUE_THEME = "#638f9c";

export const WHITE_VERSE_BG = "#ffffff";
export const TEXT_DARK = "#1a1a1a";
export const CIRCLE_BORDER = "#8e8e8e";

export const TEXT_SIZES = {
  BISMILLAH: 0.065,
  TOP_LABEL: 0.018,
  ANA_AYET_TAB: 0.016,
  VERSE_NUMBER: 0.024,
  VERSE_TEXT_SMALL: 0.036,
  VERSE_TEXT_BIG: 0.053,
};

interface RoundedShapeProps {
  w: number;
  h: number;
  radius: number;
}

export function RoundedShapeComponent({ w, h, radius }: RoundedShapeProps) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = Math.min(radius, w / 2, h / 2);
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
  }, [w, h, radius]);
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
}: UiRectProps) => (
  <group position={[x, y, z]}>
    {shadow && (
      <mesh position={[0.008, -0.008, -0.001]}>
        <RoundedShapeComponent w={w} h={h} radius={radius} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.12}
          depthTest={depthTest}
        />
      </mesh>
    )}
    <mesh>
      <RoundedShapeComponent w={w} h={h} radius={radius} />
      <meshBasicMaterial color={color} depthTest={depthTest} />
    </mesh>
  </group>
);

interface TopLabelProps {
  x: number;
  y: number;
  z?: number;
  text: string;
}

export function TopLabel({ x, y, z = 0, text }: TopLabelProps) {
  const w = 0.38;
  const h = 0.038;
  return (
    <group position={[x - w / 2, y + h / 2, z]}>
      <UiRect
        x={-0.002}
        y={0.002}
        z={0}
        w={w + 0.004}
        h={h + 0.004}
        radius={0.012}
        color="#cdc6bf"
        shadow
      />
      <UiRect x={0} y={0} z={0.001} w={w} h={h} radius={0.01} color="#ffffff" />
      <Text
        position={[w / 2, -h / 2, 0.002]}
        fontSize={TEXT_SIZES.TOP_LABEL}
        color="#4a423a"
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
        fontWeight="bold"
        material-depthTest={false}
        font={QURAN_FONT}
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
}

export function AnaAyetTab({ x, y, z }: AnaAyetTabProps) {
  return (
    <group position={[x, y, z]}>
      <UiRect
        x={0}
        y={0}
        z={0}
        w={0.09}
        h={0.045}
        radius={0.008}
        color="#96601b"
        shadow
      />
      <UiRect
        x={0.003}
        y={-0.003}
        z={0.001}
        w={0.084}
        h={0.039}
        radius={0.006}
        color="#e5ba71"
      />
      <Text
        position={[0.045, -0.0225, 0.002]}
        fontSize={TEXT_SIZES.ANA_AYET_TAB}
        color="#432c10"
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
}: VerseBoxProps) => {
  const bw = 0.003;
  const rad = isPill ? h / 2 : 0.015;
  const cr = isPill ? h / 2 : 0.026;
  const cx = isPill ? cr : 0.07;

  const textX = w / 2;

  const safeMargin = cx + cr + 0.01;
  const textMaxW = w - safeMargin * 2;

  return (
    <group position={[x, y, z]}>
      <UiRect
        x={-bw}
        y={bw}
        z={0}
        w={w + bw * 2}
        h={h + bw * 2}
        radius={rad + bw}
        color={border}
        shadow
      />
      <UiRect x={0} y={0} z={0.001} w={w} h={h} radius={rad} color={bg} />

      <group position={[cx, -h / 2, 0.002]}>
        <mesh>
          <circleGeometry args={[cr - 0.002, 48]} />
          <meshBasicMaterial color={circleBg || "#ffffff"} depthTest={false} />
        </mesh>
        <mesh position={[0, 0, -0.001]}>
          <circleGeometry args={[cr, 48]} />
          <meshBasicMaterial
            color={circleBorderCol || CIRCLE_BORDER}
            depthTest={false}
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={TEXT_SIZES.VERSE_NUMBER}
          color={circleTextCol || TEXT_DARK}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material-depthTest={false}
        >
          {String(number)}
        </Text>
      </group>

      <Text
        position={[textX, -h / 2, 0.002]}
        fontSize={
          isPill ? TEXT_SIZES.VERSE_TEXT_SMALL : TEXT_SIZES.VERSE_TEXT_BIG
        }
        color={TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        maxWidth={textMaxW}
        textAlign="center"
        material-depthTest={false}
        font={QURAN_FONT}
        direction="rtl"
      >
        {verse}
      </Text>
    </group>
  );
};
