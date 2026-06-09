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
  section1: {
    src: "",
    isVideo: false,
    backgroundText: {
      title: "İnsanlara oku!",
      titleSize: "text-[11vw] md:text-[8.5vw] leading-[1.05]",
    },
  },
  section1_step1: {
    src: "",
    isVideo: false,
    backgroundText: {
      title:
        "Alak suresi, insanlığın ufkunda doğan İlahi bir güneş gibi\nMuhammed aleyhisselama peygamberlik tacının giydirildiğini\nbütün cihana ilan etmiş ve müjdelemiştir",
      titleSize: "text-[5.5vw] md:text-[3.5vw] leading-[1.2]",
    },
  },
  section1_step2: {
    src: "/intro/section-1.mp4", // Defaulting to this, will adjust if user provides specific path
    isVideo: true,
    backgroundText: {
      caption: "Muhkem",
      title: "Tebliğ\nirşad vazifesinin \ntarifi tebliği",
    },
  },
  section1_step3: {
    src: "/intro/section-1.mp4", // Keep same image to avoid crossfade
    isVideo: true,
    backgroundText: {
      caption: "Muhkem",
      title: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
    },
  },
  section2_top: {
    src: "/intro/section-2.mp4",
    isVideo: true,
    backgroundText: {
      caption: "Ebu cehil'in dünyası",
      title: "Tuğyan\n zulüm\ninkâr \nistiğna",
    },
  },
  section2_center: {
    src: "/intro/section-3.mp4",
    isVideo: true,
    backgroundText: {
      // Missing caption or body from the client is fine, the component will handle it gracefully
      title: "Dışarıdan bakanlara\n hitap",
    },
  },
  section2_bottom: {
    src: "/intro/section-4.mp4",
    isVideo: true,
    backgroundText: {
      caption: "Ebu cehil'in ahireti",
      title: "Tuğyanın\n zulmün\n inkârın \nkarşılığı",
    },
  },
};
