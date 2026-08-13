"use client";
import {
  forwardRef,
  memo,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
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
  Scene,
  SRGBColorSpace,
  Vector2,
} from "three";
import { PageLodSceneProbe, PageTextureLod } from "./PageTextureLod";
import {
  firstPassTextureSize,
  maxPageTexelsPerUnit,
  QUALITY,
  TEXT_DENSITY_HEADROOM,
} from "./pageTextureLodMath";
import {
  PageTextDensityContext,
  PageZoomDensityContext,
} from "../shared/CanvasText";
import { buildSectionZoomIndex } from "../../../utils/sectionZoom";
import { usePaperMasking } from "../../../hooks/usePaperMasking";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { useStoryStore } from "../../../stores/useStoryStore";
import { usePaperStore } from "../../../stores/usePaperStore";
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
/**
 * Much shorter equivalents used while a PAPER SWITCH is in flight
 * (usePaperStore.isSwitching). The generous delays above protect the very
 * first page load (cold fonts, first-ever suspended textures); during a
 * switch all of that is already warm, and every extra millisecond here is
 * spent as a visible frozen hold between "new paper loaded" and the
 * page-turn choreography starting — the user should see them back-to-back.
 */
const SWITCH_TEXTURE_SETTLE_DELAY_MS = 120;
const SWITCH_TEXTURE_READY_DELAY_MS = 0;
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

/**
 * Commits together with its Suspense siblings, so its mount effect fires at
 * the exact moment the (possibly suspended) page content actually reaches
 * the RenderTexture scene — the truthful "content is really there" signal
 * the settle timer must wait for.
 */
