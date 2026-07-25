"use client";

import { Download } from "lucide-react";
import Markdown, { type Components } from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectSpecSummary } from "@/types/project-spec";

// No @tailwindcss/typography plugin is installed, so headings/lists/code
// lose their default browser styling under Tailwind's preflight reset —
// mapped explicitly onto react-markdown's `components` prop using the same
// text/surface tokens the rest of the sidebar already uses, instead of
// pulling in a new plugin for one modal.
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-base font-semibold text-copy-primary first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-sm font-semibold text-copy-primary first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1 text-sm font-medium text-copy-primary first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-copy-secondary">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-copy-secondary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-copy-secondary">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand underline">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-copy-primary">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded bg-elevated px-1 py-0.5 text-xs text-brand">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-elevated p-3 text-xs">{children}</pre>
  ),
};

interface SpecPreviewDialogProps {
  projectId: string;
  spec: ProjectSpecSummary | null;
  content: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

/**
 * Presentational preview modal — all state (open spec, fetched content,
 * loading/error) comes from hooks/use-spec-preview.ts. Content is fetched
 * there through the existing download route rather than reading Vercel
 * Blob directly from the client, per 29-spec-ui-integration.md.
 */
export function SpecPreviewDialog({
  projectId,
  spec,
  content,
  isLoading,
  error,
  onClose,
}: SpecPreviewDialogProps) {
  const downloadHref = spec ? `/api/projects/${projectId}/specs/${spec.id}/download` : undefined;

  return (
    <Dialog
      open={Boolean(spec)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[80vh] flex-col rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{spec?.filename}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="mt-2 max-h-[55vh] flex-1 rounded-xl border border-surface-border bg-subtle">
          <div className="p-4">
            {isLoading ? (
              <p className="text-sm text-copy-muted">Loading…</p>
            ) : error ? (
              <p className="text-sm text-error">{error}</p>
            ) : (
              <Markdown components={markdownComponents}>{content}</Markdown>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" asChild>
            <a href={downloadHref} download>
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
