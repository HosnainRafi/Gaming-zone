import type { Request, Response } from "express";
import { z } from "zod";

import { listStaff, loginUser, registerUser } from "../services/auth.service";
import { AppError } from "../utils/AppError";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const result = await loginUser(email, password);
  res.json(result);
}

export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);
  const user = await registerUser(
    data.email,
    data.password,
    data.name,
    data.role,
  );
  res.status(201).json(user);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  res.json(req.user);
}

export async function getStaff(_req: Request, res: Response): Promise<void> {
  const staff = await listStaff();
  res.json(staff);
}
