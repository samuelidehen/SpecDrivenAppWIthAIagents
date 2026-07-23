import { SHAPE_DEFINITIONS } from "@/lib/shapes";
import { NODE_COLORS, type CanvasEdge, type CanvasNode, type NodeShape } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function shapeSize(shape: NodeShape) {
  const definition = SHAPE_DEFINITIONS.find((entry) => entry.shape === shape);
  return { width: definition?.width ?? 160, height: definition?.height ?? 80 };
}

function templateNode(
  id: string,
  shape: NodeShape,
  label: string,
  x: number,
  y: number,
  colorIndex = 0
): CanvasNode {
  const { width, height } = shapeSize(shape);
  const pair = NODE_COLORS[colorIndex];

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: { label, shape, color: pair.background, textColor: pair.text },
  };
}

function templateEdge(id: string, source: string, target: string, label = ""): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    data: { label },
  };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "An API gateway routing to independent services, each with its own datastore.",
  nodes: [
    templateNode("ms-gateway", "hexagon", "API Gateway", 420, 0, 1),
    templateNode("ms-auth", "rectangle", "Auth Service", 150, 220, 0),
    templateNode("ms-user", "rectangle", "User Service", 420, 220, 0),
    templateNode("ms-order", "rectangle", "Order Service", 690, 220, 0),
    templateNode("ms-auth-db", "cylinder", "Auth DB", 150, 440, 7),
    templateNode("ms-user-db", "cylinder", "User DB", 420, 440, 7),
    templateNode("ms-queue", "pill", "Message Queue", 690, 460, 2),
  ],
  edges: [
    templateEdge("ms-e1", "ms-gateway", "ms-auth"),
    templateEdge("ms-e2", "ms-gateway", "ms-user"),
    templateEdge("ms-e3", "ms-gateway", "ms-order"),
    templateEdge("ms-e4", "ms-auth", "ms-auth-db"),
    templateEdge("ms-e5", "ms-user", "ms-user-db"),
    templateEdge("ms-e6", "ms-order", "ms-queue"),
  ],
};

const ciCdPipeline: CanvasTemplate = {
  id: "ci-cd-pipeline",
  name: "CI/CD Pipeline",
  description: "A build-test-deploy pipeline with a rollback path when tests fail.",
  nodes: [
    templateNode("cicd-push", "circle", "Git Push", 0, 170, 6),
    templateNode("cicd-build", "rectangle", "Build", 260, 160, 0),
    templateNode("cicd-test", "diamond", "Tests Pass?", 520, 130, 2),
    templateNode("cicd-staging", "rectangle", "Deploy Staging", 840, 40, 1),
    templateNode("cicd-prod", "rectangle", "Deploy Production", 1100, 40, 1),
    templateNode("cicd-rollback", "rectangle", "Rollback", 840, 320, 4),
  ],
  edges: [
    templateEdge("cicd-e1", "cicd-push", "cicd-build"),
    templateEdge("cicd-e2", "cicd-build", "cicd-test"),
    templateEdge("cicd-e3", "cicd-test", "cicd-staging", "Yes"),
    templateEdge("cicd-e4", "cicd-test", "cicd-rollback", "No"),
    templateEdge("cicd-e5", "cicd-staging", "cicd-prod"),
  ],
};

const eventDrivenSystem: CanvasTemplate = {
  id: "event-driven-system",
  name: "Event-Driven System",
  description: "A producer publishing to an event bus fanning out to multiple consumers.",
  nodes: [
    templateNode("eds-producer", "circle", "Event Producer", 0, 200, 6),
    templateNode("eds-bus", "hexagon", "Event Bus", 300, 180, 1),
    templateNode("eds-consumer-a", "rectangle", "Consumer A", 660, 0, 0),
    templateNode("eds-consumer-b", "rectangle", "Consumer B", 660, 190, 0),
    templateNode("eds-consumer-c", "rectangle", "Consumer C", 660, 380, 0),
    templateNode("eds-store", "cylinder", "Data Store", 920, 0, 7),
  ],
  edges: [
    templateEdge("eds-e1", "eds-producer", "eds-bus"),
    templateEdge("eds-e2", "eds-bus", "eds-consumer-a"),
    templateEdge("eds-e3", "eds-bus", "eds-consumer-b"),
    templateEdge("eds-e4", "eds-bus", "eds-consumer-c"),
    templateEdge("eds-e5", "eds-consumer-a", "eds-store"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  ciCdPipeline,
  eventDrivenSystem,
];
