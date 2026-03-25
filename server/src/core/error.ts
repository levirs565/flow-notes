import express from "express";
import * as z from "zod";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function appErrorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: z.prettifyError(err),
    });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({
      message: err.message,
    });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({
      message: err.message,
    });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({
      message: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: "Internal server error",
  });
}
