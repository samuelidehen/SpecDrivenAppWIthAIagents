"use client";

import { createContext, useContext, type ReactNode } from "react";

interface CanvasEdgeActions {
  updateEdgeLabel: (id: string, label: string) => void;
}

const CanvasEdgeActionsContext = createContext<CanvasEdgeActions | null>(null);

export function CanvasEdgeActionsProvider({
  actions,
  children,
}: {
  actions: CanvasEdgeActions;
  children: ReactNode;
}) {
  return (
    <CanvasEdgeActionsContext.Provider value={actions}>
      {children}
    </CanvasEdgeActionsContext.Provider>
  );
}

export function useCanvasEdgeActions() {
  const context = useContext(CanvasEdgeActionsContext);
  if (!context) {
    throw new Error("useCanvasEdgeActions must be used within CanvasEdgeActionsProvider");
  }
  return context;
}
