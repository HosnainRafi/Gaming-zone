import type { Request, Response } from "express";
import { z } from "zod";

import {
  createOffer,
  deleteOffer,
  getAllOffers,
  updateOffer,
  validateOffer,
} from "../services/offer.service";
import { AppError } from "../utils/AppError";

const createSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED", "TIME_BASED"]),
  value: z.number().min(0),
  freeMinutes: z.number().int().min(1).optional(),
  expiry: z.string().datetime(),
});

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(["PERCENT", "FIXED", "TIME_BASED"]).optional(),
  value: z.number().min(0).optional(),
  freeMinutes: z.number().int().min(1).optional(),
  expiry: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

const validateSchema = z.object({
  code: z.string().min(1),
  baseAmount: z.number().positive(),
  durationMinutes: z.number().int().min(1).optional(),
  hourlyRate: z.number().positive().optional(),
});

export async function listOffers(_req: Request, res: Response): Promise<void> {
  const offers = await getAllOffers();
  res.json(offers);
}

export async function addOffer(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const data = createSchema.parse(req.body);
  const offer = await createOffer(
    {
      code: data.code,
      type: data.type,
      value: data.value,
      expiry: new Date(data.expiry),
      freeMinutes: data.freeMinutes ?? undefined,
    },
    req.user.userId,
  );
  res.status(201).json(offer);
}

export async function editOffer(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const data = updateSchema.parse(req.body);
  const patch: Parameters<typeof updateOffer>[1] = {};
  if (data.code !== undefined) patch.code = data.code;
  if (data.type !== undefined) patch.type = data.type;
  if (data.value !== undefined) patch.value = data.value;
  if (data.isActive !== undefined) patch.isActive = data.isActive;
  if (data.expiry !== undefined) patch.expiry = new Date(data.expiry);
  if (data.freeMinutes !== undefined) patch.freeMinutes = data.freeMinutes;
  const offer = await updateOffer(
    String(req.params["id"]),
    patch,
    req.user.userId,
  );
  res.json(offer);
}

export async function removeOffer(req: Request, res: Response): Promise<void> {
  await deleteOffer(String(req.params["id"]));
  res.status(204).send();
}

export async function checkOffer(req: Request, res: Response): Promise<void> {
  const { code, baseAmount, durationMinutes, hourlyRate } =
    validateSchema.parse(req.body);
  const result = await validateOffer(
    code,
    baseAmount,
    durationMinutes,
    hourlyRate,
  );
  res.json(result);
}
