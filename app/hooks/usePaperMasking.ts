import { useMemo, useEffect, useCallback } from "react";
import { Color, type Texture } from "three";
import { usePopUpStore } from "../stores/usePopUpStore";
import {
  useElevatedStore,
  type ElevatedSectionId,
} from "../stores/useElevatedStore";
import { ORIGINAL_TEXTURE_TIMING } from "./useFoldAnimation";
import { ELEVATE_TEXTURE_TIMING } from "./useElevateAnimation";
import { S1_INNER_BORDER } from "../data/theme";
import { useSurahLayoutRuntime } from "./useSurahLayoutRuntime";
import { VERSE_5_6_19_RADIUS } from "../data/SurahConfig";

export const MASK_CONFIG = {
  // Increase this to make the full section masks larger (e.g., 0.02, 0.03)
  sectionExpand: 0.013,
  // Increase this to make the capsule/verse masks larger (e.g., 0.005, 0.01)
  verseExpand: 0.006,
};

interface PaperMaskShader {
  uniforms: Record<string, unknown>;
  fragmentShader: string;
}

const isMiddleHorizontalFoldedForVerse = (
  state: { middleHorizontalFolded: "left" | "right" | null },
  verseId: number,
) => {
  if (state.middleHorizontalFolded === "left") {
    return verseId === 12 || verseId === 14;
  }
  if (state.middleHorizontalFolded === "right") {
    return verseId === 11 || verseId === 13;
  }
  return false;
};

