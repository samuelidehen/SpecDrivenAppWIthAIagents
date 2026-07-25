import { NextRequest, NextResponse } from "next/server";

import { forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { specFilename } from "@/lib/project-specs";

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

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    specs: specs.map((spec) => ({
      id: spec.id,
      filename: specFilename(spec.filePath),
      createdAt: spec.createdAt,
    })),
  });
}
