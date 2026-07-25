// Client-safe fetch wrapper for starting a spec-generation run from the
// browser (see hooks/use-spec-agent.ts). Only calls existing,
// already-authenticated route handlers (app/api/ai/spec,
// app/api/ai/spec/token) — no server-only imports, safe to use from a
// "use client" component. Mirrors lib/design-agent-client.ts's shape.

import type { AiChatMessage } from "@/types/tasks";

export interface StartSpecRunResult {
  runId: string;
  publicToken: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Two round trips, same split as startDesignRun: /api/ai/spec triggers the
// run (roomId doubles as the project id, per the app-wide convention), then
// /api/ai/spec/token mints a read-scoped public token for that specific run.
// The canvas graph itself is not sent — generate-spec.ts reads it directly
// from Liveblocks Storage, since the sidebar has no reach into React Flow's
// state. Chat history *is* sent, since the sidebar already has it in hand.
export async function startSpecRun(
  projectId: string,
  chatHistory: AiChatMessage[]
): Promise<StartSpecRunResult> {
  const { runId } = await postJson<{ runId: string }>("/api/ai/spec", {
    roomId: projectId,
    chatHistory,
  });

  const { token } = await postJson<{ token: string }>("/api/ai/spec/token", { runId });

  return { runId, publicToken: token };
}
