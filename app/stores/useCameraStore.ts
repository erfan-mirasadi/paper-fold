import { create } from "zustand";
import { CAMERA_CONFIG } from "../data/cameraConfig";

/** How close the camera zooms in (lower = closer). */
export const ZOOM_DISTANCE = CAMERA_CONFIG.zoom.distance;
/** Lerp/slerp speed for zoom-in (0-1 per frame). */
export const CAMERA_LERP_SPEED = CAMERA_CONFIG.zoom.lerpIn;
/** Lerp/slerp speed for zoom-out. */
export const CAMERA_RESET_LERP_SPEED = CAMERA_CONFIG.zoom.lerpOut;

interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

export type CameraPhase = "idle" | "zooming_in" | "zoomed" | "zooming_out";

interface CameraStoreState {
  /** Currently focused verse id, or null when idle / returning. */
  activeVerseId: number | null;
  /** 3D world-space position the camera should look at. */
  cameraTarget: CameraTarget | null;
  /** Current lifecycle phase. */
  phase: CameraPhase;
  /** Start zooming toward a verse. */
  focusOnVerse: (verseId: number, target: CameraTarget) => void;
  /** Called by CameraManager when zoom-in animation completes. */
  setZoomed: () => void;
  /** Begin zoom-out animation. */
  resetCamera: () => void;
  /** Called by CameraManager when zoom-out animation completes. */
  finishReturn: () => void;
}

export const useCameraStore = create<CameraStoreState>((set) => ({
  activeVerseId: null,
  cameraTarget: null,
  phase: "idle",

  focusOnVerse: (verseId, target) =>
    set({ activeVerseId: verseId, cameraTarget: target, phase: "zooming_in" }),

  setZoomed: () => set({ phase: "zoomed" }),

  resetCamera: () => set({ activeVerseId: null, phase: "zooming_out" }),

  finishReturn: () => set({ phase: "idle", cameraTarget: null }),
}));