export function usePaperMasking(paperTextureDiffuse: Texture) {
  // Read exact layout numbers dynamically to support language swapping
  const { PAGE_WIDTH, PAGE_HEIGHT, SURAH_TRANSFORMS, FOLD_Y_POSITIONS } =
    useSurahLayoutRuntime();

  // Memoize geometry to avoid creating Float32Arrays constantly
  const { verseRects, verseRadii, sectionRects, verseBgColors } =
    useMemo(() => {
      const s1 = SURAH_TRANSFORMS.s1;
      const s2 = SURAH_TRANSFORMS.s2;

      const vRects = new Float32Array(20 * 4);
      const vRadii = new Float32Array(20);

      const setVerseRect = (
        num: number,
        t: { x: number; y: number; w: number; h: number },
        isPill: boolean,
      ) => {
        vRects[num * 4 + 0] = t.x;
        vRects[num * 4 + 1] = t.y;
        vRects[num * 4 + 2] = t.w;
        vRects[num * 4 + 3] = t.h;
        vRadii[num] = isPill ? t.h / 2.0 : VERSE_5_6_19_RADIUS;
      };

      Object.entries(s1.verses).forEach(([num, t]) =>
        setVerseRect(parseInt(num), t, true),
      );
      setVerseRect(5, s1.anaAyet, false);
      setVerseRect(6, s2.introVerse, false);
      s2.groups.forEach((g) => {
        Object.entries(g.verses).forEach(([num, t]) =>
          setVerseRect(parseInt(num), t, true),
        );
      });
      setVerseRect(19, s2.outroVerse, false);

      const sRects = new Float32Array(4 * 4);
      const PAD = 0.02;
      const exp = MASK_CONFIG.sectionExpand;

      sRects[0 * 4 + 0] = s1.frameX - PAD / 2 - exp;
      sRects[0 * 4 + 1] = s1.frameY + PAD / 2 + exp;
      sRects[0 * 4 + 2] = s1.frameW + PAD + exp * 2;
      sRects[0 * 4 + 3] = s1.frameH + PAD + exp * 2;

      sRects[1 * 4 + 0] = s2.frameX - PAD / 2 - exp;
      sRects[1 * 4 + 1] = s2.shiftedTop + PAD / 2 + exp;
      sRects[1 * 4 + 2] = s2.frameW + PAD + exp * 2;
      sRects[1 * 4 + 3] = s2.shiftedTop - FOLD_Y_POSITIONS[3] + PAD + exp * 2;

      sRects[2 * 4 + 0] = s2.frameX - PAD / 2 - exp;
      sRects[2 * 4 + 1] = FOLD_Y_POSITIONS[3] + PAD / 2 + exp;
      sRects[2 * 4 + 2] = s2.frameW + PAD + exp * 2;
      sRects[2 * 4 + 3] =
        FOLD_Y_POSITIONS[3] - FOLD_Y_POSITIONS[5] + PAD + exp * 2;

      sRects[3 * 4 + 0] = s2.frameX - PAD / 2 - exp;
      sRects[3 * 4 + 1] = FOLD_Y_POSITIONS[5] + PAD / 2 + exp;
      sRects[3 * 4 + 2] = s2.frameW + PAD + exp * 2;
      sRects[3 * 4 + 3] = FOLD_Y_POSITIONS[5] - s2.shiftedBot + PAD + exp * 2;

      const bgColors = new Float32Array(20 * 3);
      const tempCol = new Color();
      const setCol = (i: number, hex: string) => {
        tempCol.set(hex);
        bgColors[i * 3 + 0] = tempCol.r;
        bgColors[i * 3 + 1] = tempCol.g;
        bgColors[i * 3 + 2] = tempCol.b;
      };

      for (let i = 1; i <= 5; i++) setCol(i, S1_INNER_BORDER);
      const BLUE = "#C4963B";
      setCol(6, BLUE);
      setCol(19, BLUE);
      const MAROON = "#7c8cb0";
      const GREEN = "#5E7367";
      [7, 8, 9, 10].forEach((i) => setCol(i, MAROON));
      [11, 12, 13, 14].forEach((i) => setCol(i, GREEN));
      [15, 16, 17, 18].forEach((i) => setCol(i, MAROON));

      return {
        verseRects: vRects,
        verseRadii: vRadii,
        sectionRects: sRects,
        verseBgColors: bgColors,
      };
    }, [SURAH_TRANSFORMS, FOLD_Y_POSITIONS]);

  // CRITICAL FIX: The uniforms object MUST be stable (empty dependency array).
  const uniforms = useMemo(
    () => ({
      uVerseVisibility: { value: new Float32Array(20).fill(1.0) },
      uSectionVisibility: { value: new Float32Array(4).fill(1.0) },
      uVerseRects: { value: new Float32Array(20 * 4) },
      uVerseRadii: { value: new Float32Array(20) },
      uSectionRects: { value: new Float32Array(4 * 4) },
      uVerseBgColors: { value: new Float32Array(20 * 3) },
      uPageWidth: { value: 1.54 },
      uPageHeight: { value: 1.76 },
      uBaseTexture: { value: paperTextureDiffuse },
      uVerseExpand: { value: 0.005 },
    }),
    [],
  );

  // Sync the latest layout values into the stable uniforms object safely
  // Using .set() ensures Three.js WebGL bindings don't get detached!
  useEffect(() => {
    (uniforms.uVerseRects.value as Float32Array).set(verseRects);
    (uniforms.uVerseRadii.value as Float32Array).set(verseRadii);
    (uniforms.uSectionRects.value as Float32Array).set(sectionRects);
    (uniforms.uVerseBgColors.value as Float32Array).set(verseBgColors);
    uniforms.uPageWidth.value = PAGE_WIDTH;
    uniforms.uPageHeight.value = PAGE_HEIGHT;
  }, [
    verseRects,
    verseRadii,
    sectionRects,
    verseBgColors,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    uniforms,
  ]);

  // Sync texture separately so it doesn't cause unnecessary re-evaluations
  useEffect(() => {
    uniforms.uBaseTexture.value = paperTextureDiffuse;
  }, [paperTextureDiffuse, uniforms]);

  // Sync mask scale separately
  useEffect(() => {
    uniforms.uVerseExpand.value = MASK_CONFIG.verseExpand;
  }, [uniforms]);

  useEffect(() => {
    const timeouts: Record<string, NodeJS.Timeout> = {};

    const updateVerse = (id: number, delay: number) => {
      const key = `v${id}`;
      if (timeouts[key]) clearTimeout(timeouts[key]);
      timeouts[key] = setTimeout(() => {
        const s = usePopUpStore.getState();
        const e = useElevatedStore.getState();

        const g = s.popUpGroups.find((group) => group.verseIds.includes(id));
        const isHidden =
          e.activeVerseIds.includes(id) ||
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(s, id);

        uniforms.uVerseVisibility.value[id] = isHidden ? 0.0 : 1.0;
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

    const s = usePopUpStore.getState();
    const e = useElevatedStore.getState();

    for (let i = 1; i <= 19; i++) {
      let hidden = e.activeVerseIds.includes(i);
      if (!hidden) {
        const g = s.popUpGroups.find((group) => group.verseIds.includes(i));
        if (g?.isOpen) hidden = true;
      }
      if (isMiddleHorizontalFoldedForVerse(s, i)) hidden = true;
      uniforms.uVerseVisibility.value[i] = hidden ? 0.0 : 1.0;
    }

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
      const idsToCheck = new Set<number>();

      state.popUpGroups.forEach((g, idx) => {
        if (g.isOpen !== prevState.popUpGroups[idx]?.isOpen) {
          g.verseIds.forEach((id) => idsToCheck.add(id));
        }
      });

      if (state.middleHorizontalFolded !== prevState.middleHorizontalFolded) {
        [11, 12, 13, 14].forEach((id) => idsToCheck.add(id));
      }

      idsToCheck.forEach((id) => {
        const g = state.popUpGroups.find((group) =>
          group.verseIds.includes(id),
        );
        const shouldBeHidden =
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(state, id) ||
          useElevatedStore.getState().activeVerseIds.includes(id);

        const delay = shouldBeHidden
          ? ORIGINAL_TEXTURE_TIMING.hideDelay
          : ORIGINAL_TEXTURE_TIMING.showDelay;

        updateVerse(id, delay);
      });
    });

    const unsubElevated = useElevatedStore.subscribe((state, prevState) => {
      const idsToCheck = new Set<number>();
      state.activeVerseIds.forEach((id) => {
        if (!prevState.activeVerseIds.includes(id)) idsToCheck.add(id);
      });
      prevState.activeVerseIds.forEach((id) => {
        if (!state.activeVerseIds.includes(id)) idsToCheck.add(id);
      });

      idsToCheck.forEach((id) => {
        const g = usePopUpStore
          .getState()
          .popUpGroups.find((group) => group.verseIds.includes(id));
        const shouldBeHidden =
          state.activeVerseIds.includes(id) ||
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(usePopUpStore.getState(), id);

        const delay = shouldBeHidden
          ? ELEVATE_TEXTURE_TIMING.hideDelay
          : ELEVATE_TEXTURE_TIMING.showDelay;

        updateVerse(id, delay);
      });

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
      uniform float uVerseRadii[20];
      uniform float uVerseExpand;
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

      // 1. Check Full Section Masking
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
        // 2. Check Individual Verse Masking with SDF (Rounded rectangles)
        for (int i = 1; i <= 19; i++) {
          if (uVerseVisibility[i] >= 0.5) continue; // Shader optimization

          vec4 r = uVerseRects[i];
          
          float expand = uVerseExpand;
          float rx = r.x - expand;
          float ry = r.y + expand;
          float rw = r.z + expand * 2.0;
          float rh = r.w + expand * 2.0;
          
          // FAST AABB CHECK (Massive GPU Performance Boost)
          // Skip expensive SDF math if the pixel is outside the expanded verse box
          if (lx < rx || lx > rx + rw || ly < ry - rh || ly > ry) continue;

          float rad = uVerseRadii[i] + expand;
          
          vec2 center = vec2(rx + rw / 2.0, ry - rh / 2.0);
          vec2 halfSize = vec2(rw / 2.0, rh / 2.0);
          
          // Signed Distance Field (SDF) Math
          vec2 d = abs(vec2(lx, ly) - center) - halfSize + vec2(rad);
          float dist = min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rad;

          if (dist <= 0.0) {
            diffuseColor = vec4(uVerseBgColors[i], 1.0);
            break;
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
