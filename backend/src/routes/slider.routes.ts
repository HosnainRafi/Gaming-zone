import { Router } from "express";
import * as sliderController from "../controllers/slider.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

export const sliderRouter = Router();

// Public routes
sliderRouter.get("/", sliderController.listSliderImages);

// Protected routes (admin only)
sliderRouter.get(
  "/admin",
  requireAuth,
  requireAdmin,
  sliderController.listSliderImagesAdmin,
);
sliderRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  sliderController.createSliderImage,
);
sliderRouter.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  sliderController.getSliderImage,
);
sliderRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  sliderController.updateSliderImage,
);
sliderRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  sliderController.deleteSliderImage,
);
