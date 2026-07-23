"use client";

import { useState } from "react";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";

import { useCanvasNodeActions } from "@/components/editor/canvas-node-context";
import { NodeColorToolbar } from "@/components/editor/node-color-toolbar";
import { ShapeVisual } from "@/components/editor/shape-visual";
import type { CanvasNode } from "@/types/canvas";

const MIN_NODE_WIDTH = 60;
const MIN_NODE_HEIGHT = 40;

const HANDLE_CLASS_NAME =
  "!h-2 !w-2 !border !border-surface-border !bg-white opacity-0 transition-opacity group-hover:opacity-100";

const HANDLE_POSITIONS = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const;

export function CanvasNodeRenderer({ id, data, width, height, selected }: NodeProps<CanvasNode>) {
  const { updateNodeLabel, updateNodeColor } = useCanvasNodeActions();
  const [isEditing, setIsEditing] = useState(false);

  const w = width ?? 160;
  const h = height ?? 80;

  return (
    <div className="group relative" style={{ width: w, height: h }}>
      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          className={HANDLE_CLASS_NAME}
        />
      ))}

      <NodeColorToolbar
        isVisible={!!selected}
        activeColor={data.color}
        onSelect={(color, textColor) => updateNodeColor(id, color, textColor)}
      />

      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color="var(--accent-primary)"
      />

      <ShapeVisual shape={data.shape} color={data.color} width={w} height={h} selected={selected} />

      {isEditing ? (
        <div className="absolute inset-0 flex items-center justify-center px-3 py-2">
          <textarea
            autoFocus
            rows={1}
            className="nodrag nopan w-full resize-none border-none bg-transparent text-center text-sm outline-none placeholder:text-copy-faint"
            style={{ color: data.textColor }}
            value={data.label}
            placeholder="Label"
            onChange={(event) => updateNodeLabel(id, event.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.blur();
              }
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm"
          style={data.label ? { color: data.textColor } : undefined}
          onDoubleClick={() => setIsEditing(true)}
        >
          {data.label || <span className="text-copy-faint">Label</span>}
        </div>
      )}
    </div>
  );
}
