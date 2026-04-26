<div align="center">

# Quran Fold (Paper Fold)

Premium 3D Interactive Quran Reading Experience

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## Core Innovation (First)

### WebGL Texture Projection on 3D Paper

This project's main technique is dynamic texture projection with WebGL:

- Quran layout is rendered in real time into textures using `RenderTexture`.
- These textures are attached to a deforming 3D paper material as:
  - `map` (main color/content)
  - `normalMap` (crease and surface normal detail)
- The paper itself is a skinned mesh with many bones, so text and graphics bend with the fold in real time.

In short: texture is not static image mapping, it is a live-rendered scene projected onto a physically deforming page.

## Features (Implemented Now)

### 1) Scroll-Driven 3D Folding (Paper Physics)

- Bone-based page deformation with high segmentation for precise fold behavior.
- Multi-stage fold story with interpolated angles between fold states.
- Programmatic fold/unfold navigation between stages.
- Fold sound effect on stage changes.

### 2) Dynamic and Animated Texture Pipeline

- Real-time color texture from Surah layout (`RenderTexture`).
- Separate bump pass for embossed UI/verse surfaces.
- Separate normal pass combining paper normal texture and crease bands.
- Texture visibility timing is synchronized with pop-up and elevate animations.
- Animated texture refresh is used in interactive cards (`frames={2}` and `frames={Infinity}` where needed).

### 3) 3D Elements Emerging From the Paper

- Interactive pop-up verse cards are rendered as 3D extruded bodies that fold open/close.
- Verse 5 is rendered as a dedicated metallic 3D extruded model on top of paper.
- Elevation system lifts verses/sections above the page with animated shadow and tilt.

This is the "model coming out of the paper" behavior in the current implementation.

### 4) Click Interaction + Camera Focus

- Invisible per-verse and per-section 3D hitboxes for accurate click targeting.
- Camera state machine with phases:
  - `idle`
  - `zooming_in`
  - `zoomed`
  - `zooming_out`
- Smooth zoom-in and return behavior.
- Edge panning while zoomed.
- Reset overlay button for returning camera.

### 5) Neon Verse Focus Overlay

- Active verse border is projected from real 3D geometry to screen space every frame.
- SVG neon draw animation with glow and fade.
- Overlay follows camera and folded page transform.

### 6) Elevated Sections and Verse Groups

- Multi-select verse elevation store.
- Section-level lift interactions for major groups.
- Spring-based lift, tilt, scale, and shadow animation.
- Elevated labels/surfaces for active sections.

### 7) Popup Verse Controls and 3D Anchoring

- Individual and global popup toggles.
- Popup UI buttons are anchored to 3D world positions via shared tracker.
- Scroll-threshold-based popup anchor visibility.

### 8) Postprocessing and Atmosphere

- ACES tone mapping.
- Brightness/contrast adjustment.
- Vignette.
- Depth of field (reactive to elevated phase).
- Triggered glitch effect.
- Interactive desktop particle field (hover-reactive + animated drift).

### 9) Theme and UI Overlay

- Light/dark mode toggle.
- Navigation overlay for fold/unfold transitions.

### 10) Tafsir System Status

- Tafsir 3D tracker and tafsir UI components are implemented.
- In the current page composition, tafsir UI/scroll tracker is commented out (not currently shown to end user by default).

## Tech Stack (Used in Code)

- Framework: Next.js 16, React 19, TypeScript
- 3D: Three.js, React Three Fiber, @react-three/drei
- Animation: @react-spring/three, framer-motion, maath easing
- State: Zustand
- Postprocessing: @react-three/postprocessing + postprocessing
- Styling: CSS (global + inline style-driven overlays)

## Interaction Guide

- Scroll: drives fold progression.
- Left top nav button: smart fold/unfold jump between story states.
- Click verse/section: elevate and focus interactions.
- Popup buttons: open/close verse popup cards.
- Theme button: toggle light/dark mode.
- Reset button (when zoomed): return camera.

## Project Structure (High-Level)

```text
app/
	_components/
		3d-scene/              # camera, paper mesh, scroll manager, effects, particles
		SurahLayout/           # Quran layout rendered into textures
		features/
			camera-zoom/         # verse hitboxes, camera store, neon overlay
			elevated-verses/     # elevation stores, springs, surfaces, labels
			pop-up-verses/       # popup manager, 3D cards, metallic verse
			tafsir/              # tafsir data, tracker, UI
		shared/                # reusable 3D-to-DOM tracker and visibility hooks
		ui-overlay/            # navigation and UI overlays
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- This README documents currently implemented behavior in the codebase.
- Some installed packages are experimental or currently unused in runtime scenes.
