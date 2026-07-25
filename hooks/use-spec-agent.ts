"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRealtimeRun } from "@trigger.dev/react-hooks";

import { startSpecRun } from "@/lib/spec-agent-client";
import type { generateSpecTask } from "@/src/trigger/generate-spec";
import type { AiChatMessage } from "@/types/tasks";

export interface UseSpecAgentOptions {
  projectId: string;
  // Called with a human-readable summary once the run finishes — on success
  // (spec saved) or failure. The caller posts this into the ai-chat feed as
  // an assistant message, same contract as use-design-agent.ts's onFinished.
  onFinished: (content: string) => void;
}

export interface UseSpecAgentReturn {
  // True from submit until the run reaches a terminal state — drives the AI
  // Architect tab's busy state, same role isRunning plays in use-design-agent.
  isRunning: boolean;
  submit: (chatHistory: AiChatMessage[]) => Promise<void>;
}

/**
 * Owns a single spec-generation run's lifecycle for the AI sidebar: starts a
 * run via POST /api/ai/spec + /api/ai/spec/token (lib/spec-agent-client.ts),
 * then subscribes to it with useRealtimeRun until it completes or fails.
 * Mirrors use-design-agent.ts's shape exactly — the two are structurally
 * identical because both wrap the same Trigger.dev run lifecycle, just for a
 * different task. Does not touch the Specs tab's list directly: that tab
 * refetches on its own mount (Radix Tabs unmounts inactive TabsContent by
 * default), so a newly generated spec shows up the next time it's opened.
 */
export function useSpecAgent({ projectId, onFinished }: UseSpecAgentOptions): UseSpecAgentReturn {
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [publicToken, setPublicToken] = useState<string | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useRealtimeRun<typeof generateSpecTask>(runId, {
    accessToken: publicToken,
    enabled: Boolean(runId && publicToken),
    onComplete: (run, err) => {
      setRunId(undefined);
      setPublicToken(undefined);

      if (err || run.status !== "COMPLETED") {
        onFinishedRef.current("Something went wrong generating the spec.");
        return;
      }

      onFinishedRef.current("Spec generated — see the Specs tab to view or download it.");
    },
  });

  const submit = useCallback(
    async (chatHistory: AiChatMessage[]) => {
      setIsStarting(true);
      try {
        const { runId: newRunId, publicToken: newToken } = await startSpecRun(
          projectId,
          chatHistory
        );
        setRunId(newRunId);
        setPublicToken(newToken);
      } catch {
        onFinishedRef.current("Sorry, I couldn't start spec generation. Please try again.");
      } finally {
        setIsStarting(false);
      }
    },
    [projectId]
  );

  return { isRunning: isStarting || Boolean(runId), submit };
}
