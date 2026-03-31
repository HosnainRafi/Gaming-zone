import { Router } from "express";

import {
  deviceReport,
  salesReport,
  sessionsReport,
  staffReport,
} from "../controllers/report.controller";
import { authenticate } from "../middlewares/auth";

export const reportRouter = Router();

reportRouter.get("/sales", authenticate, salesReport);
reportRouter.get("/sessions", authenticate, sessionsReport);
reportRouter.get("/staff", authenticate, staffReport);
reportRouter.get("/devices", authenticate, deviceReport);
