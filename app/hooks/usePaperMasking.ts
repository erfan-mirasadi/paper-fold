import { useMemo, useEffect, useCallback } from "react";
import { Color, type Texture } from "three";
import { usePopUpStore } from "../stores/usePopUpStore";
import { useElevatedStore } from "../stores/useElevatedStore";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import { ORIGINAL_TEXTURE_TIMING } from "./useFoldAnimation";
import { ELEVATE_TEXTURE_TIMING } from "./useElevateAnimation";
import { useSurahLayoutRuntime } from "./useSurahLayoutRuntime";
import { VERSE_5_6_19_RADIUS } from "../data/SurahConfig";
import { getActiveStoryConfig, useStoryStore } from "../stores/useStoryStore";
import {
  SectionTransforms,
  GroupTransforms,
  ElementTransform,
  GridSectionConfig,
  VerticalGroupsSectionConfig,
  ThemeColors,
} from "../data/schema";

export const MASK_CONFIG = {
  sectionExpand: 0.013,
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
  const folds = getActiveStoryConfig().specialVerses?.middleFoldVerses;
  if (!folds) return false;

  if (state.middleHorizontalFolded === "left") {
    return folds.left.includes(verseId);
  }
  if (state.middleHorizontalFolded === "right") {
    return folds.right.includes(verseId);
  }
  return false;
};

// Calculate MAX_VERSE_ID and TOTAL_SECTIONS dynamically at module load
let _maxVerseId = 0;
let _totalSections = 0;
const verseColorKeys = new Array<keyof ThemeColors | undefined>(200);

getActiveStoryConfig().sections.forEach((sec) => {
  if (sec.type === "gridWithAnaAyet") {
    _totalSections += 1;
    const g = sec as GridSectionConfig;
    _maxVerseId = Math.max(_maxVerseId, ...g.verses, g.anaAyet);
    g.verses.forEach((v) => (verseColorKeys[v] = g.bgThemeKey));
    verseColorKeys[g.anaAyet] = g.bgThemeKey;
  } else if (sec.type === "verticalGroups") {
    _totalSections += 3;
    const v = sec as VerticalGroupsSectionConfig;
    if (v.introVerse) {
      _maxVerseId = Math.max(_maxVerseId, v.introVerse);
      verseColorKeys[v.introVerse] = v.introOutroBgThemeKey;
    }
    if (v.outroVerse) {
      _maxVerseId = Math.max(_maxVerseId, v.outroVerse);
      verseColorKeys[v.outroVerse] = v.introOutroBgThemeKey;
    }
    v.groups.forEach((g) => {
      _maxVerseId = Math.max(_maxVerseId, ...g.verseIds);
      g.verseIds.forEach((vId) => (verseColorKeys[vId] = g.bgThemeKey));
    });
  }
});

const MAX_VERSE_ID = _maxVerseId;
const VERSE_ARR_SIZE = MAX_VERSE_ID + 1;
const TOTAL_SECTIONS = _totalSections;

