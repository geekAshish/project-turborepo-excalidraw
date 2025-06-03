"use client";

import React, { useEffect, useState } from "react";
import { WS_URL } from "../app/config";
import Canvas from "./Canvas";

const RoomCanvas = ({ roomId }: { roomId: string }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTk4MWQxMy01N2FhLTQ4YWYtYTUwZi0zNjA4YjBlODMzMTYiLCJpYXQiOjE3NDg5NjgyMzN9.vkjfueiY1KYXc_AMC8G2rUSvwe_ugM8zLw2_ob4CXbc`
    );

    ws.onopen = () => {
      setSocket(ws);

      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };
  }, []);

  if (!socket) {
    return <div>Loading socket....</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
};

export default RoomCanvas;
