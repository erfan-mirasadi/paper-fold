"use client";

import { useThree, useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, useEffect } from "react";

// Procedural GLSL functions for our shader to create the paper texture and noise
const shaderChunks = `
  // 3D Simplex Noise by Ashima Arts
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  // Fractional Brownian Motion for procedural surface details
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) {
      v += a * snoise(x);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }
`;

export const Paper3D = ({
  progressRef,
  uiTexture,
}: {
  progressRef: React.MutableRefObject<{ value: number }>;
  uiTexture?: THREE.Texture | null;
}) => {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Calculate the aspect-correct physical size for the 3D plane
  const aspect = 800 / 1400; // Matches CSS sizing
  let Pw = viewport.height * 0.9 * aspect;
  let Ph = viewport.height * 0.9;
  if (Pw > viewport.width * 0.9) {
    Pw = viewport.width * 0.9;
    Ph = Pw / aspect;
  }

  // Custom uniforms injected into onBeforeCompile - using useRef to avoid React compiler warnings on mutated hook values
  const uniformsRef = useRef({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uPlaneSize: { value: new THREE.Vector2(Pw, Ph) },
  });

  // Create a 2x2 dummy texture to force USE_MAP to be compiled instantly
  const defaultTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fdfbf0";
      ctx.fillRect(0, 0, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Update plane size on resize
  useEffect(() => {
    uniformsRef.current.uPlaneSize.value.set(Pw, Ph);
  }, [Pw, Ph]);

  // Force material recompile when texture arrives
  useEffect(() => {
    if (materialRef.current && uiTexture) {
      materialRef.current.needsUpdate = true;
    }
  }, [uiTexture]);

  const normalMap = useLoader(THREE.TextureLoader, "/paper-normal.jpg");

  useEffect(() => {
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    // Scale normal map based on viewport so it doesn't stretch weirdly
    normalMap.repeat.set(4 * (viewport.width / 5), 4 * (viewport.height / 8));
    normalMap.needsUpdate = true;
  }, [normalMap, viewport.width, viewport.height]);

  useFrame((state) => {
    // 1. Update uniforms based on GSAP scroll state securely mapped from Ref
    if (progressRef && progressRef.current) {
      uniformsRef.current.uProgress.value = progressRef.current.value;
    }
    // 2. Animate time for subtle organic noises
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  // Inject WebGL logic to handle the custom organic 3-step fold
  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uProgress = uniformsRef.current.uProgress;
    shader.uniforms.uTime = uniformsRef.current.uTime;
    shader.uniforms.uPlaneSize = uniformsRef.current.uPlaneSize;

    // ADD UNIFORMS & NOISE TO VERTEX SHADER
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      uniform float uProgress;
      uniform float uTime;
      uniform vec2 uPlaneSize;
      varying vec2 myUv;
      ${shaderChunks}
      
      // Function to recreate the displacement for arbitrary points
      vec3 getPosition(vec3 p, vec2 uvCoord) {
          float p1 = clamp(uProgress * 2.0, 0.0, 1.0);
          float p2 = clamp((uProgress - 0.5) * 2.0, 0.0, 1.0);
          float angle1 = 3.14159 * 0.99 * (1.0 - p1);
          float angle2 = 3.14159 * 0.99 * (1.0 - p2);
          
          float H = uPlaneSize.y;
          float W = uPlaneSize.x;
          // CSS boundaries: 400px, 400px, 600px -> 1400px total
          float h1 = H * 3.0 / 14.0;
          float h2 = -H * 1.0 / 14.0;
          
          float wave1 = sin(p1 * 3.14159);
          float wave2 = sin(p2 * 3.14159);
          float nAmp1 = wave1 * W * 0.03;
          float nAmp2 = wave2 * W * 0.03;
          float curl = pow(abs(uvCoord.x - 0.5) * 2.0, 2.0) * W * 0.1;
          
          if (p.y < h2) {
              float noiseZ = snoise(vec3(p.xy * 0.5, uTime * 0.5)) * nAmp2;
              float c = cos(angle2); float s = sin(angle2);
              float dist = p.y - h2;
              p.y = h2 + dist * c;
              p.z += dist * s + noiseZ + (curl * wave2);
          }
          if (p.y < h1) {
              float noiseZ = snoise(vec3(p.xy * 0.5 + 10.0, uTime * 0.5)) * nAmp1;
              float c = cos(angle1); float s = sin(angle1);
              float yDist = p.y - h1; float zDist = p.z;
              p.y = h1 + yDist * c - zDist * s;
              p.z = yDist * s + zDist * c;
              p.z += noiseZ + (curl * wave1);
          }
          p.z += cos((uvCoord.x - 0.5) * 3.14159 * 2.5) * W * 0.01;
          return p;
      }
      `,
    );

    // INJECT FOLDING LOGIC IN VERTEX SHADER
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      myUv = uv;
      vec3 transformed = getPosition(position, uv);
      `,
    );

    // RECOMPUTE NORMALS IN VERTEX SHADER
    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      // We estimate normals using finite difference on adjusted adjacent points
      float eps = 0.001;
      
      vec3 p0 = getPosition(position, uv);
      vec3 pX = getPosition(position + vec3(eps * uPlaneSize.x, 0.0, 0.0), uv + vec2(eps, 0.0));
      vec3 pY = getPosition(position + vec3(0.0, eps * uPlaneSize.y, 0.0), uv + vec2(0.0, eps));
      
      vec3 myTangent = pX - p0;
      vec3 myBitangent = pY - p0;
      
      vec3 objectNormal = normalize(cross(myTangent, myBitangent));
      `,
    );

    // ADD NOISE MODIFIERS TO FRAGMENT SHADER
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `
      #include <common>
      uniform float uProgress;
      varying vec2 myUv;
      ${shaderChunks}
      `
    );

    // PROCEDURAL TEXTURE MAP (Color Discoloration)
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      
      // Generate a high frequency noise for paper micro-fibers
      float mf = fbm(vec3(myUv * 150.0, 0.0));
      // Subtle color discoloration spots
      float spots = fbm(vec3(myUv * 5.0, 0.0));
      
      // Calculate dynamic occlusion/shadow based exactly on GSAP scroll
      float p1 = clamp(uProgress * 2.0, 0.0, 1.0);
      float p2 = clamp((uProgress - 0.5) * 2.0, 0.0, 1.0);
      
      // distance to hinges in UV space (1/3rd and 2/3rds)
      // hinge1 is between top and middle (y=0.666)
      // hinge2 is between middle and bottom (y=0.333)
      float d1 = abs(myUv.y - 0.6666);
      float d2 = abs(myUv.y - 0.3333);
      
      // Darken the specific fold crease based on how folded it is (1.0 - p)
      // If p1 is 0.0 (fully folded), crease is extremely tight and shaded.
      float tension1 = (1.0 - p1); 
      float shadow1 = smoothstep(0.04, 0.0, d1) * tension1 * 0.4; // 0.4 opacity shadow
      
      float tension2 = (1.0 - p2); 
      float shadow2 = smoothstep(0.04, 0.0, d2) * tension2 * 0.4;
      
      // Apply base paper texture
      diffuseColor.rgb *= 1.0 - (mf * 0.04);
      diffuseColor.rgb -= vec3(1.0, 0.95, 0.8) * max(spots, 0.0) * 0.04;
      
      // Apply deep ambient occlusion to the physical creases
      diffuseColor.rgb -= shadow1;
      diffuseColor.rgb -= shadow2;
      `
    );

    // PROCEDURAL ROUGHNESS
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `
      float roughnessFactor = roughness;
      
      // Paper surface feels rougher where there are fibers
      float rNoise = fbm(vec3(myUv * 200.0, 0.0));
      roughnessFactor = clamp(roughnessFactor + (rNoise - 0.5) * 0.2, 0.0, 1.0);
      `,
    );
  };

  return (
    // We render the mesh natively inside the scaling limits, placing exactly in 3D center
    <mesh receiveShadow castShadow>
      {/* 128x128 for perfectly smooth rolling curve over physical folding */}
      <planeGeometry args={[Pw, Ph, 128, 128]} />

      <meshStandardMaterial
        ref={materialRef}
        color={uiTexture ? "#ffffff" : "#fdfbf0"} // Use white if texture loaded
        map={uiTexture || defaultTexture}
        roughness={0.9} // Extremely matte basic reflection
        metalness={0.05} // Just for tiny shiny highlight edge
        side={THREE.DoubleSide}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.6, 0.6)} // Slightly deeper micro-occlusion
        onBeforeCompile={onBeforeCompile}
        transparent={true} // In case texture has transparent parts
      />
    </mesh>
  );
};
