"use client";

import { useState } from "react";
import { Bot, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiChatFeed } from "@/hooks/use-ai-chat-feed";
import { useDesignAgent } from "@/hooks/use-design-agent";
import { useSpecAgent } from "@/hooks/use-spec-agent";
import { cn } from "@/lib/utils";
import { NODE_COLORS } from "@/types/canvas";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

// The spec's literal "green accent (#62C073)" for user chat bubbles/submit
// button is the canvas's own Green node color pair (types/canvas.ts) — reused
// as-is rather than adding a new global token, per code-standards' "no
// hardcoded hex values" (this is existing app data, not a new color) and the
// "do not introduce new colors" instruction in 26-design-agent-frontend.md.
const USER_ACCENT = NODE_COLORS.find((color) => color.label === "Green")!;

function formatMessageTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface AiArchitectTabProps {
  projectId: string;
  // Latest text from the shared ai-status-feed (see hooks/use-ai-status-feed.ts)
  // — content only. Whether the status strip is *shown* is driven by this
  // component's own run-tracking state (useDesignAgent), not ai-status-feed's
  // room-wide activity flag, per 26-design-agent-frontend.md step 2 and 4
  // both referring to "the run" this sidebar instance submitted.
  statusText?: string;
}

export function AiArchitectTab({ projectId, statusText }: AiArchitectTabProps) {
  // Room-scoped `ai-chat` Liveblocks feed (see hooks/use-ai-chat-feed.ts) —
  // collaborative chat between everyone in the room, not local-only state.
  const chat = useAiChatFeed();
  const designAgent = useDesignAgent({
    projectId,
    onFinished: (content) => {
      void chat.sendAssistantMessage(content);
    },
  });
  // Generate Spec (see components/editor/specs-tab.tsx, which used to hold
  // an unwired button of the same name) lives here rather than as a
  // standalone trigger in the Specs tab — it needs the same chat-history
  // input the design agent already reads, and its outcome belongs in the
  // same ai-chat conversation as every other AI action in this sidebar.
  const specAgent = useSpecAgent({
    projectId,
    onFinished: (content) => {
      void chat.sendAssistantMessage(content);
    },
  });
  const [input, setInput] = useState("");

  const isBusy = chat.isSending || designAgent.isRunning || specAgent.isRunning;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

    const posted = await chat.sendMessage(trimmed);
    if (!posted) return;

    setInput("");
    await designAgent.submit(trimmed);
  };

  const handleGenerateSpec = async () => {
    if (isBusy) return;
    await specAgent.submit(chat.messages.map((entry) => entry.message));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-3">
        {chat.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-brand">
              <Bot className="h-5 w-5" />
            </div>
            <p className="text-sm text-copy-muted">
              Describe the system you want to build and Ghost AI will help you design it.
            </p>
            <div className="flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-elevated"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4">
            {chat.messages.map(({ id, message }) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={id}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-sm",
                    isUser ? "border-transparent" : "border-surface-border bg-elevated"
                  )}
                  style={isUser ? { backgroundColor: USER_ACCENT.text } : undefined}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span
                      className={cn("text-xs font-medium", !isUser && "text-copy-primary")}
                      style={isUser ? { color: USER_ACCENT.background } : undefined}
                    >
                      {message.sender}
                    </span>
                    <span
                      className={cn("text-[11px]", !isUser && "text-copy-faint")}
                      style={isUser ? { color: USER_ACCENT.background, opacity: 0.7 } : undefined}
                    >
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                  <p
                    className={!isUser ? "text-copy-secondary" : undefined}
                    style={isUser ? { color: USER_ACCENT.background } : undefined}
                  >
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-surface-border px-3 pt-3 pb-10">
        {designAgent.isRunning || specAgent.isRunning ? (
          <div
            className="mb-2 flex items-center gap-2 rounded-full bg-subtle px-3 py-1.5 text-xs"
            style={{ color: USER_ACCENT.text }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
              style={{ backgroundColor: USER_ACCENT.text }}
            />
            <span className="truncate">{statusText ?? "Ghost AI is working…"}</span>
          </div>
        ) : null}
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          disabled={isBusy}
          placeholder="Ask Ghost AI to design something…"
          className="min-h-[72px] max-h-[160px] resize-none border-surface-border bg-subtle text-sm text-copy-primary placeholder:text-copy-faint disabled:opacity-60"
        />
        {chat.sendError ? <p className="mt-1.5 text-xs text-error">{chat.sendError}</p> : null}
        <div className="mt-2 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateSpec}
            disabled={isBusy}
            className="gap-1.5 text-xs text-copy-muted hover:text-copy-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Spec
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isBusy}
            className="hover:opacity-90"
            style={{ backgroundColor: USER_ACCENT.text, color: USER_ACCENT.background }}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
