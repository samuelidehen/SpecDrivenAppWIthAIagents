"use client";

import { useEffect, useRef, useState } from "react";

import { useEventListener } from "@liveblocks/react";

import { aiStatusFeedMessageSchema, type AiStatusFeedMessage } from "@/types/tasks";

const AUTO_HIDE_DELAY_MS = 4000;

export interface AiStatusFeedState {
  status: AiStatusFeedMessage["status"] | null;
  text?: string;
  isGenerating: boolean;
}

/**
 * Subscribes to the shared `ai-status-feed` room event (broadcast by
 * lib/ai-activity.ts's publishAiStatus) and exposes only the latest, validated
 * message — this is the single source of truth for AI activity state so the
 * canvas banner, the AI sidebar, and any future consumer never keep
 * duplicate/parallel copies of it.
 */
export function useAiStatusFeed(): AiStatusFeedState {
  const [latest, setLatest] = useState<AiStatusFeedMessage | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEventListener(({ event }) => {
    if (event.type !== "ai-status-feed") return;

    const parsed = aiStatusFeedMessageSchema.safeParse(event);
    if (!parsed.success) return;

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setLatest(parsed.data);

    if (parsed.data.status === "complete" || parsed.data.status === "error") {
      hideTimeout.current = setTimeout(() => setLatest(null), AUTO_HIDE_DELAY_MS);
    }
  });

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return {
    status: latest?.status ?? null,
    text: latest?.text,
    isGenerating: latest?.status === "start" || latest?.status === "processing",
  };
}
