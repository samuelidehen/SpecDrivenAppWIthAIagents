"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Collaborator } from "@/types/collaborator";

interface UseCollaboratorsOptions {
  projectId: string;
  isOwner: boolean;
}

export function useCollaborators({ projectId, isOwner }: UseCollaboratorsOptions) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!response.ok) throw new Error("Failed to load collaborators");
      const data = (await response.json()) as { collaborators: Collaborator[] };
      setCollaborators(data.collaborators);
    } catch {
      setError("Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const resetForm = useCallback(() => {
    setEmail("");
    setError(null);
  }, []);

  const inviteCollaborator = useCallback(async () => {
    if (!isOwner) return;
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsInviting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await response.json()) as {
        collaborators?: Collaborator[];
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to invite collaborator");
        return;
      }

      setCollaborators(data.collaborators ?? []);
      setEmail("");
    } finally {
      setIsInviting(false);
    }
  }, [email, isOwner, projectId]);

  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      if (!isOwner) return;

      setRemovingId(collaboratorId);
      setError(null);
      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error("Failed to remove collaborator");
        setCollaborators((current) =>
          current.filter((collaborator) => collaborator.id !== collaboratorId)
        );
      } catch {
        setError("Failed to remove collaborator");
      } finally {
        setRemovingId(null);
      }
    },
    [isOwner, projectId]
  );

  const copyLink = useCallback(async () => {
    const link = `${window.location.origin}/editor/${projectId}`;
    await navigator.clipboard.writeText(link);

    setIsCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  }, [projectId]);

  return {
    collaborators,
    isLoading,
    email,
    setEmail,
    isInviting,
    removingId,
    error,
    isCopied,
    loadCollaborators,
    resetForm,
    inviteCollaborator,
    removeCollaborator,
    copyLink,
  };
}

export type UseCollaboratorsReturn = ReturnType<typeof useCollaborators>;
