import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export const useSocket = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTk4MWQxMy01N2FhLTQ4YWYtYTUwZi0zNjA4YjBlODMzMTYiLCJpYXQiOjE3NDg5NjgyMzN9.vkjfueiY1KYXc_AMC8G2rUSvwe_ugM8zLw2_ob4CXbc"`
    );
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
  }, []);

  return {
    socket,
    loading,
  };
};
