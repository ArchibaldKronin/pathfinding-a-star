import { useEffect, useRef, useState, type FC } from "react";
import type { Point, Rect } from "../types/commonTypes";
import { drawScene } from "../geometry/drawingFunctions";
import { isPointInRect } from "../geometry/utils";
import useDebounceCallback from "../hooks/useDebounceCallback";

type PartialConnectionPoint = {
  point: Point;
};

export type CanvasMapUpdate =
  | { rectA: Rect; conPointA: PartialConnectionPoint }
  | { rectB: Rect; conPointB: PartialConnectionPoint };

export type CanvasMapProps = {
  rects: Rect[];
  path: Point[];
  startPoint: Point;
  endPoint: Point;
  onRectMove: (partialState: CanvasMapUpdate) => void;
  reachablePoints?: Point[];
};

const CanvasMap: FC<CanvasMapProps> = ({
  rects,
  path,
  startPoint,
  endPoint,
  onRectMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawScene(canvas, ctx, rects, path);
  }, [rects, path]);

  const [draggingRect, setDraggingRect] = useState<"A" | "B" | null>(null);
  const [offsetRect, setOffsetRect] = useState<Point>({ x: 0, y: 0 });
  const [offsetConPoint, setOffsetConPoint] = useState<Point>({ x: 0, y: 0 });

  const debouncedOnRectMove = useDebounceCallback(onRectMove, 5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedRectIndex = rects.findIndex((r) =>
        isPointInRect(r, { x, y })
      );
      if (clickedRectIndex === -1) return;

      const rectId = clickedRectIndex === 0 ? "A" : "B";
      const rectObj = rects[clickedRectIndex];
      const conPointObj = rectId === "A" ? startPoint : endPoint;

      setDraggingRect(rectId);

      setOffsetRect({ x: x - rectObj.position.x, y: y - rectObj.position.y });
      try {
        setOffsetConPoint({ x: x - conPointObj.x, y: y - conPointObj.y });
      } catch (e) {
        console.log(x, y, conPointObj);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRect) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRectX = x - offsetRect.x;
      const newRectY = y - offsetRect.y;
      const newConPointX = x - offsetConPoint.x;
      const newConPointY = y - offsetConPoint.y;

      const updatedState =
        draggingRect === "A"
          ? {
              rectA: {
                ...rects[0],
                position: { x: newRectX, y: newRectY },
              },
              conPointA: {
                point: { x: newConPointX, y: newConPointY },
              },
            }
          : {
              rectB: {
                ...rects[1],
                position: { x: newRectX, y: newRectY },
              },
              conPointB: {
                point: { x: newConPointX, y: newConPointY },
              },
            };

      debouncedOnRectMove(updatedState);
    };

    const handleMouseUp = () => {
      setDraggingRect(null);
      setOffsetRect({ x: 0, y: 0 });
      setOffsetConPoint({ x: 0, y: 0 });
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    rects,
    draggingRect,
    offsetRect,
    offsetConPoint,
    path,
    debouncedOnRectMove,
  ]);

  return <canvas ref={canvasRef} width={800} height={800} />;
};

export default CanvasMap;
