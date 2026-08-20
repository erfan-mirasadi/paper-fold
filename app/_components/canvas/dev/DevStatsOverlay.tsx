"use client";

/**
 * DevStatsOverlay — the numbers this project actually gets judged on, on screen
 * while you work. Development only; never mounted in a production build.
 *
 * `r3f-perf` already draws the generic frame graph (fps, ms, calls, triangles),
 * so this deliberately does NOT repeat it. What it shows is the handful of
 * project-specific figures that decide whether a page is sharp and whether it is
 * affordable — and that were, until recently, invisible:
 *
 *   TIER / DPR   The two numbers every quality decision in the app is derived
 *                from (`gpuTier`, `maxDevicePixelRatio`). A phone flattened to
 *                dpr 1 softens the framebuffer, the zoom buffer and the glyph
 *                rasterisation all at once, and nothing on screen says so.
 *                `forced` appears when ?gpu= is overriding detection.
 *   BUFFER       The canvas's real backing store against the display's own
 *                pixels. When "device" is far above "canvas", the picture is
 *                being stretched.
 *   GPU OBJECTS  Live geometries, textures and compiled programs. These are the
 *                counts that betray a leak: they should be steady while you
 *                read, and return to roughly where they started after a paper
 *                switch. A number that only ever climbs is the bug.
 *
 * Sampled a few times a second rather than every frame, and written straight to
 * the DOM — no React state, so the overlay itself never causes a re-render of
 * anything it is measuring.
 */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import { detectGpuTier } from "../../../utils/gpuTier";

/** How often the readout refreshes. Fast enough to watch, slow enough to read. */
const SAMPLE_INTERVAL_MS = 250;

export function DevStatsOverlay() {
  const gl = useThree((s) => s.gl);
  const viewportDpr = useThree((s) => s.viewport.dpr);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const lastSampleRef = useRef(0);
  /** Highest counts seen, so a slow climb is visible without watching. */
  const peakRef = useRef({ geometries: 0, textures: 0, programs: 0 });

  useEffect(() => {
    const node = document.createElement("div");
    node.style.cssText = [
      "position:fixed",
      "top:8px",
      "left:8px",
      "z-index:99999",
      "pointer-events:none",
      "font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace",
      "color:#b8f0d8",
      "background:rgba(10,18,14,.82)",
      "border:1px solid rgba(120,200,170,.28)",
      "border-radius:6px",
      "padding:7px 9px",
      "white-space:pre",
      "letter-spacing:.02em",
      // Well clear of r3f-perf, which sits at the very top-left.
      "transform:translateY(118px)",
    ].join(";");
    document.body.appendChild(node);
    nodeRef.current = node;

    return () => {
      node.remove();
      nodeRef.current = null;
    };
  }, []);

  useFrame(() => {
    const node = nodeRef.current;
    if (!node) return;

    const now = performance.now();
    if (now - lastSampleRef.current < SAMPLE_INTERVAL_MS) return;
    lastSampleRef.current = now;

    const info = gl.info;
    const peak = peakRef.current;
    peak.geometries = Math.max(peak.geometries, info.memory.geometries);
    peak.textures = Math.max(peak.textures, info.memory.textures);
    peak.programs = Math.max(peak.programs, info.programs?.length ?? 0);

    const forced =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("gpu");
    const canvas = gl.domElement;
    const deviceDpr = window.devicePixelRatio;
    // The ratio the canvas ACTUALLY resolved at, which is the clamped one and
    // not necessarily what was asked for.
    const effectiveDpr = canvas.clientWidth
      ? canvas.width / canvas.clientWidth
      : viewportDpr;

    node.textContent = [
      `tier    ${detectGpuTier()}${forced ? "  (forced ?gpu=)" : ""}`,
      `dpr     canvas ${effectiveDpr.toFixed(2)}   device ${deviceDpr}`,
      `buffer  ${canvas.width}x${canvas.height}  css ${canvas.clientWidth}x${canvas.clientHeight}`,
      // Draw calls and triangles are deliberately absent: `r3f-perf` resets
      // `gl.info` on its own schedule, so anything read here lands on a
      // counter it has already zeroed. Its panel is directly above — the honest
      // place for those two. What is left below is cumulative and safe to read
      // at any moment.
      `geom    ${info.memory.geometries}  (peak ${peak.geometries})`,
      `tex     ${info.memory.textures}  (peak ${peak.textures})`,
      `prog    ${info.programs?.length ?? 0}  (peak ${peak.programs})`,
      `maxTex  ${gl.capabilities.maxTextureSize}`,
    ].join("\n");
  });

  return null;
}
