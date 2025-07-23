import { describe, it, expect } from "vitest";
import { dataConverter } from "../dataConverter";
import { createRect } from "../utils";
import type { ConnectionPoint } from "../../types/commonTypes";

describe("dataConverter", () => {
  it("Не изменяет входные аргументы", () => {
    const rect1 = createRect(20, 20, 20, 20);
    const rect2 = createRect(55, 15, 10, 10);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 30, y: 15 } };
    const conPoint2: ConnectionPoint = { angle: 180, point: { x: 50, y: 15 } };

    const rect1Clone = structuredClone(rect1);
    const rect2Clone = structuredClone(rect2);
    const conPoint1Clone = structuredClone(conPoint1);
    const conPoint2Clone = structuredClone(conPoint2);

    dataConverter(rect1, rect2, conPoint1, conPoint2);

    expect(rect1).toEqual(rect1Clone);
    expect(rect2).toEqual(rect2Clone);
    expect(conPoint1).toEqual(conPoint1Clone);
    expect(conPoint2).toEqual(conPoint2Clone);
  });

  it("Прямой путь", () => {
    const rect1 = createRect(20, 20, 20, 20);
    const rect2 = createRect(55, 15, 10, 10);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 30, y: 15 } };
    const conPoint2: ConnectionPoint = { angle: 180, point: { x: 50, y: 15 } };
    const result = dataConverter(rect1, rect2, conPoint1, conPoint2);
    expect(result).toEqual([
      { x: 30, y: 15 },
      { x: 50, y: 15 },
    ]);
  });

  it("Путь с одним поворотом", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(225, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = { angle: 90, point: { x: 220, y: 100 } };
    const result = dataConverter(rect1, rect2, conPoint1, conPoint2);
    expect(result).toEqual([
      { x: 150, y: 120 },
      { x: 220, y: 120 },
      { x: 220, y: 100 },
    ]);
  });

  it("Прямоугольники слишком близко - ошибка", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(187, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = { angle: 90, point: { x: 180, y: 100 } };

    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Прямоугольники слишком близко"
    );
  });

  it("Прямоугольники пересекаются - ошибка", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(150, 50, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = { angle: 90, point: { x: 170, y: 75 } };
    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Прямоугольники пересекаются"
    );
  });
  it("Прямоугольники вписан в прямоугольник - ошибка", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(85, 85, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = { angle: 90, point: { x: 80, y: 110 } };
    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Прямоугольники пересекаются"
    );
  });

  it("Ошибка угла точки присоединения (угол вдоль ребра)", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(225, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = {
      angle: 270,
      point: { x: 220, y: 100 },
    };
    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Ошибка позиционирования точки присоединения"
    );
  });

  it("Ошибка угла точки присоединения (угол в обратную сторону)", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(225, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = {
      angle: 0,
      point: { x: 220, y: 100 },
    };
    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Ошибка позиционирования точки присоединения"
    );
  });

  it("Ошибка координат точки присоединения", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(225, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = { angle: 90, point: { x: 220, y: 110 } };
    expect(() => dataConverter(rect1, rect2, conPoint1, conPoint2)).toThrow(
      "Ошибка позиционирования точки присоединения"
    );
  });

  it("Находит путь с наименьшим количеством поворотов при равной длине", () => {
    const rect1 = createRect(100, 100, 100, 100);
    const rect2 = createRect(225, 75, 50, 50);
    const conPoint1: ConnectionPoint = { angle: 0, point: { x: 150, y: 120 } };
    const conPoint2: ConnectionPoint = {
      angle: 90,
      point: { x: 220, y: 100 },
    };
    const result = dataConverter(rect1, rect2, conPoint1, conPoint2);
    expect(result).toEqual([
      { x: 150, y: 120 },
      { x: 220, y: 120 },
      { x: 220, y: 100 },
    ]);
  });
});
