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
  hideVerseNumbers?: boolean;
}

export interface LayoutDimensions {
  paperWidth: number;
  paperHeight: number;
  sceneCenterYOffset: number;
  padding: number;
  scrollPages: number;
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
  /**
   * Color sequence for the side brackets in SideCurves, outermost → innermost.
   * Each entry is { color, fillColor } for the bracket line and its fill mesh.
   * The last entry is always the center (inner) bracket.
   * Provide one entry per bracket (outer brackets first, center last).
   */
  curveColors?: Array<{ color: string; fillColor: string }>;
  
  /**
   * Optional background colors for vertical sections (like Ayat Al Kursi).
   * Usually an array mapping to groups: e.g. [topColor, middleColor, bottomColor].
   */
  sectionBackgrounds?: string[];
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
  isPill?: boolean;
  isSectionIntroOutro?: boolean;
  customFrameSvg?: string;
  anaAyetTab?: {
    x: number;
    y: number;
    w: number;
    h: number;
    borderWidth: number;
    labelDrop?: number;
  };
  isPushedIn?: boolean;
  isCenter?: boolean;
  extraRowGap?: number;
  bgThemeKey?: keyof ThemeColors;
}

export interface CameraTargetConfig {
  y: number;
  fov: number;
  tilt: number;
}

export interface GridSectionConfig {
  id: string;
  type: "gridWithAnaAyet";
  labelKey?: string;
  verses: number[];
  anaAyet: number;
  bgThemeKey?: keyof ThemeColors;
  cameraTarget?: CameraTargetConfig;
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
  cameraTarget?: CameraTargetConfig;
  subCameraTargets?: {
    top?: CameraTargetConfig;
    center?: CameraTargetConfig;
    bottom?: CameraTargetConfig;
  };
  backgroundTexture?: string;
  backgroundScaleX?: number;
  backgroundScaleY?: number;
}

export type SectionConfig = GridSectionConfig | VerticalGroupsSectionConfig;

export interface SpecialVerses {
  middleFoldVerses?: { left: number[]; right: number[] };
  versePairings?: Record<number, number>;
}

export interface VerseOverrideConfig {
  customFrameSvg?: string;
  expandW?: number;
  expandH?: number;
  /** Custom scale for the SVG frame when rendering in left-to-right languages */
  frameScaleLTR?: number;
  /** When false, the verse renders as a rounded rectangle instead of a pill */
  isPill?: boolean;
  /** Direct hex color for the verse box background (also used by paper masking) */
  bg?: string;
  /** Direct hex color for the verse border / circle decorations */
  border?: string;
  /** Explicit hex color for the verse number circle border */
  circleBorderCol?: string;
  /** Explicit hex color for the verse number circle background */
  circleBg?: string;
  /** Explicit hex color for the verse number text */
  circleTextCol?: string;
  /** Explicit hex color for the Arabic and Latin verse text */
  textColor?: string;
  /** When true, an AnaAyetTab label is rendered above this verse in section and mesh views */
  hasAnaAyetTab?: boolean;
}

export interface SurahAssets {
  metallicVerseBorderSvg?: string;
  centerFlowerSvg?: string;
}

export interface FoldState {
  direction: -1 | 0 | 1;
  angleFactor: number;
}

export interface FoldStoryStep {
  id: string;
  folds: FoldState[];
}

export interface ScrollTimelineConfig {
  intro: { start: number; end: number };
  ambient: { start: number; end: number };
  handoff: { start: number; end: number };
  story: { start: number; end: number };
}

export interface ScrollLockConfig {
  lockPositionPercentage: number;
  effortRequired: number;
  grabRangePixels: number;
}

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
  backgroundText?: {
    caption?: string;
    title?: string;
    subtitle?: string;
    body?: string;
    titleSize?: string;
  };
}

export interface IntroCameraConfig {
  introPosition: [number, number, number];
  introTarget: [number, number, number];
  scrollOffset: [number, number, number];
  targetFollow: number;
  allowOrbit: boolean;
  handoffDurationMs: number;
}

export interface SurahAnimations {
  foldSteps: readonly FoldStoryStep[];
  computeFoldYPositions: (layoutMath: any) => readonly number[];
  scrollTimeline?: ScrollTimelineConfig;
  scrollLock?: ScrollLockConfig;
  ambientMediaKeys?: string[];
  introCamera?: IntroCameraConfig;
}

export interface SurahLayoutConfig<TParams = any> {
  id: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  features: SurahFeatures;
  dimensions: LayoutDimensions;
  styling: LayoutStyling;
  specialVerses: SpecialVerses;
  assets?: SurahAssets;
  verseOverrides?: Record<number, VerseOverrideConfig>;
  params: TParams;
  sections: SectionConfig[];
  animations: SurahAnimations;
  introMedia?: Record<string, IntroMediaItem>;
  introGuides?: Record<string, string>;
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

export interface BracketSpec {
  outerYTop: number;
  outerYBot: number;
  innerYTop: number;
  innerYBot: number;
  nestLevel: number;
  isCenter: boolean;
  color: string;
  fillColor: string;
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
  brackets?: BracketSpec[];
}
