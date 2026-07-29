"use client";

/**
 * ViewSpinGroup — the left/right "look around" turn driven by the bottom slider.
 *
 * This used to orbit the CAMERA around world Y. The page is tilted back 45°
 * (see the `rotation-x` group in Experience), so world Y sits 45° away from the
 * page's own vertical: orbiting around it swept the camera through a cone and
 * rolled the sheet on screen — a 26° turn tipped the page by ~19°, so it read
 * as tumbling on two axes at once and its edges never stayed put.
 *
 * Rotating this group instead turns the page about its own vertical axis. The
 * group is mounted INSIDE the tilted group, so `rotation.y` here IS that axis
 * by construction, and the page's centre sits on it — so the sheet turns in
 * place: pure yaw, no roll, no drift, corners sweeping symmetrically.
 *
 * The angle is written imperatively from useFrame: it changes every frame while
 * the knob moves, and re-rendering the whole paper subtree at that rate is a
 * non-starter.
 */

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { MathUtils, type Group } from "three";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import {
  SCENE_SPIN_OFFSETS,
  useCameraViewStore,
} from "../../../stores/useCameraViewStore";

/** Exponential-ease response; higher = snappier. */
const SPIN_RESPONSE = 22;
const SNAP_EPSILON = 0.0025;

/**
 * Slider right means "look at the page from its right", which is the page
 * yawing away to the left — the mirror of the camera orbit it replaces.
 */
const SPIN_SIGN = -1;

const MIN_SPIN = CAMERA_CONFIG.orbitControls.minAzimuthAngle;
const MAX_SPIN = CAMERA_CONFIG.orbitControls.maxAzimuthAngle;

export function ViewSpinGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { requestedView, continuousOffset } = useCameraViewStore.getState();

    let offset: number;
    if (continuousOffset !== null) {
      // The knob's -1..1 travel maps onto the left/right preset angles, so the
      // ends of the track land exactly where the preset buttons do.
      const limit =
        continuousOffset > 0
          ? SCENE_SPIN_OFFSETS.right
          : Math.abs(SCENE_SPIN_OFFSETS.left);
      offset = continuousOffset * limit;
    } else if (requestedView) {
      offset = SCENE_SPIN_OFFSETS[requestedView];
    } else {
      // Nothing requested — hold the page wherever it was left.
      return;
    }

    const target = SPIN_SIGN * MathUtils.clamp(offset, MIN_SPIN, MAX_SPIN);
    const diff = target - group.rotation.y;

    if (Math.abs(diff) <= SNAP_EPSILON) {
      group.rotation.y = target;
      if (requestedView) {
        useCameraViewStore.getState().clearRequest();
      }
      return;
    }

    const safeDelta = Math.min(delta, 0.1);
    const ease = 1 - Math.exp(-SPIN_RESPONSE * Math.max(safeDelta, 0.001));
    group.rotation.y += diff * ease;
  });

  return <group ref={groupRef}>{children}</group>;
}
