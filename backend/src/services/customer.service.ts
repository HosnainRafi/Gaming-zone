import type { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export function normalizePhone(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 10 || normalized.length > 15) {
    throw new AppError("Phone number must be between 10 and 15 digits", 400);
  }
  return normalized;
}

export async function upsertCustomerProfile(name: string, phone: string) {
  const normalizedPhone = normalizePhone(phone);
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError("Customer name is required", 400);
  }

  const existing = await prisma.customer.findUnique({
    where: { phone: normalizedPhone },
  });

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: { name: trimmedName },
    });
  }

  return prisma.customer.create({
    data: {
      name: trimmedName,
      phone: normalizedPhone,
    },
  });
}

export async function findCustomerMembershipSnapshot(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  await prisma.membership.updateMany({
    where: { expiresAt: { lt: new Date() }, isActive: true },
    data: { isActive: false },
  });

  const customer = await prisma.customer.findUnique({
    where: { phone: normalizedPhone },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) return null;

  const activeMembership = customer.memberships.find(
    (membership) => membership.isActive && membership.expiresAt > new Date(),
  );

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    hasClaimedFirstFree: customer.hasClaimedFirstFree,
    activeMembership: activeMembership
      ? {
          ...activeMembership,
          planName: activeMembership.planName ?? activeMembership.planType,
          price: Number(activeMembership.price),
          remainingHours: Number(
            (activeMembership.remainingMinutes / 60).toFixed(2),
          ),
        }
      : null,
    memberships: customer.memberships.map((membership) => ({
      ...membership,
      planName: membership.planName ?? membership.planType,
      price: Number(membership.price),
      remainingHours: Number((membership.remainingMinutes / 60).toFixed(2)),
    })),
  };
}

export async function searchCustomers(query?: string) {
  const where: Prisma.CustomerWhereInput | undefined = query?.trim()
    ? {
        OR: [
          { name: { contains: query.trim(), mode: "insensitive" as const } },
          {
            phone: {
              contains: query.trim().replace(/\D/g, ""),
            },
          },
        ],
      }
    : undefined;

  const customers = await prisma.customer.findMany({
    ...(where ? { where } : {}),
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });

  return customers.map((customer) => {
    const latestMembership = customer.memberships[0] ?? null;

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      hasClaimedFirstFree: customer.hasClaimedFirstFree,
      latestMembership: latestMembership
        ? {
            ...latestMembership,
            planName: latestMembership.planName ?? latestMembership.planType,
            price: Number(latestMembership.price),
            remainingHours: Number(
              (latestMembership.remainingMinutes / 60).toFixed(2),
            ),
          }
        : null,
    };
  });
}
