import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! });

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

const CURSOR_COLORS = [
  "#00c8d4", // cyan (brand)
  "#6457f9", // indigo (ai)
  "#ff4d4f", // red (error)
  "#34d399", // green (success)
  "#fbbf24", // amber (warning)
  "#f75f8f", // pink
  "#52a8ff", // blue
  "#ff990a", // orange
] as const;

export function cursorColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
