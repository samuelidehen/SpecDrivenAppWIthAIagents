import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-base px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-dim">
        <Lock className="h-5 w-5 text-copy-muted" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-copy-primary">
          Access denied
        </h1>
        <p className="max-w-sm text-sm text-copy-muted">
          You don&apos;t have access to this project, or it doesn&apos;t
          exist.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/editor">Back to projects</Link>
      </Button>
    </div>
  );
}
