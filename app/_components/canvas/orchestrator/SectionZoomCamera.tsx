"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useDragState } from "../../../utils/dragEngine";
import { useStoryStore } from "../../../stores/useStoryStore";
import { GridSectionConfig, VerticalGroupsSectionConfig, CameraTargetConfig } from "../../../data/schema";

import { useMemo } from "react";

export function SectionZoomCamera() {
  const config = useStoryStore(state => state.activeConfig);

  const { zoomTargets, getSectionIdForVerse } = useMemo(() => {
    const zoomTargets: Record<string, CameraTargetConfig> = {};

    // ── NEW: block-based configs ───────────────────────────────────────────
    if (config.blocks && config.blocks.length > 0) {
      if (config.customSections && config.customSections.length > 0) {
        // Register the custom section camera target (falls back to the first block with one)
        const fallback = config.blocks.find((b: any) => b.cameraTarget)?.cameraTarget;
        config.customSections.forEach((cs: any) => {
          const target = cs.cameraTarget ?? fallback;
          if (target) zoomTargets[cs.id] = target;
        });
      } else {
        // "perBlock" elevation (Fatiha, Kafirun): mirrors legacy's per-group
        // fallback — blocks without their own `cameraTarget` reuse the first
        // block's target (matching legacy's "Fallback: per-group entries
        // with same target" behavior), instead of never zooming at all.
        const fallback = config.blocks.find((b: any) => b.cameraTarget)?.cameraTarget;
        config.blocks.forEach((block: any) => {
          if (block.type === 'spacer' || !block.verseIds?.length) return;
          const target = block.cameraTarget ?? fallback;
          if (target) zoomTargets[block.id] = target;
        });
      }

      const getSectionIdForVerse = (vid: number): string | null => {
        if (config.customSections && config.customSections.length > 0) {
          for (const cs of config.customSections) {
            if (cs.verseIds.includes(vid)) return cs.id;
          }
        }
        for (const block of (config.blocks ?? [])) {
          if (block.verseIds?.includes(vid)) return block.id;
        }
        return null;
      };

      return { zoomTargets, getSectionIdForVerse };
    }

    // ── LEGACY: sections-based configs ──────────────────────────────────
    config.sections?.forEach((section) => {
      if (section.type === "gridWithAnaAyet") {
        const s1 = section as GridSectionConfig;
        if (s1.cameraTarget) {
          zoomTargets[s1.id] = s1.cameraTarget;
        }
      } else if (section.type === "verticalGroups") {
        const s2 = section as VerticalGroupsSectionConfig;
        const defaultTarget = s2.cameraTarget;
        const hasCustomSections = s2.customSections && s2.customSections.length > 0;
        const isUnified = s2.groupElevation === "unified";

        if (hasCustomSections) {
          // Register camera target for custom section IDs (fallback to defaultTarget)
          s2.customSections!.forEach((cs) => {
            if (cs.cameraTarget || defaultTarget) {
              zoomTargets[cs.id] = cs.cameraTarget ?? defaultTarget!;
            }
          });
        } else if (!isUnified && s2.subCameraTargets) {
          // Map sub-camera targets to _g{idx} naming
          const subKeys = ["top", "center", "bottom"] as const;
          s2.groups.forEach((_, gIdx) => {
            const subKey = subKeys[gIdx]; // top=g0, center=g1, bottom=g2
            const groupTarget = subKey ? s2.subCameraTargets?.[subKey] : undefined;
            if (groupTarget || defaultTarget) {
              zoomTargets[`${s2.id}_g${gIdx}`] = (groupTarget ?? defaultTarget)!;
            }
          });
        } else if (!isUnified && defaultTarget) {
          // Fallback: per-group entries with same target
          s2.groups.forEach((_, gIdx) => {
            zoomTargets[`${s2.id}_g${gIdx}`] = defaultTarget;
          });
        }
        
        // Always register section-level target (used by unified and as fallback)
        if (defaultTarget) {
          zoomTargets[s2.id] = defaultTarget;
        }
      }
    });

    const getSectionIdForVerse = (vid: number): string | null => {
      for (const section of (config.sections ?? [])) {
        if (section.type === "gridWithAnaAyet") {
          const s1 = section as GridSectionConfig;
          if (s1.verses.includes(vid) || s1.anaAyet === vid) return s1.id;
        } else if (section.type === "verticalGroups") {
          const s2 = section as VerticalGroupsSectionConfig;

          // Custom sections: look up the verse's custom section ID
          if (s2.customSections && s2.customSections.length > 0) {
            for (const cs of s2.customSections) {
              if (cs.verseIds.includes(vid)) return cs.id;
            }
            continue;
          }

          const isUnified = s2.groupElevation === "unified";
          if (isUnified) {
            // Unified: all verses map to section ID
            if (s2.introVerse === vid || s2.outroVerse === vid) return s2.id;
            for (const group of s2.groups) {
              if (group.verseIds.includes(vid)) return s2.id;
            }
          } else if (s2.subCameraTargets) {
            if (s2.introVerse === vid) return `${s2.id}_g0`;
            const lastIdx = s2.groups.length - 1;
            if (s2.outroVerse === vid) return `${s2.id}_g${lastIdx}`;
            for (let i = 0; i < s2.groups.length; i++) {
              if (s2.groups[i].verseIds.includes(vid)) return `${s2.id}_g${i}`;
            }
          } else {
            if (s2.introVerse === vid) return s2.id;
            if (s2.outroVerse === vid) return s2.id;
            for (const group of s2.groups || []) {
              if (group.verseIds.includes(vid)) return s2.id;
            }
          }
        }
      }
      return null;
    };

    return { zoomTargets, getSectionIdForVerse };
  }, [config.sections, config.blocks, config.customSections]);

  const activeSectionId = useElevatedStore((s) => s.activeSectionId);
  const activeVerseIds = useElevatedStore((s) => s.activeVerseIds);

  const fallbackSectionId = useMemo(() => {
    if (activeSectionId) return activeSectionId;
    if (activeVerseIds.length > 0) return getSectionIdForVerse(activeVerseIds[0]);
    return null;
  }, [activeSectionId, activeVerseIds, getSectionIdForVerse]);

  useFrame((state) => {
    // 1. Only run zoom logic when in paper mode
    const isIntroActive = useFoldStore.getState().isIntroActive;
    const { phase, isAllSectionsMode } = useElevatedStore.getState();
    const { hasDragged, isPaperDocked } = useDragState.getState();

    // 1. If we are in intro and NOT elevated, do nothing here so IntroCameraScrollController can handle it.
    if (isIntroActive && phase === "idle") return;

    const camera = state.camera;
    const controls = state.controls as any;

    // 2. Base camera position and target from config
    const [, defY] = CAMERA_CONFIG.initialCamera.position;
    const [, defTY] = CAMERA_CONFIG.initialCamera.target;

    const defFov = CAMERA_CONFIG.initialCamera.fov;

    let targetCamY = defY;
    let targetFov = defFov;
    let lookAtY = defTY;

    // Infer section if we only clicked a verse and activeSectionId is null
    let targetSectionId = fallbackSectionId;

    // 3. Zoom into the active section when elevated and NOT dragging/docked.
    // hasDragged=true → camera zooms out so user can see the full paper to drop outside.
    // isPaperDocked=true → stays zoomed out (section is docked outside the page).
    // Both reset to false when section snaps back → camera automatically zooms in again.
    const shouldZoomOut = hasDragged || isPaperDocked;
    if (phase === "elevated" && !isAllSectionsMode && targetSectionId && !shouldZoomOut) {
      const zoomCoords = zoomTargets[targetSectionId];
      if (zoomCoords) {
        targetCamY = zoomCoords.y;
        targetFov = zoomCoords.fov;

        // زاویه نگاه دوربین به بالا یا پایین بر اساس tilt
        lookAtY = zoomCoords.y + zoomCoords.tilt;
      }
    }

    // 4. Smoothly interpolate camera position and target
    // IMPORTANT: We only control Y-height and FOV.
    // X and Z are owned by OrbitControls (azimuth rotation) — do NOT lerp them.
    const lerpFactor = 0.025; // Lower = smoother/slower zoom
    const threshold = 0.001;

    const yDiff = targetCamY - camera.position.y;
    if (Math.abs(yDiff) > threshold) {
      camera.position.y += yDiff * lerpFactor;
    }

    const currentFov = (camera as any).fov;
    if (currentFov !== undefined) {
      const fovDiff = targetFov - currentFov;
      if (Math.abs(fovDiff) > threshold) {
        (camera as any).fov += fovDiff * lerpFactor;
        camera.updateProjectionMatrix();
      }
    }

    if (controls?.target) {
      const targetYDiff = lookAtY - controls.target.y;
      if (Math.abs(targetYDiff) > threshold) {
        controls.target.y += targetYDiff * lerpFactor;
      }
      // Do NOT call controls.update() here — CameraViewController owns the
      // camera orientation each frame. Calling controls.update() here would
      // fight its azimuth positioning and cause jitter/resets.
    } else {
      // Fallback: directly tilt the camera to face the lookAtY
      camera.lookAt(camera.position.x, lookAtY, camera.position.z);
    }
  });

  return null;
}
