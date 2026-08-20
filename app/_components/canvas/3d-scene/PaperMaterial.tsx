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
  fitTextureSize,
  firstPassTextureSize,
  maxPageTexelsPerUnit,
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
  FLAT_PAGE_BG_COLOR,
  FLAT_PAPER_LIGHT_SCALE,
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

/**
 * Ceiling on the single full-page capture, in texels. Half-float, so a texel is
 * 8 bytes — this is 96 MB, and it is a guard rather than a target: the highest
 * tier asks for 8.2 of these megatexels and never reaches it. It exists so that
 * no tier, no future page size and no display can turn this one allocation back
 * into the quarter-gigabyte it used to be.
 */
const FULL_PAGE_MAX_PIXELS = 12e6;

/**
 * What to hand `RenderTexture` so the buffer comes out at `texels` exactly.
 *
 * It multiplies the ask by the device pixel ratio, so the ask is that many
 * texels DIVIDED by the ratio — and snapped to a multiple of four, because the
 * ratio is not always a whole number. A 1.5 ratio (a medium-tier phone, a
 * Windows display at 150%) turns an odd ask into half a texel, and a fractional
 * size is not a size any driver can allocate: it is silently truncated, leaving
 * the target's recorded height and its real one disagreeing by a texel. Four
 * keeps the product whole at every ratio that actually occurs — 1, 1.25, 1.5, 2
 * and 3 — and costs at most three texels of the ask.
 */
function askForTexels(texels: number, dpr: number): number {
  return Math.max(64, Math.round(texels / dpr / 4) * 4);
}

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

  /**
   * The full-page capture, for every surah that is a single sheet rather than a
   * composed atlas — and THESE NUMBERS ARE THE BUFFER, exactly as they are on
   * the ladder's first paint below.
   *
   * They were not, until now. `RenderTexture` multiplies whatever it is handed
   * by the device pixel ratio, so a figure written here as a texel count was
   * silently squared against the display: the 2400 x 3400 this tier asks for
   * arrived as 4800 x 6800 on any retina screen — 32.6 megatexels of half-float,
   * a quarter of a gigabyte for one page, before `colorSamples` multisampled it
   * further. That is the allocation `PageTextureLod`'s own header calls "the
   * thing weak GPUs quietly refuse", and it was never a decision; it was drei's
   * arithmetic leaking into a constant that reads like a resolution.
   *
   * Dividing it back out makes the tier table mean what it says and makes the
   * cost independent of the screen — which is the precondition for letting a
   * capable phone raise its pixel ratio at all (`maxDevicePixelRatio`). Nothing
   * is given up for it: 3400 texels down the page is already well over twice
   * what any display resolves it at, and past a certain point oversampling
   * makes text softer rather than sharper, not being read at mip zero — the
   * reasoning `TEXT_DENSITY_HEADROOM` sets out in full.
   *
   * `fitTextureSize` applies the driver's own limit and a ceiling, so no tier
   * and no future page can ask for a buffer the device will refuse.
   */
  const fullPage = fitTextureSize(
    targetW,
    targetH,
    1,
    maxTextureSize,
    FULL_PAGE_MAX_PIXELS,
  );
  const baseRenderTexWidth = askForTexels(fullPage.width, dpr);
  const baseRenderTexHeight = askForTexels(fullPage.height, dpr);

  const colorSamples = tier === "low" ? 0 : tier === "medium" ? 2 : 4;
  const normalSamples = 0;

  // Divided by the ratio for the same reason, so the crease/grain normal map is
  // the 1024 it says it is rather than 1024 times the display's ratio.
  const normalTexW = askForTexels(Math.min(fullPage.width, 1024), dpr);
  const normalTexHeight = askForTexels(Math.min(fullPage.height, 1024), dpr);

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
   * A page that carries no photograph of paper — see
   * `SurahFeatures.flatPaperSurface`. It drops the grunge frame with it: the
   * frame is 3440 x 2430 stretched over a seven-unit page, so a section zoom
   * magnifies it well past its own detail exactly as it did the paper, and it
   * is the last stretched raster left on this page.
   *
   * The page colour moves with it, and has to. `PAGE_BG_COLOR` is what the
   * buffer is CLEARED to, and the photograph used to be painted over all of
   * it — so leaving the clear colour showing does not just remove a texture,
   * it lightens the page by 15% and tints it pink. See `FLAT_PAGE_BG_COLOR`.
   */
  const isFlatPaper = runtime.config.features.flatPaperSurface === true;
  const pageBgColor = isFlatPaper ? FLAT_PAGE_BG_COLOR : PAGE_BG_COLOR;

  /**
   * How much light this paper takes. A flat one takes less, because it has no
   * relief left to break up the scene's ~2x illumination and would otherwise
   * clip to white and lose every pale colour on it — see
   * `FLAT_PAPER_LIGHT_SCALE`, which is the dial for this.
   *
   * Scaled in LINEAR space (`Color` components are already the working space),
   * which is what makes it a light scale rather than a repaint: every hue on
   * the page keeps its ratios and simply stops being over-exposed.
   */
  const paperColor = useMemo(
    () =>
      isFlatPaper
        ? new Color(PAGE_BG_COLOR).multiplyScalar(FLAT_PAPER_LIGHT_SCALE)
        : paperBaseColor,
    [isFlatPaper],
  );

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
  }, [useLod, runtime.config, size.width, size.height, dpr, maxTextureSize]);

  // RenderTexture multiplies whatever it is given by the device pixel ratio,
  // so the ask is divided by it first — these numbers ARE the buffer.
  const firstPass = firstPassTextureSize(
    runtime.PAGE_WIDTH,
    runtime.PAGE_HEIGHT,
    maxTextureSize,
  );
  const renderTexWidth = useLod
    ? askForTexels(firstPass.width, dpr)
    : baseRenderTexWidth;
  const renderTexHeight = useLod
    ? askForTexels(firstPass.height, dpr)
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
      color={paperColor}
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
        <color attach="background" args={[pageBgColor]} />

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

        {!isFlatPaper && (
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
        )}
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
