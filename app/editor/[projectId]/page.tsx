import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  if (project.ownerId !== userId) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isCollaborator =
      !!email &&
      (await prisma.projectCollaborator.count({
        where: { projectId: project.id, email },
      })) > 0;

    if (!isCollaborator) notFound();
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">
        {project.name}
      </h1>
      <p className="max-w-md text-sm text-copy-muted">Canvas coming soon.</p>
    </div>
  );
}
