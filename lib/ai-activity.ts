import type { JsonObject } from "@liveblocks/node";

import { liveblocks } from "@/lib/liveblocks";
import { AI_AGENT_DISPLAY_NAME, type AiStatus } from "@/types/tasks";

export const AI_AGENT_USER_ID = "ai-agent";
const AI_AGENT_COLOR = "#6457f9"; // --accent-ai, per ui-context.md

export type { AiStatus };

// Publishes to the shared `ai-status-feed` room event (see types/tasks.ts for
// the payload schema) — the one channel any background task (design
// generation today, spec generation later) should use to report progress.
export function publishAiStatus(roomId: string, status: AiStatus, text?: string) {
  return liveblocks.broadcastEvent(roomId, { type: "ai-status-feed", status, text });
}

interface AiPresence extends JsonObject {
  cursor: { x: number; y: number } | null;
  thinking: boolean;
}

/**
 * Sets the AI's ephemeral presence (cursor + thinking state) without a live
 * WebSocket connection — the documented pattern for showing an AI agent's
 * presence in a room. `data` matches the app's own `Presence` shape exactly,
 * so it renders through the same cursor/collaborator UI as a real user.
 */
export function setAiPresence(roomId: string, presence: AiPresence, ttlSeconds = 60) {
  return liveblocks.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: presence,
    userInfo: { name: AI_AGENT_DISPLAY_NAME, avatar: "", color: AI_AGENT_COLOR },
    ttl: ttlSeconds,
  });
}

export function clearAiPresence(roomId: string) {
  // Minimum allowed TTL — the entry expires almost immediately, which is the
  // closest thing to "clearing" ephemeral presence the API offers.
  return setAiPresence(roomId, { cursor: null, thinking: false }, 2);
}
