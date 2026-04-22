"use client";

import { ThreeEvent } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry } from "three";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_DATA,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../elevated-verses/useElevatedStore";
import { useDragState } from "../elevated-verses/drag/dragEngine";

const hitBoxMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const hitBoxGeom = new PlaneGeometry(1, 1);

interface VerseHitbox {
  key: string;
  cx: number;
  cy: number;
  cz: number;
  w: number;
  h: number;
  kind: "verse" | "section";
  verseId?: number;
  sectionId?: ElevatedSectionId;
  verseIds?: number[];
}

const SECTION_VERSE_IDS: Record<ElevatedSectionId, number[]> = {
  s1: [1, 2, 3, 4, 5],
  s2_top: [6, 7, 8, 9, 10],
  s2_bottom: [15, 16, 17, 18, 19],
  s2_center: [11, 12, 13, 14],
};

const LABEL_HITBOX = {
  width: 0.43,
  height: 0.07,
};

function buildHitboxes(): VerseHitbox[] {
  const hitboxes: VerseHitbox[] = [];
  const zFront = PAGE_DEPTH / 2 + 0.003;
  const zSection = zFront - 0.0008;

  const s1 = SURAH_TRANSFORMS.s1;
  SURAH_DATA.section1.gridVerses.forEach((v) => {
    const vt = s1.verses[v.number];
    if (!vt) return;
    hitboxes.push({
      key: `verse-${v.number}`,
      cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
      cy: vt.y - vt.h / 2,
      cz: zFront,
      w: vt.w,
      h: vt.h,
      kind: "verse",
      verseId: v.number,
    });
  });

  const anaAyet = s1.anaAyet;
  hitboxes.push({
    key: `verse-${SURAH_DATA.section1.anaAyet.number}`,
    cx: anaAyet.x + anaAyet.w / 2 - PAGE_WIDTH / 2,
    cy: anaAyet.y - anaAyet.h / 2,
    cz: zFront,
    w: anaAyet.w,
    h: anaAyet.h,
    kind: "verse",
    verseId: SURAH_DATA.section1.anaAyet.number,
  });

  // Section 1 label hitbox -> elevate verses 1..5 together.
  hitboxes.push({
    key: "section-s1-label",
    cx: PAGE_WIDTH / 2 - PAGE_WIDTH / 2,
    cy: s1.labelPinY,
    cz: zFront,
    w: LABEL_HITBOX.width,
    h: LABEL_HITBOX.height,
    kind: "section",
    sectionId: "s1",
    verseIds: SECTION_VERSE_IDS.s1,
  });

  const s2 = SURAH_TRANSFORMS.s2;
  const intro = s2.introVerse;
  hitboxes.push({
    key: `verse-${SURAH_DATA.section2.introVerse.number}`,
    cx: intro.x + intro.w / 2 - PAGE_WIDTH / 2,
    cy: intro.y - intro.h / 2,
    cz: zFront,
    w: intro.w,
    h: intro.h,
    kind: "verse",
    verseId: SURAH_DATA.section2.introVerse.number,
  });

  SURAH_DATA.section2.colorGroups.forEach((group, gIdx) => {
    const gTransform = s2.groups[gIdx];
    group.verses.forEach((v) => {
      const vt = gTransform.verses[v.number];
      if (!vt) return;
      hitboxes.push({
        key: `verse-${v.number}`,
        cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
        cy: vt.y - vt.h / 2,
        cz: zFront,
        w: vt.w,
        h: vt.h,
        kind: "verse",
        verseId: v.number,
      });
    });
  });

  const outro = s2.outroVerse;
  hitboxes.push({
    key: `verse-${SURAH_DATA.section2.outroVerse.number}`,
    cx: outro.x + outro.w / 2 - PAGE_WIDTH / 2,
    cy: outro.y - outro.h / 2,
    cz: zFront,
    w: outro.w,
    h: outro.h,
    kind: "verse",
    verseId: SURAH_DATA.section2.outroVerse.number,
  });

  // Section 2 labels -> elevate top and bottom 5-verse sections.
  hitboxes.push({
    key: "section-s2-top-label",
    cx: PAGE_WIDTH / 2 - PAGE_WIDTH / 2,
    cy: s2.topLabelPinY,
    cz: zFront,
    w: LABEL_HITBOX.width,
    h: LABEL_HITBOX.height,
    kind: "section",
    sectionId: "s2_top",
    verseIds: SECTION_VERSE_IDS.s2_top,
  });

  // Direct top hollow area click target (behind verse hitboxes).
  hitboxes.push({
    key: "section-s2-top-hollow",
    cx: s2.connectorX + s2.connectorW / 2 - PAGE_WIDTH / 2,
    cy: s2.topConnectorY - s2.topConnectorH / 2,
    cz: zSection,
    w: s2.connectorW,
    h: s2.topConnectorH,
    kind: "section",
    sectionId: "s2_top",
    verseIds: SECTION_VERSE_IDS.s2_top,
  });

  hitboxes.push({
    key: "section-s2-bottom-label",
    cx: PAGE_WIDTH / 2 - PAGE_WIDTH / 2,
    cy: s2.bottomLabelPinY,
    cz: zFront,
    w: LABEL_HITBOX.width,
    h: LABEL_HITBOX.height,
    kind: "section",
    sectionId: "s2_bottom",
    verseIds: SECTION_VERSE_IDS.s2_bottom,
  });

  // Direct bottom hollow area click target (behind verse hitboxes).
  hitboxes.push({
    key: "section-s2-bottom-hollow",
    cx: s2.connectorX + s2.connectorW / 2 - PAGE_WIDTH / 2,
    cy: s2.bottomConnectorY - s2.bottomConnectorH / 2,
    cz: zSection,
    w: s2.connectorW,
    h: s2.bottomConnectorH,
    kind: "section",
    sectionId: "s2_bottom",
    verseIds: SECTION_VERSE_IDS.s2_bottom,
  });

  // Middle curves (left + right) -> elevate verses 11..14 together.
  const middleGroup = s2.groups[1];
  const middleTop = middleGroup.frameY + 0.01;
  const middleBottom = middleGroup.frameY - middleGroup.frameH - 0.01;
  const middleHeight = middleTop - middleBottom;
  const middleCenterY = (middleTop + middleBottom) / 2;

  // Direct center hollow click target (behind verse hitboxes).
  hitboxes.push({
    key: "section-s2-center-hollow",
    cx: middleGroup.frameX + middleGroup.frameW / 2 - PAGE_WIDTH / 2,
    cy: middleGroup.frameY - middleGroup.frameH / 2,
    cz: zSection,
    w: middleGroup.frameW,
    h: middleGroup.frameH,
    kind: "section",
    sectionId: "s2_center",
    verseIds: SECTION_VERSE_IDS.s2_center,
  });

  const curveZoneW = 0.31;
  const leftCurveX = s2.baseX - 0.33;
  const rightCurveX = s2.baseX + s2.innerW + 0.02;

  hitboxes.push(
    {
      key: "section-s2-center-curves-left",
      cx: leftCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
      cy: middleCenterY,
      cz: zFront,
      w: curveZoneW,
      h: middleHeight,
      kind: "section",
      sectionId: "s2_center",
      verseIds: SECTION_VERSE_IDS.s2_center,
    },
    {
      key: "section-s2-center-curves-right",
      cx: rightCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
      cy: middleCenterY,
      cz: zFront,
      w: curveZoneW,
      h: middleHeight,
      kind: "section",
      sectionId: "s2_center",
      verseIds: SECTION_VERSE_IDS.s2_center,
    },
  );

  return hitboxes;
}

