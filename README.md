<div align="center">

# 3D Interactive Folded Document

A Premium 3D Interactive Reading Experience

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

Welcome to this bleeding-edge exploration of typography, layout, and 3D space. This project transforms traditional flat digital reading into a highly tactile, physical experience using advanced WebGL rendering, custom shaders, and skeletal mesh animation.

---

## Core Innovation

### Cinematic WebGL Intro & Seamless Handoff

The experience begins with a deeply immersive, scroll-driven cinematic intro. As the user scrolls through the initial viewport pages, the camera dramatically glides across 3D typography and abstract geometries.

- The **ScrollManager** orchestrates a strict timeline (Intro -> Handoff -> Story).
- At the exact handoff point, the camera seamlessly locks into place, unlocking the interactive 3D paper fold experience.
- Heavy texture rendering is dynamically downscaled during the intro to maintain buttery-smooth framerates, instantly popping to a crisp high-resolution display post-handoff.

### WebGL Texture Projection on 3D Paper

The defining technique of this project is dynamic texture projection mapped onto a deforming physical surface using WebGL:

- The document layout is continuously rendered in real-time into high-fidelity textures using `RenderTexture`.
- These textures are precisely mapped to a custom 3D paper material as:
  - `map` (main color and content)
  - `normalMap` (crease and surface normal detail)
- The paper itself is a highly segmented skinned mesh driven by an intricate bone system. This allows the text and graphics to bend, warp, and react to folding physics in real time.

## Key Features

### 1) Scroll-Driven 3D Folding Mechanics

- **Bone-Based Deformation:** The paper mesh features high segmentation for extremely precise, organic fold behavior.
- **Multi-Stage Interpolation:** The storytelling unfolds through a multi-stage fold timeline, with smoothly interpolated angles between distinct fold states.
- **Programmatic Navigation:** Users can effortlessly fold and unfold the paper through programmatic stage transitions.
- **Audio Feedback:** Authentic fold sound effects trigger responsively on stage changes.

### 2) 3D Capsules and Dynamic Elevation

This project uniquely bridges 2D content with 3D space:

- **Elevated 3D Capsules:** 2D layout elements are intelligently transformed into individual 3D capsules.
- **Positional Tracking:** An advanced elevation system precisely tracks the underlying deformed paper mesh. It lifts these individual capsules and sections above the page, granting each its own distinct 3D volume.
- **Interactive Extrusions:** Certain text sections are rendered as dedicated metallic 3D extruded models resting on top of the paper, while pop-up text blocks act as 3D extruded bodies that can dynamically fold open and close.
- **Reactive Shadows & Tilt:** Each elevated capsule casts physically accurate animated shadows and features subtle tilting that respects the local surface normal of the underlying folded mesh.

### 3) Advanced DOM Overlays & UI Layering

A rich ecosystem of HTML overlays sits perfectly synchronized atop the WebGL canvas, animated fluidly with `framer-motion`:

- **Intro Overlays:** Elements like `HeroTitleOverlay`, `IntroBackgroundTextOverlay`, and floating `AmbientMedia` (videos/images) are choreographed to the user's scroll.
- **Main UI:** Seamless controls including `NavigationOverlay`, `ThemeToggleOverlay`, `LanguageSwitchOverlay`, and `CameraViewPresetOverlay`.
- **Alpha-Channeled Shadows:** The WebGL Canvas casts dynamic, real-time drop-shadows onto the DOM elements beneath it utilizing CSS filters based on the 3D alpha channel.

### 4) Precision Interaction & Camera State Machine

- **Hitbox Mapping:** Invisible, per-capsule and per-section 3D hitboxes allow for pixel-perfect click targeting, even as the mesh deforms.
- **Camera Orchestration:** An intricate camera state machine governs view phases (`idle`, `zooming_in`, `zoomed`, `zooming_out`).
- **Smooth Navigation:** Features smooth zoom-in, responsive edge panning, and seamless return behavior.

### 5) Postprocessing and Cinematic Atmosphere

- **Color Science:** ACES tone mapping combined with Vignette, Brightness, and Contrast adjustments for a cinematic grade.
- **Reactive Optics:** Depth of Field that dynamically reacts to the camera's elevation phase.
- **Environment:** Interactive desktop particle fields (hover-reactive with animated drift) and volumetric SpotLights casting cinematic light beams across the folded paper.

---

## Tech Stack

The project leverages a modern, performance-focused stack to achieve 60FPS across devices:

- **Framework**: Next.js 16.2.1, React 19.2.4, TypeScript 5
- **Styling**: TailwindCSS v4, clsx, tailwind-merge
- **3D Core**: Three.js v0.183.2, @react-three/fiber v9.5.0, @react-three/drei v10.7.7
- **Animation & Physics**:
  - Framer Motion v12.38.0 (DOM animations)
  - @react-spring/three v10.0.3 (3D spring physics)
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
			DocumentLayout/        # Document layout rendered into textures
			pop-up-blocks/         # 3D extrusions and metallic text
			sections-object/       # Section hovering, elevation surfaces
			capsules-object/       # Capsule hitboxes and neon trackers
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

Open [http://localhost:3000](http://localhost:3000) to view the experience.
