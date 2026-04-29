import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Printer, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  sessionApi,
  type Session,
  type SessionsResponse,
} from "../api/sessions";
import { PrintReceipt } from "../components/PrintReceipt";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { formatBDT } from "../utils/format";

export default function SessionsPage() {
  const [data, setData] = useState<SessionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [receiptSession, setReceiptSession] = useState<Session | null>(null);

  const load = useCallback(async (p: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sessionApi.list({
        page: p,
        limit: 15,
        status: status || undefined,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setPage(1);
    void load(1);
  }, [load, status]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void load(page, true);
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [load, page]);

  const filtered =
    data?.sessions.filter((s) =>
      search
        ? s.device.name.toLowerCase().includes(search.toLowerCase()) ||
          s.staff.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          s.customerPhone?.includes(search)
        : true,
    ) ?? [];

  if (loading && !data) return <PageSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Sessions
          </h1>
          {data && (
            <p className="mt-0.5 text-sm text-slate-500">
              {data.total} total sessions
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Search device / staff"
              placeholder="Filter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-44">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELED", label: "Canceled" },
              ]}
            />
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => void load(page)}
            className="w-full sm:w-auto"
          >
            <Search size={14} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-215 w-full text-sm">
              <thead>
                <tr className="border-b border-gz-border text-left text-[11px] uppercase tracking-widest text-slate-500">
                  <th className="pb-3 pr-4">Device</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Staff</th>
                  <th className="pb-3 pr-4">Start Time</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3 pr-4">Players</th>
                  <th className="pb-3 pr-4">Mode</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3 pr-4">Receipt</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a28]">
                {filtered.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    onPrint={() => setReceiptSession(s)}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-600">
                No sessions found.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Page {data.page} of {data.pages}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              className="flex-1 sm:flex-none"
              onClick={() => {
                setPage(page - 1);
                void load(page - 1);
              }}
            >
              <ChevronLeft size={14} />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              className="flex-1 sm:flex-none"
              onClick={() => {
                setPage(page + 1);
                void load(page + 1);
              }}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {receiptSession && (
        <PrintReceipt
          session={receiptSession}
          onClose={() => setReceiptSession(null)}
        />
      )}
    </div>
  );
}

function SessionRow({
  session: s,
  onPrint,
}: {
  session: Session;
  onPrint: () => void;
}) {
  const pm =
    s.pricingType === "MEMBERSHIP"
      ? "Membership"
      : s.pricingType === "FIRST_TIME_FREE" && !s.transaction
        ? "Free Trial"
        : (s.transaction?.paymentMethod ?? "—");

  const modeLabel =
    s.pricingType === "FIRST_TIME_FREE"
      ? "First free"
      : s.pricingType === "MEMBERSHIP"
        ? (s.membership?.planName ?? s.membership?.planType ?? "Membership")
        : (s.appliedOfferCode ?? "Standard");

  return (
    <tr className="transition hover:bg-white/2">
      <td className="py-3 pr-4">
        <div className="font-medium text-slate-200">{s.device.name}</div>
        <div className="text-[11px] text-slate-500">{s.device.type}</div>
      </td>
      <td className="py-3 pr-4">
        <div className="text-slate-300">{s.customerName ?? "—"}</div>
        <div className="text-[11px] text-slate-500">
          {s.customerPhone ?? "—"}
        </div>
      </td>
      <td className="py-3 pr-4 text-slate-400">{s.staff.name ?? "—"}</td>
      <td className="py-3 pr-4 text-slate-400 text-xs font-mono">
        {format(new Date(s.startTime), "dd MMM yy, HH:mm")}
      </td>
      <td className="py-3 pr-4 text-slate-400">{s.durationMinutes} min</td>
      <td className="py-3 pr-4 text-slate-400">{s.playerCount}</td>
      <td className="py-3 pr-4 text-slate-400">{modeLabel}</td>
      <td className="py-3 pr-4 font-medium text-green-400">
        {formatBDT(s.totalAmount)}
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs rounded-full border border-gz-border bg-gz-surface px-2 py-0.5 text-slate-400 capitalize">
          {pm.toLowerCase().replace("_", " ")}
        </span>
      </td>
      <td className="py-3 pr-4">
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-500/40 hover:text-white"
        >
          <Printer size={14} />
          Print
        </button>
      </td>
      <td className="py-3">
        <Badge status={s.status} />
      </td>
    </tr>
  );
}
