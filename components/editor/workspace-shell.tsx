"use client";

import { useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasRoom } from "@/components/editor/canvas-room";
import { ShareDialog } from "@/components/editor/share-dialog";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { useCollaborators } from "@/hooks/use-collaborators";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

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
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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
        saveStatus={saveStatus}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        onOpenShare={openShareDialog}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 bg-base">
          <CanvasRoom
            projectId={projectId}
            isTemplatesModalOpen={isTemplatesModalOpen}
            onCloseTemplatesModal={() => setIsTemplatesModalOpen(false)}
            onSaveStatusChange={setSaveStatus}
          >
            {/* Rendered inside the same Liveblocks room as the canvas so it can
                read the shared ai-status-feed and presence — see canvas-room.tsx. */}
            <AiSidebar
              projectId={projectId}
              isOpen={isAiSidebarOpen}
              onClose={() => setIsAiSidebarOpen(false)}
            />
          </CanvasRoom>
        </div>
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
