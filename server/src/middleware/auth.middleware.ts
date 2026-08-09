import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1] || "";
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as any;
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }
    next();
  });
};

export const requireShopkeeper = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== "SHOPKEEPER" && req.user?.role !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: Shopkeeper access required" });
      return;
    }
    next();
  });
};