export function usePaperMasking(paperTextureDiffuse: Texture) {
  const { PAGE_WIDTH, PAGE_HEIGHT, SURAH_TRANSFORMS, FOLD_Y_POSITIONS } =
    useSurahLayoutRuntime();
  const activeConfig = useStoryStore((state) => state.activeConfig);

  const { verseRects, verseRadii, sectionRects, verseBgColors } =
    useMemo(() => {
      const vRects = new Float32Array(VERSE_ARR_SIZE * 4);
      const vRadii = new Float32Array(VERSE_ARR_SIZE);
      const sRects = new Float32Array(TOTAL_SECTIONS * 4);

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

      const PAD = 0.02;
      const exp = MASK_CONFIG.sectionExpand;
      let secIdx = 0;

      activeConfig.sections.forEach((sec, idx) => {
        const sTransform = SURAH_TRANSFORMS.sections[
          idx
        ] as Required<SectionTransforms>;
        if (sec.type === "gridWithAnaAyet") {
          const g = sec as GridSectionConfig;
          // Apply any expand override so the shader cutout matches the actual VerseBox size.
          // Verses without an override fall back to their raw transform.
          g.verses.forEach((vId) => {
            const ov = activeConfig.verseOverrides?.[vId];
            const expandW = ov?.expandW ?? 0;
            const expandH = ov?.expandH ?? 0;
            const rawT = sTransform.verses[vId];
            setVerseRect(
              vId,
              {
                x: rawT.x - expandW,
                y: rawT.y + expandH,
                w: rawT.w + expandW * 2,
                h: rawT.h + expandH * 2,
              },
              ov?.isPill ?? true,
            );
          });

          // anaAyet: always apply its expand override
          const anaOv = activeConfig.verseOverrides?.[g.anaAyet];
          const anaExpandW = anaOv?.expandW ?? 0;
          const anaExpandH = anaOv?.expandH ?? 0;
          const anaRawT = sTransform.anaAyet;
          setVerseRect(
            g.anaAyet,
            {
              x: anaRawT.x - anaExpandW,
              y: anaRawT.y + anaExpandH,
              w: anaRawT.w + anaExpandW * 2,
              h: anaRawT.h + anaExpandH * 2,
            },
            anaOv?.isPill ?? false,
          );

          sRects[secIdx * 4 + 0] = sTransform.frameX - PAD / 2 - exp;
          sRects[secIdx * 4 + 1] = sTransform.frameY + PAD / 2 + exp;
          sRects[secIdx * 4 + 2] = sTransform.frameW + PAD + exp * 2;
          sRects[secIdx * 4 + 3] = sTransform.frameH + PAD + exp * 2;
          secIdx++;
        } else if (sec.type === "verticalGroups") {
          const v = sec as VerticalGroupsSectionConfig;
          if (v.introVerse)
            setVerseRect(v.introVerse, sTransform.introVerse, false);
          if (v.outroVerse)
            setVerseRect(v.outroVerse, sTransform.outroVerse, false);
          v.groups.forEach((gConf, gIdx) => {
            const gTrans = sTransform.groups[gIdx];
            gConf.verseIds.forEach((vId) =>
              setVerseRect(vId, gTrans.verses[vId], true),
            );
          });

          // s2_top
          sRects[secIdx * 4 + 0] = sTransform.frameX - PAD / 2 - exp;
          sRects[secIdx * 4 + 1] = sTransform.shiftedTop + PAD / 2 + exp;
          sRects[secIdx * 4 + 2] = sTransform.frameW + PAD + exp * 2;
          sRects[secIdx * 4 + 3] =
            sTransform.shiftedTop - FOLD_Y_POSITIONS[3] + PAD + exp * 2;
          secIdx++;

          // s2_center
          sRects[secIdx * 4 + 0] = sTransform.frameX - PAD / 2 - exp;
          sRects[secIdx * 4 + 1] = FOLD_Y_POSITIONS[3] + PAD / 2 + exp;
          sRects[secIdx * 4 + 2] = sTransform.frameW + PAD + exp * 2;
          sRects[secIdx * 4 + 3] =
            FOLD_Y_POSITIONS[3] - FOLD_Y_POSITIONS[5] + PAD + exp * 2;
          secIdx++;

          // s2_bottom
          sRects[secIdx * 4 + 0] = sTransform.frameX - PAD / 2 - exp;
          sRects[secIdx * 4 + 1] = FOLD_Y_POSITIONS[5] + PAD / 2 + exp;
          sRects[secIdx * 4 + 2] = sTransform.frameW + PAD + exp * 2;
          sRects[secIdx * 4 + 3] =
            FOLD_Y_POSITIONS[5] - sTransform.shiftedBot + PAD + exp * 2;
          secIdx++;
        }
      });

      const bgColors = new Float32Array(VERSE_ARR_SIZE * 3);
      const tempCol = new Color();
      const setCol = (i: number, hex: string) => {
        tempCol.set(hex);
        bgColors[i * 3 + 0] = tempCol.r;
        bgColors[i * 3 + 1] = tempCol.g;
        bgColors[i * 3 + 2] = tempCol.b;
      };

      for (let i = 1; i <= MAX_VERSE_ID; i++) {
        // Verse-level bg override takes priority over the section-level bgThemeKey.
        // This ensures verses like Verse 5 (anaAyet) get their specific color punched
        // into the paper texture instead of inheriting the section default.
        const overrideBg = activeConfig.verseOverrides?.[i]?.bg;
        if (overrideBg) {
          setCol(i, overrideBg);
          continue;
        }
        const key = verseColorKeys[i];
        if (key && activeConfig.styling.colors[key]) {
          // Type casting is needed because color values could technically be any config property,
          // but we ensure ThemeColors are strictly strings
          const colorHex = activeConfig.styling.colors[key] as string;
          setCol(i, colorHex);
        }
      }

      return {
        verseRects: vRects,
        verseRadii: vRadii,
        sectionRects: sRects,
        verseBgColors: bgColors,
      };
    }, [SURAH_TRANSFORMS, FOLD_Y_POSITIONS, activeConfig]);

  const uniforms = useMemo(
    () => ({
      uVerseVisibility: { value: new Float32Array(VERSE_ARR_SIZE).fill(1.0) },
      uSectionVisibility: { value: new Float32Array(TOTAL_SECTIONS).fill(1.0) },
      uVerseRects: { value: new Float32Array(VERSE_ARR_SIZE * 4) },
      uVerseRadii: { value: new Float32Array(VERSE_ARR_SIZE) },
      uSectionRects: { value: new Float32Array(TOTAL_SECTIONS * 4) },
      uVerseBgColors: { value: new Float32Array(VERSE_ARR_SIZE * 3) },
      uPageWidth: { value: 1.54 },
      uPageHeight: { value: 1.76 },
      uBaseTexture: { value: paperTextureDiffuse },
      uVerseExpand: { value: 0.005 },
    }),
    [paperTextureDiffuse],
  );

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

  useEffect(() => {
    uniforms.uBaseTexture.value = paperTextureDiffuse;
  }, [paperTextureDiffuse, uniforms]);

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

        const isIntroActiveNow = useFoldStore.getState().isIntroActive;
        const currentOffsetNow = useFoldStore.getState().currentOffset;
        const isFoldedMainPaperNow =
          !isIntroActiveNow && currentOffsetNow < 0.98;

        const g = s.popUpGroups.find((group) => group.verseIds.includes(id));
        const isHidden =
          (!isFoldedMainPaperNow && e.activeVerseIds.includes(id)) ||
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
    const isIntroActive = useFoldStore.getState().isIntroActive;
    const currentOffset = useFoldStore.getState().currentOffset;
    const isFoldedMainPaper = !isIntroActive && currentOffset < 0.98;

    for (let i = 1; i <= MAX_VERSE_ID; i++) {
      let hidden = !isFoldedMainPaper && e.activeVerseIds.includes(i);
      if (!hidden) {
        const g = s.popUpGroups.find((group) => group.verseIds.includes(i));
        if (g?.isOpen) hidden = true;
      }
      if (isMiddleHorizontalFoldedForVerse(s, i)) hidden = true;
      uniforms.uVerseVisibility.value[i] = hidden ? 0.0 : 1.0;
    }

    const sectionMap: Record<string, number> = {};
    let sIdx = 0;
    activeConfig.sections.forEach((sec) => {
      if (sec.type === "gridWithAnaAyet") {
        sectionMap[sec.id] = sIdx++;
      } else if (sec.type === "verticalGroups") {
        sectionMap[`${sec.id}_top`] = sIdx++;
        sectionMap[`${sec.id}_center`] = sIdx++;
        sectionMap[`${sec.id}_bottom`] = sIdx++;
      }
    });

    Object.entries(sectionMap).forEach(([id, idx]) => {
      const isElevated = e.activeSectionIds.includes(id);
      uniforms.uSectionVisibility.value[idx] =
        isElevated && !isIntroActive && !isFoldedMainPaper ? 0.0 : 1.0;
    });

    const unsubPopUp = usePopUpStore.subscribe((state, prevState) => {
      const idsToCheck = new Set<number>();

      state.popUpGroups.forEach((g, idx) => {
        if (g.isOpen !== prevState.popUpGroups[idx]?.isOpen) {
          g.verseIds.forEach((id) => idsToCheck.add(id));
        }
      });

      if (state.middleHorizontalFolded !== prevState.middleHorizontalFolded) {
        const middleFoldVerses =
          activeConfig.specialVerses?.middleFoldVerses;
        if (middleFoldVerses) {
          [...middleFoldVerses.left, ...middleFoldVerses.right].forEach((id) =>
            idsToCheck.add(id),
          );
        }
      }

      idsToCheck.forEach((id) => {
        const g = state.popUpGroups.find((group) =>
          group.verseIds.includes(id),
        );

        const isIntroActiveNow = useFoldStore.getState().isIntroActive;
        const currentOffsetNow = useFoldStore.getState().currentOffset;
        const isFoldedMainPaperNow =
          !isIntroActiveNow && currentOffsetNow < 0.98;

        const shouldBeHidden =
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(state, id) ||
          (!isFoldedMainPaperNow &&
            useElevatedStore.getState().activeVerseIds.includes(id));

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

        const isIntroActive = useFoldStore.getState().isIntroActive;
        const currentOffset = useFoldStore.getState().currentOffset;
        const isFoldedMainPaper = !isIntroActive && currentOffset < 0.98;

        const shouldBeHidden =
          (!isFoldedMainPaper && state.activeVerseIds.includes(id)) ||
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(usePopUpStore.getState(), id);

        const delay = shouldBeHidden
          ? ELEVATE_TEXTURE_TIMING.hideDelay
          : ELEVATE_TEXTURE_TIMING.showDelay;

        updateVerse(id, delay);
      });

      Object.entries(sectionMap).forEach(([sid, idx]) => {
        const now = state.activeSectionIds.includes(sid);
        const prev = prevState.activeSectionIds.includes(sid);
        if (now !== prev) {
          const introNow = useFoldStore.getState().isIntroActive;
          const currentOffset = useFoldStore.getState().currentOffset;
          const isFoldedMainPaper = !introNow && currentOffset < 0.98;
          const shouldBeVisible = !now || introNow || isFoldedMainPaper;
          updateSection(
            idx,
            shouldBeVisible,
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
      uniform float uVerseVisibility[${VERSE_ARR_SIZE}];
      uniform float uSectionVisibility[${TOTAL_SECTIONS}];
      uniform vec4 uVerseRects[${VERSE_ARR_SIZE}];
      uniform float uVerseRadii[${VERSE_ARR_SIZE}];
      uniform float uVerseExpand;
      uniform vec4 uSectionRects[${TOTAL_SECTIONS}];
      uniform vec3 uVerseBgColors[${VERSE_ARR_SIZE}];
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
      for (int i = 0; i < ${TOTAL_SECTIONS}; i++) {
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
        for (int i = 1; i <= ${MAX_VERSE_ID}; i++) {
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
