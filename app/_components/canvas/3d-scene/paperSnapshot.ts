/**
 * paperSnapshot — hands the LIVE paper's material and dimensions to the
 * page-turn transition sheet.
 *
 * No texture is copied. The transition sheet flies while the outgoing scene
 * content is still fully mounted, so it shares the paper's real material
 * instance (same shader, same masking, same normal map, same lighting) — a
 * pixel-perfect match by construction, with zero capture cost.
 *
 * The sheet always starts FLAT: the switch choreography first lets the real
 * paper smoothly unfold (the "flatten" phase), so the sheet never interacts
 * with fold crease lines. `maxFoldAngle` tells the store whether that
 * flatten phase can be skipped.
 */

import type { MeshStandardMaterial } from "three";

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
  /**
   * The LIVE shared material of the outgoing paper. Valid for exactly as
   * long as the old content stays mounted — the store guarantees the sheet
   * is unmounted in the same commit that swaps the content.
   */
  material: MeshStandardMaterial;
  /** Largest fold rotation at capture time — ~0 means already flat. */
  maxFoldAngle: number;
  pageWidth: number;
  pageHeight: number;
  sceneCenterY: number;
}

// ---------------------------------------------------------------------------
// Registry — the live SinglePaper registers itself; usePaperStore captures.
// ---------------------------------------------------------------------------

let activeSource: PaperSnapshotSource | null = null;

export function registerPaperSnapshotSource(source: PaperSnapshotSource): void {
  activeSource = source;
}

export function unregisterPaperSnapshotSource(
  source: PaperSnapshotSource,
): void {
  if (activeSource === source) {
    activeSource = null;
  }
}

/**
 * Capture the outgoing paper at the moment a switch starts. Returns null when
 * there is nothing usable (no live paper yet) — callers fall back to the
 * overlay-covered switch.
 */
export function capturePaperTransition(): PaperTransitionCapture | null {
  const source = activeSource;
  if (!source) return null;

  const material = source.getMaterial();
  if (!material || !material.map) return null;

  const boneRotations = source.getBoneRotations();
  if (!boneRotations) return null;

  let maxFoldAngle = 0;
  for (let i = 0; i < boneRotations.length; i++) {
    maxFoldAngle = Math.max(maxFoldAngle, Math.abs(boneRotations[i]));
  }

  return {
    material,
    maxFoldAngle,
    pageWidth: source.pageWidth,
    pageHeight: source.pageHeight,
    sceneCenterY: source.sceneCenterY,
  };
}
