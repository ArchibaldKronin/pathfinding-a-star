import { describe, it, expect } from "vitest";
import { createRect, rectToAABB } from "../utils";
import type { ConnectionPoint } from "../../types/commonTypes";
import { isValidConnection } from "../supportFunctions";

describe("isValidConnection", () => {
  const rect = createRect(100, 100, 100, 100);
  const { minX: left, maxX: right, minY: top, maxY: bottom } = rectToAABB(rect);
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  it("Не изменяет входные аргументы", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: right, y: centerY },
    };
    const conPointCopy = structuredClone(conPoint);
    const rectCopy = structuredClone(rect);

    isValidConnection(rect, conPoint);

    expect(conPoint).toEqual(conPointCopy);
    expect(rect).toEqual(rectCopy);
  });

  it("Точка на правой грани - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: right, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на левой грани - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 180,
      point: { x: left, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на верхней грани - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 270,
      point: { x: centerX, y: top },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на нижней грани - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 90,
      point: { x: centerX, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на правой грани, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 90,
      point: { x: right, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка на левой грани, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: left, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка на верхней грани, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: centerX, y: top },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка на нижней грани, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 270,
      point: { x: centerX, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка внутри прямоугольника - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: centerX, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка снаружи - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: right + 1, y: centerY },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка на углу, угол верный - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 0,
      point: { x: right, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на углу, угол верный - true", () => {
    const conPoint: ConnectionPoint = {
      angle: 90,
      point: { x: right, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(true);
  });

  it("Точка на углу, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 270,
      point: { x: right, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });

  it("Точка на углу, угол неверный - false", () => {
    const conPoint: ConnectionPoint = {
      angle: 180,
      point: { x: right, y: bottom },
    };
    expect(isValidConnection(rect, conPoint)).toBe(false);
  });
});
