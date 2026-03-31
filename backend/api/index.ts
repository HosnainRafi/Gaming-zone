import "dotenv/config";
import "express-async-errors";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "../src/config/env";
import { errorHandler } from "../src/middlewares/errorHandler";
import { apiRouter } from "../src/routes";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;
