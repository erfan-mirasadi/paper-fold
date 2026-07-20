"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useStoryStore } from "../../../stores/useStoryStore";
import { CameraTargetConfig } from "../../../data/schema";

import { useMemo } from "react";

export function SectionZoomCamera() {
  const config = useStoryStore(state => state.activeConfig);

  const { zoomTargets, getSectionIdForVerse } = useMemo(() => {
    const zoomTargets: Record<string, CameraTargetConfig> = {};

    if (config.customSections && config.customSections.length > 0) {
      // Register the custom section camera target (falls back to the first block with one)
      const fallback = config.blocks?.find((b: any) => b.cameraTarget)?.cameraTarget;
      config.customSections.forEach((cs: any) => {
        const target = cs.cameraTarget ?? fallback;
        if (target) zoomTargets[cs.id] = target;
      });
    } else {
      // "perBlock" elevation (Fatiha, Kafirun, Alak): blocks sharing a
      // `customSectionId` (e.g. Alak's intro/outro merging into their
      // neighboring group's zone) register under that zone instead of
      // their own id. Blocks without their own `cameraTarget` reuse the
      // first target found anywhere (matching "Fallback: per-group entries
      // with same target" behavior for Kafirun/Fatiha, where only one block
      // declares a target), instead of never zooming.
      const fallback = config.blocks?.find((b: any) => b.cameraTarget)?.cameraTarget;
      config.blocks?.forEach((block: any) => {
        if (block.type === 'spacer' || !block.verseIds?.length) return;
        const zoneId = block.customSectionId ?? block.id;
        const target = block.cameraTarget ?? zoomTargets[zoneId] ?? fallback;
        if (target) zoomTargets[zoneId] = target;
      });
    }

    const getSectionIdForVerse = (vid: number): string | null => {
      if (config.customSections && config.customSections.length > 0) {
        for (const cs of config.customSections) {
          if (cs.verseIds.includes(vid)) return cs.id;
        }
      }
      for (const block of (config.blocks ?? [])) {
        if (block.verseIds?.includes(vid)) return block.customSectionId ?? block.id;
        // Grid blocks (Alak) carry their anaAyet as a separate field, not
        // part of `verseIds`.
        if (block.type === "grid" && block.anaAyetId === vid) {
          return block.customSectionId ?? block.id;
        }
      }
      return null;
    };

    return { zoomTargets, getSectionIdForVerse };
  }, [config.blocks, config.customSections]);

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

    // 3. Zoom into the active section on a plain paper click (elevated phase,
    // not all-sections mode). No paper dragging happens anymore, so there is no
    // zoom-out-to-drop state to consider — a click always zooms in.
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
