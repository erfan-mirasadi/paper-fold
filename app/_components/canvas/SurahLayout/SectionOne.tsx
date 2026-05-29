// "use client";
// import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
// import { useTexture } from "@react-three/drei";
// import * as THREE from "three";
// import {
//   S1_OUTER_BORDER,
//   S1_OUTER_BG,
//   S1_INNER_BG,
//   S1_INNER_BORDER,
//   S1_ANA_BG,
//   CAPSULE_BG_5,
//   S1_VERSE_NUMBER_BG,
//   S1_VERSE_NUMBER_BORDER,
//   S1_VERSE_NUMBER_TEXT,
//   S1_TOP_LABEL_BG,
//   S1_TOP_LABEL_BORDER,
// } from "../../../data/theme";
// import {
//   S1_NEON_CONFIG,
//   OPPOSITE_VERSE_CONNECTOR,
//   type SectionOneData,
//   type S1Transforms,
// } from "../../../data/SurahConfig";

// interface SectionOneProps {
//   data: SectionOneData;
//   transforms: S1Transforms;
//   PW: number;
//   isFolded?: boolean;
// }

// function BorderSvg({
//   x,
//   y,
//   w,
//   h,
//   z,
// }: {
//   x: number;
//   y: number;
//   w: number;
//   h: number;
//   z: number;
// }) {
//   const texture = useTexture("/SectionOneFrame.svg", (t) => {
//     t.colorSpace = THREE.SRGBColorSpace;
//   });
//   const svgW = 4200;
//   const svgH = 3000;

//   // Base scale based on the section's frame
//   const baseScale = Math.max(w / svgW, h / svgH) * 1.05;

//   // Adjustments: decrease width from sides by a lot, increase height a bit
//   const widthMultiplier = 1.0;
//   const heightMultiplier = 0.65;

//   const renderW = svgW * baseScale * widthMultiplier;
//   const renderH = svgH * baseScale * heightMultiplier;

//   return (
//     <mesh position={[x + w / 2, y - h / 2, z]} renderOrder={1}>
//       <planeGeometry args={[renderW, renderH]} />
//       <meshBasicMaterial
//         map={texture}
//         transparent
//         depthTest={true}
//         opacity={1}
//         toneMapped={false}
//       />
//     </mesh>
//   );
// }

// export function SectionOne({ data, transforms, PW }: SectionOneProps) {
//   const neon = S1_NEON_CONFIG;
//   const frameRadius = 0.02;
//   const topLabelCutoutW = neon.topLabelGapWidth + neon.topLabelGapPadding * 2;
//   const hideSectionLabel = false;
//   const t = transforms;

//   return (
//     <group>
//       <>
//         {/* --- NEON BORDERS COMMENTED OUT ---
//         <UiRect
//           x={t.frameX - neon.outerHaloPad}
//           y={t.frameY + neon.outerHaloPad}
//           z={neon.haloZ - 0.0005}
//           w={t.frameW + neon.outerHaloPad * 2}
//           h={t.frameH + neon.outerHaloPad * 2}
//           radius={frameRadius + neon.outerHaloPad}
//           color={S1_NEON_GOLD}
//           transparent
//           opacity={neon.outerHaloOpacity}
//           emissive={S1_NEON_GOLD}
//           emissiveIntensity={neon.outerHaloEmissiveIntensity}
//           toneMapped={false}
//           depthTest={true}
//         />

//         <UiRect
//           x={t.frameX - neon.haloPad}
//           y={t.frameY + neon.haloPad}
//           z={neon.haloZ}
//           w={t.frameW + neon.haloPad * 2}
//           h={t.frameH + neon.haloPad * 2}
//           radius={frameRadius + neon.haloPad}
//           color={S1_NEON_GOLD}
//           transparent
//           opacity={neon.haloOpacity}
//           emissive={S1_NEON_GOLD}
//           emissiveIntensity={neon.haloEmissiveIntensity}
//           toneMapped={false}
//           depthTest={true}
//         />

//         <UiRect
//           x={t.frameX}
//           y={t.frameY}
//           z={neon.haloZ + 0.0006}
//           w={t.frameW}
//           h={t.frameH}
//           radius={frameRadius}
//           color={S1_OUTER_BORDER}
//           depthTest={true}
//         />

