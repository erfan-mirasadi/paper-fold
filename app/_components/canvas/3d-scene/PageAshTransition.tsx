"use client";

/**
 * PageAshTransition — the incoming page's "etched glow" pass, layered ON TOP
 * of the page-turn choreography (PaperTransitionMesh), exclusively for
 * Surahs with more than BURN_EFFECT_MIN_PAPER_COUNT papers.
 *
 * (The outgoing half of the old ash effect — the ink→ash burn wipe on the
 * exiting sheet — was removed in favor of PaperTransitionMesh's FlipSheet,
 * a real book page-turn. Only the INCOMING glow below remains.)
 *
 *   INCOMING (EtchGlowOverlay, mounted inside PaperSlideGroup) — a
 *   noise-broken sweep glows across the page top → bottom, then cools
 *   (fades) to nothing. Deliberately an ADDITIVE overlay rather than a
 *   recolor of the live paper material: it never needs to match
 *   usePaperMasking's UV space or shader permutation, so it can't drift out
 *   of sync with (or destabilize) that far more complex shader.
 *
 * The shader is STATIC TEXT — only uniform VALUES vary per transition — so
 * three.js's program cache reuses ONE compiled permutation across every
 * switch instead of recompiling on each page-turn.
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  PlaneGeometry,
  ShaderMaterial,
  type Mesh,
} from "three";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { usePaperStore } from "../../../stores/usePaperStore";
import { PAGE_DEPTH } from "./SinglePaper";

/**
 * The incoming glow plays on its own clock too, independent of (and longer
 * than) PaperSlideGroup's own ENTER_DURATION_S slide — see EtchGlowOverlay,
 * which keeps it running to completion even after the base switch machinery
 * has already moved on, so there's enough time to actually see it.
 */
const GLOW_DURATION_S = 2.2;

/**
 * Waits this long (seconds) after the switch starts before the glow even
 * begins — the ash-eligible entrance is now a "falling paper" drop
 * (PaperSlideGroup's FALL_* constants) that spends its first stretch off in
 * a top corner, so starting the glow at t=0 alongside it meant the glow was
 * mostly playing out while the page was still off-screen/tilted away and
 * unreadable. Raise this to push the glow later into the fall (closer to
 * landing); lower it to have the glow start earlier/sooner.
 */
const GLOW_START_DELAY_S = 0.65;

const ASH_HASH_GLSL = `
float ashHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// EtchGlowOverlay — incoming page's "soft glow, then cools" pass
// ─────────────────────────────────────────────────────────────────────────────

const ETCH_GLOW_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ETCH_GLOW_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float uEnterT;
${ASH_HASH_GLSL}
void main() {
  // Sweeps top → bottom, as if the page is being etched/built downward —
  // vUv.y is 0 at the bottom and 1 at the top, so "travel" runs the other way.
  float travel = 1.0 - vUv.y;
  float colNoise = ashHash(vec2(floor(vUv.x * 26.0), 4.0));
  float band = 0.32;
  float front = uEnterT * (1.0 + band) + (colNoise - 0.5) * 0.1;
  float d = travel - front;

  float glow = (1.0 - smoothstep(0.0, band, abs(d))) * mix(0.55, 1.0, colNoise);
  float cool = 1.0 - smoothstep(0.72, 1.0, uEnterT);
  float warm = 1.0 - smoothstep(0.0, 0.22, uEnterT);

  vec3 emberEdge = vec3(1.0, 0.42, 0.12);
  vec3 emberCore = vec3(1.0, 0.93, 0.72);
  vec3 glowColor = mix(emberEdge, emberCore, glow);

  float alpha = glow * cool * mix(0.5, 1.0, warm);
  gl_FragColor = vec4(glowColor, alpha);
}
`;

/** Comfortably past every other on-page overlay's z-offset (verses top out around +0.0035). */
const OVERLAY_Z_EPSILON = 0.01;

function createEtchGlowMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uEnterT: { value: 0 },
    },
    vertexShader: ETCH_GLOW_VERTEX_SHADER,
    fragmentShader: ETCH_GLOW_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}

/**
 * A flat plane, independent of the live paper's fold rig — by the time this
 * is visible the incoming page has already fully settled (see
 * PaperTransitionMesh's header), so nothing here needs to fold or skin.
 */
export function EtchGlowOverlay() {
  const runtime = useSurahLayoutRuntime();
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const elapsedRef = useRef(0);
  const activeRef = useRef(false);
  /** Identifies the switch currently playing, so a new switch can force a
   *  restart even while the previous (longer-than-the-base-switch) glow is
   *  still finishing its own timeline. */
  const lastIndexRef = useRef<number | null>(null);

  const geometry = useMemo(
    () => new PlaneGeometry(runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT),
    [runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(() => createEtchGlowMaterial(), []);
  useEffect(() => {
    materialRef.current = material;
    return () => {
      materialRef.current = null;
      material.dispose();
    };
  }, [material]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const activeMaterial = materialRef.current;
    if (!mesh || !activeMaterial) return;

    const store = usePaperStore.getState();
    const eligibleNow =
      store.hasTransitionSheet &&
      store.transitionPhase === "animating" &&
      store.sheetStage === "curl";

    // (Re)start on every NEW switch's rising edge — even if the previous
    // glow is still running its own (deliberately longer) timeline, a fresh
    // switch always takes over immediately.
    if (eligibleNow && lastIndexRef.current !== store.activePaperIndex) {
      lastIndexRef.current = store.activePaperIndex;
      activeRef.current = true;
      elapsedRef.current = 0;
    }

    if (!activeRef.current) {
      mesh.visible = false;
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);

    // Hold hidden through the delay window — see GLOW_START_DELAY_S.
    if (elapsedRef.current < GLOW_START_DELAY_S) {
      mesh.visible = false;
      return;
    }

    const t = Math.min(
      (elapsedRef.current - GLOW_START_DELAY_S) / GLOW_DURATION_S,
      1,
    );
    activeMaterial.uniforms.uEnterT.value = t;
    mesh.visible = true;

    if (t >= 1) activeRef.current = false;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[
        0,
        runtime.SCENE_CENTER_Y - runtime.PAGE_HEIGHT / 2,
        PAGE_DEPTH / 2 + OVERLAY_Z_EPSILON,
      ]}
      frustumCulled={false}
      renderOrder={999}
      visible={false}
    />
  );
}
