import React, { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import { Game } from "../draw/Game";

const Canvas = ({ roomId, socket }: { roomId: string; socket: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<"rect" | "circle">("circle");

  useEffect(() => {
    game?.setShape(selectedTool);
  }, [selectedTool, game]);

  // this logic should not be inside in component, some sort of game.ts file
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const g = new Game(canvas, roomId, socket);

      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  return (
    <canvas ref={canvasRef} width={innerWidth} height={innerHeight}></canvas>
  );
};

export default Canvas;
