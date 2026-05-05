"use client";

import { useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

interface SvgParticlesProps {
  svgUrl: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isDarkMode?: boolean;
}

export function SvgParticles({
  svgUrl,
  scale = 0.005,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isDarkMode = false,
}: SvgParticlesProps) {
  const [data, setData] = useState<{
    geometry: THREE.BufferGeometry;
    originalPositions: Float32Array;
  } | null>(null);
  const { mouse, viewport, camera } = useThree();
  const mouseVec = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const loader = new SVGLoader();
    loader.load(svgUrl, (svgData) => {
      const paths = svgData.paths;
      const allShapes: THREE.Shape[] = [];

      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;

      paths.forEach((path) => {
        const shapes = path.toShapes(true);
        allShapes.push(...shapes);
        shapes.forEach((shape) => {
          const points = shape.getPoints();
          points.forEach((p) => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (-p.y < minY) minY = -p.y;
            if (-p.y > maxY) maxY = -p.y;
          });
        });
      });

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Create a sparser grid of points for longer connections
      const points: number[] = [];
      const step = 6; // Larger = fewer points

      const isPointInPolygon = (
        point: THREE.Vector2,
        polygon: THREE.Vector2[],
      ) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].x,
            yi = polygon[i].y;
          const xj = polygon[j].x,
            yj = polygon[j].y;
          const intersect =
            yi > point.y !== yj > point.y &&
            point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
        }
        return inside;
      };

      for (let x = minX; x <= maxX; x += step) {
        for (let y = -maxY; y <= -minY; y += step) {
          const p = new THREE.Vector2(x, -y);
          let inside = false;

          for (const shape of allShapes) {
            const { shape: contour, holes } = shape.extractPoints(12);
            if (isPointInPolygon(p, contour)) {
              let inHole = false;
              for (const hole of holes) {
                if (isPointInPolygon(p, hole)) {
                  inHole = true;
                  break;
                }
              }
              if (!inHole) {
                inside = true;
                break;
              }
            }
          }

          if (inside) {
            // Apply scale and center
            points.push((x - centerX) * scale, -(y + centerY) * scale, 0);
          }
        }
      }

      // Add fewer points along the outlines for cleaner look
      allShapes.forEach((shape) => {
        const outlinePoints = shape.getSpacedPoints(60);
        outlinePoints.forEach((p) => {
          points.push((p.x - centerX) * scale, (-p.y - centerY) * scale, 0);
        });
      });

      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(points);
      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

      // Create indices for a "wireframe-like" look by connecting nearby points
      const indices: number[] = [];
      const threshold = 0.4; // Large connection distance for long webs
      const posVecs = [];
      for (let i = 0; i < points.length; i += 3) {
        posVecs.push(
          new THREE.Vector3(points[i], points[i + 1], points[i + 2]),
        );
      }

      for (let i = 0; i < posVecs.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < posVecs.length; j++) {
          if (posVecs[i].distanceTo(posVecs[j]) < threshold) {
            indices.push(i, j);
            connections++;
            if (connections > 15) break; // High connection limit for dense look
          }
        }
      }
      geometry.setIndex(indices);

      setData({
        geometry,
        originalPositions: posArray.slice(),
      });
    });
  }, [svgUrl, scale]);

  useFrame(() => {
    if (!data) return;

    const { geometry, originalPositions } = data;
    const positions = geometry.attributes.position;
    const posArray = positions.array as Float32Array;

    // Calculate mouse position in world space at z=position.z
    mouseVec.set(mouse.x, mouse.y, 0.5);
    mouseVec.unproject(camera);
    mouseVec.sub(camera.position).normalize();
    const distance = (position[2] - camera.position.z) / mouseVec.z;
    const worldMouseX = camera.position.x + mouseVec.x * distance;
    const worldMouseY = camera.position.y + mouseVec.y * distance;

    const forceRadius = 0.2;
    const forceStrength = 5.0;

    for (let i = 0, len = positions.count * 3; i < len; i += 3) {
      // Current world position of the particle
      const vx = posArray[i] + position[0];
      const vy = posArray[i + 1] + position[1];

      const dx = worldMouseX - vx;
      const dy = worldMouseY - vy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let offsetX = 0;
      let offsetY = 0;

      // Check dist > 0.001 to prevent division by zero which causes particles to shoot to infinity
      if (dist < forceRadius && dist > 0.001) {
        const ratio = 1 - dist / forceRadius;
        // Extremely strong push for a tiny radius
        const power = Math.pow(ratio, 2) * forceStrength;
        offsetX = -(dx / dist) * power;
        offsetY = -(dy / dist) * power;
      }

      // Lerp back to original position + mouse offset
      const currentX = posArray[i];
      const currentY = posArray[i + 1];

      const targetLocalX = originalPositions[i];
      const targetLocalY = originalPositions[i + 1];

      // Even slower lerp (0.02) for a very slow and elegant return
      posArray[i] += (targetLocalX + offsetX - currentX) * 0.02;
      posArray[i + 1] += (targetLocalY + offsetY - currentY) * 0.02;
    }
    positions.needsUpdate = true;
  });

  if (!data) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. The Plexus Lines */}
      <lineSegments geometry={data.geometry}>
        <lineBasicMaterial
          color={isDarkMode ? "#a0b5ff" : "#222222"}
          transparent={true}
          opacity={isDarkMode ? 0.15 : 0.08}
          blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </lineSegments>

      {/* 2. The Glowing Particles */}
      <points geometry={data.geometry}>
        <pointsMaterial
          color={isDarkMode ? "#ffb6c1" : "#000000"}
          size={0.015}
          transparent={true}
          opacity={isDarkMode ? 0.3 : 0.15}
          blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
