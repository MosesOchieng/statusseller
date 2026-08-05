import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Token expired or invalid" });
  }
}

export function requireBusiness(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user?.businessId) {
      res.status(403).json({ error: "Business profile required" });
      return;
    }
    next();
  });
}
