import { Router } from "express";

import {
  getMe,
  getStaff,
  login,
  register,
} from "../controllers/auth.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", authenticate, requireAdmin, register);
authRouter.get("/me", authenticate, getMe);
authRouter.get("/staff", authenticate, requireAdmin, getStaff);
