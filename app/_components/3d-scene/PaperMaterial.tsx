"use client";
import React from "react";
import {
  OrthographicCamera,
  RenderTexture,
  useTexture,
} from "@react-three/drei";
import {
  FOLD_Y_POSITIONS,
  SurahLayout as PaperContent,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  layoutMath,
} from "../SurahLayout/index";
import {
  ClampToEdgeWrapping,
  Color,
  LinearFilter,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
} from "three";
import { usePaperMasking } from "./usePaperMasking";
import { useSurahLanguageStore } from "../data/useSurahLanguageStore";
import { LATIN_VERSE_FONT, QURAN_FONT } from "../data/theme";

const CREASE_BAND_HEIGHT = 0.03;
const CREASE_NORMAL_OPACITY = 2;
const PAPER_NORMAL_OPACITY = 2;
const paperBaseColor = new Color("#f2f0e6");
const RENDER_TEX_WIDTH = 1200;
const RENDER_TEX_HEIGHT = 1700;
const PAGE_TEXTURE_SETTLE_FRAMES = 30;
const NORMAL_SCALE_ENABLED = new Vector2(1.2, 1.2);
const NORMAL_SCALE_DISABLED = new Vector2(0, 0);
const PAGE_TEXT_FONTS = [QURAN_FONT, LATIN_VERSE_FONT] as const;

async function preloadFontUrl(fontUrl: string) {
  if (typeof FontFace === "undefined") {
    await fetch(fontUrl);
    return;
  }

  const fontFace = new FontFace(`paper-text-${fontUrl}`, `url(${fontUrl})`);
  await fontFace.load();
  document.fonts.add(fontFace);
}

function usePageTextFontsReady() {
  const [fontsReady, setFontsReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all(PAGE_TEXT_FONTS.map(preloadFontUrl))
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return fontsReady;
}

export const PAPER_TEXTURES = {
  normalUrl: "/Paper-Texture-7_normal.png",
  diffuseUrl: "/Folded-PaperTextures-001.jpg",
} as const;

export const PAPER_MATERIAL_CONFIG = {
  roughness: 0.95,
  metalness: 0.02,
  color: paperBaseColor,
  envMapIntensity: 0.6,
};

export interface TextureToggles {
  diffuse: boolean;
  normal: boolean;
  roughness: boolean;
  ao: boolean;
}

interface PaperMaterialProps {
  toggles: TextureToggles;
  isFolded?: boolean;
}

function areTogglesEqual(a: TextureToggles, b: TextureToggles): boolean {
  return (
    a.diffuse === b.diffuse &&
    a.normal === b.normal &&
    a.roughness === b.roughness &&
    a.ao === b.ao
  );
}

const PaperMaterialComponent: React.FC<PaperMaterialProps> = ({
  toggles,
  isFolded = false,
}) => {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const fontsReady = usePageTextFontsReady();
  const normalScale = toggles.normal
    ? NORMAL_SCALE_ENABLED
    : NORMAL_SCALE_DISABLED;
  const renderTextureKey = [
    activeLanguage,
    fontsReady ? "fonts-ready" : "fonts-loading",
    isFolded ? "folded" : "flat",
    toggles.diffuse ? "diffuse" : "flat-color",
  ].join("-");

  // Load texture maps at the top to ensure they are available for uniforms
  const creaseNormalMap = useTexture("/crease-normal-1.png", (texture) => {
    texture.colorSpace = NoColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.repeat.set(5, 0.9);
    texture.offset.set(0, 0.05);
    texture.needsUpdate = true;
  });

  const paperTextureNormal = useTexture(PAPER_TEXTURES.normalUrl, (texture) => {
    texture.colorSpace = NoColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
  });

  const paperTextureDiffuse = useTexture(
    PAPER_TEXTURES.diffuseUrl,
    (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;
    },
  );

  const { onBeforeCompile } = usePaperMasking(paperTextureDiffuse);

  return (
    <meshStandardMaterial
      attach="material-4"
      {...PAPER_MATERIAL_CONFIG}
      normalScale={normalScale}
      onBeforeCompile={onBeforeCompile}
    >
      {/* MAP: The safe way without breaking SurahLayout's default camera */}
      <RenderTexture
        key={renderTextureKey}
        attach="map"
        width={RENDER_TEX_WIDTH}
        height={RENDER_TEX_HEIGHT}
        frames={PAGE_TEXTURE_SETTLE_FRAMES}
      >
        <color attach="background" args={["#f2f0e6"]} />

        {toggles.diffuse && (
          <mesh position={[PAGE_WIDTH / 2, -PAGE_HEIGHT / 2, -10]}>
            <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
            <meshBasicMaterial
              map={paperTextureDiffuse}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        )}

        {fontsReady && <PaperContent isFolded={isFolded} />}
      </RenderTexture>

      {/* NORMAL MAP */}
      {toggles.normal && (
        <RenderTexture
          attach="normalMap"
          width={RENDER_TEX_WIDTH}
          height={RENDER_TEX_HEIGHT}
          frames={1}
        >
          <color attach="background" args={["#8080ff"]} />
          <OrthographicCamera
            makeDefault
            left={0}
            right={PAGE_WIDTH}
            top={0}
            bottom={-PAGE_HEIGHT}
            position={[0, 0, 5]}
          />

          <mesh
            position={[PAGE_WIDTH / 2, -PAGE_HEIGHT / 2, -1]}
            renderOrder={0}
          >
            <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
            <meshBasicMaterial
              map={paperTextureNormal}
              transparent={true}
              opacity={PAPER_NORMAL_OPACITY}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>

          {/* Crease lines directly in the normal map */}
          {FOLD_Y_POSITIONS.map((y, i) => (
            <mesh
              key={i}
              position={[PAGE_WIDTH / 2, y, i * 0.01]}
              renderOrder={10}
            >
              <planeGeometry args={[PAGE_WIDTH, CREASE_BAND_HEIGHT]} />
              <meshBasicMaterial
                map={creaseNormalMap}
                transparent={true}
                opacity={CREASE_NORMAL_OPACITY}
                depthTest={false}
                toneMapped={false}
              />
            </mesh>
          ))}

          <mesh
            position={[
              PAGE_WIDTH / 2,
              (layoutMath.g1Y + (layoutMath.g3Y - layoutMath.groupH)) / 2,
              0.62,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            renderOrder={10}
          >
            <planeGeometry
              args={[
                layoutMath.g1Y - (layoutMath.g3Y - layoutMath.groupH),
                CREASE_BAND_HEIGHT,
              ]}
            />
            <meshBasicMaterial
              map={creaseNormalMap}
              transparent={true}
              opacity={CREASE_NORMAL_OPACITY}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>

          <mesh
            position={[
              PAGE_WIDTH / 2,
              layoutMath.s1Top -
                layoutMath.s1Pad -
                (layoutMath.smallBoxH + layoutMath.gap / 2),
              0.62,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            renderOrder={10}
          >
            <planeGeometry
              args={[
                layoutMath.smallBoxH * 2 + layoutMath.gap,
                CREASE_BAND_HEIGHT,
              ]}
            />
            <meshBasicMaterial
              map={creaseNormalMap}
              transparent={true}
              opacity={CREASE_NORMAL_OPACITY}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>
        </RenderTexture>
      )}
    </meshStandardMaterial>
  );
};

export const PaperMaterial = React.memo(
  PaperMaterialComponent,
  (prevProps, nextProps) =>
    prevProps.isFolded === nextProps.isFolded &&
    areTogglesEqual(prevProps.toggles, nextProps.toggles),
);
