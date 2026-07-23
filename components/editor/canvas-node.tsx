import type { NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";
import type { CanvasNode, NodeShape } from "@/types/canvas";

const STROKE_STYLE = { stroke: "var(--border-default)" } as const;

function ShapeLabel({ label }: { label: string }) {
  if (!label) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-copy-primary">
      {label}
    </div>
  );
}

function DiamondShape({ color, width, height }: { color: string; width: number; height: number }) {
  const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon points={points} fill={color} strokeWidth={1.5} style={STROKE_STYLE} />
    </svg>
  );
}

function HexagonShape({ color, width, height }: { color: string; width: number; height: number }) {
  const inset = Math.min(width, height) * 0.25;
  const points = `${inset},0 ${width - inset},0 ${width},${height / 2} ${width - inset},${height} ${inset},${height} 0,${height / 2}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon points={points} fill={color} strokeWidth={1.5} style={STROKE_STYLE} />
    </svg>
  );
}

function CylinderShape({ color, width, height }: { color: string; width: number; height: number }) {
  const rx = width / 2;
  const ry = rx / (2.5 + width / 50);
  const bodyHeight = height - ry * 2;
  const path = `M 0,${ry} a ${rx},${ry} 0 0 0 ${width} 0 a ${rx},${ry} 0 0 0 ${-width} 0 l 0,${bodyHeight} a ${rx},${ry} 0 0 0 ${width} 0 l 0,${-bodyHeight}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={path} fill={color} strokeWidth={1.5} strokeLinejoin="round" style={STROKE_STYLE} />
    </svg>
  );
}

const SVG_SHAPES: Partial<
  Record<NodeShape, (props: { color: string; width: number; height: number }) => React.JSX.Element>
> = {
  diamond: DiamondShape,
  hexagon: HexagonShape,
  cylinder: CylinderShape,
};

const ROUNDED_CLASS_NAME: Partial<Record<NodeShape, string>> = {
  rectangle: "rounded-md",
  circle: "rounded-full",
  pill: "rounded-full",
};

export function CanvasNodeRenderer({ data, width, height }: NodeProps<CanvasNode>) {
  const w = width ?? 160;
  const h = height ?? 80;

  const SvgShape = SVG_SHAPES[data.shape];
  if (SvgShape) {
    return (
      <div className="relative h-full w-full" style={{ width: w, height: h }}>
        <SvgShape color={data.color} width={w} height={h} />
        <ShapeLabel label={data.label} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center border border-surface-border px-3 text-center text-sm text-copy-primary",
        ROUNDED_CLASS_NAME[data.shape]
      )}
      style={{ width: w, height: h, backgroundColor: data.color }}
    >
      {data.label}
    </div>
  );
}
