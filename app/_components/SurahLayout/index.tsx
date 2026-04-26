"use client";
import { OrthographicCamera, useTexture } from "@react-three/drei";
import { Boarder } from "./Boarder";
import { SectionOne } from "./SectionOne";
import { SectionTwo } from "./SectionTwo";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PW,
  START_X,
  layoutMath,
  SURAH_TRANSFORMS,
} from "../data/SurahConfig";
import {
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../data/useSurahLanguageStore";
import {
  // TEXT_DARK,
  // TEXT_SIZES,
  PAGE_BG_COLOR,
  // QURAN_FONT,
} from "../data/theme";

export { PAGE_WIDTH, PAGE_HEIGHT, PW, layoutMath };
export { FOLD_Y_POSITIONS } from "../data/SurahConfig";
export { SurahLayout, SurahLayout as PaperContent };

const ImageContent: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[PW / 2, -PAGE_HEIGHT / 2, 0]}>
      <planeGeometry args={[PW, PAGE_HEIGHT]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

interface SurahLayoutProps {
  imageUrl?: string;
  isFolded?: boolean;
}

function SurahLayout({
  imageUrl,
  isFolded = false,
}: SurahLayoutProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];

  if (imageUrl) {
    return <ImageContent url={imageUrl} />;
  }

  const activeBg = PAGE_BG_COLOR;

  return (
    <>
      {/* Full-page background plane */}
      <mesh position={[PW / 2, -PAGE_HEIGHT / 2, -0.05]}>
        <planeGeometry args={[PW * 1.5, PAGE_HEIGHT * 1.5]} />
        <meshBasicMaterial color={activeBg} />
      </mesh>

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
      <Boarder PW={PW} PAGE_HEIGHT={PAGE_HEIGHT} />

      {/* Bismillah header */}
      {/* <Text
        position={[PW / 2, -0.085, 0.02]}
        fontSize={TEXT_SIZES.BISMILLAH}
        color={TEXT_DARK}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        material-depthTest={false}
        font={QURAN_FONT}
        direction="rtl"
      >
        {SURAH_DATA.bismillah}
      </Text> */}

      {/* Upper section — receives pre-computed S1Transforms, does zero math */}
      <SectionOne
        data={surahData.section1}
        transforms={SURAH_TRANSFORMS.s1}
        PW={PW}
        isFolded={isFolded}
      />

      {/* Lower section — receives pre-computed S2Transforms, does zero math */}
      <SectionTwo
        data={surahData.section2}
        transforms={SURAH_TRANSFORMS.s2}
        layout={layoutMath}
        startX={START_X}
        PW={PW}
        isFolded={isFolded}
      />
    </>
  );
}
