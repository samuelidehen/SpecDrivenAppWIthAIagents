"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import { ProjectListItem } from "@/components/editor/project-list-item";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { projects, openCreateDialog, openRenameDialog, openDeleteDialog } =
    useProjectDialogsContext();

  const ownedProjects = projects.filter((project) => project.role === "owner");
  const sharedProjects = projects.filter(
    (project) => project.role === "collaborator"
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/50 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-18 bottom-4 left-4 z-30 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-black/40 backdrop-blur transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          defaultValue="my-projects"
          className="flex flex-1 flex-col overflow-hidden px-4 pt-3"
        >
          <TabsList className="w-full">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="flex-1 overflow-y-auto py-2"
          >
            {ownedProjects.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-copy-muted">
                No projects yet.
              </div>
            ) : (
              <div className="space-y-1">
                {ownedProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onRename={() => openRenameDialog(project)}
                    onDelete={() => openDeleteDialog(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="shared"
            className="flex-1 overflow-y-auto py-2"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-copy-muted">
                No shared projects yet.
              </div>
            ) : (
              <div className="space-y-1">
                {sharedProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onRename={() => openRenameDialog(project)}
                    onDelete={() => openDeleteDialog(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button className="w-full" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
