"use client";

import { createContext, useContext, type ReactNode } from "react";

interface CanvasNodeActions {
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeColor: (id: string, color: string, textColor: string) => void;
}

const CanvasNodeActionsContext = createContext<CanvasNodeActions | null>(null);

export function CanvasNodeActionsProvider({
  actions,
  children,
}: {
  actions: CanvasNodeActions;
  children: ReactNode;
}) {
  return (
    <CanvasNodeActionsContext.Provider value={actions}>
      {children}
    </CanvasNodeActionsContext.Provider>
  );
}

export function useCanvasNodeActions() {
  const context = useContext(CanvasNodeActionsContext);
  if (!context) {
    throw new Error("useCanvasNodeActions must be used within CanvasNodeActionsProvider");
  }
  return context;
}
