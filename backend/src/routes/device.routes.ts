import { Router } from "express";

import {
  addDevice,
  editDevice,
  getDevice,
  listDevices,
  removeDevice,
} from "../controllers/device.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const deviceRouter = Router();

deviceRouter.get("/", authenticate, listDevices);
deviceRouter.get("/:id", authenticate, getDevice);
deviceRouter.post("/", authenticate, requireAdmin, addDevice);
deviceRouter.put("/:id", authenticate, requireAdmin, editDevice);
deviceRouter.delete("/:id", authenticate, requireAdmin, removeDevice);
