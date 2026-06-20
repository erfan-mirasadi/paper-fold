import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import type { useSurahLayoutRuntime } from "../../../../hooks/useSurahLayoutRuntime";
import type { ElevatedSectionId } from "../../../../stores/useElevatedStore";

type RuntimeLayout = Pick<
  ReturnType<typeof useSurahLayoutRuntime>,
  "PAGE_WIDTH" | "SURAH_TRANSFORMS"
>;

const TOP_LABEL_BODY_H = 0.046;
const TOP_LABEL_BORDER = 0.004;

/** Y offset from `labelPinY` → top rim of elevated pill (matches `TopLabel` stack). */
export const LABEL_GUIDE_TOP_OFFSET_Y = TOP_LABEL_BODY_H / 2 + TOP_LABEL_BORDER;

const GUIDE_FRONT_Z_BIAS = 0.002;

/**
 * Anchor in lifted label group's local frame (same `a.group` as `TopLabel`).
 * Use for future animation hooks / Theatre without duplicating layout math.
 */
export function introGuideAnchorInLabelLiftGroup(
  PAGE_WIDTH: number,
  pinY: number,
  labelZ: number,
): [number, number, number] {
  return [
    PAGE_WIDTH,
    pinY + LABEL_GUIDE_TOP_OFFSET_Y,
    labelZ + GUIDE_FRONT_Z_BIAS,
  ];
}

export function introGuideCenterAnchorSceneLocal(
  layout: RuntimeLayout,
  sectionId: string,
): [number, number, number] {
  let index = 1;
  const match = sectionId.match(/_g(\d+)$/);
  if (match) {
    index = parseInt(match[1], 10);
  }

  const groups = layout.SURAH_TRANSFORMS.sections[1]?.groups;
  const g = groups?.[index] || groups?.[1];

  const x = layout.PAGE_WIDTH / 2; // Right edge of the frame
  const y = g ? g.frameY : 0; // Top of the frame
  const z = PAGE_DEPTH / 2 + 0.003;
  return [x, y, z];
}

/** DOM id for `IntroSectionGuidesOverlay` rows (must match overlay markup). */
export function introGuideMarkerDomId(sectionId: ElevatedSectionId): string {
  return `intro-section-guide-marker-${sectionId}`;
}
