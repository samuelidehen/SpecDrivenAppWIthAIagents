import { NextRequest, NextResponse } from "next/server";

import { forbidden, notFound, unauthorized } from "@/lib/api-response";
import { removeCollaborator } from "@/lib/collaborators";
import { getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId, collaboratorId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (project.ownerId !== identity.userId) return forbidden();

  const removed = await removeCollaborator(projectId, collaboratorId);
  if (!removed) return notFound();

  return NextResponse.json({ success: true });
}
