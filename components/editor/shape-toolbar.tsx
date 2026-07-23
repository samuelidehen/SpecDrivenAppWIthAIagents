"use client";

import { Button } from "@/components/ui/button";
import { SHAPE_DEFINITIONS, SHAPE_DRAG_MIME_TYPE, type ShapeDragPayload } from "@/lib/shapes";

export function ShapeToolbar() {
  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    definition: (typeof SHAPE_DEFINITIONS)[number]
  ) => {
    const payload: ShapeDragPayload = {
      shape: definition.shape,
      width: definition.width,
      height: definition.height,
    };

    event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-2xl shadow-black/40 backdrop-blur">
      {SHAPE_DEFINITIONS.map((definition) => {
        const Icon = definition.icon;
        return (
          <Button
            key={definition.shape}
            variant="ghost"
            size="icon-sm"
            className="cursor-grab rounded-full active:cursor-grabbing"
            draggable
            onDragStart={(event) => onDragStart(event, definition)}
            aria-label={`Drag to add a ${definition.label.toLowerCase()} node`}
            title={definition.label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
}
