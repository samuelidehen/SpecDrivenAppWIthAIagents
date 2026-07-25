import { auth } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { getCurrentIdentity } from "@/lib/project-access";
import { verifyTaskRunOwnership } from "@/lib/task-runs";

const tokenRequestSchema = z.object({
  runId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = tokenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("runId is required");
  }
  const { runId } = parsed.data;

  const taskRun = await verifyTaskRunOwnership(runId, identity.userId);
  if (!taskRun) return forbidden();

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1hr",
  });

  return NextResponse.json({ token });
}
