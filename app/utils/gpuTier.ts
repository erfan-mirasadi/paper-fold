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
 * Detect GPU tier once and cache the result.
 * Uses WebGL renderer/vendor strings + maxTextureSize as heuristics.
 * Falls back to "medium" when detection is unavailable (SSR, etc.).
 */
export function detectGpuTier(): GpuTier {
  if (cachedTier) return cachedTier;
  if (typeof window === "undefined") return "medium";

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
    const rendererLower = renderer.toLowerCase();

    // Known weak / integrated GPU patterns
    const isWeakGpu =
      /intel (hd|uhd|iris) graphics (400|500|510|520|530|600|610|615|620|630)/i.test(renderer) ||
      /mali-[gt][0-9]{2,3}[^0-9]/i.test(renderer) ||
      /adreno (3[0-9]{2}|4[0-9]{2}|505|506|508|509|510|512)/i.test(renderer) ||
      /powervr (sgx|ge8[0-9]{2})/i.test(renderer) ||
      rendererLower.includes("llvmpipe") ||
      rendererLower.includes("swiftshader") ||
      rendererLower.includes("software");

    // Known high-end GPU patterns
    const isHighEndGpu =
      /nvidia (rtx|gtx (10[6-9]|20|30|40))/i.test(renderer) ||
      /radeon (rx [5-9]|pro (5[5-9]|6|7))/i.test(renderer) ||
      /apple m[1-9]/i.test(renderer) ||
      /adreno (6[4-9][0-9]|7[0-9]{2})/i.test(renderer) ||
      /mali-g7[0-9]/i.test(renderer) ||
      rendererLower.includes("apple gpu");

    if (isWeakGpu || maxTextureSize < 4096) {
      cachedTier = "low";
    } else if (isHighEndGpu && maxTextureSize >= 8192) {
      cachedTier = "high";
    } else {
      cachedTier = "medium";
    }
  } catch {
    cachedTier = "medium";
  }

  return cachedTier;
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
