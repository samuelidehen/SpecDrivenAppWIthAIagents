"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";

interface EditorShellProps {
  children: React.ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProjectDialogsProvider>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 overflow-hidden">{children}</main>

        <CreateProjectDialog />
        <RenameProjectDialog />
        <DeleteProjectDialog />
      </div>
    </ProjectDialogsProvider>
  );
}
