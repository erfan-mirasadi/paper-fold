"use client";

import { OrthographicCamera, Text, useTexture } from "@react-three/drei";
import { TEXT_DARK, TEXT_SIZES } from "./SharedUI";
// import { QuranicBorder } from "./QuranicBorder";
import { SectionOne, SectionTwo } from "./SurahSections";
import { Boarder } from "./Boarder";

export const PAGE_WIDTH = 1.54;
export const PAGE_HEIGHT = 1.76;
export const PW = PAGE_WIDTH;
export const PADDING = 0.28;

// Simplify layout logic:
// Content width is the page width minus padding on both left and right
export const CONTENT_W = PW - PADDING * 2;
export const START_X = PADDING;

// Layout Math Engine (Unchanged)
const s2TopExtra = 0.025;
const s1Top = -0.17;
const s1Pad = 0.045;
const gap = 0.02;
const smallBoxH = 0.07;
const anaAyetH = 0.095;
const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + gap + anaAyetH;

const gapBetweenS1andS2 = 0.035;
const s2Top = s1Top - s1H - gapBetweenS1andS2;
const s2PadTop = 0.035 + s2TopExtra;
const s2PadBottom = 0.06;
const bigBoxH = 0.095;
const groupGap = 0.025;
const groupPad = 0.02;
const s2Gap = 0.02;
const smallBoxH2 = 0.075;
const groupH = groupPad * 2 + (smallBoxH2 * 2 + s2Gap);
const middleExtraGap = 0.04;
const s2H =
  s2PadTop +
  s2PadBottom +
  bigBoxH * 2 +
  groupGap * 4 +
  groupH * 3 +
  middleExtraGap * 2;

const v6Y = s2Top - s2PadTop;

// برای اینکه جابجایی یه بخش، بقیه بخش‌ها رو خراب نکنه، اول موقعیت‌های پایه (زنجیره‌ای) رو حساب میکنیم
const baseG1Y = v6Y - bigBoxH - groupGap;
const baseG2Y = baseG1Y - groupH - (groupGap + middleExtraGap);
const baseG3Y = baseG2Y - groupH - (groupGap + middleExtraGap);
const baseV19Y = baseG3Y - groupH - groupGap;

// حالا هر تغییری میخوای بدی رو اینجا مستقل بده.
// الان g2Y فقط روی همون ۴ آیه وسط تاثیر میذاره و بقیه جابجا نمیشن
const g1Y = baseG1Y + 0.01;
const g2Y = baseG2Y + 0.01;
const g3Y = baseG3Y + 0.01;
const v19Y = baseV19Y;

export const layoutMath = {
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
  s2Pad: s2PadTop,
  s2PadTop,
  s2PadBottom,
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
  baseG1Y,
  baseG3Y,
  groupInnerW: CONTENT_W - 0.035 * 2 - groupPad * 2,
  groupInnerHalfW: (CONTENT_W - 0.035 * 2 - groupPad * 2 - s2Gap) / 2,
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
  g1Y - groupH - (groupGap + middleExtraGap) / 2,
  g2Y - groupPad - smallBoxH2 - s2Gap / 2,
  g2Y - groupH - (groupGap + middleExtraGap) / 2,
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
            text: "كَلَّا لئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
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
  isBumpMap?: boolean; // Added support for Bump Map at the top level
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

export function PaperContent({
  imageUrl,
  isBumpMap = false,
}: PaperContentProps) {
  if (imageUrl) {
    return <ImageContent url={imageUrl} />;
  }

  // If rendering for Bump Map, the canvas base must be pitch black
  const BG_COLOR = isBumpMap ? "#000000" : "#EBEBDF";

  return (
    <>
      <mesh position={[PW / 2, -PAGE_HEIGHT / 2, -0.05]}>
        <planeGeometry args={[PW * 1.5, PAGE_HEIGHT * 1.5]} />
        <meshBasicMaterial color={BG_COLOR} />
      </mesh>
      <color attach="background" args={[BG_COLOR]} />{" "}
      {/* Make outside background richer */}
      <OrthographicCamera
        makeDefault
        left={0}
        right={PAGE_WIDTH}
        top={0}
        bottom={-PAGE_HEIGHT}
        position={[0, 0, 5]}
      />
      <Boarder PW={PW} PAGE_HEIGHT={PAGE_HEIGHT} isBumpMap={isBumpMap} />
      <Text
        position={[PW / 2, -0.085, 0.02]}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={isBumpMap ? "#ffffff" : TEXT_DARK} // Text pushes out in bump map
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
        startX={START_X}
        PW={PW}
        isBumpMap={isBumpMap}
      />
      <SectionTwo
        data={SURAH_DATA.section2}
        layout={layoutMath}
        startX={START_X}
        PW={PW}
        isBumpMap={isBumpMap}
      />
    </>
  );
}
