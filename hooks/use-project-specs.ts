"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProjectSpecSummary } from "@/types/project-spec";

export interface UseProjectSpecsReturn {
  specs: ProjectSpecSummary[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads the metadata list for a project's generated specs (id, filename,
 * createdAt) from GET /api/projects/{projectId}/specs — the list endpoint
 * added alongside 28-spec-persistence.md's ProjectSpec model. Spec content
 * itself is fetched separately, on demand, by the preview dialog.
 */
export function useProjectSpecs(projectId: string): UseProjectSpecsReturn {
  const [specs, setSpecs] = useState<ProjectSpecSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/specs`);
        if (!response.ok) throw new Error("Failed to load specs");

        const data = (await response.json()) as { specs: ProjectSpecSummary[] };
        if (!cancelled) setSpecs(data.specs);
      } catch {
        if (!cancelled) setError("Couldn't load specs.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  return { specs, isLoading, error, reload };
}
