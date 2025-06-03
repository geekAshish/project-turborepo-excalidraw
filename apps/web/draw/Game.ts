import { Tool } from "../modules/interface/shape";
import { getExistingShape } from "./http";

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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  socket: WebSocket;

  private existingShapes: Shape[];

  private roomId: string;

  private startX: number;
  private startY: number;
  private selectedShape: Tool;

  private isMouseClicked: boolean;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.isMouseClicked = false;
    this.startX = 0;
    this.startY = 0;
    this.selectedShape = "rect";

    this.init();
    this.initHandlers();
    this.clearCanvas();
    this.initMouseHandlers();
  }

  async init() {
    this.existingShapes = await getExistingShape(this.roomId);
    this.clearCanvas();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setShape(shape: Tool) {
    this.selectedShape = shape;
  }

  async initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "message") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);

        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      if (shape.type === "Rect") {
        this.ctx.strokeStyle = "rgba(225, 225, 225)";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
      if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  mouseDownHandler = (e) => {
    this.isMouseClicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e) => {
    this.isMouseClicked = false;

    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    const selectedShape = this.selectedShape;
    let shape: Shape | null = null;

    if (selectedShape === "rect") {
      shape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    }
    if (selectedShape === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    }

    if (!shape) return;

    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  mouseMoveHandler = (e) => {
    if (this.isMouseClicked) {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

      this.clearCanvas();

      this.ctx.strokeStyle = "rgba(225, 225, 225)";

      if (this.selectedShape === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      }

      if (this.selectedShape === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
