import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";

const app = express();

app.post("/signup", (req: Request, res: Response) => {
  const data = CreateUserSchema.safeParse(req.body);
  if (!data) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  // db call
  res.json({
    userId: 192,
  });
});
app.post("/signin", (req: Request, res: Response) => {
  const data = SignInSchema.safeParse(req.body);
  if (!data) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  const userId = 1;
  const token = jwt.sign({ userId }, JWT_SECRET);

  // db call
  res.json({
    token,
  });
});

app.post("/room", (req: Request, res: Response) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data) {
    res.json({
      msg: "incorrent",
    });
    return;
  }

  // db call
  res.json({
    roomId: 12,
  });
});

app.listen(3000);
