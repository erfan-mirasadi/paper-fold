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

      // ── CUSTOM SECTIONS: bounds from union of verse transforms ────────
      if (vSec.customSections && vSec.customSections.length > 0) {
        const cs = vSec.customSections.find((c) => c.id === sectionId);
        if (cs) {
          let minX = Infinity, maxX = -Infinity;
          let minY = Infinity, maxY = -Infinity;
          const groups = sTransform.groups || [];

          // Find all verse transforms across groups for this custom section
          for (const group of groups) {
            for (const vId of cs.verseIds) {
              const vt = group.verses?.[vId];
              if (!vt) continue;
              minX = Math.min(minX, vt.x);
              maxX = Math.max(maxX, vt.x + vt.w);
              minY = Math.min(minY, vt.y - vt.h);
              maxY = Math.max(maxY, vt.y);
            }
          }

          if (minX !== Infinity) {
            return {
              minX: minX - pageWidth / 2 - BOUNDS_PAD,
              maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
              maxY: maxY + BOUNDS_PAD,
              minY: minY - BOUNDS_PAD,
            };
          }
        }

        // Parent section ID → return the whole frame bounds encompassing all groups.
        // Used by custom-section verses so they snap to the parent frame area (not their
        // own tight verse bounds), giving a much more forgiving drag-and-release feel.
        if (sectionId === sec.id) {
          let minX = Infinity, maxX = -Infinity;
          let minY = Infinity, maxY = -Infinity;
          const groups = sTransform.groups || [];
          for (const group of groups) {
            minX = Math.min(minX, group.frameX);
            maxX = Math.max(maxX, group.frameX + group.frameW);
            minY = Math.min(minY, group.frameY - group.frameH);
            maxY = Math.max(maxY, group.frameY);
          }
          if (minX !== Infinity) {
            return {
              minX: minX - pageWidth / 2 - BOUNDS_PAD,
              maxX: maxX - pageWidth / 2 + BOUNDS_PAD,
              maxY: maxY + BOUNDS_PAD,
              minY: minY - BOUNDS_PAD,
            };
          }
        }

        continue;
      }

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
