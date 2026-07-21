"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function NewProjectButton() {
  const { openCreateDialog } = useProjectDialogsContext();

  return (
    <Button onClick={openCreateDialog}>
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  );
}
