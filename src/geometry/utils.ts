import type {
  Point,
  Rect,
  Direction,
  AABB,
  Segment,
  ConnectionPoint,
} from "../types/commonTypes";

export function createRect(
  x: number,
  y: number,
  width: number,
  height: number
): Rect {
  return {
    position: { x, y },
    size: { width, height },
  };
}

export function createConnectionPoint(
  x: number,
  y: number,
  angle: number
): ConnectionPoint {
  return { point: { x, y }, angle };
}

export function deduplicatePoints(points: Point[]): Point[] {
  const seen = new Set<string>();
  return points.filter((p) => {
    const key = getPointId(p);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getPointId(p: Point): string {
  return `${p.x},${p.y}`;
}

export function getDirectionByAngle(angle: number): Direction {
  switch (angle % 360) {
    case 0:
    case 360:
      return "right";
    case 90:
      return "bottom";
    case 180:
      return "left";
    case 270:
      return "top";
    default:
      throw new Error(`Угол не поддерживается: ${angle}`);
  }
}

export function getAxleForMovementByAngle(angle: number): "X" | "Y" {
  switch (angle % 360) {
    case 0:
    case 360:
    case 180:
      return "Y";
    case 90:
    case 270:
      return "X";

    default:
      throw new Error(`Угол не поддерживается: ${angle}`);
  }
}

function round(n: number): number {
  return Math.round(n);
}

export function roundPoint(p: Point): Point {
  return { x: round(p.x), y: round(p.y) };
}

export function rectToAABB(rect: Rect): AABB {
  const { position, size } = rect;
  const halfW = size.width / 2;
  const halfH = size.height / 2;

  return {
    minX: round(position.x - halfW),
    maxX: round(position.x + halfW),
    minY: round(position.y - halfH),
    maxY: round(position.y + halfH),
  };
}

export function moveByAngle( // движение от точки присоединения до отступа прямоугольника
  point: Point,
  angle: number,
  distance: number
): Point {
  const rad = (angle * Math.PI) / 180;
  return {
    x: round(point.x + Math.cos(rad) * distance),
    y: round(point.y + Math.sin(rad) * distance),
  };
}

export function inflateRect(rect: Rect, margin: number): Rect {
  // построение отступов для прямоугольников
  return {
    position: { x: rect.position.x, y: rect.position.y },
    size: {
      width: rect.size.width + margin * 2,
      height: rect.size.height + margin * 2,
    },
  };
}

export function getRectCorners(rect: Rect): Point[] {
  // определение узлов для поворотов
  const { minX, maxX, minY, maxY } = rectToAABB(rect);

  return [
    { x: minX, y: minY },
    { x: minX, y: maxY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
  ];
}

export function manhattan(p1: Point, p2: Point): number {
  // эверистическая оценка для А*
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function getDirection(from: Point, to: Point): Direction | null {
  // направление между двумя точками
  if (from.x === to.x && from.y > to.y) return "top";
  if (from.x === to.x && from.y < to.y) return "bottom";
  if (from.y === to.y && from.x > to.x) return "left";
  if (from.y === to.y && from.x < to.x) return "right";
  return null;
}

export function isPointsEqual(p1: Point, p2: Point): boolean {
  const normalizedP1 = roundPoint(p1);
  const normalizedP2 = roundPoint(p2);
  return normalizedP1.x === normalizedP2.x && normalizedP1.y === normalizedP2.y;
}

export function isSegmentsEqual(seg1: Segment, seg2: Segment): boolean {
  const [seg1Start, seg1End] = seg1;
  const [seg2Start, seg2End] = seg2;
  if (
    (isPointsEqual(seg1Start, seg2Start) && isPointsEqual(seg1End, seg2End)) ||
    (isPointsEqual(seg1Start, seg2End) && isPointsEqual(seg1End, seg2Start))
  )
    return true;
  return false;
}

export function segmentToAABB([a, b]: Segment): AABB {
  return {
    minX: Math.min(a.x, b.x),
    maxX: Math.max(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxY: Math.max(a.y, b.y),
  };
}

export function getRectsSegments(
  rect: Rect
): [Segment, Segment, Segment, Segment] {
  const { minX, maxX, minY, maxY } = rectToAABB(rect);

  return [
    [
      { x: minX, y: minY },
      { x: maxX, y: minY },
    ], // top
    [
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
    ], // right
    [
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ], // bottom
    [
      { x: minX, y: maxY },
      { x: minX, y: minY },
    ], // left
  ];
}

export function getConPointMovementDiapason(
  rect: Rect,
  axle: "X" | "Y"
): [number, number] {
  switch (axle) {
    case "X":
      return [
        round(rect.position.x - rect.size.width / 2),
        round(rect.position.x + rect.size.width / 2),
      ];
    case "Y":
      return [
        round(rect.position.y - rect.size.height / 2),
        round(rect.position.y + rect.size.height / 2),
      ];
  }
}

export function isPointInRect(rect: Rect, point: Point): boolean {
  const { minX, maxX, minY, maxY } = rectToAABB(rect);
  const { x, y } = point;
  if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
    return true;
  }
  return false;
}
