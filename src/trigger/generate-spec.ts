import { google } from "@ai-sdk/google";
import { put } from "@vercel/blob";
import { generateText } from "ai";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import { publishAiStatus } from "@/lib/ai-activity";
import { type CanvasSnapshotEdge, type CanvasSnapshotNode, getCanvasSnapshot } from "@/lib/canvas-storage";
import { liveblocks } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { aiChatMessageSchema, type AiChatMessage } from "@/types/tasks";

export const generateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(aiChatMessageSchema),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

const SYSTEM_PROMPT = `You are Ghost AI, a technical writer for a collaborative system design tool. Turn a project's canvas graph and its chat history into a clear, well-organized Markdown technical specification.

Structure the document with headings such as Overview, Architecture, Components, Data Flow, and Considerations — adapt these to what's actually on the canvas rather than forcing every section to appear if there's nothing to say there.

Base the spec strictly on the canvas nodes/connections and chat context provided below — do not invent components that aren't represented in either. Write in clear, concise prose suitable for an engineering audience. Output raw Markdown only, with no surrounding commentary or code fences.`;

function describeGraph(nodes: CanvasSnapshotNode[], edges: CanvasSnapshotEdge[]): string {
  if (nodes.length === 0) return "The canvas is currently empty.";

  const nodeLines = nodes
    .map((node) => `- id: "${node.id}", shape: ${node.shape}, label: "${node.label}"`)
    .join("\n");

  const edgeLines = edges.length
    ? edges
        .map((edge) => `- ${edge.source} -> ${edge.target}${edge.label ? ` ("${edge.label}")` : ""}`)
        .join("\n")
    : "(none)";

  return `Canvas nodes:\n${nodeLines}\n\nCanvas connections:\n${edgeLines}`;
}

function describeChatHistory(chatHistory: AiChatMessage[]): string {
  if (chatHistory.length === 0) return "No chat history for this project.";

  return chatHistory.map((message) => `${message.sender} (${message.role}): ${message.content}`).join("\n");
}

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  maxDuration: 180,
  schema: generateSpecPayloadSchema,
  run: async (payload) => {
    const { projectId, roomId, chatHistory } = payload;
    logger.log("Spec generation triggered", { projectId, roomId });

    try {
      // Normally already created when the user opens the canvas (see
      // /api/liveblocks-auth), but a room may not exist yet if this task
      // somehow runs before anyone has connected — same call, same options
      // as design-agent.ts.
      await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] });

      metadata.set("status", "start");
      await publishAiStatus(roomId, "start", "Reading the canvas…");

      // Read straight from Liveblocks Storage, same as design-agent.ts's
      // getCanvasSnapshot call — the client (AiArchitectTab) has no reach
      // into the canvas's React Flow state (that only exists inside
      // CanvasFlow's ReactFlowProvider, a sibling subtree the sidebar isn't
      // part of), so the current graph is resolved here instead of being
      // passed in the request payload.
      const { nodes, edges } = await getCanvasSnapshot(roomId);

      metadata.set("status", "processing");
      await publishAiStatus(roomId, "processing", "Writing the technical spec…");

      const { text } = await generateText({
        model: google("gemini-3.5-flash"),
        system: SYSTEM_PROMPT,
        prompt: `${describeGraph(nodes, edges)}\n\n${describeChatHistory(chatHistory)}`,
        temperature: 0.3,
      });

      // Metadata (id, projectId) is created first so the blob can be stored at
      // the spec's own id-addressed path (specs/{projectId}/{specId}.md, per
      // architecture-context.md), then the row is updated with the real blob
      // URL — mirrors the canvas route's "Prisma stores only the blob URL
      // reference" pattern, just split across two writes since the path
      // itself depends on the row's id.
      const specRecord = await prisma.projectSpec.create({
        data: { projectId, filePath: "" },
      });
      const blob = await put(`specs/${projectId}/${specRecord.id}.md`, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
      });
      await prisma.projectSpec.update({
        where: { id: specRecord.id },
        data: { filePath: blob.url },
      });

      metadata.set("status", "complete");
      await publishAiStatus(roomId, "complete", "Spec generated.");

      return text;
    } catch (error) {
      logger.error("Spec generation failed", { error });
      metadata.set("status", "error");
      await publishAiStatus(roomId, "error", "Something went wrong generating the spec.");
      throw error;
    }
  },
});
