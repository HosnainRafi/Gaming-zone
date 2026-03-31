import { prisma } from "../prisma/client";

export async function getSalesReport(from: Date, to: Date) {
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      session: {
        include: {
          device: { select: { name: true, type: true } },
          staff: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
  const totalDiscount = transactions.reduce(
    (s, t) => s + Number(t.discount),
    0,
  );

  return {
    transactions: transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      discount: Number(t.discount),
      session: {
        ...t.session,
        totalAmount: Number(t.session.totalAmount),
      },
    })),
    total,
    totalDiscount,
    count: transactions.length,
  };
}

export async function getSessionsReport(filters: {
  from?: Date;
  to?: Date;
  status?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.status) where["status"] = filters.status;
  if (filters.from ?? filters.to) {
    const startTime: Record<string, Date> = {};
    if (filters.from) startTime["gte"] = filters.from;
    if (filters.to) startTime["lte"] = filters.to;
    where["startTime"] = startTime;
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      device: { select: { name: true, type: true } },
      staff: { select: { name: true } },
      transaction: true,
    },
    orderBy: { startTime: "desc" },
  });

  return sessions.map((s) => ({
    ...s,
    totalAmount: Number(s.totalAmount),
    transaction: s.transaction
      ? {
          ...s.transaction,
          amount: Number(s.transaction.amount),
          discount: Number(s.transaction.discount),
        }
      : null,
  }));
}

export async function getStaffReport(from: Date, to: Date) {
  const sessions = await prisma.session.findMany({
    where: { startTime: { gte: from, lte: to } },
    include: {
      staff: { select: { id: true, name: true } },
      transaction: true,
    },
  });

  const map = new Map<
    string,
    { name: string; sessions: number; revenue: number }
  >();
  for (const s of sessions) {
    const prev = map.get(s.staffId) ?? {
      name: s.staff.name ?? "Unknown",
      sessions: 0,
      revenue: 0,
    };
    prev.sessions += 1;
    prev.revenue += s.transaction ? Number(s.transaction.amount) : 0;
    map.set(s.staffId, prev);
  }

  return Array.from(map.entries()).map(([staffId, d]) => ({ staffId, ...d }));
}

export async function getDeviceUsageReport(from: Date, to: Date) {
  const sessions = await prisma.session.findMany({
    where: { startTime: { gte: from, lte: to }, status: "COMPLETED" },
    include: { device: { select: { id: true, name: true, type: true } } },
  });

  const map = new Map<
    string,
    {
      name: string;
      type: string;
      sessions: number;
      totalMinutes: number;
      revenue: number;
    }
  >();
  for (const s of sessions) {
    const prev = map.get(s.deviceId) ?? {
      name: s.device.name,
      type: s.device.type,
      sessions: 0,
      totalMinutes: 0,
      revenue: 0,
    };
    prev.sessions += 1;
    prev.totalMinutes += s.durationMinutes;
    prev.revenue += Number(s.totalAmount);
    map.set(s.deviceId, prev);
  }

  return Array.from(map.entries()).map(([deviceId, d]) => ({ deviceId, ...d }));
}
