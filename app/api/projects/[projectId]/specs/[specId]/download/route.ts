import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { specFilename } from "@/lib/project-specs";

interface RouteParams {
  params: Promise<{ projectId: string; specId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId, specId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  const spec = await prisma.projectSpec.findUnique({ where: { id: specId } });
  if (!spec || spec.projectId !== projectId) return notFound();

  const blob = await get(spec.filePath, { access: "private", useCache: false });
  if (!blob) return notFound();

  const filename = specFilename(spec.filePath);

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
