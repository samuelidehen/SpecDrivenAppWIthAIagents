import { liveblocks } from "@/lib/liveblocks";
import { AI_CHAT_FEED_ID } from "@/types/tasks";

// Server-only helpers for the room-scoped `ai-chat` Liveblocks feed (see
// hooks/use-ai-chat-feed.ts and context/feature-specs/25-sidebar-check.md).
// Kept entirely separate from lib/ai-activity.ts's `ai-status-feed`
// RoomEvent, which is ephemeral AI progress, not persisted chat messages.
//
// This module imports the server-only `liveblocks` (@liveblocks/node) client
// — never import it from client components. Client code that only needs the
// feed id should import AI_CHAT_FEED_ID from @/types/tasks instead.
export { AI_CHAT_FEED_ID };

const FEED_ALREADY_EXISTS_STATUS = 409;

function isFeedAlreadyExistsError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "status" in error &&
    (error as { status: unknown }).status === FEED_ALREADY_EXISTS_STATUS
  );
}

/**
 * Idempotently ensures the room's `ai-chat` feed exists. Safe to call on
 * every room entry (see app/api/liveblocks-auth/route.ts) — swallows the
 * "already exists" conflict so repeated calls just reuse the existing feed.
 *
 * Checks the thrown error's `status` field rather than `instanceof
 * LiveblocksError` — that class doesn't reliably match across Turbopack's
 * module boundaries (confirmed live: identical 409 conflicts were thrown but
 * failed the instanceof check, surfacing as an uncaught 500 on every room
 * entry).
 */
export async function ensureAiChatFeed(roomId: string): Promise<void> {
  try {
    await liveblocks.createFeed({ roomId, feedId: AI_CHAT_FEED_ID });
  } catch (error) {
    if (isFeedAlreadyExistsError(error)) return;
    throw error;
  }
}
