import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";

import type { NodeShape } from "@/types/canvas";

export const SHAPE_DRAG_MIME_TYPE = "application/x-ghost-canvas-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

interface ShapeDefinition extends ShapeDragPayload {
  label: string;
  icon: LucideIcon;
}

export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  { shape: "rectangle", label: "Rectangle", icon: RectangleHorizontal, width: 160, height: 80 },
  { shape: "diamond", label: "Diamond", icon: Diamond, width: 180, height: 140 },
  { shape: "circle", label: "Circle", icon: Circle, width: 100, height: 100 },
  { shape: "pill", label: "Pill", icon: Pill, width: 160, height: 56 },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder, width: 120, height: 100 },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon, width: 160, height: 100 },
];
