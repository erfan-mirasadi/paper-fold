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
    FoldState,
  ];
}

export const FOLD_STORY_STEPS: readonly FoldStoryStep[] = [
  {
    id: "pre-start",
    folds: [
      { direction: 1, angleFactor: 1 }, // 0) between 5 and 6 (New)
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
    id: "start",
    folds: [
      { direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
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
      { direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
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
      { direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
      { direction: -1, angleFactor: 0 }, // 1) below 6
      { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
      { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
      { direction: -1, angleFactor: 1 }, // 4) between 11/12 and 13/14
      { direction: -1, angleFactor: -1 }, // 5) above 15/16
      { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
      { direction: -1, angleFactor: 0 }, // 7) above 19
    ],
  },
  // {
  //   id: "custom-step-1",
  //   folds: [
  //{ direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
  //     { direction: -1, angleFactor: 0 }, // 1) below 6
  //     { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
  //     { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
  //     { direction: 1, angleFactor: -1 }, // 4) between 11/12 and 13/14
  //     { direction: -1, angleFactor: 0 }, // 5) above 15/16
  //     { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
  //     { direction: -1, angleFactor: 0 }, // 7) above 19
  //   ],
  // },
  // {
  //   id: "custom-step-2",
  //   folds: [
  //{ direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
  //     { direction: -1, angleFactor: 0 }, // 1) below 6
  //     { direction: 1, angleFactor: 0 }, // 2) between 8/7 and 10/9
  //     { direction: -1, angleFactor: 0 }, // 3) between group 1 and group 2
  //     { direction: -1, angleFactor: 1 }, // 4) between 11/12 and 13/14
  //     { direction: -1, angleFactor: -1 }, // 5) above 15/16
  //     { direction: 1, angleFactor: 0 }, // 6) between 16/15 and 18/17
  //     { direction: -1, angleFactor: 0 }, // 7) above 19
  //   ],
  // },
  {
    id: "end",
    folds: [
      { direction: 1, angleFactor: 0 }, // 0) between 5 and 6 (New)
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

  return FOLD_STORY_STEPS[fromIndex].folds.map((fromFold, foldIndex) => {
    const toFold = FOLD_STORY_STEPS[toIndex].folds[foldIndex];
    const fromAngle = foldStateToAngle(fromFold);
    const toAngle = foldStateToAngle(toFold);

    return MathUtils.lerp(fromAngle, toAngle, easedT);
  });
};

export const getOffsetForId = (id: string): number => {
  const index = FOLD_STORY_STEPS.findIndex((step) => step.id === id);
  if (index === -1) return 0;
  return index / (FOLD_STORY_STEPS.length - 1);
};
