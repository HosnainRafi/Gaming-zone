import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        issues: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }

  const status = typeof err?.status === "number" ? err.status : 500;

  const message =
    status >= 500
      ? "Internal Server Error"
      : typeof err?.message === "string"
        ? err.message
        : "Request failed";

  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({
    error: { message },
  });
};
