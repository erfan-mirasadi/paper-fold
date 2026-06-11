"use client";

import { useEffect } from "react";
import type { PopUpGroup } from "../../../stores/usePopUpStore";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useStoryStore } from "../../../stores/useStoryStore";

type HoverSensorVerseConfig = {
  id: number;
  y: number;
  w: number;
  h: number;
  hingeX: number;
  direction: "left" | "right";
};

interface PopUpHoverSensorsProps {
  groups: PopUpGroup[];
  versesConfig: HoverSensorVerseConfig[];
  zBaseOffset: number;
  setHoveredGroupId: (
    id: string | null,
    column?: "left" | "right" | null,
  ) => void;
}

const SENSOR_PADDING_X = 0.012;
const SENSOR_PADDING_Y = 0.01;

const getVerseCenterX = (config: HoverSensorVerseConfig): number =>
  config.direction === "right"
    ? config.hingeX + config.w / 2
    : config.hingeX - config.w / 2;

const getVerseCenterY = (config: HoverSensorVerseConfig): number =>
  config.y - config.h / 2;

export function PopUpHoverSensors({
  groups,
  versesConfig,
  zBaseOffset,
  setHoveredGroupId,
}: PopUpHoverSensorsProps) {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isFoldedMainPaper = useFoldStore(
    (s) => !s.isIntroActive && s.currentOffset < 0.98,
  );
  const activeConfigId = useStoryStore((s) => s.activeConfig.id);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  if (isIntroActive || isFoldedMainPaper) return null;

  return (
    <>
      {groups.map((group) => {
        if (group.id === "g_5_6" && activeConfigId === "alak") return null;

        const versesInGroup = versesConfig.filter((config) =>
          group.verseIds.includes(config.id),
        );
        if (!versesInGroup.length) return null;

        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        versesInGroup.forEach((config) => {
          const centerX = getVerseCenterX(config);
          const centerY = getVerseCenterY(config);
          const halfW = config.w / 2;
          const halfH = config.h / 2;

          minX = Math.min(minX, centerX - halfW);
          maxX = Math.max(maxX, centerX + halfW);
          minY = Math.min(minY, centerY - halfH);
          maxY = Math.max(maxY, centerY + halfH);
        });

        const width = maxX - minX + SENSOR_PADDING_X * 2;
        const height = maxY - minY + SENSOR_PADDING_Y * 2;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const isMiddleGroup = group.id === "g_11_12_13_14";
        const resolveColumn = (x: number) => (x <= centerX ? "left" : "right");

        return (
          <mesh
            key={`hover-sensor-${group.id}`}
            position={[centerX, centerY, zBaseOffset + 0.006]}
            onPointerEnter={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "ns-resize";
              setHoveredGroupId(
                group.id,
                isMiddleGroup ? resolveColumn(event.point.x) : null,
              );
            }}
            onPointerMove={(event) => {
              if (!isMiddleGroup) return;
              setHoveredGroupId(group.id, resolveColumn(event.point.x));
            }}
            onPointerLeave={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "";
              setHoveredGroupId(null);
            }}
          >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        );
      })}
    </>
  );
}
