"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react";

const AVATAR_SIZE_CLASS = "h-8 w-8";
const MAX_VISIBLE_COLLABORATORS = 5;

interface CollaboratorInfo {
  name: string;
  avatar: string;
  color: string;
}

function CollaboratorAvatar({ info }: { info: CollaboratorInfo }) {
  const initial = info.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={`relative flex ${AVATAR_SIZE_CLASS} shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-surface`}
      style={{ backgroundColor: info.color }}
      title={info.name}
    >
      {info.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={info.avatar} alt={info.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-medium text-white">{initial}</span>
      )}
    </div>
  );
}

export function PresenceBar() {
  const { user } = useUser();
  const others = useOthers();

  const collaborators = others.filter((other) => other.id !== user?.id);
  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_COLLABORATORS);
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-2xl shadow-black/40 backdrop-blur">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center -space-x-2">
            {visibleCollaborators.map((other) => (
              <CollaboratorAvatar key={other.connectionId} info={other.info} />
            ))}
            {overflowCount > 0 && (
              <div
                className={`flex ${AVATAR_SIZE_CLASS} shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-copy-muted ring-2 ring-surface`}
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="h-5 w-px bg-surface-border" />
        </>
      )}

      <UserButton
        afterSwitchSessionUrl="/sign-in"
        appearance={{ elements: { avatarBox: AVATAR_SIZE_CLASS } }}
      />
    </div>
  );
}
