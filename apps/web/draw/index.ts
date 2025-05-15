interface Reactangle {
  type: "Rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Circle {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
}

type Shape = Reactangle | Circle;

export const initDraw = ({
  ctx,
  canvas,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}) => {
  let isMouseClicked = false;
  let startX = 0;
  let startY = 0;

  const existingShapes: Shape[] = [];

  canvas.addEventListener("mousedown", (e) => {
    isMouseClicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    isMouseClicked = false;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    existingShapes.push({
      type: "Rect",
      x: startX,
      y: startY,
      height,
      width,
    });
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isMouseClicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas({ existingShapes, canvas, ctx });

      ctx.strokeStyle = "rgba(225, 225, 225)";
      ctx.strokeRect(startX, startY, width, height);
    }
  });
};

const clearCanvas = ({
  existingShapes,
  canvas,
  ctx,
}: {
  existingShapes: Shape[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type === "Rect") {
      ctx.strokeStyle = "rgba(225, 225, 225)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
};
