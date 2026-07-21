import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (project.ownerId !== userId) return forbidden();

  const body = await request.json().catch(() => ({}));
  const rawName =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as { name?: unknown }).name
      : undefined;

  if (typeof rawName !== "string" || !rawName.trim()) {
    return badRequest("name is required");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name: rawName.trim() },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (project.ownerId !== userId) return forbidden();

  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ success: true });
}
