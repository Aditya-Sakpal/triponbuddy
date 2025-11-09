import { Position } from "@xyflow/react";

// Types for internal node structure
export interface InternalNodeType {
  measured: { width?: number; height?: number };
  internals: { positionAbsolute: { x: number; y: number } };
  x?: number;
  y?: number;
}

// Helper function to get intersection point between nodes
export function getNodeIntersection(intersectionNode: InternalNodeType, targetNode: InternalNodeType) {
  const { width: intersectionNodeWidth = 0, height: intersectionNodeHeight = 0 } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + (targetNode.measured.width || 0) / 2;
  const y1 = targetPosition.y + (targetNode.measured.height || 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// Get edge position based on intersection point
export function getEdgePosition(node: InternalNodeType, intersectionPoint: { x: number; y: number }) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  const nodeWidth = n.measured.width || 0;
  const nodeHeight = n.measured.height || 0;

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + nodeWidth - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + nodeHeight - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// Get edge parameters for floating edges
export function getEdgeParams(source: InternalNodeType, target: InternalNodeType) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
