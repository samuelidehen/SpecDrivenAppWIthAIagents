"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRealtimeRun } from "@trigger.dev/react-hooks";

import { startDesignRun } from "@/lib/design-agent-client";
import type { designAgentTask } from "@/src/trigger/design-agent";

export interface UseDesignAgentOptions {
  projectId: string;
  // Called with a human-readable summary once the run finishes — on success
  // (design applied) or failure (couldn't start, or the run itself failed).
  // The caller posts this into the ai-chat feed as an assistant message; this
  // hook only knows about the run's lifecycle, not about chat.
  onFinished: (content: string) => void;
}

export interface UseDesignAgentReturn {
  // True from the moment a prompt is submitted until the run reaches a
  // terminal state — drives the sidebar's input-disable/spinner (see
  // ai-architect-tab.tsx). Tracks only a run *this* session submitted, not
  // ai-status-feed's room-wide activity (that stays a separate signal).
  isRunning: boolean;
  submit: (prompt: string) => Promise<void>;
}

/**
 * Owns a single design-agent run's lifecycle for the AI sidebar: starts a run
 * via POST /api/ai/design + /api/ai/design/token (lib/design-agent-client.ts),
 * then subscribes to it with useRealtimeRun until it completes or fails. Does
 * not touch canvas state directly — Liveblocks (useLiveblocksFlow) reflects
 * the design-agent task's writes automatically, per
 * context/feature-specs/26-design-agent-frontend.md's scope limits.
 */
export function useDesignAgent({ projectId, onFinished }: UseDesignAgentOptions): UseDesignAgentReturn {
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [publicToken, setPublicToken] = useState<string | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useRealtimeRun<typeof designAgentTask>(runId, {
    accessToken: publicToken,
    enabled: Boolean(runId && publicToken),
    onComplete: (run, err) => {
      setRunId(undefined);
      setPublicToken(undefined);

      if (err || run.status !== "COMPLETED") {
        onFinishedRef.current("Something went wrong generating the design.");
        return;
      }

      const actionCount = run.output?.actionCount ?? 0;
      onFinishedRef.current(
        `Design updated — ${actionCount} change${actionCount === 1 ? "" : "s"} applied.`
      );
    },
  });

  const submit = useCallback(
    async (prompt: string) => {
      setIsStarting(true);
      try {
        const { runId: newRunId, publicToken: newToken } = await startDesignRun(prompt, projectId);
        setRunId(newRunId);
        setPublicToken(newToken);
      } catch {
        onFinishedRef.current("Sorry, I couldn't start that design run. Please try again.");
      } finally {
        setIsStarting(false);
      }
    },
    [projectId]
  );

  return { isRunning: isStarting || Boolean(runId), submit };
}
