import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prismaClient } from "@repo/db/client";

import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";

const app = express();

app.post("/signup", async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: parsedData.data?.password, // TODO: has the password
        name: parsedData.data?.name,
      },
    });

    // db call
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({
      msg: e,
    });
  }
});
app.post("/signin", async (req: Request, res: Response) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  // TODO: compare the hashed pws here
  const user = await prismaClient.user.findUser({
    where: {
      email: parsedData.data?.username,
      password: parsedData.data?.password,
    },
  });

  if (!user) {
    res.status(403).json({
      msg: "Not authorized",
    });
    return;
  }

  const token = jwt.sign({ userId: user?.id }, JWT_SECRET);

  // db call
  res.json({
    token,
  });
});

app.post("/room", async (req: Request, res: Response) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data?.name,
        adminId: "User-id-after-auth",
      },
    });

    // db call
    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(400).json({
      msg: e,
    });
  }
});

app.get(
  "/chats/:roomId",
  async (req: Request, res: Response, next: NextFunction) => {
    const roomId = Number(req.params.roomid);
    const message = await prismaClient.chat.findMany({
      where: {
        id: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });

    res.json({
      message,
    });
  }
);

app.listen(3000);
