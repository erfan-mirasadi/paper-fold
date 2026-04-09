"use client";

import { a, useSpring } from "@react-spring/three";
import {
  VerseBox,
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_OUTER_BORDER,
} from "../paper-content/SharedUI";
import {
  layoutMath,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  START_X,
} from "../paper-content/index";
import { PAGE_DEPTH } from "../SinglePaper";

interface PopUpManagerProps {
  isFolded: boolean;
}

export function PopUpManager({ isFolded }: PopUpManagerProps) {
  const { s1Top, s1Pad, gap, smallBoxH, innerHalfW } = layoutMath;
  const baseX = START_X + s1Pad;

  const zOffset = PAGE_DEPTH / 2 + 0.002;

  const v2TexX = baseX;
  const v2WorldX = v2TexX - PAGE_WIDTH / 2;
  const v2WorldY = s1Top - s1Pad;

  const v2HingeX = v2WorldX + innerHalfW;

  const v1TexX = baseX + innerHalfW + gap;
  const v1WorldX = v1TexX - PAGE_WIDTH / 2;
  const v1WorldY = s1Top - s1Pad;

  const v1HingeX = v1WorldX;

  const { rotLeft, rotRight } = useSpring({
    rotLeft: isFolded ? Math.PI / 2 : 0,
    rotRight: isFolded ? -Math.PI / 2 : 0,
    config: { mass: 1, tension: 120, friction: 14 },
  });

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      <group position={[v2HingeX, v2WorldY, zOffset]}>
        <a.group rotation-y={rotLeft}>
          <VerseBox
            x={-innerHalfW}
            y={0}
            z={0}
            w={innerHalfW}
            h={smallBoxH}
            verse="خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ"
            number={2}
            bg={S1_INNER_BG}
            border={S1_INNER_BORDER}
            circleBorderCol={S1_OUTER_BORDER}
            circleBg={S1_OUTER_BORDER}
            circleTextCol="#ffffff"
            isPill={true}
            shadow={false}
          />
        </a.group>
      </group>

      <group position={[v1HingeX, v1WorldY, zOffset]}>
        <a.group rotation-y={rotRight}>
          <VerseBox
            x={0}
            y={0}
            z={0}
            w={innerHalfW}
            h={smallBoxH}
            verse="اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"
            number={1}
            bg={S1_INNER_BG}
            border={S1_INNER_BORDER}
            circleBorderCol={S1_OUTER_BORDER}
            circleBg={S1_OUTER_BORDER}
            circleTextCol="#ffffff"
            isPill={true}
            shadow={false}
          />
        </a.group>
      </group>
    </group>
  );
}
