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
import { Input } from "@/components/ui/input";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function RenameProjectDialog() {
  const { dialog, name, setName, isLoading, closeDialog, renameProject } =
    useProjectDialogsContext();

  const isOpen = dialog?.type === "rename";
  const currentName = dialog?.type === "rename" ? dialog.project.name : "";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent className="rounded-3xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            renameProject();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Rename &ldquo;{currentName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Project name"
              aria-label="Project name"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
