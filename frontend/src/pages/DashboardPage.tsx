import {
  Activity,
  DollarSign,
  MonitorPlay,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi, type DashboardStats } from "../api/dashboard";
import type { Session } from "../api/sessions";
import { sessionApi } from "../api/sessions";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import { StatCard } from "../components/ui/StatCard";
import { useSocket } from "../context/SocketContext";
import { formatBDT, formatMs } from "../utils/format";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { timers, on, off } = useSocket();

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

  const revenueChartData = [
    { period: "Today", amount: stats.revenue.today },
    { period: "This Week", amount: stats.revenue.week },
    { period: "This Month", amount: stats.revenue.month },
    { period: "This Year", amount: stats.revenue.year },
  ];

  const deviceChartData = [
    { name: "Available", value: stats.devices.available, fill: "#22c55e" },
    { name: "Running", value: stats.devices.running, fill: "#7c3aed" },
    { name: "Maintenance", value: stats.devices.maintenance, fill: "#eab308" },
    { name: "Disabled", value: stats.devices.disabled, fill: "#52525b" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Real-time overview of your gaming zone
        </p>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign size={22} />}
          label="Today Revenue"
          value={formatBDT(stats.revenue.today)}
          color="green"
          glow
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

      {/* Device stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<MonitorPlay size={22} />}
          label="Total Devices"
          value={stats.devices.total}
          color="purple"
        />
        <StatCard
          icon={<MonitorPlay size={22} />}
          label="Available"
          value={stats.devices.available}
          color="green"
        />
        <StatCard
          icon={<MonitorPlay size={22} />}
          label="Running"
          value={stats.devices.running}
          color="cyan"
        />
        <StatCard
          icon={<Activity size={22} />}
          label="Active Sessions"
          value={stats.sessions.active}
          color="yellow"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2" glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChartData} barSize={36}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e1e30"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${v}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.08)" }}
                contentStyle={{
                  background: "#13131f",
                  border: "1px solid #1e1e30",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatBDT(v), "Revenue"]}
              />
              <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Device status chart */}
        <Card glow>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Device Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deviceChartData} barSize={30} layout="vertical">
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
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
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
                  <rect key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Active sessions table */}
      {activeSessions.length > 0 && (
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Active Sessions ({activeSessions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                  const timer = timers[s.deviceId];
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
                        {timer ? (
                          <span className="font-mono font-medium text-violet-400">
                            {formatMs(timer.remainingMs)}
                          </span>
                        ) : (
                          <Badge status="ACTIVE" label="active" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
