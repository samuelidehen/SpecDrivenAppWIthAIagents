import { auth } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { getCurrentIdentity } from "@/lib/project-access";
import { verifyTaskRunOwnership } from "@/lib/task-runs";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await request.json().catch(() => null);
  const runId =
    typeof body === "object" && body !== null
      ? (body as { runId?: unknown }).runId
      : undefined;

  if (typeof runId !== "string" || !runId.trim()) {
    return badRequest("runId is required");
  }

  const taskRun = await verifyTaskRunOwnership(runId, identity.userId);
  if (!taskRun) return forbidden();

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
  });

  return NextResponse.json({ token });
}
