"use client";

// ============================================================================
// SURAH LAYOUT — MAIN ENTRY POINT
// Location: SurahLayout/index.tsx
// Purpose: Assembles the full Surah paper texture. Imports pre-computed
//          transforms from the LayoutEngine (module-level singleton) and
//          passes them down to SectionOne / SectionTwo.
//          Components receive ready-made positions — they do zero math.
// ============================================================================

import { OrthographicCamera, Text, useTexture } from "@react-three/drei";
import { Boarder } from "./Boarder";
import { SectionOne } from "./SectionOne";
import { SectionTwo } from "./SectionTwo";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PW,
  START_X,
  layoutMath,
  SURAH_DATA,
  SURAH_TRANSFORMS,
} from "../data/SurahConfig";
import {
  TEXT_DARK,
  TEXT_SIZES,
  PAGE_BG_COLOR,
  BUMP_BASE,
  BUMP_MAX,
  QURAN_FONT,
} from "../data/theme";

export { PAGE_WIDTH, PAGE_HEIGHT, PW, layoutMath };
export { FOLD_Y_POSITIONS } from "../data/SurahConfig";
export { SurahLayout, SurahLayout as PaperContent };

// ----------------------------------------------------------------------------
// INNER COMPONENT: ImageContent
// Renders a flat mapped texture (used for pre-baked frames).
// ----------------------------------------------------------------------------
const ImageContent: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[PW / 2, -PAGE_HEIGHT / 2, 0]}>
      <planeGeometry args={[PW, PAGE_HEIGHT]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

// ----------------------------------------------------------------------------
// MAIN COMPONENT: SurahLayout
// ----------------------------------------------------------------------------
interface SurahLayoutProps {
  imageUrl?: string;
  isBumpMap?: boolean;
  isFolded?: boolean;
}

function SurahLayout({
  imageUrl,
  isBumpMap = false,
  isFolded = false,
}: SurahLayoutProps) {
  if (imageUrl) {
    return <ImageContent url={imageUrl} />;
  }

  const activeBg = isBumpMap ? BUMP_BASE : PAGE_BG_COLOR;

  return (
    <>
      {/* Full-page background plane */}
      <mesh position={[PW / 2, -PAGE_HEIGHT / 2, -0.05]}>
        <planeGeometry args={[PW * 1.5, PAGE_HEIGHT * 1.5]} />
        <meshBasicMaterial color={activeBg} />
      </mesh>
      <color attach="background" args={[activeBg]} />

      {/* Orthographic camera framing the page exactly */}
      <OrthographicCamera
        makeDefault
        left={0}
        right={PAGE_WIDTH}
        top={0}
        bottom={-PAGE_HEIGHT}
        position={[0, 0, 5]}
      />

      {/* Outer decorative card border */}
      <Boarder PW={PW} PAGE_HEIGHT={PAGE_HEIGHT} isBumpMap={isBumpMap} />

      {/* Bismillah header */}
      <Text
        position={[PW / 2, -0.085, 0.02]}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={isBumpMap ? BUMP_MAX : TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        material-depthTest={false}
        font={QURAN_FONT}
        direction="rtl"
      >
        {SURAH_DATA.bismillah}
      </Text>

      {/* Upper section — receives pre-computed S1Transforms, does zero math */}
      <SectionOne
        data={SURAH_DATA.section1}
        transforms={SURAH_TRANSFORMS.s1}
        PW={PW}
        isBumpMap={isBumpMap}
        isFolded={isFolded}
      />

      {/* Lower section — receives pre-computed S2Transforms, does zero math */}
      <SectionTwo
        data={SURAH_DATA.section2}
        transforms={SURAH_TRANSFORMS.s2}
        layout={layoutMath}
        startX={START_X}
        PW={PW}
        isBumpMap={isBumpMap}
        isFolded={isFolded}
      />
    </>
  );
}
