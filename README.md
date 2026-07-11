<div align="center">

# 🌌 3D Interactive Folded Document
### ✧ A Premium Tactile Reading Experience in the Browser ✧

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br />

*Where Typography Meets Physics*

</div>

<br />

> Welcome to a bleeding-edge exploration of layout and 3D space. This project transforms traditional flat digital reading into a highly tactile, physical experience using advanced WebGL rendering, custom shaders, and skeletal mesh animation.

---

## ✦ Core Innovation ✦

<table align="center">
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🎬 Cinematic WebGL Intro</h3>
      <p>The experience begins with a deeply immersive, scroll-driven cinematic intro. The camera glides dramatically across 3D typography and abstract geometries.</p>
      <ul>
        <li><b>Scroll Orchestration:</b> A strict timeline (Intro ➔ Handoff ➔ Story).</li>
        <li><b>Seamless Handoff:</b> At the exact handoff point, the camera locks into place, unlocking the interactive 3D paper fold experience.</li>
        <li><b>Dynamic Resolution:</b> Heavy textures scale dynamically during the intro to maintain buttery-smooth framerates.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">🖌️ Texture Projection</h3>
      <p>The defining technique of this project is dynamic texture projection mapped onto a deforming physical surface.</p>
      <ul>
        <li><b>Real-time Render:</b> Document layout is rendered into high-fidelity textures continuously.</li>
        <li><b>Precision Mapping:</b> Maps to a custom 3D paper material (<code>map</code> & <code>normalMap</code>).</li>
        <li><b>Skinned Mesh:</b> The paper is a highly segmented skinned mesh driven by an intricate bone system, bending and warping organically.</li>
      </ul>
    </td>
  </tr>
</table>

---

## ⚡ Key Features ⚡

### ◫ Scroll-Driven 3D Folding Mechanics
| Feature | Description |
| :--- | :--- |
| **🦴 Bone-Based Deformation** | High segmentation for incredibly precise, organic fold behavior. |
| **🎞️ Multi-Stage Interpolation** | The storytelling unfolds through smoothly interpolated angles between distinct fold states. |
| **🕹️ Programmatic Navigation** | Effortlessly fold and unfold the paper through responsive stage transitions. |
| **🔊 Audio Feedback** | Authentic, tactile fold sound effects trigger responsively on stage changes. |

<br />

### 🕋 3D Capsules and Dynamic Elevation
> *Bridging 2D content with 3D volume.*

- **Elevated Capsules:** 2D layout elements intelligently transform into individual 3D capsules.
- **Positional Tracking:** An advanced elevation system tracks the deformed paper mesh, lifting distinct sections above the page.
- **Interactive Extrusions:** Text sections are rendered as dedicated metallic 3D extrusions, dynamically folding open and close.
- **Reactive Shadows & Tilt:** Each capsule casts physically accurate animated shadows, respecting the local surface normal of the folded mesh.

<br />

### 🎭 Advanced DOM Overlays & UI Layering
A rich ecosystem of HTML overlays perfectly synchronized atop the WebGL canvas, animated fluidly with `framer-motion`:
- **Intro Overlays:** Choreographed elements and floating `AmbientMedia` tied seamlessly to the scroll.
- **Alpha-Channeled Shadows:** The WebGL Canvas casts dynamic, real-time drop-shadows onto the underlying DOM elements utilizing CSS filters based on the 3D alpha channel.

<br />

### 🎥 Precision Interaction & Camera State Machine
* **Hitbox Mapping:** Invisible, per-capsule 3D hitboxes allow for pixel-perfect click targeting, even as the mesh deforms.
* **Camera Orchestration:** An intricate state machine (`idle` ➔ `zooming_in` ➔ `zoomed` ➔ `zooming_out`).

<br />

### 🌌 Postprocessing & Cinematic Atmosphere
* **Color Science:** ACES tone mapping with Vignette, Brightness, and Contrast adjustments.
* **Reactive Optics:** Depth of Field that reacts dynamically to the camera's elevation.
* **Environment:** Interactive desktop particle fields and volumetric SpotLights casting cinematic beams.

---

## 🛠️ Tech Stack

<div align="center">
  <code>Next.js 16.2.1</code> • <code>React 19.2.4</code> • <code>TypeScript 5</code> • <code>TailwindCSS v4</code> <br/>
  <code>Three.js v0.183.2</code> • <code>@react-three/fiber v9.5.0</code> • <code>@react-three/drei v10.7.7</code> <br/>
  <code>Framer Motion v12.38.0</code> • <code>@react-spring/three v10.0.3</code> <br/>
  <code>Lenis v1.1.13</code> • <code>Zustand</code> • <code>@react-three/postprocessing v3.0.4</code>
</div>

<br />

---

## 📂 Architecture

```text
📦 app/
 ┣ 📂 _components/
 ┃ ┣ 📂 canvas/
 ┃ ┃ ┣ 📂 3d-scene/              # Main experience, paper material, lighting
 ┃ ┃ ┣ 📂 intro/                 # Cinematic intro animations and geometries
 ┃ ┃ ┣ 📂 orchestrator/          # ScrollManager, handoff timeline, fold states
 ┃ ┃ ┣ 📂 DocumentLayout/        # Layout rendered into textures
 ┃ ┃ ┣ 📂 pop-up-blocks/         # 3D extrusions and metallic text
 ┃ ┃ ┣ 📂 sections-object/       # Hover effects, elevation surfaces
 ┃ ┃ ┗ 📂 capsules-object/       # Hitboxes and neon trackers
 ┃ ┗ 📂 dom/                     # HTML overlays (UI, Nav, Titles)
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
# http://localhost:3000
```
