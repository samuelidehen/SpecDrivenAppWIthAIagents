import { LiveMap, LiveObject } from "@liveblocks/node";
import type { LiveblocksEdge, LiveblocksFlow, LiveblocksNode } from "@liveblocks/react-flow";
import { z } from "zod";

import { liveblocks } from "@/lib/liveblocks";
import { SHAPE_DEFINITIONS } from "@/lib/shapes";
import {
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";

const NODE_SHAPES = SHAPE_DEFINITIONS.map((definition) => definition.shape) as [
  NodeShape,
  ...NodeShape[],
];
const NODE_COLOR_LABELS = NODE_COLORS.map((pair) => pair.label) as [string, ...string[]];

export const NEUTRAL_SHAPE: NodeShape = NODE_SHAPES[0];
export const NEUTRAL_COLOR_LABEL = NODE_COLORS[0].label;

// Flat object, not a discriminated union, and every field is required (not
// .optional()) even though not every field applies to every action type —
// both are workarounds for real, empirically-confirmed limits of Gemini's
// structured-output support:
// 1. A zod discriminated union schema was silently ignored entirely (the
//    model free-wrote its own unrelated JSON shape) — Gemini's schema
//    subset doesn't reliably honor `oneOf`/discriminators.
// 2. Marking per-action fields `.optional()` made the model omit them even
//    when the prompt said they were required for that action type — but the
//    one field that was always required (`id`) was 100% reliably present
//    across every test. Making every field required (with a documented
//    neutral fallback value for actions it doesn't apply to) leans on that
//    same schema-level enforcement instead of prompt wording alone.
export const canvasActionSchema = z.object({
  type: z.enum([
    "add_node",
    "move_node",
    "resize_node",
    "update_node",
    "delete_node",
    "add_edge",
    "delete_edge",
  ]),
  id: z
    .string()
    .describe(
      "The node or edge id this action targets. For add_node/add_edge, a new short kebab-case id you choose."
    ),
  shape: z.enum(NODE_SHAPES).describe(`Required for add_node. Use "${NEUTRAL_SHAPE}" for every other action type.`),
  label: z.string().describe('Required for add_node. Optional meaning for update_node/add_edge. Use "" otherwise.'),
  color: z
    .enum(NODE_COLOR_LABELS)
    .describe(`Required for add_node. Optional meaning for update_node. Use "${NEUTRAL_COLOR_LABEL}" otherwise.`),
  x: z.number().describe("Required for add_node and move_node. Use 0 otherwise."),
  y: z.number().describe("Required for add_node and move_node. Use 0 otherwise."),
  width: z.number().describe("Required for resize_node. Use 0 otherwise."),
  height: z.number().describe("Required for resize_node. Use 0 otherwise."),
  source: z.string().describe('Required for add_edge — the source node id. Use "" otherwise.'),
  target: z.string().describe('Required for add_edge — the target node id. Use "" otherwise.'),
});

export const canvasActionPlanSchema = z.object({
  actions: z.array(canvasActionSchema),
});

export type CanvasAction = z.infer<typeof canvasActionSchema>;
export type CanvasActionPlan = z.infer<typeof canvasActionPlanSchema>;

export interface CanvasSnapshotNode {
  id: string;
  shape: string;
  label: string;
  x: number;
  y: number;
}

export interface CanvasSnapshotEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface CanvasSnapshot {
  nodes: CanvasSnapshotNode[];
  edges: CanvasSnapshotEdge[];
}

// @liveblocks/react-flow stores nodes/edges as LiveObjects, keyed by id, inside
// a "flow" LiveObject at the Storage root (see its useLiveblocksFlow source).
// The base React Flow fields (position, width, height, id, type) are plain
// values; "data" is deep-synced, so it's its own nested LiveObject — this
// mirrors that shape exactly so AI-created nodes are indistinguishable from
// ones created through the existing drag-and-drop/connect flow.
function toLiveNode(node: CanvasNode): LiveblocksNode<CanvasNode> {
  return new LiveObject({
    id: node.id,
    type: node.type,
    position: node.position,
    width: node.width,
    height: node.height,
    data: new LiveObject({
      label: node.data.label,
      color: node.data.color,
      textColor: node.data.textColor,
      shape: node.data.shape,
    }),
  }) as unknown as LiveblocksNode<CanvasNode>;
}

function toLiveEdge(edge: CanvasEdge): LiveblocksEdge<CanvasEdge> {
  return new LiveObject({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    data: new LiveObject({ label: edge.data?.label ?? "" }),
  }) as unknown as LiveblocksEdge<CanvasEdge>;
}

function colorPairForLabel(label: string) {
  return NODE_COLORS.find((pair) => pair.label === label) ?? NODE_COLORS[0];
}

function defaultSizeForShape(shape: NodeShape) {
  return (
    SHAPE_DEFINITIONS.find((definition) => definition.shape === shape) ?? SHAPE_DEFINITIONS[0]
  );
}

/**
 * Reads the room's current nodes/edges directly from Liveblocks Storage (not
 * the autosaved Vercel Blob snapshot, which can lag), for use as generation
 * context. Returns an empty canvas if the room has no Storage yet.
 */
export async function getCanvasSnapshot(roomId: string): Promise<CanvasSnapshot> {
  const empty: CanvasSnapshot = { nodes: [], edges: [] };

  const document = await liveblocks.getStorageDocument(roomId).catch(() => null);
  if (!document) return empty;

  const flow = document.data.flow;
  if (!isPlainLsonObject(flow)) return empty;

  const nodesField = flow.data.nodes;
  const edgesField = flow.data.edges;

  const nodes: CanvasSnapshotNode[] = [];
  if (isPlainLsonMap(nodesField)) {
    for (const value of Object.values(nodesField.data)) {
      const node = parsePlainNode(value);
      if (node) nodes.push(node);
    }
  }

  const edges: CanvasSnapshotEdge[] = [];
  if (isPlainLsonMap(edgesField)) {
    for (const value of Object.values(edgesField.data)) {
      const edge = parsePlainEdge(value);
      if (edge) edges.push(edge);
    }
  }

  return { nodes, edges };
}

interface PlainLsonObjectLike {
  liveblocksType: "LiveObject";
  data: Record<string, unknown>;
}

interface PlainLsonMapLike {
  liveblocksType: "LiveMap";
  data: Record<string, unknown>;
}

function isPlainLsonObject(value: unknown): value is PlainLsonObjectLike {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { liveblocksType?: unknown }).liveblocksType === "LiveObject"
  );
}

