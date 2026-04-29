import type { PaymentMethod, Prisma, SessionPricingType } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import {
  findCustomerMembershipSnapshot,
  normalizePhone,
  upsertCustomerProfile,
} from "./customer.service";

const MIN_DURATION = 30;
const FIRST_FREE_MINUTES = 30;

function isConsole(type: string) {
  const normalizedType = type.toUpperCase();
  return normalizedType.includes("PS4") || normalizedType.includes("PS5");
}

function getExtraPlayerHourlyRate(type: string) {
  const normalizedType = type.toUpperCase();
  if (normalizedType.includes("PS4")) return 50;
  if (normalizedType.includes("PS5")) return 60;
  return 0;
}

function validatePlayerCount(type: string, playerCount: number) {
  if (isConsole(type)) {
    if (playerCount > 4) {
      throw new AppError("PS4 and PS5 sessions support up to 4 players", 400);
    }
    return;
  }

  if (playerCount !== 1) {
    throw new AppError("Only PS4 and PS5 support multiple players", 400);
  }
}

function serializeTransaction<
  T extends { amount: unknown; discount: unknown; cashPaid: unknown },
>(transaction: T) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    discount: Number(transaction.discount),
    cashPaid: Number(transaction.cashPaid),
  };
}

function serializeSessionRecord<
  T extends {
    totalAmount: unknown;
    baseAmount: unknown;
    appliedDiscount: unknown;
    device?: { hourlyRate: unknown };
    transaction?: {
      amount: unknown;
      discount: unknown;
      cashPaid: unknown;
    } | null;
  },
>(session: T) {
  return {
    ...session,
    totalAmount: Number(session.totalAmount),
    baseAmount: Number(session.baseAmount),
    appliedDiscount: Number(session.appliedDiscount),
    device: session.device
      ? { ...session.device, hourlyRate: Number(session.device.hourlyRate) }
      : session.device,
    transaction: session.transaction
      ? serializeTransaction(session.transaction)
      : null,
  };
}

async function applyOfferDiscount(
  offerCode: string | undefined,
  baseAmount: number,
  durationMinutes: number,
  hourlyRate: number,
) {
  if (!offerCode)
    return { discount: 0, appliedOfferCode: null as string | null };

  const offer = await prisma.offer.findUnique({
    where: { code: offerCode.toUpperCase() },
  });
  if (!offer) throw new AppError("Invalid offer code", 400);
  if (!offer.isActive) throw new AppError("Offer is not active", 400);
  if (offer.expiry < new Date()) throw new AppError("Offer has expired", 400);

  let discount = 0;
  if (offer.type === "PERCENT") {
    discount = baseAmount * (Number(offer.value) / 100);
  } else if (offer.type === "FIXED") {
    discount = Number(offer.value);
  } else {
    const freeMinutes = Math.min(offer.freeMinutes ?? 0, durationMinutes);
    discount = (hourlyRate / 60) * freeMinutes;
  }

  return {
    discount: Math.min(discount, baseAmount),
    appliedOfferCode: offer.code,
  };
}

function serializeSession(session: Record<string, unknown>) {
  return {
    ...session,
    totalAmount: Number((session as { totalAmount: unknown }).totalAmount),
  };
}

export async function reconcileExpiredSessions(
  now = new Date(),
): Promise<{ sessionId: string; deviceId: string }[]> {
  const expired = await prisma.session.findMany({
    where: { status: "ACTIVE", endTime: { lte: now } },
    select: { id: true, deviceId: true, membershipId: true },
  });

  if (expired.length === 0) return [];

  const sessionIds = expired.map((session) => session.id);
  const deviceIds = Array.from(new Set(expired.map((session) => session.deviceId)));
  const membershipIds = Array.from(
    new Set(
      expired
        .map((session) => session.membershipId)
        .filter((membershipId): membershipId is string => Boolean(membershipId)),
    ),
  );

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.session.updateMany({
      where: { id: { in: sessionIds }, status: "ACTIVE" },
      data: { status: "COMPLETED" },
    });

    await tx.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { status: "AVAILABLE" },
    });

    if (membershipIds.length > 0) {
      await tx.membership.updateMany({
        where: {
          id: { in: membershipIds },
          remainingMinutes: { lte: 0 },
        },
        data: { isActive: false },
      });
    }
  });

  return expired.map((session) => ({
    sessionId: session.id,
    deviceId: session.deviceId,
  }));
}

