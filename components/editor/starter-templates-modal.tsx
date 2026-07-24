"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import { TemplatePreview } from "@/components/editor/template-preview";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starter templates</DialogTitle>
          <DialogDescription>
            Start from a pre-built diagram instead of an empty canvas. Importing replaces
            everything currently on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-2 sm:grid-cols-2">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-elevated"
            >
              <TemplatePreview template={template} />

              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-sm font-semibold text-copy-primary">{template.name}</h3>
                <p className="flex-1 text-xs text-copy-muted">{template.description}</p>
                <Button size="sm" onClick={() => onImport(template)}>
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
