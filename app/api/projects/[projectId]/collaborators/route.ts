import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { addCollaborator, getCollaborators } from "@/lib/collaborators";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  const collaborators = await getCollaborators(projectId);
  return NextResponse.json({ collaborators });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (project.ownerId !== identity.userId) return forbidden();

  const body = await request.json().catch(() => ({}));
  const rawEmail =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as { email?: unknown }).email
      : undefined;

  if (typeof rawEmail !== "string" || !EMAIL_PATTERN.test(rawEmail.trim())) {
    return badRequest("A valid email is required");
  }

  const email = rawEmail.trim().toLowerCase();

  try {
    await addCollaborator(projectId, email);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return badRequest("This person is already a collaborator");
    }
    throw error;
  }

  const collaborators = await getCollaborators(projectId);
  return NextResponse.json({ collaborators }, { status: 201 });
}
