"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils, Spherical, Vector3 } from "three";
import { useCameraStore } from "../../../stores/useCameraStore";
import {
  CAMERA_VIEW_AZIMUTH_OFFSETS,
  useCameraViewStore,
} from "../../../stores/useCameraViewStore";

type OrbitControlsLike = {
  target: Vector3;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  getAzimuthalAngle?: () => number;
  getPolarAngle?: () => number;
  setAzimuthalAngle?: (angle: number) => void;
  setPolarAngle?: (angle: number) => void;
  update: () => void;
};

const SNAP_EPSILON = 0.0025;
const SNAP_POLAR_EPSILON = 0.0025;
const ROTATE_RESPONSE = 22;

const _offset = new Vector3();
const _spherical = new Spherical();

let _hasInitialOrbit = false;
let _initialAzimuth = 0;
let _initialPolar = 0;

function shortestDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function readAzimuth(cameraPosition: Vector3, controls: OrbitControlsLike) {
  if (typeof controls.getAzimuthalAngle === "function") {
    return controls.getAzimuthalAngle();
  }

  _offset.copy(cameraPosition).sub(controls.target);
  _spherical.setFromVector3(_offset);
  return _spherical.theta;
}

function readPolar(cameraPosition: Vector3, controls: OrbitControlsLike) {
  if (typeof controls.getPolarAngle === "function") {
    return controls.getPolarAngle();
  }

  _offset.copy(cameraPosition).sub(controls.target);
  _spherical.setFromVector3(_offset);
  return _spherical.phi;
}

function setOrbitAngles(
  controls: OrbitControlsLike,
  camera: { position: Vector3; lookAt: (target: Vector3) => void },
  theta: number,
  phi: number,
) {
  if (
    typeof controls.setAzimuthalAngle === "function" &&
    typeof controls.setPolarAngle === "function"
  ) {
    controls.setAzimuthalAngle(theta);
    controls.setPolarAngle(phi);
    controls.update();
    return;
  }

  _offset.copy(camera.position).sub(controls.target);
  _spherical.setFromVector3(_offset);
  _spherical.theta = theta;
  _spherical.phi = phi;
  _spherical.makeSafe();
  _offset.setFromSpherical(_spherical);

  camera.position.copy(controls.target).add(_offset);
  camera.lookAt(controls.target);
  controls.update();
}

export function CameraViewController() {
  useFrame((state, delta) => {
    const zoomPhase = useCameraStore.getState().phase;
    const cameraViewStore = useCameraViewStore.getState();

    if (zoomPhase !== "idle") {
      if (cameraViewStore.requestedView !== null) {
        cameraViewStore.clearRequest();
      }
      return;
    }

    const controls = state.controls as unknown as OrbitControlsLike | undefined;
    if (!controls?.target) return;

    if (!_hasInitialOrbit) {
      _initialAzimuth = readAzimuth(state.camera.position, controls);
      _initialPolar = readPolar(state.camera.position, controls);
      _hasInitialOrbit = true;
    }

    const requestedView = cameraViewStore.requestedView;
    const continuousOffset = cameraViewStore.continuousOffset;
    if (!requestedView && continuousOffset === null) return;

    const currentTheta = readAzimuth(state.camera.position, controls);
    const currentPolar = readPolar(state.camera.position, controls);

    const minAzimuth = Number.isFinite(controls.minAzimuthAngle)
      ? (controls.minAzimuthAngle as number)
      : -Infinity;
    const maxAzimuth = Number.isFinite(controls.maxAzimuthAngle)
      ? (controls.maxAzimuthAngle as number)
      : Infinity;

    let targetTheta;
    if (continuousOffset !== null) {
      const maxRight = CAMERA_VIEW_AZIMUTH_OFFSETS["right"];
      const maxLeft = CAMERA_VIEW_AZIMUTH_OFFSETS["left"];
      const offset =
        continuousOffset > 0
          ? continuousOffset * maxRight
          : continuousOffset * Math.abs(maxLeft);

      targetTheta = MathUtils.clamp(
        _initialAzimuth + offset,
        minAzimuth,
        maxAzimuth,
      );
    } else if (requestedView) {
      targetTheta = MathUtils.clamp(
        _initialAzimuth + CAMERA_VIEW_AZIMUTH_OFFSETS[requestedView],
        minAzimuth,
        maxAzimuth,
      );
    } else {
      return;
    }

    const diff = shortestDelta(currentTheta, targetTheta);

    if (Math.abs(diff) <= SNAP_EPSILON) {
      setOrbitAngles(controls, state.camera, targetTheta, currentPolar);
      if (requestedView) {
        cameraViewStore.clearRequest();
      }
      return;
    }

    const ease = 1 - Math.exp(-ROTATE_RESPONSE * Math.max(delta, 0.001));
    const easedTheta = diff * ease;

    setOrbitAngles(
      controls,
      state.camera,
      currentTheta + easedTheta,
      currentPolar,
    );
  });

  return null;
}
