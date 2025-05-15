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

type Shape = Reactangle | Circle;

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

    const shape: Shape = {
      type: "Rect",
      x: startX,
      y: startY,
      height,
      width,
    };

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "message",
        shape: JSON.stringify({ shape }),
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

async function getExistingShape(roomId: string) {
  const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: { messages: string }) => {
    const messageData = JSON.parse(x.messages);
    return messageData.shape;
  });

  return shapes;
}
