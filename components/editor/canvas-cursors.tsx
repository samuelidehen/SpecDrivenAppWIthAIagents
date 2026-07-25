"use client";

import { useOthers } from "@liveblocks/react";
import { ViewportPortal } from "@xyflow/react";
import { Loader2 } from "lucide-react";

export function CanvasCursors() {
  const others = useOthers();

  return (
    <ViewportPortal>
      {others.map((other) => {
        const cursor = other.presence.cursor;
        if (!cursor) return null;

        const { name, color } = other.info;
        const isThinking = other.presence.thinking === true;

        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute top-0 left-0 z-30"
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5.5 3.5L18.5 12L11.5 13.5L9 20.5L5.5 3.5Z"
                fill={color}
                stroke="white"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="ml-4 -mt-1 flex w-max items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
              style={{ backgroundColor: color }}
            >
              {isThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {name}
            </div>
          </div>
        );
      })}
    </ViewportPortal>
  );
}
