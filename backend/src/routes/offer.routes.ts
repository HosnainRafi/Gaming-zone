import { Router } from "express";

import {
  addOffer,
  checkOffer,
  editOffer,
  listOffers,
  removeOffer,
} from "../controllers/offer.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const offerRouter = Router();

offerRouter.get("/", authenticate, listOffers);
offerRouter.post("/validate", authenticate, checkOffer);
offerRouter.post("/", authenticate, requireAdmin, addOffer);
offerRouter.put("/:id", authenticate, requireAdmin, editOffer);
offerRouter.delete("/:id", authenticate, requireAdmin, removeOffer);
