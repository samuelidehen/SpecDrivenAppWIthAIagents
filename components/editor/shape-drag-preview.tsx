import { ShapeVisual } from "@/components/editor/shape-visual";
import { DEFAULT_NODE_COLOR, type NodeShape } from "@/types/canvas";

interface ShapeDragPreviewProps {
  shape: NodeShape;
  width: number;
  height: number;
  x: number;
  y: number;
}

export function ShapeDragPreview({ shape, width, height, x, y }: ShapeDragPreviewProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 opacity-70"
      style={{ left: x, top: y, width, height, transform: "translate(-50%, -50%)" }}
    >
      <ShapeVisual shape={shape} color={DEFAULT_NODE_COLOR} width={width} height={height} />
    </div>
  );
}
