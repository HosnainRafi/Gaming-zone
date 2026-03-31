import type { PaymentMethod } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

const MIN_DURATION = 30;

function serializeSession(session: Record<string, unknown>) {
  return {
    ...session,
    totalAmount: Number((session as { totalAmount: unknown }).totalAmount),
  };
}

export async function startSession(
  deviceId: string,
  staffId: string,
  durationMinutes: number,
  paymentMethod: PaymentMethod,
  offerCode?: string,
  customerName?: string,
  cashPaid?: number,
) {
  if (durationMinutes < MIN_DURATION) {
    throw new AppError(
      `Minimum session duration is ${MIN_DURATION} minutes`,
      400,
    );
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new AppError("Device not found", 404);
  if (device.status !== "AVAILABLE") {
    throw new AppError(
      `Device is ${device.status.toLowerCase().replace("_", " ")}, not available`,
      400,
    );
  }

  const hourlyRate = Number(device.hourlyRate);
  const basePrice = (hourlyRate / 60) * durationMinutes;

  let discount = 0;
  if (offerCode) {
    const offer = await prisma.offer.findUnique({
      where: { code: offerCode.toUpperCase() },
    });
    if (!offer) throw new AppError("Invalid offer code", 400);
    if (!offer.isActive) throw new AppError("Offer is not active", 400);
    if (offer.expiry < new Date()) throw new AppError("Offer has expired", 400);
    if (offer.type === "PERCENT") {
      discount = basePrice * (Number(offer.value) / 100);
    } else if (offer.type === "FIXED") {
      discount = Number(offer.value);
    } else if (offer.type === "TIME_BASED") {
      const free = offer.freeMinutes ?? 0;
      if (free > 0) {
        const freeMin = Math.min(free, durationMinutes);
        discount = (hourlyRate / 60) * freeMin;
      }
    }
    discount = Math.min(discount, basePrice);
  }

  const totalAmount = Math.max(0, basePrice - discount);

  // Use server time only — never trust client time
  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.create({
      data: {
        deviceId,
        staffId,
        customerName: customerName?.trim() || null,
        startTime: now,
        endTime,
        durationMinutes,
        totalAmount,
        status: "ACTIVE",
      },
    });
    await tx.transaction.create({
      data: {
        sessionId: session.id,
        amount: totalAmount,
        discount,
        cashPaid: cashPaid ?? totalAmount,
        paymentMethod,
      },
    });
    await tx.device.update({
      where: { id: deviceId },
      data: { status: "RUNNING" },
    });
    return session;
  });

  const full = await prisma.session.findUnique({
    where: { id: result.id },
    include: {
      device: true,
      staff: { select: { id: true, name: true, role: true } },
      transaction: true,
    },
  });

  return full
    ? {
        ...full,
        totalAmount: Number(full.totalAmount),
        device: { ...full.device, hourlyRate: Number(full.device.hourlyRate) },
        transaction: full.transaction
          ? {
              ...full.transaction,
              amount: Number(full.transaction.amount),
              discount: Number(full.transaction.discount),
              cashPaid: Number(full.transaction.cashPaid),
            }
          : null,
      }
    : null;
}

export async function getActiveSessions() {
  const sessions = await prisma.session.findMany({
    where: { status: "ACTIVE" },
    include: {
      device: true,
      staff: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });
  return sessions.map((s) => ({
    ...s,
    totalAmount: Number(s.totalAmount),
    device: { ...s.device, hourlyRate: Number(s.device.hourlyRate) },
  }));
}

export async function getSessionById(id: string) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      device: true,
      staff: { select: { id: true, name: true, role: true } },
      transaction: true,
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return {
    ...session,
    totalAmount: Number(session.totalAmount),
    device: {
      ...session.device,
      hourlyRate: Number(session.device.hourlyRate),
    },
    transaction: session.transaction
      ? {
          ...session.transaction,
          amount: Number(session.transaction.amount),
          discount: Number(session.transaction.discount),
          cashPaid: Number(session.transaction.cashPaid),
        }
      : null,
  };
}

export async function getSessions(filters: {
  status?: string;
  deviceId?: string;
  staffId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { status, deviceId, staffId, from, to } = filters;
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where["status"] = status;
  if (deviceId) where["deviceId"] = deviceId;
  if (staffId) where["staffId"] = staffId;
  if (from ?? to) {
    const startTime: Record<string, Date> = {};
    if (from) startTime["gte"] = new Date(from);
    if (to) startTime["lte"] = new Date(to);
    where["startTime"] = startTime;
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      include: {
        device: true,
        staff: { select: { id: true, name: true } },
        transaction: true,
      },
      orderBy: { startTime: "desc" },
      skip,
      take: limit,
    }),
    prisma.session.count({ where }),
  ]);

  return {
    sessions: sessions.map((s) => ({
      ...s,
      totalAmount: Number(s.totalAmount),
      device: { ...s.device, hourlyRate: Number(s.device.hourlyRate) },
      transaction: s.transaction
        ? {
            ...s.transaction,
            amount: Number(s.transaction.amount),
            discount: Number(s.transaction.discount),
            cashPaid: Number(s.transaction.cashPaid),
          }
        : null,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Called by the background job every ~15 seconds.
 * Returns the IDs of sessions that were auto-ended.
 */
export async function autoEndExpiredSessions(): Promise<
  { sessionId: string; deviceId: string }[]
> {
  const now = new Date();
  const expired = await prisma.session.findMany({
    where: { status: "ACTIVE", endTime: { lte: now } },
    select: { id: true, deviceId: true },
  });

  if (expired.length === 0) return [];

  await prisma.$transaction(async (tx) => {
    for (const s of expired) {
      await tx.session.update({
        where: { id: s.id },
        data: { status: "COMPLETED" },
      });
      await tx.device.update({
        where: { id: s.deviceId },
        data: { status: "AVAILABLE" },
      });
    }
  });

  return expired.map((s) => ({ sessionId: s.id, deviceId: s.deviceId }));
}

/**
 * Admin-only: delete a session (e.g. customer left early without receipt).
 * Also deletes linked transaction and frees the device.
 */
export async function deleteSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { transaction: true },
  });
  if (!session) throw new AppError("Session not found", 404);

  await prisma.$transaction(async (tx) => {
    // Delete transaction first (FK constraint)
    if (session.transaction) {
      await tx.transaction.delete({ where: { id: session.transaction.id } });
    }
    await tx.session.delete({ where: { id: sessionId } });
    // Free the device if it was running this session
    if (session.status === "ACTIVE") {
      await tx.device.update({
        where: { id: session.deviceId },
        data: { status: "AVAILABLE" },
      });
    }
  });
}

// suppress unused import warning
void serializeSession;
