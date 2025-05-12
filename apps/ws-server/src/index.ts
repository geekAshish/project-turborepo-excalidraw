import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParmas = new URLSearchParams(url.split("?")[1]);
  const token = queryParmas.get("token") || "";
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string") {
    ws.close();
    return;
  }

  if (!decoded || !decoded.userId) {
    ws.close();
    return;
  }

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    ws.send("pong");
  });
});
