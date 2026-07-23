import type { Edge, Node } from "@xyflow/react";

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  textColor: string;
  shape: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;

export interface CanvasEdgeData extends Record<string, unknown> {
  label: string;
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;

export interface NodeColorPair {
  label: string;
  background: string;
  text: string;
}

export const NODE_COLORS: NodeColorPair[] = [
  { label: "Neutral", background: "#1F1F1F", text: "#EDEDED" },
  { label: "Blue", background: "#10233D", text: "#52A8FF" },
  { label: "Purple", background: "#2E1938", text: "#BF7AF0" },
  { label: "Orange", background: "#331B00", text: "#FF990A" },
  { label: "Red", background: "#3C1618", text: "#FF6166" },
  { label: "Pink", background: "#3A1726", text: "#F75F8F" },
  { label: "Green", background: "#0F2E18", text: "#62C073" },
  { label: "Teal", background: "#062822", text: "#0AC7B4" },
];

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].background;
export const DEFAULT_NODE_TEXT_COLOR = NODE_COLORS[0].text;
