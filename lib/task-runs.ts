import { prisma } from "@/lib/prisma";

export function createTaskRun(runId: string, projectId: string, userId: string) {
  return prisma.taskRun.create({ data: { runId, projectId, userId } });
}

export async function verifyTaskRunOwnership(runId: string, userId: string) {
  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });
  if (!taskRun || taskRun.userId !== userId) return null;

  return taskRun;
}