function RenderTextureContentMounted({
  mountedKey,
  onMounted,
}: {
  mountedKey: string;
  onMounted: (key: string) => void;
}) {
  useEffect(() => {
    onMounted(mountedKey);
  }, [mountedKey, onMounted]);
  return null;
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
  const dpr = useThree((s) => s.viewport.dpr);
  const size = useThree((s) => s.size);
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
  const baseRenderTexWidth = Math.max(512, Math.floor(targetW * clampedScale));
  const baseRenderTexHeight = Math.max(512, Math.floor(targetH * clampedScale));

  const colorSamples = tier === "low" ? 0 : tier === "medium" ? 2 : 4;
  const normalSamples = 0;

  const normalTexW = Math.min(baseRenderTexWidth, 1024);
  const normalTexHeight = Math.min(baseRenderTexHeight, 1024);

  /**
   * A page of many sheets is drawn in stages instead of once — see
   * `PageTextureLod`. The first paint is deliberately small and identical on
   * every device; the resolution the page ends up at is reached afterwards,
   * off the critical path, and the zoom brings its own. Every ordinary surah
   * leaves this off and keeps the single full-size capture above, untouched.
   */
  const useLod = runtime.config.features.progressivePageTexture === true;
  const virtualSceneRef = useRef<Scene | null>(null);

  /**
   * How finely the text on THIS page is worth drawing — see
   * `PageTextDensityContext`. Only a composed paper answers; every other surah
   * passes null and keeps the rasterisation it has always had, to the pixel.
   *
   * On a page of a dozen sheets it is the difference between a hundred and
   * ninety canvases sized for a screen that does not exist and canvases sized
   * for the one in front of the reader — which is most of what makes this page
   * slow to open and heavy to hold.
   */
  const textDensity = useMemo(() => {
    if (!useLod) return null;

    const rects = Object.values(buildSectionZoomIndex(runtime.config).zoomFocus);
    if (rects.length === 0) return null;

    const perSheet = rects.map((rect) => ({
      rect,
      density:
        maxPageTexelsPerUnit(
          [rect],
          size.width,
          size.height,
          dpr,
          QUALITY[tier],
          maxTextureSize,
        ) * TEXT_DENSITY_HEADROOM,
    }));

    // The tightest zoom on the page — what anything outside every sheet gets,
    // since it is the one answer that can never be too soft.
    const pageWide = Math.max(...perSheet.map((s) => s.density));

    /** The sheet under a point, or the page-wide answer if there is none. */
    const at = (x: number, y: number) => {
      let finest = 0;
      for (const { rect, density } of perSheet) {
        const inside =
          x >= rect.x &&
          x <= rect.x + rect.w &&
          y <= rect.y &&
          y >= rect.y - rect.h;
        // Overlapping zones take the tighter of the two: either could be the
        // one the reader clicks.
        if (inside) finest = Math.max(finest, density);
      }
      return finest > 0 ? finest : pageWide;
    };

    return { pageWide, at };
  }, [useLod, runtime.config, size.width, size.height, dpr, tier, maxTextureSize]);

  // RenderTexture multiplies whatever it is given by the device pixel ratio,
  // so the ask is divided by it first — these numbers ARE the buffer.
  const firstPass = firstPassTextureSize(
    runtime.PAGE_WIDTH,
    runtime.PAGE_HEIGHT,
    maxTextureSize,
  );
  const renderTexWidth = useLod
    ? Math.max(64, Math.round(firstPass.width / dpr))
    : baseRenderTexWidth;
  const renderTexHeight = useLod
    ? Math.max(64, Math.round(firstPass.height / dpr))
    : baseRenderTexHeight;

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

  // The renderTextureKey whose PaperContent has ACTUALLY committed into the
  // RenderTexture scene. Per-surah content textures (verse frames, SVG
  // dividers, handwritten notes…) suspend on their first-ever load, and the
  // settle pipeline must never declare the page "ready" while the content is
  // still suspended — otherwise frames freeze on a blank capture.
  const [contentMountedKey, setContentMountedKey] = useState<string | null>(
    null,
  );

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
    // Settle only counts down once the content for THIS key has truly
    // committed (fonts ready AND any suspended textures resolved).
    if (!fontsReady || contentMountedKey !== renderTextureKey) return;
    const t = setTimeout(
      () => setSettledKey(renderTextureKey),
      usePaperStore.getState().isSwitching
        ? SWITCH_TEXTURE_SETTLE_DELAY_MS
        : TEXTURE_SETTLE_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [fontsReady, contentMountedKey, renderTextureKey]);

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

    const t = window.setTimeout(
      () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(onReady);
        });
      },
      usePaperStore.getState().isSwitching
        ? SWITCH_TEXTURE_READY_DELAY_MS
        : TEXTURE_READY_DELAY_MS,
    );

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

  const { onBeforeCompile, detailRef } = usePaperMasking(paperTextureDiffuse);

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

        {/*
         * THE first-switch black-flash fix. SurahLayout is full of
         * useTexture calls with per-surah URLs (verse frames, SVG dividers,
         * handwritten notes…). The first time a paper's URLs are ever
         * requested, the whole subtree SUSPENDS — and without a boundary
         * right here, that suspension bubbles out of this portal, past
         * SinglePaper, all the way to the dynamic() boundary around
         * Experience, unmounting the ENTIRE scene (paper, sheets, spotlight)
         * until the textures resolve — one full disappear/reappear flash,
         * exactly once per never-before-seen paper. Catching it here means
         * the worst case is a few frames of empty page background inside an
         * off-screen texture, while the on-screen scene stays untouched.
         * The reporter below re-arms the settle gate once the real content
         * has committed.
         */}
        {/*
         * Outside the Suspense boundary on purpose: it only reports WHICH
         * scene the page is being drawn into, and the ladder must be able to
         * find that scene the moment the content lands in it.
         */}
        {useLod && <PageLodSceneProbe sceneRef={virtualSceneRef} />}

        <Suspense fallback={null}>
          {fontsReady && (
            <PageTextDensityContext.Provider
              value={textDensity?.pageWide ?? null}
            >
              <PageZoomDensityContext.Provider value={textDensity?.at ?? null}>
                <PaperContent isFolded={isFolded} />
                <RenderTextureContentMounted
                  mountedKey={renderTextureKey}
                  onMounted={setContentMountedKey}
                />
              </PageZoomDensityContext.Provider>
            </PageTextDensityContext.Provider>
          )}
        </Suspense>

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

      {/*
       * Renders nothing — it only draws into buffers of its own and hands the
       * material a sharper `map` when one is ready. Keyed with the capture, so
       * a new language, a new paper or a re-awoken context starts the ladder
       * from the bottom again rather than serving the previous page's picture.
       *
       * `isWakingUp` is part of that key and has to be: a restored GL context
       * has emptied every buffer this owns, and the material is pointed back at
       * the live RenderTexture (which is redrawing itself right then) the
       * moment the ladder unmounts.
       */}
      {useLod && (
        <PageTextureLod
          key={`${renderTextureKey}-${isWakingUp ? "waking" : "awake"}`}
          config={runtime.config}
          materialRef={matRef}
          sceneRef={virtualSceneRef}
          pageWidth={runtime.PAGE_WIDTH}
          pageHeight={runtime.PAGE_HEIGHT}
          settled={settled}
          detailRef={detailRef}
        />
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
