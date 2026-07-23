"use client";

import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";

import { useReactFlow } from "@xyflow/react";

import { Button } from "@/components/ui/button";

const ZOOM_DURATION = 200;

interface CanvasControlBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function CanvasControlBar({ canUndo, canRedo, onUndo, onRedo }: CanvasControlBarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-6 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        onClick={() => zoomOut({ duration: ZOOM_DURATION })}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        onClick={() => fitView({ duration: ZOOM_DURATION })}
        aria-label="Fit view"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        onClick={() => zoomIn({ duration: ZOOM_DURATION })}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-surface-border" />

      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
