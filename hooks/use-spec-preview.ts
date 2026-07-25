"use client";

import { useCallback, useState } from "react";

import type { ProjectSpecSummary } from "@/types/project-spec";

export interface UseSpecPreviewReturn {
  spec: ProjectSpecSummary | null;
  content: string;
  isLoading: boolean;
  error: string | null;
  open: (spec: ProjectSpecSummary) => void;
  close: () => void;
}

/**
 * Owns the spec preview modal's open/content state. `open` fetches the
 * spec's Markdown straight from the click handler that opens the modal,
 * not from a useEffect watching the selected spec — an effect whose first
 * statement is setState is flagged by react-hooks/set-state-in-effect, and
 * this is the same event-driven fetch pattern hooks/use-collaborators.ts
 * already established for the same reason. Content lives only here, for as
 * long as the modal is open — `close` discards it rather than caching it.
 */
export function useSpecPreview(projectId: string): UseSpecPreviewReturn {
  const [spec, setSpec] = useState<ProjectSpecSummary | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(
    (nextSpec: ProjectSpecSummary) => {
      setSpec(nextSpec);
      setContent("");
      setError(null);
      setIsLoading(true);

      fetch(`/api/projects/${projectId}/specs/${nextSpec.id}/download`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load spec");
          return response.text();
        })
        .then((text) => setContent(text))
        .catch(() => setError("Couldn't load this spec."))
        .finally(() => setIsLoading(false));
    },
    [projectId]
  );

  const close = useCallback(() => {
    setSpec(null);
    setContent("");
    setError(null);
  }, []);

  return { spec, content, isLoading, error, open, close };
}
