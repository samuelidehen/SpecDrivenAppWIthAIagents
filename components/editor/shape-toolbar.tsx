"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { ShapeDragPreview } from "@/components/editor/shape-drag-preview";
import { SHAPE_DEFINITIONS, SHAPE_DRAG_MIME_TYPE, type ShapeDragPayload } from "@/lib/shapes";

const TRANSPARENT_DRAG_IMAGE_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";

export function ShapeToolbar() {
  const [draggingShape, setDraggingShape] = useState<(typeof SHAPE_DEFINITIONS)[number] | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const dragImageRef = useRef<HTMLImageElement | null>(null);

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

    if (!dragImageRef.current) {
      dragImageRef.current = new Image();
      dragImageRef.current.src = TRANSPARENT_DRAG_IMAGE_SRC;
    }
    event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);

    setCursorPosition({ x: event.clientX, y: event.clientY });
    setDraggingShape(definition);
  };

  const onDrag = (event: React.DragEvent<HTMLButtonElement>) => {
    if (event.clientX === 0 && event.clientY === 0) return;
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  const onDragEnd = () => {
    setDraggingShape(null);
  };

  return (
    <>
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
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              aria-label={`Drag to add a ${definition.label.toLowerCase()} node`}
              title={definition.label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
      </div>

      {draggingShape &&
        createPortal(
          <ShapeDragPreview
            shape={draggingShape.shape}
            width={draggingShape.width}
            height={draggingShape.height}
            x={cursorPosition.x}
            y={cursorPosition.y}
          />,
          document.body
        )}
    </>
  );
}
