import { Router } from "express";

import {
  createMembership,
  createPlan,
  editPlan,
  listMembers,
  listPlans,
  lookupMember,
  removePlan,
} from "../controllers/membership.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const membershipRouter = Router();

membershipRouter.get("/plans", authenticate, listPlans);
membershipRouter.post("/plans", authenticate, requireAdmin, createPlan);
membershipRouter.put("/plans/:id", authenticate, requireAdmin, editPlan);
membershipRouter.delete("/plans/:id", authenticate, requireAdmin, removePlan);
membershipRouter.get("/", authenticate, listMembers);
membershipRouter.get("/lookup/:phone", authenticate, lookupMember);
membershipRouter.post("/purchase", authenticate, createMembership);
