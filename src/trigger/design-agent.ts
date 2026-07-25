import { logger, task, wait } from "@trigger.dev/sdk/v3";

import { applyCanvasActions, getCanvasSnapshot, type CanvasAction } from "@/lib/canvas-storage";
import { clearAiPresence, publishAiStatus, setAiPresence } from "@/lib/ai-activity";
import { liveblocks } from "@/lib/liveblocks";
import { generateDesignPlan } from "@/src/trigger/design-agent-plan";

interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

const MAX_PRESENCE_STEPS = 6;

export const designAgentTask = task({
  id: "design-agent",
  maxDuration: 180,
  run: async (payload: DesignAgentPayload) => {
    const { prompt, roomId } = payload;
    logger.log("Design agent triggered", { payload });

    try {
      // Normally already created when the user opens the canvas (see
      // /api/liveblocks-auth), but a room may not exist yet if this task
      // somehow runs before anyone has connected — same call, same options.
      await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] });

      await setAiPresence(roomId, { cursor: null, thinking: true });
      await publishAiStatus(roomId, "start", "Reading your prompt…");

      const snapshot = await getCanvasSnapshot(roomId);

      await publishAiStatus(roomId, "processing", "Designing the architecture…");
      const plan = await generateDesignPlan(prompt, snapshot);
      logger.log("Design plan generated", { actionCount: plan.actions.length });

      await applyCanvasActions(roomId, plan.actions);

      await walkPresenceThroughPlan(roomId, plan.actions);

      const addedNodes = plan.actions.filter((action) => action.type === "add_node").length;
      const addedEdges = plan.actions.filter((action) => action.type === "add_edge").length;
      await publishAiStatus(
        roomId,
        "complete",
        `Added ${addedNodes} node${addedNodes === 1 ? "" : "s"} and ${addedEdges} connection${addedEdges === 1 ? "" : "s"}.`
      );

      return { actionCount: plan.actions.length };
    } catch (error) {
      logger.error("Design agent failed", { error });
      await publishAiStatus(roomId, "error", "Something went wrong generating the design.");
      throw error;
    } finally {
      await clearAiPresence(roomId);
    }
  },
});

// Briefly moves the AI's cursor to each newly-placed node so collaborators can
// see the design being drawn, capped so a large plan doesn't stretch the task.
async function walkPresenceThroughPlan(roomId: string, actions: CanvasAction[]): Promise<void> {
  const positions = actions
    .filter((action) => action.type === "add_node" || action.type === "move_node")
    .slice(0, MAX_PRESENCE_STEPS);

  for (const action of positions) {
    await setAiPresence(roomId, { cursor: { x: action.x, y: action.y }, thinking: true });
    await wait.for({ seconds: 0.5 });
  }
}
