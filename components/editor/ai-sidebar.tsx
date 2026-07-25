"use client";

import { Bot, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { SpecsTab } from "@/components/editor/specs-tab";
import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVE_TAB_CLASS =
  "data-[state=active]:bg-accent-dim data-[state=active]:text-brand text-copy-muted";

export function AiSidebar({ projectId, isOpen, onClose }: AiSidebarProps) {
  // Shared with everyone in the room — the same ai-status-feed event the
  // canvas's AiStatusBanner subscribes to, so "AI is working" is visible
  // whether or not the sidebar happens to be open.
  const aiStatus = useAiStatusFeed();

  return (
    <aside
      className={cn(
        "fixed top-32 bottom-4 right-4 z-30 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-black/40 backdrop-blur transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-dim text-brand">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-copy-primary">AI Workspace</h2>
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden px-3 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="architect" className={cn("flex-1", ACTIVE_TAB_CLASS)}>
            AI Architect
          </TabsTrigger>
          <TabsTrigger value="specs" className={cn("flex-1", ACTIVE_TAB_CLASS)}>
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden">
          <AiArchitectTab projectId={projectId} statusText={aiStatus.text} />
        </TabsContent>

        <TabsContent value="specs" className="flex-1 overflow-y-auto">
          <SpecsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
