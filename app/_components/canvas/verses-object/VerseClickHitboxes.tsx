"use client";
import { useMemo } from "react";
import { SectionTransforms } from "../../../data/schema";
import { ThreeEvent } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry } from "three";
import { SURAH_DATA_ARABIC } from "../../../data/surahData";
import { useStoryStore } from "../../../stores/useStoryStore";
import { GridSectionConfig, VerticalGroupsSectionConfig, SurahLayoutConfig } from "../../../data/schema";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../../../stores/useElevatedStore";
import { useDragState } from "../../../utils/dragEngine";

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
  sectionId?: string;
  verseIds?: number[];
}

const LABEL_HITBOX = {
  width: 0.43,
  height: 0.07,
};

function buildHitboxes(
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
  config: SurahLayoutConfig<any>
): VerseHitbox[] {
  const hitboxes: VerseHitbox[] = [];
  const zFront = PAGE_DEPTH / 2 + 0.003;
  const zSection = zFront - 0.0008;

  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  config.sections.forEach((sectionConfig, idx) => {
    const sTransform = SURAH_TRANSFORMS.sections[idx] as Required<SectionTransforms>;
    
    if (sectionConfig.type === "gridWithAnaAyet") {
      const gConfig = sectionConfig as GridSectionConfig;
      
      // Add verses hitboxes
      gConfig.verses.forEach((vId) => {
        const vt = sTransform.verses[vId];
        if (!vt) return;
        hitboxes.push({
          key: `verse-${vId}`,
          cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
          cy: vt.y - vt.h / 2,
          cz: zFront,
          w: vt.w,
          h: vt.h,
          kind: "verse",
          verseId: vId,
        });
      });

      // AnaAyet hitbox
      const anaAyet = sTransform.anaAyet;
      hitboxes.push({
        key: `verse-${gConfig.anaAyet}`,
        cx: anaAyet.x + anaAyet.w / 2 - PAGE_WIDTH / 2,
        cy: anaAyet.y - anaAyet.h / 2,
        cz: zFront,
        w: anaAyet.w,
        h: anaAyet.h,
        kind: "verse",
        verseId: gConfig.anaAyet,
      });

      // Section label hitbox
      hitboxes.push({
        key: `section-${gConfig.id}-label`,
        cx: 0,
        cy: sTransform.labelPinY,
        cz: zFront,
        w: LABEL_HITBOX.width,
        h: LABEL_HITBOX.height,
        kind: "section",
        sectionId: gConfig.id,
        verseIds: [...gConfig.verses, gConfig.anaAyet],
      });

    } else if (sectionConfig.type === "verticalGroups") {
      const vConfig = sectionConfig as VerticalGroupsSectionConfig;

      // Intro
      if (vConfig.introVerse && sTransform.introVerse) {
        const intro = sTransform.introVerse;
        hitboxes.push({
          key: `verse-${vConfig.introVerse}`,
          cx: intro.x + intro.w / 2 - PAGE_WIDTH / 2,
          cy: intro.y - intro.h / 2,
          cz: zFront,
          w: intro.w,
          h: intro.h,
          kind: "verse",
          verseId: vConfig.introVerse,
        });
      }

      // Outro
      if (vConfig.outroVerse && sTransform.outroVerse) {
        const outro = sTransform.outroVerse;
        hitboxes.push({
          key: `verse-${vConfig.outroVerse}`,
          cx: outro.x + outro.w / 2 - PAGE_WIDTH / 2,
          cy: outro.y - outro.h / 2,
          cz: zFront,
          w: outro.w,
          h: outro.h,
          kind: "verse",
          verseId: vConfig.outroVerse,
        });
      }

      // Groups
      vConfig.groups.forEach((group, gIdx) => {
        const gTransform = sTransform.groups[gIdx];
        group.verseIds.forEach((vId) => {
          const vt = gTransform.verses[vId];
          if (!vt) return;
          hitboxes.push({
            key: `verse-${vId}`,
            cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
            cy: vt.y - vt.h / 2,
            cz: zFront,
            w: vt.w,
            h: vt.h,
            kind: "verse",
            verseId: vId,
          });
        });
      });

      const topId = `${vConfig.id}_top`;
      const centerId = `${vConfig.id}_center`;
      const bottomId = `${vConfig.id}_bottom`;

      const topVerseIds: number[] = [];
      if (vConfig.introVerse) topVerseIds.push(vConfig.introVerse);
      if (vConfig.groups[0]) topVerseIds.push(...vConfig.groups[0].verseIds);

      const centerVerseIds = vConfig.groups[1] ? [...vConfig.groups[1].verseIds] : [];

      const bottomVerseIds: number[] = [];
      if (vConfig.groups[2]) bottomVerseIds.push(...vConfig.groups[2].verseIds);
      if (vConfig.outroVerse) bottomVerseIds.push(vConfig.outroVerse);

      // Top label
      hitboxes.push({
        key: `section-${topId}-label`,
        cx: 0,
        cy: sTransform.topLabelPinY,
        cz: zFront,
        w: LABEL_HITBOX.width,
        h: LABEL_HITBOX.height,
        kind: "section",
        sectionId: topId,
        verseIds: topVerseIds,
      });

      // Top hollow
      hitboxes.push({
        key: `section-${topId}-hollow`,
        cx: sTransform.connectorX + sTransform.connectorW / 2 - PAGE_WIDTH / 2,
        cy: sTransform.topConnectorY - sTransform.topConnectorH / 2,
        cz: zSection,
        w: sTransform.connectorW,
        h: sTransform.topConnectorH,
        kind: "section",
        sectionId: topId,
        verseIds: topVerseIds,
      });

      // Bottom label
      hitboxes.push({
        key: `section-${bottomId}-label`,
        cx: 0,
        cy: sTransform.bottomLabelPinY,
        cz: zFront,
        w: LABEL_HITBOX.width,
        h: LABEL_HITBOX.height,
        kind: "section",
        sectionId: bottomId,
        verseIds: bottomVerseIds,
      });

      // Bottom hollow
      hitboxes.push({
        key: `section-${bottomId}-hollow`,
        cx: sTransform.connectorX + sTransform.connectorW / 2 - PAGE_WIDTH / 2,
        cy: sTransform.bottomConnectorY - sTransform.bottomConnectorH / 2,
        cz: zSection,
        w: sTransform.connectorW,
        h: sTransform.bottomConnectorH,
        kind: "section",
        sectionId: bottomId,
        verseIds: bottomVerseIds,
      });

      // Center hollow
      const middleGroup = sTransform.groups[1];
      if (middleGroup) {
        hitboxes.push({
          key: `section-${centerId}-hollow`,
          cx: middleGroup.frameX + middleGroup.frameW / 2 - PAGE_WIDTH / 2,
          cy: middleGroup.frameY - middleGroup.frameH / 2,
          cz: zSection,
          w: middleGroup.frameW,
          h: middleGroup.frameH,
          kind: "section",
          sectionId: centerId,
          verseIds: centerVerseIds,
        });

        const middleTop = middleGroup.frameY + 0.01;
        const middleBottom = middleGroup.frameY - middleGroup.frameH - 0.01;
        const middleHeight = middleTop - middleBottom;
        const middleCenterY = (middleTop + middleBottom) / 2;

        const curveZoneW = 0.31;
        const leftCurveX = sTransform.baseX - 0.33;
        const rightCurveX = sTransform.baseX + sTransform.innerW + 0.02;

        hitboxes.push(
          {
            key: `section-${centerId}-curves-left`,
            cx: leftCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
            cy: middleCenterY,
            cz: zFront,
            w: curveZoneW,
            h: middleHeight,
            kind: "section",
            sectionId: centerId,
            verseIds: centerVerseIds,
          },
          {
            key: `section-${centerId}-curves-right`,
            cx: rightCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
            cy: middleCenterY,
            cz: zFront,
            w: curveZoneW,
            h: middleHeight,
            kind: "section",
            sectionId: centerId,
            verseIds: centerVerseIds,
          },
        );
      }
    }
  });

  return hitboxes;
}

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
    const validSectionId = typeof sectionId === "string" ? sectionId : undefined;

    const allSelected = verseIds.every((id) => activeVerseIds.includes(id));
    const isDragged = validSectionId
      ? draggedSectionIds.includes(validSectionId)
      : false;

    if (allSelected && isDragged) return;

    useElevatedStore.getState().elevateVerses(verseIds, validSectionId);
  }
};

export function VerseClickHitboxes() {
  const runtime = useSurahLayoutRuntime();
  const config = useStoryStore(state => state.activeConfig);
  const hitboxes = useMemo(() => buildHitboxes(runtime, config), [runtime, config]);

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {hitboxes.map((hb) => (
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
