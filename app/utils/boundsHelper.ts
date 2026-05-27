import { SurahTransforms } from "../data/SurahConfig";

export type SectionBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const BOUNDS_PAD = 0.06;

export function calculateSectionBounds(
  sectionId: "s1" | "s2_top" | "s2_center" | "s2_bottom",
  transforms: SurahTransforms,
  pageWidth: number,
): SectionBounds {
  const { s1, s2 } = transforms;

  switch (sectionId) {
    case "s1":
      return {
        minX: s1.frameX - pageWidth / 2 - BOUNDS_PAD,
        maxX: s1.frameX - pageWidth / 2 + s1.frameW + BOUNDS_PAD,
        maxY: s1.frameY + BOUNDS_PAD,
        minY: s1.frameY - s1.frameH - BOUNDS_PAD,
      };
    case "s2_top": {
      const outerY = s2.topConnectorY;
      const outerH = s2.topConnectorH;
      const outerX = s2.connectorX - s2.borderWidth;
      const outerW = s2.connectorW + s2.borderWidth * 2;
      const rcs = s2.groups[0].rowConnectors;
      const rcMinY =
        rcs.length > 0
          ? Math.min(...rcs.map((rc) => rc.y - rc.h))
          : outerY - outerH;

      return {
        minX: outerX - pageWidth / 2 - BOUNDS_PAD,
        maxX: outerX - pageWidth / 2 + outerW + BOUNDS_PAD,
        maxY: outerY + BOUNDS_PAD,
        minY: Math.min(outerY - outerH, rcMinY) - BOUNDS_PAD,
      };
    }
    case "s2_center": {
      const rcs = s2.groups[1].rowConnectors;
      if (rcs.length === 0) {
        return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
      }
      const topY = Math.max(...rcs.map((rc) => rc.y));
      const botY = Math.min(...rcs.map((rc) => rc.y - rc.h));
      const leftX = Math.min(...rcs.map((rc) => rc.x));
      const rightX = Math.max(...rcs.map((rc) => rc.x + rc.w));

      return {
        minX: leftX - pageWidth / 2 - BOUNDS_PAD,
        maxX: rightX - pageWidth / 2 + BOUNDS_PAD,
        maxY: topY + BOUNDS_PAD,
        minY: botY - BOUNDS_PAD,
      };
    }
    case "s2_bottom": {
      const outerY = s2.bottomConnectorY;
      const outerH = s2.bottomConnectorH;
      const outerX = s2.connectorX - s2.borderWidth;
      const outerW = s2.connectorW + s2.borderWidth * 2;
      const rcs = s2.groups[2].rowConnectors;
      const rcMaxY =
        rcs.length > 0 ? Math.max(...rcs.map((rc) => rc.y)) : outerY;

      return {
        minX: outerX - pageWidth / 2 - BOUNDS_PAD,
        maxX: outerX - pageWidth / 2 + outerW + BOUNDS_PAD,
        maxY: Math.max(outerY, rcMaxY) + BOUNDS_PAD,
        minY: outerY - outerH - BOUNDS_PAD,
      };
    }
  }
}
