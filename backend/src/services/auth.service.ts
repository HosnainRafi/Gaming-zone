import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { reconcileExpiredSessions } from "./session.service";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: "8h",
  });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = "STAFF",
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
}

export async function listStaff() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateUserByAdmin(
  id: string,
  data: {
    email?: string | undefined;
    password?: string | undefined;
    name?: string | undefined;
    role?: UserRole | undefined;
  },
) {
  await getUserById(id);

  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } },
      select: { id: true },
    });
    if (existing) throw new AppError("Email already in use", 409);
  }

  const updateData: Record<string, unknown> = {};
  if (data.email) updateData["email"] = data.email;
  if (data.name) updateData["name"] = data.name;
  if (data.role) updateData["role"] = data.role;
  if (data.password) {
    updateData["passwordHash"] = await bcrypt.hash(data.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return user;
}

export async function deleteUserByAdmin(id: string, actingUserId: string) {
  if (id === actingUserId) {
    throw new AppError(
      "Use account settings to manage your own admin account",
      400,
    );
  }

  await getUserById(id);
  await reconcileExpiredSessions();

  const activeSessions = await prisma.session.count({
    where: { staffId: id, status: "ACTIVE" },
  });
  if (activeSessions > 0) {
    throw new AppError("Cannot delete a user with active sessions", 400);
  }

  await prisma.user.delete({ where: { id } });
}

export async function updateOwnAccount(
  id: string,
  data: {
    email?: string | undefined;
    password?: string | undefined;
    name?: string | undefined;
  },
) {
  return updateUserByAdmin(id, data);
}
