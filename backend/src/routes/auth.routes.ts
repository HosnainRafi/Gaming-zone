import { Router } from "express";

import {
  getMe,
  getStaff,
  login,
  register,
  removeStaff,
  updateMe,
  updateStaff,
} from "../controllers/auth.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", authenticate, requireAdmin, register);
authRouter.get("/me", authenticate, getMe);
authRouter.put("/me", authenticate, updateMe);
authRouter.get("/staff", authenticate, requireAdmin, getStaff);
authRouter.put("/staff/:id", authenticate, requireAdmin, updateStaff);
authRouter.delete("/staff/:id", authenticate, requireAdmin, removeStaff);
