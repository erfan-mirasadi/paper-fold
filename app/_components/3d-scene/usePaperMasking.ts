import { useMemo, useEffect, useCallback } from "react";
import { Color, type Texture } from "three";
import { usePopUpStore } from "../features/pop-up-verses/ui/usePopUpStore";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../features/elevated-verses/useElevatedStore";
import { ORIGINAL_TEXTURE_TIMING } from "../features/pop-up-verses/useFoldAnimation";
import { ELEVATE_TEXTURE_TIMING } from "../features/elevated-verses/useElevateAnimation";
import {
  SURAH_TRANSFORMS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  FOLD_Y_POSITIONS,
} from "../SurahLayout/index";
import { S1_INNER_BORDER } from "../data/theme";

interface PaperMaskShader {
  uniforms: Record<string, unknown>;
  fragmentShader: string;
}

// Pre-compute verse rectangles (x, y, w, h)
const VERSE_RECTS = (() => {
  const rects = new Float32Array(20 * 4);
  const s1 = SURAH_TRANSFORMS.s1;
  const s2 = SURAH_TRANSFORMS.s2;

  Object.entries(s1.verses).forEach(([num, t]) => {
    const i = parseInt(num);
    rects[i * 4 + 0] = t.x;
    rects[i * 4 + 1] = t.y;
    rects[i * 4 + 2] = t.w;
    rects[i * 4 + 3] = t.h;
  });
  rects[5 * 4 + 0] = s1.anaAyet.x;
  rects[5 * 4 + 1] = s1.anaAyet.y;
  rects[5 * 4 + 2] = s1.anaAyet.w;
  rects[5 * 4 + 3] = s1.anaAyet.h;
  rects[6 * 4 + 0] = s2.introVerse.x;
  rects[6 * 4 + 1] = s2.introVerse.y;
  rects[6 * 4 + 2] = s2.introVerse.w;
  rects[6 * 4 + 3] = s2.introVerse.h;
  s2.groups.forEach((g) => {
    Object.entries(g.verses).forEach(([num, t]) => {
      const i = parseInt(num);
      rects[i * 4 + 0] = t.x;
      rects[i * 4 + 1] = t.y;
      rects[i * 4 + 2] = t.w;
      rects[i * 4 + 3] = t.h;
    });
  });
  rects[19 * 4 + 0] = s2.outroVerse.x;
  rects[19 * 4 + 1] = s2.outroVerse.y;
  rects[19 * 4 + 2] = s2.outroVerse.w;
  rects[19 * 4 + 3] = s2.outroVerse.h;

  return rects;
})();

// Pre-compute section rectangles (split S2 into 3 sub-sections)
const SECTION_RECTS = (() => {
  const rects = new Float32Array(4 * 4);
  const s1 = SURAH_TRANSFORMS.s1;
  const s2 = SURAH_TRANSFORMS.s2;
  const PAD = 0.02; // Tightened padding to match the section border size

  // 0: S1 Frame (Expanded)
  rects[0 * 4 + 0] = s1.frameX - PAD / 2;
  rects[0 * 4 + 1] = s1.frameY + PAD / 2;
  rects[0 * 4 + 2] = s1.frameW + PAD;
  rects[0 * 4 + 3] = s1.frameH + PAD;

  // 1: S2 Top Frame (Intro + G1)
  // From top of S2 to fold between G1 and G2
  rects[1 * 4 + 0] = s2.frameX - PAD / 2;
  rects[1 * 4 + 1] = s2.shiftedTop + PAD / 2;
  rects[1 * 4 + 2] = s2.frameW + PAD;
  rects[1 * 4 + 3] = s2.shiftedTop - FOLD_Y_POSITIONS[3] + PAD;

  // 2: S2 Center Frame (G2)
  // From fold G1-G2 to fold G2-G3
  rects[2 * 4 + 0] = s2.frameX - PAD / 2;
  rects[2 * 4 + 1] = FOLD_Y_POSITIONS[3] + PAD / 2;
  rects[2 * 4 + 2] = s2.frameW + PAD;
  rects[2 * 4 + 3] = FOLD_Y_POSITIONS[3] - FOLD_Y_POSITIONS[5] + PAD;

  // 3: S2 Bottom Frame (G3 + Outro)
  // From fold G2-G3 to bottom of S2
  rects[3 * 4 + 0] = s2.frameX - PAD / 2;
  rects[3 * 4 + 1] = FOLD_Y_POSITIONS[5] + PAD / 2;
  rects[3 * 4 + 2] = s2.frameW + PAD;
  rects[3 * 4 + 3] = FOLD_Y_POSITIONS[5] - s2.shiftedBot + PAD;

  return rects;
})();

