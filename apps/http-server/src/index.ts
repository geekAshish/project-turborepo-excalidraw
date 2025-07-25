import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { prismaClient } from "@repo/db/client";

import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";
import multer from "multer";
import { middleware } from "./middleware/middleware";

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());

app.post(
  "/signup",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    const parsed = CreateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        issues: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, name } = parsed.data;

    try {
      // Checking for existing user
      const existingUser = await prismaClient.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          error: "User already exists with this email",
        });
        return;
      }

      // Hashing password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prismaClient.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          photo: "",
        },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
      return;
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

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
      email: parsedData.data?.email,
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
  middleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number(req.params.roomId);
      if (!roomId) {
        res.status(400).json({ message: "invalid room id" });
      }
      const messages = await prismaClient.chat.findMany({
        where: {
          roomId: roomId,
        },
        orderBy: {
          id: "desc",
        },
      });

      res.json({
        messages,
      });
    } catch (e) {
      res.status(500).json({
        message: "something went wrong",
      });
    }
  }
);

app.get(
  "/room/:slug",
  middleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    if (!slug) {
      res.status(400).json({ msg: "invalid room id" });
      return;
    }

    const room = await prismaClient.room.findFirst({
      where: {
        id: +slug,
      },
    });

    res.status(200).json({
      room,
    });
  }
);

app.listen(3020);
