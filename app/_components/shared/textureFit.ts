import {
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type Texture,
} from "three";

export type TextureTransform = {
  offset?: { x?: number; y?: number };
  stableSampling?: boolean;
};

export function cloneTextureAsAspectCover(
  source: Texture,
  surfaceWidth: number,
  surfaceHeight: number,
  scale: number = 0.001,
  transform?: TextureTransform,
): Texture {
  // Clone the texture so each surface can have independent repeats
  const texture = source.clone();
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  const stable = transform?.stableSampling === true;
  if (stable) {
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.anisotropy = 1;
  } else {
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
  }

  const img = source.image as HTMLImageElement | undefined;
  const imgW = img?.naturalWidth ?? img?.width ?? 0;
  const imgH = img?.naturalHeight ?? img?.height ?? 0;

  if (imgW > 0 && imgH > 0 && surfaceWidth > 0 && surfaceHeight > 0) {
    // Calculate the repeat values based on surface size, image size, and user scale
    const repeatX = surfaceWidth / (imgW * scale);
    const repeatY = surfaceHeight / (imgH * scale);

    texture.repeat.set(repeatX, repeatY);
    const ox = transform?.offset?.x ?? 0;
    const oy = transform?.offset?.y ?? 0;
    texture.offset.set(ox, oy);
  }

  texture.needsUpdate = true;
  return texture;
}
