import { AlertCircle, Check, Cloud, Loader2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

const STATUS_CONFIG: Record<
  SaveStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  idle: { label: "Saved", icon: Cloud, className: "text-copy-muted" },
  saving: { label: "Saving…", icon: Loader2, className: "text-copy-muted" },
  saved: { label: "Saved", icon: Check, className: "text-success" },
  error: { label: "Save failed", icon: AlertCircle, className: "text-error" },
};

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status];

  return (
    <Button variant="ghost" size="sm" disabled className={className}>
      <Icon className={`h-4 w-4 ${status === "saving" ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
}
