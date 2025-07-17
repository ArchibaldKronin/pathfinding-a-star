import type { ConnectionPoint, Point, Rect } from "../types/commonTypes";
import {
  aStarSearch,
  buildGraph,
  buildRectTree,
  createBasePoints,
  generateReachablePoints,
  getOuterRect,
  isValidConnection,
  rectsIntersect,
  simplifyPath,
} from "./supportFunctions";
import {
  getDirectionByAngle,
  getPointId,
  inflateRect,
  moveByAngle,
  rectToAABB,
} from "./utils";

type DataConverterType = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
) => Point[];

export const dataConverter: DataConverterType = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
) => {
  const inflatedRectForNodes1 = inflateRect(rect1, 10);
  const inflatedRectForNodes2 = inflateRect(rect2, 10);

  if (rectsIntersect(rect1, rect2)) {
    throw new Error("Прямоугольники пересекаются");
  }

  if (rectsIntersect(inflatedRectForNodes1, inflatedRectForNodes2)) {
    throw new Error("Прямоугольники слишком близко");
  }

  if (
    !isValidConnection(rect1, cPoint1) ||
    !isValidConnection(rect2, cPoint2)
  ) {
    throw new Error("Ошибка позиционирования точки присоединения");
  }

  const entryPoint: Point = moveByAngle(cPoint1.point, cPoint1.angle, 10);
  const exitPoint: Point = moveByAngle(cPoint2.point, cPoint2.angle, 10);

  const outerRectForNodes = getOuterRect(
    rectToAABB(inflatedRectForNodes1),
    rectToAABB(inflatedRectForNodes2)
  );

  const baseNodes: Point[] = createBasePoints(
    entryPoint,
    exitPoint,
    [inflatedRectForNodes1, inflatedRectForNodes2],
    outerRectForNodes
  );

  const reachablePoints = generateReachablePoints(
    baseNodes,
    [inflatedRectForNodes1, inflatedRectForNodes2],
    outerRectForNodes
  );

  const graph = buildGraph(reachablePoints);

  const outerRectForSegments = inflateRect(outerRectForNodes, 5);

  const inflatedRectForRTree1 = inflateRect(rect1, 9);
  const inflatedRectForRTree2 = inflateRect(rect2, 9);

  const rTree = buildRectTree([
    inflatedRectForRTree1,
    inflatedRectForRTree2,
    outerRectForSegments,
  ]);
  const entryDirection = getDirectionByAngle(cPoint1.angle);

  const { path } = aStarSearch(
    graph,
    getPointId(entryPoint),
    getPointId(exitPoint),
    rTree,
    entryDirection
  );

  if (!path) throw new Error("Путь не найден");

  return simplifyPath([
    { x: cPoint1.point.x, y: cPoint1.point.y },
    ...path.map((p) => ({ x: p.x, y: p.y })),
    { x: cPoint2.point.x, y: cPoint2.point.y },
  ]);
};
