type Vec3 = [number, number, number];

const BASE_CAMERA = {
  position: [0, 1.4, 1.9] as Vec3,
  fov: 45,
  orbitLimits: {
    minAzimuthAngle: -Math.PI / 4,
    maxAzimuthAngle: Math.PI / 4,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: Math.PI * 0.45,
  },
  viewPresetOffsets: {
    leftAzimuth: -0.56,
    rightAzimuth: 0.56,
    leftPolar: 0,
    defaultPolar: 0,
    rightPolar: 0,
  },
  zoom: {
    distance: 0.6,
    lerpIn: 0.04,
    lerpOut: 0.035,
  },
};

// Edit only these three values for global camera behavior.
export const CAMERA_TUNING = {
  distanceScale: 1,
  yawScale: 1,
  pitchScale: 1,
};

function scaleVec3([x, y, z]: Vec3, scale: number): Vec3 {
  return [x * scale, y * scale, z * scale];
}

function clampPolar(angle: number): number {
  return Math.min(Math.PI - 0.01, Math.max(0.01, angle));
}

export const CAMERA_VIEW_PRESETS = ["left", "default", "right"] as const;
export type CameraViewPreset = (typeof CAMERA_VIEW_PRESETS)[number];

export const CAMERA_CONFIG = {
  initialCamera: {
    position: scaleVec3(BASE_CAMERA.position, CAMERA_TUNING.distanceScale),
    fov: BASE_CAMERA.fov,
  },
  orbitControls: {
    minAzimuthAngle:
      BASE_CAMERA.orbitLimits.minAzimuthAngle * CAMERA_TUNING.yawScale,
    maxAzimuthAngle:
      BASE_CAMERA.orbitLimits.maxAzimuthAngle * CAMERA_TUNING.yawScale,
    minPolarAngle: clampPolar(
      BASE_CAMERA.orbitLimits.minPolarAngle * CAMERA_TUNING.pitchScale,
    ),
    maxPolarAngle: clampPolar(
      BASE_CAMERA.orbitLimits.maxPolarAngle * CAMERA_TUNING.pitchScale,
    ),
  },
  viewPresetOffsets: {
    azimuth: {
      left: BASE_CAMERA.viewPresetOffsets.leftAzimuth * CAMERA_TUNING.yawScale,
      default: 0,
      right:
        BASE_CAMERA.viewPresetOffsets.rightAzimuth * CAMERA_TUNING.yawScale,
    },
    polar: {
      left: BASE_CAMERA.viewPresetOffsets.leftPolar * CAMERA_TUNING.pitchScale,
      default:
        BASE_CAMERA.viewPresetOffsets.defaultPolar * CAMERA_TUNING.pitchScale,
      right:
        BASE_CAMERA.viewPresetOffsets.rightPolar * CAMERA_TUNING.pitchScale,
    },
  },
  zoom: {
    distance: BASE_CAMERA.zoom.distance * CAMERA_TUNING.distanceScale,
    lerpIn: BASE_CAMERA.zoom.lerpIn,
    lerpOut: BASE_CAMERA.zoom.lerpOut,
  },
};
