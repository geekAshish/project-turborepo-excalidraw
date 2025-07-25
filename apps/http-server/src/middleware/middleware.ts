import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")?.[1] ?? "";

  const decoded = jwt.verify(token, JWT_SECRET);

  console.log("decoded jwt", decoded);

  if (decoded) {
    // @ts-ignore: TODO: Fix this
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