//         <UiRect
//           x={PW / 2 - topLabelCutoutW / 2}
//           y={t.frameY + neon.topLabelGapYOffset}
//           z={neon.haloZ + 0.0008}
//           w={topLabelCutoutW}
//           h={neon.topLabelGapHeight}
//           radius={Math.min(neon.topLabelGapHeight / 2, 0.03)}
//           color={S1_OUTER_BORDER}
//           depthTest={true}
//         />
//         --- */}
//         <UiRect
//           x={t.frameX}
//           y={t.frameY}
//           z={0}
//           w={t.frameW}
//           h={t.frameH}
//           radius={0.02}
//           color={S1_OUTER_BORDER}
//           shadow
//         />
//         {/* Outer wrapper — fill layer */}
//         <UiRect
//           x={t.frameX + t.borderWidth}
//           y={t.frameY - t.borderWidth}
//           z={0.001}
//           w={t.frameW - t.borderWidth * 2}
//           h={t.frameH - t.borderWidth * 2}
//           radius={0.017}
//           color={S1_OUTER_BG}
//         />

//         {/* Decorative SVG Border */}
//         <BorderSvg
//           x={t.frameX}
//           y={t.frameY}
//           w={t.frameW}
//           h={t.frameH}
//           z={0.002}
//         />
//       </>

//       {/* Row Connectors for opposite verses */}
//       {t.rowConnectors.map((rc, i) => {
//         const leftV = data.gridVerses[i * 2];
//         const rightV = data.gridVerses[i * 2 + 1];

//         if (!leftV || !rightV) return null;

//         return (
//           <UiRect
//             key={`connector-${i}`}
//             x={rc.x}
//             y={rc.y}
//             z={rc.z}
//             w={rc.w}
//             h={rc.h}
//             radius={OPPOSITE_VERSE_CONNECTOR.radius}
//             color={S1_INNER_BORDER}
//           />
//         );
//       })}

//       {/* 2×2 verse grid — positions come from the engine, no math here */}
//       {data.gridVerses.map((v) => {
//         const vt = t.verses[v.number];

//         return (
//           <VerseBox
//             key={v.number}
//             x={vt.x}
//             y={vt.y}
//             z={vt.z}
//             w={vt.w}
//             h={vt.h}
//             verse={v.text}
//             number={v.number}
//             bg={S1_INNER_BG}
//             border={S1_INNER_BORDER}
//             circleBorderCol={S1_VERSE_NUMBER_BORDER}
//             circleBg={S1_VERSE_NUMBER_BG}
//             circleTextCol={S1_VERSE_NUMBER_TEXT}
//             isPill={true}
//           />
//         );
//       })}

//       {/* AnaAyet — y offset absorbed by LayoutEngine, no wrapper group needed */}
//       <VerseBox
//         x={t.anaAyet.x}
//         y={t.anaAyet.y}
//         z={t.anaAyet.z}
//         w={t.anaAyet.w}
//         h={t.anaAyet.h}
//         verse={data.anaAyet.text}
//         number={data.anaAyet.number}
//         bg={S1_ANA_BG}
//         border={CAPSULE_BG_5}
//         circleBorderCol={CAPSULE_BG_5}
//         circleBg={S1_ANA_BG}
//         circleTextCol={CAPSULE_BG_5}
//         isPill={false}
//       />
//       <AnaAyetTab
//         x={t.anaAyetTabX}
//         y={t.anaAyetTabY}
//         w={t.anaAyetTabW}
//         h={t.anaAyetTabH}
//         z={0.005}
//         renderOrder={100}
//       />

//       {/* Section title label pinned to the top edge */}
//       {!hideSectionLabel && (
//         <TopLabel
//           x={PW / 2}
//           y={t.labelPinY}
//           z={0.004}
//           text={data.label}
//           bgColor={S1_TOP_LABEL_BG}
//           borderColor={S1_TOP_LABEL_BORDER}
//           renderOrder={100}
//         />
//       )}
//     </group>
//   );
// }

