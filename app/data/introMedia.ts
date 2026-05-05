import type { ElevatedSectionId } from "../stores/useElevatedStore";

export interface IntroMediaItem {
  src: string;
  isVideo?: boolean;
}

export const INTRO_MEDIA_DATA: Record<ElevatedSectionId, IntroMediaItem> = {
  s1: {
    src: "/intro/video-sample.mp4", // Defaulting to this, will adjust if user provides specific path
    isVideo: true,
  },
  s2_top: {
    src: "/intro/image-sample.jpg",
    isVideo: false,
  },
  s2_center: {
    src: "/intro/sand-texture.jpg",
    isVideo: false,
  },
  s2_bottom: {
    src: "/intro/hero-2.png",
    isVideo: false,
  },
};
