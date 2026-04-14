"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Vector3, Spherical, type Quaternion } from "three";
import {
  useCameraStore,
  ZOOM_DISTANCE,
  CAMERA_LERP_SPEED,
  CAMERA_RESET_LERP_SPEED,
} from "../features/camera-zoom/useCameraStore";

export const EDGE_THRESHOLD = 0.85;
export const EDGE_PAN_SPEED = 0.002;
export const EDGE_PAN_MAX = 0.12;
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

export function CameraManager() {
  const { camera } = useThree();

  const preZoomPos = useRef<Vector3 | null>(null);
  const preZoomTarget = useRef<Vector3 | null>(null);
  const returnLookTarget = useRef<Vector3 | null>(null);

  const prevPhase = useRef("idle");
  const edgeOffset = useRef(new Vector3());
  const returnFrames = useRef(0);
  const zoomLookAt = useRef(new Vector3());

  const _lookAt = useRef(new Vector3());
  const _desiredPos = useRef(new Vector3());
  const _desiredOffset = useRef(new Vector3());
  const _orbitOffset = useRef(new Vector3());
  const _spherical = useRef(new Spherical());
  const _panDelta = useRef(new Vector3());

  const computeClampedZoomDestination = (
    controls: OrbitSyncControls | undefined,
    lookAt: Vector3,
    outPosition: Vector3,
  ) => {
    // Desired local orbit offset for the zoomed view.
    _desiredOffset.current.set(0, 0.05, ZOOM_DISTANCE);

    const orbitOffset = _orbitOffset.current.copy(_desiredOffset.current);
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

    _spherical.current.setFromVector3(orbitOffset);
    _spherical.current.theta = MathUtils.clamp(
      _spherical.current.theta,
      minAzimuth,
      maxAzimuth,
    );
    _spherical.current.phi = MathUtils.clamp(
      _spherical.current.phi,
      minPolar,
      maxPolar,
    );
    _spherical.current.makeSafe();

    orbitOffset.setFromSpherical(_spherical.current);
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

    // Reset residual orbital deltas so first interactive frame is identical.
    if (controls?._sphericalDelta?.set) controls._sphericalDelta.set(0, 0, 0);
    if (controls?.sphericalDelta?.set) controls.sphericalDelta.set(0, 0, 0);
    if (controls?._panOffset?.set) controls._panOffset.set(0, 0, 0);
    if (controls?.panOffset?.set) controls.panOffset.set(0, 0, 0);
    if (typeof controls?._scale === "number") controls._scale = 1;
    if (typeof controls?.scale === "number") controls.scale = 1;

    controls.update();
  };

  useFrame((state) => {
    const store = useCameraStore.getState();
    const { cameraTarget, phase } = store;

    if (phase === "zooming_in" && prevPhase.current === "idle") {
      preZoomPos.current = camera.position.clone();
      const controls = state.controls as unknown as
        | OrbitSyncControls
        | undefined;
      preZoomTarget.current = controls?.target
        ? controls.target.clone()
        : new Vector3();
    }

    if (phase === "zooming_in" && prevPhase.current !== "zooming_in") {
      edgeOffset.current.set(0, 0, 0);

      const controls = state.controls as unknown as
        | OrbitSyncControls
        | undefined;
      if (controls?.target) {
        zoomLookAt.current.copy(controls.target);
      } else if (cameraTarget) {
        zoomLookAt.current.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
      }
    }

    if (phase === "zooming_out" && prevPhase.current !== "zooming_out") {
      returnFrames.current = 0;
      const controls = state.controls as unknown as
        | OrbitSyncControls
        | undefined;
      returnLookTarget.current = controls?.target
        ? controls.target.clone()
        : cameraTarget
          ? new Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z)
          : new Vector3();
    }

    prevPhase.current = phase;

    // ═══════════════════════════════════════════════════════════════
    // PHASE: ZOOMING IN
    // ═══════════════════════════════════════════════════════════════
    if (phase === "zooming_in" && cameraTarget) {
      _lookAt.current.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);

      const controls = state.controls as unknown as
        | OrbitSyncControls
        | undefined;
      computeClampedZoomDestination(
        controls,
        _lookAt.current,
        _desiredPos.current,
      );

      // Simple speedup for the last chunk to avoid dragging out
      const distToTarget = camera.position.distanceTo(_desiredPos.current);
      const speedMult = distToTarget < 0.2 ? 1.3 : 1;

      zoomLookAt.current.lerp(_lookAt.current, CAMERA_LERP_SPEED * speedMult);
      camera.position.lerp(_desiredPos.current, CAMERA_LERP_SPEED * speedMult);
      camera.lookAt(zoomLookAt.current);

      const dist = camera.position.distanceTo(_desiredPos.current);
      const lookDist = zoomLookAt.current.distanceTo(_lookAt.current);

      if (dist < 0.002 && lookDist < 0.0015) {
        camera.position.copy(_desiredPos.current);
        camera.lookAt(_lookAt.current);
        syncOrbitHandoff(controls, _lookAt.current);

        store.setZoomed();
      }
      return;
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE: ZOOMED (Flat Edge Panning)
    // ═══════════════════════════════════════════════════════════════
    if (phase === "zoomed" && cameraTarget) {
      const controls = state.controls as unknown as
        | OrbitSyncControls
        | undefined;
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
        const oldX = edgeOffset.current.x;
        const oldY = edgeOffset.current.y;

        edgeOffset.current.x = MathUtils.clamp(
          oldX + dx,
          -EDGE_PAN_MAX,
          EDGE_PAN_MAX,
        );
        edgeOffset.current.y = MathUtils.clamp(
          oldY + dy,
          -EDGE_PAN_MAX,
          EDGE_PAN_MAX,
        );

        const deltaX = edgeOffset.current.x - oldX;
        const deltaY = edgeOffset.current.y - oldY;

        _panDelta.current.set(deltaX, deltaY, 0);
        camera.position.add(_panDelta.current);
        controls.target.add(_panDelta.current);
      }
      return;
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE: ZOOMING OUT
    // ═══════════════════════════════════════════════════════════════
    if (phase === "zooming_out" && preZoomPos.current) {
      returnFrames.current++;

      // Simple speedup for the last chunk to avoid dragging out
      const posDistBefore = camera.position.distanceTo(preZoomPos.current);
      const speedMult = posDistBefore < 0.2 ? 1.6 : 1;

      camera.position.lerp(
        preZoomPos.current,
        CAMERA_RESET_LERP_SPEED * speedMult,
      );

      if (preZoomTarget.current && returnLookTarget.current) {
        returnLookTarget.current.lerp(
          preZoomTarget.current,
          CAMERA_RESET_LERP_SPEED * speedMult,
        );
        camera.lookAt(returnLookTarget.current);
      }

      const posDist = camera.position.distanceTo(preZoomPos.current);
      const timedOut = returnFrames.current > MAX_RETURN_FRAMES;

      if (posDist < 0.01 || timedOut) {
        camera.position.copy(preZoomPos.current);

        const controls = state.controls as unknown as
          | OrbitSyncControls
          | undefined;
        if (controls?.target && preZoomTarget.current) {
          camera.lookAt(preZoomTarget.current);
          syncOrbitHandoff(controls, preZoomTarget.current);
        }

        preZoomPos.current = null;
        preZoomTarget.current = null;
        returnLookTarget.current = null;
        edgeOffset.current.set(0, 0, 0);
        store.finishReturn();
      }
    }
  });

  return null;
}