"use client";
import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  S1_OUTER_BORDER,
  S1_OUTER_BG,
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_ANA_BG,
  CAPSULE_BG_5,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S1_NEON_GOLD,
} from "../../../data/theme";
import {
  S1_NEON_CONFIG,
  OPPOSITE_VERSE_CONNECTOR,
  type SectionOneData,
  type S1Transforms,
} from "../../../data/SurahConfig";

interface SectionOneProps {
  data: SectionOneData;
  transforms: S1Transforms;
  PW: number;
  isFolded?: boolean;
}

export function SectionOne({ data, transforms, PW }: SectionOneProps) {
  const neon = S1_NEON_CONFIG;
  const frameRadius = 0.02;
  const topLabelCutoutW = neon.topLabelGapWidth + neon.topLabelGapPadding * 2;
  const hideSectionLabel = false;
  const t = transforms;

  const texture = useTexture("/Group 10.svg", (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <group>
      <>
        {/* Yellow solid background */}
        <mesh
          position={[t.frameX + t.frameW / 2, t.frameY - t.frameH / 2, -0.001]}
        >
          <planeGeometry args={[t.frameW * 1.05, t.frameH * 1]} />
          <meshBasicMaterial color="#F0E4E5" />
        </mesh>

        {/* Simple stretched main-frame image as background */}
        <mesh
          position={[
            t.frameX + t.frameW / 2,
            t.frameY - t.frameH / 2 + 0.01,
            0,
          ]}
        >
          <planeGeometry args={[t.frameW * 1.1, t.frameH * 1.1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthTest={true}
            toneMapped={false}
          />
        </mesh>
      </>

      {/* Row Connectors for opposite verses */}
      {t.rowConnectors.map((rc, i) => {
        const leftV = data.gridVerses[i * 2];
        const rightV = data.gridVerses[i * 2 + 1];

        if (!leftV || !rightV) return null;

        return (
          <UiRect
            key={`connector-${i}`}
            x={rc.x}
            y={rc.y}
            z={rc.z}
            w={rc.w}
            h={rc.h}
            radius={OPPOSITE_VERSE_CONNECTOR.radius}
            color={S1_INNER_BORDER}
          />
        );
      })}

      {/* 2×2 verse grid — positions come from the engine, no math here */}
      {data.gridVerses.map((v) => {
        const vt = t.verses[v.number];

        return (
          <VerseBox
            key={v.number}
            x={vt.x}
            y={vt.y}
            z={vt.z}
            w={vt.w}
            h={vt.h}
            verse={v.text}
            number={v.number}
            bg={S1_INNER_BG}
            border={S1_INNER_BORDER}
            circleBorderCol={S1_VERSE_NUMBER_BORDER}
            circleBg={S1_VERSE_NUMBER_BG}
            circleTextCol={S1_VERSE_NUMBER_TEXT}
            isPill={true}
          />
        );
      })}

      {/* AnaAyet — y offset absorbed by LayoutEngine, no wrapper group needed */}
      <VerseBox
        x={t.anaAyet.x}
        y={t.anaAyet.y}
        z={t.anaAyet.z}
        w={t.anaAyet.w}
        h={t.anaAyet.h}
        verse={data.anaAyet.text}
        number={data.anaAyet.number}
        bg={S1_ANA_BG}
        border={CAPSULE_BG_5}
        circleBorderCol={CAPSULE_BG_5}
        circleBg={S1_ANA_BG}
        circleTextCol={CAPSULE_BG_5}
        isPill={false}
      />
      <AnaAyetTab
        x={t.anaAyetTabX}
        y={t.anaAyetTabY}
        w={t.anaAyetTabW}
        h={t.anaAyetTabH}
        z={0.005}
        renderOrder={100}
      />

      {/* Section title label pinned to the top edge */}
      {!hideSectionLabel && (
        <TopLabel
          x={PW / 2}
          y={t.labelPinY}
          z={0.004}
          text={data.label}
          bgColor={S1_TOP_LABEL_BG}
          borderColor={S1_TOP_LABEL_BORDER}
          renderOrder={100}
        />
      )}
    </group>
  );
}
