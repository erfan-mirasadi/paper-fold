import type { ElevatedSectionId } from "../stores/useElevatedStore";

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
  backgroundText?: {
    caption?: string;
    title?: string;
    subtitle?: string;
    body?: string; // Using body for longer descriptions as a UI best practice
  };
}

export const INTRO_MEDIA_DATA: Record<ElevatedSectionId, IntroMediaItem> = {
  s1: {
    src: "/intro/video-sample.mp4", // Defaulting to this, will adjust if user provides specific path
    isVideo: true,
    backgroundText: {
      caption: "Muhkem",
      title: "Tebliğ ve irşat vazifesinin tarifi tebliği",
      // Moved the long explanation to body, keeping it semantic for the frontend
      body: "Risâlet makamının rütbesinin vazifesinin dünyaya ilânı",
    },
  },
  s2_top: {
    src: "/intro/image-sample.jpg",
    isVideo: false,
    backgroundText: {
      caption: "Ebu Cehilin dünyası",
      title: "Tuğyan ve zulüm ve inkar ve istiğna",
    },
  },
  s2_center: {
    src: "/intro/sand-texture.jpg",
    isVideo: false,
    backgroundText: {
      // Missing caption or body from the client is fine, the component will handle it gracefully
      title: "Dışarıdan bakanlara hitap",
    },
  },
  s2_bottom: {
    src: "/intro/hero-2.png",
    isVideo: false,
    backgroundText: {
      caption: "EbuCehilin Ahireti",
      title: "Tuğyanın, zulmün, inkarın karşılığı",
    },
  },
};
