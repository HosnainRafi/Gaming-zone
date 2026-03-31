import { Router } from "express";

import {
  createSession,
  getSession,
  listActiveSessions,
  listSessions,
  removeSession,
} from "../controllers/session.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const sessionRouter = Router();

sessionRouter.get("/", authenticate, listSessions);
sessionRouter.get("/active", authenticate, listActiveSessions);
sessionRouter.get("/:id", authenticate, getSession);
sessionRouter.post("/start", authenticate, createSession);
sessionRouter.delete("/:id", authenticate, requireAdmin, removeSession);
