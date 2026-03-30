import { MathUtils } from "three";

const FOLDED_ANGLE = Math.PI - 0.04;

export interface FoldState {
  direction: -1 | 0 | 1;
  angleFactor: number;
}

export interface FoldStoryStep {
  id: string;
  folds: [
    FoldState,
    FoldState,
    FoldState,
    FoldState,
    FoldState,
    FoldState,
    FoldState,
  ];
}

export const FOLD_STORY_STEPS: readonly FoldStoryStep[] = [
  {
    id: "start",
    folds: [
      { direction: -1, angleFactor: 0 }, // 1) below 6
      { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
      { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
      { direction: +1, angleFactor: -1 }, // 4) between 11/12 and 13/14
      { direction: -1, angleFactor: 0 }, // 5) above 15/16
      { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
      { direction: -1, angleFactor: -1 }, // 7) above 19
    ],
  },
  {
    id: "outer-open",
    folds: [
      { direction: -1, angleFactor: 0 }, // 1) below 6
      { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
      { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
      { direction: 1, angleFactor: -1 }, // 4) between 11/12 and 13/14
      { direction: -1, angleFactor: 0 }, // 5) above 15/16
      { direction: 1, angleFactor: 1 }, // 6) between 16/15 and 18/17
      { direction: -1, angleFactor: 0 }, // 7) above 19
    ],
  },
  {
    id: "inner-open",
    folds: [
      { direction: -1, angleFactor: 0 }, // 1) below 6
      { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
      { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
      { direction: -1, angleFactor: 1 }, // 4) between 11/12 and 13/14
      { direction: -1, angleFactor: -1 }, // 5) above 15/16
      { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
      { direction: -1, angleFactor: 0 }, // 7) above 19
    ],
  },
  {
    id: "end",
    folds: [
      { direction: -1, angleFactor: 0 }, // 1) below 6
      { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
      { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
      { direction: 1, angleFactor: 0 }, // 4) between 11/12 and 13/14
      { direction: -1, angleFactor: 0 }, // 5) above 15/16
      { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
      { direction: -1, angleFactor: 0 }, // 7) above 19
    ],
  },
] as const;

const foldStateToAngle = (state: FoldState) =>
  state.direction * state.angleFactor * FOLDED_ANGLE;

export const getFoldAnglesForScroll = (offset: number): number[] => {
  const maxStageIndex = FOLD_STORY_STEPS.length - 1;
  const clampedOffset = MathUtils.clamp(offset, 0, 1);
  const rawStage = clampedOffset * maxStageIndex;
  const fromIndex = Math.min(Math.floor(rawStage), maxStageIndex);
  const toIndex = Math.min(fromIndex + 1, maxStageIndex);
  const localT = fromIndex === maxStageIndex ? 0 : rawStage - fromIndex;

  return FOLD_STORY_STEPS[fromIndex].folds.map((fromFold, foldIndex) => {
    const toFold = FOLD_STORY_STEPS[toIndex].folds[foldIndex];
    const fromAngle = foldStateToAngle(fromFold);
    const toAngle = foldStateToAngle(toFold);

    return MathUtils.lerp(fromAngle, toAngle, localT);
  });
};
