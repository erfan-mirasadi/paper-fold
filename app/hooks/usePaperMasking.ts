import { useMemo, useEffect, useCallback, useRef } from "react";
import { Color, Vector2, type Texture } from "three";
import {
  createPageDetailUniforms,
  DETAIL_SLOTS,
} from "../_components/canvas/3d-scene/pageTextureLodMath";
import {
  vellumGlsl,
  vellumOctavesForTier,
  VELLUM_UNIFORMS,
} from "../_components/canvas/3d-scene/vellumSurface";
import { detectGpuTier } from "../utils/gpuTier";
import { usePopUpStore } from "../stores/usePopUpStore";
import { useElevatedStore } from "../stores/useElevatedStore";
import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import { ORIGINAL_TEXTURE_TIMING } from "./useFoldAnimation";
import { ELEVATE_TEXTURE_TIMING } from "./useElevateAnimation";
import { useSurahLayoutRuntime } from "./useSurahLayoutRuntime";
import { VERSE_5_6_19_RADIUS } from "../data/SurahConfig";
import { getActiveStoryConfig, useStoryStore } from "../stores/useStoryStore";
import { SectionTransforms, ThemeColors } from "../data/schema";
import {
  FLAT_PAGE_BG_COLOR,
  PAGE_BG_COLOR,
  S1_INNER_BG,
  S1_INNER_BORDER,
  VELLUM_PAGE_COLOR,
} from "../data/theme";
import { getSectionPriority } from "../utils/sectionResolver";

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

// Maximum bounds for shader arrays to support any surah without recompiling
const MAX_VERSE_ID = 100;
const VERSE_ARR_SIZE = MAX_VERSE_ID + 1;
const TOTAL_SECTIONS = 10;

/**
 * One detail slot's compositing, with the slot number written in as a LITERAL.
 *
 * Unrolled here rather than left as a `for` loop in GLSL because a sampler
 * array may only be indexed by a constant integral expression: a loop counter
 * does not qualify, however obviously constant its bounds are, and the shader
 * fails to compile — silently on some drivers, with a black page on the rest.
 * Written out per slot, every index is a literal and there is nothing for a
 * driver to disagree about.
 */
const detailSlotSource = Array.from(
  { length: DETAIL_SLOTS },
  (_, i) => `
      if (uDetailStrength[${i}] > 0.0) {
        vec2 dUv${i} = (vMapUv - uDetailRect[${i}].xy) / uDetailRect[${i}].zw;
        if (dUv${i}.x > 0.0 && dUv${i}.x < 1.0 && dUv${i}.y > 0.0 && dUv${i}.y < 1.0) {
          vec2 edge${i} = smoothstep(vec2(0.0), vec2(uDetailFeather), dUv${i}) *
                      (1.0 - smoothstep(vec2(1.0 - uDetailFeather), vec2(1.0), dUv${i}));

          // The patch, with the edge contrast two resamplings cost put back —
          // see DETAIL_SHARPEN. Four neighbours make the blur this subtracts
          // from centre; on the paper they all agree and nothing happens, on a
          // stroke of script they do not and the stroke gets its edge back.
          vec4 mid${i} = texture2D(uDetailMap[${i}], dUv${i});
          vec4 ring${i} =
            texture2D(uDetailMap[${i}], dUv${i} + vec2(uDetailTexel.x, 0.0)) +
            texture2D(uDetailMap[${i}], dUv${i} - vec2(uDetailTexel.x, 0.0)) +
            texture2D(uDetailMap[${i}], dUv${i} + vec2(0.0, uDetailTexel.y)) +
            texture2D(uDetailMap[${i}], dUv${i} - vec2(0.0, uDetailTexel.y));
          vec4 sharp${i} = mid${i} + (mid${i} - ring${i} * 0.25) * uDetailSharpen;
          // Never below black: an overshoot on the dark side of a stroke would
          // otherwise come back as a negative that the lighting then amplifies.
          sharp${i} = max(sharp${i}, vec4(0.0));

          // map_fragment leaves diffuseColor as (material colour x map), so the
          // detail has to be tinted the same way or the patch reads brighter.
          diffuseColor = mix(
            diffuseColor,
            vec4(diffuse, opacity) * sharp${i},
            uDetailStrength[${i}] * min(edge${i}.x, edge${i}.y)
          );
        }
      }`,
).join("\n");

