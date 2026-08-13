/**
 * gpuTier.ts — GPU capability detection for quality scaling.
 *
 * Quality decisions are based on the DEVICE'S GPU POWER, not screen size.
 * A large 4K monitor with a weak GPU gets lower quality.
 * A small phone with a powerful GPU gets full quality.
 *
 * Tiers:
 *   "high"   → Full quality (4K textures, 4× MSAA, full anisotropy)
 *   "medium" → Reduced quality (2K textures, 2× MSAA)
 *   "low"    → Minimum quality (1K textures, no MSAA, low anisotropy)
 */

export type GpuTier = "high" | "medium" | "low";

let cachedTier: GpuTier | null = null;

/**
 * `?gpu=low` (or medium / high) forces the tier for the whole session.
 *
 * There is no other way to SEE what a weak device gets: the tier decides how
 * much of the page-texture ladder runs (`PageTextureLod`), and the only honest
 * way to check that a phone still gets a sharp sheet when it zooms is to make a
 * desktop behave like one. Read once, at the same moment detection would have
 * run, so everything downstream is consistent for the life of the page.
 */
function readForcedTier(): GpuTier | null {
  if (typeof window === "undefined") return null;
  const asked = new URLSearchParams(window.location.search).get("gpu");
  return asked === "low" || asked === "medium" || asked === "high"
    ? asked
    : null;
}

/**
 * Flattens a renderer string down to just the words that name the chip.
 *
 * THIS IS WHY WINDOWS LOOKED WORSE THAN MAC. Chrome on Windows does not report
 * a bare chip name — it reports what ANGLE saw, wrapped and doubled:
 *
 *   "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)"
 *
 * A pattern like `nvidia (rtx|gtx …)` cannot match that, because "GeForce" sits
 * between the two words — so EVERY NVIDIA card on Windows failed the high-end
 * test and fell to "medium", while an Apple M-series (reported plainly) passed.
 * The tier is not cosmetic: it caps how sharply text is rasterised
 * (`CanvasText`), so the mismatch showed up as permanently blurrier script on
 * Windows that no amount of zooming could recover.
 *
 * The fix is to stop matching prose. Strip the ANGLE wrapper, the `(R)`/`(TM)`
 * marks, the Direct3D shader-model tail and all punctuation, leaving a plain
 * word list that both the weak and the high-end patterns can be written
 * against.
 */
function normalizeRenderer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\((r|tm)\)/g, "")
    .replace(/\b(direct3d|d3d)\d*\b/g, " ")
    .replace(/\b[vp]s_\d+_\d+\b/g, " ")
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect GPU tier once and cache the result.
 * Uses WebGL renderer/vendor strings + maxTextureSize as heuristics.
 * Falls back to "medium" when detection is unavailable (SSR, etc.).
 */
export function detectGpuTier(): GpuTier {
  if (cachedTier) return cachedTier;
  if (typeof window === "undefined") return "medium";

  const forced = readForcedTier();
  if (forced) {
    cachedTier = forced;
    return cachedTier;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);

    if (!gl) {
      cachedTier = "low";
      return cachedTier;
    }

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

    // Try to get the unmasked renderer string for better heuristics
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext
      ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string)
      : "";
    const rendererLower = normalizeRenderer(renderer);

    // Known weak / integrated GPU patterns. Matched against the normalized
    // string, so "Intel(R) UHD Graphics 620" and the ANGLE-wrapped form of it
    // both land here.
    const isWeakGpu =
      /intel (hd|uhd|iris) graphics (400|500|510|520|530|600|610|615|620|630)/.test(rendererLower) ||
      /mali-[gt][0-9]{2,3}([^0-9]|$)/.test(rendererLower) ||
      /adreno (3[0-9]{2}|4[0-9]{2}|505|506|508|509|510|512)/.test(rendererLower) ||
      /powervr (sgx|ge8[0-9]{2})/.test(rendererLower) ||
      rendererLower.includes("llvmpipe") ||
      rendererLower.includes("swiftshader") ||
      rendererLower.includes("software");

    // Known high-end GPU patterns. The model number is matched on its OWN
    // rather than after the vendor, because the vendor is not reliably next to
    // it — see `normalizeRenderer`.
    const isHighEndGpu =
      /\brtx\b/.test(rendererLower) ||
      /\bgtx (10[6-9]\d|1[6-9]\d\d)\b/.test(rendererLower) ||
      /radeon (rx [5-9]|pro (5[5-9]|6|7))/.test(rendererLower) ||
      /apple m[1-9]/.test(rendererLower) ||
      /adreno (6[4-9][0-9]|7[0-9]{2})/.test(rendererLower) ||
      /mali-g7[0-9]/.test(rendererLower) ||
      rendererLower.includes("apple gpu");

    // High-end is decided FIRST because the two families overlap by name: a
    // Mali-G78 is a flagship, but it also answers to the "mali-g<two digits>"
    // shape that catches the weak G51/G52. Whichever test runs first wins, and
    // being generous to a strong chip is the cheaper mistake.
    if (isHighEndGpu && maxTextureSize >= 8192) {
      cachedTier = "high";
    } else if (isWeakGpu || maxTextureSize < 4096) {
      cachedTier = "low";
    } else {
      cachedTier = "medium";
    }
  } catch {
    cachedTier = "medium";
  }

  return cachedTier;
}

/**
 * Quick capability check: does this browser/device expose a WebGL context at
 * all? Distinct from `detectGpuTier`, which assumes WebGL exists and only
 * grades how powerful it is — this answers a prior yes/no question so
 * callers can show a fallback instead of silently mounting a dead <canvas>.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") || canvas.getContext("webgl")
    );
  } catch {
    return false;
  }
}

/** Convenience booleans for common checks */
export const gpuTier = {
  get value(): GpuTier {
    return detectGpuTier();
  },
  get isLow(): boolean {
    return detectGpuTier() === "low";
  },
  get isMedium(): boolean {
    return detectGpuTier() === "medium";
  },
  get isHigh(): boolean {
    return detectGpuTier() === "high";
  },
  /** True when the device cannot comfortably handle full-quality 4K offscreen textures */
  get needsQualityReduction(): boolean {
    return detectGpuTier() !== "high";
  },
};
