import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/types/collaborator";

export async function getCollaborators(
  projectId: string
): Promise<Collaborator[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length === 0) return [];

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    emailAddress: rows.map((row) => row.email),
    limit: rows.length,
  });

  const userByEmail = new Map(
    users.flatMap((user) =>
      user.emailAddresses.map((entry) => [entry.emailAddress, user] as const)
    )
  );

  return rows.map((row) => {
    const user = userByEmail.get(row.email);
    const name = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null;

    return {
      id: row.id,
      email: row.email,
      name,
      imageUrl: user?.imageUrl ?? null,
    };
  });
}

export function addCollaborator(projectId: string, email: string) {
  return prisma.projectCollaborator.create({
    data: { projectId, email },
  });
}

export async function removeCollaborator(
  projectId: string,
  collaboratorId: string
): Promise<boolean> {
  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });

  return count > 0;
}