// Pre-compute background colors for verses (revealed when verse is hidden)
const VERSE_BG_COLORS = (() => {
  const colors = new Float32Array(20 * 3);
  const tempCol = new Color();
  const setCol = (i: number, hex: string) => {
    tempCol.set(hex);
    colors[i * 3 + 0] = tempCol.r;
    colors[i * 3 + 1] = tempCol.g;
    colors[i * 3 + 2] = tempCol.b;
  };

  // Section 1: Use the inner border/connector color as requested
  for (let i = 1; i <= 5; i++) setCol(i, S1_INNER_BORDER);

  // Section 2: Individual verses (6, 19)
  const BLUE = "#C4963B";
  setCol(6, BLUE);
  setCol(19, BLUE);

  // Section 2: Groups (uses group theme colors)
  const MAROON = "#7c8cb0";
  const GREEN = "#5E7367";

  [7, 8, 9, 10].forEach((i) => setCol(i, MAROON));
  [11, 12, 13, 14].forEach((i) => setCol(i, GREEN));
  [15, 16, 17, 18].forEach((i) => setCol(i, MAROON));

  return colors;
})();

export function usePaperMasking(paperTextureDiffuse: Texture) {
  const uniforms = useMemo(
    () => ({
      uVerseVisibility: { value: new Float32Array(20).fill(1.0) },
      uSectionVisibility: { value: new Float32Array(4).fill(1.0) },
      uVerseRects: { value: VERSE_RECTS },
      uSectionRects: { value: SECTION_RECTS },
      uVerseBgColors: { value: VERSE_BG_COLORS },
      uPageWidth: { value: PAGE_WIDTH },
      uPageHeight: { value: PAGE_HEIGHT },
      uBaseTexture: { value: paperTextureDiffuse },
    }),
    [paperTextureDiffuse],
  );

  useEffect(() => {
    const timeouts: Record<string, NodeJS.Timeout> = {};

    const updateVerse = (id: number, visible: boolean, delay: number) => {
      const key = `v${id}`;
      if (timeouts[key]) clearTimeout(timeouts[key]);
      timeouts[key] = setTimeout(() => {
        uniforms.uVerseVisibility.value[id] = visible ? 1.0 : 0.0;
        delete timeouts[key];
      }, delay);
    };

    const updateSection = (idx: number, visible: boolean, delay: number) => {
      const key = `s${idx}`;
      if (timeouts[key]) clearTimeout(timeouts[key]);
      timeouts[key] = setTimeout(() => {
        uniforms.uSectionVisibility.value[idx] = visible ? 1.0 : 0.0;
        delete timeouts[key];
      }, delay);
    };

    // Initial Sync
    const s = usePopUpStore.getState();
    const e = useElevatedStore.getState();

    // Verses initial
    for (let i = 1; i <= 19; i++) {
      let hidden = e.activeVerseIds.includes(i);
      if (!hidden) {
        const g = s.popUpGroups.find((group) => group.verseIds.includes(i));
        if (g?.isOpen) hidden = true;
      }
      if (i >= 11 && i <= 14 && s.middleHorizontalFolded) hidden = true;
      uniforms.uVerseVisibility.value[i] = hidden ? 0.0 : 1.0;
    }

    // Sections initial sync
    const sectionMap: Record<ElevatedSectionId, number> = {
      s1: 0,
      s2_top: 1,
      s2_center: 2,
      s2_bottom: 3,
    };
    Object.entries(sectionMap).forEach(([id, idx]) => {
      uniforms.uSectionVisibility.value[idx] = e.activeSectionIds.includes(
        id as ElevatedSectionId,
      )
        ? 0.0
        : 1.0;
    });

    const unsubPopUp = usePopUpStore.subscribe((state, prevState) => {
      state.popUpGroups.forEach((g, idx) => {
        if (g.isOpen !== prevState.popUpGroups[idx]?.isOpen) {
          const delay = g.isOpen
            ? ORIGINAL_TEXTURE_TIMING.hideDelay
            : ORIGINAL_TEXTURE_TIMING.showDelay;
          g.verseIds.forEach((id) => {
            if (!useElevatedStore.getState().activeVerseIds.includes(id)) {
              updateVerse(id, !g.isOpen, delay);
            }
          });
        }
      });
      if (state.middleHorizontalFolded !== prevState.middleHorizontalFolded) {
        const delay = state.middleHorizontalFolded
          ? ORIGINAL_TEXTURE_TIMING.hideDelay
          : ORIGINAL_TEXTURE_TIMING.showDelay;
        [11, 12, 13, 14].forEach((id) => {
          if (!useElevatedStore.getState().activeVerseIds.includes(id)) {
            updateVerse(id, !state.middleHorizontalFolded, delay);
          }
        });
      }
    });

    const unsubElevated = useElevatedStore.subscribe((state, prevState) => {
      // Verse changes
      state.activeVerseIds.forEach((id) => {
        if (!prevState.activeVerseIds.includes(id))
          updateVerse(id, false, ELEVATE_TEXTURE_TIMING.hideDelay);
      });
      prevState.activeVerseIds.forEach((id) => {
        if (!state.activeVerseIds.includes(id)) {
          const g = usePopUpStore
            .getState()
            .popUpGroups.find((group) => group.verseIds.includes(id));
          const isMid =
            id >= 11 &&
            id <= 14 &&
            usePopUpStore.getState().middleHorizontalFolded;
          if (!g?.isOpen && !isMid)
            updateVerse(id, true, ELEVATE_TEXTURE_TIMING.showDelay);
        }
      });
      // Section changes
      Object.entries(sectionMap).forEach(([sid, idx]) => {
        const now = state.activeSectionIds.includes(sid as ElevatedSectionId);
        const prev = prevState.activeSectionIds.includes(
          sid as ElevatedSectionId,
        );
        if (now !== prev) {
          updateSection(
            idx,
            !now,
            now
              ? ELEVATE_TEXTURE_TIMING.hideDelay
              : ELEVATE_TEXTURE_TIMING.showDelay,
          );
        }
      });
    });

    return () => {
      unsubPopUp();
      unsubElevated();
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, [uniforms]);

  const onBeforeCompile = useCallback(
    (shader: PaperMaskShader) => {
      Object.assign(shader.uniforms, uniforms);

      shader.fragmentShader = `
      uniform float uVerseVisibility[20];
      uniform float uSectionVisibility[4];
      uniform vec4 uVerseRects[20];
      uniform vec4 uSectionRects[4];
      uniform vec3 uVerseBgColors[20];
      uniform float uPageWidth;
      uniform float uPageHeight;
      uniform sampler2D uBaseTexture;
      ${shader.fragmentShader}
    `.replace(
        "#include <map_fragment>",
        `
      #include <map_fragment>
      float lx = vMapUv.x * uPageWidth;
      float ly = (vMapUv.y - 1.0) * uPageHeight;

      // 1. Check Full Section Masking (Highest priority)
      bool sectionHidden = false;
      for (int i = 0; i < 4; i++) {
        vec4 r = uSectionRects[i];
        if (lx >= r.x && lx <= r.x + r.z && ly <= r.y && ly >= r.y - r.w) {
          if (uSectionVisibility[i] < 0.5) {
            sectionHidden = true;
            break;
          }
        }
      }

      if (sectionHidden) {
        diffuseColor = texture2D(uBaseTexture, vMapUv);
      } else {
        // 2. Check Individual Verse Masking
        for (int i = 1; i <= 19; i++) {
          vec4 r = uVerseRects[i];
          
          // Shrink the verse mask slightly for a cleaner "cutout" look
          float shrink = 0.005;
          float rx = r.x + shrink;
          float ry = r.y - shrink;
          float rw = r.z - shrink * 2.0;
          float rh = r.w - shrink * 2.0;

          if (lx >= rx && lx <= rx + rw && ly >= ry - rh && ly <= ry) {
            if (uVerseVisibility[i] < 0.5) {
              // Instead of blank paper, use the background color of the section/connector
              diffuseColor = vec4(uVerseBgColors[i], 1.0);
              break;
            }
          }
        }
      }
      `,
      );
    },
    [uniforms],
  );

  return { onBeforeCompile };
}
