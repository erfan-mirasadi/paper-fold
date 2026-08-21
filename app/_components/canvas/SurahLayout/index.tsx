"use client";
import { OrthographicCamera, useTexture } from "@react-three/drei";
import { BlockRenderer } from "./BlockRenderer";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { useStoryStore } from "../../../stores/useStoryStore";
import {
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import {
  // TEXT_DARK,
  // TEXT_SIZES,
  pageBackgroundColor,
  // QURAN_FONT,
} from "../../../data/theme";

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
  const activeTextData = useStoryStore((s) => s.activeTextData);
  const surahData = activeTextData[activeLanguage];
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

  const config = useStoryStore((state) => state.activeConfig);

  /**
   * THIS PLANE IS THE PAPER. It covers the render target's clear colour
   * entirely, so it — not the clear — is what the reader sees and what the
   * vellum shader measures every pixel against. See `pageBackgroundColor`.
   */
  const activeBg = pageBackgroundColor(config.features);

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
      
      {/* Render all blocks/sections through the unified BlockRenderer */}
      <BlockRenderer
        sections={runtime.SURAH_TRANSFORMS.sections}
        layout={runtime.layoutMath}
        surahData={surahData}
        startX={runtime.START_X}
        PW={runtime.PW}
        isFolded={isFolded}
      />
    </>
  );
}
