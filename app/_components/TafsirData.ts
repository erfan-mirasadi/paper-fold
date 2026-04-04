export type TafsirDirection = "left" | "right";

export interface TafsirEntry {
  id: number;
  scrollStart: number;
  scrollEnd: number;
  targetId?: string;
  anchorOffsetX: number;
  anchorOffsetY: number;
  title: string;
  translation: string;
  explanation: string;
  direction: TafsirDirection;
  lineWidth: number;
  verticalOffset: number;
  boneIndex: number;
}

export const TAFSIR_DATA: TafsirEntry[] = [
  {
    id: 3,
    scrollStart: 0.3,
    scrollEnd: 0.6,
    boneIndex: 25, // Which fold/bone it rides on
    anchorOffsetX: 0.05, // Left/Right positioning in 3D (Tweaked for verse 3)
    anchorOffsetY: 0.0, // Up/Down fine-tuning relative to the bone

    title: "The Generous Lord",
    translation: "Read, and your Lord is the most Generous.",
    explanation:
      "This verse emphasizes Allah's boundless generosity in granting knowledge.",
    direction: "right",
    lineWidth: 460,
    verticalOffset: -88,
  },
  {
    id: 6,
    scrollStart: 0.65,
    scrollEnd: 0.9,
    boneIndex: 45,
    anchorOffsetX: -0.55, // Negative moves it left in 3D space
    anchorOffsetY: 0,

    title: "The Rebellion",
    translation: "Nay! Man does indeed transgress.",
    explanation: "A highlight on human arrogance when feeling self-sufficient.",
    direction: "right",
    lineWidth: 780,
    verticalOffset: -88,
  },
];
