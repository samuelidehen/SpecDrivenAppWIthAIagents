"use client";

import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";

import { Canvas } from "@/components/editor/canvas";

interface CanvasRoomProps {
  projectId: string;
  isTemplatesModalOpen: boolean;
  onCloseTemplatesModal: () => void;
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
}: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={projectId} initialPresence={{ cursor: null, thinking: false }}>
        <ErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas
              isTemplatesModalOpen={isTemplatesModalOpen}
              onCloseTemplatesModal={onCloseTemplatesModal}
            />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
