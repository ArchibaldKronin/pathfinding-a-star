import RBush from "rbush";
import type {
  AABB,
  AStarMeta,
  ConnectionPoint,
  Direction,
  MetaKey,
  PathNode,
  Point,
  Rect,
  RTreeSegment,
  Segment,
  Size,
} from "../types/commonTypes";
import { DIRECTIONS } from "../types/constatnts";
import {
  deduplicatePoints,
  getDirection,
  getPointId,
  getRectCorners,
  getRectsSegments,
  isPointsEqual,
  isSegmentsEqual,
  manhattan,
  rectToAABB,
  roundPoint,
  segmentToAABB,
} from "./utils";

export function isValidConnection(rect: Rect, conn: ConnectionPoint): boolean {
  // проверка валидности точки подсоединения к прямоугольнику
  const { point, angle } = conn;

  const { minX: left, maxX: right, minY: top, maxY: bottom } = rectToAABB(rect);

  const onLeft = point.x === left && point.y >= top && point.y <= bottom;
  const onRight = point.x === right && point.y >= top && point.y <= bottom;
  const onTop = point.y === top && point.x >= left && point.x <= right;
  const onBottom = point.y === bottom && point.x >= left && point.x <= right;

  if (onLeft && angle === 180) return true;
  if (onRight && angle === 0) return true;
  if (onTop && angle === 270) return true;
  if (onBottom && angle === 90) return true;

  return false;
}

export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
  // проверка пересечения прямоугольников
  const a = rect1;
  const b = rect2;

  const {
    minX: aLeft,
    maxX: aRight,
    minY: aTop,
    maxY: aBottom,
  } = rectToAABB(a);
  const {
    minX: bLeft,
    maxX: bRight,
    minY: bTop,
    maxY: bBottom,
  } = rectToAABB(b);

  return !(
    aRight <= bLeft ||
    aLeft >= bRight ||
    aBottom <= bTop ||
    aTop >= bBottom
  );
}

export function getOuterRect(inflated1AABB: AABB, inflated2AABB: AABB): Rect {
  const outerMinX = Math.min(inflated1AABB.minX, inflated2AABB.minX);
  const outerMaxX = Math.max(inflated1AABB.maxX, inflated2AABB.maxX);
  const outerMinY = Math.min(inflated1AABB.minY, inflated2AABB.minY);
  const outerMaxY = Math.max(inflated1AABB.maxY, inflated2AABB.maxY);

  const center: Point = {
    x: outerMinX + (outerMaxX - outerMinX) / 2,
    y: outerMinY + (outerMaxY - outerMinY) / 2,
  };
  const size: Size = {
    width: outerMaxX - outerMinX,
    height: outerMaxY - outerMinY,
  };

  return { position: center, size };
}

function getReachableEdges(
  from: Point,
  dir: Direction,
  inflatedRects: Rect[],
  outer: Rect
): number[] {
  const candidates: number[] = [];
  const allRects = [...inflatedRects, outer];

  for (const rect of allRects) {
    const { minX, maxX, minY, maxY } = rectToAABB(rect);

    switch (dir) {
      case "left":
        if (from.y >= minY && from.y <= maxY && from.x > minX) {
          candidates.push(minX);
        }
        if (from.y >= minY && from.y <= maxY && from.x > maxX) {
          candidates.push(maxX);
        }
        break;

      case "right":
        if (from.y >= minY && from.y <= maxY && from.x < minX) {
          candidates.push(minX);
        }
        if (from.y >= minY && from.y <= maxY && from.x < maxX) {
          candidates.push(maxX);
        }
        break;

      case "top":
        if (from.x >= minX && from.x <= maxX && from.y > minY) {
          candidates.push(minY);
        }
        if (from.x >= minX && from.x <= maxX && from.y > maxY) {
          candidates.push(maxY);
        }
        break;

      case "bottom":
        if (from.x >= minX && from.x <= maxX && from.y < maxY) {
          candidates.push(maxY);
        }
        if (from.x >= minX && from.x <= maxX && from.y < minY) {
          candidates.push(minY);
        }
        break;
    }
  }

  return candidates;
}

