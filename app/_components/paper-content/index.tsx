"use client";

import { OrthographicCamera, Text, useTexture } from "@react-three/drei";
import { BG_COLOR, TEXT_DARK, TEXT_SIZES } from "./SharedUI";
import { QuranicBorder } from "./QuranicBorder";
import { SectionOne, SectionTwo } from "./SurahSections";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PW = PAGE_WIDTH;
const PADDING = 0.05;
const CONTENT_W = PW - PADDING * 2;

// Layout Math Engine
const s1Top = -0.21;
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
const s2H = s2Pad * 2 + bigBoxH * 2 + groupGap * 4 + groupH * 3;

const v6Y = s2Top - s2Pad;
const g1Y = v6Y - bigBoxH - groupGap;
const g2Y = g1Y - groupH - groupGap;
const g3Y = g2Y - groupH - groupGap;
const v19Y = g3Y - groupH - groupGap;

const layoutMath = {
  sectionW: CONTENT_W,
  innerW: CONTENT_W - s1Pad * 2,
  innerHalfW: (CONTENT_W - s1Pad * 2 - gap) / 2,
  s1Top,
  s1Pad,
  gap,
  smallBoxH,
  anaAyetH,
  s1H,
  s2Top,
  s2Pad,
  bigBoxH,
  groupGap,
  groupPad,
  s2Gap,
  smallBoxH2,
  groupH,
  s2H,
  v6Y,
  g1Y,
  g2Y,
  g3Y,
  v19Y,
  groupInnerW: CONTENT_W - s2Pad * 2 - groupPad * 2,
  groupInnerHalfW: (CONTENT_W - s2Pad * 2 - groupPad * 2 - s2Gap) / 2,
};

export const FOLD_Y_POSITIONS: readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
] = [
  v6Y - bigBoxH - groupGap / 2,
  g1Y - groupPad - smallBoxH2 - s2Gap / 2,
  g1Y - groupH - groupGap / 2,
  g2Y - groupPad - smallBoxH2 - s2Gap / 2,
  g2Y - groupH - groupGap / 2,
  g3Y - groupPad - smallBoxH2 - s2Gap / 2,
  g3Y - groupH - groupGap / 2,
] as const;

const SURAH_DATA = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Beş ayetlik Ana Böl.",
    gridVerses: [
      { number: 2, text: "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ" },
      { number: 1, text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" },
      { number: 4, text: "الَّذِي عَلَّمَ بِالْقَلَمِ" },
      { number: 3, text: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ" },
    ],
    anaAyet: { number: 5, text: "عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ" },
  },
  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: { number: 6, text: "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ" },
    colorGroups: [
      {
        verses: [
          { number: 8, text: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ" },
          { number: 7, text: "أَنْ رَآهُ اسْتَغْنَىٰ" },
          { number: 10, text: "عَبْدًا إِذَا صَلَّىٰ" },
          { number: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَىٰ" },
        ],
      },
      {
        verses: [
          { number: 12, text: "أَوْ أَمَرَ بِالتَّقْوَىٰ" },
          { number: 11, text: "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ" },
          { number: 14, text: "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ" },
          { number: 13, text: "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ" },
        ],
      },
      {
        verses: [
          { number: 16, text: "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ" },
          {
            number: 15,
            text: "كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
          },
          { number: 18, text: "سَنَدْعُ الزَّبَانِيَةَ" },
          { number: 17, text: "فَلْيَدْعُ نَادِيَهُ" },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  },
};

interface PaperContentProps {
  imageUrl?: string;
}

const ImageContent: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[PW / 2, -PAGE_HEIGHT / 2, 0]}>
      <planeGeometry args={[PW, PAGE_HEIGHT]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export function PaperContent({ imageUrl }: PaperContentProps) {
  if (imageUrl) {
    return <ImageContent url={imageUrl} />;
  }

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

      <QuranicBorder PW={PAGE_WIDTH} PAGE_HEIGHT={PAGE_HEIGHT} />

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

      <Text
        position={[PW / 2, -0.12, 0.001]}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        material-depthTest={false}
        font="/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf"
        direction="rtl"
      >
        {SURAH_DATA.bismillah}
      </Text>

      <SectionOne
        data={SURAH_DATA.section1}
        layout={layoutMath}
        startX={PADDING}
        PW={PW}
      />
      <SectionTwo
        data={SURAH_DATA.section2}
        layout={layoutMath}
        startX={PADDING}
        PW={PW}
      />
    </>
  );
}
