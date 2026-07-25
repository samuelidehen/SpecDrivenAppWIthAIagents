"use client";

import { LayoutTemplate, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SaveStatusIndicator } from "@/components/editor/save-status-indicator";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface WorkspaceNavbarProps {
  projectName: string;
  saveStatus: SaveStatus;
  isAiSidebarOpen: boolean;
  onToggleAiSidebar: () => void;
  onOpenShare: () => void;
  onOpenTemplates: () => void;
}

export function WorkspaceNavbar({
  projectName,
  saveStatus,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onOpenShare,
  onOpenTemplates,
}: WorkspaceNavbarProps) {
  return (
    <nav className="flex h-14 w-full shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <h1 className="truncate text-sm font-semibold text-copy-primary">
        {projectName}
      </h1>

      <div className="flex items-center gap-2">
        <SaveStatusIndicator status={saveStatus} />
        <Button variant="ghost" size="sm" onClick={onOpenTemplates}>
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant={isAiSidebarOpen ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={onToggleAiSidebar}
          aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
