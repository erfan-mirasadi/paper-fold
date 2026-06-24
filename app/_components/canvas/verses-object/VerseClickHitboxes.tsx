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

      // Groups — each group gets its own hitbox section ID matching _g{idx}
      // (same naming as dragEngine and ElevatedSectionSurfaces).
      // For unified mode, use section ID directly (no _g suffix).
      const isUnified = vConfig.groupElevation === "unified";
      const lastGroupIdx = vConfig.groups.length - 1;
      const allVerseIds = vConfig.groups.flatMap((g) => g.verseIds);
      if (vConfig.introVerse) allVerseIds.unshift(vConfig.introVerse);
      if (vConfig.outroVerse) allVerseIds.push(vConfig.outroVerse);

      const hasCustomSections = vConfig.customSections && vConfig.customSections.length > 0;

      vConfig.groups.forEach((group, gIdx) => {
        const gTransform = sTransform.groups[gIdx];
        // Individual verse hitboxes
        group.verseIds.forEach((vId) => {
          const vt = gTransform.verses[vId];
          if (!vt) return;

          if (hasCustomSections) {
            if (group.dragBehavior === "individual") {
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
            } else {
              // Custom sections: clicking a verse elevates its entire custom section
              const cs = vConfig.customSections!.find((c) => c.verseIds.includes(vId));
              hitboxes.push({
                key: `verse-${vId}`,
                cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
                cy: vt.y - vt.h / 2,
                cz: zFront,
                w: vt.w,
                h: vt.h,
                kind: "section",
                sectionId: cs?.id,
                verseIds: cs?.verseIds ?? [vId],
              });
            }
          } else {
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
          }
        });
      });

      // Build verse buckets for each group (intro/outro attach to first/last).
      const groupVerseIds: number[][] = vConfig.groups.map((g) => [...g.verseIds]);
      if (vConfig.introVerse) groupVerseIds[0].unshift(vConfig.introVerse);
      if (vConfig.outroVerse) groupVerseIds[lastGroupIdx].push(vConfig.outroVerse);

      // Helper: resolve section ID for a group index
      const resolveSectionId = (gIdx: number) =>
        isUnified ? vConfig.id : `${vConfig.id}_g${gIdx}`;
      const resolveVerseIds = (gIdx: number) =>
        isUnified ? allVerseIds : groupVerseIds[gIdx];

      // ─── Section-level hitboxes ─────────────────────────────────────────
      // Top label (first group's label key)
      if (vConfig.topLabelKey && sTransform.topLabelPinY) {
        const topGroupId = resolveSectionId(0);
        hitboxes.push({
          key: `section-${topGroupId}-label`,
          cx: 0,
          cy: sTransform.topLabelPinY,
          cz: zFront,
          w: LABEL_HITBOX.width,
          h: LABEL_HITBOX.height,
          kind: "section",
          sectionId: topGroupId,
          verseIds: resolveVerseIds(0),
        });
      }

      // Top hollow connector (belongs to first group)
      if (config.features.hasIntro && sTransform.topConnectorY !== undefined) {
        const topGroupId = resolveSectionId(0);
        hitboxes.push({
          key: `section-${topGroupId}-hollow`,
          cx: sTransform.connectorX + sTransform.connectorW / 2 - PAGE_WIDTH / 2,
          cy: sTransform.topConnectorY - sTransform.topConnectorH / 2,
          cz: zSection,
          w: sTransform.connectorW,
          h: sTransform.topConnectorH,
          kind: "section",
          sectionId: topGroupId,
          verseIds: resolveVerseIds(0),
        });
      }

      // Bottom label (last group's label key)
      if (vConfig.bottomLabelKey && sTransform.bottomLabelPinY) {
        const botGroupId = resolveSectionId(lastGroupIdx);
        hitboxes.push({
          key: `section-${botGroupId}-label`,
          cx: 0,
          cy: sTransform.bottomLabelPinY,
          cz: zFront,
          w: LABEL_HITBOX.width,
          h: LABEL_HITBOX.height,
          kind: "section",
          sectionId: botGroupId,
          verseIds: resolveVerseIds(lastGroupIdx),
        });
      }

      // Bottom hollow connector (belongs to last group)
      if (config.features.hasIntro && sTransform.bottomConnectorY !== undefined) {
        const botGroupId = resolveSectionId(lastGroupIdx);
        hitboxes.push({
          key: `section-${botGroupId}-hollow`,
          cx: sTransform.connectorX + sTransform.connectorW / 2 - PAGE_WIDTH / 2,
          cy: sTransform.bottomConnectorY - sTransform.bottomConnectorH / 2,
          cz: zSection,
          w: sTransform.connectorW,
          h: sTransform.bottomConnectorH,
          kind: "section",
          sectionId: botGroupId,
          verseIds: resolveVerseIds(lastGroupIdx),
        });
      }

      // Center group hollow + curve hitboxes (isCenter flag)
      // Not created for custom sections — they use per-verse hitboxes only.
      const centerGroups = vConfig.groups
        .map((g, idx) => (g.isCenter ? { gTransform: sTransform.groups[idx], gIdx: idx } : null))
        .filter(Boolean) as { gTransform: any; gIdx: number }[];

      if (!hasCustomSections && centerGroups.length > 0) {
        const firstCenter = centerGroups[0]!;
        const lastCenter = centerGroups[centerGroups.length - 1]!;
        const centerId = resolveSectionId(firstCenter.gIdx);
        const centerVerseIds = isUnified
          ? allVerseIds
          : centerGroups.flatMap(({ gIdx }) => groupVerseIds[gIdx] ?? []);

        const middleTop = firstCenter.gTransform.frameY;
        const middleBottom = lastCenter.gTransform.frameY - lastCenter.gTransform.frameH;
        const middleHeight = middleTop - middleBottom;
        const middleCenterY = (middleTop + middleBottom) / 2;

        hitboxes.push({
          key: `section-${centerId}-hollow`,
          cx: firstCenter.gTransform.frameX + firstCenter.gTransform.frameW / 2 - PAGE_WIDTH / 2,
          cy: middleCenterY,
          cz: zSection,
          w: firstCenter.gTransform.frameW,
          h: middleHeight,
          kind: "section",
          sectionId: centerId,
          verseIds: centerVerseIds,
        });

        if (config.features.hasIntro) {
          const middleTopInner = firstCenter.gTransform.frameY + 0.01;
          const middleBottomInner = lastCenter.gTransform.frameY - lastCenter.gTransform.frameH - 0.01;
          const middleHeightInner = middleTopInner - middleBottomInner;
          const middleCenterYInner = (middleTopInner + middleBottomInner) / 2;

          const curveZoneW = 0.31;
          const leftCurveX = sTransform.baseX - 0.33;
          const rightCurveX = sTransform.baseX + sTransform.innerW + 0.02;

          hitboxes.push(
            {
              key: `section-${centerId}-curves-left`,
              cx: leftCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
              cy: middleCenterYInner,
              cz: zFront,
              w: curveZoneW,
              h: middleHeightInner,
              kind: "section",
              sectionId: centerId,
              verseIds: centerVerseIds,
            },
            {
              key: `section-${centerId}-curves-right`,
              cx: rightCurveX + curveZoneW / 2 - PAGE_WIDTH / 2,
              cy: middleCenterYInner,
              cz: zFront,
              w: curveZoneW,
              h: middleHeightInner,
              kind: "section",
              sectionId: centerId,
              verseIds: centerVerseIds,
            },
          );
        }
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
  const activeConfig = useStoryStore.getState().activeConfig;
  if (!activeConfig.features.hasElevatedSections) return false;

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
    // In all-sections mode: background/label clicks don't toggle sections off.
    // Only the return button can exit all-sections mode.
    const isAllSectionsMode = useElevatedStore.getState().isAllSectionsMode;
    if (isAllSectionsMode) return;

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
