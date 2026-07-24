"use client";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";

import { useCanRedo, useCanUndo, useMyPresence, useRedo, useUndo } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { CanvasCursors } from "@/components/editor/canvas-cursors";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasEdgeActionsProvider } from "@/components/editor/canvas-edge-context";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasNodeActionsProvider } from "@/components/editor/canvas-node-context";
import { PresenceBar } from "@/components/editor/presence-bar";
import { ShapeToolbar } from "@/components/editor/shape-toolbar";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { SHAPE_DRAG_MIME_TYPE, type ShapeDragPayload } from "@/lib/shapes";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };

const EDGE_COLOR = "#f8fafc";

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
};

interface CanvasFlowProps {
  isTemplatesModalOpen: boolean;
  onCloseTemplatesModal: () => void;
}

function CanvasFlow({ isTemplatesModalOpen, onCloseTemplatesModal }: CanvasFlowProps) {
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;
  const nodeCounter = useRef(0);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ reactFlowInstance, undo, redo });

  const [, updateMyPresence] = useMyPresence();

  const onPaneMouseMove = useCallback(
    (event: ReactMouseEvent) => {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      updateMyPresence({ cursor: position });
    },
    [screenToFlowPosition, updateMyPresence]
  );

  const onPaneMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

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
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          textColor: DEFAULT_NODE_TEXT_COLOR,
          shape: payload.shape,
        },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, label } } }]);
    },
    [nodes, onNodesChange]
  );

  const updateNodeColor = useCallback(
    (id: string, color: string, textColor: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      onNodesChange([
        { type: "replace", id, item: { ...node, data: { ...node.data, color, textColor } } },
      ]);
    },
    [nodes, onNodesChange]
  );

  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      const edge = edges.find((e) => e.id === id);
      if (!edge) return;

      onEdgesChange([
        { type: "replace", id, item: { ...edge, data: { ...edge.data, label } } },
      ]);
    },
    [edges, onEdgesChange]
  );

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      // useLiveblocksFlow's onNodesChange/onEdgesChange treat "remove" changes as a
      // no-op by design — removal goes through the separate onDelete mutation instead.
      onDelete({ nodes, edges });
      onNodesChange(template.nodes.map((node) => ({ type: "add" as const, item: node })));
      onEdgesChange(template.edges.map((edge) => ({ type: "add" as const, item: edge })));

      onCloseTemplatesModal();

      requestAnimationFrame(() => {
        reactFlowInstance.fitView({ duration: 300 });
      });
    },
    [nodes, edges, onDelete, onNodesChange, onEdgesChange, onCloseTemplatesModal, reactFlowInstance]
  );

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <CanvasNodeActionsProvider actions={{ updateNodeLabel, updateNodeColor }}>
        <CanvasEdgeActionsProvider actions={{ updateEdgeLabel }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDelete={onDelete}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={{ stroke: EDGE_COLOR, strokeWidth: 1.5, strokeLinecap: "round" }}
            defaultEdgeOptions={defaultEdgeOptions}
            onPaneMouseMove={onPaneMouseMove}
            onPaneMouseLeave={onPaneMouseLeave}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} />
            <CanvasCursors />
          </ReactFlow>
        </CanvasEdgeActionsProvider>
      </CanvasNodeActionsProvider>

      <PresenceBar />
      <CanvasControlBar canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
      <ShapeToolbar />

      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={onCloseTemplatesModal}
        onImport={importTemplate}
      />
    </div>
  );
}

interface CanvasProps {
  isTemplatesModalOpen: boolean;
  onCloseTemplatesModal: () => void;
}

export function Canvas({ isTemplatesModalOpen, onCloseTemplatesModal }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlow
        isTemplatesModalOpen={isTemplatesModalOpen}
        onCloseTemplatesModal={onCloseTemplatesModal}
      />
    </ReactFlowProvider>
  );
}
