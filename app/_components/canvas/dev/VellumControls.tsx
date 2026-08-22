"use client";

/**
 * VellumControls — the paper's dials, on screen, live. Currently mounted in
 * EVERY build, production included, so the paper can be tuned on the deployed
 * page; see `panelAllowed` for how to take that back out.
 *
 * WHY THIS EXISTS. The vellum surface has two dozen numbers and not one of them
 * can be chosen by reasoning — they are judged by looking at the page. While
 * they were GLSL constants, judging one meant editing a file, waiting for a
 * shader recompile, a full reload and the composed paper's textures, which is
 * about two minutes per value. Nobody tunes anything that way, and the honest
 * result was numbers picked once and never revisited.
 *
 * As uniforms they are live (`VELLUM_DIALS`, `VELLUM_UNIFORMS`): a slider
 * writes straight into the object three already has bound, and the paper
 * changes on the next frame. Two minutes becomes one drag.
 *
 * THREE THINGS IT DELIBERATELY DOES:
 *
 *   - Writes to the uniform, NOT to React state. The panel re-rendering on
 *     every pointer move would be re-rendering the scene it is measuring; the
 *     numeric readouts are written straight to the DOM for the same reason.
 *   - Calls `invalidate()` after every change, because the canvas runs on
 *     demand (`useAdaptiveFrameloop`) and would otherwise not redraw until
 *     something else happened to ask it to. The module-level `invalidate` from
 *     r3f rather than the one off `useThree`, because this panel is DOM and
 *     mounts OUTSIDE the Canvas — a `<Canvas>` child may only be three objects,
 *     and a slider is not one.
 *   - Remembers the session in `localStorage`, so a reload does not throw away
 *     an afternoon of tuning — and offers "Copy" so the afternoon ends as
 *     source to paste into `VELLUM`, rather than a number on a napkin.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { invalidate } from "@react-three/fiber";
import { Vector3 } from "three";

import { getActiveStoryConfig } from "../../../stores/useStoryStore";
import {
  CAPSULE_SHADOW,
  CAPSULE_SHADOW_DEFAULTS,
  CONTENT_DIALS,
  setContentDial,
  type ContentDial,
  VELLUM_DIALS,
  VELLUM_MATERIAL_DEFAULTS,
  VELLUM_MATERIAL_DIALS,
  VELLUM_UNIFORMS,
  applyVellumMaterial,
  readVellumMaterial,
  resetVellumUniforms,
  applyVellumPreset,
  VELLUM_PRESETS,
  VELLUM_DEFAULT_PRESET,
  vellumDefaultsSignature,
  vellumUniformsAsSource,
  type VellumMaterialDial,
} from "../3d-scene/vellumSurface";

const STORAGE_KEY = "vellum-dials-v1";

/**
 * Which preset is showing. Module-level, not React state, for the same reason
 * the uniforms are: `writeStored` is a plain function called from three places
 * that have no idea a mode exists, and threading it through all of them to
 * record one integer is worse than one variable. The component mirrors it into
 * state purely so the buttons can highlight.
 */
let activeMode: number = VELLUM_DEFAULT_PRESET;

/**
 * Whether the panel may open at all.
 *
 * Right now: always, in every build. The paper is judged by looking at the real
 * page, and the real page is the deployed one — a texture tuned only against a
 * dev build is tuned against a different renderer state than anyone will ever
 * see, and the person doing the tuning does not have a dev build.
 *
 * TEMPORARY. It ships a chunk in the production bundle that nothing else needs.
 * To take it out again, delete this function, drop the `allowed` check below,
 * and put `IS_DEV &&` back in front of `<VellumControls />` in SurahViewer;
 * nothing else refers to it.
 */
function panelAllowed(): boolean {
  return true;
}

