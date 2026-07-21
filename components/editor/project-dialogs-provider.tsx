"use client";

import { createContext, useContext } from "react";

import {
  useProjectActions,
  type UseProjectActionsReturn,
} from "@/hooks/use-project-actions";

const ProjectDialogsContext = createContext<UseProjectActionsReturn | null>(
  null
);

export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useProjectActions();

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): UseProjectActionsReturn {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within a ProjectDialogsProvider"
    );
  }
  return context;
}
