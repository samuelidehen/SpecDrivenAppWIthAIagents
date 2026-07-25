import { z } from "zod";

// Shared status values for any background task that reports shared progress
// into a room (design generation today, spec generation later — see
// context/feature-specs/24-ai-prescence-state.md).
export const AI_STATUS_VALUES = ["start", "processing", "complete", "error"] as const;
export type AiStatus = (typeof AI_STATUS_VALUES)[number];

// Payload carried by the `ai-status-feed` Liveblocks room event. Kept generic
// (no canvas-specific fields) so design generation, spec generation, or any
// future background task can publish through the same feed.
export const aiStatusFeedMessageSchema = z.object({
  status: z.enum(AI_STATUS_VALUES),
  text: z.string().optional(),
});

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>;

// Room-scoped Liveblocks feed id for collaborative sidebar chat (see
// lib/ai-chat.ts and hooks/use-ai-chat-feed.ts). Kept in this shared,
// client-safe module — not lib/ai-chat.ts — since that file also holds the
// server-only Liveblocks client and must never be imported from client code.
export const AI_CHAT_FEED_ID = "ai-chat";

// Display name for AI-authored `ai-chat` messages (design-run completions and
// errors — see hooks/use-design-agent.ts) and AI presence (lib/ai-activity.ts,
// server-only). Single source so both sides render the same identity.
export const AI_AGENT_DISPLAY_NAME = "Ghost AI";

// Roles for a message in the `ai-chat` Liveblocks feed (see lib/ai-chat.ts).
export const AI_CHAT_ROLE_VALUES = ["user", "assistant"] as const;
export type AiChatRole = (typeof AI_CHAT_ROLE_VALUES)[number];

// Payload stored as an `ai-chat` feed message's `data` field — collaborative
// sidebar chat between users in a room. This is a persisted Liveblocks Feed,
// unrelated to aiStatusFeedMessageSchema above (an ephemeral RoomEvent for AI
// progress) — see context/feature-specs/25-sidebar-check.md.
export const aiChatMessageSchema = z.object({
  sender: z.string().min(1),
  role: z.enum(AI_CHAT_ROLE_VALUES),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;
