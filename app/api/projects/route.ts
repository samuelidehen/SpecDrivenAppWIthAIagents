import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { badRequest, unauthorized } from "@/lib/api-response";
import { getOwnedProjects } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";
const SLUG_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const projects = await getOwnedProjects(userId);

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const rawName =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as { name?: unknown }).name
      : undefined;
  const rawId =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as { id?: unknown }).id
      : undefined;

  if (rawName !== undefined && typeof rawName !== "string") {
    return badRequest("name must be a string");
  }
  if (rawId !== undefined && (typeof rawId !== "string" || !SLUG_ID_PATTERN.test(rawId))) {
    return badRequest("id must be a slug-safe string");
  }

  const name = rawName?.trim() || DEFAULT_PROJECT_NAME;

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      ...(rawId ? { id: rawId } : {}),
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
