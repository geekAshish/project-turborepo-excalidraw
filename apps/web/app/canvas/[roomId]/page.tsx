"use client";
// 1:11:50

import React, { useEffect, useRef } from "react";
const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.fillStyle = "rgba(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        console.log(e.clientX);
        console.log(e.clientY);
      });

      canvas.addEventListener("mousemove", (e) => {
        if (isMouseClicked) {
          const width = e.clientX - startX;
          const height = e.clientY - startY;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(225, 225, 225)";
          ctx.strokeRect(startX, startY, width, height);
        }
      });
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Canvas;
