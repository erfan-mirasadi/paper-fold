"use client";
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  OrthographicCamera,
  RenderTexture,
  useTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { SurahLayout as PaperContent } from "../SurahLayout/index";
import {
  ClampToEdgeWrapping,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
} from "three";
import { usePaperMasking } from "../../../hooks/usePaperMasking";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { useStoryStore } from "../../../stores/useStoryStore";
import { detectGpuTier } from "../../../utils/gpuTier";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";
import {
  FONT_FAMILY_NAMES,
  HANDWRITTEN_FONT,
  LATIN_VERSE_FONT,
  PAGE_BG_COLOR,
  QURAN_FONT,
} from "../../../data/theme";

const CREASE_BAND_HEIGHT = 0.03;
const CREASE_NORMAL_OPACITY = 2;
const PAPER_NORMAL_OPACITY = 2;
const paperBaseColor = new Color(PAGE_BG_COLOR);

const BASE_RENDER_TEX_WIDTH = 1200;
const BASE_RENDER_TEX_HEIGHT = 1700;

const TEXTURE_SETTLE_DELAY_MS = 600;
const TEXTURE_READY_DELAY_MS = 200;
const TEXTURE_CAPTURE_FRAMES = 1;
const NORMAL_SCALE_ENABLED = new Vector2(1.2, 1.2);
const NORMAL_SCALE_DISABLED = new Vector2(0, 0);
const PAGE_TEXT_FONTS = [QURAN_FONT, LATIN_VERSE_FONT, HANDWRITTEN_FONT] as const;
const FRAME_OPACITY = 0.15;

async function preloadFontUrl(fontUrl: string) {
  if (typeof FontFace === "undefined") {
    await fetch(fontUrl);
    return;
  }

  const familyName = FONT_FAMILY_NAMES[fontUrl] ?? "LatinFont";
  const fontFace = new FontFace(familyName, `url(${fontUrl})`);
  await fontFace.load();
  document.fonts.add(fontFace);
}

function usePageTextFontsReady() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
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
  normalUrl: "/paper-material/Paper-Texture-7_normal.png",
  diffuseUrl: "/paper-material/Folded-PaperTextures-001.jpg",
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
}

export interface PaperMaterialHandle {
  getMaterial: () => MeshStandardMaterial | null;
}

interface PaperMaterialProps {
  toggles: TextureToggles;
  isFolded?: boolean;
  onReady?: () => void;
}

function areTogglesEqual(a: TextureToggles, b: TextureToggles): boolean {
  return a.diffuse === b.diffuse && a.normal === b.normal;
}

const PaperMaterialComponentFn: React.ForwardRefRenderFunction<
  PaperMaterialHandle,
  PaperMaterialProps
