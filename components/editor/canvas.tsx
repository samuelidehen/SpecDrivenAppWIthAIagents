"use client";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import { useCallback, useRef } from "react";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapeToolbar } from "@/components/editor/shape-toolbar";
import { SHAPE_DRAG_MIME_TYPE, type ShapeDragPayload } from "@/lib/shapes";
import { DEFAULT_NODE_COLOR, type CanvasEdge, type CanvasNode } from "@/types/canvas";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

function CanvasFlow() {
  const { screenToFlowPosition } = useReactFlow();
  const nodeCounter = useRef(0);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE);
      if (!raw) return;

      const payload = JSON.parse(raw) as ShapeDragPayload;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      nodeCounter.current += 1;
      const id = `${payload.shape}-${Date.now()}-${nodeCounter.current}`;

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        width: payload.width,
        height: payload.height,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape: payload.shape },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </ReactFlow>

      <ShapeToolbar />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}
