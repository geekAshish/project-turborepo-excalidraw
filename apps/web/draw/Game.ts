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

interface Point {
  x: number;
  y: number;
}

interface Pen {
  type: "pen";
  path: Point[];
}

type Shape = Reactangle | Circle | Pen;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  socket: WebSocket;

  private existingShapes: Shape[];

  private roomId: string;

  private startX: number;
  private startY: number;
  private selectedShape: Tool;
  private penPath: { x: number; y: number }[];

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
    this.penPath = [];

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

      if (message.type === "chat") {
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
      this.ctx.beginPath();

      if (shape.type === "Rect") {
        this.ctx.strokeStyle = "rgba(225, 225, 225)";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
      if (shape.type === "circle") {
        const circleRadius = Math.abs(shape.radius);

        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          circleRadius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (shape.type === "pen") {
        this.drawPenPath(shape.path);
      }

      this.ctx.closePath();
    });
  }

  drawPenPath = (path: { x: number; y: number }[]) => {
    if (path.length < 2) return;
    if (!path[0]) return;

    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      if (!current || !next) continue; // ✅ safety check

      const midPoint = {
        x: (current.x + next.x) / 2,
        y: (current.y + next.y) / 2,
      };

      this.ctx.quadraticCurveTo(current.x, current.y, midPoint.x, midPoint.y);
    }

    const last = path[path.length - 1];
    if (last) {
      this.ctx.lineTo(last.x, last.y);
    }

    this.ctx.stroke();
    this.ctx.closePath();
  };

  mouseDownHandler = (e) => {
    this.isMouseClicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    if (this.selectedShape === "pen") {
      this.penPath = [{ x: e.clientX, y: e.clientY }];
    }
  };

  mouseUpHandler = (e) => {
    this.isMouseClicked = false;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const width = mouseX - this.startX;
    const height = mouseY - this.startY;

    const selectedShape = this.selectedShape;
    let shape: Shape | null = null;

    if (selectedShape === "rect") {
      shape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    }

    if (selectedShape === "circle") {
      // Use half of the diagonal as radius
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;

      // Calculate center based on drag direction
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;

      shape = {
        type: "circle",
        radius,
        centerX,
        centerY,
      };
    }

    if (selectedShape === "pen" && this.penPath.length > 0) {
      shape = {
        type: "pen",
        path: [...this.penPath], // save current path
      };
      this.penPath = []; // clear after storing
    }

    if (!shape) return;

    this.existingShapes.push(shape);

    this.clearCanvas();

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
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const width = mouseX - this.startX;
      const height = mouseY - this.startY;

      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(225, 225, 225)";

      if (this.selectedShape === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      }

      if (this.selectedShape === "circle") {
        // Calculate the bounding box
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;

        // Center of the bounding box
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (this.selectedShape === "pen") {
        this.penPath.push({ x: e.clientX, y: e.clientY });
        this.drawPenPath(this.penPath);
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
