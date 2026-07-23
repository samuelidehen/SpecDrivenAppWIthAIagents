import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { cursorColorForUser, liveblocks } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { hasProjectAccess } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const room =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as { room?: unknown }).room
      : undefined;

  if (typeof room !== "string" || !room) return badRequest("room is required");

  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const project = await prisma.project.findUnique({ where: { id: room } });
  if (!project || !(await hasProjectAccess(project, { userId: user.id, email }))) {
    return forbidden();
  }

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.fullName ?? user.username ?? email ?? "Anonymous",
      avatar: user.imageUrl,
      color: cursorColorForUser(user.id),
    },
  });
  session.allow(room, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();
  return new NextResponse(responseBody, { status });
}
