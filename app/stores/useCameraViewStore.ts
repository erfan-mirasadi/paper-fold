import { create } from "zustand";
import {
  CAMERA_CONFIG,
  type CameraViewPreset as CameraViewPresetType,
} from "../data/cameraConfig";

export type CameraViewPreset = CameraViewPresetType;

// Left/right are offsets from the initial camera azimuth at app start.
// Keep center on 0 so the default button returns to exact initial state.
export const CAMERA_VIEW_AZIMUTH_OFFSETS: Readonly<
  Record<CameraViewPreset, number>
> = CAMERA_CONFIG.viewPresetOffsets.azimuth;

// Optional per-preset vertical tweaks (radians) relative to initial polar angle.
export const CAMERA_VIEW_POLAR_OFFSETS: Readonly<
  Record<CameraViewPreset, number>
> = CAMERA_CONFIG.viewPresetOffsets.polar;

interface CameraViewState {
  requestedView: CameraViewPreset | null;
  selectedView: CameraViewPreset;
  continuousOffset: number | null;
  requestView: (view: CameraViewPreset) => void;
  setContinuousOffset: (offset: number | null) => void;
  clearRequest: () => void;
}

export const useCameraViewStore = create<CameraViewState>((set) => ({
  requestedView: null,
  selectedView: "default",
  continuousOffset: null,
  requestView: (view) => set({ requestedView: view, selectedView: view, continuousOffset: null }),
  setContinuousOffset: (offset) => set({ continuousOffset: offset, requestedView: null }),
  clearRequest: () => set({ requestedView: null, continuousOffset: null }),
}));