export function generateAxisProjections( // точки узлов графа на осях и ребрах
  basePoints: Point[],
  inflatedRects: Rect[],
  outer: Rect
): Point[] {
  const result: Point[] = [];

  for (const from of basePoints) {
    for (const { axis, dir } of DIRECTIONS) {
      const coords = getReachableEdges(from, dir, inflatedRects, outer);
      for (const coord of coords) {
        const coordinates =
          axis === "x"
            ? ({ x: coord, y: from.y } as Point)
            : ({ x: from.x, y: coord } as Point);

        if (coordinates.x !== from.x || coordinates.y !== from.y) {
          result.push({ ...coordinates });
        }
      }
    }
  }
  return deduplicatePoints(result);
}

function generateRaysFromPoint(
  basePoints: Point[],
  outer: Rect
): { verticalRays: Segment[]; horizontalRays: Segment[] } {
  const verticalRays: Segment[] = [];
  const horizontalRays: Segment[] = [];
  const outerAABB = rectToAABB(outer);

  for (const { x, y } of basePoints) {
    verticalRays.push([
      { x, y: outerAABB.minY },
      { x, y: outerAABB.maxY },
    ]);
    horizontalRays.push([
      { x: outerAABB.minX, y },
      { x: outerAABB.maxX, y },
    ]);
  }
  return { verticalRays, horizontalRays };
}

export function createBasePoints(
  entryPoint: Point,
  exitPoint: Point,
  rects: Rect[],
  outerRect: Rect
): Point[] {
  const baseNodes: Point[] = [{ ...entryPoint }, { ...exitPoint }];
  for (const rect of rects) {
    const [{ ...c1 }, { ...c2 }, { ...c3 }, { ...c4 }] = getRectCorners(rect);
    baseNodes.push(c1, c2, c3, c4);
  }
  const [{ ...c1 }, { ...c2 }, { ...c3 }, { ...c4 }] =
    getRectCorners(outerRect);
  baseNodes.push(c1, c2, c3, c4);

  return baseNodes;
}

export function generateRaysCrossPoints(
  basePoints: Point[],
  outer: Rect
): Point[] {
  // точки узлов графа на пересечениях лучей
  const { verticalRays, horizontalRays } = generateRaysFromPoint(
    basePoints,
    outer
  );

  const horizontalTree = new RBush<RTreeSegment>();
  for (const segment of horizontalRays) {
    horizontalTree.insert(makeRTreeSegment(segment));
  }

  const result: Point[] = [];

  for (const ray of verticalRays) {
    const [from, to] = ray;
    const x = from.x;

    const matches = horizontalTree.search({
      minX: x,
      maxX: x,
      minY: Math.min(from.y, to.y),
      maxY: Math.max(from.y, to.y),
    });

    for (const seg of matches) {
      const [a, b] = [seg.data.start, seg.data.end];

      if (a.y === b.y && a.x <= x && b.x >= x) {
        const crossPoint: Point = { x, y: a.y };
        if (!basePoints.some((p) => isPointsEqual(p, crossPoint))) {
          result.push(crossPoint);
        }
      }
    }
  }

  return deduplicatePoints(result);
}

export function generateReachablePoints( // создать точки узлов графа (достижимые точки не только на углах прямоугольников)
  basePoints: Point[],
  inflatedRects: Rect[],
  outer: Rect
): Point[] {
  const axisAlignedPoints = generateAxisProjections(
    basePoints,
    inflatedRects,
    outer
  );
  const raysCrossPoints = generateRaysCrossPoints(basePoints, outer);

  return deduplicatePoints([
    ...basePoints.map((p) => ({ ...p })),
    ...axisAlignedPoints.map((p) => ({ ...p })),
    ...raysCrossPoints.map((p) => ({ ...p })),
  ]);
}

