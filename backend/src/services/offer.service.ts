import type { OfferType } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export async function getAllOffers() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
    },
  });
  return offers.map((o) => ({ ...o, value: Number(o.value) }));
}

export async function createOffer(
  data: {
    code: string;
    type: OfferType;
    value: number;
    expiry: Date;
    freeMinutes?: number | undefined;
  },
  userId: string,
) {
  const existing = await prisma.offer.findUnique({
    where: { code: data.code },
  });
  if (existing) throw new AppError("Offer code already exists", 409);
  if (data.type === "TIME_BASED" && (!data.freeMinutes || data.freeMinutes < 1))
    throw new AppError("freeMinutes is required for TIME_BASED offers", 400);
  const offer = await prisma.offer.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      expiry: data.expiry,
      freeMinutes:
        data.type === "TIME_BASED" ? (data.freeMinutes ?? null) : null,
      createdById: userId,
      updatedById: userId,
    },
  });
  return { ...offer, value: Number(offer.value) };
}

export async function updateOffer(
  id: string,
  data: Partial<{
    code: string;
    type: OfferType;
    value: number;
    expiry: Date;
    isActive: boolean;
    freeMinutes: number;
  }>,
  userId: string,
) {
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) throw new AppError("Offer not found", 404);
  const updateData: Record<string, unknown> = { ...data, updatedById: userId };
  if (data.type === "TIME_BASED" && !data.freeMinutes && !offer.freeMinutes)
    throw new AppError("freeMinutes is required for TIME_BASED offers", 400);
  if (data.type && data.type !== "TIME_BASED") updateData["freeMinutes"] = null;
  const updated = await prisma.offer.update({
    where: { id },
    data: updateData,
  });
  return { ...updated, value: Number(updated.value) };
}

export async function deleteOffer(id: string) {
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) throw new AppError("Offer not found", 404);
  return prisma.offer.delete({ where: { id } });
}

export async function validateOffer(
  code: string,
  baseAmount: number,
  durationMinutes?: number,
  hourlyRate?: number,
) {
  const offer = await prisma.offer.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!offer) throw new AppError("Invalid offer code", 400);
  if (!offer.isActive) throw new AppError("Offer is inactive", 400);
  if (offer.expiry < new Date()) throw new AppError("Offer has expired", 400);

  let discount = 0;
  const val = Number(offer.value);
  if (offer.type === "PERCENT") {
    discount = baseAmount * (val / 100);
  } else if (offer.type === "FIXED") {
    discount = val;
  } else if (offer.type === "TIME_BASED") {
    // TIME_BASED: first N minutes are free
    const free = offer.freeMinutes ?? 0;
    if (free > 0 && durationMinutes && hourlyRate) {
      const freeMin = Math.min(free, durationMinutes);
      discount = (hourlyRate / 60) * freeMin;
    }
  }
  discount = Math.min(discount, baseAmount);

  return {
    code: offer.code,
    type: offer.type,
    value: val,
    freeMinutes: offer.freeMinutes,
    discount,
    finalAmount: baseAmount - discount,
  };
}
