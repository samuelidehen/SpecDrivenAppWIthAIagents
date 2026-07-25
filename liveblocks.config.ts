import type { LiveblocksFlow } from "@liveblocks/react-flow";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { AiChatMessage, AiStatus } from "@/types/tasks";

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // "flow" matches @liveblocks/react-flow's default storageKey (see
    // components/editor/canvas.tsx's useLiveblocksFlow call) — reusing its own
    // exported type keeps this in sync instead of hand-duplicating the shape.
    Storage: {
      // Optional: useLiveblocksFlow only creates this key once the first
      // client connects and Storage is otherwise empty (see its
      // setInitialStorage mutation) — it doesn't exist before that.
      flow?: LiveblocksFlow<CanvasNode, CanvasEdge>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    // The shared AI status feed (see types/tasks.ts) — generic enough for
    // design generation, spec generation, or any future background task to
    // publish through, not just the canvas design agent.
    RoomEvent: {
      type: "ai-status-feed";
      status: AiStatus;
      text?: string;
    };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: Record<string, never>;
    // Example, attaching coordinates to a thread
    // ThreadMetadata: { x: number; y: number };

    // Unused — no per-feed metadata is needed for the `ai-chat` feed (see
    // lib/ai-chat.ts).
    FeedMetadata: Record<string, never>;

    // Message payload for the room-scoped `ai-chat` feed, for useFeedMessages,
    // useCreateFeedMessage, etc. This is a persisted Liveblocks Feed — kept
    // fully separate from the ephemeral `ai-status-feed` RoomEvent above (see
    // context/feature-specs/25-sidebar-check.md).
    FeedMessageData: AiChatMessage;

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>;
    // Example, rooms with a title and url
    // RoomInfo: { title: string; url: string };
  }
}

export {};
