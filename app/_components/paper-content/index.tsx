"use client";

import { OrthographicCamera, Text, useTexture } from "@react-three/drei";
import {
  TEXT_DARK,
  TEXT_SIZES,
  PAGE_BG_COLOR,
  BUMP_BASE,
  BUMP_MAX,
} from "./SharedUI";
import { SectionOne, SectionTwo } from "./SurahSections";
import { Boarder } from "./Boarder";

// ============================================================================
// GLOBAL PAGE DIMENSIONS
// Location: app/_components/paper-content/index.tsx
// Purpose: Dictates layout variables, engine math, and orchestrates page rendering.
// ============================================================================

export const PAGE_WIDTH = 1.54;
export const PAGE_HEIGHT = 1.74;
export const PW = PAGE_WIDTH;
export const PADDING = 0.29;

export const CONTENT_W = PW - PADDING * 2;
export const START_X = PADDING;

// ============================================================================
// LAYOUT MATH ENGINE
// Refined definitions to ensure structured and perfectly nested bounds.
// ============================================================================

// --- Section 1 (Top Block) Dimensions ---
const s1Top = -0.17; // Shift everything up from -0.17
const s1Pad = 0.045;
const gap = 0.02;
const smallBoxH = 0.07;
const anaAyetH = 0.095;
const s1H = s1Pad * 2 + (smallBoxH * 2 + gap) + gap + anaAyetH;

// --- Section 2 (Main Lower Blocks) Dimensions ---
const gapBetweenS1andS2 = 0.035;
const s2TopExtra = 0.025;
const s2Top = s1Top - s1H - gapBetweenS1andS2;

const s2PadTop = 0.035 + s2TopExtra;
const s2PadBottom = 0.06;
const bigBoxH = 0.095;
const groupGap = 0.025;
const groupPad = 0.012; // Reduced from 0.02 to shift content up
const groupPadBottom = 0.025; // Increased from 0.02 to keep groupH constant while shifting content up
const s2Gap = 0.02;
const smallBoxH2 = 0.075;
const groupH = groupPad + groupPadBottom + (smallBoxH2 * 2 + s2Gap);
const middleExtraGap = 0.033;

// Full calculation of Section 2 total Height
const s2H =
  s2PadTop +
  s2PadBottom +
  bigBoxH * 2 +
  groupGap * 4 +
  groupH * 3 +
  middleExtraGap * 2;

// --- Specific Element Y-Placement Positions ---
const v6Y = s2Top - s2PadTop;

// Calculate Base Starting constraints for core groups
const baseG1Y = v6Y - bigBoxH - groupGap;
const baseG2Y = baseG1Y - groupH - (groupGap + middleExtraGap);
const baseG3Y = baseG2Y - groupH - (groupGap + middleExtraGap);
const baseV19Y = baseG3Y - groupH - groupGap;

// Removed the + 0.01 offset to ensure perfect symmetry across all groups
const g1Y = baseG1Y;
const g2Y = baseG2Y;
const g3Y = baseG3Y;
const v19Y = baseV19Y;

// ============================================================================
// EXPORTED CONFIGURATIONS
// Provides absolute bounds scaling info downstream mapping components
// ============================================================================
export const layoutMath = {
  // S1 Variables
  sectionW: CONTENT_W,
  innerW: CONTENT_W - s1Pad * 2,
  innerHalfW: (CONTENT_W - s1Pad * 2 - gap) / 2,
  s1Top,
  s1Pad,
  gap,
  smallBoxH,
  anaAyetH,
  s1H,

  // S2 Variables
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

  // Placements Variables
  v6Y,
  g1Y,
  g2Y,
  g3Y,
  v19Y,
  baseG1Y,
  baseG3Y,

  // Inner Box Calculations
  groupInnerW: CONTENT_W - 0.07 - groupPad * 2,
  groupInnerHalfW: (CONTENT_W - 0.07 - groupPad * 2 - s2Gap) / 2,

  // Advanced Refinements (Internal Layout Offsets explicitly moved up here)
  s2PadLeftRight: 0.035,
  g2Shrink: 0.01,
  sgPad: 0.03,
  sgBorderWidth: 0.006,
  boxExtOffset: 0.02,
  extraRowGap: 0.01,
};

// Fold positioning points based on geometry offsets
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

// ============================================================================
// CONTENT DOMAIN DATA (SURAH TEXTS)
// ============================================================================
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

// ============================================================================
// MAIN WRAPPER COMPONENT
// ============================================================================
interface PaperContentProps {
  imageUrl?: string;
  isBumpMap?: boolean;
  isFolded?: boolean;
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
  isFolded = false,
}: PaperContentProps) {
  if (imageUrl) {
    return <ImageContent url={imageUrl} />;
  }

  // Ensures deep black cutoff out-of-bounds for rendering bump passes vs Standard Color Canvas BG
  const activeBg = isBumpMap ? BUMP_BASE : PAGE_BG_COLOR;

  return (
    <>
      <mesh position={[PW / 2, -PAGE_HEIGHT / 2, -0.05]}>
        <planeGeometry args={[PW * 1.5, PAGE_HEIGHT * 1.5]} />
        <meshBasicMaterial color={activeBg} />
      </mesh>
      <color attach="background" args={[activeBg]} />

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

      {/* Bismillah Header Title */}
      <Text
        position={[PW / 2, -0.085, 0.02]}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={isBumpMap ? BUMP_MAX : TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        material-depthTest={false}
        font="/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf"
        direction="rtl"
      >
        {SURAH_DATA.bismillah}
      </Text>

      {/* Main Blocks rendering passed layout constraints safely */}
      <SectionOne
        data={SURAH_DATA.section1}
        layout={layoutMath}
        startX={START_X}
        PW={PW}
        isBumpMap={isBumpMap}
        isFolded={isFolded}
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