export function buildGraph(points: Point[]): Map<string, PathNode> {
  // построение графа
  const graph = new Map<string, PathNode>();

  for (const point of points) {
    const id = getPointId(point);
    graph.set(id, {
      id,
      point: { x: point.x, y: point.y },
      neighbors: [],
    });
  }

  const pointList = Array.from(graph.values());

  for (const nodeA of pointList) {
    for (const nodeB of pointList) {
      if (nodeA.id === nodeB.id) continue;

      const sameRow = nodeA.point.y === nodeB.point.y;
      const sameCol = nodeA.point.x === nodeB.point.x;

      if (sameRow || sameCol) {
        nodeA.neighbors.push(nodeB.id);
      }
    }
  }

  return graph;
}

export function isSegmentsIntersect(
  seg1Start: Point,
  seg1End: Point,
  seg2Start: Point,
  seg2End: Point
): boolean {
  if (isSegmentsEqual([seg1Start, seg1End], [seg2Start, seg2End])) {
    return true;
  }
  if (
    isPointsEqual(seg1Start, seg2Start) ||
    isPointsEqual(seg1Start, seg2End) ||
    isPointsEqual(seg1End, seg2Start) ||
    isPointsEqual(seg1End, seg2End)
  ) {
    return false;
  }

  const o1 = getOrientation([seg1Start, seg1End], seg2Start);
  const o2 = getOrientation([seg1Start, seg1End], seg2End);
  const o3 = getOrientation([seg2Start, seg2End], seg1Start);
  const o4 = getOrientation([seg2Start, seg2End], seg1End);

  if (o1 !== o2 && o3 !== o4) return true;

  if (o1 === 0 && isPointOnSegment([seg1Start, seg1End], seg2Start)) {
    return true;
  }
  if (o2 === 0 && isPointOnSegment([seg1Start, seg1End], seg2End)) {
    return true;
  }
  if (o3 === 0 && isPointOnSegment([seg2Start, seg2End], seg1Start)) {
    return true;
  }
  if (o4 === 0 && isPointOnSegment([seg2Start, seg2End], seg1End)) {
    return true;
  }
  return false;

  function getOrientation([from, to]: Segment, candidate: Point): number {
    const cross =
      (to.y - from.y) * (candidate.x - to.x) -
      (to.x - from.x) * (candidate.y - to.y);

    if (cross === 0) return 0;
    return cross > 0 ? 1 : 2;
  }

  function isPointOnSegment([start, end]: Segment, middle: Point): boolean {
    return (
      Math.min(start.x, end.x) <= middle.x &&
      middle.x <= Math.max(start.x, end.x) &&
      Math.min(start.y, end.y) <= middle.y &&
      middle.y <= Math.max(start.y, end.y)
    );
  }
}

function isValidSegment( // возможен ли путь к узлу
  [start, end]: Segment,
  tree: RBush<RTreeSegment>
): boolean {
  const queryBox = segmentToAABB([start, end]);
  const candidates = tree.search(queryBox);

  for (const item of candidates) {
    const { start: a, end: b } = item.data;

    if (isSegmentsIntersect(start, end, a, b)) {
      return false;
    }
  }
  return true;
}

function makeRTreeSegment([start, end]: Segment): RTreeSegment {
  const { minX, maxX, minY, maxY } = segmentToAABB([start, end]);
  return {
    minX,
    maxX,
    minY,
    maxY,
    data: { start: { ...start }, end: { ...end } },
  };
}

export function buildRectTree(rects: Rect[]): RBush<RTreeSegment> {
  const tree = new RBush<RTreeSegment>();

  for (const rect of rects) {
    const edges = getRectsSegments(rect);
    tree.load(edges.map(makeRTreeSegment));
  }

  return tree;
}

export function normalizePath(path: Point[]): Point[] {
  return path.map((point) => roundPoint(point));
}

export function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;

  const result: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dir1 = getDirection(prev, curr);
    const dir2 = getDirection(curr, next);

    if (dir1 !== null && dir2 !== null && dir1 !== dir2) {
      result.push(curr);
    }
  }

  result.push(path[path.length - 1]);

  return result;
}

