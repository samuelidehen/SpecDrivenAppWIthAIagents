// Client-safe fetch wrapper for starting a design run from the browser (see
// hooks/use-design-agent.ts). Only calls existing, already-authenticated
// route handlers (app/api/ai/design, app/api/ai/design/token) — no
// server-only imports, safe to use from a "use client" component.

export interface StartDesignRunResult {
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

// Two round trips, matching the existing backend split from
// 22-design-agent-api.md: /api/ai/design triggers the run and records
// ownership (needs projectId for the access check), /api/ai/design/token
// mints a read-scoped public token for that specific run (needs runId,
// verified against the same ownership record) for useRealtimeRun to consume.
export async function startDesignRun(
  prompt: string,
  projectId: string
): Promise<StartDesignRunResult> {
  const { runId } = await postJson<{ runId: string }>("/api/ai/design", {
    prompt,
    roomId: projectId,
    projectId,
  });

  const { token } = await postJson<{ token: string }>("/api/ai/design/token", { runId });

  return { runId, publicToken: token };
}
