"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3, Spherical, type Quaternion } from "three";
import {
  useCameraStore,
  ZOOM_DISTANCE,
  CAMERA_LERP_SPEED,
  CAMERA_RESET_LERP_SPEED,
} from "../../../stores/useCameraStore";

export const EDGE_THRESHOLD = 0.65;
export const EDGE_PAN_SPEED = 0.005;
export const EDGE_PAN_MAX_X = 0.3;
export const EDGE_PAN_MAX_Y = 0.12;
const MAX_RETURN_FRAMES = 300;

type OrbitSyncControls = {
  target: Vector3;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  update: () => void;
  _quat?: Quaternion;
  _quatInverse?: Quaternion;
  _sphericalDelta?: Spherical;
  sphericalDelta?: Spherical;
  _panOffset?: Vector3;
  panOffset?: Vector3;
  _scale?: number;
  scale?: number;
};

// ZERO-GC MODULE-LEVEL OPTIMIZATION
// Moving all object allocations outside the component body
// prevents overhead & re-allocation, minimizing garbage collection spikes.
const _lookAt = new Vector3();
const _desiredPos = new Vector3();
const _desiredOffset = new Vector3();
const _orbitOffset = new Vector3();
const _spherical = new Spherical();
const _panDelta = new Vector3();

const _preZoomPos = new Vector3();
const _preZoomTarget = new Vector3();
const _returnLookTarget = new Vector3();
const _zoomLookAt = new Vector3();
const _edgeOffset = new Vector3();

let _prevPhase = "idle";
let _returnFrames = 0;
let _hasPreZoomPos = false;

// Helpers decoupled from React render context
const computeClampedZoomDestination = (
  controls: OrbitSyncControls | undefined,
  lookAt: Vector3,
  outPosition: Vector3,
) => {
  _desiredOffset.set(0, 0.05, ZOOM_DISTANCE);

  const orbitOffset = _orbitOffset.copy(_desiredOffset);
  if (controls?._quat) orbitOffset.applyQuaternion(controls._quat);

  const minPolarCandidate = controls?.minPolarAngle;
  const maxPolarCandidate = controls?.maxPolarAngle;
  const minAzimuthCandidate = controls?.minAzimuthAngle;
  const maxAzimuthCandidate = controls?.maxAzimuthAngle;

  const minPolar = Number.isFinite(minPolarCandidate)
    ? (minPolarCandidate as number)
    : 0;
  const maxPolar = Number.isFinite(maxPolarCandidate)
    ? (maxPolarCandidate as number)
    : Math.PI;
  const minAzimuth = Number.isFinite(minAzimuthCandidate)
    ? (minAzimuthCandidate as number)
    : -Infinity;
  const maxAzimuth = Number.isFinite(maxAzimuthCandidate)
    ? (maxAzimuthCandidate as number)
    : Infinity;

  _spherical.setFromVector3(orbitOffset);
  _spherical.theta = MathUtils.clamp(_spherical.theta, minAzimuth, maxAzimuth);
  _spherical.phi = MathUtils.clamp(_spherical.phi, minPolar, maxPolar);
  _spherical.makeSafe();

  orbitOffset.setFromSpherical(_spherical);
  if (controls?._quatInverse)
    orbitOffset.applyQuaternion(controls._quatInverse);

  outPosition.copy(lookAt).add(orbitOffset);
};

const syncOrbitHandoff = (
  controls: OrbitSyncControls | undefined,
  lookAt: Vector3,
) => {
  if (!controls?.target) return;

  controls.target.copy(lookAt);

  if (controls?._sphericalDelta?.set) controls._sphericalDelta.set(0, 0, 0);
  if (controls?.sphericalDelta?.set) controls.sphericalDelta.set(0, 0, 0);
  if (controls?._panOffset?.set) controls._panOffset.set(0, 0, 0);
  if (controls?.panOffset?.set) controls.panOffset.set(0, 0, 0);
  if (typeof controls?._scale === "number") controls._scale = 1;
  if (typeof controls?.scale === "number") controls.scale = 1;

  controls.update();
};

