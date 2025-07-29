import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { WebSocket, WebSocketServer } from "ws";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

const checkUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
};

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParmas = new URLSearchParams(url.split("?")[1]);
  const token = queryParmas.get("token") || "";

  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws: ws,
  });

  ws.on("error", console.error);

  // here because we know the data which coming gonna be string
  ws.on("message", async function message(data) {
    let parsedData;

    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      // TODO: check if roomid exist, in db
      // TODO: check if user has access of this room
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) return;

      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData?.roomId;
      const message = parsedData?.message || "";
      const shapeId = parsedData?.shapeId || null;

      // NOT A GOOD WAY
      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId,
          shapeId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
              shapeId,
            })
          );
        }
      });
    }

    if (parsedData.type === "erase") {
      const { shapeId, roomId } = parsedData;

      await prismaClient.chat.deleteMany({
        where: {
          roomId: Number(roomId),
          shapeId: parsedData.shapeId,
        },
      });

      // Broadcast erase to others
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "erase",
              shapeId,
              roomId,
            })
          );
        }
      });
    }
  });
});
