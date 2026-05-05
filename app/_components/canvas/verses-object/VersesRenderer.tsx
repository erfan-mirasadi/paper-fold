import { VerseFiveMetallic } from "../SurahLayout/VerseFiveMetallic";
import { PopUpHoverSensors } from "../pop-up-verses/hover-scroll/PopUpHoverSensors";
import { VerseController } from "./VerseController";
import { buildVerseConfigs } from "../../../data/surahDataGenerator";
import {
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import { useMemo } from "react";
import { usePopUpStore } from "../../../stores/usePopUpStore";

export function VersesRenderer() {
  const runtime = useSurahLayoutRuntime();
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];
  const verseConfigs = useMemo(
    () => buildVerseConfigs(surahData, runtime),
    [surahData, runtime],
  );

  const zBaseOffset = PAGE_DEPTH / 2 + 0.002;
  const groups = usePopUpStore((state) => state.popUpGroups);
  const setHoveredGroupId = usePopUpStore((state) => state.setHoveredGroupId);

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {verseConfigs.map((config) => (
        <VerseController key={`popup-${config.id}`} config={config} />
      ))}

      <PopUpHoverSensors
        groups={groups}
        versesConfig={verseConfigs}
        zBaseOffset={zBaseOffset}
        setHoveredGroupId={setHoveredGroupId}
      />

      {/* Static Metallic Verse 5 */}
      <VerseFiveMetallic />
    </group>
  );
}
