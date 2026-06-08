import { MathUtils } from "three";
import { FoldState, FoldStoryStep } from "../../../data/schema";

const FOLDED_ANGLE = Math.PI - 0.04;

const foldStateToAngle = (state: FoldState) =>
  state.direction * state.angleFactor * FOLDED_ANGLE;

export const getFoldAnglesForScroll = (
  offset: number,
  foldSteps: readonly FoldStoryStep[],
): number[] => {
  const angles = new Array<number>(foldSteps[0].folds.length);
  writeFoldAnglesForScroll(offset, foldSteps, angles);
  return angles;
};

export const writeFoldAnglesForScroll = (
  offset: number,
  foldSteps: readonly FoldStoryStep[],
  target: { [index: number]: number; length: number },
) => {
  const maxStageIndex = foldSteps.length - 1;
  const clampedOffset = MathUtils.clamp(offset, 0, 1);
  const rawStage = clampedOffset * maxStageIndex;
  const fromIndex = Math.min(Math.floor(rawStage), maxStageIndex);
  const toIndex = Math.min(fromIndex + 1, maxStageIndex);
  const localT = fromIndex === maxStageIndex ? 0 : rawStage - fromIndex;

  // Faster reaction: reduced deadzone from 10% to 5%
  let easedT = 0;
  if (localT > 0.05 && localT < 0.95) {
    // Animate between 5% and 95% of the local scroll stage
    const normalized = (localT - 0.05) / 0.9;
    // Smoothstep formula
    easedT = normalized * normalized * (3 - 2 * normalized);
  } else if (localT >= 0.95) {
    easedT = 1;
  }

  for (
    let foldIndex = 0;
    foldIndex < foldSteps[fromIndex].folds.length;
    foldIndex++
  ) {
    const fromFold = foldSteps[fromIndex].folds[foldIndex];
    const toFold = foldSteps[toIndex].folds[foldIndex];
    const fromAngle = foldStateToAngle(fromFold);
    const toAngle = foldStateToAngle(toFold);

    target[foldIndex] = MathUtils.lerp(fromAngle, toAngle, easedT);
  }
};

export const getOffsetForId = (
  id: string,
  foldSteps: readonly FoldStoryStep[],
): number => {
  const index = foldSteps.findIndex((step) => step.id === id);
  if (index === -1) return 0;
  return index / (foldSteps.length - 1);
};
