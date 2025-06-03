import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prismaClient } from "@repo/db/client";

import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";
import { middleware } from "./middleware";

const app = express();
app.use(express.json());
app.use(cors());

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
        email: parsedData.data?.username || "",
        password: parsedData.data?.password || "", // TODO: has the password
        name: parsedData.data?.name || "",
        photo: "",
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
  const user = await prismaClient.user.findFirst({
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

app.post("/room", middleware, async (req: Request, res: Response) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  // @ts-ignore: TODO: Fix this
  const userId = req.userId;

  console.log(userId, parsedData.data?.name, req.body);

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data?.name || "",
        adminId: userId,
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
  // middleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (e) {
      res.status(500).json({
        message: [],
      });
    }
  }
);

app.get(
  "/room/:slug",
  // middleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
      where: {
        slug,
      },
    });

    res.json({
      room,
    });
  }
);

app.listen(3020);
