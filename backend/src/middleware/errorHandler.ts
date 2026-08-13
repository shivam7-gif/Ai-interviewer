import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  logger.error({
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
  }, "API Error occurred");

  const message =
    env.NODE_ENV === "production" && statusCode === 500 && !isOperational
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof AppError && err.details ? { details: err.details } : {}),
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}
