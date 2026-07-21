import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import type { Project } from "@/types/project";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [ownedRows, sharedRows] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ]);

  const ownedProjects: Project[] = ownedRows.map((row) => ({
    id: row.id,
    name: row.name,
    role: "owner",
  }));
  const sharedProjects: Project[] = sharedRows.map((row) => ({
    id: row.id,
    name: row.name,
    role: "collaborator",
  }));

  return (
    <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      {children}
    </EditorShell>
  );
}
