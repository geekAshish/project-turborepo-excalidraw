import React, { useEffect, useRef, useState } from "react";

import { Game } from "../draw/Game";
import Topbar from "./TopBar";
import { Tool } from "../modules/interface/shape";

const Canvas = ({ roomId, socket }: { roomId: string; socket: WebSocket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

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
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} width={innerWidth} height={innerHeight}></canvas>
      <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
};

export default Canvas;
