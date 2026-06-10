import { SurahTransforms } from "../data/SurahConfig";
import { SectionTransforms, RowConnectorTransform } from "../data/schema";
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
  const s1 = transforms.sections[0] as Required<SectionTransforms>;
  const s2 = transforms.sections[1] as Required<SectionTransforms> | undefined;

  const S1_ID = getActiveStoryConfig().sections[0]?.id ?? "section1";
  const S2_ID = getActiveStoryConfig().sections[1]?.id ?? "__no_s2__";
  const S2_TOP_ID = `${S2_ID}_top`;
  const S2_CENTER_ID = `${S2_ID}_center`;
  const S2_BOTTOM_ID = `${S2_ID}_bottom`;

  // Guard: if section 2 does not exist, fall straight to default (full-screen bounds).
  if (!s2) {
    if (sectionId === S1_ID) {
      return {
        minX: s1.frameX - pageWidth / 2 - BOUNDS_PAD,
        maxX: s1.frameX - pageWidth / 2 + s1.frameW + BOUNDS_PAD,
        maxY: s1.frameY + BOUNDS_PAD,
        minY: s1.frameY - s1.frameH - BOUNDS_PAD,
      };
    }
    return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
  }

  switch (sectionId) {
    case S1_ID:
      return {
        minX: s1.frameX - pageWidth / 2 - BOUNDS_PAD,
        maxX: s1.frameX - pageWidth / 2 + s1.frameW + BOUNDS_PAD,
        maxY: s1.frameY + BOUNDS_PAD,
        minY: s1.frameY - s1.frameH - BOUNDS_PAD,
      };
    case S2_TOP_ID: {
      const outerY = s2.topConnectorY;
      const outerH = s2.topConnectorH;
      const outerX = s2.connectorX - s2.borderWidth;
      const outerW = s2.connectorW + s2.borderWidth * 2;
      const rcs = s2.groups[0].rowConnectors;
      const rcMinY =
        rcs.length > 0
          ? Math.min(...rcs.map((rc: RowConnectorTransform) => rc.y - rc.h))
          : outerY - outerH;

      return {
        minX: outerX - pageWidth / 2 - BOUNDS_PAD,
        maxX: outerX - pageWidth / 2 + outerW + BOUNDS_PAD,
        maxY: outerY + BOUNDS_PAD,
        minY: Math.min(outerY - outerH, rcMinY) - BOUNDS_PAD,
      };
    }
    case S2_CENTER_ID: {
      const rcs = s2.groups[1].rowConnectors;
      if (rcs.length === 0) {
        return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
      }
      const topY = Math.max(...rcs.map((rc: RowConnectorTransform) => rc.y));
      const botY = Math.min(...rcs.map((rc: RowConnectorTransform) => rc.y - rc.h));
      const leftX = Math.min(...rcs.map((rc: RowConnectorTransform) => rc.x));
      const rightX = Math.max(...rcs.map((rc: RowConnectorTransform) => rc.x + rc.w));

      return {
        minX: leftX - pageWidth / 2 - BOUNDS_PAD,
        maxX: rightX - pageWidth / 2 + BOUNDS_PAD,
        maxY: topY + BOUNDS_PAD,
        minY: botY - BOUNDS_PAD,
      };
    }
    case S2_BOTTOM_ID: {
      const outerY = s2.bottomConnectorY;
      const outerH = s2.bottomConnectorH;
      const outerX = s2.connectorX - s2.borderWidth;
      const outerW = s2.connectorW + s2.borderWidth * 2;
      const rcs = s2.groups[2].rowConnectors;
      const rcMaxY =
        rcs.length > 0 ? Math.max(...rcs.map((rc: RowConnectorTransform) => rc.y)) : outerY;

      return {
        minX: outerX - pageWidth / 2 - BOUNDS_PAD,
        maxX: outerX - pageWidth / 2 + outerW + BOUNDS_PAD,
        maxY: Math.max(outerY, rcMaxY) + BOUNDS_PAD,
        minY: outerY - outerH - BOUNDS_PAD,
      };
    }
    default:
      return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
  }
}
