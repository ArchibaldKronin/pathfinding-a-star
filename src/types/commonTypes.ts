import type { AppStateType } from "../App";

export type Point = {
  x: number;
  y: number;
};
export type Size = {
  width: number;
  height: number;
};
export type Rect = {
  position: Point; // координата центра прямоугольника
  size: Size;
};
export type ConnectionPoint = {
  point: Point;
  angle: number; // угол в градусах
};

export type AABB = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type Direction = "left" | "right" | "top" | "bottom";

export interface PathNode {
  id: string;
  point: Point;
  neighbors: string[];
}

export interface RTreeSegment {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  data: { start: Point; end: Point };
}

export type Segment = [Point, Point];

export interface AStarMeta {
  cost: number;
  heuristic: number;
  total: number;
  from: string | null;
  visited: boolean;
  direction: Direction | null;
}

export type MetaKey = `${string}_${Direction}`;

export type RectIdentificatorType = "A" | "B";

export type preparedConfigKeys = "1" | "2" | "3";

export type PreparedConfigsType = Record<preparedConfigKeys, AppStateType>;
