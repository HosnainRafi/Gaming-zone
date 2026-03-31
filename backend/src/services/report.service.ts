import { prisma } from "../prisma/client";

export async function getSalesReport(from: Date, to: Date) {
  const [transactions, membershipSales] = await Promise.all([
    prisma.transaction.findMany({
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
    }),
    prisma.membershipSale.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        customer: { select: { name: true, phone: true } },
        staff: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const sessionRows = transactions.map((t) => ({
    id: t.id,
    type: "SESSION" as const,
    label: t.session.device.name,
    secondary: t.session.device.type,
    customerName: t.session.customerName,
    staffName: t.session.staff.name,
    amount: Number(t.amount),
    discount: Number(t.discount),
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt,
  }));

  const membershipRows = membershipSales.map((sale) => ({
    id: sale.id,
    type: "MEMBERSHIP" as const,
    label: sale.planName,
    secondary: "Membership sale",
    customerName: sale.customer.name,
    staffName: sale.staff.name,
    amount: Number(sale.amount),
    discount: 0,
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt,
  }));

  const allSales = [...sessionRows, ...membershipRows].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const total = allSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalDiscount = allSales.reduce((sum, sale) => sum + sale.discount, 0);

  return {
    transactions: allSales,
    total,
    totalDiscount,
    count: allSales.length,
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
  const [sessions, membershipSales] = await Promise.all([
    prisma.session.findMany({
      where: { startTime: { gte: from, lte: to } },
      include: {
        staff: { select: { id: true, name: true } },
        transaction: true,
      },
    }),
    prisma.membershipSale.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        staff: { select: { id: true, name: true } },
      },
    }),
  ]);

  const map = new Map<
    string,
    { name: string; sessions: number; memberships: number; revenue: number }
  >();
  for (const s of sessions) {
    const prev = map.get(s.staffId) ?? {
      name: s.staff.name ?? "Unknown",
      sessions: 0,
      memberships: 0,
      revenue: 0,
    };
    prev.sessions += 1;
    prev.revenue += s.transaction ? Number(s.transaction.amount) : 0;
    map.set(s.staffId, prev);
  }

  for (const sale of membershipSales) {
    const prev = map.get(sale.staffId) ?? {
      name: sale.staff.name ?? "Unknown",
      sessions: 0,
      memberships: 0,
      revenue: 0,
    };
    prev.memberships += 1;
    prev.revenue += Number(sale.amount);
    map.set(sale.staffId, prev);
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
