import "express-async-errors";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "../src/middlewares/errorHandler";
import { apiRouter } from "../src/routes";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check (no DB needed)
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
  });
});

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;
