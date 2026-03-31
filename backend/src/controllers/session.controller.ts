import type { Request, Response } from "express";
import { z } from "zod";

import {
  deleteSession,
  getActiveSessions,
  getSessionById,
  getSessions,
  startSession,
} from "../services/session.service";
import { AppError } from "../utils/AppError";

const startSchema = z.object({
  deviceId: z.string().min(1),
  durationMinutes: z.number().int().min(30),
  paymentMethod: z.enum(["CASH", "CARD", "MOBILE_WALLET", "OTHER"]),
  offerCode: z.string().optional(),
  customerName: z.string().max(100).optional(),
  cashPaid: z.number().min(0).optional(),
});

export async function createSession(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const data = startSchema.parse(req.body);
  const session = await startSession(
    data.deviceId,
    req.user.userId,
    data.durationMinutes,
    data.paymentMethod,
    data.offerCode,
    data.customerName,
    data.cashPaid,
  );
  res.status(201).json(session);
}

export async function listActiveSessions(
  _req: Request,
  res: Response,
): Promise<void> {
  const sessions = await getActiveSessions();
  res.json(sessions);
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await getSessionById(String(req.params["id"]));
  res.json(session);
}

export async function listSessions(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const filters = {
    ...(typeof q["status"] === "string" && { status: q["status"] }),
    ...(typeof q["deviceId"] === "string" && { deviceId: q["deviceId"] }),
    ...(typeof q["staffId"] === "string" && { staffId: q["staffId"] }),
    ...(typeof q["from"] === "string" && { from: q["from"] }),
    ...(typeof q["to"] === "string" && { to: q["to"] }),
    ...(q["page"] && { page: Number(q["page"]) }),
    ...(q["limit"] && { limit: Number(q["limit"]) }),
  };
  const result = await getSessions(filters);
  res.json(result);
}

export async function removeSession(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  await deleteSession(String(req.params["id"]));
  res.status(204).send();
}
