<div align="center">

# Quran Fold (Paper Fold)

Premium 3D Interactive Quran Reading Experience

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## Core Innovation

### Cinematic WebGL Intro & Seamless Handoff

The project begins with a deeply immersive, scroll-driven cinematic intro. As the user scrolls through the initial viewport pages , the camera dramatically glides across 3D typography and abstract geometries.

- The **ScrollManager** orchestrates a strict timeline (Intro -> Handoff -> Story).
- At the exact handoff point, the camera seamlessly locks into place, unlocking the interactive 3D paper fold experience.
- Heavy texture rendering is dynamically downscaled during the intro to maintain buttery-smooth framerates, popping to crisp high-res instantly after the handoff.

### WebGL Texture Projection on 3D Paper

This project's main technique is dynamic texture projection with WebGL:

- Quran layout is rendered in real time into textures using `RenderTexture`.
- These textures are attached to a deforming 3D paper material as:
  - `map` (main color/content)
  - `normalMap` (crease and surface normal detail)
- The paper itself is a skinned mesh with many bones, so text and graphics bend with the fold in real time.

## Features

### 1) Scroll-Driven 3D Folding (Paper Physics)

- Bone-based page deformation with high segmentation for precise fold behavior.
- Multi-stage fold story with interpolated angles between fold states.
- Programmatic fold/unfold navigation between stages.
- Fold sound effect on stage changes.

### 2) Advanced DOM Overlays & UI Layering

A rich ecosystem of HTML overlays sit on top of the WebGL canvas, animated seamlessly with `framer-motion`:

- **Intro Overlays:** `HeroTitleOverlay`, `IntroBackgroundTextOverlay`, `JoinedStepOverlay`, `IntroSectionGuidesOverlay`, and `AmbientMedia` (floating videos/images synchronized to the scroll).
- **Main UI:** `NavigationOverlay`, `TitleOverlay`, `ThemeToggleOverlay`, `LanguageSwitchOverlay`, `AllSectionsOverlay`, and `CameraViewPresetOverlay`.
- The WebGL Canvas casts dynamic, real-time drop-shadows onto the DOM elements beneath it using CSS filters based on the 3D alpha channel.

### 3) 3D Elements Emerging From the Paper

- Interactive pop-up verse cards are rendered as 3D extruded bodies that fold open/close.
- Verse 5 is rendered as a dedicated metallic 3D extruded model on top of paper.
- Elevation system lifts verses/sections above the page with animated shadow and tilt.

### 4) Click Interaction + Camera Focus

- Invisible per-verse and per-section 3D hitboxes for accurate click targeting.
- Camera state machine with phases (`idle`, `zooming_in`, `zoomed`, `zooming_out`).
- Smooth zoom-in, edge panning, and return behavior.

### 5) Postprocessing and Atmosphere

- ACES tone mapping, Vignette, and Brightness/Contrast adjustment.
- Depth of field (reactive to elevated phase).
- Interactive desktop particle field (hover-reactive + animated drift).
- Volumetric SpotLights casting cinematic beams over the paper.

## Tech Stack

The project relies on a modern, bleeding-edge tech stack:

- **Framework**: Next.js 16.2.1, React 19.2.4, TypeScript 5
- **Styling**: TailwindCSS v4, clsx, tailwind-merge
- **3D Core**: Three.js v0.183.2, @react-three/fiber v9.5.0, @react-three/drei v10.7.7
- **Animation & Physics**:
  - Framer Motion v12.38.0 (DOM animations)
  - @react-spring/three v10.0.3 (3D spring physics)
  - GSAP v3.14.2 (Complex timeline animations)
  - @theatre/core & @theatre/r3f v0.7.2 (Cinematic sequencing)
  - maath v0.10.8 (Math utilities and dampening)
- **Scroll Orchestration**: Lenis v1.1.13 (Smooth scrolling)
- **State Management**: Zustand
- **Postprocessing**: @react-three/postprocessing v3.0.4 + postprocessing v6.39.0

## Project Structure (High-Level)

```text
app/
	_components/
		canvas/
			3d-scene/              # Main experience, paper material, lighting
			intro/                 # Cinematic intro animations, text, and geometries
			orchestrator/          # ScrollManager, intro/handoff timeline, fold states
			SurahLayout/           # Quran layout rendered into textures
			pop-up-verses/         # 3D extrusions and metallic verses
			sections-object/       # Section hovering, elevation surfaces
			verses-object/         # Verse hitboxes and neon trackers
		dom/                     # All HTML overlays
			ui-overlay/            # Main controls (Theme, Nav, Language, Titles)
			AmbientMedia.tsx       # Floating videos/images during intro
			LenisProvider.tsx      # Smooth scroll context
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
