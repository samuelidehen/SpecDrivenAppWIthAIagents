import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || !(await hasProjectAccess(project, identity))) {
    return <AccessDenied />;
  }

  return (
    <WorkspaceShell
      projectId={project.id}
      projectName={project.name}
      isOwner={project.ownerId === identity.userId}
    />
  );
}
