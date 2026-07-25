"use client";

import { useMemo, useState } from "react";

import { useCreateFeedMessage, useFeedMessages, useSelf } from "@liveblocks/react";

import {
  AI_AGENT_DISPLAY_NAME,
  AI_CHAT_FEED_ID,
  aiChatMessageSchema,
  type AiChatMessage,
} from "@/types/tasks";

export interface AiChatFeedEntry {
  id: string;
  message: AiChatMessage;
}

export interface UseAiChatFeedReturn {
  messages: AiChatFeedEntry[];
  isLoading: boolean;
  isSending: boolean;
  sendError: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  sendAssistantMessage: (content: string) => Promise<boolean>;
}

/**
 * Subscribes to the room-scoped `ai-chat` Liveblocks feed (see lib/ai-chat.ts)
 * and exposes only validated messages, oldest first — the sidebar chat area's
 * single source of truth for collaborative chat. Kept separate from
 * hooks/use-ai-status-feed.ts, which reads the unrelated ai-status-feed
 * RoomEvent.
 */
export function useAiChatFeed(): UseAiChatFeedReturn {
  const { messages: rawMessages, isLoading } = useFeedMessages(AI_CHAT_FEED_ID);
  const createFeedMessage = useCreateFeedMessage();
  const self = useSelf();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messages = useMemo(() => {
    if (!rawMessages) return [];

    return rawMessages
      .map((raw): AiChatFeedEntry | null => {
        const parsed = aiChatMessageSchema.safeParse(raw.data);
        return parsed.success ? { id: raw.id, message: parsed.data } : null;
      })
      .filter((entry): entry is AiChatFeedEntry => entry !== null)
      .sort((a, b) => a.message.timestamp - b.message.timestamp);
  }, [rawMessages]);

  const post = async (data: AiChatMessage): Promise<boolean> => {
    setIsSending(true);
    try {
      await createFeedMessage(AI_CHAT_FEED_ID, data);
      setSendError(null);
      return true;
    } catch {
      setSendError("Message failed to send. Try again.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = (content: string): Promise<boolean> => {
    const trimmed = content.trim();
    if (!trimmed) return Promise.resolve(false);

    return post({
      sender: self?.info?.name ?? "Anonymous",
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    });
  };

  // Posts an AI-authored message (design-run completion or error — see
  // hooks/use-design-agent.ts) into the same feed as a `role: "assistant"`
  // entry from Ghost AI, so a run's outcome is visible to everyone in the
  // room, not just the person who submitted the prompt.
  const sendAssistantMessage = (content: string): Promise<boolean> => {
    const trimmed = content.trim();
    if (!trimmed) return Promise.resolve(false);

    return post({
      sender: AI_AGENT_DISPLAY_NAME,
      role: "assistant",
      content: trimmed,
      timestamp: Date.now(),
    });
  };

  return { messages, isLoading, isSending, sendError, sendMessage, sendAssistantMessage };
}
