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
  s2IntroOutroBg: string;
  s2Group1Bg: string;
  s2Group2Bg: string;
  s2Group3Bg: string;
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
  bgThemeKey?: keyof ThemeColors;
}

export interface GridSectionConfig {
  id: string;
  type: "gridWithAnaAyet";
  labelKey?: string;
  verses: number[]; 
  anaAyet: number;
  bgThemeKey?: keyof ThemeColors;
}

export interface VerticalGroupsSectionConfig {
  id: string;
  type: "verticalGroups";
  topLabelKey?: string;
  bottomLabelKey?: string;
  introVerse?: number;
  outroVerse?: number;
  introOutroBgThemeKey?: keyof ThemeColors;
  groups: VerseBlockConfig[];
}

export type SectionConfig = GridSectionConfig | VerticalGroupsSectionConfig;

export interface SpecialVerses {
  metallicVerseId?: number;
  middleFoldVerses?: { left: number[]; right: number[] };
}

export interface SurahAssets {
  metallicVerseBorderSvg?: string;
}

export interface SurahLayoutConfig<TParams = any> {
  id: string;
  features: SurahFeatures;
  dimensions: LayoutDimensions;
  styling: LayoutStyling;
  specialVerses: SpecialVerses;
  assets?: SurahAssets;
  params: TParams;
  sections: SectionConfig[];
}

// ----------------------------------------------------------------------------
// LAYOUT ENGINE TYPES
// ----------------------------------------------------------------------------

export interface ElementTransform {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

export interface RowConnectorTransform {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

export interface GroupTransforms {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  isPushedIn: boolean;
  isCenter: boolean;
  verses: Record<number, ElementTransform>;
  rowConnectors: RowConnectorTransform[];
}

export interface SectionTransforms {
  frameX: number;
  frameY?: number;
  frameW: number;
  frameH?: number;
  shiftedTop?: number;
  shiftedBot?: number;
  shiftedH?: number;
  connectorX?: number;
  connectorW?: number;
  topConnectorY?: number;
  topConnectorH?: number;
  bottomConnectorY?: number;
  bottomConnectorH?: number;
  borderWidth: number;
  verses?: Record<number, ElementTransform>;
  rowConnectors?: RowConnectorTransform[];
  anaAyet?: ElementTransform;
  anaAyetTabX?: number;
  anaAyetTabY?: number;
  anaAyetTabW?: number;
  anaAyetTabH?: number;
  anaAyetTabBorderWidth?: number;
  anaAyetLabelDrop?: number;
  labelPinY?: number;
  introVerse?: ElementTransform;
  outroVerse?: ElementTransform;
  groups?: GroupTransforms[];
  innerW?: number;
  baseX?: number;
  topLabelPinY?: number;
  bottomLabelPinY?: number;
}
