import {
  Activity,
  Clock3,
  CreditCard,
  DollarSign,
  MonitorPlay,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi, type DashboardStats } from "../api/dashboard";
import type { Session } from "../api/sessions";
import { sessionApi } from "../api/sessions";
import { Card } from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import { StatCard } from "../components/ui/StatCard";
import { useSocket } from "../context/SocketContext";
import { formatBDT, formatMs, remainingMsFromEndTime } from "../utils/format";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { connectionMode, timers, on, off } = useSocket();

  const load = async () => {
    try {
      const [s, a] = await Promise.all([
        dashboardApi.stats(),
        sessionApi.active(),
      ]);
      setStats(s);
      setActiveSessions(a);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const handler = () => void load();
    on("devicesUpdated", handler);
    on("sessionEnded", handler);
    return () => {
      off("devicesUpdated", handler);
      off("sessionEnded", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSessions.length === 0) return;

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSessions.length]);

  useEffect(() => {
    if (connectionMode === "realtime") return;

    const intervalId = window.setInterval(() => {
      void load();
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [connectionMode]);

  if (loading) return <PageSpinner />;

  if (!stats)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-slate-500">
        <p className="text-lg font-semibold">Could not connect to server</p>
        <button
          className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition"
          onClick={() => {
            setLoading(true);
            void load();
          }}
        >
          Retry
        </button>
      </div>
    );

  const deviceChartData = [
    { name: "Available", value: stats.devices.available, fill: "#22c55e" },
    { name: "Running", value: stats.devices.running, fill: "#7c3aed" },
    { name: "Maintenance", value: stats.devices.maintenance, fill: "#eab308" },
    { name: "Disabled", value: stats.devices.disabled, fill: "#52525b" },
  ];

  const paymentColors = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#f97316"];
  const paymentChartData = stats.paymentMethods.filter(
    (item) => item.amount > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Real-time overview of your gaming zone
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<DollarSign size={22} />}
          label="Today Revenue"
          value={formatBDT(stats.revenue.today)}
          color="green"
          glow
          sub={`Avg sale ${formatBDT(stats.revenue.avgSaleToday)}`}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Weekly Revenue"
          value={formatBDT(stats.revenue.week)}
          color="purple"
          glow
        />
        <StatCard
          icon={<Activity size={22} />}
          label="Monthly Revenue"
          value={formatBDT(stats.revenue.month)}
          color="cyan"
          glow
        />
        <StatCard
          icon={<Zap size={22} />}
          label="Yearly Revenue"
          value={formatBDT(stats.revenue.year)}
          color="yellow"
          glow
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Activity size={22} />}
          label="Active Sessions"
          value={stats.sessions.active}
          color="green"
          sub={`${stats.sessions.completedToday} completed today`}
        />
        <StatCard
          icon={<Clock3 size={22} />}
          label="Hours Sold Today"
          value={stats.sessions.hoursToday}
          color="cyan"
          sub={`Avg duration ${stats.sessions.avgDurationToday} min`}
        />
        <StatCard
          icon={<MonitorPlay size={22} />}
          label="Device Occupancy"
          value={`${stats.devices.occupancyPct}%`}
          color="yellow"
          sub={`${stats.devices.running}/${stats.devices.total} devices running`}
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Checked In Today"
          value={stats.customers.checkedInToday}
          color="purple"
          sub={`${stats.customers.newThisMonth} new customers this month`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={22} />}
          label="Total Customers"
          value={stats.customers.total}
          color="purple"
        />
        <StatCard
          icon={<UserPlus size={22} />}
          label="New Customers"
          value={stats.customers.newThisMonth}
          color="cyan"
          sub="This month"
        />
        <StatCard
          icon={<Zap size={22} />}
          label="Active Memberships"
          value={stats.memberships.active}
          color="green"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Memberships Sold"
          value={stats.memberships.soldThisMonth}
          color="yellow"
          sub="This month"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Revenue Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={stats.trends.last7Days}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e1e30"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${v}`}
              />
              <YAxis
                yAxisId="sessions"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.08)" }}
                contentStyle={{
                  background: "#13131f",
                  border: "1px solid #1e1e30",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  name === "Revenue" ? formatBDT(value) : value,
                  name,
                ]}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              <Line
                yAxisId="sessions"
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Payments Today
          </h3>
          {paymentChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    dataKey="amount"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={paymentColors[index % paymentColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#13131f",
                      border: "1px solid #1e1e30",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatBDT(value), "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {paymentChartData.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-start justify-between gap-2 rounded-lg border border-[#1e1e30] bg-[#0f0f18] px-3 py-2 text-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            paymentColors[index % paymentColors.length],
                        }}
                      />
                      {item.label}
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-medium text-white">
                        {formatBDT(item.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.count} payments
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-slate-500">
              No payment data yet for today.
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Device Status
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deviceChartData} barSize={28} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e1e30"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#13131f",
                  border: "1px solid #1e1e30",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {deviceChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Staff Leaderboard Today
          </h3>
          <div className="space-y-3">
            {stats.staffLeaderboard.length > 0 ? (
              stats.staffLeaderboard.map((staff, index) => (
                <div
                  key={staff.staffId}
                  className="rounded-xl border border-[#1e1e30] bg-[#0f0f18] p-4"
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {index + 1}. {staff.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {staff.sessions} sessions handled today
                      </div>
                    </div>
                    <div className="text-left text-sm sm:text-right">
                      <div className="font-semibold text-green-400">
                        {formatBDT(staff.revenue)}
                      </div>
                      <div className="text-xs text-slate-500">Revenue</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
                No staff activity recorded today.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Top Devices Today
          </h3>
          <div className="space-y-3">
            {stats.topDevices.length > 0 ? (
              stats.topDevices.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#1e1e30] bg-[#0f0f18] px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {device.name}
                    </div>
                    <div className="text-xs text-slate-500">{device.type}</div>
                  </div>
                  <div className="text-left text-sm sm:text-right">
                    <div className="font-semibold text-green-400">
                      {formatBDT(device.revenue)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {device.sessions} sessions
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
                No device usage recorded today.
              </div>
            )}
          </div>
        </Card>

        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            System Snapshot
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#1e1e30] bg-[#0f0f18] p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Available Devices
              </div>
              <div className="mt-2 text-2xl font-display font-bold text-white">
                {stats.devices.available}
              </div>
            </div>
            <div className="rounded-xl border border-[#1e1e30] bg-[#0f0f18] p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Running Devices
              </div>
              <div className="mt-2 text-2xl font-display font-bold text-white">
                {stats.devices.running}
              </div>
            </div>
            <div className="rounded-xl border border-[#1e1e30] bg-[#0f0f18] p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Maintenance Queue
              </div>
              <div className="mt-2 text-2xl font-display font-bold text-white">
                {stats.devices.maintenance}
              </div>
            </div>
            <div className="rounded-xl border border-[#1e1e30] bg-[#0f0f18] p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Disabled Devices
              </div>
              <div className="mt-2 text-2xl font-display font-bold text-white">
                {stats.devices.disabled}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Live Sessions ({activeSessions.length})
        </h3>
        {activeSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e30] text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4">Device</th>
                  <th className="pb-3 pr-4">Staff</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a28]">
                {activeSessions.map((s) => {
                  const timer = timers[s.deviceId] ?? {
                    remainingMs: remainingMsFromEndTime(s.endTime, nowMs),
                  };
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 pr-4 font-medium text-slate-200">
                        <div>{s.device.name}</div>
                        <div className="text-xs text-slate-500">
                          {s.device.type}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {s.staff.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {s.durationMinutes} min
                      </td>
                      <td className="py-3 pr-4 font-medium text-green-400">
                        {formatBDT(s.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className="font-mono font-medium text-violet-400">
                          {formatMs(timer.remainingMs)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            No active sessions right now.
          </div>
        )}
      </Card>
    </div>
  );
}
