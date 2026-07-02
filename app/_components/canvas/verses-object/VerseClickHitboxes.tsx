"use client";
import { useMemo } from "react";
import { SectionTransforms, SurahLayoutConfig } from "../../../data/schema";
import { ThreeEvent } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry } from "three";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { getSectionIdForVerseId, getSectionVerseIds } from "../../../utils/sectionResolver";
import { useDragState } from "../../../utils/dragEngine";
import { getFoldAnglesForScroll } from "../3d-scene/FoldStory";
import { useFoldStore } from "../orchestrator/ScrollManager";

const hitBoxMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const hitBoxGeom = new PlaneGeometry(1, 1);

// Padding multiplier for verse hitboxes so the clickable area covers
// the full capsule, not just the verse text bounding box.
const VERSE_HITBOX_PAD_W = 1.14;
const VERSE_HITBOX_PAD_H = 1.3;

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

function buildHitboxes(
  runtime: ReturnType<typeof useSurahLayoutRuntime>,
  config: SurahLayoutConfig,
): VerseHitbox[] {
  const hitboxes: VerseHitbox[] = [];
  const zFront = PAGE_DEPTH / 2 + 0.003;
  const zSection = zFront - 0.0008;

  const { PAGE_WIDTH, SURAH_TRANSFORMS } = runtime;

  (config.blocks ?? []).forEach((block, idx) => {
    if (block.type === "spacer") return;
    const sTransform = SURAH_TRANSFORMS.sections[idx] as
      | Required<SectionTransforms>
      | undefined;
    if (!sTransform) return;

    const verseMap =
      block.type === "grid" ? sTransform.verses : sTransform.groups?.[0]?.verses;

    // Individual verse hitboxes.
    // When this block belongs to a customSection (and isn't dragBehavior
    // "individual"), clicking any single verse must elevate the WHOLE
    // custom section at once — matching the legacy behavior where such
    // hitboxes carry `kind: "section"` + the full section's verseIds, not
    // just the one clicked verse. Without this, `elevateVerse(vId)` only
    // ever adds that one verse (+ its fold pair) to activeVerseIds, which
    // can never satisfy the "all verses present" check that activates a
    // multi-verse custom section — so the section never actually elevates.
    const hasCustomSections = Boolean(config.customSections?.length);
    (block.verseIds ?? []).forEach((vId) => {
      // Intro/outro verses (Alak) don't live in `sTransform.groups[0]` —
      // they render via BlockRenderer's dedicated introVerse/outroVerse
      // path, so their hitbox is sourced from those fields directly.
      // Legacy always gave these a single unconditional `kind: "verse"`
      // hitbox (never routed through the custom-section merge logic), so
      // a click here only ever elevates that one verse — not its whole
      // merged zone.
      if (block.introOutroRole) {
        const t =
          block.introOutroRole === "intro"
            ? sTransform.introVerse
            : sTransform.outroVerse;
        if (!t) return;
        hitboxes.push({
          key: `verse-${vId}`,
          cx: t.x + t.w / 2 - PAGE_WIDTH / 2,
          cy: t.y - t.h / 2,
          cz: zFront,
          w: t.w * VERSE_HITBOX_PAD_W,
          h: t.h * VERSE_HITBOX_PAD_H,
          kind: "verse",
          verseId: vId,
        });
        return;
      }

      const vt = verseMap?.[vId];
      if (!vt) return;
      const base = {
        key: `verse-${vId}`,
        cx: vt.x + vt.w / 2 - PAGE_WIDTH / 2,
        cy: vt.y - vt.h / 2,
        cz: zFront,
        w: vt.w * VERSE_HITBOX_PAD_W,
        h: vt.h * VERSE_HITBOX_PAD_H,
      };
      if (hasCustomSections && block.dragBehavior !== "individual") {
        const sectionId = getSectionIdForVerseId(vId) ?? block.id;
        const sectionVerseIds = getSectionVerseIds(sectionId);
        hitboxes.push({
          ...base,
          kind: "section",
          sectionId,
          verseIds: sectionVerseIds.length > 0 ? sectionVerseIds : [vId],
        });
      } else {
        hitboxes.push({ ...base, kind: "verse", verseId: vId });
      }
    });

    // AnaAyet hitbox (grid-type blocks only)
    if (block.type === "grid" && block.anaAyetId !== undefined && sTransform.anaAyet) {
      const anaAyet = sTransform.anaAyet;
      hitboxes.push({
        key: `verse-${block.anaAyetId}`,
        cx: anaAyet.x + anaAyet.w / 2 - PAGE_WIDTH / 2,
        cy: anaAyet.y - anaAyet.h / 2,
        cz: zFront,
        w: anaAyet.w * VERSE_HITBOX_PAD_W,
        h: anaAyet.h * VERSE_HITBOX_PAD_H,
        kind: "verse",
        verseId: block.anaAyetId,
      });
    }

    // Frame-level hitbox so clicking blank space inside the block also
    // elevates it. Skipped for "individual" drag blocks (e.g. Ihlas),
    // where only precise verse clicks should register — matching the
    // legacy custom-sections + dragBehavior:"individual" behavior. Also
    // skipped for intro/outro blocks (Alak) — legacy never gave these
    // rows their own blank-space hitbox; their merged zone (g0/g2) already
    // has its own frame hitbox covering blank-space clicks within it.
    if (block.dragBehavior !== "individual" && !block.introOutroRole) {
      const sectionId =
        getSectionIdForVerseId(block.verseIds?.[0] ?? -1) ?? block.id;
      const sectionVerseIds = getSectionVerseIds(sectionId);
      if (sectionVerseIds.length > 0) {
        const group = sTransform.groups?.[0];
        const frame = group
          ? { x: group.frameX, y: group.frameY, w: group.frameW, h: group.frameH }
          : {
              x: sTransform.frameX,
              y: sTransform.frameY ?? 0,
              w: sTransform.frameW,
              h: sTransform.frameH ?? 0,
            };

        hitboxes.push({
          key: `section-${sectionId}-frame-${idx}`,
          cx: frame.x + frame.w / 2 - PAGE_WIDTH / 2,
          cy: frame.y - frame.h / 2,
          cz: zSection,
          w: frame.w,
          h: frame.h,
          kind: "section",
          sectionId,
          verseIds: sectionVerseIds,
        });
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

export function VerseClickHitboxes() {
  const runtime = useSurahLayoutRuntime();
  const config = useStoryStore((state) => state.activeConfig);
  const hitboxes = useMemo(
    () => buildHitboxes(runtime, config),
    [runtime, config],
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const { kind, verseId, verseIds, sectionId } = e.object.userData;
    if (!canUseElevatedInteraction(kind, verseId, verseIds)) return;

    const offset = useFoldStore.getState().currentOffset;
    const phase = useElevatedStore.getState().phase;
    const isPaperFolded = offset < 0.98;

    // Delegate to background mesh if we are already zoomed in
    if (isPaperFolded && phase === "elevated") {
      return;
    }

    // When the paper is folded, hitboxes below the folded part remain active in the empty space.
    // We reject clicks that hit these "invisible" hitboxes below the current visual paper edge.
    const angles = getFoldAnglesForScroll(offset, runtime.foldSteps);

    let lowestVisibleY = -Infinity;
    for (let i = 0; i < angles.length; i++) {
      if (Math.abs(angles[i]) > 1.5) {
        lowestVisibleY = runtime.FOLD_Y_POSITIONS[i];
        break;
      }
    }

    // Hitbox's local Y position is exactly its cy coordinate, matching the fold positions.
    // A larger buffer (0.5) allows clicking on slightly folded sections
    if (e.object.position.y < lowestVisibleY - 0.5) {
      return;
    }

    if (e.delta > 10) return;
    e.stopPropagation();

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

      const validSectionId =
        typeof sectionId === "string" ? sectionId : undefined;

      const allSelected = verseIds.every((id) => activeVerseIds.includes(id));
      const isDragged = validSectionId
        ? draggedSectionIds.includes(validSectionId)
        : false;

      if (allSelected && isDragged) return;

      useElevatedStore.getState().elevateVerses(verseIds, validSectionId);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    const { kind, verseId, verseIds } = e.object.userData;
    if (!canUseElevatedInteraction(kind, verseId, verseIds)) return;

    const { currentOffset } = useFoldStore.getState();
    const { phase } = useElevatedStore.getState();
    const isPaperFolded = currentOffset < 0.98;

    // Let the global cursor style handle "zoom-out" anywhere on the screen
    if (isPaperFolded && phase === "elevated") {
      return;
    }

    if (isPaperFolded) {
      e.stopPropagation();
      // Paper has folds → magnifier cursor
      document.body.style.cursor = "zoom-in";
    }
  };

  const handlePointerOut = () => {
    // Only reset if we set it — avoid fighting with drag cursors
    const cur = document.body.style.cursor;
    if (cur === "zoom-in" || cur === "zoom-out") {
      document.body.style.cursor = "";
    }
  };

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
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          geometry={hitBoxGeom}
          material={hitBoxMaterial}
        />
      ))}
    </group>
  );
}
