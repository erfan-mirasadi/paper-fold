/**
 * paperSnapshot — captures the outgoing paper into module-owned GPU copies so
 * the page-turn sheet can keep flying WHILE the live scene content is being
 * swapped underneath it.
 *
 * Both the color map and the normal map are copied with single GPU blits
 * (one draw call each, no CPU readback — sub-millisecond). The copies mirror
 * the source textures' color space and sampling setup, and the sheet's
 * material mirrors the live paper's params, so the handoff is visually
 * indistinguishable. Owning the copies is what makes the OVERLAPPED
 * choreography possible: the live material can start rendering the NEW
 * paper's content immediately, while the sheet still shows the old page.
 */

import {
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
  type MeshStandardMaterial,
} from "three";

export interface PaperSnapshotSource {
  /** The primary panel's live material (map = the page RenderTexture). */
  getMaterial: () => MeshStandardMaterial | null;
  /** Current per-bone fold rotations (length PAGE_SEGMENTS + 1). */
  getBoneRotations: () => Float32Array | null;
  pageWidth: number;
  pageHeight: number;
  sceneCenterY: number;
}

export interface PaperTransitionCapture {
  /** Monotonic id — lets React `key` force a clean remount per capture. */
  captureId: number;
  /** Module-owned copy of the page texture. */
  mapCopy: Texture;
  /** Module-owned copy of the paper-grain/crease normal map (may be null). */
  normalCopy: Texture | null;
  /** Per-bone fold rotations at capture time (length PAGE_SEGMENTS + 1) — the
   *  starting pose for the flatten sheet's own unfold animation. */
  boneRotations: Float32Array;
  /** Largest fold rotation at capture time — ~0 means already flat. */
  maxFoldAngle: number;
  pageWidth: number;
  pageHeight: number;
  sceneCenterY: number;
  dispose: () => void;
}

// ---------------------------------------------------------------------------
// Registry — the live SinglePaper registers itself; usePaperStore captures.
// ---------------------------------------------------------------------------

let activeSource: PaperSnapshotSource | null = null;
let activeRenderer: WebGLRenderer | null = null;
let nextCaptureId = 1;

export function registerPaperSnapshotSource(
  source: PaperSnapshotSource,
  renderer: WebGLRenderer,
): void {
  activeSource = source;
  activeRenderer = renderer;
}

export function unregisterPaperSnapshotSource(
  source: PaperSnapshotSource,
): void {
  if (activeSource === source) {
    activeSource = null;
  }
}

// ---------------------------------------------------------------------------
// GPU blit — lazily created scratch scene reused across captures.
// ---------------------------------------------------------------------------

let blitScene: Scene | null = null;
let blitCamera: OrthographicCamera | null = null;
let blitMaterial: MeshBasicMaterial | null = null;

function getBlitRig() {
  if (!blitScene || !blitCamera || !blitMaterial) {
    blitMaterial = new MeshBasicMaterial({ toneMapped: false });
    const quad = new Mesh(new PlaneGeometry(2, 2), blitMaterial);
    quad.frustumCulled = false;
    blitScene = new Scene();
    blitScene.add(quad);
    blitCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  return { scene: blitScene, camera: blitCamera, material: blitMaterial };
}

/**
 * Copy `source` into a fresh render target that mirrors its color space and
 * sampling. Rendering into an RT encodes to the RT texture's color space and
 * sampling decodes from the source's — a symmetric round-trip, so the copy
 * is byte-faithful.
 */
function blitTextureCopy(
  renderer: WebGLRenderer,
  source: Texture,
  withMipmaps: boolean,
): Texture & { __rt?: WebGLRenderTarget } {
  const image = source.image as { width: number; height: number };
  const renderTarget = new WebGLRenderTarget(image.width, image.height, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  renderTarget.texture.colorSpace = source.colorSpace;
  if (withMipmaps) {
    renderTarget.texture.generateMipmaps = true;
    renderTarget.texture.minFilter = LinearMipmapLinearFilter;
    renderTarget.texture.magFilter = LinearFilter;
    renderTarget.texture.anisotropy =
      renderer.capabilities.getMaxAnisotropy();
  } else {
    renderTarget.texture.generateMipmaps = false;
    renderTarget.texture.minFilter = LinearFilter;
    renderTarget.texture.magFilter = LinearFilter;
  }

  const { scene, camera, material } = getBlitRig();
  material.map = source;
  material.needsUpdate = true;

  const previousTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(previousTarget);
  material.map = null;

  const texture = renderTarget.texture as Texture & {
    __rt?: WebGLRenderTarget;
  };
  texture.__rt = renderTarget;
  return texture;
}

/**
 * Capture the outgoing paper right now, on the caller's own stack. Three's
 * WebGLRenderer keeps an internal render-state stack (pushed/popped by every
 * `.render()` call) that is normally only ever touched from inside R3F's own
 * frame loop; calling it from an arbitrary, non-frame-aligned stack (e.g.
 * directly inside a click handler) is exactly the kind of one-off, unusual
 * timing that tends to only misbehave the FIRST time some internal lazy
 * state gets initialized. `requestPaperTransitionCapture` below is the
 * PUBLIC entry point precisely so nothing calls this directly from a click
 * handler — it always runs inside a `useFrame`, a time R3F already expects
 * `.render()` calls to happen.
 */
function performCaptureNow(): PaperTransitionCapture | null {
  const source = activeSource;
  const renderer = activeRenderer;
  if (!source || !renderer) return null;

  const material = source.getMaterial();
  const map = material?.map;
  const mapImage = map?.image as { width?: number; height?: number } | undefined;
  if (!map || !mapImage?.width || !mapImage?.height) return null;

  const boneRotations = source.getBoneRotations();
  if (!boneRotations) return null;

  let maxFoldAngle = 0;
  for (let i = 0; i < boneRotations.length; i++) {
    maxFoldAngle = Math.max(maxFoldAngle, Math.abs(boneRotations[i]));
  }

  let mapCopy: Texture & { __rt?: WebGLRenderTarget };
  let normalCopy: (Texture & { __rt?: WebGLRenderTarget }) | null = null;
  try {
    mapCopy = blitTextureCopy(renderer, map, true);

    const normal = material?.normalMap;
    const normalImage = normal?.image as
      | { width?: number; height?: number }
      | undefined;
    if (normal && normalImage?.width && normalImage?.height) {
      normalCopy = blitTextureCopy(renderer, normal, false);
    }
  } catch {
    return null;
  }

  return {
    captureId: nextCaptureId++,
    mapCopy,
    normalCopy,
    boneRotations: new Float32Array(boneRotations),
    maxFoldAngle,
    pageWidth: source.pageWidth,
    pageHeight: source.pageHeight,
    sceneCenterY: source.sceneCenterY,
    dispose: () => {
      mapCopy.__rt?.dispose();
      normalCopy?.__rt?.dispose();
    },
  };
}

// ---------------------------------------------------------------------------
// Request/process pump — the only public way to trigger a capture. Queues
// the request and resolves it from inside SinglePaper's own per-frame
// useFrame, so the actual renderer.render() blit always runs at a time R3F
// itself expects renders to happen.
// ---------------------------------------------------------------------------

let pendingResolve: ((capture: PaperTransitionCapture | null) => void) | null =
  null;

/** Called by usePaperStore — resolves once the next frame processes it. */
export function requestPaperTransitionCapture(): Promise<PaperTransitionCapture | null> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
  });
}

/** Called once per frame from SinglePaper's own useFrame — cheap no-op when idle. */
export function processPendingCaptureRequest(): void {
  if (!pendingResolve) return;
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve(performCaptureNow());
}
