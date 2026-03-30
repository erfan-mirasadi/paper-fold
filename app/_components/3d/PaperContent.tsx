"use client";

import {
  OrthographicCamera,
  Text,
  useTexture,
  QuadraticBezierLine,
} from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PW = PAGE_WIDTH;
const PADDING = 0.05; // Less padding to occupy more paper space
const CONTENT_W = PW - PADDING * 2;

// ==========================================
// FOLD Y POSITIONS

// Eagerly-evaluated export consumed by SinglePaper
export const FOLD_Y_POSITIONS: readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
] = (() => {
  const s1Top = -0.16;
  const s1Pad = 0.025;
  const gap = 0.02;
  const smallBoxH = 0.07;
  const anaAyetH = 0.095;
  const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + gap + anaAyetH;

  const s2Top = s1Top - s1H - 0.035;
  const s2Pad = 0.035;
  const bigBoxH = 0.095;
  const groupGap = 0.025;
  const groupPad = 0.02;
  const s2Gap = 0.02;
  const smallBoxH2 = 0.075;
  const groupH = groupPad * 2 + (smallBoxH2 * 2 + s2Gap);

  const v6Y = s2Top - s2Pad;
  const g1Y = v6Y - bigBoxH - groupGap;
  const g2Y = g1Y - groupH - groupGap;
  const g3Y = g2Y - groupH - groupGap;

  return [
    v6Y - bigBoxH - groupGap / 2, // Fold 1: Below 6
    g1Y - groupPad - smallBoxH2 - s2Gap / 2, // Fold 2: Below 8,7 (Middle of G1)
    g1Y - groupH - groupGap / 2, // Fold 3: Below 9,10 (Below G1)
    g2Y - groupPad - smallBoxH2 - s2Gap / 2, // Fold 4: Between 11,12 and 13,14 (Middle of G2)
    g2Y - groupH - groupGap / 2, // Fold 5: Above 15,16 (Below G2)
    g3Y - groupPad - smallBoxH2 - s2Gap / 2, // Fold 6: Between 16,15 and 18,17 (Middle of G3)
    g3Y - groupH - groupGap / 2, // Fold 7: Above 19 (Below G3)
  ] as const;
})();

//Colors
const BG_COLOR = "#fefbf2";

// Section 1 (Rich Golden/Yellows)
const S1_OUTER_BG = "#fbe09e";
const S1_OUTER_BORDER = "#ddb364";
const S1_INNER_BG = "#fbf1d5";
const S1_INNER_BORDER = "#e2caae";
const S1_ANA_BG = "#efbe6c";
const S1_ANA_BORDER = "#b48238";

// Section 2 (Soft Creams, Rich Maroons, Deep Greens)
const S2_OUTER_BG = "#fdfaf6";
const S2_OUTER_BORDER = "#eadecf";

const MAROON_THEME = "#8f4265";
const MAROON_VERSE_BG = "#ebd2dc";

const GREEN_THEME = "#92a265";
const GREEN_VERSE_BG = "#eaf2db";

const WHITE_VERSE_BG = "#ffffff";
const TEXT_DARK = "#1a1a1a"; // Completely dark text
const CIRCLE_BORDER = "#8e8e8e";

