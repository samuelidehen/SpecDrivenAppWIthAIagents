"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function DeleteProjectDialog() {
  const { dialog, isLoading, closeDialog, deleteProject } =
    useProjectDialogsContext();

  const isOpen = dialog?.type === "delete";
  const currentName = dialog?.type === "delete" ? dialog.project.name : "";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This will permanently delete &ldquo;{currentName}&rdquo;. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={deleteProject}
            disabled={isLoading}
          >
            {isLoading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
