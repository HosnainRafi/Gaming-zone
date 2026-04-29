import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

export const settingsRouter = Router();

// Public route - get public-facing settings
settingsRouter.get("/public", settingsController.getPublicSettings);

// Protected routes (admin only)
settingsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  settingsController.getAllSettings,
);
settingsRouter.patch(
  "/",
  requireAuth,
  requireAdmin,
  settingsController.updateSettings,
);