const SURAH_DATA = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Beş ayetlik Ana Böl.",
    gridVerses: [
      { number: 2, text: "خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ" },
      { number: 1, text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" },
      { number: 4, text: "الَّذِي عَلَّمَ بِالْقَلَمِ" },
      { number: 3, text: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ" },
    ],
    anaAyet: { number: 5, text: "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" },
  },
  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: { number: 6, text: "كَلَّا إِنَّ الْإِنسَانَ لَيَطْغَىٰ" },
    colorGroups: [
      {
        bgColor: MAROON_THEME,
        verseBg: MAROON_VERSE_BG,
        verses: [
          { number: 8, text: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ" },
          { number: 7, text: "أَن رَّآهُ اسْتَغْنَىٰ" },
          { number: 10, text: "عَبْدًا إِذَا صَلَّىٰ" },
          { number: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَىٰ" },
        ],
      },
      {
        bgColor: GREEN_THEME,
        verseBg: GREEN_VERSE_BG,
        verses: [
          { number: 12, text: "أَوْ أَمَرَ بِالتَّقْوَىٰ" },
          { number: 11, text: "أَرَأَيْتَ إِن كَانَ عَلَى الْهُدَىٰ" },
          { number: 14, text: "أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَىٰ" },
          { number: 13, text: "أَرَأَيْتَ إِن كَذَّبَ وَتَوَلَّىٰ" },
        ],
      },
      {
        bgColor: MAROON_THEME,
        verseBg: MAROON_VERSE_BG,
        verses: [
          { number: 16, text: "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ" },
          {
            number: 15,
            text: "كَلَّا لَئِن لَّمْ يَنتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
          },
          { number: 18, text: "سَنَدْعُ الزَّبَانِيَةَ" },
          { number: 17, text: "فَلْيَدْعُ نَادِيَهُ" },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِب",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  },
};

const RoundedShapeComponent = ({
  w,
  h,
  radius,
}: {
  w: number;
  h: number;
  radius: number;
}) => {
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
};

const UiRect = ({
  x,
  y,
  z = 0,
  w,
  h,
  radius = 0,
  color,
  shadow = false,
  depthTest = false,
}: any) => {
  return (
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
};

const TopLabel = ({ x, y, z = 0, text }: any) => {
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
        fontSize={0.016}
        color="#4a423a"
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
        fontWeight="bold"
        depthTest={false}
      >
        {text}
      </Text>
    </group>
  );
};

const AnaAyetTab = ({ x, y, z }: any) => {
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
        fontSize={0.014}
        color="#432c10"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        depthTest={false}
      >
        Ana Ayet
      </Text>
    </group>
  );
};

const VerseBox = ({
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
  isPill = true,
}: any) => {
  const bw = 0.003;
  const rad = isPill ? h / 2 : 0.015;

  const cr = isPill ? h / 2 : 0.026;
  const cx = isPill ? cr : 0.07;

  // Perfectly text centering math inside the remaining space
  const textSpaceStart = cx + cr;
  const textX = textSpaceStart + (w - textSpaceStart) / 2;
  const textMaxW = w - textSpaceStart - 0.04;

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

      {/* Number Circle straddling/left resting perfectly */}
      <group position={[cx, -h / 2, 0.002]}>
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[cr - 0.002, 48]} />
          <meshBasicMaterial color="#ffffff" depthTest={false} />
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
          fontSize={0.024}
          color={TEXT_DARK}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          depthTest={false}
        >
          {String(number)}
        </Text>
      </group>

      <Text
        position={[textX, -h / 2, 0.002]}
        fontSize={isPill ? 0.034 : 0.046} // Thicker, larger text matching target
        color={TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        maxWidth={textMaxW}
        textAlign="center"
        depthTest={false}
      >
        {verse}
      </Text>
    </group>
  );
};

// ==========================================
// 3. MAIN COMPONENT

interface PaperContentProps {
  imageUrl?: string;
}

export const PaperContent: React.FC<PaperContentProps> = ({ imageUrl }) => {
  const texture = imageUrl ? useTexture(imageUrl) : null;

  if (texture) {
    return (
      <mesh position={[PW / 2, -PAGE_HEIGHT / 2, 0]}>
        <planeGeometry args={[PW, PAGE_HEIGHT]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    );
  }

  const startX = PADDING;
  const sectionW = CONTENT_W;

  const { bismillah, section1, section2 } = SURAH_DATA;
  const radiusList = [0.4, 0.55, 0.7, 0.85, 1.0, 1.15];

  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <OrthographicCamera
        makeDefault
        left={0}
        right={PAGE_WIDTH}
        top={0}
        bottom={-PAGE_HEIGHT}
        position={[0, 0, 5]}
      />

      {/* Background Rings */}
      <group position={[PW / 2, -1.0, -0.05]}>
        {radiusList.map((rad, i) => (
          <mesh key={i}>
            <ringGeometry args={[rad, rad + 0.0015, 64]} />
            <meshBasicMaterial
              color="#e8e1cc"
              transparent
              opacity={0.5}
              depthTest={false}
            />
          </mesh>
        ))}
      </group>

      {/* BISMILLAH */}
      <Text
        position={[PW / 2, -0.07, 0.001]}
        fontSize={0.052}
        color={TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        depthTest={false}
      >
        {bismillah}
      </Text>

      {/* ===== SECTION 1 ===== */}
      {(() => {
        const s1Top = -0.16;
        const s1Pad = 0.025;
        const gap = 0.02; // Wider inner gap
        const smallBoxH = 0.07; // Richer pills
        const anaAyetH = 0.095;

        const innerW = sectionW - s1Pad * 2;
        const innerHalfW = (innerW - gap) / 2;
        const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + gap + anaAyetH;

        return (
          <group>
            <UiRect
              x={startX}
              y={s1Top}
              z={0}
              w={sectionW}
              h={s1H}
              radius={0.02}
              color={S1_OUTER_BORDER}
              shadow
            />
            <UiRect
              x={startX + 0.003}
              y={s1Top - 0.003}
              z={0.001}
              w={sectionW - 0.006}
              h={s1H - 0.006}
              radius={0.017}
              color={S1_OUTER_BG}
            />

            <TopLabel x={PW / 2} y={s1Top} z={0.004} text={section1.label} />

            {section1.gridVerses.map((v, i) => {
              const isRightCol = i % 2 !== 0;
              const isBottomRow = i >= 2;
              const xPos = startX + s1Pad + (isRightCol ? innerHalfW + gap : 0);
              const yPos = s1Top - s1Pad - (isBottomRow ? smallBoxH + gap : 0);
              return (
                <VerseBox
                  key={v.number}
                  x={xPos}
                  y={yPos}
                  z={0.002}
                  w={innerHalfW}
                  h={smallBoxH}
                  verse={v.text}
                  number={v.number}
                  bg={S1_INNER_BG}
                  border={S1_INNER_BORDER}
                  circleBorderCol={S1_OUTER_BORDER}
                  isPill={true}
                />
              );
            })}

            {/* Ana Ayet Base */}
            {(() => {
              const anaY = s1Top - s1Pad - (smallBoxH * 2 + gap) - gap;
              const anaX = startX + s1Pad;
              return (
                <group>
                  <VerseBox
                    x={anaX}
                    y={anaY}
                    z={0.002}
                    w={innerW}
                    h={anaAyetH}
                    verse={section1.anaAyet.text}
                    number={section1.anaAyet.number}
                    bg={S1_ANA_BG}
                    border={S1_ANA_BORDER}
                    circleBorderCol={S1_ANA_BORDER}
                    isPill={false}
                  />
                  <AnaAyetTab
                    x={startX - 0.04}
                    y={anaY - anaAyetH / 2 + 0.0225}
                    z={0.005}
                  />
                </group>
              );
            })()}
          </group>
        );
      })()}

      {/* ===== SECTION 2 ===== */}
      {(() => {
        const s1Top = -0.16;
        const s1Pad = 0.025;
        const gap = 0.02;
        const smallBoxH = 0.07;
        const anaAyetH = 0.095;
        const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + gap + anaAyetH;

        // Hugely stretched layout as requested!
        const s2Top = s1Top - s1H - 0.035;
        const s2Pad = 0.035;
        const bigBoxH = 0.095;
        const groupGap = 0.025;
        const groupPad = 0.02;
        const s2Gap = 0.02;

        const innerW = sectionW - s2Pad * 2;
        const groupInnerW = innerW - groupPad * 2;
        const groupInnerHalfW = (groupInnerW - s2Gap) / 2;
        const smallBoxH2 = 0.075;
        const groupH = groupPad * 2 + (smallBoxH2 * 2 + s2Gap);

        const s2H = s2Pad * 2 + bigBoxH * 2 + groupGap * 4 + groupH * 3;

        let curY = s2Top - s2Pad;
        const v6Y = curY;
        const g1Y = v6Y - bigBoxH - groupGap;
        const g2Y = g1Y - groupH - groupGap;
        const g3Y = g2Y - groupH - groupGap;
        const v19Y = g3Y - groupH - groupGap;

        const renderGroupVerses = (
          verses: any[],
          gY: number,
          bgColor: string,
          borderCol: string,
        ) => {
          return verses.map((v, i) => {
            const isRightCol = i % 2 !== 0;
            const isBottomRow = i >= 2;
            const xPos =
              startX +
              s2Pad +
              groupPad +
              (isRightCol ? groupInnerHalfW + s2Gap : 0);
            const yPos = gY - groupPad - (isBottomRow ? smallBoxH2 + s2Gap : 0);
            return (
              <VerseBox
                key={v.number}
                x={xPos}
                y={yPos}
                z={0.003}
                w={groupInnerHalfW}
                h={smallBoxH2}
                verse={v.text}
                number={v.number}
                bg={bgColor}
                border={WHITE_VERSE_BG}
                circleBorderCol={borderCol}
                isPill={true}
              />
            );
          });
        };

        return (
          <group>
            {/* Outer S2 */}
            <UiRect
              x={startX}
              y={s2Top}
              z={0}
              w={sectionW}
              h={s2H}
              radius={0.02}
              color={S2_OUTER_BORDER}
              shadow
            />
            <UiRect
              x={startX + 0.003}
              y={s2Top - 0.003}
              z={0.001}
              w={sectionW - 0.006}
              h={s2H - 0.006}
              radius={0.017}
              color={S2_OUTER_BG}
            />

            <TopLabel x={PW / 2} y={s2Top} z={0.004} text={section2.topLabel} />
            <TopLabel
              x={PW / 2}
              y={s2Top - s2H}
              z={0.004}
              text={section2.bottomLabel}
            />

            {/* SIDE ARCS looping widely from edges */}
            {(() => {
              const startX_L = startX + s2Pad - 0.005;
              const startX_R = startX + sectionW - s2Pad + 0.005;
              const g2CenterY = g2Y - groupH / 2;

              return (
                <group position={[0, 0, 0.02]}>
                  {/* Left Side Connectors */}
                  <QuadraticBezierLine
                    start={[startX_L, g1Y, 0]}
                    end={[startX_L, g3Y - groupH, 0]}
                    mid={[startX_L - 0.15, g2CenterY, 0]}
                    color="#a0d1cc"
                    lineWidth={4}
                    depthTest={false}
                  />
                  <QuadraticBezierLine
                    start={[startX_L, g2Y, 0]}
                    end={[startX_L, g2Y - groupH, 0]}
                    mid={[startX_L - 0.1, g2CenterY, 0]}
                    color="#badfae"
                    lineWidth={4}
                    depthTest={false}
                  />
                  <QuadraticBezierLine
                    start={[startX_L, g1Y - groupH, 0]}
                    end={[startX_L, g3Y, 0]}
                    mid={[startX_L - 0.05, g2CenterY, 0]}
                    color="#dfb8c2"
                    lineWidth={4}
                    depthTest={false}
                  />

                  {/* Right Side Connectors */}
                  <QuadraticBezierLine
                    start={[startX_R, g1Y, 0]}
                    end={[startX_R, g3Y - groupH, 0]}
                    mid={[startX_R + 0.15, g2CenterY, 0]}
                    color="#a0d1cc"
                    lineWidth={4}
                    depthTest={false}
                  />
                  <QuadraticBezierLine
                    start={[startX_R, g2Y, 0]}
                    end={[startX_R, g2Y - groupH, 0]}
                    mid={[startX_R + 0.1, g2CenterY, 0]}
                    color="#badfae"
                    lineWidth={4}
                    depthTest={false}
                  />
                  <QuadraticBezierLine
                    start={[startX_R, g1Y - groupH, 0]}
                    end={[startX_R, g3Y, 0]}
                    mid={[startX_R + 0.05, g2CenterY, 0]}
                    color="#dfb8c2"
                    lineWidth={4}
                    depthTest={false}
                  />
                </group>
              );
            })()}

            {/* V6 */}
            <VerseBox
              x={startX + s2Pad}
              y={v6Y}
              z={0.002}
              w={innerW}
              h={bigBoxH}
              verse={section2.introVerse.text}
              number={section2.introVerse.number}
              bg={WHITE_VERSE_BG}
              border={MAROON_THEME}
              circleBorderCol={MAROON_THEME}
              isPill={false}
            />

            {/* Group 1 (Maroon) */}
            <UiRect
              x={startX + s2Pad}
              y={g1Y}
              z={0.002}
              w={innerW}
              h={groupH}
              radius={0.015}
              color={MAROON_THEME}
              shadow
            />
            {renderGroupVerses(
              section2.colorGroups[0].verses,
              g1Y,
              MAROON_VERSE_BG,
              MAROON_THEME,
            )}

            {/* Group 2 (Green) */}
            <UiRect
              x={startX + s2Pad}
              y={g2Y}
              z={0.002}
              w={innerW}
              h={groupH}
              radius={0.015}
              color={GREEN_THEME}
              shadow
            />
            {renderGroupVerses(
              section2.colorGroups[1].verses,
              g2Y,
              GREEN_VERSE_BG,
              GREEN_THEME,
            )}

            {/* Group 3 (Maroon) */}
            <UiRect
              x={startX + s2Pad}
              y={g3Y}
              z={0.002}
              w={innerW}
              h={groupH}
              radius={0.015}
              color={MAROON_THEME}
              shadow
            />
            {renderGroupVerses(
              section2.colorGroups[2].verses,
              g3Y,
              MAROON_VERSE_BG,
              MAROON_THEME,
            )}

            {/* V19 */}
            <VerseBox
              x={startX + s2Pad}
              y={v19Y}
              z={0.002}
              w={innerW}
              h={bigBoxH}
              verse={section2.outroVerse.text}
              number={section2.outroVerse.number}
              bg={WHITE_VERSE_BG}
              border={MAROON_THEME}
              circleBorderCol={GREEN_THEME}
              isPill={false}
            />
          </group>
        );
      })()}
    </>
  );
};
