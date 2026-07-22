import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface Identity {
  userId: string;
  email: string | null;
}

export async function getCurrentIdentity(): Promise<Identity | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  return { userId, email };
}

export async function hasProjectAccess(
  project: { id: string; ownerId: string },
  identity: Identity
): Promise<boolean> {
  if (project.ownerId === identity.userId) return true;
  if (!identity.email) return false;

  const collaboratorCount = await prisma.projectCollaborator.count({
    where: { projectId: project.id, email: identity.email },
  });

  return collaboratorCount > 0;
}
