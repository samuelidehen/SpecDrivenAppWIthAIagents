import { Check } from "lucide-react";
import { NodeToolbar, Position } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { NODE_COLORS } from "@/types/canvas";

interface NodeColorToolbarProps {
  isVisible: boolean;
  activeColor: string;
  onSelect: (color: string, textColor: string) => void;
}

export function NodeColorToolbar({ isVisible, activeColor, onSelect }: NodeColorToolbarProps) {
  return (
    <NodeToolbar isVisible={isVisible} position={Position.Top} offset={12}>
      <div className="nodrag nopan flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur">
        {NODE_COLORS.map((pair) => {
          const isActive = pair.background === activeColor;

          return (
            <button
              key={pair.background}
              type="button"
              onClick={() => onSelect(pair.background, pair.text)}
              aria-label={`${pair.label} color`}
              aria-pressed={isActive}
              title={pair.label}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border transition-shadow hover:shadow-[0_0_6px_1px_var(--swatch-glow)]",
                isActive ? "border-white/80" : "border-white/10"
              )}
              style={
                {
                  backgroundColor: pair.background,
                  "--swatch-glow": pair.text,
                } as React.CSSProperties
              }
            >
              {isActive && <Check className="h-3.5 w-3.5" style={{ color: pair.text }} />}
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}
