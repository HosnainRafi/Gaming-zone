import { format, subDays } from "date-fns";
import { BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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

const chartColors = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#f97316"];

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    value,
  );
}

function csvCell(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
) {
  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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

  const applyPreset = (days: number) => {
    setFrom(format(subDays(new Date(), days - 1), "yyyy-MM-dd"));
    setTo(format(new Date(), "yyyy-MM-dd"));
  };

  const setThisMonth = () => {
    setFrom(
      format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        "yyyy-MM-dd",
      ),
    );
    setTo(format(new Date(), "yyyy-MM-dd"));
  };

  const handleExport = () => {
    if (!data) return;

    if (tab === "sales") {
      const sales = data as SalesData;
      downloadCsv(
        `sales-report-${from}-to-${to}.csv`,
        [
          "Type",
          "Label",
          "Secondary",
          "Customer",
          "Staff",
          "Amount",
          "Discount",
          "Payment",
          "Created At",
        ],
        sales.transactions.map((transaction) => [
          transaction.type,
          transaction.label,
          transaction.secondary,
          transaction.customerName,
          transaction.staffName,
          transaction.amount,
          transaction.discount,
          transaction.paymentMethod,
          transaction.createdAt,
        ]),
      );
      return;
    }

    if (tab === "staff") {
      const rows = (data as StaffEntry[]).map((entry) => [
        entry.name,
        entry.sessions,
        entry.memberships,
        entry.revenue,
      ]);
      downloadCsv(
        `staff-report-${from}-to-${to}.csv`,
        ["Staff", "Sessions", "Memberships", "Revenue"],
        rows,
      );
      return;
    }

    if (tab === "devices") {
      const rows = (data as DeviceEntry[]).map((entry) => [
        entry.name,
        entry.type,
        entry.sessions,
        entry.totalMinutes,
        entry.revenue,
      ]);
      downloadCsv(
        `device-report-${from}-to-${to}.csv`,
        ["Device", "Type", "Sessions", "Total Minutes", "Revenue"],
        rows,
      );
      return;
    }

    const rows = (data as SessionEntry[]).map((entry) => [
      entry.device.name,
      entry.staff.name,
      entry.startTime,
      entry.durationMinutes,
      entry.totalAmount,
      entry.status,
    ]);
    downloadCsv(
      `sessions-report-${from}-to-${to}.csv`,
      ["Device", "Staff", "Start Time", "Duration Minutes", "Amount", "Status"],
      rows,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Reports
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Analytics &amp; insights
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!data}
          className="w-full sm:w-auto"
        >
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 rounded-xl border border-gz-border bg-gz-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setData(null);
              }}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 pb-4">
          <Button variant="ghost" size="sm" onClick={() => applyPreset(1)}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => applyPreset(7)}>
            Last 7 Days
          </Button>
          <Button variant="ghost" size="sm" onClick={() => applyPreset(30)}>
            Last 30 Days
          </Button>
          <Button variant="ghost" size="sm" onClick={setThisMonth}>
            This Month
          </Button>
        </div>
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
    type: "SESSION" | "MEMBERSHIP";
    label: string;
    secondary: string;
    customerName: string | null;
    staffName: string | null;
    amount: number;
    discount: number;
    paymentMethod: string;
    createdAt: string;
  }[];
}

