import { create } from "zustand";

export type CameraViewPreset = "left" | "default" | "right";

// Left/right are offsets from the initial camera azimuth at app start.
// Keep center on 0 so the default button returns to exact initial state.
export const CAMERA_VIEW_AZIMUTH_OFFSETS: Record<CameraViewPreset, number> = {
  left: -0.56,
  default: 0,
  right: 0.56,
};

// Optional per-preset vertical tweaks (radians) relative to initial polar angle.
export const CAMERA_VIEW_POLAR_OFFSETS: Record<CameraViewPreset, number> = {
  left: 0,
  default: 0,
  right: 0,
};

interface CameraViewState {
  requestedView: CameraViewPreset | null;
  selectedView: CameraViewPreset;
  isUserInteracting: boolean;
  requestView: (view: CameraViewPreset) => void;
  clearRequest: () => void;
  setUserInteracting: (value: boolean) => void;
}

export const useCameraViewStore = create<CameraViewState>((set) => ({
  requestedView: null,
  selectedView: "default",
  isUserInteracting: false,
  requestView: (view) => set({ requestedView: view, selectedView: view }),
  clearRequest: () => set({ requestedView: null }),
  setUserInteracting: (value) => set({ isUserInteracting: value }),
}));
