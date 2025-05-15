import React, { useEffect, useRef } from "react";
import { initDraw } from "../draw";

const Canvas = ({ roomId, socket }: { roomId: string; socket: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // this logic should not be inside in component, some sort of game.ts file
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      initDraw({ ctx, canvas, roomId, socket });
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Canvas;
