"use client";

/**
 * SceneLighting — environment + base lights, mounted OUTSIDE the paper-keyed
 * Experience subtree. Remounting lights/HDR environment during a paper switch
 * caused a visible lighting pop on the swap frame; keeping them persistent
 * guarantees perfectly stable illumination across switches.
 */

import { Environment } from "@react-three/drei";
import { useElevatedStore } from "../../../stores/useElevatedStore";

export function SceneLighting() {
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  return (
    <>
      <Environment files="/hdri/lebombo_1k.hdr" environmentIntensity={1} />
      <ambientLight intensity={0.8} />
      {!isAllSectionsMode && (
        <directionalLight position={[0, 4.2, -2]} intensity={1} />
      )}
    </>
  );
}
