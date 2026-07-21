"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { slugify } from "@/lib/slug";
import type { Project } from "@/types/project";

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

function generateRoomSuffix(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function useProjectActions() {
  const router = useRouter();
  const pathname = usePathname();

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [name, setName] = useState("");
  const [roomSuffix, setRoomSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setName("");
    setIsLoading(false);
  }, []);

  const openCreateDialog = useCallback(() => {
    setName("");
    setRoomSuffix(generateRoomSuffix());
    setDialog({ type: "create" });
  }, []);

  const openRenameDialog = useCallback((project: Project) => {
    setName(project.name);
    setDialog({ type: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: Project) => {
    setDialog({ type: "delete", project });
  }, []);

  const roomId =
    dialog?.type === "create" && name.trim()
      ? `${slugify(name)}-${roomSuffix}`
      : "";

  const createProject = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const id = `${slugify(trimmed)}-${roomSuffix}`;

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: trimmed }),
      });
      if (!response.ok) throw new Error("Failed to create project");
      const { project } = (await response.json()) as { project: { id: string } };

      closeDialog();
      router.push(`/editor/${project.id}`);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [name, roomSuffix, closeDialog, router]);

  const renameProject = useCallback(async () => {
    if (dialog?.type !== "rename") return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const { project } = dialog;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) throw new Error("Failed to rename project");

      closeDialog();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [dialog, name, closeDialog, router]);

  const deleteProject = useCallback(async () => {
    if (dialog?.type !== "delete") return;
    const { project } = dialog;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");

      closeDialog();
      if (pathname === `/editor/${project.id}`) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }, [dialog, closeDialog, pathname, router]);

  return {
    dialog,
    name,
    isLoading,
    roomId,
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

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>;
