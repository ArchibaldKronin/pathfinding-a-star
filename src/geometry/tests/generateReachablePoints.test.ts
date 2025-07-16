import { describe, it, expect } from "vitest";
import type { Point } from "../../types/commonTypes";
import { createRect, getRectCorners } from "../utils";
import { generateReachablePoints } from "../supportFunctions";

describe("generateReachablePoints", () => {
  it("Не изменяет входные аргументы", () => {
    const rects = [createRect(100, 100, 100, 100)];
    const outer = createRect(200, 200, 300, 300);

    const baseNodes: Point[] = [
      ...getRectCorners(rects[0]),
      ...getRectCorners(outer),
    ];

    const rectsCopy = structuredClone(rects);
    const outerCopy = structuredClone(outer);
    const baseNodesCopy = structuredClone(baseNodes);

    generateReachablePoints(baseNodes, rects, outer);

    expect(rects).toEqual(rectsCopy);
    expect(outer).toEqual(outerCopy);
    expect(baseNodes).toEqual(baseNodesCopy);
  });

  it("Достижимые точки для одного прямоугольника без точек присоединения", () => {
    const rects = [createRect(100, 100, 100, 100)];
    const outer = createRect(200, 200, 300, 300);

    const baseNodes: Point[] = [
      ...getRectCorners(rects[0]),
      ...getRectCorners(outer),
    ];

    const result = generateReachablePoints(baseNodes, rects, outer);
    expect(result).toEqual(
      expect.arrayContaining([
        { x: 50, y: 50 },
        { x: 50, y: 150 },
        { x: 50, y: 350 },
        { x: 150, y: 50 },
        { x: 150, y: 150 },
        { x: 150, y: 350 },
        { x: 350, y: 50 },
        { x: 350, y: 150 },
        { x: 350, y: 350 },
      ])
    );
    expect(result.length).toBe(9);
  });

  it("Достижимые точки для одного прямоугольника с точкой присоединения", () => {
    const rects = [createRect(100, 100, 100, 100)];
    const outer = createRect(200, 200, 300, 300);
    const conPoint: Point = { x: 120, y: 150 };

    const baseNodes: Point[] = [
      conPoint,
      ...getRectCorners(rects[0]),
      ...getRectCorners(outer),
    ];

    const result = generateReachablePoints(baseNodes, rects, outer);
    expect(result).toEqual(
      expect.arrayContaining([
        { x: 50, y: 50 },
        { x: 50, y: 150 },
        { x: 50, y: 350 },
        { x: 120, y: 50 },
        { x: 120, y: 150 },
        { x: 120, y: 350 },
        { x: 150, y: 50 },
        { x: 150, y: 150 },
        { x: 150, y: 350 },
        { x: 350, y: 50 },
        { x: 350, y: 150 },
        { x: 350, y: 350 },
      ])
    );
    expect(result.length).toBe(12);
  });

  it("Достижимые точки для двух прямоугольников с точками присоединения", () => {
    const rects = [
      createRect(100, 100, 100, 100),
      createRect(275, 225, 150, 250),
    ];
    const outer = createRect(200, 200, 300, 300);
    const conPoint1: Point = { x: 120, y: 150 };
    const conPoint2: Point = { x: 200, y: 250 };

    const baseNodes: Point[] = [
      conPoint1,
      conPoint2,
      ...getRectCorners(rects[0]),
      ...getRectCorners(outer),
    ];

    const result = generateReachablePoints(baseNodes, rects, outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 50, y: 50 },
        { x: 50, y: 150 },
        { x: 50, y: 350 },
        { x: 120, y: 50 },
        { x: 120, y: 150 },
        { x: 120, y: 350 },
        { x: 150, y: 50 },
        { x: 150, y: 150 },
        { x: 150, y: 350 },
        { x: 350, y: 50 },
        { x: 350, y: 150 },
        { x: 350, y: 350 },
        { x: 200, y: 100 },
        { x: 200, y: 350 },
        { x: 350, y: 100 },
        { x: 350, y: 350 },
        { x: 200, y: 250 },
        { x: 50, y: 250 },
        { x: 200, y: 50 },
        { x: 350, y: 250 },
        { x: 200, y: 350 },
        { x: 200, y: 150 },
        { x: 120, y: 250 },
        { x: 150, y: 250 },
      ])
    );
    expect(result.length).toBe(22);
  });
});
