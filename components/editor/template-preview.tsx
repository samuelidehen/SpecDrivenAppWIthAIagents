import { ShapeVisual } from "@/components/editor/shape-visual";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { CanvasNode } from "@/types/canvas";

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 140;
const PADDING = 16;
const EDGE_COLOR = "#f8fafc";

function nodeSize(node: CanvasNode) {
  return { width: node.width ?? 160, height: node.height ?? 80 };
}

function computeBounds(nodes: CanvasNode[]) {
  return nodes.reduce(
    (bounds, node) => {
      const { width, height } = nodeSize(node);
      return {
        minX: Math.min(bounds.minX, node.position.x),
        minY: Math.min(bounds.minY, node.position.y),
        maxX: Math.max(bounds.maxX, node.position.x + width),
        maxY: Math.max(bounds.maxY, node.position.y + height),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

interface TemplatePreviewProps {
  template: CanvasTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const { nodes, edges } = template;
  const bounds = computeBounds(nodes);
  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);

  const scale = Math.min(
    (PREVIEW_WIDTH - PADDING * 2) / contentWidth,
    (PREVIEW_HEIGHT - PADDING * 2) / contentHeight,
    1
  );

  const offsetX = (PREVIEW_WIDTH - contentWidth * scale) / 2 - bounds.minX * scale;
  const offsetY = (PREVIEW_HEIGHT - contentHeight * scale) / 2 - bounds.minY * scale;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const center = (node: CanvasNode) => {
    const { width, height } = nodeSize(node);
    return {
      x: (node.position.x + width / 2) * scale + offsetX,
      y: (node.position.y + height / 2) * scale + offsetY,
    };
  };

  return (
    <div className="relative w-full overflow-hidden bg-base" style={{ height: PREVIEW_HEIGHT }}>
      <svg width="100%" height={PREVIEW_HEIGHT} className="absolute inset-0">
        {edges.map((edge) => {
          const source = nodeById.get(edge.source);
          const target = nodeById.get(edge.target);
          if (!source || !target) return null;

          const a = center(source);
          const b = center(target);

          return (
            <line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={EDGE_COLOR}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const { width, height } = nodeSize(node);
        const left = node.position.x * scale + offsetX;
        const top = node.position.y * scale + offsetY;

        return (
          <div
            key={node.id}
            className="absolute"
            style={{ left, top, width: width * scale, height: height * scale }}
          >
            <ShapeVisual
              shape={node.data.shape}
              color={node.data.color}
              width={width * scale}
              height={height * scale}
            />
          </div>
        );
      })}
    </div>
  );
}