export function CameraManager() {
  useFrame((state) => {
    // Avoid useThree() destructive hook usage to prevent React re-renders.
    const camera = state.camera;
    const controls = state.controls as unknown as OrbitSyncControls | undefined;

    const store = useCameraStore.getState();
    const { cameraTarget, phase } = store;

    if (phase === "zooming_in" && _prevPhase === "idle") {
      _preZoomPos.copy(camera.position);
      _hasPreZoomPos = true;
      if (controls?.target) {
        _preZoomTarget.copy(controls.target);
      } else {
        _preZoomTarget.set(0, 0, 0);
      }
    }

    if (phase === "zooming_in" && _prevPhase !== "zooming_in") {
      _edgeOffset.set(0, 0, 0);

      if (controls?.target) {
        _zoomLookAt.copy(controls.target);
      } else if (cameraTarget) {
        _zoomLookAt.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
      }

      if (cameraTarget) {
        _lookAt.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
        computeClampedZoomDestination(controls, _lookAt, _desiredPos);
      }
    }

    if (phase === "zooming_out" && _prevPhase !== "zooming_out") {
      _returnFrames = 0;
      if (controls?.target) {
        _returnLookTarget.copy(controls.target);
      } else if (cameraTarget) {
        _returnLookTarget.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
      } else {
        _returnLookTarget.set(0, 0, 0);
      }
    }

    _prevPhase = phase;

    // PHASE: ZOOMING IN
    if (phase === "zooming_in" && cameraTarget) {
      const distToTarget = camera.position.distanceTo(_desiredPos);

      // Smoothly boost speed as we get closer instead of a hard jump
      // Max boost of +40% when distance approaches 0
      const speedMult = 1 + Math.max(0, 1 - distToTarget) * 0.4;

      _zoomLookAt.lerp(_lookAt, CAMERA_LERP_SPEED * speedMult);
      camera.position.lerp(_desiredPos, CAMERA_LERP_SPEED * speedMult);
      camera.lookAt(_zoomLookAt);

      const dist = camera.position.distanceTo(_desiredPos);
      const lookDist = _zoomLookAt.distanceTo(_lookAt);

      // Microscopic threshold (0.0005) for an invisible, seamless handoff
      if (dist < 0.0005 && lookDist < 0.0005) {
        camera.position.copy(_desiredPos);
        camera.lookAt(_lookAt);
        syncOrbitHandoff(controls, _lookAt);

        store.setZoomed();
      }
      return;
    }

    // PHASE: ZOOMED (Flat Edge Panning)
    if (phase === "zoomed" && cameraTarget) {
      if (!controls?.target) return;

      const { x: px, y: py } = state.pointer;
      let dx = 0;
      let dy = 0;

      if (px > EDGE_THRESHOLD)
        dx = ((px - EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD)) * EDGE_PAN_SPEED;
      else if (px < -EDGE_THRESHOLD)
        dx = ((px + EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD)) * EDGE_PAN_SPEED;

      if (py > EDGE_THRESHOLD)
        dy = ((py - EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD)) * EDGE_PAN_SPEED;
      else if (py < -EDGE_THRESHOLD)
        dy = ((py + EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD)) * EDGE_PAN_SPEED;

      if (dx !== 0 || dy !== 0) {
        const oldX = _edgeOffset.x;
        const oldY = _edgeOffset.y;

        _edgeOffset.x = MathUtils.clamp(
          oldX + dx,
          -EDGE_PAN_MAX_X,
          EDGE_PAN_MAX_X,
        );
        _edgeOffset.y = MathUtils.clamp(
          oldY + dy,
          -EDGE_PAN_MAX_Y,
          EDGE_PAN_MAX_Y,
        );

        const deltaX = _edgeOffset.x - oldX;
        const deltaY = _edgeOffset.y - oldY;

        _panDelta.set(deltaX, deltaY, 0);
        camera.position.add(_panDelta);
        controls.target.add(_panDelta);
      }
      return;
    }

    // PHASE: ZOOMING OUT
    if (phase === "zooming_out" && _hasPreZoomPos) {
      _returnFrames++;

      const posDistBefore = camera.position.distanceTo(_preZoomPos);

      // Smoothly boost speed to avoid hard velocity jump
      const speedMult = 1 + Math.max(0, 1 - posDistBefore) * 0.4;

      camera.position.lerp(_preZoomPos, CAMERA_RESET_LERP_SPEED * speedMult);

      _returnLookTarget.lerp(
        _preZoomTarget,
        CAMERA_RESET_LERP_SPEED * speedMult,
      );
      camera.lookAt(_returnLookTarget);

      const posDist = camera.position.distanceTo(_preZoomPos);
      const timedOut = _returnFrames > MAX_RETURN_FRAMES;

      // Microscopic threshold for smooth landing
      if (posDist < 0.0005 || timedOut) {
        camera.position.copy(_preZoomPos);

        if (controls?.target) {
          camera.lookAt(_preZoomTarget);
          syncOrbitHandoff(controls, _preZoomTarget);
        }

        _hasPreZoomPos = false;
        _edgeOffset.set(0, 0, 0);
        store.finishReturn();
      }
    }
  });

  return null;
}
