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

/**
 * Does this fold story actually fold anything?
 *
 * Two kinds of page answer no. A composed atlas (paperComposer) is a map to
 * read rather than a sheet to fold, so it is given two IDENTICAL flat steps
 * purely so `FOLD_Y_POSITIONS` has a line to hold; and a few single-sheet
 * configs keep only their `end` step, having commented the creased one out.
 * Either way there is no motion between step 0 and any other step.
 *
 * Such a page has nothing for the fold UI to drive: no edge slider, no
 * Aç/Katla button, no "scroll down" hint, and no scroll length at all — the
 * story sits at its final (open) state from the first frame. Everything that
 * asks "is the paper still folded?" (elevated sections, pop-ups, verse drag)
 * therefore has to see it as open, which is why the offset is pinned to 1
 * rather than left at 0.
 */
export const hasFoldMotion = (
  foldSteps: readonly FoldStoryStep[],
): boolean => {
  if (foldSteps.length < 2) return false;

  const angleAt = (step: FoldStoryStep, index: number) => {
    const fold = step.folds[index];
    return fold ? foldStateToAngle(fold) : 0;
  };
  const foldCount = Math.max(...foldSteps.map((step) => step.folds.length));

  for (let stepIndex = 1; stepIndex < foldSteps.length; stepIndex++) {
    for (let foldIndex = 0; foldIndex < foldCount; foldIndex++) {
      const from = angleAt(foldSteps[0], foldIndex);
      const to = angleAt(foldSteps[stepIndex], foldIndex);
      if (Math.abs(from - to) > 1e-4) return true;
    }
  }
  return false;
};
