"use client";

import { useState } from "react";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

import { useCanvasEdgeActions } from "@/components/editor/canvas-edge-context";
import type { CanvasEdge } from "@/types/canvas";

const EDGE_COLOR = "#f8fafc";
const EDGE_OPACITY_REST = 0.5;

export function CanvasEdgeRenderer({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeLabel } = useCanvasEdgeActions();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  const isActive = !!selected || isHovered;
  const label = data?.label ?? "";

  const closeEditing = () => setIsEditing(false);

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
      >
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          interactionWidth={24}
          style={{
            stroke: EDGE_COLOR,
            strokeWidth: 1.5,
            strokeLinecap: "round",
            opacity: isActive ? 1 : EDGE_OPACITY_REST,
            transition: "opacity 150ms ease",
          }}
        />
      </g>

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setIsEditing(true);
          }}
        >
          {isEditing ? (
            <input
              autoFocus
              className="nodrag nopan rounded-full border border-surface-border bg-surface px-2 py-0.5 text-center text-xs text-copy-primary outline-none"
              style={{ width: `${Math.max(label.length, 1) + 1}ch` }}
              value={label}
              onChange={(event) => updateEdgeLabel(id, event.target.value)}
              onBlur={closeEditing}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.currentTarget.blur();
                }
              }}
            />
          ) : label ? (
            <span className="rounded-full border border-surface-border bg-surface px-2 py-0.5 text-xs text-copy-primary shadow">
              {label}
            </span>
          ) : isActive ? (
            <span className="rounded-full border border-dashed border-surface-border px-2 py-0.5 text-xs text-copy-faint">
              Add label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
