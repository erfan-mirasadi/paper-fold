import type { ElevatedSectionId } from "../stores/useElevatedStore";

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

export const INTRO_MEDIA_DATA: Record<ElevatedSectionId, IntroMediaItem> = {
  s1: {
    src: "/intro/hara-cave.png", // Defaulting to this, will adjust if user provides specific path
    isVideo: false,
    backgroundText: {
      caption: "Muhkem",
      title: "Tebliğ\nirşat vazifesinin \ntarifi tebliği",
      // Moved the long explanation to body, keeping it semantic for the frontend
      body: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
    },
  },
  s2_top: {
    src: "/intro/image-sample.jpg",
    isVideo: false,
    backgroundText: {
      caption: "Ebu Cehilin dünyası",
      title: "Tuğyan\n zulüm\ninkar \nistiğna",
    },
  },
  s2_center: {
    src: "/intro/sand-texture.jpg",
    isVideo: false,
    backgroundText: {
      // Missing caption or body from the client is fine, the component will handle it gracefully
      title: "Dışarıdan bakanlara\n hitap",
    },
  },
  s2_bottom: {
    src: "/intro/hero-2.png",
    isVideo: false,
    backgroundText: {
      caption: "EbuCehilin Ahireti",
      title: "Tuğyanın\n zulmün\n inkarın \nkarşılığı",
    },
  },
};
