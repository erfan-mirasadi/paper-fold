// "use client";

// import { useFrame, useThree } from "@react-three/fiber";
// import { Vector3 } from "three";
// import { useElevatedStore } from "./useElevatedStore";
// import { ELEVATE_CAMERA } from "./useElevateAnimation";
// import { VERSE_CONFIGS } from "./ElevatedVerseManager";
// import { PAGE_HEIGHT } from "../../data/SurahConfig";

// type OrbitSyncControls = {
//   target: Vector3;
//   update: () => void;
// };

// const _lookAt = new Vector3();
// const _desiredPos = new Vector3();
// const _preElevatePos = new Vector3();
// const _preElevateTarget = new Vector3();
// const _returnLookTarget = new Vector3();
// const _currentLookTarget = new Vector3();

// const PAGE_ROTATION_X = -Math.PI / 4;

// let _savedPos = false;
// let _prevActiveId: number | null = null;
// let _returnFrames = 0;
// const MAX_RETURN_FRAMES = 300;

// export function ElevateCameraController() {
//   const { controls: rawControls } = useThree();

//   useFrame(({ camera }) => {
//     const controls = rawControls as unknown as OrbitSyncControls | undefined;
//     const { activeVerseId, phase } = useElevatedStore.getState();

//     if (activeVerseId !== null && _prevActiveId === null) {
//       _preElevatePos.copy(camera.position);

//       if (controls?.target) {
//         _preElevateTarget.copy(controls.target);
//       } else {
//         _preElevateTarget.set(0, 0, 0);
//       }

//       _savedPos = true;
//       _returnFrames = 0;

//       if (controls?.target) {
//         _currentLookTarget.copy(controls.target);
//       }
//     }

//     if (activeVerseId === null && _prevActiveId !== null) {
//       _returnFrames = 0;

//       if (controls?.target) {
//         _returnLookTarget.copy(controls.target);
//       } else {
//         _returnLookTarget.copy(_currentLookTarget);
//       }
//     }

//     _prevActiveId = activeVerseId;

//     if (phase === "elevated" && activeVerseId !== null) {
//       const config = VERSE_CONFIGS.get(activeVerseId);
//       if (!config) return;

//       const localY = config.cy + PAGE_HEIGHT / 2;
//       const cosR = Math.cos(PAGE_ROTATION_X);
//       const sinR = Math.sin(PAGE_ROTATION_X);

//       const worldX = config.cx;
//       const worldY = localY * cosR;
//       const worldZ = localY * sinR;

//       _lookAt.set(worldX, worldY + ELEVATE_CAMERA.lookAtYOffset, worldZ);

//       _desiredPos.set(
//         worldX,
//         worldY + ELEVATE_CAMERA.lookAtYOffset + 0.08,
//         worldZ + ELEVATE_CAMERA.zoomDistance,
//       );

//       camera.position.lerp(_desiredPos, ELEVATE_CAMERA.lerpSpeed);
//       _currentLookTarget.lerp(_lookAt, ELEVATE_CAMERA.lerpSpeed);
//       camera.lookAt(_currentLookTarget);

//       if (controls?.target) {
//         controls.target.copy(_currentLookTarget);
//         controls.update();
//       }

//       return;
//     }

//     if (phase === "idle" && _savedPos) {
//       _returnFrames++;

//       const dist = camera.position.distanceTo(_preElevatePos);
//       const speedMult = 1 + Math.max(0, 1 - dist) * 0.4;

//       camera.position.lerp(
//         _preElevatePos,
//         ELEVATE_CAMERA.lerpSpeed * speedMult,
//       );
//       _returnLookTarget.lerp(
//         _preElevateTarget,
//         ELEVATE_CAMERA.lerpSpeed * speedMult,
//       );
//       camera.lookAt(_returnLookTarget);

//       const posDist = camera.position.distanceTo(_preElevatePos);
//       const timedOut = _returnFrames > MAX_RETURN_FRAMES;

//       if (posDist < 0.0005 || timedOut) {
//         camera.position.copy(_preElevatePos);
//         camera.lookAt(_preElevateTarget);

//         if (controls?.target) {
//           controls.target.copy(_preElevateTarget);
//           controls.update();
//         }

//         _savedPos = false;
//       }
//     }
//   });

//   return null;
// }
