"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useStoryStore } from "../../../stores/useStoryStore";
import { GridSectionConfig, VerticalGroupsSectionConfig, CameraTargetConfig } from "../../../data/schema";

import { useMemo } from "react";

export function SectionZoomCamera() {
  const config = useStoryStore(state => state.activeConfig);

  const { zoomTargets, getSectionIdForVerse } = useMemo(() => {
    const zoomTargets: Record<string, CameraTargetConfig> = {};

    config.sections.forEach((section) => {
      if (section.type === "gridWithAnaAyet") {
        const s1 = section as GridSectionConfig;
        if (s1.cameraTarget) {
          zoomTargets[s1.id] = s1.cameraTarget;
        }
      } else if (section.type === "verticalGroups") {
        const s2 = section as VerticalGroupsSectionConfig;
        if (s2.subCameraTargets) {
          if (s2.subCameraTargets.top) zoomTargets[`${s2.id}_top`] = s2.subCameraTargets.top;
          if (s2.subCameraTargets.center) zoomTargets[`${s2.id}_center`] = s2.subCameraTargets.center;
          if (s2.subCameraTargets.bottom) zoomTargets[`${s2.id}_bottom`] = s2.subCameraTargets.bottom;
        }
        if (s2.cameraTarget) {
          zoomTargets[s2.id] = s2.cameraTarget;
        }
      }
    });

    const getSectionIdForVerse = (vid: number): string | null => {
      for (const section of config.sections) {
        if (section.type === "gridWithAnaAyet") {
          const s1 = section as GridSectionConfig;
          if (s1.verses.includes(vid) || s1.anaAyet === vid) return s1.id;
        } else if (section.type === "verticalGroups") {
          const s2 = section as VerticalGroupsSectionConfig;
          if (s2.introVerse === vid) return `${s2.id}_top`;
          if (s2.outroVerse === vid) return `${s2.id}_bottom`;
          if (s2.groups[0]?.verseIds.includes(vid)) return `${s2.id}_top`;
          if (s2.groups[1]?.verseIds.includes(vid)) return `${s2.id}_center`;
          if (s2.groups[2]?.verseIds.includes(vid)) return `${s2.id}_bottom`;
        }
      }
      return null;
    };

    return { zoomTargets, getSectionIdForVerse };
  }, [config.sections]);
  useFrame((state) => {
    // 1. Only run zoom logic when in paper mode
    const isIntroActive = useFoldStore.getState().isIntroActive;
    const { phase, isAllSectionsMode, activeSectionId, activeVerseIds } =
      useElevatedStore.getState();

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
    let targetSectionId = activeSectionId;
    if (!targetSectionId && activeVerseIds.length > 0) {
      targetSectionId = getSectionIdForVerse(activeVerseIds[0]);
    }

    // 3. If a section is active and we are NOT in all sections mode, zoom to it
    if (phase === "elevated" && !isAllSectionsMode && targetSectionId) {
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
    camera.position.y += (targetCamY - camera.position.y) * 0.05;

    const currentFov = (camera as any).fov;
    if (currentFov !== undefined) {
      (camera as any).fov += (targetFov - currentFov) * 0.05;
      camera.updateProjectionMatrix();
    }

    if (controls?.target) {
      controls.target.y += (lookAtY - controls.target.y) * 0.05;
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
