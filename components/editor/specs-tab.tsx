"use client";

import { Download, FileText, Loader2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SpecPreviewDialog } from "@/components/editor/spec-preview-dialog";
import { useProjectSpecs } from "@/hooks/use-project-specs";
import { useSpecPreview } from "@/hooks/use-spec-preview";

interface SpecsTabProps {
  projectId: string;
}

function formatSpecDate(createdAt: string) {
  return new Date(createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function SpecsTab({ projectId }: SpecsTabProps) {
  const { specs, isLoading, error } = useProjectSpecs(projectId);
  const preview = useSpecPreview(projectId);

  return (
    <div className="flex flex-col gap-4 p-4">
      <ScrollArea className="max-h-[360px]">
        <div className="flex flex-col gap-2 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-copy-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading specs…
            </div>
          ) : error ? (
            <p className="py-6 text-center text-xs text-error">{error}</p>
          ) : specs.length === 0 ? (
            <p className="py-6 text-center text-xs text-copy-muted">
              No specs yet — generate one from the AI Architect tab.
            </p>
          ) : (
            specs.map((spec) => (
              <div
                key={spec.id}
                role="button"
                tabIndex={0}
                onClick={() => preview.open(spec)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    preview.open(spec);
                  }
                }}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-border bg-elevated p-4 text-left transition-colors hover:bg-subtle"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-dim text-brand">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-copy-primary">
                    {spec.filename}
                  </h3>
                  <p className="mt-1 text-xs text-copy-muted">{formatSpecDate(spec.createdAt)}</p>
                </div>
                <a
                  href={`/api/projects/${projectId}/specs/${spec.id}/download`}
                  download
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Download ${spec.filename}`}
                  className="shrink-0 rounded-lg p-1.5 text-copy-muted transition-colors hover:bg-surface hover:text-copy-primary"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <SpecPreviewDialog
        projectId={projectId}
        spec={preview.spec}
        content={preview.content}
        isLoading={preview.isLoading}
        error={preview.error}
        onClose={preview.close}
      />
    </div>
  );
}