/**
 * Colour dials are stored LINEAR, because that is the space the shader
 * multiplies them in — and edited in sRGB, because that is the space a colour
 * picker and a human eye work in. Converting in both directions here is what
 * makes "pick #e6d9bd" actually produce #e6d9bd on the page; feeding the sRGB
 * triple straight through overshoots by about a stop and clips.
 *
 * The tints are ratios rather than colours in any display sense, but the
 * conversion leaves their anchor alone — white is white in both spaces, so "no
 * tint" stays "no tint" — and a single consistent rule beats two.
 */
const toSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function vecToHex(v: Vector3): string {
  const c = (n: number) =>
    Math.round(Math.min(1, Math.max(0, toSrgb(n))) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${c(v.x)}${c(v.y)}${c(v.z)}`;
}

function hexToVec(hex: string, into: Vector3): void {
  into.set(
    toLinear(parseInt(hex.slice(1, 3), 16) / 255),
    toLinear(parseInt(hex.slice(3, 5), 16) / 255),
    toLinear(parseInt(hex.slice(5, 7), 16) / 255),
  );
}

/**
 * The dials are ratios around 1.0, not colours in any display sense — a tint of
 * (1.0, 0.93, 0.81) is "keep red, take a little green, take more blue". An
 * `<input type=color>` can still edit that directly, and showing it as the
 * swatch it multiplies by is the most readable form it has.
 */
function readStored(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(): void {
  try {
    const out: Record<string, unknown> = { __sig: vellumDefaultsSignature() };
    for (const name of Object.keys(VELLUM_DIALS)) {
      const v = VELLUM_UNIFORMS[name].value;
      out[name] = typeof v === "number" ? v : [v.x, v.y, v.z];
    }
    const mat: Record<string, number> = {};
    for (const prop of Object.keys(VELLUM_MATERIAL_DIALS))
      mat[prop] = readVellumMaterial(prop as VellumMaterialDial);
    out.__material = mat;
    out.__shadow = { ...CAPSULE_SHADOW };
    out.__mode = activeMode;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {
    /* a full or disabled localStorage must never take the panel down */
  }
}

/**
 * Put a previous session's dials back, and report which mode it was in.
 *
 * RUNS AT MOST ONCE, during the first render rather than in an effect: it seeds
 * the mode buttons, and state seeded from an effect is state that renders wrong
 * first and corrects itself second. Reaching localStorage during render is safe
 * only because SurahViewer imports this with `ssr: false` — there is no server
 * pass to disagree with, the same reason `panelAllowed` may touch `window`.
 *
 * The material and the shadow are NOT restored here. They are not uniforms:
 * they live on a material and inside the page's RenderTexture, neither of which
 * exists yet at this point. They are re-applied when the panel opens.
 */
let restored = false;
function restoreStoredSession(): number {
  if (restored) return activeMode;
  restored = true;

  const stored = readStored();
  if (!stored) return activeMode;

  // A session saved against DIFFERENT source defaults is older than the file
  // — see `vellumDefaultsSignature`. Drop it, so editing `VELLUM` is always
  // what decides what the page shows.
  if (stored.__sig !== vellumDefaultsSignature()) {
    localStorage.removeItem(STORAGE_KEY);
    return activeMode;
  }

  for (const [name, v] of Object.entries(stored)) {
    const u = VELLUM_UNIFORMS[name];
    if (!u) continue; // a dial that has since been renamed or removed
    if (typeof v === "number" && typeof u.value === "number") u.value = v;
    else if (Array.isArray(v) && u.value instanceof Vector3)
      u.value.set(v[0], v[1], v[2]);
  }

  if (typeof stored.__mode === "number") activeMode = stored.__mode;
  return activeMode;
}

export function VellumControls() {
  // Read once, lazily. Safe to touch `window` here because SurahViewer imports
  // this with `ssr: false`, so it never renders on the server and there is no
  // hydration pass to disagree with.
  const [allowed] = useState(panelAllowed);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState(restoreStoredSession);

  // Whether the page on screen is the one the shadow dials can reach. Read at
  // render time; the panel re-renders whenever it is opened, which is the only
  // moment this matters.
  const features = getActiveStoryConfig().features;
  const isVellumPage = Boolean(
    features.flatPaperSurface && features.vellumSurface,
  );
  const readouts = useRef<Record<string, HTMLSpanElement | null>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /**
   * The list is long enough that a trackpad is not always enough to get down it
   * — and on the deployed page the panel may be the only thing a client can
   * reach. Two buttons that page it are the difference between a tool they can
   * use and one they cannot.
   */
  const page = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * (el.clientHeight * 0.8), behavior: "smooth" });
  }, []);

  // The stored session is restored on the way to the first paint — see
  // `restoreStoredSession`, which also decides which mode button opens lit.
  useEffect(() => {
    invalidate();
  }, []);

  /**
   * The material dials live on the material rather than in the uniform table,
   * and `VELLUM_MATERIAL` is only populated while a VELLUM page is on screen —
   * so a stored roughness cannot be restored on mount the way a uniform can. It
   * is re-applied whenever the panel is opened instead, which is the moment
   * there is certainly something to apply it to, and it stays a no-op on every
   * other surah.
   */
  useEffect(() => {
    if (!open) return;
    const stored = readStored();
    const mat = stored?.__material as Record<string, number> | undefined;
    if (mat)
      for (const prop of Object.keys(VELLUM_MATERIAL_DIALS)) {
        const v = mat[prop];
        if (typeof v === "number") applyVellumMaterial(prop as VellumMaterialDial, v);
      }

    // Only where it actually differs: `setContentDial` bumps the revision that
    // makes the page's whole RenderTexture be captured again, and paying for
    // that every time the panel is opened would be a visible stall for nothing.
    const shadow = stored?.__shadow as Record<string, number> | undefined;
    if (shadow)
      for (const dial of Object.keys(CONTENT_DIALS) as ContentDial[]) {
        const v = shadow[dial];
        if (typeof v === "number" && v !== CAPSULE_SHADOW[dial])
          setContentDial(dial, v);
      }

    invalidate();
  }, [open]);

  const commit = useCallback(() => {
    writeStored();
    invalidate();
  }, []);

  /**
   * Make every input show the value it is now bound to.
   *
   * The inputs are UNCONTROLLED — a slider writes into the uniform and React is
   * never told, which is the whole reason dragging one is free. The cost is
   * that changing a uniform from anywhere else leaves the input showing the old
   * number, so anything that rewrites the dials wholesale has to throw the
   * inputs away and let them mount again against the new values. The numeric
   * readouts are spans rather than inputs, so those are just written.
   */
  const remount = useCallback(() => {
    for (const [name, el] of Object.entries(readouts.current)) {
      const u = VELLUM_UNIFORMS[name]?.value;
      if (el && typeof u === "number") el.textContent = fmt(u);
    }
    setOpen(false);
    window.setTimeout(() => setOpen(true), 0);
    invalidate();
  }, []);

  const chooseMode = useCallback(
    (index: number) => {
      applyVellumPreset(index);
      activeMode = index;
      setMode(index);
      writeStored();
      remount();
    },
    [remount],
  );

  // What the shadow sliders are showing but have not yet applied — see the note
  // at the input.
  const pendingShadow = useRef<Partial<Record<ContentDial, number>>>({});
  const commitShadow = useCallback(
    (dial: ContentDial) => {
      const v = pendingShadow.current[dial];
      if (v === undefined) return;
      delete pendingShadow.current[dial];
      setContentDial(dial, v);
      writeStored();
      invalidate();
    },
    [],
  );

  const groups = Object.entries(VELLUM_DIALS).reduce<
    Record<string, [string, (typeof VELLUM_DIALS)[keyof typeof VELLUM_DIALS]][]>
  >((acc, [name, dial]) => {
    (acc[dial.group] ??= []).push([name, dial]);
    return acc;
  }, {});

  if (!allowed) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ ...styles.tab, ...styles.tabClosed }}
      >
        vellum
      </button>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.head}>
        <strong style={styles.title}>vellum</strong>
        <div style={styles.headActions}>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => {
              navigator.clipboard?.writeText(vellumUniformsAsSource());
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "copied" : "copy"}
          </button>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => {
              resetVellumUniforms();
              for (const [prop, v] of Object.entries(VELLUM_MATERIAL_DEFAULTS))
                applyVellumMaterial(prop as VellumMaterialDial, v);
              for (const [dial, v] of Object.entries(CAPSULE_SHADOW_DEFAULTS))
                setContentDial(dial as ContentDial, v);
              localStorage.removeItem(STORAGE_KEY);
              // Reset writes exactly the file's own defaults, which IS Mode 2 —
              // see `currentAsPreset`. Saying so keeps the buttons honest.
              activeMode = VELLUM_DEFAULT_PRESET;
              setMode(VELLUM_DEFAULT_PRESET);
              remount();
            }}
          >
            reset
          </button>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
      </div>

      {/*
        THE TWO PAPERS. A whole take per button — dials, material and shadow —
        so the pair can be compared by clicking rather than by pasting numbers
        into the source and reloading. Mode 2 is what the page loads with.
      */}
      <div style={styles.modes}>
        {VELLUM_PRESETS.map((preset, i) => (
          <button
            key={preset.label}
            type="button"
            title={preset.note}
            onClick={() => chooseMode(i)}
            style={{
              ...styles.modeBtn,
              ...(i === mode ? styles.modeBtnOn : null),
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div style={styles.pager}>
        <button
          type="button"
          style={styles.pagerBtn}
          onClick={() => page(-1)}
          aria-label="Scroll up"
        >
          ↑
        </button>
        <button
          type="button"
          style={styles.pagerBtn}
          onClick={() => page(1)}
          aria-label="Scroll down"
        >
          ↓
        </button>
      </div>

      <div style={styles.scroll} ref={scrollRef}>
        {Object.entries(groups).map(([group, dials]) => (
          <div key={group} style={styles.group}>
            <div style={styles.groupName}>{group}</div>
            {dials.map(([name, dial]) => {
              const u = VELLUM_UNIFORMS[name];
              if (dial.kind === "color" && u.value instanceof Vector3) {
                return (
                  <label key={name} style={styles.row}>
                    <span style={styles.label}>{dial.label}</span>
                    <input
                      type="color"
                      defaultValue={vecToHex(u.value)}
                      style={styles.color}
                      onChange={(e) => {
                        hexToVec(e.target.value, u.value as Vector3);
                        commit();
                      }}
                    />
                  </label>
                );
              }

              if (dial.kind === "vec3" && u.value instanceof Vector3) {
                return (
                  <div key={name} style={styles.row}>
                    <span style={styles.label}>{dial.label}</span>
                    <div style={styles.triple}>
                      {(["x", "y", "z"] as const).map((axis) => (
                        <input
                          key={axis}
                          type="number"
                          step={dial.step}
                          min={dial.min}
                          max={dial.max}
                          defaultValue={(u.value as Vector3)[axis]}
                          style={styles.num}
                          onChange={(e) => {
                            (u.value as Vector3)[axis] =
                              parseFloat(e.target.value) || 0;
                            commit();
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <label key={name} style={styles.row}>
                  <span style={styles.label}>{dial.label}</span>
                  <input
                    type="range"
                    min={dial.min}
                    max={dial.max}
                    step={dial.step}
                    defaultValue={u.value as number}
                    style={styles.range}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value);
                      u.value = n;
                      const el = readouts.current[name];
                      if (el) el.textContent = fmt(n);
                      commit();
                    }}
                  />
                  <span
                    ref={(el) => {
                      readouts.current[name] = el;
                    }}
                    style={styles.value}
                  >
                    {fmt(u.value as number)}
                  </span>
                </label>
              );
            })}
          </div>
        ))}

        {/*
         * The capsule shadow. Same panel again, third destination: this one is
         * drawn INTO the page texture, so moving it reopens that capture for a
         * moment — see `CAPSULE_SHADOW`. It is the only group here that is not
         * free to drag.
         */}
        {/*
         * Shown only on a vellum page. Everywhere else the capsules cast the
         * shadow they always have (`CAPSULE_SHADOW_LEGACY`), so these sliders
         * would move nothing — and a control that does nothing is exactly the
         * confusion this panel keeps having to avoid.
         */}
        {isVellumPage && (
        <div style={styles.group}>
          <div style={styles.groupName}>Shadow</div>
          {Object.entries(CONTENT_DIALS).map(([dial, cfg]) => (
            <label key={dial} style={styles.row}>
              <span style={styles.label}>{cfg.label}</span>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                defaultValue={CAPSULE_SHADOW[dial as ContentDial]}
                style={styles.range}
                /*
                 * The number follows the thumb, but the PAGE is only rebuilt when
                 * the thumb is let go. Every other dial on this panel is read by
                 * the shader each frame and costs nothing to drag; this one
                 * redraws the whole page texture and, on the composed atlas,
                 * restarts the detail ladder with it. Doing that on every pointer
                 * move would make the slider unusable — so the drag is free and
                 * the commit happens once, on release.
                 */
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  pendingShadow.current[dial as ContentDial] = n;
                  const el = readouts.current["shadow-" + dial];
                  if (el) el.textContent = fmt(n);
                }}
                onPointerUp={() => commitShadow(dial as ContentDial)}
                onKeyUp={() => commitShadow(dial as ContentDial)}
                onBlur={() => commitShadow(dial as ContentDial)}
              />
              <span
                ref={(el) => {
                  readouts.current["shadow-" + dial] = el;
                }}
                style={styles.value}
              >
                {fmt(CAPSULE_SHADOW[dial as ContentDial])}
              </span>
            </label>
          ))}
        </div>
        )}

        {/*
         * The material's own dials. Same panel, different destination — these
         * are three.js material properties rather than shader uniforms, so they
         * are written through `applyVellumMaterial`. They are what make the
         * sheet feel like a lit object rather than a picture of one.
         */}
        <div style={styles.group}>
          <div style={styles.groupName}>Material</div>
          {Object.entries(VELLUM_MATERIAL_DIALS).map(([prop, dial]) => (
            <label key={prop} style={styles.row}>
              <span style={styles.label}>{dial.label}</span>
              <input
                type="range"
                min={dial.min}
                max={dial.max}
                step={dial.step}
                defaultValue={readVellumMaterial(prop as VellumMaterialDial)}
                style={styles.range}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  applyVellumMaterial(prop as VellumMaterialDial, n);
                  const el = readouts.current[prop];
                  if (el) el.textContent = fmt(n);
                  commit();
                }}
              />
              <span
                ref={(el) => {
                  readouts.current[prop] = el;
                }}
                style={styles.value}
              >
                {fmt(readVellumMaterial(prop as VellumMaterialDial))}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  const a = Math.abs(n);
  return a < 0.01 ? n.toFixed(4) : a < 1 ? n.toFixed(3) : n.toFixed(2);
}

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const styles: Record<string, React.CSSProperties> = {
  tab: {
    position: "fixed",
    // Below the app's own overlay row (layers / language / theme / home /
    // menu), which lives along the top-right. At top:8 the panel sat straight
    // on top of them and swallowed every one.
    top: 132,
    right: 8,
    zIndex: 10000,
    font: `500 11px ${mono}`,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#c9a227",
    background: "rgba(20,18,14,0.92)",
    border: "1px solid #3a3327",
    borderRadius: 3,
    padding: "6px 10px",
    cursor: "pointer",
  },
  tabClosed: {},
  panel: {
    position: "fixed",
    // ANCHORED AT BOTH ENDS, which is what actually stops it running off the
    // screen. `maxHeight: calc(100vh - …)` only works if the panel's top is
    // where you think it is, and it was not: `100vh` is always the viewport,
    // but `top` is measured from the containing block. Pinning `bottom` as well
    // leaves the panel no height of its own to get wrong — it is whatever fits
    // between the two edges, and the dials scroll inside it.
    top: 132,
    bottom: 8,
    right: 8,
    zIndex: 10000,
    width: 300,
    display: "flex",
    flexDirection: "column",
    background: "rgba(20,18,14,0.94)",
    border: "1px solid #3a3327",
    borderRadius: 4,
    color: "#ece5d6",
    font: `12px ${mono}`,
    backdropFilter: "blur(6px)",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "8px 10px",
    borderBottom: "1px solid #3a3327",
    // The header stays put while the dials scroll under it.
    flexShrink: 0,
  },
  title: {
    font: `500 11px ${mono}`,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#c9a227",
  },
  headActions: { display: "flex", gap: 5 },
  modes: {
    display: "flex",
    gap: 5,
    padding: "7px 10px",
    borderBottom: "1px solid #2a251c",
    flexShrink: 0,
  },
  modeBtn: {
    flex: 1,
    font: `500 11px ${mono}`,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#b8b0a0",
    background: "transparent",
    border: "1px solid #3a3327",
    borderRadius: 2,
    padding: "4px 0",
    cursor: "pointer",
  },
  /** The chosen one, in the panel's own gold. */
  modeBtnOn: {
    color: "#141210",
    background: "#c9a227",
    borderColor: "#c9a227",
  },
  pager: {
    display: "flex",
    gap: 5,
    padding: "5px 10px",
    borderBottom: "1px solid #2a251c",
    flexShrink: 0,
  },
  pagerBtn: {
    flex: 1,
    font: `12px ${mono}`,
    lineHeight: 1,
    color: "#ece5d6",
    background: "transparent",
    border: "1px solid #3a3327",
    borderRadius: 2,
    padding: "3px 0",
    cursor: "pointer",
  },
  smallBtn: {
    font: `11px ${mono}`,
    color: "#ece5d6",
    background: "transparent",
    border: "1px solid #3a3327",
    borderRadius: 2,
    padding: "2px 7px",
    cursor: "pointer",
  },
  /**
   * THE SCROLLING HALF. `flex` and `minHeight` are belt and braces rather than
   * the fix — an item with `overflow` other than `visible` already has an
   * automatic minimum size of zero, so this scrolled on its own. What stopped
   * it reaching the screen was the containing block; see the note at its mount
   * site in SurahViewer.
   */
  scroll: {
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "4px 10px 10px",
  },
  group: { marginTop: 10 },
  groupName: {
    font: `500 10px ${mono}`,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#8d8473",
    padding: "6px 0 4px",
    borderTop: "1px solid #2a251c",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 96px 52px",
    alignItems: "center",
    gap: 8,
    padding: "3px 0",
  },
  label: { color: "#b8b0a0", fontSize: 11, lineHeight: 1.25 },
  range: { width: "100%", accentColor: "#c9a227", cursor: "ew-resize" },
  value: {
    textAlign: "right",
    color: "#c9a227",
    fontVariantNumeric: "tabular-nums",
    fontSize: 11,
  },
  color: {
    width: "100%",
    height: 20,
    padding: 0,
    border: "1px solid #3a3327",
    background: "transparent",
    cursor: "pointer",
    gridColumn: "2 / span 2",
  },
  triple: { display: "flex", gap: 4, gridColumn: "2 / span 2" },
  num: {
    width: "100%",
    minWidth: 0,
    font: `11px ${mono}`,
    color: "#ece5d6",
    background: "#14120e",
    border: "1px solid #3a3327",
    borderRadius: 2,
    padding: "2px 4px",
  },
};
