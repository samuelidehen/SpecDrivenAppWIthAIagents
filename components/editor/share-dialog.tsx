"use client";

import { Check, Copy, X } from "lucide-react";

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
import type { UseCollaboratorsReturn } from "@/hooks/use-collaborators";

interface ShareDialogProps extends UseCollaboratorsReturn {
  projectId: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({
  projectId,
  isOwner,
  isOpen,
  onClose,
  collaborators,
  isLoading,
  email,
  setEmail,
  isInviting,
  removingId,
  error,
  isCopied,
  inviteCollaborator,
  removeCollaborator,
  copyLink,
}: ShareDialogProps) {
  const projectLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}`
      : "";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite collaborators by email and manage who has access."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={projectLink}
            aria-label="Project link"
            className="text-copy-muted"
            onFocus={(event) => event.target.select()}
          />
          <Button type="button" variant="outline" size="sm" onClick={copyLink}>
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {isOwner && (
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              inviteCollaborator();
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Invite by email"
              aria-label="Collaborator email"
            />
            <Button type="submit" size="sm" disabled={!email.trim() || isInviting}>
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </form>
        )}

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-copy-muted">
              Loading…
            </p>
          ) : collaborators.length === 0 ? (
            <p className="py-4 text-center text-sm text-copy-muted">
              No collaborators yet.
            </p>
          ) : (
            collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-subtle"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {collaborator.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collaborator.imageUrl}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-dim text-xs font-medium text-brand">
                      {(collaborator.name ?? collaborator.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-copy-primary">
                      {collaborator.name ?? collaborator.email}
                    </p>
                    {collaborator.name && (
                      <p className="truncate text-xs text-copy-muted">
                        {collaborator.email}
                      </p>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeCollaborator(collaborator.id)}
                    disabled={removingId === collaborator.id}
                    aria-label={`Remove ${collaborator.email}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
