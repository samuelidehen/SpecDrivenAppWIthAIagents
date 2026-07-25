import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

import {
  canvasActionPlanSchema,
  NEUTRAL_COLOR_LABEL,
  NEUTRAL_SHAPE,
  type CanvasActionPlan,
  type CanvasSnapshot,
} from "@/lib/canvas-storage";
import { NODE_COLORS } from "@/types/canvas";

const SHAPE_GUIDE = [
  "rectangle — default general-purpose node",
  "diamond — decision / gateway",
  "circle — event / endpoint",
  "pill — service / process",
  "cylinder — database / storage",
  "hexagon — external system / boundary",
].join("\n");

const COLOR_GUIDE = NODE_COLORS.map((pair) => pair.label).join(", ");

function describeSnapshot(snapshot: CanvasSnapshot): string {
  if (snapshot.nodes.length === 0) return "The canvas is currently empty.";

  const nodeLines = snapshot.nodes
    .map((node) => `- id: "${node.id}", shape: ${node.shape}, label: "${node.label}", position: (${Math.round(node.x)}, ${Math.round(node.y)})`)
    .join("\n");

  const edgeLines = snapshot.edges.length
    ? snapshot.edges
        .map((edge) => `- id: "${edge.id}", ${edge.source} -> ${edge.target}${edge.label ? ` ("${edge.label}")` : ""}`)
        .join("\n")
    : "(none)";

  return `Existing nodes:\n${nodeLines}\n\nExisting edges:\n${edgeLines}`;
}

const SYSTEM_PROMPT = `You are Ghost AI, a system design assistant. You turn a plain-English description of a software system into a set of actions on a collaborative diagram canvas.

Respond with a plan made only of these action types: add_node, move_node, resize_node, update_node, delete_node, add_edge, delete_edge.

Every action shares one object shape, and every field on it is required — but not every field is meaningful for every action type. For a field that doesn't apply to the action you're writing, use its neutral value:
- shape: neutral value is "${NEUTRAL_SHAPE}"
- color: neutral value is "${NEUTRAL_COLOR_LABEL}"
- label, source, target: neutral value is "" (empty string)
- x, y, width, height: neutral value is 0

Which fields actually matter per action type:
- add_node: id, shape, label, color, x, y.
- move_node: id, x, y.
- resize_node: id, width, height.
- update_node: id, label, color. Always set BOTH label and color to what they should be after the update — if you're only changing one, copy the other's current value from the existing canvas below instead of using its neutral value, or you'll erase it.
- delete_node: id.
- add_edge: id, source, target, and ideally label (e.g. "reads from", "auth check") — label may be left "" if there's nothing meaningful to say.
- delete_edge: id.

Node shapes (use exactly these, matching their meaning):
${SHAPE_GUIDE}

Available node colors (use exactly these labels): ${COLOR_GUIDE}. Every add_node action must set one.

Layout rules:
- Lay nodes out left-to-right or top-to-bottom following the natural flow of the system (e.g. client -> gateway -> services -> database).
- Space nodes at least 220px apart horizontally and 150px apart vertically so they never overlap.
- Give every new node a short, unique, kebab-case id (e.g. "api-gateway") and reuse that id if you also add an edge to or from it in the same plan.
- Only reference existing node ids (from the current canvas below) in move_node, resize_node, update_node, delete_node, or as an edge source/target — never invent an id for a node you did not just add.
- If the user's prompt asks to extend or modify the existing design, prefer add/update/move actions over recreating nodes that already exist.
- If the user's prompt describes a whole new system and the canvas already has unrelated content, add the new nodes without deleting the existing ones unless explicitly asked to replace them.

Connections matter: a design made only of unconnected nodes is incomplete. Unless the user asks for standalone/unconnected nodes, add an add_edge action for every meaningful relationship or data flow between the nodes you add (e.g. frontend -> gateway, gateway -> service, service -> database). A typical request describing a system with N components should produce roughly N-1 or more edges connecting them, not zero.`;

export async function generateDesignPlan(
  userPrompt: string,
  snapshot: CanvasSnapshot
): Promise<CanvasActionPlan> {
  const { object } = await generateObject({
    model: google("gemini-3.5-flash"),
    schema: canvasActionPlanSchema,
    system: SYSTEM_PROMPT,
    prompt: `${describeSnapshot(snapshot)}\n\nUser request: ${userPrompt}`,
    temperature: 0.3,
  });

  return object;
}