function SalesReport({ data }: { data: SalesData }) {
  const averageTicket = data.count > 0 ? data.total / data.count : 0;
  const paymentMap = new Map<
    string,
    { label: string; amount: number; count: number }
  >();
  const sourceMap = new Map<
    string,
    { label: string; amount: number; count: number }
  >();
  const dailyMap = new Map<
    string,
    { label: string; revenue: number; transactions: number }
  >();

  for (const transaction of data.transactions) {
    const paymentKey = transaction.paymentMethod;
    const payment = paymentMap.get(paymentKey) ?? {
      label: titleCase(paymentKey),
      amount: 0,
      count: 0,
    };
    payment.amount += transaction.amount;
    payment.count += 1;
    paymentMap.set(paymentKey, payment);

    const sourceKey = transaction.type;
    const source = sourceMap.get(sourceKey) ?? {
      label: titleCase(sourceKey),
      amount: 0,
      count: 0,
    };
    source.amount += transaction.amount;
    source.count += 1;
    sourceMap.set(sourceKey, source);

    const dayKey = format(new Date(transaction.createdAt), "yyyy-MM-dd");
    const daily = dailyMap.get(dayKey) ?? {
      label: format(new Date(transaction.createdAt), "dd MMM"),
      revenue: 0,
      transactions: 0,
    };
    daily.revenue += transaction.amount;
    daily.transactions += 1;
    dailyMap.set(dayKey, daily);
  }

  const paymentData = Array.from(paymentMap.values()).sort(
    (a, b) => b.amount - a.amount,
  );
  const sourceData = Array.from(sourceMap.values()).sort(
    (a, b) => b.amount - a.amount,
  );
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Download size={20} />}
          label="Total Revenue"
          value={formatBDT(data.total)}
          color="green"
          glow
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Average Ticket"
          value={formatBDT(averageTicket)}
          color="cyan"
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
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
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip
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
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="transactions"
                name="Transactions"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Payment Mix
          </h3>
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="amount"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
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
                {paymentData.map((entry, index) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between rounded-lg border border-[#1a1a28] bg-[#0f0f18] px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                      />
                      {entry.label}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">
                        {formatBDT(entry.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {entry.count} payments
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-65 items-center justify-center text-sm text-slate-500">
              No payment data in this range.
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Revenue Sources
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sourceData.map((source) => (
            <div
              key={source.label}
              className="rounded-xl border border-[#1a1a28] bg-[#0f0f18] p-4"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {source.label}
              </div>
              <div className="mt-2 text-xl font-display font-bold text-white">
                {formatBDT(source.amount)}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {source.count} transactions
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="border-b border-gz-border text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Staff</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Discount</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a28]">
              {data.transactions.map((t) => (
                <tr key={t.id} className="transition hover:bg-white/2">
                  <td className="py-2.5 pr-4 text-slate-200">
                    <div>{t.label}</div>
                    <div className="text-[11px] text-slate-500">
                      {t.type === "MEMBERSHIP" ? t.secondary : t.secondary}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400">
                    {t.customerName ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400">
                    {t.staffName ?? "—"}
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
  memberships: number;
  revenue: number;
}
function StaffReport({ data }: { data: StaffEntry[] }) {
  const totals = data.reduce(
    (acc, entry) => {
      acc.sessions += entry.sessions;
      acc.memberships += entry.memberships;
      acc.revenue += entry.revenue;
      return acc;
    },
    { sessions: 0, memberships: 0, revenue: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Download size={20} />}
          label="Team Revenue"
          value={formatBDT(totals.revenue)}
          color="green"
          glow
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Sessions Handled"
          value={totals.sessions}
          color="cyan"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Membership Sales"
          value={totals.memberships}
          color="purple"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Avg Revenue / Staff"
          value={formatBDT(data.length > 0 ? totals.revenue / data.length : 0)}
          color="yellow"
        />
      </div>

      <Card>
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Staff Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={28}>
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
              yAxisId="revenue"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `৳${value}`}
            />
            <YAxis
              yAxisId="activity"
              orientation="right"
              allowDecimals={false}
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
              formatter={(value: number, name: string) => [
                name === "Revenue" ? formatBDT(value) : value,
                name,
              ]}
            />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              name="Revenue"
              fill="#7c3aed"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              yAxisId="activity"
              dataKey="sessions"
              name="Sessions"
              fill="#06b6d4"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              yAxisId="activity"
              dataKey="memberships"
              name="Memberships"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[560px] w-full text-sm">
            <thead>
              <tr className="border-b border-gz-border text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="pb-3 pr-4">Staff</th>
                <th className="pb-3 pr-4">Sessions</th>
                <th className="pb-3 pr-4">Memberships</th>
                <th className="pb-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a28]">
              {data.map((d) => (
                <tr key={d.staffId} className="transition hover:bg-white/2">
                  <td className="py-2.5 pr-4 text-slate-200">{d.name}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{d.sessions}</td>
                  <td className="py-2.5 pr-4 text-slate-400">
                    {d.memberships}
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
    </div>
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
  const totals = data.reduce(
    (acc, entry) => {
      acc.sessions += entry.sessions;
      acc.totalMinutes += entry.totalMinutes;
      acc.revenue += entry.revenue;
      return acc;
    },
    { sessions: 0, totalMinutes: 0, revenue: 0 },
  );
  const typeMap = new Map<string, { label: string; value: number }>();
  for (const entry of data) {
    const prev = typeMap.get(entry.type) ?? { label: entry.type, value: 0 };
    prev.value += entry.sessions;
    typeMap.set(entry.type, prev);
  }
  const typeData = Array.from(typeMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Download size={20} />}
          label="Device Revenue"
          value={formatBDT(totals.revenue)}
          color="green"
          glow
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Sessions"
          value={totals.sessions}
          color="cyan"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Hours Played"
          value={formatNumber(totals.totalMinutes / 60)}
          color="purple"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Top Device"
          value={data[0]?.name ?? "—"}
          color="yellow"
          sub={data[0] ? formatBDT(data[0].revenue) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Device Usage
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barSize={28}>
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
                formatter={(value: number, name: string) => [
                  name === "Revenue" ? formatBDT(value) : value,
                  name,
                ]}
              />
              <Bar
                dataKey="sessions"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                name="Sessions"
              />
              <Bar
                dataKey="revenue"
                fill="#7c3aed"
                radius={[6, 6, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Usage by Type
          </h3>
          {typeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {typeData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
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
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {typeData.map((entry, index) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between rounded-lg border border-[#1a1a28] bg-[#0f0f18] px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                      />
                      {entry.label}
                    </div>
                    <div className="font-medium text-white">
                      {entry.value} sessions
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-65 items-center justify-center text-sm text-slate-500">
              No device usage in this range.
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="mt-0 overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-gz-border text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="pb-3 pr-4">Device</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Sessions</th>
                <th className="pb-3 pr-4">Total Time</th>
                <th className="pb-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a28]">
              {data.map((d) => (
                <tr key={d.deviceId} className="transition hover:bg-white/2">
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
    </div>
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
  const totals = data.reduce(
    (acc, entry) => {
      acc.totalAmount += entry.totalAmount;
      acc.totalMinutes += entry.durationMinutes;
      acc.statusCounts.set(
        entry.status,
        (acc.statusCounts.get(entry.status) ?? 0) + 1,
      );
      acc.deviceCounts.set(
        entry.device.name,
        (acc.deviceCounts.get(entry.device.name) ?? 0) + 1,
      );
      return acc;
    },
    {
      totalAmount: 0,
      totalMinutes: 0,
      statusCounts: new Map<string, number>(),
      deviceCounts: new Map<string, number>(),
    },
  );
  const statusData = Array.from(totals.statusCounts.entries()).map(
    ([label, value]) => ({
      label: titleCase(label),
      value,
    }),
  );
  const deviceData = Array.from(totals.deviceCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Download size={20} />}
          label="Sessions"
          value={data.length}
          color="green"
          glow
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Revenue"
          value={formatBDT(totals.totalAmount)}
          color="purple"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Hours Played"
          value={formatNumber(totals.totalMinutes / 60)}
          color="cyan"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Avg Duration"
          value={`${data.length > 0 ? Math.round(totals.totalMinutes / data.length) : 0} min`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Status Mix
          </h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
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
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((entry, index) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between rounded-lg border border-[#1a1a28] bg-[#0f0f18] px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                      />
                      {entry.label}
                    </div>
                    <div className="font-medium text-white">{entry.value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-70 items-center justify-center text-sm text-slate-500">
              No sessions in this range.
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Most Used Devices
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deviceData} barSize={28}>
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
                allowDecimals={false}
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
                dataKey="value"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                name="Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sessions ({data.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-gz-border text-left text-xs uppercase tracking-widest text-slate-500">
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
                <tr key={s.id} className="transition hover:bg-white/2">
                  <td className="py-2.5 pr-4 text-slate-200">
                    {s.device.name}
                  </td>
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
    </div>
  );
}
