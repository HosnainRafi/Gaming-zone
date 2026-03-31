import type { MembershipPlanType } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { searchCustomers, upsertCustomerProfile } from "./customer.service";

const DEFAULT_MEMBERSHIP_PLANS = [
  {
    name: "Weekly",
    price: 500,
    maxMinutes: 8 * 60,
    durationDays: 7,
    sortOrder: 1,
  },
  {
    name: "Monthly",
    price: 1500,
    maxMinutes: 26 * 60,
    durationDays: 30,
    sortOrder: 2,
  },
];

function serializeMembership<
  T extends { price: unknown; remainingMinutes: number; planName?: unknown },
>(membership: T) {
  return {
    ...membership,
    planName:
      typeof membership.planName === "string" ? membership.planName : null,
    price: Number(membership.price),
    remainingHours: Number((membership.remainingMinutes / 60).toFixed(2)),
  };
}

function serializeMembershipPlan<
  T extends { price: unknown; maxMinutes: number },
>(plan: T) {
  return {
    ...plan,
    price: Number(plan.price),
    maxHours: Number((plan.maxMinutes / 60).toFixed(2)),
  };
}

function getLegacyPlanType(name: string): MembershipPlanType | null {
  const normalizedName = name.trim().toUpperCase();
  if (normalizedName === "WEEKLY") return "WEEKLY";
  if (normalizedName === "MONTHLY") return "MONTHLY";
  return null;
}

export async function ensureDefaultMembershipPlans() {
  await Promise.all(
    DEFAULT_MEMBERSHIP_PLANS.map((plan) =>
      prisma.membershipPlan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan,
      }),
    ),
  );
}

export async function listMembershipPlans() {
  await ensureDefaultMembershipPlans();

  const plans = await prisma.membershipPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return plans.map(serializeMembershipPlan);
}

export async function createMembershipPlan(data: {
  name: string;
  price: number;
  maxMinutes: number;
  durationDays: number;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const plan = await prisma.membershipPlan.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      maxMinutes: data.maxMinutes,
      durationDays: data.durationDays,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return serializeMembershipPlan(plan);
}

export async function updateMembershipPlan(
  id: string,
  data: {
    name?: string;
    price?: number;
    maxMinutes?: number;
    durationDays?: number;
    isActive?: boolean;
    sortOrder?: number;
  },
) {
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) throw new AppError("Membership plan not found", 404);

  const plan = await prisma.membershipPlan.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.maxMinutes !== undefined ? { maxMinutes: data.maxMinutes } : {}),
      ...(data.durationDays !== undefined
        ? { durationDays: data.durationDays }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });

  return serializeMembershipPlan(plan);
}

export async function deleteMembershipPlan(id: string) {
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) throw new AppError("Membership plan not found", 404);
  await prisma.membershipPlan.delete({ where: { id } });
}

export async function purchaseMembership(data: {
  name: string;
  phone: string;
  planId: string;
  staffId: string;
}) {
  await ensureDefaultMembershipPlans();

  const customer = await upsertCustomerProfile(data.name, data.phone);
  const existingActive = await prisma.membership.findFirst({
    where: {
      customerId: customer.id,
      isActive: true,
      expiresAt: { gt: new Date() },
      remainingMinutes: { gt: 0 },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (existingActive) {
    throw new AppError("Customer already has an active membership", 409);
  }

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: data.planId },
  });
  if (!plan || !plan.isActive) {
    throw new AppError("Membership plan not found", 404);
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
  );

  const membership = await prisma.$transaction(async (tx) => {
    const createdMembership = await tx.membership.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        planType: getLegacyPlanType(plan.name),
        planName: plan.name,
        price: plan.price,
        maxMinutes: plan.maxMinutes,
        remainingMinutes: plan.maxMinutes,
        startsAt: now,
        expiresAt,
        isActive: true,
      },
    });

    await tx.membershipSale.create({
      data: {
        membershipId: createdMembership.id,
        customerId: customer.id,
        staffId: data.staffId,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        paymentMethod: "CASH",
      },
    });

    return createdMembership;
  });

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
    },
    membership: serializeMembership(membership),
  };
}

export async function listMembershipCustomers(query?: string) {
  return searchCustomers(query);
}
