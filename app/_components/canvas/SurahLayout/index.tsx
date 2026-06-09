"use client";
import { OrthographicCamera, useTexture } from "@react-three/drei";
import { SurahSection } from "./SurahSection";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { useStoryStore } from "../../../stores/useStoryStore";
import {
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import {
  // TEXT_DARK,
  // TEXT_SIZES,
  PAGE_BG_COLOR,
  // QURAN_FONT,
} from "../../../data/theme";

export {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PW,
  layoutMath,
  SURAH_TRANSFORMS,
} from "../../../data/SurahConfig";
export { SurahLayout, SurahLayout as PaperContent };

const ImageContent: React.FC<{
  url: string;
  PW: number;
  PAGE_HEIGHT: number;
}> = ({ url, PW, PAGE_HEIGHT }) => {
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

function SurahLayout({ imageUrl, isFolded = false }: SurahLayoutProps) {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];
  const runtime = useSurahLayoutRuntime();

  if (imageUrl) {
    return (
      <ImageContent
        url={imageUrl}
        PW={runtime.PW}
        PAGE_HEIGHT={runtime.PAGE_HEIGHT}
      />
    );
  }

  const activeBg = PAGE_BG_COLOR;

  const config = useStoryStore((state) => state.activeConfig);

  return (
    <>
      {/* Full-page background plane */}
      <mesh position={[runtime.PW / 2, -runtime.PAGE_HEIGHT / 2, -0.05]}>
        <planeGeometry args={[runtime.PW * 1.5, runtime.PAGE_HEIGHT * 1.5]} />
        <meshBasicMaterial color={activeBg} />
      </mesh>

      {/* Orthographic camera framing the page exactly */}
      <OrthographicCamera
        makeDefault
        left={0}
        right={runtime.PAGE_WIDTH}
        top={0}
        bottom={-runtime.PAGE_HEIGHT}
        position={[0, 0, 5]}
      />

      {/* Outer decorative card border */}
      {/* <Boarder PW={runtime.PW} PAGE_HEIGHT={runtime.PAGE_HEIGHT} /> */}
      
      {/* Render sections dynamically */}
      {config.sections.map((sectionConfig, idx) => {
        const transforms = runtime.SURAH_TRANSFORMS.sections[idx];
        if (!transforms) return null;
        return (
          <SurahSection
            key={sectionConfig.id}
            sectionConfig={sectionConfig}
            transforms={transforms}
            surahData={surahData}
            layoutMath={runtime.layoutMath}
            startX={runtime.START_X}
            PW={runtime.PW}
            isFolded={isFolded}
          />
        );
      })}
    </>
  );
}
