import type { Request, Response } from "express";
import { z } from "zod";

import {
  deleteUserByAdmin,
  getUserById,
  listStaff,
  loginUser,
  registerUser,
  updateOwnAccount,
  updateUserByAdmin,
} from "../services/auth.service";
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

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

const updateMeSchema = updateUserSchema.omit({ role: true });

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
  const user = await getUserById(req.user.userId);
  res.json(user);
}

export async function getStaff(_req: Request, res: Response): Promise<void> {
  const staff = await listStaff();
  res.json(staff);
}

export async function updateStaff(req: Request, res: Response): Promise<void> {
  const data = updateUserSchema.parse(req.body);
  const user = await updateUserByAdmin(String(req.params["id"]), data);
  res.json(user);
}

export async function removeStaff(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  await deleteUserByAdmin(String(req.params["id"]), req.user.userId);
  res.status(204).send();
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const data = updateMeSchema.parse(req.body);
  const user = await updateOwnAccount(req.user.userId, data);
  res.json(user);
}
