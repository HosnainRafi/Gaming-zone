import { prisma } from "../prisma/client";

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

export async function getDashboardStats() {
  const now = new Date();

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

  const [today, week, month, year, activeSessions, deviceStats] =
    await Promise.all([
      revenue(startOfDay(now)),
      revenue(startOfWeek(now)),
      revenue(startOfMonth(now)),
      revenue(startOfYear(now)),
      prisma.session.count({ where: { status: "ACTIVE" } }),
      prisma.device.groupBy({ by: ["status"], _count: { id: true } }),
    ]);

  const byStatus = Object.fromEntries(
    deviceStats.map((d) => [d.status, d._count.id]),
  );

  return {
    revenue: { today, week, month, year },
    sessions: { active: activeSessions },
    devices: {
      total: Object.values(byStatus).reduce((s, v) => s + v, 0),
      available: byStatus["AVAILABLE"] ?? 0,
      running: byStatus["RUNNING"] ?? 0,
      maintenance: byStatus["MAINTENANCE"] ?? 0,
      disabled: byStatus["DISABLED"] ?? 0,
    },
  };
}
