import { PopUpHoverSensors } from "../pop-up-verses/PopUpHoverSensors";
import { VerseController } from "./VerseController";
import { buildVerseConfigs } from "../../../data/surahDataGenerator";
import {
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { useStoryStore } from "../../../stores/useStoryStore";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import { useMemo } from "react";
import { usePopUpStore } from "../../../stores/usePopUpStore";


export function VersesRenderer() {
  const runtime = useSurahLayoutRuntime();
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const activeTextData = useStoryStore((s) => s.activeTextData);
  const surahData = activeTextData[activeLanguage];
  const arabicData = activeTextData["ar"];
  const verseConfigs = useMemo(
    () => buildVerseConfigs(surahData, arabicData, runtime),
    [surahData, arabicData, runtime],
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

    </group>
  );
}
