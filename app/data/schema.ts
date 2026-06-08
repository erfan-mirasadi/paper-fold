export interface Verse {
  number: number;
  text: string;
}

export interface SurahTextData {
  bismillah?: string;
  labels: Record<string, string>;
  verses: Record<number, Verse>;
}

export interface SurahFeatures {
  hasIntro: boolean;
  hasElevatedSections: boolean;
  hasPopUps: boolean;
}

export interface LayoutDimensions {
  paperWidth: number;
  paperHeight: number;
  sceneCenterYOffset: number;
  padding: number;
}

export interface ThemeColors {
  paperBase: string;
  shadow: string;
  backface: string;
  textDark: string;
  textLabel: string;
  circleBorder: string;
  verseNumberText: string;
  s1AnaLabelBg: string;
  s1AnaLabelText: string;
  s1AnaLabelBorder: string;
  s2FrameBg: string;
  boarderFrame: string;
  boarderHalo: string;
  innerCard: string;
  sectionBgTexture: string;
  hollowConnectorInnerBg: string;
  maroonTheme: string;
  greenTheme: string;
  s1InnerBorder: string;
}

export interface LayoutStyling {
  colors: ThemeColors;
  capsuleBorderWidth: number;
  circleBorderWidth: number;
  verseRadius: number;
  oppositeVerseConnectorRadius: number;
  s1NeonConfig?: any;
  elevatedSectionRadii: {
    base: number;
    scallopX: number;
    scallopY: number;
    outer: number;
    innerA: number;
    innerB: number;
  };
}

export interface VerseBlockConfig {
  verseIds: number[];
  isPushedIn?: boolean;
  isCenter?: boolean;
  extraRowGap?: number;
  isMetallic?: boolean;
}

export interface GridSectionConfig {
  id: string;
  type: "gridWithAnaAyet";
  labelKey?: string;
  verses: number[]; 
  anaAyet: number;
}

export interface VerticalGroupsSectionConfig {
  id: string;
  type: "verticalGroups";
  topLabelKey?: string;
  bottomLabelKey?: string;
  introVerse?: number;
  outroVerse?: number;
  groups: VerseBlockConfig[];
}

export type SectionConfig = GridSectionConfig | VerticalGroupsSectionConfig;

export interface SpecialVerses {
  metallicVerseId?: number;
}

export interface SurahLayoutConfig<TParams = any> {
  id: string;
  features: SurahFeatures;
  dimensions: LayoutDimensions;
  styling: LayoutStyling;
  specialVerses: SpecialVerses;
  params: TParams;
  sections: SectionConfig[];
}
