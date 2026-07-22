"use client";

import { FolderKanban, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectListItemProps {
  project: Project;
  isActive?: boolean;
  onRename: () => void;
  onDelete: () => void;
}

export function ProjectListItem({
  project,
  isActive = false,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-elevated",
        isActive && "bg-accent-dim"
      )}
    >
      <FolderKanban
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-brand" : "text-copy-muted"
        )}
      />
      <span
        className={cn(
          "flex-1 truncate text-sm",
          isActive ? "text-brand" : "text-copy-primary"
        )}
      >
        {project.name}
      </span>
      {project.role === "owner" && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onRename}
            aria-label={`Rename ${project.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
