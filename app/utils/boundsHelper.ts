import { SurahTransforms } from "../data/SurahConfig";
import { SectionTransforms, VerticalGroupsSectionConfig, GridSectionConfig } from "../data/schema";
import { getActiveStoryConfig } from "../stores/useStoryStore";

export type SectionBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const BOUNDS_PAD = 0.06;

export function calculateSectionBounds(
  sectionId: string,
  transforms: SurahTransforms,
  pageWidth: number,
): SectionBounds {
  const config = getActiveStoryConfig();

  // ── Check each section in the config ────────────────────────────────────
  for (let secIdx = 0; secIdx < config.sections.length; secIdx++) {
    const sec = config.sections[secIdx];
    const sTransform = transforms.sections[secIdx] as Required<SectionTransforms>;

    // ── gridWithAnaAyet: simple frame bounds ──────────────────────────────
    if (sec.type === "gridWithAnaAyet") {
      if (sectionId === sec.id) {
        return {
          minX: sTransform.frameX - pageWidth / 2 - BOUNDS_PAD,
          maxX: sTransform.frameX - pageWidth / 2 + sTransform.frameW + BOUNDS_PAD,
          maxY: sTransform.frameY + BOUNDS_PAD,
          minY: sTransform.frameY - sTransform.frameH - BOUNDS_PAD,
        };
      }
    }

    // ── verticalGroups ────────────────────────────────────────────────────
    if (sec.type === "verticalGroups") {
      const vSec = sec as VerticalGroupsSectionConfig;
      const isUnified = vSec.groupElevation === "unified";

      if (isUnified) {
        // UNIFIED: sectionId is the raw section ID (e.g., "section2")
        if (sectionId === sec.id) {
          // Combine bounds from ALL groups
          let minX = Infinity, maxX = -Infinity;
          let minY = Infinity, maxY = -Infinity;

          const groups = sTransform.groups || [];
          groups.forEach((group) => {
            minX = Math.min(minX, group.frameX);
            maxX = Math.max(maxX, group.frameX + group.frameW);
            minY = Math.min(minY, group.frameY - group.frameH);
            maxY = Math.max(maxY, group.frameY);

            if (group.rowConnectors) {
              group.rowConnectors.forEach((rc: any) => {
                minX = Math.min(minX, rc.x);
                maxX = Math.max(maxX, rc.x + rc.w);
                minY = Math.min(minY, rc.y - rc.h);
                maxY = Math.max(maxY, rc.y);
              });
            }
          });

          return {
            minX: minX - pageWidth / 2 - BOUNDS_PAD,
            maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
            maxY: maxY + BOUNDS_PAD,
            minY: minY - BOUNDS_PAD,
          };
        }
      } else {
        // PER-GROUP: sectionId is "{sectionId}_g{idx}"
        if (sectionId.startsWith(`${sec.id}_g`)) {
          const index = parseInt(sectionId.split("_g")[1], 10);
          const groups = sTransform.groups || [];
          const group = groups[index];
          if (!group) return undefined as any;

          let minX = group.frameX;
          let maxX = group.frameX + group.frameW;
          let minY = group.frameY - group.frameH;
          let maxY = group.frameY;

          if (group.rowConnectors && group.rowConnectors.length > 0) {
            minX = Math.min(minX, ...group.rowConnectors.map((rc: any) => rc.x));
            maxX = Math.max(maxX, ...group.rowConnectors.map((rc: any) => rc.x + rc.w));
            minY = Math.min(minY, ...group.rowConnectors.map((rc: any) => rc.y - rc.h));
            maxY = Math.max(maxY, ...group.rowConnectors.map((rc: any) => rc.y));
          }

          return {
            minX: minX - pageWidth / 2 - BOUNDS_PAD,
            maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
            maxY: maxY + BOUNDS_PAD,
            minY: minY - BOUNDS_PAD,
          };
        }
      }
    }
  }

  return undefined as any;
}
