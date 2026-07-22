"use client";

import { useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { useCollaborators } from "@/hooks/use-collaborators";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
}: WorkspaceShellProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const collaborators = useCollaborators({ projectId, isOwner });

  const openShareDialog = () => {
    setIsShareDialogOpen(true);
    collaborators.loadCollaborators();
  };

  const closeShareDialog = () => {
    setIsShareDialogOpen(false);
    collaborators.resetForm();
  };

  return (
    <div className="flex h-full flex-col">
      <WorkspaceNavbar
        projectName={projectName}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        onOpenShare={openShareDialog}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 items-center justify-center bg-base">
          <p className="text-sm text-copy-muted">Canvas coming soon.</p>
        </div>

        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
        />
      </div>

      <ShareDialog
        projectId={projectId}
        isOwner={isOwner}
        isOpen={isShareDialogOpen}
        onClose={closeShareDialog}
        {...collaborators}
      />
    </div>
  );
}
