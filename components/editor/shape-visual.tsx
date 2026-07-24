import { cn } from "@/lib/utils";
import type { NodeShape } from "@/types/canvas";

interface SvgShapeProps {
  color: string;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

function DiamondShape({ color, width, height, stroke, strokeWidth }: SvgShapeProps) {
  const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon points={points} fill={color} strokeWidth={strokeWidth} style={{ stroke }} />
    </svg>
  );
}

function HexagonShape({ color, width, height, stroke, strokeWidth }: SvgShapeProps) {
  const inset = Math.min(width, height) * 0.25;
  const points = `${inset},0 ${width - inset},0 ${width},${height / 2} ${width - inset},${height} ${inset},${height} 0,${height / 2}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon points={points} fill={color} strokeWidth={strokeWidth} style={{ stroke }} />
    </svg>
  );
}

function CylinderShape({ color, width, height, stroke, strokeWidth }: SvgShapeProps) {
  const rx = width / 2;
  const ry = rx / (2.5 + width / 50);
  const bodyHeight = height - ry * 2;
  const path = `M 0,${ry} a ${rx},${ry} 0 0 0 ${width} 0 a ${rx},${ry} 0 0 0 ${-width} 0 l 0,${bodyHeight} a ${rx},${ry} 0 0 0 ${width} 0 l 0,${-bodyHeight}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={path}
        fill={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        style={{ stroke }}
      />
    </svg>
  );
}

const SVG_SHAPES: Partial<Record<NodeShape, (props: SvgShapeProps) => React.JSX.Element>> = {
  diamond: DiamondShape,
  hexagon: HexagonShape,
  cylinder: CylinderShape,
};

const ROUNDED_CLASS_NAME: Partial<Record<NodeShape, string>> = {
  rectangle: "rounded-md",
  circle: "rounded-full",
  pill: "rounded-full",
};

const STROKE_REST = "var(--border-default)";
const STROKE_SELECTED = "var(--accent-primary)";

interface ShapeVisualProps {
  shape: NodeShape;
  color: string;
  width: number;
  height: number;
  selected?: boolean;
}

export function ShapeVisual({ shape, color, width, height, selected }: ShapeVisualProps) {
  const stroke = selected ? STROKE_SELECTED : STROKE_REST;
  const strokeWidth = selected ? 2 : 1.5;

  const SvgShape = SVG_SHAPES[shape];
  if (SvgShape) {
    return <SvgShape color={color} width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} />;
  }

  return (
    <div
      className={cn(
        "h-full w-full",
        selected ? "border-2 border-brand" : "border border-surface-border",
        ROUNDED_CLASS_NAME[shape]
      )}
      style={{ backgroundColor: color }}
    />
  );
}
