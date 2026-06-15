"use client";
import { VerseBox, UiRect, TopLabel } from "./SharedUI";
import type { ColorGroup } from "../../../data/SurahConfig";
import { OPPOSITE_VERSE_CONNECTOR } from "../../../data/SurahConfig";
import type {
  GroupTransforms,
  RowConnectorTransform,
  VerticalGroupsSectionConfig,
} from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

interface VerseGroupProps {
  group: ColorGroup;
  groupTransform: GroupTransforms;
  groupIndex?: number;
  layout?: any; // To receive verseTextScale
}

export function VerseGroup({
  group,
  groupTransform,
  groupIndex,
  layout,
}: VerseGroupProps) {
  const gt = groupTransform;
  const config = useStoryStore((state) => state.activeConfig);
  const activeLanguage = useSurahLanguageStore((state) => state.activeLanguage);

  let finalVerseTextScale = layout?.verseTextScale;
  if (config.id === "ayatalkursi" && activeLanguage !== "ar") {
    finalVerseTextScale = undefined;
  }

  // ── Group-level fallback border color from config.styling.colors ──────────
  // isCenter groups use the green theme key; outer groups use the maroon theme key.
  const groupFallbackBorder = gt.isCenter
    ? config.styling.colors.greenTheme
    : config.styling.colors.maroonTheme;

  // ── Row connector color — derived from the first verse in the group ────────
  // We use the border from the first verse's override if available; otherwise
  // the group-level fallback. This keeps the connector stripe in sync with
  // the verse capsule colours automatically.
  const firstVerseOverride =
    config.verseOverrides?.[group.verses?.[0]?.number ?? -1];
  const borderColor = firstVerseOverride?.border ?? groupFallbackBorder;

  // ── Row connector visibility ───────────────────────────────────────────────
  // Read hideRowConnectors from the verticalGroups section config.
  const sectionConfig = config.sections.find(
    (s) => s.type === "verticalGroups",
  ) as VerticalGroupsSectionConfig | undefined;
  const hideConnectors = sectionConfig?.hideRowConnectors ?? false;

  return (
    <group>
      {/* Row Connectors for opposite verses — hidden when hideRowConnectors is set */}
      {!hideConnectors &&
        gt.rowConnectors.map((rc: RowConnectorTransform, i: number) => {
          const leftV = group.verses[i * 2];
          const rightV = group.verses[i * 2 + 1];

          if (!leftV || !rightV) return null;

          // Per-row connector color — derive from the left verse in this row so
          // each row pair tracks its own hue when overrides differ per row.
          const rowLeftOverride = config.verseOverrides?.[leftV.number];
          const rowBorderColor = rowLeftOverride?.border ?? groupFallbackBorder;

          return (
            <group key={`connector-${i}`}>
              <UiRect
                x={rc.x}
                y={rc.y}
                z={rc.z}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={rowBorderColor}
                renderOrder={3}
              />
            </group>
          );
        })}

      {/* 2×2 verse grid — position comes from the engine, no math here */}
      {group.verses.map((v, i) => {
        // ── Foolproof transform lookup ─────────────────────────────────────────
        // The gt.verses dictionary is keyed by the *Arabic* verse IDs (the ids
        // used in config.sections[*].groups[*].verseIds).  When rendering a
        // non-Arabic language, v.number is still the same verse ID (only the
        // text changes), but in some LTR display orderings the index i inside the
        // group may correspond to a different Arabic verse than v.number would
        // imply.  We resolve this by consulting the active Arabic text data for
        // the current surah, not the hardcoded Alak SURAH_DATA_ARABIC constant.
        let lookupNumber = v.number;

        if (groupIndex !== undefined) {
          // useStoryStore.getState() is the zustand static accessor — safe inside
          // a render function; not a hook call.
          const activeTextData = useStoryStore.getState().activeTextData;
          const arabicData = activeTextData?.["ar"];

          // The verticalGroups section always stores its colorGroups under
          // section2 in SurahDataShape — true for both Alak and Ayat al-Kursi.
          const arabicGroups = arabicData?.section2?.colorGroups;

          const arabicVerseNumber =
            arabicGroups?.[groupIndex]?.verses?.[i]?.number;

          // Only override if the Arabic data gives a *different* number (i.e.
          // the current language displays verses in a different position than
          // the Arabic RTL order and the transform was keyed by the Arabic id).
          if (
            arabicVerseNumber !== undefined &&
            arabicVerseNumber !== v.number
          ) {
            lookupNumber = arabicVerseNumber;
          }
        }

        // Primary lookup by resolved number; fallback to v.number in case the
        // Arabic data and the display data happen to have the same ordering
        // (which is normal for Arabic mode — both resolve to the same key).
        const vt = gt.verses[lookupNumber] ?? gt.verses[v.number];
        if (!vt) return null; // Transform genuinely absent — skip silently.

        // ── Color resolution — 100% config-driven ─────────────────────────────
        // 1. Check verseOverrides for this specific verse number (Arabic ID).
        // 2. Fallback: group.verseBg (SectionTwoData level, rarely set).
        // 3. Final fallback: group-level theme key from styling.colors.
        const override =
          config.verseOverrides?.[lookupNumber] ??
          config.verseOverrides?.[v.number];

        const finalBg =
          override?.bg ??
          group.verseBg ??
          (gt.isCenter
            ? config.styling.colors.greenTheme // centre group bg fallback
            : config.styling.colors.maroonTheme); // outer group bg fallback

        const finalBorder = override?.border ?? groupFallbackBorder;
        const finalCircleBg = override?.circleBg ?? finalBg;
        const finalCircleBorder = override?.circleBorderCol ?? finalBorder;
        const finalCircleText =
          override?.circleTextCol ?? config.styling.colors.verseNumberText;

        const finalTextScale =
          override?.textScaleOverride ?? finalVerseTextScale;

        return (
          <VerseBox
            key={v.number}
            x={vt.x}
            y={vt.y}
            z={vt.z}
            w={vt.w}
            h={vt.h}
            verse={v.text}
            number={v.number}
            bg={finalBg}
            border={finalBorder}
            circleBorderCol={finalCircleBorder}
            circleBg={finalCircleBg}
            circleTextCol={finalCircleText}
            isPill={true}
            textScaleOverride={finalTextScale}
          />
        );
      })}

      {group.topLabel && (
        <TopLabel
          text={group.topLabel}
          x={layout.START_X + layout.sectionW / 2}
          y={gt.frameY + (gt.topLabelConfig?.yOffset ?? 0.07)}
          labelWidth={gt.topLabelConfig?.width ?? 0.3}
          labelHeight={gt.topLabelConfig?.height ?? 0.065}
          textOffsetY={gt.topLabelConfig?.textOffsetY ?? -0.008}
          partialBorder={false}
          bottomBorder={false}
          noBorder={false}
          borderColor={config.styling.colors.maroonTheme}
          bgColor={"#ffffff"}
          shadow={false}
          renderOrder={20}
        />
      )}
    </group>
  );
}
