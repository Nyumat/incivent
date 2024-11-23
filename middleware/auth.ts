import { verifyToken } from "@/util/jwt";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token missing or invalid." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.token = token;
    req.auth = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
