"use client";

import type { ReactNode } from "react";

import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";

import { Canvas } from "@/components/editor/canvas";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface CanvasRoomProps {
  projectId: string;
  isTemplatesModalOpen: boolean;
  onCloseTemplatesModal: () => void;
  onSaveStatusChange: (status: SaveStatus) => void;
  // Rendered inside the same RoomProvider as the canvas (not gated by the
  // canvas's own Suspense/ErrorBoundary) — this is how the AI sidebar gets
  // access to the room's presence/events without a second connection.
  children?: ReactNode;
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <p className="text-sm text-copy-muted">Loading canvas…</p>
    </div>
  );
}

function CanvasError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <p className="text-sm text-error">
        Couldn&apos;t connect to the canvas. Try refreshing the page.
      </p>
    </div>
  );
}

export function CanvasRoom({
  projectId,
  isTemplatesModalOpen,
  onCloseTemplatesModal,
  onSaveStatusChange,
  children,
}: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={projectId}
        initialPresence={{ cursor: null, thinking: false }}
        initialStorage={{}}
      >
        <ErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas
              projectId={projectId}
              isTemplatesModalOpen={isTemplatesModalOpen}
              onCloseTemplatesModal={onCloseTemplatesModal}
              onSaveStatusChange={onSaveStatusChange}
            />
          </ClientSideSuspense>
        </ErrorBoundary>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