function isPlainLsonMap(value: unknown): value is PlainLsonMapLike {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { liveblocksType?: unknown }).liveblocksType === "LiveMap"
  );
}

function parsePlainNode(value: unknown): CanvasSnapshotNode | null {
  if (!isPlainLsonObject(value)) return null;
  const fields = value.data;

  const id = fields.id;
  const position = fields.position as { x?: unknown; y?: unknown } | undefined;
  const dataField = fields.data;
  const nodeData = isPlainLsonObject(dataField) ? dataField.data : undefined;

  if (typeof id !== "string" || typeof position?.x !== "number" || typeof position?.y !== "number") {
    return null;
  }

  return {
    id,
    shape: typeof nodeData?.shape === "string" ? nodeData.shape : "rectangle",
    label: typeof nodeData?.label === "string" ? nodeData.label : "",
    x: position.x,
    y: position.y,
  };
}

function parsePlainEdge(value: unknown): CanvasSnapshotEdge | null {
  if (!isPlainLsonObject(value)) return null;
  const fields = value.data;

  const id = fields.id;
  const source = fields.source;
  const target = fields.target;
  const dataField = fields.data;
  const edgeData = isPlainLsonObject(dataField) ? dataField.data : undefined;

  if (typeof id !== "string" || typeof source !== "string" || typeof target !== "string") {
    return null;
  }

  return {
    id,
    source,
    target,
    label: typeof edgeData?.label === "string" ? edgeData.label : "",
  };
}

/**
 * Applies a plan of canvas actions to a room's Storage in a single atomic
 * mutation. Unknown node/edge id references are skipped rather than thrown,
 * so one bad reference from the model doesn't fail the whole generation.
 */
export async function applyCanvasActions(roomId: string, actions: CanvasAction[]): Promise<void> {
  await liveblocks.mutateStorage(roomId, ({ root }) => {
    let flow: LiveblocksFlow<CanvasNode, CanvasEdge> | undefined = root.get("flow");
    if (!flow) {
      flow = new LiveObject({ nodes: new LiveMap(), edges: new LiveMap() }) as unknown as LiveblocksFlow<
        CanvasNode,
        CanvasEdge
      >;
      root.set("flow", flow);
    }

    const nodes = flow.get("nodes");
    const edges = flow.get("edges");

    for (const action of actions) {
      switch (action.type) {
        case "add_node": {
          if (nodes.get(action.id)) break;

          const colorPair = colorPairForLabel(action.color);
          const size = defaultSizeForShape(action.shape);
          const node: CanvasNode = {
            id: action.id,
            type: "canvasNode",
            position: { x: action.x, y: action.y },
            width: size.width,
            height: size.height,
            data: {
              label: action.label,
              color: colorPair.background,
              textColor: colorPair.text,
              shape: action.shape,
            },
          };
          nodes.set(action.id, toLiveNode(node));
          break;
        }
        case "move_node": {
          const node = nodes.get(action.id);
          if (!node) break;
          node.set("position", { x: action.x, y: action.y });
          break;
        }
        case "resize_node": {
          const node = nodes.get(action.id);
          if (!node) break;
          node.set("width", action.width);
          node.set("height", action.height);
          break;
        }
        case "update_node": {
          const node = nodes.get(action.id);
          if (!node) break;
          const data = node.get("data");
          data.set("label", action.label);
          const colorPair = colorPairForLabel(action.color);
          data.set("color", colorPair.background);
          data.set("textColor", colorPair.text);
          break;
        }
        case "delete_node": {
          nodes.delete(action.id);
          for (const [edgeId, edge] of edges.entries()) {
            if (edge.get("source") === action.id || edge.get("target") === action.id) {
              edges.delete(edgeId);
            }
          }
          break;
        }
        case "add_edge": {
          if (!action.source || !action.target) break;
          if (edges.get(action.id)) break;
          if (!nodes.get(action.source) || !nodes.get(action.target)) break;

          const edge: CanvasEdge = {
            id: action.id,
            source: action.source,
            target: action.target,
            type: "canvasEdge",
            data: { label: action.label },
          };
          edges.set(action.id, toLiveEdge(edge));
          break;
        }
        case "delete_edge": {
          edges.delete(action.id);
          break;
        }
      }
    }
  });
}