export function usePaperMasking(paperTextureDiffuse: Texture) {
  const { PAGE_WIDTH, PAGE_HEIGHT, SURAH_TRANSFORMS, FOLD_Y_POSITIONS } =
    useSurahLayoutRuntime();
  const activeConfig = useStoryStore((state) => state.activeConfig);

  const { verseRects, verseRadii, sectionRects, verseBgColors } =
    useMemo(() => {
      const vRects = new Float32Array(VERSE_ARR_SIZE * 4);
      const vRadii = new Float32Array(VERSE_ARR_SIZE);
      const verseIsPill = new Array<boolean>(VERSE_ARR_SIZE).fill(true);
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
        verseIsPill[num] = isPill;
      };

      const PAD = 0.02;
      const exp = MASK_CONFIG.sectionExpand;
      let secIdx = 0;

      {
        const hasCustomSections = Boolean(activeConfig.customSections?.length);
        const blocks = activeConfig.blocks ?? [];

        blocks.forEach((block: any, blockIdx: number) => {
          if (block.type === "spacer") return;
          const sTransform = SURAH_TRANSFORMS.sections[blockIdx] as
            | Required<SectionTransforms>
            | undefined;
          if (!sTransform) return;

          // Grid block (Alak's Section 1): verses + AnaAyet live directly on
          // the section transform, not inside a `groups[0]`.
          if (block.type === "grid") {
            (block.verseIds ?? []).forEach((vId: number) => {
              const rawT = sTransform.verses?.[vId];
              if (!rawT) return;
              const ov = activeConfig.verseOverrides?.[vId];
              const expandW = ov?.expandW ?? 0;
              const expandH = ov?.expandH ?? 0;
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
            if (block.anaAyetId !== undefined && sTransform.anaAyet) {
              const ov = activeConfig.verseOverrides?.[block.anaAyetId];
              const expandW = ov?.expandW ?? 0;
              const expandH = ov?.expandH ?? 0;
              const rawT = sTransform.anaAyet;
              setVerseRect(
                block.anaAyetId,
                {
                  x: rawT.x - expandW,
                  y: rawT.y + expandH,
                  w: rawT.w + expandW * 2,
                  h: rawT.h + expandH * 2,
                },
                ov?.isPill ?? false,
              );
            }
            return;
          }

          const group = sTransform.groups?.[0];
          if (!group) return;

          (block.verseIds ?? []).forEach((vId: number) => {
            const rawT = group.verses[vId];
            if (!rawT) return;
            const ov = activeConfig.verseOverrides?.[vId];
            const expandW = ov?.expandW ?? 0;
            const expandH = ov?.expandH ?? 0;
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
        });

        if (!hasCustomSections) {
          // "perBlock" elevation (Fatiha, Kafirun): one mask rect per block,
          // scoped to that block's own frame — EXCEPT for "big" (isPill:false)
          // verse blocks (e.g. Kafirun's verse 1/6, Fatiha's verse 1/2/5),
          // which must mask exactly like Alak's intro/outro verses: through
          // their own precise per-verse rounded-rect (uVerseRects/uVerseRadii)
          // only. A rectangular section mask would clip their rounded corners.
          const sectionPriority = getSectionPriority();
          sectionPriority.forEach((sectionId) => {
            const blockIdx = blocks.findIndex((b: any) => b.id === sectionId);
            const block = blocks[blockIdx];
            const sTransform = SURAH_TRANSFORMS.sections[blockIdx] as
              | Required<SectionTransforms>
              | undefined;
            const hasBigVerse = (block?.verseIds ?? []).some(
              (vId: number) => activeConfig.verseOverrides?.[vId]?.isPill === false,
            );
            if (!sTransform || hasBigVerse) { secIdx++; return; }
            sRects[secIdx * 4 + 0] = sTransform.frameX - PAD / 2 - exp;
            sRects[secIdx * 4 + 1] = sTransform.frameY! + PAD / 2 + exp;
            sRects[secIdx * 4 + 2] = sTransform.frameW + PAD + exp * 2;
            sRects[secIdx * 4 + 3] = sTransform.frameH! + PAD + exp * 2;
            secIdx++;
          });
        }
        // customSections (Ihlas, Ayat al-Kursi, Ahzab): NO section-level rect —
        // per-verse masking (uVerseRects) handles individual capsule cutouts.

        const verseColorKeys: Array<keyof ThemeColors | undefined> = new Array(VERSE_ARR_SIZE);
        const verseIsGrid = new Array<boolean>(VERSE_ARR_SIZE).fill(false);
        blocks.forEach((block: any) => {
          if (block.type === "spacer") return;
          if (block.type === "grid") {
            (block.verseIds ?? []).forEach((vId: number) => { verseIsGrid[vId] = true; });
            if (block.anaAyetId !== undefined) verseIsGrid[block.anaAyetId] = true;
            return;
          }
          (block.verseIds ?? []).forEach((vId: number) => {
            verseColorKeys[vId] = block.bgThemeKey;
          });
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
          const ov = activeConfig.verseOverrides?.[i];
          const isPill = verseIsPill[i];
          let colorHex: string | undefined = isPill ? ov?.border : ov?.bg;
          if (!colorHex) {
            if (verseIsGrid[i]) {
              colorHex = isPill ? S1_INNER_BORDER : S1_INNER_BG;
            } else {
              const key = verseColorKeys[i];
              if (key && activeConfig.styling.colors[key]) {
                colorHex = activeConfig.styling.colors[key] as string;
              }
            }
          }
          if (colorHex) setCol(i, colorHex);
        }

        return {
          verseRects: vRects,
          verseRadii: vRadii,
          sectionRects: sRects,
          verseBgColors: bgColors,
        };
      }

    }, [SURAH_TRANSFORMS, FOLD_Y_POSITIONS, activeConfig]);

  /**
   * The sharp patch a section zoom draws for itself — see `PageTextureLod`.
   * Created for every page, whether or not it has a ladder: the paper material
   * survives paper switches without recompiling, so a shader that only some
   * surahs carry would be the WRONG shader the moment the reader turns the
   * page. With `uDetailStrength` at 0 — which is where it stays for every
   * ordinary surah, forever — this is one uniform comparison per fragment.
   */
  const detailUniforms = useMemo(() => createPageDetailUniforms(), []);
  /** Handed to the ladder as a ref: it writes to these every frame. */
  const detailRef = useRef(detailUniforms);

  const uniforms = useMemo(
    () => ({
      ...detailUniforms,
      /*
       * The vellum's taste dials, as LIVE uniform objects shared with the dev
       * panel — see `VELLUM_DIALS`. Spread by reference on purpose: three binds
       * these exact objects, so writing `.value` from the panel reaches the GPU
       * on the next frame with no recompile and no remount.
       */
      ...VELLUM_UNIFORMS,
      uVerseVisibility: { value: new Float32Array(VERSE_ARR_SIZE).fill(1.0) },
      uSectionVisibility: { value: new Float32Array(TOTAL_SECTIONS).fill(1.0) },
      /**
       * Whether either mask has anything to say at all, and how far up the
       * verse loop has to count — see `refreshMaskSummary`. Three numbers that
       * let the fragment shader skip both loops outright, which is what it does
       * for almost every frame this app ever draws.
       */
      uAnyVerseHidden: { value: 0 },
      uMaxHiddenVerseId: { value: 0 },
      uAnySectionHidden: { value: 0 },
      uVerseRects: { value: new Float32Array(VERSE_ARR_SIZE * 4) },
      uVerseRadii: { value: new Float32Array(VERSE_ARR_SIZE) },
      uSectionRects: { value: new Float32Array(TOTAL_SECTIONS * 4) },
      uVerseBgColors: { value: new Float32Array(VERSE_ARR_SIZE * 3) },
      uPageWidth: { value: 1.54 },
      uPageHeight: { value: 1.76 },
      uBaseTexture: { value: paperTextureDiffuse },
      uVerseExpand: { value: 0.005 },
      /**
       * Whether this paper HAS a photograph to reveal — see
       * `SurahFeatures.flatPaperSurface`. Set per paper by the effect below,
       * never a constant: the paper material survives a switch without
       * recompiling, so this has to follow the page rather than the shader.
       */
      uFlatPaper: { value: 0 },
      /**
       * What bare paper looks like when there is no photograph of it — the
       * colour the page is cleared to, so a lifted section reveals the same
       * paper the rest of the page is made of. Set per paper below.
       */
      uBarePaper: { value: new Color(PAGE_BG_COLOR) },
      /**
       * Whether this paper is VELLUM — see `SurahFeatures.vellumSurface`. A
       * uniform rather than a compiled-in constant for the same reason
       * `uFlatPaper` is one: the material outlives a paper switch, and the
       * surface has to follow the page rather than the shader.
       */
      uVellum: { value: 0 },
      /**
       * (1, height / width). The surface's noise cells have to be square ON THE
       * PAGE, and the page is not square — feeding it raw UVs stretches every
       * follicle into an oval and the fibre grain along with it.
       */
      uVellumAspect: { value: new Vector2(1, 1) },
      /**
       * Bare skin, before the surface — what the render target was cleared to,
       * which is what the ink is measured against. See `VELLUM_PAGE_COLOR`.
       */
      uVellumPage: { value: new Color(VELLUM_PAGE_COLOR) },
    }),
    [paperTextureDiffuse, detailUniforms],
  );

  useEffect(() => {
    (uniforms.uVerseRects.value as Float32Array).set(verseRects);
    (uniforms.uVerseRadii.value as Float32Array).set(verseRadii);
    (uniforms.uSectionRects.value as Float32Array).set(sectionRects);
    (uniforms.uVerseBgColors.value as Float32Array).set(verseBgColors);
    uniforms.uPageWidth.value = PAGE_WIDTH;
    uniforms.uPageHeight.value = PAGE_HEIGHT;
    const flatPaper = activeConfig.features.flatPaperSurface === true;
    // Vellum REPLACES the flat colour rather than joining it, so it answers for
    // bare paper too — see `SurahFeatures.vellumSurface`.
    const vellum = flatPaper && activeConfig.features.vellumSurface === true;
    uniforms.uFlatPaper.value = flatPaper ? 1 : 0;
    uniforms.uVellum.value = vellum ? 1 : 0;
    (uniforms.uBarePaper.value as Color).set(
      vellum ? VELLUM_PAGE_COLOR : flatPaper ? FLAT_PAGE_BG_COLOR : PAGE_BG_COLOR,
    );
    (uniforms.uVellumAspect.value as Vector2).set(1, PAGE_HEIGHT / PAGE_WIDTH);
  }, [
    verseRects,
    verseRadii,
    sectionRects,
    verseBgColors,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    activeConfig,
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

    /**
     * Re-reads both visibility arrays and writes down what the shader actually
     * needs to know: whether anything is hidden at all, and the last verse id
     * that is.
     *
     * WHY THE SHADER CANNOT WORK THIS OUT FOR ITSELF, AND WHAT IT COST. The
     * fragment shader's masks are two loops — ten sections and a hundred verses
     * — and they ran over EVERY pixel of the page on EVERY frame, whether or
     * not a single thing was hidden. A hundred iterations of "read
     * uVerseVisibility[i], compare, continue" is not free anywhere, and on the
     * weak mobile GPUs this app tries hardest to be kind to it is close to the
     * worst thing a fragment shader can do: indexing a uniform array by a
     * running variable is the case many GLSL ES drivers refuse to keep in
     * registers, and several answer it by unrolling the whole loop — a shader
     * a hundred times the size, slow to compile and slower to run.
     *
     * None of that work was ever needed. Nothing is hidden while the reader is
     * simply looking at the page: a verse goes dark only for an open pop-up, an
     * elevated verse in all-sections mode, or a middle fold, and a section only
     * while it is elevated. That is a small minority of frames, and the rest
     * were paying the full price of asking.
     *
     * So the question is answered once here, on the CPU, whenever the answer
     * can actually change — a hundred and eleven array reads, at the moment a
     * pop-up opens rather than at sixty frames a second times every pixel.
     */
    const refreshMaskSummary = () => {
      const verses = uniforms.uVerseVisibility.value as Float32Array;
      let maxHidden = 0;
      for (let i = 1; i <= MAX_VERSE_ID; i++) {
        if (verses[i] < 0.5) maxHidden = i;
      }
      uniforms.uMaxHiddenVerseId.value = maxHidden;
      uniforms.uAnyVerseHidden.value = maxHidden > 0 ? 1 : 0;

      const sections = uniforms.uSectionVisibility.value as Float32Array;
      let anySection = 0;
      for (let i = 0; i < TOTAL_SECTIONS; i++) {
        if (sections[i] < 0.5) {
          anySection = 1;
          break;
        }
      }
      uniforms.uAnySectionHidden.value = anySection;
    };

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
          (!isFoldedMainPaperNow &&
            e.isAllSectionsMode &&
            e.activeVerseIds.includes(id)) ||
          (g?.isOpen ?? false) ||
          isMiddleHorizontalFoldedForVerse(s, id);

        uniforms.uVerseVisibility.value[id] = isHidden ? 0.0 : 1.0;
        refreshMaskSummary();
        delete timeouts[key];
      }, delay);
    };

    const updateSection = (idx: number, visible: boolean, delay: number) => {
      const key = `s${idx}`;
      if (timeouts[key]) clearTimeout(timeouts[key]);
      timeouts[key] = setTimeout(() => {
        uniforms.uSectionVisibility.value[idx] = visible ? 1.0 : 0.0;
        refreshMaskSummary();
        delete timeouts[key];
      }, delay);
    };

    const s = usePopUpStore.getState();
    const e = useElevatedStore.getState();
    const isIntroActive = useFoldStore.getState().isIntroActive;
    const currentOffset = useFoldStore.getState().currentOffset;
    const isFoldedMainPaper = !isIntroActive && currentOffset < 0.98;

    uniforms.uVerseVisibility.value.fill(1.0);
    uniforms.uSectionVisibility.value.fill(1.0);

    for (let i = 1; i <= MAX_VERSE_ID; i++) {
      let hidden =
        !isFoldedMainPaper && e.isAllSectionsMode && e.activeVerseIds.includes(i);
      if (!hidden) {
        const g = s.popUpGroups.find((group) => group.verseIds.includes(i));
        if (g?.isOpen) hidden = true;
      }
      if (isMiddleHorizontalFoldedForVerse(s, i)) hidden = true;
      uniforms.uVerseVisibility.value[i] = hidden ? 0.0 : 1.0;
    }

    // Same id set/order as the shared elevation resolver (SECTION_PRIORITY),
    // which is what `e.activeSectionIds` below is actually populated from —
    // keeping this in sync via one shared source instead of re-deriving the
    // section-id scheme a third time (engine-agnostic for free).
    const sectionMap: Record<string, number> = {};
    getSectionPriority().forEach((id, idx) => {
      sectionMap[id] = idx;
    });

    Object.entries(sectionMap).forEach(([id, idx]) => {
      const isElevated = e.activeSectionIds.includes(id);
      uniforms.uSectionVisibility.value[idx] =
        isElevated && e.isAllSectionsMode && !isIntroActive && !isFoldedMainPaper
          ? 0.0
          : 1.0;
    });

    // Both arrays have just been rebuilt from scratch above.
    refreshMaskSummary();

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
            useElevatedStore.getState().isAllSectionsMode &&
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
          (!isFoldedMainPaper &&
            state.isAllSectionsMode &&
            state.activeVerseIds.includes(id)) ||
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
          const shouldBeVisible =
            !now || introNow || isFoldedMainPaper || !state.isAllSectionsMode;
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
      uniform float uAnyVerseHidden;
      uniform float uMaxHiddenVerseId;
      uniform float uAnySectionHidden;
      uniform vec4 uVerseRects[${VERSE_ARR_SIZE}];
      uniform float uVerseRadii[${VERSE_ARR_SIZE}];
      uniform float uVerseExpand;
      uniform vec4 uSectionRects[${TOTAL_SECTIONS}];
      uniform vec3 uVerseBgColors[${VERSE_ARR_SIZE}];
      uniform float uPageWidth;
      uniform float uPageHeight;
      uniform sampler2D uBaseTexture;
      uniform float uFlatPaper;
      uniform vec3 uBarePaper;
      uniform float uVellum;
      uniform vec2 uVellumAspect;
      uniform vec3 uVellumPage;
      uniform sampler2D uDetailMap[${DETAIL_SLOTS}];
      uniform vec4 uDetailRect[${DETAIL_SLOTS}];
      uniform float uDetailStrength[${DETAIL_SLOTS}];
      uniform float uDetailFeather;
      uniform vec2 uDetailTexel;
      uniform float uDetailSharpen;
      ${shader.fragmentShader}
    `
      /*
       * The vellum, spliced in immediately above `main()` rather than at the top
       * with the uniforms — `vlApply` reads three's own `map` sampler for the
       * ink pooling, and that is not declared until `map_pars_fragment`, well
       * below where this block would otherwise land.
       *
       * Compiled in for EVERY paper, gated at runtime by `uVellum`. The material
       * survives a paper switch without recompiling, so a shader that only knew
       * about vellum when it happened to be built for a vellum page would be the
       * wrong shader the moment the reader turned to one.
       */
      .replace(
        "void main() {",
        `${vellumGlsl(vellumOctavesForTier(detectGpuTier()))}\nvoid main() {`,
      )
      .replace(
        "#include <map_fragment>",
        `
      #include <map_fragment>

      // The zoomed sheets' own sharp pictures, laid over the page's rectangles
      // of them (PageTextureLod). Same content, more texels — so it is a plain
      // swap of where the colour is read from, not a second look. Everything
      // below this point (a hidden verse, a hidden section) still overrides
      // it, exactly as it overrides the page texture.
      //
      // TWO of them, because a reader stepping from one sheet to the next must
      // never watch the one they are still looking at go soft. The patches are
      // different rectangles of the same page, so both are simply drawn; where
      // two zones of one sheet overlap they carry the same picture anyway, and
      // the later one winning costs nothing.
      ${detailSlotSource}

      /*
       * THE PAPER ITSELF — see vellumSurface.ts.
       *
       * Here and not in the page's own RenderTexture, and that is the whole
       * point of it. The RenderTexture is a fixed buffer: anything drawn into it
       * is a picture with a resolution, and a section zoom magnifies it exactly
       * as it magnified the photograph this replaces. This runs in the PAPER'S
       * fragment shader instead — once per screen pixel, on the surface the
       * reader is actually looking at — so the grain is generated at whatever
       * scale the page is being viewed at and there is no zoom that outruns it.
       *
       * After the detail patches on purpose: they carry the same page at more
       * texels, and the skin is under all of it either way.
       */
      vec3 vlTone = vec3(1.0);
      if (uVellum > 0.5) {
        vlApply(diffuseColor, diffuse, vMapUv, uVellumAspect, uVellumPage, vlTone);
      }

      float lx = vMapUv.x * uPageWidth;
      float ly = (vMapUv.y - 1.0) * uPageHeight;

      // 1. Check Full Section Masking
      //
      // Skipped whole when nothing is hidden, which is almost always — see
      // refreshMaskSummary in usePaperMasking. One uniform comparison stands in
      // for ten iterations of reading a uniform array by a running index, the
      // thing weak GLSL ES drivers handle worst.
      bool sectionHidden = false;
      if (uAnySectionHidden > 0.5) {
        for (int i = 0; i < ${TOTAL_SECTIONS}; i++) {
          vec4 r = uSectionRects[i];
          if (lx >= r.x && lx <= r.x + r.z && ly <= r.y && ly >= r.y - r.w) {
            if (uSectionVisibility[i] < 0.5) {
              sectionHidden = true;
              break;
            }
          }
        }
      }

      if (sectionHidden) {
        // The bare paper under a lifted section. A page that carries no
        // photograph of paper has its own colour revealed instead — see
        // SurahFeatures.flatPaperSurface. Sampling the photograph here
        // regardless would put the one stretched, blurry thing this page was
        // built to avoid back on screen, in the very rectangle the reader is
        // looking straight at.
        //
        // A VELLUM page keeps the SURFACE, not just the colour: it was already
        // computed at this pixel above, so the rectangle a lifted section
        // leaves behind carries the same mottle, the same marks and the same
        // edge toning as the page around it. Revealing a flat swatch in the
        // middle of a textured sheet is precisely as wrong as revealing a
        // blurry one.
        //
        // ...and it is written as (material x page x surface), which is the
        // same product map_fragment forms for every other pixel of the page.
        // The two branches below are NOT — they hand back a bare colour with
        // the material's own contribution left out, so the patch they reveal
        // sits about eight tenths of a stop brighter than the paper around it.
        // That is how those papers have always looked and it is not this
        // change's business to alter them, but the vellum page is new and
        // should be right.
        if (uVellum > 0.5) {
          diffuseColor = vec4(diffuse * uVellumPage * vlTone, 1.0);
        } else if (uFlatPaper > 0.5) {
          diffuseColor = vec4(uBarePaper, 1.0);
        } else {
          diffuseColor = texture2D(uBaseTexture, vMapUv);
        }
      } else if (uAnyVerseHidden > 0.5) {
        // 2. Check Individual Verse Masking with SDF (Rounded rectangles)
        //
        // The loop's bound has to be a constant, so it stays a hundred — but it
        // stops at the last verse actually hidden, which is a low number on
        // every page there is, and it is not entered at all unless something is.
        for (int i = 1; i <= ${MAX_VERSE_ID}; i++) {
          if (float(i) > uMaxHiddenVerseId) break;
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

  return { onBeforeCompile, detailRef };
}
