"use client";

import { useEffect, useRef, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DEBOUNCE_MS = 1500;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  enabled: boolean;
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
}: UseCanvasAutosaveOptions): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstChange = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    if (isFirstChange.current) {
      isFirstChange.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      setStatus("saving");
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });

        setStatus(response.ok ? "saved" : "error");
      } catch {
        setStatus("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, projectId, enabled]);

  return status;
}
