import { describe, it, expect } from "vitest";
import type { Segment } from "../../types/commonTypes";
import { isSegmentsIntersect } from "../supportFunctions";

describe("isSegmentsIntersect", () => {
  it("Не изменяет входные аргументы", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ];
    const segment2: Segment = [
      { x: 0, y: 10 },
      { x: 40, y: 10 },
    ];
    const segment1Copy = structuredClone(segment1);
    const segment2Copy = structuredClone(segment2);

    isSegmentsIntersect(segment1[0], segment1[1], segment2[0], segment2[1]);

    expect(segment1).toEqual(segment1Copy);
    expect(segment2).toEqual(segment2Copy);
  });

  it("Пересекаются крест-накрест", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ];
    const segment2: Segment = [
      { x: 0, y: 10 },
      { x: 40, y: 10 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(true);
  });

  it("Совпадают частично", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 40 },
    ];
    const segment2: Segment = [
      { x: 20, y: 10 },
      { x: 20, y: 50 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(true);
  });

  it("Полностью совпадают", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ];
    const segment2: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(true);
  });

  it("Параллельные отрезки", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 40 },
    ];
    const segment2: Segment = [
      { x: 10, y: 10 },
      { x: 10, y: 40 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(false);
  });

  it("Касание углами", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 40 },
    ];
    const segment2: Segment = [
      { x: 20, y: 40 },
      { x: 40, y: 40 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(false);
  });

  it("Не пересекаются, перпендикулярны", () => {
    const segment1: Segment = [
      { x: 20, y: 0 },
      { x: 20, y: 40 },
    ];
    const segment2: Segment = [
      { x: 0, y: 50 },
      { x: 50, y: 50 },
    ];

    const result = isSegmentsIntersect(
      segment1[0],
      segment1[1],
      segment2[0],
      segment2[1]
    );

    expect(result).toBe(false);
  });
});