const HITBOXES = buildHitboxes();

const canUseElevatedInteraction = (
  kind?: string,
  verseId?: number,
  verseIds?: number[],
) => {
  const unlocked = useElevatedStore.getState().unlockedVerseIds;
  if (kind === "verse" && typeof verseId === "number") {
    return unlocked.includes(verseId);
  }
  if (kind === "section" && Array.isArray(verseIds)) {
    return verseIds.some((id) => unlocked.includes(id));
  }
  return false;
};

const handleClick = (e: ThreeEvent<MouseEvent>) => {
  const { kind, verseId, verseIds, sectionId } = e.object.userData;
  if (!canUseElevatedInteraction(kind, verseId, verseIds)) return;

  e.stopPropagation();
  if (e.delta > 2) return;

  const { activeVerseIds } = useElevatedStore.getState();
  const { draggedVerseIds, draggedSectionIds } = useDragState.getState();

  if (kind === "verse" && typeof verseId === "number") {
    const isActive = activeVerseIds.includes(verseId);
    const isDragged = draggedVerseIds.includes(verseId);
    if (isActive && isDragged) return;
    useElevatedStore.getState().elevateVerse(verseId);
    return;
  }

  if (kind === "section" && Array.isArray(verseIds) && verseIds.length > 0) {
    const validSectionId =
      typeof sectionId === "string" && sectionId in SECTION_VERSE_IDS
        ? (sectionId as ElevatedSectionId)
        : undefined;

    const allSelected = verseIds.every((id) => activeVerseIds.includes(id));
    const isDragged = validSectionId ? draggedSectionIds.includes(validSectionId) : false;
    
    if (allSelected && isDragged) return;

    useElevatedStore.getState().elevateVerses(verseIds, validSectionId);
  }
};

export function VerseClickHitboxes() {
  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {HITBOXES.map((hb) => (
        <mesh
          key={`hitbox-${hb.key}`}
          position={[hb.cx, hb.cy, hb.cz]}
          scale={[hb.w, hb.h, 1]}
          userData={{
            kind: hb.kind,
            verseId: hb.verseId,
            sectionId: hb.sectionId,
            verseIds: hb.verseIds,
          }}
          onClick={handleClick}
          geometry={hitBoxGeom}
          material={hitBoxMaterial}
        />
      ))}
    </group>
  );
}
