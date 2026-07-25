import { tasks } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";

import type { designAgentTask } from "@/src/trigger/design-agent";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { createTaskRun } from "@/lib/task-runs";

interface DesignRequestBody {
  prompt: string;
  roomId: string;
  projectId: string;
}

function parseDesignRequest(body: unknown): DesignRequestBody | null {
  if (typeof body !== "object" || body === null) return null;

  const { prompt, roomId, projectId } = body as Record<string, unknown>;
  if (typeof prompt !== "string" || !prompt.trim()) return null;
  if (typeof roomId !== "string" || !roomId.trim()) return null;
  if (typeof projectId !== "string" || !projectId.trim()) return null;

  return { prompt, roomId, projectId };
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await request.json().catch(() => null);
  const payload = parseDesignRequest(body);
  if (!payload) {
    return badRequest("prompt, roomId, and projectId are required");
  }

  const project = await prisma.project.findUnique({
    where: { id: payload.projectId },
  });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt: payload.prompt,
    roomId: payload.roomId,
  });

  await createTaskRun(handle.id, payload.projectId, identity.userId);

  return NextResponse.json({ runId: handle.id });
}
