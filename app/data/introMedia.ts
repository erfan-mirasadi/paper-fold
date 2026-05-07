import type { ElevatedSectionId } from "../stores/useElevatedStore";

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
  backgroundText?: {
    caption?: string;
    title?: string;
    subtitle?: string;
    body?: string;
  };
}

export const INTRO_MEDIA_DATA: Record<ElevatedSectionId, IntroMediaItem> = {
  s1: {
    src: "/intro/video-sample.mp4", // Defaulting to this, will adjust if user provides specific path
    isVideo: true,
    backgroundText: {
      caption: "İLAHİ TAVZİFİN HASIDI DÜŞMANI",
      title: "İSTİĞNA VE TUĞYAN",
      body: "Dünyada şeytan adamın mağrur ve kibirli azgınlığı",
    },
  },
  s2_top: {
    src: "/intro/image-sample.jpg",
    isVideo: false,
    backgroundText: {
      title: "TAVZİF VE VAZİFE",
      subtitle: "İlahi bir görev, kutlu bir ödev",
    },
  },
  s2_center: {
    src: "/intro/sand-texture.jpg",
    isVideo: false,
    backgroundText: {
      caption: "Kella! Lâ tüti'hu",
      title: "SECDE ET VE ALLAH'A YAKLAŞ",
      subtitle: "Ona mahkum olma",
    },
  },
  s2_bottom: {
    src: "/intro/hero-2.png",
    isVideo: false,
    backgroundText: {
      title: "HÜSRAN",
      subtitle: "Kafır ve Taği adamın ahireti",
      body: "Hüsran ve pişmanlık dolu bir son",
    },
  },
};
