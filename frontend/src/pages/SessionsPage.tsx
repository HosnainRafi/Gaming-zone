import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  sessionApi,
  type Session,
  type SessionsResponse,
} from "../api/sessions";
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

  const load = async (p: number) => {
    setLoading(true);
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
  };

  useEffect(() => {
    setPage(1);
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered =
    data?.sessions.filter((s) =>
      search
        ? s.device.name.toLowerCase().includes(search.toLowerCase()) ||
          s.staff.name?.toLowerCase().includes(search.toLowerCase())
        : true,
    ) ?? [];

  if (loading && !data) return <PageSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <Button variant="outline" size="md" onClick={() => void load(page)}>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e30] text-left text-[11px] uppercase tracking-widest text-slate-500">
                  <th className="pb-3 pr-4">Device</th>
                  <th className="pb-3 pr-4">Staff</th>
                  <th className="pb-3 pr-4">Start Time</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a28]">
                {filtered.map((s) => (
                  <SessionRow key={s.id} session={s} />
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {data.page} of {data.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
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
    </div>
  );
}

function SessionRow({ session: s }: { session: Session }) {
  const pm = s.transaction?.paymentMethod ?? "—";
  return (
    <tr className="hover:bg-white/[0.02] transition">
      <td className="py-3 pr-4">
        <div className="font-medium text-slate-200">{s.device.name}</div>
        <div className="text-[11px] text-slate-500">{s.device.type}</div>
      </td>
      <td className="py-3 pr-4 text-slate-400">{s.staff.name ?? "—"}</td>
      <td className="py-3 pr-4 text-slate-400 text-xs font-mono">
        {format(new Date(s.startTime), "dd MMM yy, HH:mm")}
      </td>
      <td className="py-3 pr-4 text-slate-400">{s.durationMinutes} min</td>
      <td className="py-3 pr-4 font-medium text-green-400">
        {formatBDT(s.totalAmount)}
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs rounded-full border border-[#1e1e30] bg-[#0f0f1a] px-2 py-0.5 text-slate-400 capitalize">
          {pm.toLowerCase().replace("_", " ")}
        </span>
      </td>
      <td className="py-3">
        <Badge status={s.status} />
      </td>
    </tr>
  );
}
