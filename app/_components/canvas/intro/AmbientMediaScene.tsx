"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial, useVideoTexture, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Custom shader for fading edges and applying a fake blur
const FadedMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uFadeRadius: 0.2,       // Controls the thickness of the faded edge
    uAlphaMultiplier: 1.0,  // Controls overall transparency (useful for the background glow)
    uBlurAmount: 0.0,       // Distance of the blur samples
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform sampler2D uTexture;
  uniform float uFadeRadius;
  uniform float uAlphaMultiplier;
  uniform float uBlurAmount;
  
  varying vec2 vUv;

  void main() {
    vec4 color = vec4(0.0);

    // If uBlurAmount is greater than 0, we apply a 9-tap filter for a smooth fake blur
    if (uBlurAmount > 0.0) {
        float offset = uBlurAmount;
        
        color += texture2D(uTexture, vUv + vec2(-offset, -offset));
        color += texture2D(uTexture, vUv + vec2(0.0, -offset));
        color += texture2D(uTexture, vUv + vec2(offset, -offset));
        
        color += texture2D(uTexture, vUv + vec2(-offset, 0.0));
        color += texture2D(uTexture, vUv); // center
        color += texture2D(uTexture, vUv + vec2(offset, 0.0));
        
        color += texture2D(uTexture, vUv + vec2(-offset, offset));
        color += texture2D(uTexture, vUv + vec2(0.0, offset));
        color += texture2D(uTexture, vUv + vec2(offset, offset));
        
        color /= 9.0;
    } else {
        // Just sample the texture normally if no blur is needed
        color = texture2D(uTexture, vUv);
    }

    // Calculate smooth fading for all four edges
    float left = smoothstep(0.0, uFadeRadius, vUv.x);
    float right = smoothstep(1.0, 1.0 - uFadeRadius, vUv.x);
    float bottom = smoothstep(0.0, uFadeRadius, vUv.y);
    float top = smoothstep(1.0, 1.0 - uFadeRadius, vUv.y);

    // Multiply gradients together to create the final alpha mask
    float alphaMask = left * right * bottom * top;

    // Apply the multiplier for the background glow transparency
    float finalAlpha = alphaMask * uAlphaMultiplier;

    gl_FragColor = vec4(color.rgb, color.a * finalAlpha);
  }
  `
);

// Register the custom material so R3F can use it as a JSX element
extend({ FadedMaterial });

// Add types for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      fadedMaterial: any;
    }
  }
}

export function AmbientMediaScene({ 
  src, 
  isVideo = false, 
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number]
}) {
  // Automatically load texture based on media type
  const texture = isVideo ? useVideoTexture(src) : useTexture(src);

  const mainMatRef = useRef<any>();
  const glowMatRef = useRef<any>();

  useFrame(() => {
    // Keep uniforms updated with the active texture
    if (mainMatRef.current) mainMatRef.current.uTexture = texture;
    if (glowMatRef.current) glowMatRef.current.uTexture = texture;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Blurred Background Glow Layer */}
      <mesh position={[0, 0, -0.05]} scale={1.4}>
        <planeGeometry args={[3, 2]} />
        <fadedMaterial
          ref={glowMatRef}
          transparent={true}
          uFadeRadius={0.4}       // Much softer edge for the glow
          uAlphaMultiplier={0.35} // Lower opacity so it feels like a subtle reflection
          uBlurAmount={0.03}      // Applies the 9-tap fake blur
          depthWrite={false}      // Prevents sorting issues with transparency
        />
      </mesh>

      {/* Main Faded Media Layer */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <fadedMaterial
          ref={mainMatRef}
          transparent={true}
          uFadeRadius={0.15}      // Crisp but faded edge
          uAlphaMultiplier={1.0}  // Full opacity in the center
          uBlurAmount={0.0}       // No blur on the main video/image
        />
      </mesh>
    </group>
  );
}
