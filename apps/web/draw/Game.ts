import { Tool } from "../modules/interface/shape";
import { getExistingShape } from "./http";

interface Reactangle {
  type: "Rect";
  x: number;
  y: number;
  width: number;
  height: number;
  shapeId?: string;
}

interface Circle {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
  shapeId?: string;
}

interface Path {
  x: number;
  y: number;
}

interface Pen {
  type: "pen";
  path: Path[];
  shapeId?: string;
}

type Shape = Reactangle | Circle | Pen;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  socket: WebSocket;

  private existingShapes: Shape[];
  private redoStack: Shape[];

  private roomId: string;

  private startX: number;
  private startY: number;
  private selectedShape: Tool;
  private penPath: { x: number; y: number }[];
  private previewShape: Shape | null;
  private clientId: string;

  private isMouseClicked: boolean;

  private draggedShapeIndex: number | null;
  private offsetX: number;
  private offsetY: number;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.previewShape = null;
    this.redoStack = [];
    this.roomId = roomId;
    this.socket = socket;
    this.isMouseClicked = false;
    this.startX = 0;
    this.startY = 0;
    this.selectedShape = "rect";
    this.penPath = [];
    this.clientId = crypto.randomUUID();

    this.draggedShapeIndex = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.init();
    this.initHandlers();
    this.clearCanvas();
    this.initMouseHandlers();
  }

  async init() {
    this.existingShapes = await getExistingShape(this.roomId);
    this.clearCanvas();

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "z") {
        this.undo();
      }
      if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        this.redo();
      }
    });
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
        console.log(message.message);
        const { shape, senderId } = JSON.parse(message.message);

        // Ignore shapes sent by this same client
        if (senderId === this.clientId) return;

        this.existingShapes.push(shape);
        this.clearCanvas();
      }

      if (message.type === "erase") {
        const { shapeId } = message;
        this.existingShapes = this.existingShapes.filter(
          (s) => s.shapeId !== shapeId
        );
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw saved shapes
    this.existingShapes.forEach((shape) => this.drawShape(shape));

    // Draw preview if available
    if (this.previewShape) {
      this.drawShape(this.previewShape);
    }
  }

  drawShape(shape: Shape) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(225, 225, 225)";

    if (shape.type === "Rect") {
      this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    if (shape.type === "circle") {
      this.ctx.arc(
        shape.centerX,
        shape.centerY,
        Math.abs(shape.radius),
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }

    if (shape.type === "pen") {
      this.drawPenPath(shape.path);
    }

    this.ctx.closePath();
  }

  hitTest(x: number, y: number) {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      if (!shape) return;

      if (shape.type === "Rect") {
        if (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        ) {
          return { shape, index: i };
        }
      }

      if (shape.type === "circle") {
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= shape.radius) {
          return { shape, index: i };
        }
      }
    }
    return null;
  }

  undo() {
    const lastShape = this.existingShapes.pop();
    if (lastShape) {
      this.redoStack.push(lastShape);
      this.clearCanvas();
    }
  }

  redo() {
    const shape = this.redoStack.pop();
    if (shape) {
      this.existingShapes.push(shape);
      this.clearCanvas();
    }
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

  eraseAtPoint(x: number, y: number) {
    const shape = this.existingShapes.find((s) => {
      if (s.type === "Rect") {
        return (
          x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
        );
      }
      if (s.type === "circle") {
        const dx = x - s.centerX;
        const dy = y - s.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= s.radius;
      }
      if (s.type === "pen") {
        return s.path.some(
          (pt) => Math.abs(pt.x - x) < 5 && Math.abs(pt.y - y) < 5
        );
      }
      return false;
    });

    if (!shape) return;

    this.socket.send(
      JSON.stringify({
        type: "erase",
        roomId: this.roomId,
        shapeId: shape.shapeId,
      })
    );
  }

  isPointNearShape(
    x: number,
    y: number,
    shape: Shape | undefined,
    radius: number
  ) {
    if (!shape) return;

    if (shape.type === "Rect") {
      return (
        x >= shape.x - radius &&
        x <= shape.x + shape.width + radius &&
        y >= shape.y - radius &&
        y <= shape.y + shape.height + radius
      );
    }

    if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= shape.radius + radius;
    }

    if (shape.type === "pen") {
      // Check if point is near any segment
      for (let i = 0; i < shape.path.length - 1; i++) {
        const a = shape.path[i];
        const b = shape.path[i + 1];
        if (this.isPointNearLineSegment(x, y, a, b, radius)) {
          return true;
        }
      }
    }

    return false;
  }

  isPointNearLineSegment(
    x: number,
    y: number,
    a: { x: number; y: number } | undefined,
    b: { x: number; y: number } | undefined,
    threshold: number
  ) {
    if (!a) return;
    if (!b) return;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) return false;

    const t = ((x - a.x) * dx + (y - a.y) * dy) / lengthSq;
    const clampedT = Math.max(0, Math.min(1, t));
    const closestX = a.x + clampedT * dx;
    const closestY = a.y + clampedT * dy;

    const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
    return dist <= threshold;
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.isMouseClicked = true;
    const x = e.clientX;
    const y = e.clientY;

    if (this.selectedShape === "move") {
      const hit = this.hitTest(x, y);
      if (hit) {
        this.draggedShapeIndex = hit.index;

        if (hit.shape.type === "Rect") {
          this.offsetX = x - hit.shape.x;
          this.offsetY = y - hit.shape.y;
        }

        if (hit.shape.type === "circle") {
          this.offsetX = x - hit.shape.centerX;
          this.offsetY = y - hit.shape.centerY;
        }
      }
      return;
    }

    this.startX = x;
    this.startY = y;

    if (this.selectedShape === "pen") {
      this.penPath = [{ x, y }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isMouseClicked = false;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (this.selectedShape === "move" && this.draggedShapeIndex !== null) {
      const movedShape = this.existingShapes[this.draggedShapeIndex];
      this.draggedShapeIndex = null;
      if (!movedShape) return;

      this.socket.send(
        JSON.stringify({
          type: "move",
          message: JSON.stringify({
            shape: movedShape,
            senderId: this.clientId,
          }),
          roomId: this.roomId,
          shapeId: movedShape.shapeId,
        })
      );

      return;
    }

    if (this.selectedShape === "eraser") {
      this.eraseAtPoint(mouseX, mouseY);
      return;
    }

    const shapeId = crypto.randomUUID();
    const width = mouseX - this.startX;
    const height = mouseY - this.startY;
    let shape: Shape | null = null;

    if (this.selectedShape === "rect") {
      shape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
        shapeId,
      };
    }

    if (this.selectedShape === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;

      shape = {
        type: "circle",
        radius,
        centerX,
        centerY,
        shapeId,
      };
    }

    if (this.selectedShape === "pen" && this.penPath.length > 0) {
      shape = {
        type: "pen",
        path: [...this.penPath],
        shapeId,
      };
      this.penPath = [];
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    this.previewShape = null;
    this.clearCanvas();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape, senderId: this.clientId }),
        roomId: this.roomId,
        shapeId: shapeId,
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.isMouseClicked) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (this.selectedShape === "move" && this.draggedShapeIndex !== null) {
      const shape = this.existingShapes[this.draggedShapeIndex];

      if (!shape) return;

      if (shape.type === "Rect") {
        shape.x = mouseX - this.offsetX;
        shape.y = mouseY - this.offsetY;
      }

      if (shape.type === "circle") {
        shape.centerX = mouseX - this.offsetX;
        shape.centerY = mouseY - this.offsetY;
      }

      this.clearCanvas();
      return;
    }

    const width = mouseX - this.startX;
    const height = mouseY - this.startY;
    this.previewShape = null;

    if (this.selectedShape === "rect") {
      this.previewShape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    }

    if (this.selectedShape === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;

      this.previewShape = {
        type: "circle",
        radius,
        centerX,
        centerY,
      };
    }

    if (this.selectedShape === "pen") {
      this.penPath.push({ x: mouseX, y: mouseY });
      this.previewShape = {
        type: "pen",
        path: [...this.penPath],
      };
    }

    this.clearCanvas();
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
