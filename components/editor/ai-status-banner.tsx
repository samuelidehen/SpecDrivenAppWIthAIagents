"use client";

import { Check, Loader2, TriangleAlert } from "lucide-react";

import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";

export function AiStatusBanner() {
  const { status, text } = useAiStatusFeed();

  if (!status || !text) return null;

  const isError = status === "error";

  return (
    <div
      className={`absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-2xl shadow-black/40 backdrop-blur ${
        isError ? "border-error/50 text-error bg-surface/95" : "border-surface-border bg-surface/95 text-copy-primary"
      }`}
    >
      {isError ? (
        <TriangleAlert className="h-4 w-4" />
      ) : status === "complete" ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-brand" />
      )}
      <span>{text}</span>
    </div>
  );
}
