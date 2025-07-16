import { describe, it, expect } from "vitest";
import type { Point, Rect } from "../../types/commonTypes";
import { generateAxisProjections } from "../supportFunctions";
import { createRect } from "../utils";

describe("generateAxisProjections", () => {
  it("Не изменяет входные аргументы", () => {
    const point: Point = { x: 50, y: 50 };
    const rect: Rect = createRect(100, 100, 100, 100);
    const outer: Rect = createRect(0, 0, 200, 200);

    const pointClone = structuredClone(point);
    const rectClone = structuredClone(rect);
    const outerClone = structuredClone(outer);

    generateAxisProjections([point], [rect], outer);

    expect(point).toEqual(pointClone);
    expect(rect).toEqual(rectClone);
    expect(outer).toEqual(outerClone);
  });

  it("Создает корректные проекции на ближайшие грани одного прямоугольника", () => {
    const point: Point = { x: 50, y: 50 };

    const rect: Rect = createRect(100, 100, 100, 100); // AABB 50–150
    const outer: Rect = createRect(100, 100, 200, 200); // AABB 0–200

    const result = generateAxisProjections([point], [rect], outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 0, y: 50 }, // left
        { x: 150, y: 50 }, // right
        { x: 200, y: 50 }, // right
        { x: 50, y: 150 }, // bottom
        { x: 50, y: 200 }, // bottom
        { x: 50, y: 0 }, // top
      ])
    );
    expect(result.length).toBe(6);
  });

  it("Проецирует точку вне прямоугольника на грани outer", () => {
    const point: Point = { x: -50, y: 100 }; // левее любого прямоугольника

    const rect: Rect = createRect(100, 100, 100, 100); // AABB 50–150
    const outer: Rect = createRect(100, 100, 400, 400); // AABB -100-300

    const result = generateAxisProjections([point], [rect], outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: -100, y: 100 }, // left
        { x: 50, y: 100 }, // right
        { x: 150, y: 100 }, // right
        { x: 300, y: 100 }, // right
        { x: -50, y: 300 }, // bottom
        { x: -50, y: -100 }, // top
      ])
    );
    expect(result.length).toBe(6);
  });

  it("Возвращает только углы внешнего прямоугольника", () => {
    const point: Point = { x: 0, y: 0 };

    const rects: Rect[] = []; // ни одного прямоугольника
    const outer: Rect = createRect(100, 100, 200, 200); // AABB: 0–200

    const result = generateAxisProjections([point], rects, outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 0, y: 200 }, // left
        { x: 200, y: 0 }, // right
      ])
    );
    expect(result.length).toBe(2);
  });

  it("Проецирует 4 точки на грани внешнего прямоугольника", () => {
    const point: Point = { x: 100, y: 100 }; // левее любого прямоугольника

    const outer: Rect = createRect(100, 100, 200, 200); // AABB: 0–200

    const rects: Rect[] = []; // ни одного прямоугольника
    const result = generateAxisProjections([point], rects, outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 0, y: 100 }, // left
        { x: 200, y: 100 }, // right
        { x: 100, y: 0 }, // bottom
        { x: 100, y: 200 }, // top
      ])
    );
    expect(result.length).toBe(4);
  });

  it("Точки из угла внутреннего прямоугольника", () => {
    const basePoints = [{ x: 150, y: 150 }];
    const rects = [createRect(100, 100, 100, 100)];
    const outer = createRect(200, 200, 300, 300);

    const result = generateAxisProjections(basePoints, rects, outer);
    expect(result).toEqual(
      expect.arrayContaining([
        { x: 50, y: 150 },
        { x: 350, y: 150 },
        { x: 150, y: 50 },
        { x: 150, y: 350 },
      ])
    );
    expect(result.length).toBe(4);
  });
});
