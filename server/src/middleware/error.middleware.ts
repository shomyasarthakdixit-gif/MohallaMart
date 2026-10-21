import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack || err);

  // If it's a Zod validation error
  if (err instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues,
    });
    return;
  }

  // Hide stack trace in production
  const isProduction = env.NODE_ENV === "production";

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? "Internal Server Error" : message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