> = ({ toggles, isFolded = false, onReady }, ref) => {
  const { gl } = useThree();
  const runtime = useSurahLayoutRuntime();
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const fontsReady = usePageTextFontsReady();
  const normalScale = toggles.normal
    ? NORMAL_SCALE_ENABLED
    : NORMAL_SCALE_DISABLED;

  const tier = detectGpuTier();
  const maxTextureSize = gl.capabilities.maxTextureSize || 4096;

  const targetMultiplier = tier === "high" ? 2 : tier === "medium" ? 1.5 : 1;
  const targetW = BASE_RENDER_TEX_WIDTH * targetMultiplier;
  const targetH = BASE_RENDER_TEX_HEIGHT * targetMultiplier;

  const clampedScale = Math.min(
    1,
    (maxTextureSize - 16) / Math.max(targetW, targetH),
  );
  const renderTexWidth = Math.max(512, Math.floor(targetW * clampedScale));
  const renderTexHeight = Math.max(512, Math.floor(targetH * clampedScale));

  const colorSamples = tier === "low" ? 0 : tier === "medium" ? 2 : 4;
  const normalSamples = 0;

  const normalTexW = Math.min(renderTexWidth, 1024);
  const normalTexHeight = Math.min(renderTexHeight, 1024);

  // The scene (and this material) persist across paper switches — bumping
  // storyRevision remounts ONLY the RenderTextures so the new paper's content
  // is drawn into fresh buffers in place.
  const storyRevision = useStoryStore((s) => s.storyRevision);

  const renderTextureKey = [
    `story${storyRevision}`,
    activeLanguage,
    fontsReady ? "fonts-ready" : "fonts-loading",
    isFolded ? "folded" : "flat",
    toggles.diffuse ? "diffuse" : "flat-color",
  ].join("-");

  const [settledKey, setSettledKey] = useState<string | null>(null);

  // استیت بیدارباش فقط برای باز کردن فریمها
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    let hiddenTime = 0;

    const handleWakeUp = () => {
      setIsWakingUp(true);
      setTimeout(() => setIsWakingUp(false), 800);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenTime = Date.now();
      } else if (document.visibilityState === "visible") {
        const timeAway = Date.now() - hiddenTime;
        // 5 minutes = 5 * 60 * 1000 ms
        if (hiddenTime > 0 && timeAway >= 5 * 60 * 1000) {
          handleWakeUp();
        }
        hiddenTime = 0;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const canvas = gl.domElement;
    if (canvas) canvas.addEventListener("webglcontextrestored", handleWakeUp);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas)
        canvas.removeEventListener("webglcontextrestored", handleWakeUp);
    };
  }, [gl]);

  useEffect(() => {
    if (!fontsReady) return;
    const t = setTimeout(
      () => setSettledKey(renderTextureKey),
      TEXTURE_SETTLE_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [fontsReady, renderTextureKey]);

  const settled = fontsReady && settledKey === renderTextureKey;

  // اگر در حال بیدار شدن باشیم، فریمها روی بینهایت میرن تا دوباره نقاشی بشن
  const mapFrames =
    settled && !isWakingUp ? TEXTURE_CAPTURE_FRAMES : (Infinity as number);

  const matRef = useRef<MeshStandardMaterial>(null);

  useImperativeHandle(
    ref,
    () => ({
      getMaterial: () => matRef.current,
    }),
    [],
  );

  useEffect(() => {
    if (!settled) return;
    const t = setTimeout(() => {
      const map = matRef.current?.map;
      if (!map) return;
      map.generateMipmaps = true;
      map.minFilter = LinearMipmapLinearFilter;
      map.anisotropy = gl.capabilities.getMaxAnisotropy();
      map.needsUpdate = true;
    }, 300);
    return () => clearTimeout(t);
  }, [settled, gl]);

  useEffect(() => {
    if (!settled || !onReady) return;

    const t = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(onReady);
      });
    }, TEXTURE_READY_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [settled, onReady]);

  const creaseNormalMap = useTexture(
    "/paper-material/crease-normal-1.png",
    (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.repeat.set(5, 0.9);
      texture.offset.set(0, 0.05);
      texture.needsUpdate = true;
    },
  );

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

  const frameTexture = useTexture(
    "/paper-material/grunge-frame-3.webp",
    (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    },
  );

  const { onBeforeCompile } = usePaperMasking(paperTextureDiffuse);

  return (
    <meshStandardMaterial
      ref={matRef}
      attach="material-4"
      {...PAPER_MATERIAL_CONFIG}
      normalScale={normalScale}
      onBeforeCompile={onBeforeCompile}
    >
      <RenderTexture
        key={renderTextureKey}
        attach="map"
        width={renderTexWidth}
        height={renderTexHeight}
        frames={mapFrames}
        samples={colorSamples}
      >
        <color attach="background" args={[PAGE_BG_COLOR]} />

        <OrthographicCamera
          makeDefault
          left={0}
          right={runtime.PAGE_WIDTH}
          top={0}
          bottom={-runtime.PAGE_HEIGHT}
          position={[0, 0, 5]}
        />

        {toggles.diffuse && (
          <mesh
            position={[runtime.PAGE_WIDTH / 2, -runtime.PAGE_HEIGHT / 2, -10]}
          >
            <planeGeometry args={[runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT]} />
            <meshBasicMaterial
              map={paperTextureDiffuse}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        )}

        {fontsReady && <PaperContent isFolded={isFolded} />}

        <mesh position={[runtime.PAGE_WIDTH / 2, -runtime.PAGE_HEIGHT / 2, 2]}>
          <planeGeometry args={[runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT]} />
          <meshBasicMaterial
            map={frameTexture}
            transparent={true}
            opacity={FRAME_OPACITY}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </RenderTexture>

      {toggles.normal && (
        <RenderTexture
          key={`${renderTextureKey}-normal`}
          attach="normalMap"
          width={normalTexW}
          height={normalTexHeight}
          frames={mapFrames}
          samples={normalSamples}
          depthBuffer={false}
          stencilBuffer={false}
        >
          <color attach="background" args={["#8080ff"]} />
          <OrthographicCamera
            makeDefault
            left={0}
            right={runtime.PAGE_WIDTH}
            top={0}
            bottom={-runtime.PAGE_HEIGHT}
            position={[0, 0, 5]}
          />

          <mesh
            position={[runtime.PAGE_WIDTH / 2, -runtime.PAGE_HEIGHT / 2, -1]}
            renderOrder={0}
          >
            <planeGeometry args={[runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT]} />
            <meshBasicMaterial
              map={paperTextureNormal}
              transparent={true}
              opacity={PAPER_NORMAL_OPACITY}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>

          {runtime.FOLD_Y_POSITIONS.map((y: number, i: number) => (
            <mesh
              key={i}
              position={[runtime.PAGE_WIDTH / 2, y, i * 0.01]}
              renderOrder={10}
            >
              <planeGeometry args={[runtime.PAGE_WIDTH, CREASE_BAND_HEIGHT]} />
              <meshBasicMaterial
                map={creaseNormalMap}
                transparent={true}
                opacity={CREASE_NORMAL_OPACITY}
                depthTest={false}
                toneMapped={false}
              />
            </mesh>
          ))}
        </RenderTexture>
      )}
    </meshStandardMaterial>
  );
};

const PaperMaterialWithRef = forwardRef(PaperMaterialComponentFn);

export const PaperMaterial = memo(
  PaperMaterialWithRef,
  (prevProps, nextProps) =>
    prevProps.isFolded === nextProps.isFolded &&
    prevProps.onReady === nextProps.onReady &&
    areTogglesEqual(prevProps.toggles, nextProps.toggles),
);
