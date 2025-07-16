import { describe, it, expect } from "vitest";
import { rectsIntersect } from "../supportFunctions";

describe("rectsIntersect", () => {
  it("Не изменяет входные аргументы", () => {
    const rect1 = {
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
    };
    const rect2 = {
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
    };
    const rect1Copy = structuredClone(rect1);
    const rect2Copy = structuredClone(rect2);

    rectsIntersect(rect1, rect2);

    expect(rect1).toEqual(rect1Copy);
    expect(rect2).toEqual(rect2Copy);
  });

  it("Прямоугольники пересекаются - true", () => {
    const rect1 = {
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
    };
    const rect2 = {
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
    };

    expect(rectsIntersect(rect1, rect2)).toBe(true);
  });

  it("Прямоугольники не пересекаются - false", () => {
    const rect1 = { position: { x: 0, y: 0 }, size: { width: 50, height: 50 } };
    const rect2 = {
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 },
    };

    expect(rectsIntersect(rect1, rect2)).toBe(false);
  });

  it("Прямоугольники касаются только краями - false", () => {
    const rect1 = {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
    };
    const rect2 = {
      position: { x: 100, y: 0 },
      size: { width: 100, height: 100 },
    };

    expect(rectsIntersect(rect1, rect2)).toBe(false);
  });

  it("Один прямоугольник полностью внутри другого -  - true", () => {
    const outer = {
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
    };
    const inner = {
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 },
    };

    expect(rectsIntersect(outer, inner)).toBe(true);
  });

  it("Прямоугольники совпадают полностью -  - true", () => {
    const rect1 = {
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
    };
    const rect2 = {
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
    };

    expect(rectsIntersect(rect1, rect2)).toBe(true);
  });
});
