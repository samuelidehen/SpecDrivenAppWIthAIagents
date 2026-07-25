import { get, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

interface CanvasPayload {
  nodes: unknown[];
  edges: unknown[];
}

function parseCanvasPayload(body: unknown): CanvasPayload | null {
  if (typeof body !== "object" || body === null) return null;

  const { nodes, edges } = body as { nodes?: unknown; edges?: unknown };
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null;

  return { nodes, edges };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  const body = await request.json().catch(() => null);
  const payload = parseCanvasPayload(body);
  if (!payload) return badRequest("nodes and edges are required arrays");

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(payload), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  if (!project.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  const blob = await get(project.canvasJsonPath, { access: "private", useCache: false });
  if (!blob) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  const canvas = await new Response(blob.stream).json();
  return NextResponse.json(canvas);
}
