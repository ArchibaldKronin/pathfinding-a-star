import type { Point, Rect } from "../types/commonTypes";

export function drawScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  rects: Rect[],
  path: Point[],
  reachablePoints?: Point[]
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  rects.forEach((rect) => {
    ctx.strokeRect(
      rect.position.x - rect.size.width / 2,
      rect.position.y - rect.size.height / 2,
      rect.size.width,
      rect.size.height
    );
  });

  if (path.length > 1) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }

  if (reachablePoints) {
    reachablePoints.forEach(({ x, y }) => drawPoint(ctx, x, y));
  }
}

function drawPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color = "blue",
  radius = 3
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
