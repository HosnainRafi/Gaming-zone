import { prisma } from "../prisma/client";
import { reconcileExpiredSessions } from "./session.service";

function getDateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() - day + (day === 0 ? -6 : 1)); // ISO Monday
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

function titleCase(input: string) {
  return input
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDashboardStats() {
  await reconcileExpiredSessions();

  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const trendStart = startOfDay(new Date(now));
  trendStart.setDate(trendStart.getDate() - 6);

  const revenue = async (from: Date) => {
    const [sessionRevenue, membershipRevenue] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: from } },
      }),
      prisma.membershipSale.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: from } },
      }),
    ]);

    return (
      Number(sessionRevenue._sum.amount ?? 0) +
      Number(membershipRevenue._sum.amount ?? 0)
    );
  };

  const [
    today,
    week,
    month,
    year,
    activeSessions,
    deviceStats,
    totalCustomers,
    newCustomersThisMonth,
    activeMemberships,
    membershipsSoldThisMonth,
    todaySessions,
    trendSessions,
    trendTransactions,
    trendMembershipSales,
    paymentTransactions,
    paymentMembershipSales,
  ] = await Promise.all([
    revenue(dayStart),
    revenue(weekStart),
    revenue(monthStart),
    revenue(yearStart),
    prisma.session.count({ where: { status: "ACTIVE" } }),
    prisma.device.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.membership.count({
      where: {
        isActive: true,
        expiresAt: { gte: now },
      },
    }),
    prisma.membershipSale.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.session.findMany({
      where: { startTime: { gte: dayStart } },
      select: {
        id: true,
        status: true,
        durationMinutes: true,
        totalAmount: true,
        customerId: true,
        customerPhone: true,
        customerName: true,
        device: { select: { id: true, name: true, type: true } },
        staff: { select: { id: true, name: true } },
      },
    }),
    prisma.session.findMany({
      where: { startTime: { gte: trendStart } },
      select: { startTime: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true, amount: true, paymentMethod: true },
    }),
    prisma.membershipSale.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true, amount: true, paymentMethod: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: dayStart } },
      select: { amount: true, paymentMethod: true },
    }),
    prisma.membershipSale.findMany({
      where: { createdAt: { gte: dayStart } },
      select: { amount: true, paymentMethod: true },
    }),
  ]);

  const byStatus = Object.fromEntries(
    deviceStats.map((d) => [d.status, d._count.id]),
  );
  const totalDevices = Object.values(byStatus).reduce((sum, value) => sum + value, 0);
  const runningDevices = byStatus["RUNNING"] ?? 0;

  const completedToday = todaySessions.filter(
    (session) => session.status === "COMPLETED",
  ).length;
  const todaySessionMinutes = todaySessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const checkedInToday = new Set(
    todaySessions
      .map(
        (session) =>
          session.customerId ?? session.customerPhone ?? session.customerName,
      )
      .filter((value): value is string => Boolean(value)),
  ).size;
  const todaySalesCount = paymentTransactions.length + paymentMembershipSales.length;

  const trendMap = new Map(
    Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(trendStart);
      date.setDate(trendStart.getDate() + offset);
      const key = getDateKey(date);
      return [
        key,
        {
          date: key,
          label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
          revenue: 0,
          sessions: 0,
        },
      ];
    }),
  );

  for (const session of trendSessions) {
    const key = getDateKey(session.startTime);
    const point = trendMap.get(key);
    if (point) point.sessions += 1;
  }

  for (const sale of [...trendTransactions, ...trendMembershipSales]) {
    const key = getDateKey(sale.createdAt);
    const point = trendMap.get(key);
    if (point) point.revenue += Number(sale.amount);
  }

  const paymentMethodMap = new Map<
    string,
    { label: string; amount: number; count: number }
  >();
  for (const sale of [...paymentTransactions, ...paymentMembershipSales]) {
    const key = sale.paymentMethod;
    const previous = paymentMethodMap.get(key) ?? {
      label: titleCase(key),
      amount: 0,
      count: 0,
    };
    previous.amount += Number(sale.amount);
    previous.count += 1;
    paymentMethodMap.set(key, previous);
  }

  const deviceMap = new Map<
    string,
    { deviceId: string; name: string; type: string; sessions: number; revenue: number }
  >();
  const staffMap = new Map<
    string,
    { staffId: string; name: string; sessions: number; revenue: number }
  >();

  for (const session of todaySessions) {
    const deviceEntry = deviceMap.get(session.device.id) ?? {
      deviceId: session.device.id,
      name: session.device.name,
      type: session.device.type,
      sessions: 0,
      revenue: 0,
    };
    deviceEntry.sessions += 1;
    deviceEntry.revenue += Number(session.totalAmount);
    deviceMap.set(session.device.id, deviceEntry);

    const staffEntry = staffMap.get(session.staff.id) ?? {
      staffId: session.staff.id,
      name: session.staff.name ?? "Unknown Staff",
      sessions: 0,
      revenue: 0,
    };
    staffEntry.sessions += 1;
    staffEntry.revenue += Number(session.totalAmount);
    staffMap.set(session.staff.id, staffEntry);
  }

  return {
    revenue: {
      today,
      week,
      month,
      year,
      avgSaleToday: todaySalesCount > 0 ? today / todaySalesCount : 0,
    },
    sessions: {
      active: activeSessions,
      completedToday,
      hoursToday: Number((todaySessionMinutes / 60).toFixed(1)),
      avgDurationToday:
        todaySessions.length > 0
          ? Math.round(todaySessionMinutes / todaySessions.length)
          : 0,
    },
    devices: {
      total: totalDevices,
      available: byStatus["AVAILABLE"] ?? 0,
      running: runningDevices,
      maintenance: byStatus["MAINTENANCE"] ?? 0,
      disabled: byStatus["DISABLED"] ?? 0,
      occupancyPct:
        totalDevices > 0 ? Math.round((runningDevices / totalDevices) * 100) : 0,
    },
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
      checkedInToday,
    },
    memberships: {
      active: activeMemberships,
      soldThisMonth: membershipsSoldThisMonth,
    },
    trends: {
      last7Days: Array.from(trendMap.values()),
    },
    paymentMethods: Array.from(paymentMethodMap.values()).sort(
      (a, b) => b.amount - a.amount,
    ),
    topDevices: Array.from(deviceMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions)
      .slice(0, 5),
    staffLeaderboard: Array.from(staffMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions)
      .slice(0, 5),
  };
}
