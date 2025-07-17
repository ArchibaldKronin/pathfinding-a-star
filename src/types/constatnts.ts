import { createRect } from "../geometry/utils";
import type { PreparedConfigsType } from "./commonTypes";

export const DIRECTIONS = [
  { axis: "x", dir: "left" },
  { axis: "x", dir: "right" },
  { axis: "y", dir: "top" },
  { axis: "y", dir: "bottom" },
] as const;

export const TURN_PENALTY = 70;

export const PREPARED_CONFIGS: PreparedConfigsType = {
  1: {
    rectA: createRect(100, 100, 100, 100),
    rectB: createRect(225, 75, 50, 50),
    conPointA: { angle: 0, point: { x: 150, y: 120 } },
    conPointB: { angle: 90, point: { x: 220, y: 100 } },
  },
  2: {
    rectA: createRect(150, 500, 100, 400),
    rectB: createRect(450, 450, 100, 100),
    conPointA: { angle: 180, point: { x: 100, y: 400 } },
    conPointB: { angle: 0, point: { x: 500, y: 495 } },
  },
  3: {
    rectA: createRect(250, 200, 300, 200),
    rectB: createRect(350, 550, 100, 100),
    conPointA: { angle: 90, point: { x: 320, y: 300 } },
    conPointB: { angle: 270, point: { x: 320, y: 500 } },
  },
};
