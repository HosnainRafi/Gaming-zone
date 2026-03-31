import { format, subDays } from "date-fns";
import { BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { reportApi } from "../api/reports";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { StatCard } from "../components/ui/StatCard";
import { formatBDT } from "../utils/format";

type Tab = "sales" | "sessions" | "staff" | "devices";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [from, setFrom] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const fromISO = new Date(from).toISOString();
      const toISO = new Date(to + "T23:59:59").toISOString();
      let res;
      if (tab === "sales") res = await reportApi.sales(fromISO, toISO);
      else if (tab === "sessions")
        res = await reportApi.sessions({ from: fromISO, to: toISO });
      else if (tab === "staff") res = await reportApi.staff(fromISO, toISO);
      else res = await reportApi.devices(fromISO, toISO);
      setData(res);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "sales", label: "Sales" },
    { id: "sessions", label: "Sessions" },
    { id: "staff", label: "Staff" },
    { id: "devices", label: "Devices" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Reports
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Analytics &amp; insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#1e1e30] bg-[#0f0f1a] p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setData(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Button onClick={load} loading={loading} size="md">
            <BarChart3 size={14} />
            Generate
          </Button>
        </div>
      </Card>

      {/* Report content */}
      {!data ? (
        <div className="flex h-48 items-center justify-center text-slate-600 text-sm">
          {loading ? "Loading…" : "Select a date range and click Generate."}
        </div>
      ) : tab === "sales" ? (
        <SalesReport data={data as SalesData} />
      ) : tab === "staff" ? (
        <StaffReport data={data as StaffEntry[]} />
      ) : tab === "devices" ? (
        <DeviceReport data={data as DeviceEntry[]} />
      ) : (
        <SessionsReport data={data as SessionEntry[]} />
      )}
    </div>
  );
}

// --- Sub-reports ---

interface SalesData {
  total: number;
  totalDiscount: number;
  count: number;
  transactions: {
    id: string;
    amount: number;
    discount: number;
    paymentMethod: string;
    createdAt: string;
    session: { device: { name: string; type: string } };
  }[];
}

function SalesReport({ data }: { data: SalesData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Download size={20} />}
          label="Total Revenue"
          value={formatBDT(data.total)}
          color="green"
          glow
        />
        <StatCard
          icon={<Download size={20} />}
          label="Total Discount"
          value={formatBDT(data.totalDiscount)}
          color="yellow"
        />
        <StatCard
          icon={<Download size={20} />}
          label="Transactions"
          value={data.count}
          color="purple"
        />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e30] text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="pb-3 pr-4">Device</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Discount</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a28]">
              {data.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-2.5 pr-4 text-slate-200">
                    {t.session.device.name}
                  </td>
                  <td className="py-2.5 pr-4 text-green-400 font-medium">
                    {formatBDT(t.amount)}
                  </td>
                  <td className="py-2.5 pr-4 text-yellow-400">
                    {formatBDT(t.discount)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400 capitalize">
                    {t.paymentMethod.toLowerCase().replace("_", " ")}
                  </td>
                  <td className="py-2.5 text-slate-500 text-xs font-mono">
                    {format(new Date(t.createdAt), "dd MMM yy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface StaffEntry {
  staffId: string;
  name: string;
  sessions: number;
  revenue: number;
}
function StaffReport({ data }: { data: StaffEntry[] }) {
  return (
    <Card>
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
        Staff Performance
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e1e30"
            vertical={false}
          />
          <XAxis
            dataKey="name"
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
            contentStyle={{
              background: "#13131f",
              border: "1px solid #1e1e30",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [formatBDT(v), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e30] text-xs uppercase tracking-widest text-slate-500 text-left">
              <th className="pb-3 pr-4">Staff</th>
              <th className="pb-3 pr-4">Sessions</th>
              <th className="pb-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a28]">
            {data.map((d) => (
              <tr key={d.staffId} className="hover:bg-white/[0.02] transition">
                <td className="py-2.5 pr-4 text-slate-200">{d.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">{d.sessions}</td>
                <td className="py-2.5 text-green-400 font-medium">
                  {formatBDT(d.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface DeviceEntry {
  deviceId: string;
  name: string;
  type: string;
  sessions: number;
  totalMinutes: number;
  revenue: number;
}
function DeviceReport({ data }: { data: DeviceEntry[] }) {
  return (
    <Card>
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
        Device Usage
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={36}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e1e30"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#13131f",
              border: "1px solid #1e1e30",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="sessions"
            fill="#06b6d4"
            radius={[6, 6, 0, 0]}
            name="Sessions"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e30] text-xs uppercase tracking-widest text-slate-500 text-left">
              <th className="pb-3 pr-4">Device</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Sessions</th>
              <th className="pb-3 pr-4">Total Time</th>
              <th className="pb-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a28]">
            {data.map((d) => (
              <tr key={d.deviceId} className="hover:bg-white/[0.02] transition">
                <td className="py-2.5 pr-4 text-slate-200">{d.name}</td>
                <td className="py-2.5 pr-4 text-slate-500">{d.type}</td>
                <td className="py-2.5 pr-4 text-slate-400">{d.sessions}</td>
                <td className="py-2.5 pr-4 text-slate-400">
                  {d.totalMinutes} min
                </td>
                <td className="py-2.5 text-green-400 font-medium">
                  {formatBDT(d.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface SessionEntry {
  id: string;
  startTime: string;
  durationMinutes: number;
  totalAmount: number;
  status: string;
  device: { name: string };
  staff: { name: string | null };
}
function SessionsReport({ data }: { data: SessionEntry[] }) {
  return (
    <Card>
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
        Sessions ({data.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e30] text-xs uppercase tracking-widest text-slate-500 text-left">
              <th className="pb-3 pr-4">Device</th>
              <th className="pb-3 pr-4">Staff</th>
              <th className="pb-3 pr-4">Start</th>
              <th className="pb-3 pr-4">Duration</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a28]">
            {data.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition">
                <td className="py-2.5 pr-4 text-slate-200">{s.device.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">
                  {s.staff.name ?? "—"}
                </td>
                <td className="py-2.5 pr-4 text-xs text-slate-500 font-mono">
                  {format(new Date(s.startTime), "dd MMM yy HH:mm")}
                </td>
                <td className="py-2.5 pr-4 text-slate-400">
                  {s.durationMinutes} min
                </td>
                <td className="py-2.5 pr-4 text-green-400 font-medium">
                  {formatBDT(s.totalAmount)}
                </td>
                <td className="py-2.5 capitalize text-xs text-slate-500">
                  {s.status.toLowerCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