export function aStarSearch(
  originalGraph: Map<string, PathNode>,
  startId: string,
  endId: string,
  originalTree: RBush<RTreeSegment>,
  entryDirection: Direction
): {
  path: Point[] | null;
  meta: Map<MetaKey, AStarMeta>;
  tree: RBush<RTreeSegment>;
} {
  const meta = new Map<MetaKey, AStarMeta>();
  const openSet = new Set<MetaKey>();

  const tree = new RBush<RTreeSegment>();
  tree.load(originalTree.all());

  const graph = new Map<string, PathNode>();
  for (const [id, node] of originalGraph) {
    graph.set(id, {
      id,
      point: { x: node.point.x, y: node.point.y },
      neighbors: [...node.neighbors],
    });
  }
  const startNode = graph.get(startId)!;
  const endNode = graph.get(endId)!;

  const startKey = getMetaKey(startId, entryDirection);

  meta.set(startKey, {
    cost: 0,
    heuristic: manhattan(startNode.point, endNode.point),
    total: manhattan(startNode.point, endNode.point),
    from: null,
    visited: false,
    direction: entryDirection,
    turns: 0,
  });
  openSet.add(startKey);

  while (openSet.size > 0) {
    let currentKey: MetaKey | null = null;
    let currentMeta: AStarMeta | null = null;

    for (const key of openSet) {
      const m = meta.get(key)!;
      if (
        !currentMeta ||
        m.total < currentMeta.total ||
        (m.total === currentMeta.total && m.turns < currentMeta.turns)
      ) {
        currentKey = key;
        currentMeta = m;
      }
    }

    if (!currentKey || !currentMeta) break;
    openSet.delete(currentKey);

    const [currentId] = currentKey.split("_") as [string, Direction];
    const currentNode = graph.get(currentId)!;

    if (currentId === endId) {
      const endCandidates = [...meta.entries()].filter(([key]) =>
        key.startsWith(endId + "_")
      );
      const [bestKey] = endCandidates.reduce((best, curr) =>
        curr[1].total < best[1].total ? curr : best
      );

      let nodeKey: MetaKey | null = bestKey;
      const path: Point[] = [];

      while (nodeKey) {
        const [id] = nodeKey.split("_") as [string, Direction];
        path.push(graph.get(id)!.point);
        nodeKey = meta.get(nodeKey)?.from as MetaKey | null;
      }

      return { path: path.reverse(), meta, tree };
    }

    for (const neighborId of currentNode.neighbors) {
      const neighborNode = graph.get(neighborId)!;
      const newDirection = getDirection(currentNode.point, neighborNode.point)!;
      const neighborKey = getMetaKey(neighborId, newDirection);

      if (meta.get(neighborKey)?.visited) continue;

      const segment: Segment = [currentNode.point, neighborNode.point];
      if (!isValidSegment(segment, tree)) continue;

      const baseCost = manhattan(currentNode.point, neighborNode.point);

      const newCost = currentMeta.cost + baseCost;
      const addTurn = currentMeta.direction !== newDirection ? 1 : 0;
      const newTurnsCount = currentMeta.turns + addTurn;

      const existing = meta.get(neighborKey);
      if (
        !existing ||
        newCost < existing.cost ||
        (newCost === existing.cost && newTurnsCount < existing.turns)
      ) {
        meta.set(neighborKey, {
          cost: newCost,
          heuristic: manhattan(neighborNode.point, endNode.point),
          total: newCost + manhattan(neighborNode.point, endNode.point),
          from: currentKey,
          visited: false,
          direction: newDirection,
          turns: newTurnsCount,
        });
        openSet.add(neighborKey);
      }
    }

    meta.set(currentKey, { ...currentMeta, visited: true });

    if (currentMeta.from) {
      const [fromId] = currentMeta.from.split("_");
      const from = graph.get(fromId)!;
      const segment: Segment = [from.point, currentNode.point];
      tree.insert(makeRTreeSegment(segment));
    }
  }

  return { path: null, meta, tree };

  function getMetaKey(id: string, direction: Direction): MetaKey {
    return `${id}_${direction}`;
  }
}