export async function startSession(
  deviceId: string,
  staffId: string,
  durationMinutes: number,
  pricingType: SessionPricingType,
  paymentMethod: PaymentMethod,
  offerCode?: string,
  customerName?: string,
  customerPhone?: string,
  playerCount = 1,
  cashPaid?: number,
) {
  if (durationMinutes < MIN_DURATION) {
    throw new AppError(
      `Minimum session duration is ${MIN_DURATION} minutes`,
      400,
    );
  }

  await reconcileExpiredSessions();

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new AppError("Device not found", 404);
  if (device.status !== "AVAILABLE") {
    throw new AppError(
      `Device is ${device.status.toLowerCase().replace("_", " ")}, not available`,
      400,
    );
  }

  if (!customerName?.trim()) {
    throw new AppError("Customer name is required", 400);
  }

  validatePlayerCount(device.type, playerCount);

  const shouldTrackCustomer = Boolean(customerPhone?.trim());
  const normalizedPhone = shouldTrackCustomer
    ? normalizePhone(customerPhone as string)
    : null;
  const customer = shouldTrackCustomer
    ? await upsertCustomerProfile(customerName, customerPhone as string)
    : null;

  const extraPlayerHourlyRate =
    isConsole(device.type) && playerCount > 2
      ? getExtraPlayerHourlyRate(device.type) * (playerCount - 2)
      : 0;
  const effectiveHourlyRate = Number(device.hourlyRate) + extraPlayerHourlyRate;
  const basePrice = (effectiveHourlyRate / 60) * durationMinutes;

  let discount = 0;
  let appliedOfferCode: string | null = null;

  let membershipId: string | null = null;

  if (pricingType === "MEMBERSHIP") {
    if (!normalizedPhone) {
      throw new AppError("Phone number is required to use membership", 400);
    }
    const membershipSnapshot =
      await findCustomerMembershipSnapshot(normalizedPhone);
    const activeMembership = membershipSnapshot?.activeMembership;

    if (!activeMembership || activeMembership.expiresAt <= new Date()) {
      throw new AppError("No active membership found for this customer", 400);
    }
    if (activeMembership.remainingMinutes < durationMinutes) {
      throw new AppError("Membership does not have enough remaining time", 400);
    }

    membershipId = activeMembership.id;
    discount = basePrice;
    appliedOfferCode = activeMembership.planName ?? activeMembership.planType;
  } else {
    if (pricingType === "FIRST_TIME_FREE") {
      if (!normalizedPhone || !customer) {
        throw new AppError(
          "Phone number is required for first-time free play",
          400,
        );
      }
      if (customer.hasClaimedFirstFree) {
        throw new AppError(
          "This customer has already used the first-time free play",
          400,
        );
      }
      discount +=
        (effectiveHourlyRate / 60) *
        Math.min(FIRST_FREE_MINUTES, durationMinutes);
    }

    const offerDiscount = await applyOfferDiscount(
      offerCode,
      Math.max(0, basePrice - discount),
      durationMinutes,
      effectiveHourlyRate,
    );

    discount += offerDiscount.discount;
    appliedOfferCode = offerDiscount.appliedOfferCode;
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
        customerId: customer?.id ?? null,
        membershipId,
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        startTime: now,
        endTime,
        durationMinutes,
        playerCount,
        pricingType,
        baseAmount: basePrice,
        appliedDiscount: Math.min(discount, basePrice),
        totalAmount,
        appliedOfferCode,
        status: "ACTIVE",
      },
    });

    if (pricingType === "MEMBERSHIP" && membershipId) {
      await tx.membership.update({
        where: { id: membershipId },
        data: {
          remainingMinutes: {
            decrement: durationMinutes,
          },
        },
      });
    }

    if (pricingType === "FIRST_TIME_FREE") {
      await tx.customer.update({
        where: { id: customer!.id },
        data: { hasClaimedFirstFree: true },
      });
    }

    if (totalAmount > 0) {
      await tx.transaction.create({
        data: {
          sessionId: session.id,
          amount: totalAmount,
          discount: Math.min(discount, basePrice),
          cashPaid: cashPaid ?? totalAmount,
          paymentMethod,
        },
      });
    }

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
      customer: { select: { id: true, name: true, phone: true } },
      membership: true,
      transaction: true,
    },
  });

  return full
    ? {
        ...serializeSessionRecord(full),
        membership: full.membership
          ? {
              ...full.membership,
              price: Number(full.membership.price),
            }
          : null,
      }
    : null;
}

export async function getActiveSessions() {
  await reconcileExpiredSessions();

  const sessions = await prisma.session.findMany({
    where: { status: "ACTIVE" },
    include: {
      device: true,
      staff: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, phone: true } },
      membership: true,
      transaction: true,
    },
    orderBy: { startTime: "asc" },
  });
  return sessions.map((session) => ({
    ...serializeSessionRecord(session),
    membership: session.membership
      ? { ...session.membership, price: Number(session.membership.price) }
      : null,
  }));
}

export async function getSessionById(id: string) {
  await reconcileExpiredSessions();

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      device: true,
      staff: { select: { id: true, name: true, role: true } },
      customer: { select: { id: true, name: true, phone: true } },
      membership: true,
      transaction: true,
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return {
    ...serializeSessionRecord(session),
    membership: session.membership
      ? { ...session.membership, price: Number(session.membership.price) }
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
  await reconcileExpiredSessions();

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
        customer: { select: { id: true, name: true, phone: true } },
        membership: true,
        transaction: true,
      },
      orderBy: { startTime: "desc" },
      skip,
      take: limit,
    }),
    prisma.session.count({ where }),
  ]);

  return {
    sessions: sessions.map((session) => ({
      ...serializeSessionRecord(session),
      membership: session.membership
        ? { ...session.membership, price: Number(session.membership.price) }
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
  return reconcileExpiredSessions();
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
