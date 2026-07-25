import { tasks } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { generateSpecTask } from "@/src/trigger/generate-spec";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { createTaskRun } from "@/lib/task-runs";
import { aiChatMessageSchema } from "@/types/tasks";

const specRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(aiChatMessageSchema),
});

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = specRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("roomId and chatHistory are required");
  }
  const { roomId, chatHistory } = parsed.data;

  // The project id doubles as the Liveblocks room id (see
  // architecture-decisions in progress-tracker.md) — never trust a
  // client-supplied projectId, always resolve it from roomId + access check.
  const project = await prisma.project.findUnique({ where: { id: roomId } });
  if (!project) return notFound();
  if (!(await hasProjectAccess(project, identity))) return forbidden();

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
  });

  await createTaskRun(handle.id, project.id, identity.userId);

  return NextResponse.json({ runId: handle.id });
}
