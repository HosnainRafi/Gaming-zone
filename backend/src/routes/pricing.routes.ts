import { Router } from "express";
import * as pricingController from "../controllers/pricing.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

export const pricingRouter = Router();

// Public routes
pricingRouter.get("/", pricingController.listPricingTiers);

// Protected routes (admin only)
pricingRouter.get(
  "/admin",
  requireAuth,
  requireAdmin,
  pricingController.listPricingTiersAdmin,
);
pricingRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  pricingController.createPricingTier,
);
pricingRouter.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  pricingController.getPricingTier,
);
pricingRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  pricingController.updatePricingTier,
);
pricingRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  pricingController.deletePricingTier,
);
