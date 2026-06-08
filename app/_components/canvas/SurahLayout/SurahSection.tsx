import { SectionConfig, SectionTransforms } from "../../../data/schema";
import { SectionOne } from "./SectionOne";
import { SectionTwo } from "./SectionTwo";

interface SurahSectionProps {
  sectionConfig: SectionConfig;
  transforms: SectionTransforms;
  surahData: any; // We'll pass the whole surahData for now
  layoutMath: any;
  startX: number;
  PW: number;
  isFolded: boolean;
}

export function SurahSection({
  sectionConfig,
  transforms,
  surahData,
  layoutMath,
  startX,
  PW,
  isFolded,
}: SurahSectionProps) {
  switch (sectionConfig.type) {
    case "gridWithAnaAyet":
      return (
        <SectionOne
          data={surahData.section1}
          transforms={transforms}
          PW={PW}
          isFolded={isFolded}
        />
      );
    case "verticalGroups":
      return (
        <SectionTwo
          data={surahData.section2}
          transforms={transforms}
          layout={layoutMath}
          startX={startX}
          PW={PW}
          isFolded={isFolded}
        />
      );
    default:
      return null;
  }
}
