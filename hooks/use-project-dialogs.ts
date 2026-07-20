"use client";

import { useCallback, useState } from "react";

import { MOCK_PROJECTS } from "@/lib/mock-projects";
import { slugify } from "@/lib/slug";
import type { Project } from "@/types/project";

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

const MOCK_DELAY_MS = 400;

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setName("");
    setIsLoading(false);
  }, []);

  const openCreateDialog = useCallback(() => {
    setName("");
    setDialog({ type: "create" });
  }, []);

  const openRenameDialog = useCallback((project: Project) => {
    setName(project.name);
    setDialog({ type: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: Project) => {
    setDialog({ type: "delete", project });
  }, []);

  const createProject = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: trimmed,
          slug: slugify(trimmed),
          role: "owner",
        },
      ]);
      closeDialog();
    }, MOCK_DELAY_MS);
  }, [name, closeDialog]);

  const renameProject = useCallback(() => {
    if (dialog?.type !== "rename") return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const { project } = dialog;
    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? { ...p, name: trimmed, slug: slugify(trimmed) }
            : p
        )
      );
      closeDialog();
    }, MOCK_DELAY_MS);
  }, [dialog, name, closeDialog]);

  const deleteProject = useCallback(() => {
    if (dialog?.type !== "delete") return;
    const { project } = dialog;

    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      closeDialog();
    }, MOCK_DELAY_MS);
  }, [dialog, closeDialog]);

  return {
    projects,
    dialog,
    name,
    isLoading,
    setName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    createProject,
    renameProject,
    deleteProject,
  };
}

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>;
