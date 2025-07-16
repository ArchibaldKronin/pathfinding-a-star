import { describe, it, expect } from "vitest";
import { generateRaysCrossPoints } from "../supportFunctions";
import { createRect } from "../utils";

describe("generateRaysCrossPoints", () => {
  it("Не изменяет входные аргументы", () => {
    const basePoints = [
      { x: 100, y: 100 },
      { x: 150, y: 100 },
      { x: 100, y: 150 },
    ];
    const outer = createRect(100, 100, 300, 300);

    const basePointsCopy = structuredClone(basePoints);
    const outerCopy = structuredClone(outer);

    generateRaysCrossPoints(basePoints, outer);

    expect(basePoints).toEqual(basePointsCopy);
    expect(outer).toEqual(outerCopy);
  });

  it("Одна точка - возвращает пустой массив", () => {
    const basePoints = [{ x: 100, y: 100 }];
    const outer = createRect(100, 100, 200, 200);

    const result = generateRaysCrossPoints(basePoints, outer);

    expect(result).toEqual([]);
  });

  it("Две точки на одной горизонтали - возвращает пустой массив", () => {
    const basePoints = [
      { x: 100, y: 100 },
      { x: 150, y: 100 },
    ];
    const outer = createRect(100, 100, 300, 300);

    const result = generateRaysCrossPoints(basePoints, outer);

    expect(result).toEqual([]);
  });

  it("Три точки с совпадающими X или Y координатами - возвращает одно пересечение", () => {
    const basePoints = [
      { x: 100, y: 100 },
      { x: 150, y: 100 },
      { x: 100, y: 150 },
    ];
    const outer = createRect(100, 100, 300, 300);

    const result = generateRaysCrossPoints(basePoints, outer);

    expect(result).toEqual(expect.arrayContaining([{ x: 150, y: 150 }]));
    expect(result.length).toBe(1);
  });

  it("Три точки с разными координатами - возвращает шесть пересечений", () => {
    const basePoints = [
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 150, y: 150 },
    ];
    const outer = createRect(100, 100, 400, 400);

    const result = generateRaysCrossPoints(basePoints, outer);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 50, y: 100 },
        { x: 50, y: 150 },
        { x: 100, y: 150 },
        { x: 100, y: 50 },
        { x: 150, y: 100 },
        { x: 150, y: 50 },
      ])
    );
    expect(result.length).toBe(6);
  });
});
