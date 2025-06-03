import axios from "axios";
import { BACKEND_URL } from "../app/config";

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

interface Pencil {
  type: "pencil";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type Shape = Reactangle | Circle | Pencil;

export const initDraw = async ({
  ctx,
  canvas,
  roomId,
  socket,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  roomId: string;
  socket: WebSocket;
}) => {
  const existingShapes: Shape[] = await getExistingShape(roomId);

  // dumb way
  const shapeType: "rect" | "circle" | "pen" = "circle";

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "message") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);

      clearCanvas({ existingShapes, canvas, ctx });
    }
  };

  clearCanvas({ existingShapes, canvas, ctx });

  let isMouseClicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isMouseClicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    isMouseClicked = false;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    let shape: Shape | null = null;

    if (shapeType === "rect") {
      shape = {
        type: "Rect",
        x: startX,
        y: startY,
        height,
        width,
      };
    }
    if (shapeType === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: startX + radius,
        centerY: startY + radius,
      };
    }

    if (!shape) return;

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isMouseClicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas({ existingShapes, canvas, ctx });

      ctx.strokeStyle = "rgba(225, 225, 225)";

      // if (shapeType === "rect") {
      //   ctx.strokeRect(startX, startY, width, height);
      // }

      if (shapeType === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = startX + radius;
        const centerY = startY + radius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
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
    if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });
};

async function getExistingShape(roomId: string) {
  const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: { messages: string }) => {
    const messageData = JSON.parse(x.messages);
    return messageData.shape;
  });

  return shapes;
}
