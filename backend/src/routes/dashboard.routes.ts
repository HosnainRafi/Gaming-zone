import { Router } from "express";

import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, getDashboard);
