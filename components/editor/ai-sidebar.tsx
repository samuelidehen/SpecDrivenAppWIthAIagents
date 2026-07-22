"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-32 bottom-4 right-4 z-30 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-black/40 backdrop-blur transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-semibold text-copy-primary">
          AI Assistant
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-copy-muted">
        AI chat coming soon.
      </div>
    </aside>
  );
}
