import type { ElevatedSectionId } from "../stores/useElevatedStore";

export type IntroMediaId =
  | ElevatedSectionId
  | `${ElevatedSectionId}_step${number}`;

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
  backgroundText?: {
    caption?: string;
    title?: string;
    subtitle?: string;
    body?: string; // Using body for longer descriptions as a UI best practice
    titleSize?: string; // Allows overriding the auto-calculated title font size
  };
}

export const INTRO_MEDIA_DATA: Record<IntroMediaId, IntroMediaItem> = {
  s1: {
    src: "",
    isVideo: false,
    backgroundText: {
      title: "insanlara oku",
      titleSize: "text-[11vw] md:text-[8.5vw] leading-[1.05]",
    },
  },
  s1_step2: {
    src: "/intro/section-1.mov", // Defaulting to this, will adjust if user provides specific path
    isVideo: true,
    backgroundText: {
      caption: "Muhkem",
      title: "Tebliğ\nirşad vazifesinin \ntarifi tebliği",
    },
  },
  s1_step3: {
    src: "/intro/section-1.mov", // Keep same image to avoid crossfade
    isVideo: true,
    backgroundText: {
      caption: "Muhkem",
      title: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
    },
  },
  s2_top: {
    src: "/intro/section-2.png",
    isVideo: false,
    backgroundText: {
      caption: "Ebu Cehil'in dünyası",
      title: "Tuğyan\n zulüm\ninkâr \nistiğna",
    },
  },
  s2_center: {
    src: "/intro/section-3.png",
    isVideo: false,
    backgroundText: {
      // Missing caption or body from the client is fine, the component will handle it gracefully
      title: "Dışarıdan bakanlara\n hitap",
    },
  },
  s2_bottom: {
    src: "/intro/section-4.png",
    isVideo: false,
    backgroundText: {
      caption: "Ebu Cehil'in Ahireti",
      title: "Tuğyanın\n zulmün\n inkârın \nkarşılığı",
    },
  },
};
