"use client";

interface QuranicBorderProps {
  PW: number;
  PAGE_HEIGHT: number;
}

export function QuranicBorder({ PW, PAGE_HEIGHT }: QuranicBorderProps) {
  const m = 0.02; // Outer margin
  const gap = 0.005; // Gap between borders
  const t1 = 0.002; // Thickness of outer gold border
  const t2 = 0.001; // Thickness of inner maroon border
  const outerColor = "#cca768";
  const innerColor = "#8f4265";
  const cx = PW / 2;
  const cy = -PAGE_HEIGHT / 2;
  const ow = PW - m * 2;
  const oh = PAGE_HEIGHT - m * 2;
  const iw = ow - gap * 2;
  const ih = oh - gap * 2;

  return (
    <group position={[0, 0, 0.002]}>
      {/* Outer Border (Gold) */}
      <mesh position={[cx, -m, 0]}>
        <planeGeometry args={[ow, t1]} />
        <meshBasicMaterial color={outerColor} depthTest={false} />
      </mesh>
      <mesh position={[cx, -(PAGE_HEIGHT - m), 0]}>
        <planeGeometry args={[ow, t1]} />
        <meshBasicMaterial color={outerColor} depthTest={false} />
      </mesh>
      <mesh position={[m, cy, 0]}>
        <planeGeometry args={[t1, oh]} />
        <meshBasicMaterial color={outerColor} depthTest={false} />
      </mesh>
      <mesh position={[PW - m, cy, 0]}>
        <planeGeometry args={[t1, oh]} />
        <meshBasicMaterial color={outerColor} depthTest={false} />
      </mesh>

      {/* Inner Border (Maroon) */}
      <mesh position={[cx, -(m + gap), 0]}>
        <planeGeometry args={[iw, t2]} />
        <meshBasicMaterial color={innerColor} depthTest={false} />
      </mesh>
      <mesh position={[cx, -(PAGE_HEIGHT - m - gap), 0]}>
        <planeGeometry args={[iw, t2]} />
        <meshBasicMaterial color={innerColor} depthTest={false} />
      </mesh>
      <mesh position={[m + gap, cy, 0]}>
        <planeGeometry args={[t2, ih]} />
        <meshBasicMaterial color={innerColor} depthTest={false} />
      </mesh>
      <mesh position={[PW - m - gap, cy, 0]}>
        <planeGeometry args={[t2, ih]} />
        <meshBasicMaterial color={innerColor} depthTest={false} />
      </mesh>

      {/* Elegant Corner Diamonds */}
      {[
        [m, -m],
        [PW - m, -m],
        [m, -(PAGE_HEIGHT - m)],
        [PW - m, -(PAGE_HEIGHT - m)],
      ].map((pos, i) => (
        <mesh
          key={i}
          position={[pos[0], pos[1], 0.001]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <planeGeometry args={[0.012, 0.012]} />
          <meshBasicMaterial color={outerColor} depthTest={false} />
        </mesh>
      ))}
    </group>
  );
}
