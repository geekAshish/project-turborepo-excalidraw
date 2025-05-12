import express, { Request, Response } from "express";
import { CreateUserSchema } from "@repo/common/types";

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

app.listen(3000);
